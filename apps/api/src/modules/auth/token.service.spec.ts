import { UnauthorizedException } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import { type JwtService } from '@nestjs/jwt';
import { type RefreshToken } from '@prisma/client';

import { type RefreshTokenRepository } from './refresh-token.repository';
import { TokenService } from './token.service';

type Repo = jest.Mocked<
  Pick<RefreshTokenRepository, 'create' | 'findByHash' | 'revoke' | 'revokeAllForUser'>
>;

function build(): {
  service: TokenService;
  repo: Repo;
  jwt: jest.Mocked<Pick<JwtService, 'signAsync'>>;
} {
  const jwt = { signAsync: jest.fn().mockResolvedValue('access.jwt') };
  const config = { get: jest.fn((_k: string, d?: unknown) => d) } as unknown as ConfigService;
  const repo: Repo = {
    create: jest
      .fn()
      .mockImplementation((input) => Promise.resolve({ id: 'rt1', ...input } as RefreshToken)),
    findByHash: jest.fn(),
    revoke: jest.fn().mockResolvedValue({} as RefreshToken),
    revokeAllForUser: jest.fn().mockResolvedValue({ count: 3 }),
  };
  const service = new TokenService(
    jwt as unknown as JwtService,
    config,
    repo as unknown as RefreshTokenRepository,
  );
  return { service, repo, jwt };
}

const ctx = { userId: 'u1', organizationId: 'o1', membershipId: 'm1', email: 'u@x.com' };

describe('TokenService', () => {
  it('issues an access token and persists a hashed refresh token', async () => {
    const { service, repo } = build();
    const pair = await service.issuePair(ctx);
    expect(pair.accessToken).toBe('access.jwt');
    expect(pair.refreshToken).toEqual(expect.any(String));
    const stored = repo.create.mock.calls[0][0];
    // the raw token is never stored — only its sha256 hash
    expect(stored.tokenHash).not.toEqual(pair.refreshToken);
    expect(stored.tokenHash).toHaveLength(64);
  });

  it('rejects an unknown refresh token', async () => {
    const { service, repo } = build();
    repo.findByHash.mockResolvedValue(null);
    await expect(service.validateRefreshToken('nope')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('detects reuse of a revoked token and revokes the whole family', async () => {
    const { service, repo } = build();
    repo.findByHash.mockResolvedValue({
      id: 'rt1',
      userId: 'u1',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 10_000),
    } as RefreshToken);
    await expect(service.validateRefreshToken('reused')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(repo.revokeAllForUser).toHaveBeenCalledWith('u1');
  });

  it('rejects an expired refresh token', async () => {
    const { service, repo } = build();
    repo.findByHash.mockResolvedValue({
      id: 'rt1',
      userId: 'u1',
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1),
    } as RefreshToken);
    await expect(service.validateRefreshToken('old')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rotates: revokes the presented token and links the replacement', async () => {
    const { service, repo } = build();
    const valid = {
      id: 'old',
      userId: 'u1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 10_000),
    } as RefreshToken;
    // first lookup (validate) returns the valid record; second (replacement) returns the newly-created one
    repo.findByHash
      .mockResolvedValueOnce(valid)
      .mockResolvedValueOnce({ id: 'new' } as RefreshToken);
    await service.rotate('raw', ctx);
    expect(repo.revoke).toHaveBeenCalledWith('old', 'new');
  });
});
