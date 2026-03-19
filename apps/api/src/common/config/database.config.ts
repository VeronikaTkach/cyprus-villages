import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/cyprus_villages',
}));

export type TDatabaseConfig = ReturnType<typeof databaseConfig>;
