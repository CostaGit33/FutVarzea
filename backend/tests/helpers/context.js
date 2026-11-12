import { createApp } from '../../src/app.js';
import { loadConfig } from '../../src/config.js';
import { runMigrations } from '../../src/db/migrate.js';
import { createTestDb } from './pglite-db.js';

export const TEST_SECRET = 'segredo-de-teste-com-mais-de-trinta-e-dois-caracteres';

export const baseConfig = (overrides = {}) => ({
  ...loadConfig({
    DATABASE_URL: 'postgres://teste',
    JWT_ACCESS_SECRET: TEST_SECRET,
    CORS_ORIGINS: 'http://localhost:5173',
  }),
  ...overrides,
});

const BIG = { windowMs: 60_000, limit: 10_000 };

/** App completo sobre PGlite, com relógio controlável e limites de taxa altos (salvo override). */
export async function createContext({ rateLimits, config } = {}) {
  const db = createTestDb();
  await runMigrations(db);

  const clock = { current: Date.now() };
  const now = () => new Date(clock.current);

  const { app, authService } = createApp({
    db,
    config: baseConfig(config),
    now,
    rateLimits: rateLimits ?? { geral: BIG, cadastro: BIG, login: BIG },
  });

  return {
    app,
    db,
    authService,
    clock,
    advanceDays: (days) => {
      clock.current += days * 24 * 60 * 60 * 1000;
    },
    close: () => db.close(),
  };
}

let counter = 0;
export const uniqueEmail = (prefix = 'user') => `${prefix}${++counter}.${Date.now()}@exemplo.com`;
export const VALID_PASSWORD = 'bola-de-gude-2026';

export const validCadastro = (overrides = {}) => ({
  nome: 'Romário Teste',
  email: uniqueEmail(),
  senha: VALID_PASSWORD,
  aceitaTermos: true,
  ...overrides,
});
