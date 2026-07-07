import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('produces an Argon2id hash distinct from the plaintext', async () => {
    const hash = await service.hash('S3curePass!');
    expect(hash.startsWith('$argon2id$')).toBe(true);
    expect(hash).not.toContain('S3curePass!');
  });

  it('verifies a correct password', async () => {
    const hash = await service.hash('correct horse battery');
    await expect(service.verify(hash, 'correct horse battery')).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await service.hash('correct horse battery');
    await expect(service.verify(hash, 'wrong password')).resolves.toBe(false);
  });

  it('salts: two hashes of the same input differ', async () => {
    const a = await service.hash('same-input');
    const b = await service.hash('same-input');
    expect(a).not.toEqual(b);
  });
});
