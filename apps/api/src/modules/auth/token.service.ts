import { createHash, randomBytes } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { type RefreshToken } from '@prisma/client';

import { type JwtPayload, type TokenPair } from './auth.types';
import { RefreshTokenRepository } from './refresh-token.repository';

export interface TokenContext {
  userId: string;
  organizationId: string;
  membershipId: string;
  email: string;
}

function toInt(value: unknown, fallback: number): number {
  const n = parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Accepts seconds ("900") or a jsonwebtoken timespan ("15m", "7d", "30s", "2h"); returns seconds. */
function parseTtlSeconds(value: unknown, fallback: number): number {
  const raw = String(value ?? '').trim();
  if (/^\d+$/.test(raw)) return Number(raw);
  const m = raw.match(/^(\d+)\s*([smhd])$/i);
  if (m) {
    const mult: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return Number(m[1]) * (mult[m[2].toLowerCase()] ?? 1);
  }
  return fallback;
}

@Injectable()
export class TokenService {
  private readonly accessTtl: number;
  private readonly refreshTtlMs: number;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly refreshTokens: RefreshTokenRepository,
  ) {
    this.accessTtl = parseTtlSeconds(this.config.get('JWT_ACCESS_TTL'), 900); // seconds (default 15m)
    const refreshDays = toInt(this.config.get('JWT_REFRESH_TTL_DAYS'), 7);
    this.refreshTtlMs = refreshDays * 24 * 60 * 60 * 1000;
  }

  /** Issue a fresh access + refresh pair for a login context and persist the refresh token. */
  async issuePair(
    ctx: TokenContext,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: ctx.userId,
      organizationId: ctx.organizationId,
      membershipId: ctx.membershipId,
      email: ctx.email,
    };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: this.accessTtl });

    const raw = this.generateOpaqueToken();
    await this.refreshTokens.create({
      userId: ctx.userId,
      organizationId: ctx.organizationId,
      tokenHash: this.hashToken(raw),
      expiresAt: new Date(Date.now() + this.refreshTtlMs),
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    return { accessToken, refreshToken: raw, expiresIn: this.accessTtl };
  }

  /**
   * Validate a presented refresh token, returning the stored record. Throws if
   * it is unknown, revoked, or expired. Detects reuse of an already-revoked
   * token (a theft signal) and, in that case, revokes the whole user family.
   */
  async validateRefreshToken(raw: string): Promise<RefreshToken> {
    const record = await this.refreshTokens.findByHash(this.hashToken(raw));
    if (!record) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (record.revokedAt) {
      await this.refreshTokens.revokeAllForUser(record.userId);
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }
    return record;
  }

  /** Rotate: revoke the presented token and issue a new pair in the same org context. */
  async rotate(
    raw: string,
    ctx: TokenContext,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<TokenPair> {
    const current = await this.validateRefreshToken(raw);
    const pair = await this.issuePair(ctx, meta);
    const replacement = await this.refreshTokens.findByHash(this.hashToken(pair.refreshToken));
    await this.refreshTokens.revoke(current.id, replacement?.id);
    return pair;
  }

  async revoke(raw: string): Promise<void> {
    const record = await this.refreshTokens.findByHash(this.hashToken(raw));
    if (record && !record.revokedAt) {
      await this.refreshTokens.revoke(record.id);
    }
  }

  revokeAllForUser(userId: string): Promise<{ count: number }> {
    return this.refreshTokens.revokeAllForUser(userId);
  }

  private generateOpaqueToken(): string {
    return randomBytes(48).toString('base64url');
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
