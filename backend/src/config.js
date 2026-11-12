import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET precisa ter ao menos 32 caracteres'),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  CORS_ORIGINS: z.string().default(''),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
  TERMS_VERSION: z.string().min(1).default('2026-11'),
});

/** Valida o ambiente e devolve a configuração. Falha cedo, com mensagem clara. */
export function loadConfig(env = process.env) {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Configuração inválida: ${detail}`);
  }
  const c = parsed.data;
  return {
    databaseUrl: c.DATABASE_URL,
    jwtAccessSecret: c.JWT_ACCESS_SECRET,
    accessTtlSeconds: c.ACCESS_TOKEN_TTL_SECONDS,
    refreshTtlDays: c.REFRESH_TOKEN_TTL_DAYS,
    corsOrigins: c.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
    port: c.PORT,
    trustProxy: c.TRUST_PROXY,
    termsVersion: c.TERMS_VERSION,
  };
}
