import { z } from 'zod';

const email = z
  .string({ error: 'Informe o e-mail.' })
  .trim()
  .toLowerCase()
  .max(254, 'E-mail muito longo.')
  .pipe(z.email('E-mail inválido.'));

const nome = z
  .string({ error: 'Informe o nome.' })
  .transform((v) => v.trim().replace(/\s+/g, ' '))
  .pipe(z.string().min(2, 'Nome muito curto.').max(100, 'Nome muito longo.'));

// Limite superior evita custo excessivo de hashing com entradas gigantes.
const senhaLogin = z.string({ error: 'Informe a senha.' }).min(1, 'Informe a senha.').max(128, 'Senha inválida.');

export const cadastroSchema = z.object({
  nome,
  email,
  senha: z.string({ error: 'Informe a senha.' }).max(128, 'A senha pode ter no máximo 128 caracteres.'),
  aceitaTermos: z.literal(true, { error: 'É necessário aceitar os termos de uso.' }),
});

export const loginSchema = z.object({ email, senha: senhaLogin });

export const refreshSchema = z.object({
  refreshToken: z.string({ error: 'Informe o refreshToken.' }).min(20).max(200),
});
