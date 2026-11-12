import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { requireAuth, requireRole } from '../src/modules/auth/middleware.js';
import { VALID_PASSWORD, TEST_SECRET, createContext, uniqueEmail, validCadastro } from './helpers/context.js';

let ctx;
before(async () => {
  ctx = await createContext();
});
after(async () => {
  await ctx.close();
});

const post = (path, body, headers = {}) => request(ctx.app).post(path).set(headers).send(body);
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

async function signup(overrides) {
  const body = validCadastro(overrides);
  const res = await post('/auth/cadastro', body);
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return { body, ...res.body };
}

describe('cadastro', () => {
  test('cria usuário sem papéis, devolve tokens e guarda só o hash argon2id', async () => {
    const { body, usuario, tokens } = await signup();
    assert.equal(usuario.email, body.email);
    assert.deepEqual(usuario.papeis, []);
    assert.equal(tokens.tipo, 'Bearer');
    assert.ok(tokens.accessToken && tokens.refreshToken);
    assert.equal(JSON.stringify(usuario).includes('senha'), false);

    const { rows } = await ctx.db.query('SELECT password_hash, terms_version FROM users WHERE email = $1', [body.email]);
    assert.match(rows[0].password_hash, /^\$argon2id\$/);
    assert.ok(rows[0].terms_version);
  });

  test('normaliza e-mail e nome; e-mail duplicado ignora maiúsculas', async () => {
    const email = uniqueEmail('Caixa');
    const first = await post('/auth/cadastro', validCadastro({ email: `  ${email.toUpperCase()} `, nome: '  Ana   Maria  ' }));
    assert.equal(first.status, 201);
    assert.equal(first.body.usuario.email, email.toLowerCase());
    assert.equal(first.body.usuario.nome, 'Ana Maria');

    const dup = await post('/auth/cadastro', validCadastro({ email }));
    assert.equal(dup.status, 409);
    assert.equal(dup.body.erro.codigo, 'email_ja_cadastrado');
  });

  test('rejeita dados inválidos com detalhes por campo', async () => {
    const res = await post('/auth/cadastro', { nome: 'A', email: 'nao-e-email', senha: 'x', aceitaTermos: false });
    assert.equal(res.status, 400);
    assert.equal(res.body.erro.codigo, 'dados_invalidos');
    const campos = res.body.erro.detalhes.map((d) => d.campo);
    assert.ok(['nome', 'email', 'aceitaTermos'].every((c) => campos.includes(c)), campos.join(','));
  });

  test('exige aceite dos termos', async () => {
    const res = await post('/auth/cadastro', validCadastro({ aceitaTermos: false }));
    assert.equal(res.status, 400);
  });

  test('rejeita senha fraca (422)', async () => {
    for (const senha of ['curta123', '1234567890', 'aaaaaaaaaaaa']) {
      const res = await post('/auth/cadastro', validCadastro({ senha }));
      assert.equal(res.status, 422, senha);
      assert.equal(res.body.erro.codigo, 'senha_fraca');
    }
  });

  test('rejeita senha que contém o e-mail', async () => {
    const res = await post('/auth/cadastro', validCadastro({ email: 'joaozinho@exemplo.com', senha: 'joaozinho-2026' }));
    assert.equal(res.status, 422);
  });

  test('JSON malformado -> 400 e corpo grande -> 413', async () => {
    const bad = await request(ctx.app).post('/auth/cadastro').set('Content-Type', 'application/json').send('{oops');
    assert.equal(bad.status, 400);
    assert.equal(bad.body.erro.codigo, 'json_invalido');
    const big = await post('/auth/cadastro', { nome: 'x'.repeat(20_000) });
    assert.equal(big.status, 413);
  });
});

