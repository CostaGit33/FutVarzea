// Cria (ou promove) o primeiro administrador. Uso:
//   ADMIN_EMAIL=voce@exemplo.com ADMIN_NOME="Seu Nome" ADMIN_SENHA='...' npm run create-admin
// A senha vem do ambiente, nunca de argumentos de linha de comando (que ficam no histórico do shell).
import { createPgDb } from '../src/db/pg.js';
import { recordAudit } from '../src/modules/auditoria/audit.js';
import { hashPassword, passwordProblem } from '../src/modules/auth/passwords.js';
import * as repo from '../src/modules/auth/repository.js';

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_NOME, ADMIN_SENHA, TERMS_VERSION = '2026-11' } = process.env;

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!DATABASE_URL) fail('DATABASE_URL não definido.');
if (!ADMIN_EMAIL || !ADMIN_NOME || !ADMIN_SENHA) fail('Defina ADMIN_EMAIL, ADMIN_NOME e ADMIN_SENHA.');

const email = ADMIN_EMAIL.trim().toLowerCase();
const problem = passwordProblem(ADMIN_SENHA, { email, nome: ADMIN_NOME });
if (problem) fail(problem);

const db = createPgDb(DATABASE_URL);
try {
  await db.tx(async (t) => {
    let user = await repo.findUserByEmail(t, email);
    if (!user) {
      user = await repo.insertUser(t, {
        nome: ADMIN_NOME.trim(),
        email,
        passwordHash: await hashPassword(ADMIN_SENHA),
        termsVersion: TERMS_VERSION,
        now: new Date(),
      });
    }
    await t.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin') ON CONFLICT DO NOTHING`,
      [user.id],
    );
    await recordAudit(t, {
      actorUserId: user.id,
      action: 'auth.admin_inicial',
      entityType: 'usuario',
      entityId: user.id,
      metadata: { origem: 'script create-admin' },
    });
    console.log(`Administrador pronto: ${email}`);
  });
} catch (error) {
  fail(`Falha: ${error.message}`);
} finally {
  await db.close();
}
