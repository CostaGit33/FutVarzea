-- 0001: autenticação e identidade (usuários, papéis administrativos, sessões e auditoria).
-- O runner executa cada migração dentro de uma transação.

CREATE TABLE users (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome               text        NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  -- E-mail sempre normalizado (minúsculas, sem espaços) pela aplicação.
  email              text        NOT NULL CHECK (email = lower(btrim(email)) AND char_length(email) <= 254),
  password_hash      text        NOT NULL,
  status             text        NOT NULL DEFAULT 'ativo'
                                 CHECK (status IN ('ativo', 'suspenso', 'desativado')),
  terms_version      text        NOT NULL,
  terms_accepted_at  timestamptz NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  last_login_at      timestamptz
);

CREATE UNIQUE INDEX users_email_key ON users (email);

-- Papéis de sistema. Cadastrar-se NÃO concede nenhum papel: o usuário comum não tem linhas aqui.
-- 'avaliador' só deve ser concedido pelo módulo de avaliadores (comissão + limite de 15 vagas).
CREATE TABLE user_roles (
  user_id     uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role        text        NOT NULL CHECK (role IN ('admin', 'comissao', 'avaliador')),
  granted_by  uuid        REFERENCES users (id) ON DELETE SET NULL,
  granted_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

-- Refresh tokens opacos: guardamos somente o hash (SHA-256). Cada login cria uma "família";
-- a renovação gira o token dentro da família e o reuso de um token já girado revoga a família inteira.
CREATE TABLE refresh_tokens (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  family_id    uuid        NOT NULL,
  token_hash   text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  revoked_at   timestamptz,
  replaced_by  uuid        REFERENCES refresh_tokens (id) ON DELETE SET NULL,
  user_agent   text,
  ip           text
);

CREATE UNIQUE INDEX refresh_tokens_hash_key ON refresh_tokens (token_hash);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id);
CREATE INDEX refresh_tokens_family_idx ON refresh_tokens (family_id);

-- Auditoria append-only. Sem chave estrangeira para o ator: o histórico sobrevive à remoção do usuário.
CREATE TABLE audit_log (
  id             bigserial PRIMARY KEY,
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  actor_user_id  uuid,
  action         text        NOT NULL,
  entity_type    text,
  entity_id      text,
  result         text        NOT NULL DEFAULT 'sucesso' CHECK (result IN ('sucesso', 'falha', 'negado')),
  ip             text,
  user_agent     text,
  metadata       jsonb       NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX audit_log_actor_idx ON audit_log (actor_user_id, occurred_at DESC);
CREATE INDEX audit_log_action_idx ON audit_log (action, occurred_at DESC);

CREATE FUNCTION audit_log_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log é somente de inserção';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update_delete
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();
