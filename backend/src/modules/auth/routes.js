import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AppError } from '../../errors.js';
import { requireAuth } from './middleware.js';
import { cadastroSchema, loginSchema, refreshSchema } from './schemas.js';

const WINDOW_MS = 15 * 60 * 1000;

const limiter = ({ windowMs, limit, key }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: key,
    handler: (_req, _res, next) =>
      next(new AppError(429, 'muitas_tentativas', 'Muitas tentativas. Aguarde alguns minutos e tente de novo.')),
  });

function parse(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (result.success) return result.data;
  const detalhes = result.error.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message }));
  throw new AppError(400, 'dados_invalidos', 'Dados inválidos.', detalhes);
}

const context = (req) => ({ ip: req.ip, userAgent: (req.get('user-agent') ?? '').slice(0, 255) || null });

export function createAuthRouter({ authService, rateLimits = {} }) {
  const router = Router();

  const limits = {
    geral: rateLimits.geral ?? { windowMs: WINDOW_MS, limit: 200 },
    cadastro: rateLimits.cadastro ?? { windowMs: 60 * 60 * 1000, limit: 10 },
    login: rateLimits.login ?? { windowMs: WINDOW_MS, limit: 10 },
  };

  router.use(limiter({ ...limits.geral, key: (req) => req.ip }));

  // Cadastro: por IP. Login: por IP + e-mail, para frear tentativas contra uma conta sem trancá-la para todos.
  const cadastroLimiter = limiter({ ...limits.cadastro, key: (req) => req.ip });
  const loginLimiter = limiter({
    ...limits.login,
    key: (req) => `${req.ip}|${String(req.body?.email ?? '').trim().toLowerCase().slice(0, 254)}`,
  });

  const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

  router.post('/cadastro', cadastroLimiter, wrap(async (req, res) => {
    const data = parse(cadastroSchema, req.body);
    res.status(201).json(await authService.register(data, context(req)));
  }));

  router.post('/login', loginLimiter, wrap(async (req, res) => {
    const data = parse(loginSchema, req.body);
    res.json(await authService.login(data, context(req)));
  }));

  router.post('/renovar', wrap(async (req, res) => {
    const data = parse(refreshSchema, req.body);
    res.json(await authService.refresh(data, context(req)));
  }));

  router.post('/logout', wrap(async (req, res) => {
    const data = parse(refreshSchema, req.body);
    await authService.logout(data, context(req));
    res.status(204).end();
  }));

  router.post('/logout-geral', requireAuth(authService), wrap(async (req, res) => {
    await authService.logoutAll(req.auth.user.id, context(req));
    res.status(204).end();
  }));

  router.get('/perfil', requireAuth(authService), (req, res) => {
    res.json({ usuario: authService.publicUser(req.auth.user, req.auth.roles) });
  });

  return router;
}
