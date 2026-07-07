import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from '../../common/auth/jwt.strategy';
import { OrganizationModule } from '../organization/organization.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OrganizationSwitchController } from './organization-switch.controller';
import { PasswordService } from './password.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { TokenService } from './token.service';

@Module({
  imports: [
    PassportModule,
    OrganizationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: Number(config.get('JWT_ACCESS_TTL', 900)) },
      }),
    }),
  ],
  controllers: [AuthController, OrganizationSwitchController],
  providers: [AuthService, PasswordService, TokenService, RefreshTokenRepository, JwtStrategy],
  exports: [TokenService],
})
export class AuthModule {}
