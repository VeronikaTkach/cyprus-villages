import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { appConfig, authConfig, databaseConfig, validateEnv } from './common/config';
import { DatabaseModule } from './common/database';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VillagesModule } from './modules/villages/villages.module';
import { FestivalsModule } from './modules/festivals/festivals.module';
import { FestivalEditionsModule } from './modules/festival-editions/festival-editions.module';
import { LocationPointsModule } from './modules/location-points/location-points.module';
import { MediaModule } from './modules/media/media.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: validateEnv,
      load: [appConfig, databaseConfig, authConfig],
    }),
    // Rate limiting — throttler config is global; guards are applied per-controller.
    // Currently only the login endpoint uses ThrottlerGuard.
    ThrottlerModule.forRoot([{ ttl: 600_000, limit: 5 }]),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    VillagesModule,
    FestivalsModule,
    FestivalEditionsModule,
    LocationPointsModule,
    MediaModule,
    AuditLogModule,
  ],
})
export class AppModule {}
