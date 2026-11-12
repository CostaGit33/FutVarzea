import { PGlite } from '@electric-sql/pglite';

/** Mesmo contrato de src/db/pg.js, sobre PGlite (PostgreSQL 16 real, em memória). */
export function createTestDb() {
  const pg = new PGlite();

  const wrap = (runner) => ({
    async query(text, params = []) {
      const result = await runner.query(text, params);
      return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
    },
    async exec(sql) {
      await runner.exec(sql);
    },
  });

  return {
    ...wrap(pg),
    async tx(fn) {
      return pg.transaction(async (t) => fn(wrap(t)));
    },
    async close() {
      await pg.close();
    },
  };
}