describe('login', () => {
  test('autentica e registra auditoria', async () => {
    const { body } = await signup();
    const res = await post('/auth/login', { email: body.email.toUpperCase(), senha: VALID_PASSWORD });
    assert.equal(res.status, 200);
    assert.ok(res.body.tokens.accessToken);

    const { rows } = await ctx.db.query(
      `SELECT result FROM audit_log WHERE action = 'auth.login' AND actor_user_id = $1`,
      [res.body.usuario.id],
    );
    assert.deepEqual(rows.map((r) => r.result), ['sucesso']);
  });

  test('senha errada e e-mail inexistente dão a mesma resposta', async () => {
    const { body } = await signup();
    const wrongPassword = await post('/auth/login', { email: body.email, senha: 'senha-errada-123' });
    const unknownEmail = await post('/auth/login', { email: uniqueEmail('ninguem'), senha: 'senha-errada-123' });
    for (const res of [wrongPassword, unknownEmail]) {
      assert.equal(res.status, 401);
      assert.equal(res.body.erro.codigo, 'credenciais_invalidas');
    }
    assert.deepEqual(wrongPassword.body, unknownEmail.body);
  });

  test('falhas ficam na auditoria sem guardar o e-mail em claro', async () => {
    const email = uniqueEmail('audit');
    await post('/auth/login', { email, senha: 'senha-errada-123' });
    const { rows } = await ctx.db.query(
      `SELECT metadata FROM audit_log WHERE action = 'auth.login' AND result = 'falha' ORDER BY id DESC LIMIT 1`,
    );
    assert.equal(JSON.stringify(rows[0].metadata).includes(email), false);
    assert.ok(rows[0].metadata.emailFingerprint);
  });

  test('conta suspensa: 403 só depois de provar a senha', async () => {
    const { body, usuario } = await signup();
    await ctx.db.query(`UPDATE users SET status = 'suspenso' WHERE id = $1`, [usuario.id]);

    const ok = await post('/auth/login', { email: body.email, senha: VALID_PASSWORD });
    assert.equal(ok.status, 403);
    assert.equal(ok.body.erro.codigo, 'conta_indisponivel');

    const wrong = await post('/auth/login', { email: body.email, senha: 'senha-errada-123' });
    assert.equal(wrong.status, 401);
  });
});

