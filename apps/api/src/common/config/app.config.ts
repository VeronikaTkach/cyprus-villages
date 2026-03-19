import { registerAs } from '@nestjs/config';
import { NodeEnvironment } from './env.validation';

export const appConfig = registerAs('app', () => ({
  nodeEnv: (process.env.NODE_ENV as NodeEnvironment) ?? NodeEnvironment.Development,
  port: parseInt(process.env.PORT ?? '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === NodeEnvironment.Production,
}));

export type TAppConfig = ReturnType<typeof appConfig>;
