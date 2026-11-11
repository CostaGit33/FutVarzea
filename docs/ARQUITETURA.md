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