describe('perfil e access token', () => {
  test('exige token válido', async () => {
    const { tokens, usuario } = await signup();
    assert.equal((await request(ctx.app).get('/auth/perfil')).status, 401);
    assert.equal((await request(ctx.app).get('/auth/perfil').set(bearer('lixo'))).status, 401);

    const res = await request(ctx.app).get('/auth/perfil').set(bearer(tokens.accessToken));
    assert.equal(res.status, 200);
    assert.equal(res.body.usuario.id, usuario.id);
    assert.equal(JSON.stringify(res.body).includes('password'), false);
  });

  test('rejeita token com outro segredo, expirado e sem sessão', async () => {
    const { usuario, tokens } = await signup();
    const claims = jwt.decode(tokens.accessToken);
    const common = { algorithm: 'HS256', subject: usuario.id, issuer: 'futvarzea', audience: 'futvarzea-api' };

    const forged = jwt.sign({ sid: claims.sid }, 'outro-segredo-qualquer-com-32-caracteres!!', { ...common, expiresIn: 600 });
    const expired = jwt.sign({ sid: claims.sid }, TEST_SECRET, { ...common, expiresIn: -10 });
    const noSession = jwt.sign({ sid: crypto.randomUUID() }, TEST_SECRET, { ...common, expiresIn: 600 });
    const none = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(
      JSON.stringify({ sub: usuario.id, sid: claims.sid }),
    ).toString('base64url')}.`;

    for (const token of [forged, expired, none]) {
      assert.equal((await request(ctx.app).get('/auth/perfil').set(bearer(token))).status, 401);
    }
    const res = await request(ctx.app).get('/auth/perfil').set(bearer(noSession));
    assert.equal(res.status, 401);
    assert.equal(res.body.erro.codigo, 'sessao_encerrada');
  });

  test('conta suspensa perde o acesso mesmo com token válido', async () => {
    const { tokens, usuario } = await signup();
    await ctx.db.query(`UPDATE users SET status = 'suspenso' WHERE id = $1`, [usuario.id]);
    const res = await request(ctx.app).get('/auth/perfil').set(bearer(tokens.accessToken));
    assert.equal(res.status, 403);
  });
});

describe('refresh token', () => {
  test('gira o token; o antigo deixa de valer', async () => {
    const { tokens } = await signup();
    const res = await post('/auth/renovar', { refreshToken: tokens.refreshToken });
    assert.equal(res.status, 200);
    assert.notEqual(res.body.tokens.refreshToken, tokens.refreshToken);

    const profile = await request(ctx.app).get('/auth/perfil').set(bearer(res.body.tokens.accessToken));
    assert.equal(profile.status, 200);

    const again = await post('/auth/renovar', { refreshToken: tokens.refreshToken });
    assert.equal(again.status, 401);
  });

  test('reuso de token girado encerra a sessão inteira (inclusive o token novo e o access token)', async () => {
    const { tokens } = await signup();
    const rotated = (await post('/auth/renovar', { refreshToken: tokens.refreshToken })).body.tokens;

    const reuse = await post('/auth/renovar', { refreshToken: tokens.refreshToken });
    assert.equal(reuse.status, 401);

    assert.equal((await post('/auth/renovar', { refreshToken: rotated.refreshToken })).status, 401);
    const profile = await request(ctx.app).get('/auth/perfil').set(bearer(rotated.accessToken));
    assert.equal(profile.status, 401);

    const { rows } = await ctx.db.query(`SELECT 1 FROM audit_log WHERE action = 'auth.refresh_reuso'`);
    assert.ok(rows.length >= 1);
  });

  test('duas renovações simultâneas: só uma vence e a sessão é encerrada', async () => {
    const { tokens } = await signup();
    const results = await Promise.all([
      post('/auth/renovar', { refreshToken: tokens.refreshToken }),
      post('/auth/renovar', { refreshToken: tokens.refreshToken }),
    ]);
    const statuses = results.map((r) => r.status).sort();
    assert.deepEqual(statuses, [200, 401]);
    const winner = results.find((r) => r.status === 200);
    assert.equal((await post('/auth/renovar', { refreshToken: winner.body.tokens.refreshToken })).status, 401);
  });

  test('expira após o prazo configurado', async () => {
    const { tokens } = await signup();
    ctx.advanceDays(31);
    const res = await post('/auth/renovar', { refreshToken: tokens.refreshToken });
    assert.equal(res.status, 401);
    assert.equal(res.body.erro.codigo, 'sessao_expirada');
    ctx.advanceDays(-31);
  });

  test('token desconhecido -> 401; conta suspensa -> 403', async () => {
    assert.equal((await post('/auth/renovar', { refreshToken: 'x'.repeat(43) })).status, 401);
    const { tokens, usuario } = await signup();
    await ctx.db.query(`UPDATE users SET status = 'suspenso' WHERE id = $1`, [usuario.id]);
    assert.equal((await post('/auth/renovar', { refreshToken: tokens.refreshToken })).status, 403);
  });
});

describe('logout', () => {
  test('encerra a sessão na hora, inclusive o access token', async () => {
    const { tokens } = await signup();
    assert.equal((await post('/auth/logout', { refreshToken: tokens.refreshToken })).status, 204);
    assert.equal((await request(ctx.app).get('/auth/perfil').set(bearer(tokens.accessToken))).status, 401);
    assert.equal((await post('/auth/renovar', { refreshToken: tokens.refreshToken })).status, 401);
  });

  test('é idempotente e não revela se o token existia', async () => {
    assert.equal((await post('/auth/logout', { refreshToken: 'y'.repeat(43) })).status, 204);
  });

  test('logout-geral encerra todas as sessões do usuário', async () => {
    const { body, tokens } = await signup();
    const second = (await post('/auth/login', { email: body.email, senha: VALID_PASSWORD })).body.tokens;

    assert.equal((await post('/auth/logout-geral', {}, bearer(tokens.accessToken))).status, 204);
    assert.equal((await request(ctx.app).get('/auth/perfil').set(bearer(second.accessToken))).status, 401);
    assert.equal((await post('/auth/renovar', { refreshToken: second.refreshToken })).status, 401);
  });
});

describe('papéis', () => {
  async function appWithProtectedRoute() {
    const protectedApp = express();
    protectedApp.get(
      '/somente-avaliador',
      requireAuth(ctx.authService),
      requireRole('avaliador'),
      (_req, res) => res.json({ ok: true }),
    );
    protectedApp.use((err, _req, res, _next) => res.status(err.status ?? 500).json({ codigo: err.codigo }));
    return protectedApp;
  }

  test('cadastro não concede papel; admin não implica avaliador; avaliador passa', async () => {
    const route = await appWithProtectedRoute();
    const { tokens, usuario } = await signup();

    const comum = await request(route).get('/somente-avaliador').set(bearer(tokens.accessToken));
    assert.equal(comum.status, 403);

    await ctx.db.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')`, [usuario.id]);
    const admin = await request(route).get('/somente-avaliador').set(bearer(tokens.accessToken));
    assert.equal(admin.status, 403, 'admin sozinho não pode avaliar');

    await ctx.db.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, 'avaliador')`, [usuario.id]);
    const avaliador = await request(route).get('/somente-avaliador').set(bearer(tokens.accessToken));
    assert.equal(avaliador.status, 200);

    const perfil = await request(ctx.app).get('/auth/perfil').set(bearer(tokens.accessToken));
    assert.deepEqual(perfil.body.usuario.papeis, ['admin', 'avaliador']);
  });

  test('sem token -> 401', async () => {
    const route = await appWithProtectedRoute();
    assert.equal((await request(route).get('/somente-avaliador')).status, 401);
  });
});

describe('infraestrutura', () => {
  test('health e rota inexistente', async () => {
    assert.deepEqual((await request(ctx.app).get('/health')).body, { status: 'ok' });
    const res = await request(ctx.app).get('/nada');
    assert.equal(res.status, 404);
    assert.equal(res.body.erro.codigo, 'nao_encontrado');
  });

  test('CORS só libera origens configuradas', async () => {
    const allowed = await request(ctx.app).get('/health').set('Origin', 'http://localhost:5173');
    assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');
    const denied = await request(ctx.app).get('/health').set('Origin', 'https://malicioso.example');
    assert.equal(denied.headers['access-control-allow-origin'], undefined);
  });

  test('cabeçalhos de segurança presentes', async () => {
    const res = await request(ctx.app).get('/health');
    assert.equal(res.headers['x-powered-by'], undefined);
    assert.ok(res.headers['x-content-type-options']);
  });

  test('audit_log não aceita UPDATE nem DELETE', async () => {
    await assert.rejects(ctx.db.query(`UPDATE audit_log SET action = 'x'`), /somente de inserção/);
    await assert.rejects(ctx.db.query('DELETE FROM audit_log'), /somente de inserção/);
  });
});

describe('limite de tentativas', () => {
  test('login: 429 após o limite, por IP + e-mail', async () => {
    const limited = await createContext({
      rateLimits: {
        geral: { windowMs: 60_000, limit: 1000 },
        cadastro: { windowMs: 60_000, limit: 1000 },
        login: { windowMs: 60_000, limit: 3 },
      },
    });
    try {
      const attack = { email: uniqueEmail('alvo'), senha: 'senha-errada-123' };
      const statuses = [];
      for (let i = 0; i < 5; i++) {
        statuses.push((await request(limited.app).post('/auth/login').send(attack)).status);
      }
      assert.deepEqual(statuses, [401, 401, 401, 429, 429]);

      const other = await request(limited.app).post('/auth/login').send({ ...attack, email: uniqueEmail('outro') });
      assert.equal(other.status, 401, 'outro e-mail não é afetado');

      const last = await request(limited.app).post('/auth/login').send(attack);
      assert.equal(last.body.erro.codigo, 'muitas_tentativas');
    } finally {
      await limited.close();
    }
  });

  test('cadastro: limite por IP', async () => {
    const limited = await createContext({
      rateLimits: {
        geral: { windowMs: 60_000, limit: 1000 },
        cadastro: { windowMs: 60_000, limit: 2 },
        login: { windowMs: 60_000, limit: 1000 },
      },
    });
    try {
      const statuses = [];
      for (let i = 0; i < 3; i++) {
        statuses.push((await request(limited.app).post('/auth/cadastro').send(validCadastro())).status);
      }
      assert.deepEqual(statuses, [201, 201, 429]);
    } finally {
      await limited.close();
    }
  });
});
