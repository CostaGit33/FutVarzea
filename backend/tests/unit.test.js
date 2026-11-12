import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { loadConfig } from '../src/config.js';
import { runMigrations } from '../src/db/migrate.js';
import { hashPassword, passwordProblem, verifyPassword } from '../src/modules/auth/passwords.js';
import { generateRefreshToken, hashToken } from '../src/modules/auth/tokens.js';
import { createTestDb } from './helpers/pglite-db.js';

describe('senhas', () => {
  test('hash e verificação', async () => {
    const hash = await hashPassword('uma-senha-boa-123');
    assert.equal(await verifyPassword(hash, 'uma-senha-boa-123'), true);
    assert.equal(await verifyPassword(hash, 'outra-senha-123'), false);
    assert.equal(await verifyPassword('hash-invalido', 'x'), false);
  });

  test('política de senha', () => {
    assert.ok(passwordProblem('curta'));
    assert.ok(passwordProblem('x'.repeat(129)));
    assert.ok(passwordProblem('1234567890'));
    assert.ok(passwordProblem('zzzzzzzzzzzz'));
    assert.ok(passwordProblem('meunome-2026!', { email: 'meunome@x.com' }));
    assert.equal(passwordProblem('bola-de-gude-2026', { email: 'ana@x.com', nome: 'Ana' }), null);
  });
});

describe('tokens', () => {
  test('refresh token é aleatório e só o hash é derivável', () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    assert.notEqual(a.token, b.token);
    assert.equal(a.hash, hashToken(a.token));
    assert.notEqual(a.hash, a.token);
    assert.ok(a.token.length >= 43);
  });
});

describe('configuração', () => {
  const ok = { DATABASE_URL: 'postgres://x', JWT_ACCESS_SECRET: 'a'.repeat(32) };

  test('aplica padrões e interpreta CORS', () => {
    const c = loadConfig({ ...ok, CORS_ORIGINS: 'https://a.com, https://b.com ,' });
    assert.equal(c.accessTtlSeconds, 900);
    assert.equal(c.refreshTtlDays, 30);
    assert.deepEqual(c.corsOrigins, ['https://a.com', 'https://b.com']);
  });

  test('falha cedo com segredo curto ou ausente', () => {
    assert.throws(() => loadConfig({ ...ok, JWT_ACCESS_SECRET: 'curto' }), /JWT_ACCESS_SECRET/);
    assert.throws(() => loadConfig({ DATABASE_URL: 'x' }), /JWT_ACCESS_SECRET/);
    assert.throws(() => loadConfig({ JWT_ACCESS_SECRET: ok.JWT_ACCESS_SECRET }), /DATABASE_URL/);
  });
});

describe('migrações', () => {
  test('são idempotentes', async () => {
    const db = createTestDb();
    try {
      assert.deepEqual(await runMigrations(db), ['0001_auth.sql']);
      assert.deepEqual(await runMigrations(db), []);
    } finally {
      await db.close();
    }
  });

  test('o banco rejeita e-mail fora do formato normalizado e status inválido', async () => {
    const db = createTestDb();
    try {
      await runMigrations(db);
      const insert = (email, status = 'ativo') =>
        db.query(
          `INSERT INTO users (nome, email, password_hash, status, terms_version, terms_accepted_at)
           VALUES ('Fulano', $1, 'h', $2, 'v', now())`,
          [email, status],
        );
      await assert.rejects(insert('Maiuscula@x.com'));
      await assert.rejects(insert('ok@x.com', 'inventado'));
      await insert('ok@x.com');
      await assert.rejects(insert('ok@x.com'), /unique|duplicate/i);
    } finally {
      await db.close();
    }
  });
});
