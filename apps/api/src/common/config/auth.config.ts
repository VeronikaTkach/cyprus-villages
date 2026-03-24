import { registerAs } from '@nestjs/config';

export interface TAuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

export const authConfig = registerAs(
  'auth',
  (): TAuthConfig => ({
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  }),
);
