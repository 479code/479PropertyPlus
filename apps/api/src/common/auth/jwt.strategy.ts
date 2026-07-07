import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { type AuthenticatedUser, type JwtPayload } from '../../modules/auth/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Passport has already verified the signature and expiry; map the validated
   * claims onto the request principal. The access token is short-lived, so we
   * trust its embedded org/membership context rather than re-reading the DB per
   * request. TODO(perf/security): optionally re-check membership status here.
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload.sub || !payload.organizationId || !payload.membershipId) {
      throw new UnauthorizedException('Malformed access token');
    }
    return {
      userId: payload.sub,
      organizationId: payload.organizationId,
      membershipId: payload.membershipId,
      email: payload.email,
    };
  }
}
