import { createHash, randomUUID } from 'node:crypto';
import { AppError, forbidden, unauthorized } from '../../errors.js';
import { recordAudit } from '../auditoria/audit.js';
import { hashPassword, passwordProblem, verifyAgainstDummy, verifyPassword } from './passwords.js';
import * as repo from './repository.js';
import { generateRefreshToken, hashToken, signAccessToken, verifyAccessToken } from './tokens.js';

const UNIQUE_VIOLATION = '23505';
const DAY_MS = 24 * 60 * 60 * 1000;

const emailFingerprint = (email) => createHash('sha256').update(email).digest('hex').slice(0, 16);

export function createAuthService({ db, config, now = () => new Date() }) {
  const accessOptions = { secret: config.jwtAccessSecret, ttlSeconds: config.accessTtlSeconds };

  const publicUser = (user, roles) => ({
    id: user.id,
    nome: user.nome,
    email: user.email,
    status: user.status,
    papeis: roles,
  });

  /** Cria um refresh token (na família dada) e o access token correspondente. */
  async function issueTokens(client, user, familyId, ctx) {
    const refresh = generateRefreshToken();
    await repo.insertRefreshToken(client, {
      id: randomUUID(),
      userId: user.id,
      familyId,
      tokenHash: refresh.hash,
      expiresAt: new Date(now().getTime() + config.refreshTtlDays * DAY_MS),
      userAgent: ctx.userAgent,
      ip: ctx.ip,
    });
    return {
      tipo: 'Bearer',
      accessToken: signAccessToken({ userId: user.id, familyId }, accessOptions),
      expiresIn: config.accessTtlSeconds,
      refreshToken: refresh.token,
    };
  }

  async function register({ nome, email, senha }, ctx) {
    const problem = passwordProblem(senha, { email, nome });
    if (problem) throw new AppError(422, 'senha_fraca', problem);

    const passwordHash = await hashPassword(senha);
    const at = now();

    try {
      return await db.tx(async (t) => {
        const user = await repo.insertUser(t, {
          nome,
          email,
          passwordHash,
          termsVersion: config.termsVersion,
          now: at,
        });
        const tokens = await issueTokens(t, user, randomUUID(), ctx);
        await recordAudit(t, {
          actorUserId: user.id,
          action: 'auth.cadastro',
          entityType: 'usuario',
          entityId: user.id,
          ctx,
          metadata: { termsVersion: config.termsVersion },
        });
        return { usuario: publicUser(user, []), tokens };
      });
    } catch (error) {
      if (error?.code === UNIQUE_VIOLATION) {
        throw new AppError(409, 'email_ja_cadastrado', 'Este e-mail já está cadastrado.');
      }
      throw error;
    }
  }

  async function login({ email, senha }, ctx) {
    const user = await repo.findUserByEmail(db, email);

    if (!user) {
      await verifyAgainstDummy(senha); // iguala o tempo de resposta
      await recordAudit(db, {
        action: 'auth.login',
        result: 'falha',
        ctx,
        metadata: { motivo: 'credenciais', emailFingerprint: emailFingerprint(email) },
      });
      throw unauthorized('credenciais_invalidas', 'E-mail ou senha incorretos.');
    }

    if (!(await verifyPassword(user.password_hash, senha))) {
      await recordAudit(db, {
        actorUserId: user.id,
        action: 'auth.login',
        entityType: 'usuario',
        entityId: user.id,
        result: 'falha',
        ctx,
        metadata: { motivo: 'credenciais' },
      });
      throw unauthorized('credenciais_invalidas', 'E-mail ou senha incorretos.');
    }

    // O estado da conta só é revelado a quem provou conhecer a senha.
    if (user.status !== 'ativo') {
      await recordAudit(db, {
        actorUserId: user.id,
        action: 'auth.login',
        entityType: 'usuario',
        entityId: user.id,
        result: 'negado',
        ctx,
        metadata: { motivo: `conta_${user.status}` },
      });
      throw forbidden('conta_indisponivel', 'Esta conta está suspensa ou desativada.');
    }

    return db.tx(async (t) => {
      await repo.touchLastLogin(t, user.id, now());
      const tokens = await issueTokens(t, user, randomUUID(), ctx);
      await recordAudit(t, {
        actorUserId: user.id,
        action: 'auth.login',
        entityType: 'usuario',
        entityId: user.id,
        ctx,
      });
      return { usuario: publicUser(user, await repo.listRoles(t, user.id)), tokens };
    });
  }

  async function refresh({ refreshToken }, ctx) {
    const at = now();
    const stored = await repo.findRefreshByHash(db, hashToken(refreshToken));
    if (!stored) throw unauthorized('refresh_invalido', 'Sessão inválida. Faça login novamente.');

    const reuseDetected = async (motivo) => {
      await repo.revokeFamily(db, stored.family_id, at);
      await recordAudit(db, {
        actorUserId: stored.user_id,
        action: 'auth.refresh_reuso',
        entityType: 'sessao',
        entityId: stored.family_id,
        result: 'negado',
        ctx,
        metadata: { motivo },
      });
      return unauthorized('refresh_invalido', 'Sessão inválida. Faça login novamente.');
    };

    if (stored.revoked_at) {
      // Token já girado sendo reapresentado: provável roubo. Encerra a sessão inteira.
      if (stored.replaced_by) throw await reuseDetected('token_ja_girado');
      throw unauthorized('refresh_invalido', 'Sessão inválida. Faça login novamente.');
    }
    if (new Date(stored.expires_at) <= at) {
      throw unauthorized('sessao_expirada', 'Sessão expirada. Faça login novamente.');
    }

    const user = await repo.findUserById(db, stored.user_id);
    if (!user || user.status !== 'ativo') {
      await repo.revokeFamily(db, stored.family_id, at);
      throw forbidden('conta_indisponivel', 'Esta conta está suspensa ou desativada.');
    }

    try {
      return await db.tx(async (t) => {
        const tokens = await issueTokens(t, user, stored.family_id, ctx);
        const newRow = await repo.findRefreshByHash(t, hashToken(tokens.refreshToken));
        const rotated = await repo.markRotated(t, stored.id, newRow.id, at);
        if (!rotated) throw new AppError(409, 'refresh_concorrente', 'rotação concorrente');
        await recordAudit(t, {
          actorUserId: user.id,
          action: 'auth.refresh',
          entityType: 'sessao',
          entityId: stored.family_id,
          ctx,
        });
        return { tokens };
      });
    } catch (error) {
      // Duas renovações simultâneas com o mesmo token: só uma vence, a outra é tratada como reuso.
      if (error?.codigo === 'refresh_concorrente') throw await reuseDetected('rotacao_concorrente');
      throw error;
    }
  }

  async function logout({ refreshToken }, ctx) {
    const stored = await repo.findRefreshByHash(db, hashToken(refreshToken));
    if (!stored) return; // idempotente: não revela se o token existia
    await repo.revokeFamily(db, stored.family_id, now());
    await recordAudit(db, {
      actorUserId: stored.user_id,
      action: 'auth.logout',
      entityType: 'sessao',
      entityId: stored.family_id,
      ctx,
    });
  }

  async function logoutAll(userId, ctx) {
    await repo.revokeAllForUser(db, userId, now());
    await recordAudit(db, {
      actorUserId: userId,
      action: 'auth.logout_geral',
      entityType: 'usuario',
      entityId: userId,
      ctx,
    });
  }

  /** Resolve o access token em { user, roles, familyId }, ou lança 401/403. */
  async function authenticate(accessToken) {
    const claims = verifyAccessToken(accessToken, accessOptions);
    if (!claims) throw unauthorized('token_invalido', 'Token inválido ou expirado.');

    const at = now();
    if (!(await repo.isSessionActive(db, claims.familyId, claims.userId, at))) {
      throw unauthorized('sessao_encerrada', 'Sessão encerrada. Faça login novamente.');
    }
    const user = await repo.findUserById(db, claims.userId);
    if (!user) throw unauthorized('token_invalido', 'Token inválido ou expirado.');
    if (user.status !== 'ativo') throw forbidden('conta_indisponivel', 'Esta conta está suspensa ou desativada.');

    return { user, roles: await repo.listRoles(db, user.id), familyId: claims.familyId };
  }

  return { register, login, refresh, logout, logoutAll, authenticate, publicUser };
}
