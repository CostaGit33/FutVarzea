import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';

const ISSUER = 'futvarzea';
const AUDIENCE = 'futvarzea-api';
const ALGORITHM = 'HS256';

/** Access token curto. `sid` é a família do refresh token: encerrar a sessão invalida o acesso na hora. */
export function signAccessToken({ userId, familyId }, { secret, ttlSeconds }) {
  return jwt.sign({ sid: familyId }, secret, {
    algorithm: ALGORITHM,
    subject: userId,
    issuer: ISSUER,
    audience: AUDIENCE,
    expiresIn: ttlSeconds,
  });
}

/** Devolve { userId, familyId } ou null se o token for inválido ou expirado. */
export function verifyAccessToken(token, { secret }) {
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: [ALGORITHM],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') return null;
    return { userId: payload.sub, familyId: payload.sid };
  } catch {
    return null;
  }
}

export const hashToken = (token) => createHash('sha256').update(token).digest('base64url');

/** Refresh token opaco de 256 bits. Só o hash vai para o banco. */
export function generateRefreshToken() {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}
