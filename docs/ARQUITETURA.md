# Arquitetura do FutVárzea

## Diretrizes

Arquitetura modular, mobile-first, auditável e simples de operar. Priorizar separação de responsabilidades, validação no servidor e evolução incremental.

## Domínios funcionais

- Identidade e acesso: contas, sessões, papéis e permissões.
- Babas e organizações: cadastro, responsáveis, locais, horários e modalidades.
- Atletas: perfil único, papéis esportivos e vínculos.
- Times e torneios: participantes, temporadas, regulamentos e inscrições.
- Partidas: escalações, eventos, resultados e confirmações.
- Validação: filas, evidências, decisões e recursos.
- Avaliação técnica: candidaturas, quadro de avaliadores, avaliações e impedimentos.
- Rankings: regras versionadas, períodos, elegibilidade e resultados.
- Mapa: pontos públicos autorizados e filtros.
- Auditoria: histórico de ações relevantes.

## Estrutura lógica sugerida

    FutVarzea/
    ├── docs/
    ├── backend/src/modules/
    │   ├── auth/ babas/ atletas/ times/ torneios/
    │   ├── partidas/ validacao/ avaliadores/
    │   ├── rankings/ mapa/ auditoria/
    │   └── app.js
    ├── backend/tests/
    ├── frontend/
    ├── database/migrations/
    ├── .github/workflows/
    ├── .env.example
    └── README.md

Esta é estrutura-alvo documental, não afirma que os módulos já estejam implementados.

## Fluxo de autorização

1. Pessoa cria conta e solicita papel.
2. Sistema verifica requisitos e registra solicitação.
3. Comissão/autoridade designada analisa conforme regras do papel.
4. Decisão, responsáveis, data e justificativa são auditados.
5. Backend verifica permissão em toda operação protegida; ocultar controles na interface não substitui autorização.

## Avaliação técnica

Módulo independente do registro estatístico. Apenas avaliadores ativos podem lançar notas. Armazenar versão da ficha, dimensões, justificativa, autoria, data e contexto. Proibir autoavaliação e edição silenciosa de avaliações submetidas.

## Quadro de avaliadores (`committee` + `fixed`)

Parâmetros de governança, versionados em configuração e não presumidos no código:

| Parâmetro | Valor | Efeito arquitetural |
|---|---|---|
| `max_evaluators` | 15 | Limite de avaliadores ativos autorizados. |
| `approval_mode` | `committee` | Aprovação por comissão administrativa; sem aprovação automática. |
| `vacancy_policy` | `fixed` | Sem reposição automática; abrir vaga exige autorização administrativa registrada. |

Requisitos de implementação:

- Candidatura não concede permissão; somente estado Aprovada, com autorização ativa e vaga contabilizada, permite avaliar.
- A contagem de 15 ativos é garantida no banco/transação (inclusive sob concorrência); nunca existe a 16ª autorização ativa.
- Suspensão, revogação, abertura de vaga e substituição geram eventos de auditoria com responsável, data/hora e motivo; revogar ou suspender não promove outro candidato.
- A decisão da comissão registra pareceres/votos e impedimentos declarados. Quórum, método de votação e desempate permanecem em aberto até deliberação.
- Notas individuais e divergências entre avaliadores são preservadas; a consolidação não apaga avaliações.
- Testes obrigatórios: bloqueio da 16ª autorização em concorrência e bloqueio de avaliação por candidato, rejeitado, suspenso ou revogado.

Detalhes em [REGRAS-AVALIADORES.md](REGRAS-AVALIADORES.md).

## Dados e segurança

- Banco relacional com integridade referencial e migrações versionadas.
- Segredos em variáveis de ambiente; nunca versionar credenciais.
- Controle de acesso no servidor.
- Auditoria de operações sensíveis.
- Minimização de dados pessoais e mecanismos de correção/contestação.
- Backups e restauração testáveis.
- Testes automatizados de regras e autorização.

## Integrações

Integrações externas isoladas por adaptadores. FutPontos é integração futura, sem acoplamento dos ciclos de implantação.

## Decisões em aberto

Tecnologia final de backend/frontend, provedor de mapas, autenticação, retenção de dados, quórum da comissão e fórmulas oficiais de ranking precisam ser definidos antes da implementação correspondente.
