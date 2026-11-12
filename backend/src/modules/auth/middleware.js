import { forbidden, unauthorized } from '../../errors.js';

/** Exige `Authorization: Bearer <accessToken>` e carrega usuário e papéis do banco a cada requisição. */
export function requireAuth(authService) {
  return async (req, _res, next) => {
    try {
      const header = req.get('authorization') ?? '';
      const match = /^Bearer\s+(\S+)$/i.exec(header);
      if (!match) throw unauthorized();
      req.auth = await authService.authenticate(match[1]);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Exige ao menos um dos papéis informados. Papéis são sempre explícitos:
 * 'admin' NÃO implica 'avaliador' nem 'comissao'.
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.auth) return next(unauthorized());
    if (!req.auth.roles.some((r) => roles.includes(r))) return next(forbidden());
    next();
  };
}
