import { Injectable } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';

/**
 * Password hashing using Argon2id (the default algorithm of @node-rs/argon2).
 * Parameters follow current OWASP guidance: 19 MiB memory, 2 iterations,
 * 1 degree of parallelism. Pure-Rust/N-API — no native toolchain required.
 */
@Injectable()
export class PasswordService {
  private readonly options = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

  hash(plain: string): Promise<string> {
    return hash(plain, this.options);
  }

  verify(hashed: string, plain: string): Promise<boolean> {
    return verify(hashed, plain, this.options);
  }
}
