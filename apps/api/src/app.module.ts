import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';
import { PermissionsGuard } from './common/auth/permissions.guard';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigurationModule } from './modules/config/configuration.module';
import { CrmModule } from './modules/crm/crm.module';
import { GeoModule } from './modules/geo/geo.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { InvitesModule } from './modules/invites/invites.module';
import { MembershipModule } from './modules/membership/membership.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { PropertyModule } from './modules/property/property.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: Number(config.get('RATE_LIMIT_TTL_MS', 60_000)),
            limit: Number(config.get('RATE_LIMIT_MAX', 100)),
          },
        ],
      }),
    }),
    PrismaModule,
    AuditModule,
    UsersModule,
    MembershipModule,
    RbacModule,
    InvitesModule,
    AuthModule,
    OrganizationModule,
    ConfigurationModule,
    GeoModule,
    PropertyModule,
    InventoryModule,
    CrmModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
