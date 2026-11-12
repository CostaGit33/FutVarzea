import pg from 'pg';

/**
 * Adaptador mínimo de banco. Toda a aplicação usa somente esta interface:
 *   query(text, params) -> { rows, rowCount }
 *   exec(sql)           -> executa SQL com vários comandos (sem parâmetros)
 *   tx(fn)              -> fn recebe { query, exec } dentro de uma transação
 *   close()
 * Os testes usam um adaptador equivalente sobre PGlite (PostgreSQL real em WASM).
 */
export function createPgDb(connectionString) {
  const pool = new pg.Pool({ connectionString, max: 10 });

  const wrap = (runner) => ({
    async query(text, params = []) {
      const result = await runner.query(text, params);
      return { rows: result.rows, rowCount: result.rowCount };
    },
    async exec(sql) {
      await runner.query(sql);
    },
  });

  return {
    ...wrap(pool),
    async tx(fn) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn(wrap(client));
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    },
  };
}
