# Regulamento do Jogador em Destaque Municipal

## 1. Finalidade

Reconhecer mensalmente o atleta com melhor desempenho no futebol amador do município, com critérios verificáveis, avaliação técnica independente, transparência e homologação administrativa. O reconhecimento é da plataforma FutVárzea e não representa título ou certificação do poder público.

## 2. Periodicidade

- A apuração corresponde ao mês-calendário, do primeiro ao último dia do mês, no horário local do município.
- Somente partidas, estatísticas e avaliações válidas registradas dentro do período entram naquela edição.
- Ao encerrar o mês, a edição passa para apuração e os dados utilizados devem ser congelados para cálculo e auditoria.
- Correções posteriores ao fechamento não alteram silenciosamente a edição encerrada. Eventual retificação exige procedimento auditável e preserva a versão anterior.

## 3. Elegibilidade técnica mínima

- Cada atleta precisa receber pelo menos **5 avaliações técnicas independentes** no mês para ser elegível ao título.
- Independência significa avaliações válidas feitas por **5 avaliadores distintos**, todos aprovados, ativos e autorizados no quadro oficial de até 15 avaliadores.
- Um avaliador não pode avaliar a si próprio, atleta com conflito de interesse declarado ou registrar avaliações duplicadas para o mesmo atleta na mesma edição mensal.
- Uma avaliação válida identifica atleta, avaliador, data/hora, contexto esportivo, versão da ficha, notas e justificativas.
- Avaliação incompleta, duplicada, sem contexto mínimo ou lançada por avaliador sem autorização ativa não conta para o mínimo.
- Correção de avaliação é registrada como nova versão/evento, preservando o conteúdo anterior, o autor, a data e o motivo; não cria uma segunda avaliação independente.

## 4. Apuração e classificação

- O sistema consolida apenas dados esportivos validados e avaliações técnicas válidas do período.
- Estatísticas de partidas e avaliação técnica permanecem dimensões distintas e identificáveis.
- A fórmula oficial, pesos, escalas, critérios específicos por posição e desempates devem estar publicados em uma versão aprovada do regulamento de ranking antes de serem usados para declarar um vencedor.
- Não se presume peso, pontuação ou critério que ainda não tenha sido formalmente aprovado.
- Jogadores de linha e goleiros podem ter fichas técnicas adequadas às suas funções. O sistema deve evitar comparação direta de métricas incompatíveis.
- O resultado calculado inicialmente é **provisório**. O sistema deve indicar atletas inelegíveis por falta das cinco avaliações, sem converter ausência de avaliação em nota zero.

## 5. Homologação e publicação

- A publicação é condicionada à **homologação administrativa**; não é automática.
- Após a apuração, o sistema encaminha o resultado provisório e seu dossiê de evidências para um administrador da plataforma com autorização específica para homologar.
- A homologação verifica elegibilidade, integridade dos registros, mínimo de cinco avaliadores distintos, aplicação da versão correta da fórmula, conflitos de interesse, alertas antifraude e consistência do período.
- O homologador pode: homologar; devolver para revisão com motivo; ou rejeitar a edição com justificativa.
- Homologação não autoriza o administrador a alterar notas técnicas ou estatísticas. Correções seguem seus fluxos próprios e deixam trilha de auditoria.
- Somente após homologação o vencedor e a classificação oficial da edição podem ser publicados.
- A página pública informa mês de referência, data de homologação, versão dos critérios, nota/classificação divulgável e cobertura das avaliações, respeitando a privacidade.

## 6. Auditoria, integridade e contestação

- Registrar abertura e fechamento da edição, conjunto de dados considerado, avaliações computadas e descartadas, versão da regra, cálculo, alertas, decisões e responsável pela homologação.
- Preservar o resultado provisório, o resultado homologado e todas as retificações.
- Sinalizações de fraude, conflito ou inconsistência suspendem a homologação do item afetado até revisão documentada.
- Disponibilizar canal de contestação com prazo e procedimento a serem definidos antes do lançamento público do módulo.
- Patrocínio, pagamento, vínculo com time ou popularidade não podem comprar avaliação, elegibilidade ou posição.

## 7. Estados da edição mensal

- `collecting`: período de coleta em andamento.
- `calculating`: período encerrado; consolidação em execução.
- `pending_homologation`: resultado provisório aguardando decisão administrativa.
- `returned_for_review`: devolvido para correção/investigação, com motivo.
- `homologated`: resultado oficial autorizado para publicação.
- `rejected`: edição ou resultado rejeitado, com justificativa e histórico preservado.
- `published`: resultado homologado publicado.

## 8. Requisitos técnicos

- Implementar a regra de cinco avaliadores distintos no backend e no banco, não apenas na interface.
- Impedir duplicidade por edição, atleta e avaliador; correções devem versionar a avaliação original.
- Persistir snapshots/versionamento do cálculo para reprodução futura.
- Restringir homologação a usuário autorizado, exigir motivo nas decisões de retorno/rejeição e auditar todas as ações.
- Testar mínimo de cinco avaliadores, cinco contas distintas, avaliador suspenso/revogado, duplicidade, conflito de interesse, fechamento mensal, bloqueio de publicação antes da homologação e preservação de versões.
- Este documento define o regulamento e os requisitos. Não significa que o módulo de avaliação, apuração, homologação ou publicação já esteja implementado.
