# Autenticação e sessões

Primeira parte implementada do backend (`backend/`). Cobre cadastro, login, renovação e encerramento de sessão, perfil do usuário e a base de papéis. **Não** cobre candidatura de avaliadores, e-mail de verificação nem recuperação de senha (ver "Em aberto").

## Decisões

| Tema | Decisão |
|---|---|
| Stack | Node.js 22, Express, PostgreSQL (`pg`). |
| Senhas | Argon2id (`@node-rs/argon2`). Mínimo de 10 e máximo de 128 caracteres, sem exigir composição. Rejeita senhas comuns, repetidas ou que contenham o e-mail. |
| Access token | JWT HS256 de 15 min (configurável), com `sub` (usuário) e `sid` (sessão). Algoritmo, emissor e audiência são verificados. |
| Refresh token | Opaco (256 bits), guardado só como hash SHA-256, validade de 30 dias, com **rotação** a cada renovação. |
| Sessão | Cada login cria uma "família" de refresh tokens. Reapresentar um token já girado é tratado como roubo e **encerra a sessão inteira**. |
| Revogação imediata | Toda requisição autenticada confere no banco se a sessão está ativa e se a conta está ativa. Logout, suspensão e reuso valem na hora, sem esperar o JWT expirar. |
| Papéis | Tabela `user_roles` (`admin`, `comissao`, `avaliador`). Cadastro **não concede nenhum papel**. `admin` não implica `avaliador` nem `comissao`. |
| Auditoria | Tabela `audit_log` somente de inserção (trigger bloqueia UPDATE/DELETE). |

## Endpoints

Todas as respostas de erro seguem `{ "erro": { "codigo", "mensagem", "detalhes?" } }`.

| Método | Rota | Corpo | Sucesso |
|---|---|---|---|
| POST | `/auth/cadastro` | `nome`, `email`, `senha`, `aceitaTermos: true` | 201 `{ usuario, tokens }` |
| POST | `/auth/login` | `email`, `senha` | 200 `{ usuario, tokens }` |
| POST | `/auth/renovar` | `refreshToken` | 200 `{ tokens }` |
| POST | `/auth/logout` | `refreshToken` | 204 (idempotente) |
| POST | `/auth/logout-geral` | — (Bearer) | 204, encerra todas as sessões |
| GET | `/auth/perfil` | — (Bearer) | 200 `{ usuario }` |
| GET | `/health` | — | 200 `{ status: "ok" }` |

`tokens` = `{ tipo: "Bearer", accessToken, expiresIn, refreshToken }`. `usuario` = `{ id, nome, email, status, papeis }`.

Códigos de erro principais: `dados_invalidos` (400), `senha_fraca` (422), `email_ja_cadastrado` (409), `credenciais_invalidas` (401), `conta_indisponivel` (403), `token_invalido` / `sessao_encerrada` / `sessao_expirada` / `refresh_invalido` (401), `muitas_tentativas` (429).

## Proteções

- Mesma resposta e tempo semelhante para "e-mail inexistente" e "senha errada". O estado da conta (suspensa) só é revelado a quem acertou a senha.
- Limite de tentativas: login por IP + e-mail (10 por 15 min), cadastro por IP (10 por hora) e limite geral por IP.
- Corpo limitado a 10 KB, CORS apenas para origens configuradas, cabeçalhos de segurança (`helmet`).
- Falhas de login são auditadas sem gravar o e-mail em claro (apenas uma impressão digital parcial).
- O banco também impõe: e-mail normalizado e único, status válido, papéis válidos.

## Auditoria

Eventos: `auth.cadastro`, `auth.login` (sucesso, falha ou negado), `auth.refresh`, `auth.refresh_reuso`, `auth.logout`, `auth.logout_geral`, `auth.admin_inicial`. Cada registro guarda ator, entidade, resultado, IP, user-agent e metadados. Nunca senhas nem tokens.

## Como usar

Variáveis (ver `.env.example`): `DATABASE_URL`, `JWT_ACCESS_SECRET` (mínimo 32 caracteres), `CORS_ORIGINS`, `PORT`, `TRUST_PROXY` e os prazos dos tokens. O servidor recusa iniciar com configuração inválida.

```bash
cd backend
npm ci
npm run migrate                 # aplica database/migrations
ADMIN_EMAIL=... ADMIN_NOME=... ADMIN_SENHA=... npm run create-admin   # primeiro administrador
npm start
npm test                        # PostgreSQL real em memória (PGlite), sem serviços externos
```

Atrás de proxy (Cloudflare Tunnel, Easypanel), defina `TRUST_PROXY=1`; sem isso o limite de tentativas enxerga o IP do proxy.

## Para o cliente (Flutter)

- Guardar o `refreshToken` em armazenamento seguro do dispositivo.
- Ao receber 401 com `token_invalido`, renovar uma única vez e repetir a requisição.
- **Serializar as renovações**: duas renovações simultâneas com o mesmo token contam como reuso e derrubam a sessão.
- Após `refresh_invalido` ou `sessao_expirada`, voltar ao login.

## Em aberto

- **Verificação de e-mail e recuperação de senha**: exigem provedor de e-mail. Antes de conceder o papel de avaliador, o e-mail deve estar verificado.
- **Segundo fator** para membros da comissão e administradores.
- **Menores de idade e LGPD**: o cadastro guarda aceite e versão dos termos, mas não há regra de idade mínima nem consentimento de responsável.
- **Texto dos termos de uso** e política de retenção de IP e auditoria.
- **Limite de tentativas em memória**: vale para uma instância. Com várias réplicas, mover para armazenamento compartilhado.
- **Cadastro revela se o e-mail existe** (`email_ja_cadastrado`). Só deixa de ocorrer com verificação por e-mail.
- Concessão do papel `avaliador` (comissão, limite de 15, vagas fixas) pertence ao módulo de avaliadores, ainda não implementado.
