import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPgDb } from './pg.js';

const here = path.dirname(fileURLToPath(import.meta.url));
export const defaultMigrationsDir = path.resolve(here, '../../../database/migrations');

/** Aplica, em ordem, as migrações .sql ainda não registradas. Cada uma roda em uma transação. */
export async function runMigrations(db, dir = defaultMigrationsDir) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const files = (await readdir(dir)).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();
  const { rows } = await db.query('SELECT name FROM schema_migrations');
  const applied = new Set(rows.map((r) => r.name));
  const ran = [];

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(path.join(dir, file), 'utf8');
    await db.tx(async (t) => {
      await t.exec(sql);
      await t.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
    });
    ran.push(file);
  }
  return ran;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL não definido.');
    process.exit(1);
  }
  const db = createPgDb(url);
  try {
    const ran = await runMigrations(db);
    console.log(ran.length ? `Migrações aplicadas: ${ran.join(', ')}` : 'Banco já está atualizado.');
  } catch (error) {
    console.error('Falha na migração:', error.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}
