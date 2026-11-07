import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  APP_SECRET: z.string().min(16).default('fkbutik-super-secret-key-min-16-chars'),

  DATABASE_URL: z.string().default('postgresql://postgres:password@localhost:5432/fkbutik_dev'),
  DATABASE_READ_URL: z.string().optional(),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  MEILISEARCH_URL: z.string().url().default('http://localhost:7700'),
  MEILISEARCH_MASTER_KEY: z.string().default('masterKey123456789'),

  CDN_URL: z.string().url().default('http://localhost:3001'),

  JWT_SECRET: z.string().min(16).default('fkbutik-jwt-secret-min-16-characters-key'),
  WEBHOOK_SECRET: z.string().min(16).default('fkbutik-webhook-secret-min-16-chars'),

  ALLOWED_ORIGINS: z.string().default('http://localhost:3000').transform((v) => v.split(',')),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Ortam değişkenleri doğrulama hatası:\n${result.error.toString()}`);
  }
  cachedEnv = result.data;
  return cachedEnv;
}

