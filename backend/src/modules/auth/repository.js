// Acesso a dados da autenticação. Recebe `db` (ou o cliente de uma transação).

const USER_COLUMNS = 'id, nome, email, password_hash, status, created_at, last_login_at';

export async function insertUser(db, { nome, email, passwordHash, termsVersion, now }) {
  const { rows } = await db.query(
    `INSERT INTO users (nome, email, password_hash, terms_version, terms_accepted_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${USER_COLUMNS}`,
    [nome, email, passwordHash, termsVersion, now],
  );
  return rows[0];
}

export async function findUserByEmail(db, email) {
  const { rows } = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE email = $1`, [email]);
  return rows[0] ?? null;
}

export async function findUserById(db, id) {
  const { rows } = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function listRoles(db, userId) {
  const { rows } = await db.query('SELECT role FROM user_roles WHERE user_id = $1 ORDER BY role', [userId]);
  return rows.map((r) => r.role);
}

export async function touchLastLogin(db, userId, now) {
  await db.query('UPDATE users SET last_login_at = $2 WHERE id = $1', [userId, now]);
}

export async function insertRefreshToken(db, t) {
  await db.query(
    `INSERT INTO refresh_tokens (id, user_id, family_id, token_hash, expires_at, user_agent, ip)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [t.id, t.userId, t.familyId, t.tokenHash, t.expiresAt, t.userAgent ?? null, t.ip ?? null],
  );
}

export async function findRefreshByHash(db, tokenHash) {
  const { rows } = await db.query(
    `SELECT id, user_id, family_id, expires_at, revoked_at, replaced_by
       FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash],
  );
  return rows[0] ?? null;
}

/** Marca o token como girado. Só tem efeito se ainda estiver ativo; devolve true se girou. */
export async function markRotated(db, id, replacedBy, now) {
  const { rowCount } = await db.query(
    `UPDATE refresh_tokens SET revoked_at = $3, replaced_by = $2
      WHERE id = $1 AND revoked_at IS NULL`,
    [id, replacedBy, now],
  );
  return rowCount === 1;
}

export async function revokeFamily(db, familyId, now) {
  await db.query(
    'UPDATE refresh_tokens SET revoked_at = $2 WHERE family_id = $1 AND revoked_at IS NULL',
    [familyId, now],
  );
}

export async function revokeAllForUser(db, userId, now) {
  await db.query(
    'UPDATE refresh_tokens SET revoked_at = $2 WHERE user_id = $1 AND revoked_at IS NULL',
    [userId, now],
  );
}

/** A sessão (família) continua válida enquanto existir um refresh token ativo nela. */
export async function isSessionActive(db, familyId, userId, now) {
  const { rows } = await db.query(
    `SELECT 1 FROM refresh_tokens
      WHERE family_id = $1 AND user_id = $2 AND revoked_at IS NULL AND expires_at > $3
      LIMIT 1`,
    [familyId, userId, now],
  );
  return rows.length === 1;
}
