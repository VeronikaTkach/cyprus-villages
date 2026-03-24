import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import type { TAuthConfig } from '../../common/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const authCfg = config.get<TAuthConfig>('auth')!;
        return {
          secret: authCfg.jwtSecret,
          signOptions: { expiresIn: authCfg.jwtExpiresIn as never },
        };
      },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard, Reflector],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
