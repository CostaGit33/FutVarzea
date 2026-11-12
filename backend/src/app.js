import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { AppError } from './errors.js';
import { createAuthRouter } from './modules/auth/routes.js';
import { createAuthService } from './modules/auth/service.js';

/**
 * Monta a aplicação. Recebe `db` e `config` (injeção) para permitir testes sem servidor nem rede.
 * `now` e `rateLimits` existem para os testes controlarem tempo e limites.
 */
export function createApp({ db, config, now, rateLimits }) {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy > 0) app.set('trust proxy', config.trustProxy);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || config.corsOrigins.includes(origin)),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', async (_req, res) => {
    try {
      await db.query('SELECT 1');
      res.json({ status: 'ok' });
    } catch {
      res.status(503).json({ status: 'indisponivel' });
    }
  });

  const authService = createAuthService({ db, config, now });
  app.use('/auth', createAuthRouter({ authService, rateLimits }));

  app.use((_req, _res, next) => next(new AppError(404, 'nao_encontrado', 'Rota não encontrada.')));

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, _next) => {
    if (error?.type === 'entity.parse.failed') {
      error = new AppError(400, 'json_invalido', 'Corpo da requisição não é um JSON válido.');
    } else if (error?.type === 'entity.too.large') {
      error = new AppError(413, 'corpo_grande_demais', 'Corpo da requisição grande demais.');
    }
    if (error instanceof AppError) {
      return res.status(error.status).json({
        erro: { codigo: error.codigo, mensagem: error.message, ...(error.detalhes && { detalhes: error.detalhes }) },
      });
    }
    console.error(`[erro] ${req.method} ${req.path}:`, error);
    res.status(500).json({ erro: { codigo: 'erro_interno', mensagem: 'Erro interno do servidor.' } });
  });

  return { app, authService };
}
