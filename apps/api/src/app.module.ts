import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, databaseConfig, validateEnv } from './common/config';
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
      load: [appConfig, databaseConfig],
    }),
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
