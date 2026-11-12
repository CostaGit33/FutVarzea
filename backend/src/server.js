import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createPgDb } from './db/pg.js';

const config = loadConfig();
const db = createPgDb(config.databaseUrl);
const { app } = createApp({ db, config });

const server = app.listen(config.port, () => {
  console.log(`FutVárzea API ouvindo na porta ${config.port}`);
});

const shutdown = (signal) => {
  console.log(`${signal} recebido, encerrando...`);
  server.close(async () => {
    await db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
