import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  @IsOptional()
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsNumber()
  @IsOptional()
  @Min(1024)
  @Max(65535)
  PORT: number = 3001;

  @IsString()
  @IsOptional()
  DATABASE_URL: string =
    'postgresql://postgres:postgres@localhost:5432/cyprus_villages';

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = 'http://localhost:3000';

  @IsString()
  @IsOptional()
  JWT_SECRET: string = 'dev-secret-change-in-production';

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '7d';

  // ── Cloudflare R2 ──────────────────────────────────────────────────────────
  // All four are optional so local dev without R2 still boots.

  @IsString()
  @IsOptional()
  R2_ACCOUNT_ID: string = '';

  @IsString()
  @IsOptional()
  R2_ACCESS_KEY_ID: string = '';

  @IsString()
  @IsOptional()
  R2_SECRET_ACCESS_KEY: string = '';

  @IsString()
  @IsOptional()
  R2_BUCKET_NAME: string = '';

  @IsString()
  @IsOptional()
  R2_PUBLIC_BASE_URL: string = '';
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('\n')}`,
    );
  }

  return validated;
}
