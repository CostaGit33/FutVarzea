import { hash, verify } from '@node-rs/argon2';

// @node-rs/argon2 usa Argon2id por padrão (parâmetros recomendados pela OWASP).
export const hashPassword = (password) => hash(password);

export async function verifyPassword(storedHash, password) {
  try {
    return await verify(storedHash, password);
  } catch {
    return false;
  }
}

// Hash descartável para igualar o tempo de resposta quando o e-mail não existe.
let dummyHash;
export async function verifyAgainstDummy(password) {
  dummyHash ??= hashPassword('senha-descartavel-para-igualar-tempo');
  await verifyPassword(await dummyHash, password);
}

const COMMON = new Set([
  '1234567890', '12345678910', '0123456789', 'qwertyuiop', 'senha12345', 'senha123456',
  'password12', 'password123', 'brasil1234', 'futebol123', 'futvarzea1', 'abcdefghij',
  '1q2w3e4r5t', 'mudar12345',
]);

/** Regra de senha (NIST 800-63B): comprimento em vez de composição obrigatória. */
export function passwordProblem(password, { email = '', nome = '' } = {}) {
  if (password.length < 10) return 'A senha precisa ter ao menos 10 caracteres.';
  if (password.length > 128) return 'A senha pode ter no máximo 128 caracteres.';
  const lower = password.toLowerCase();
  if (COMMON.has(lower) || /^(.)\1+$/.test(password)) return 'Essa senha é muito comum. Escolha outra.';
  const local = email.split('@')[0];
  if (local.length >= 4 && lower.includes(local)) return 'A senha não pode conter o seu e-mail.';
  const firstName = nome.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  if (firstName.length >= 4 && lower === firstName) return 'A senha não pode ser o seu nome.';
  return null;
}
