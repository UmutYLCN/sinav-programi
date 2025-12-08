import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_HOST: z.string().min(1).default('localhost'),
  DATABASE_PORT: z.coerce.number().default(3306),
  DATABASE_NAME: z.string().min(1).default('sinav_programi'),
  DATABASE_USER: z.string().min(1).default('root'),
  DATABASE_PASSWORD: z.string().default(''),
  DATABASE_LOGGING: z
    .enum(['true', 'false'])
    .default(process.env.NODE_ENV === 'development' ? 'true' : 'false'),
  JWT_SECRET: z.string().min(8).default('gelistirme-super-gizli-anahtar'),
  JWT_EXPIRES_IN: z.string().default('12h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  TIMEZONE: z.string().default('Europe/Istanbul'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const validateEnv = (config: Record<string, unknown>): EnvConfig =>
  envSchema.parse(config);
