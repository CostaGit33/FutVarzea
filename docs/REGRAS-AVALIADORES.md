# Regras do quadro de avaliadores

## Configuração aprovada

| Configuração | Valor | Regra |
|---|---|---|
| Modelo de aprovação | committee | Candidaturas analisadas por comissão administrativa. |
| Política de vagas | fixed | Quadro limitado a 15; sem reposição automática. |
| Limite de ativos | 15 | Nunca conceder a 16ª autorização ativa. |

## Candidatura

Qualquer pessoa elegível poderá solicitar candidatura pelo fluxo próprio. O formulário deverá reunir identificação da conta, experiência no futebol amador, justificativa, vínculos esportivos relevantes e declaração de conflitos de interesse. Enviar candidatura não concede permissão.

## Estados

- Rascunho: preenchimento não enviado.
- Em análise: encaminhada à comissão.
- Aprovada: autorizada, desde que exista vaga formalmente disponível.
- Rejeitada: não autorizada, com motivo registrado.
- Suspensa: permissão temporariamente bloqueada.
- Revogada: autorização encerrada.

Somente estado Aprovada, com autorização ativa e vaga contabilizada, permite avaliar atletas.

## Aprovação por comissão — committee

A decisão de aprovar/rejeitar pertence à comissão administrativa, não a aprovação automática nem a um único candidato. Composição, quórum mínimo, método de votação, empate e impedimentos ainda precisam de deliberação. Até lá, o sistema deve registrar pareceres/votos e impedir aprovação automática, sem inventar quórum. Membro com conflito de interesse declara impedimento e não participa da decisão afetada.

## Vagas fixas — fixed

- Máximo de 15 avaliadores ativos autorizados.
- Vaga não é liberada automaticamente por candidatura ou inatividade presumida.
- Abertura de vaga para substituição exige autorização administrativa registrada.
- Suspensão/revogação registra responsável, data, motivo e efeitos sobre avaliações anteriores.
- Substituição só termina após candidatura e aprovação pela comissão.
- Backend/banco deve bloquear transações que ultrapassem 15 ativos, inclusive sob concorrência.

## Permissões

Consultar dados esportivos necessários; registrar avaliações técnicas; avaliar jogadores e goleiros com fichas apropriadas; justificar notas; consultar o próprio histórico.

## Restrições

Não avaliar a si próprio; não aprovar a própria candidatura; não alterar estatísticas oficiais de partidas por este módulo; não editar/apagar silenciosamente avaliação de outro avaliador; não avaliar em conflito de interesse; não conceder a si mesmo permissões adicionais.

## Auditoria

Cada avaliação registra atleta, avaliador, versão da ficha, dimensões, notas, justificativas, data/hora, contexto e estado. Correções geram novo evento, preservando valor anterior, autor, data e motivo. Divergências podem ser sinalizadas para revisão, sem apagar notas discordantes.

## Separação entre técnica e estatística

Avaliação técnica é observação qualitativa autorizada. Gols, assistências, defesas e resultados pertencem ao domínio estatístico das partidas. Ranking composto só pode combinar dimensões com fórmula, pesos, cobertura e versão publicados.

## Segurança

Validar autorização no backend em cada operação protegida. A interface não é mecanismo de segurança. Garantir o limite de 15 no banco/transação.
