/**
 * Registra um evento na trilha de auditoria (tabela append-only).
 * Nunca inclua senhas, tokens ou dados pessoais desnecessários em `metadata`.
 */
export async function recordAudit(db, event) {
  const {
    actorUserId = null,
    action,
    entityType = null,
    entityId = null,
    result = 'sucesso',
    ctx = {},
    metadata = {},
  } = event;

  await db.query(
    `INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, result, ip, user_agent, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
    [
      actorUserId,
      action,
      entityType,
      entityId,
      result,
      ctx.ip ?? null,
      ctx.userAgent ?? null,
      JSON.stringify(metadata),
    ],
  );
}
