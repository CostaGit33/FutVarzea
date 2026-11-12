# Perfis, vínculos e permissões

## Princípio de identidade

Uma pessoa mantém uma única conta e um perfil-base. A mesma conta pode acumular funções compatíveis, sem duplicar cadastro de atleta ou criar contas separadas por equipe, baba ou torneio. Cada função é concedida no escopo correto e pode ser revogada sem apagar o histórico.

Cadastro ou autodeclaração não concede permissão administrativa.

## Tipos de perfil

### 1. Jogador / atleta

- Perfil esportivo individual municipal único.
- Pode manter dados biográficos e esportivos permitidos, foto mediante consentimento e dados públicos configuráveis.
- Pode solicitar vínculo com times e babas; o vínculo depende de confirmação conforme regras do domínio.
- Consulta partidas, estatísticas, conquistas e rankings em que esteja elegível.
- Pode solicitar correção de dados e consultar seu histórico.
- Um atleta pode também atuar como goleiro; não criar uma segunda identidade para essa função.

### 2. Avaliador

- Exige candidatura e aprovação pelo modelo `committee`.
- Quadro com 15 vagas fixas (`fixed`); não há aprovação automática nem 16ª vaga.
- Somente avaliador aprovado, ativo e com vaga contabilizada registra avaliação técnica.
- Avaliações devem conter autoria, data/hora, ficha, notas e justificativas.
- Não pode avaliar a si próprio, aprovar a própria candidatura ou alterar estatísticas oficiais de partidas.
- Suspensão, revogação e substituição são auditadas; substituição exige autorização administrativa.

### 3. Administrador de time

Permissão vinculada a um time específico, nunca global por padrão.

- Atualizar dados públicos e identidade do time.
- Gerenciar elenco, convites e solicitações de vínculo.
- Manter contatos institucionais e indicar responsáveis.
- Solicitar participação em torneios e acompanhar atividades do próprio time.
- Não pode alterar resultados oficiais já validados, avaliações técnicas ou dados de outros times.
- A concessão exige vínculo/representação confirmada; mudanças de responsável ficam auditadas.

### 4. Responsável por baba

Permissão vinculada a um baba específico.

- Manter nome, descrição, local público, dias e horários.
- Gerenciar responsáveis e participantes do baba.
- Responder pendências cadastrais e solicitar validação.
- Informar atividades e partidas para os fluxos de validação.
- Não pode aprovar a própria validação, fabricar resultados ou editar silenciosamente partidas validadas.
- O cadastro só se torna elegível a rankings após cumprir o fluxo de verificação da plataforma.

### 5. Organizador de torneio

Permissão vinculada a um torneio específico.

- Criar e editar dados, regulamento, calendário e formato da competição.
- Gerenciar inscrições e equipes participantes.
- Informar súmulas/resultados para validação.
- Consultar classificação e dados do próprio torneio.
- Não pode validar sozinho resultados em que tenha conflito, nem alterar resultados já homologados sem fluxo auditável de correção.

### 6. Administrador da plataforma

- Papel global restrito, concedido manualmente.
- Gerencia contas, papéis globais, parâmetros, segurança, auditoria e governança.
- Autoriza abertura de vaga para substituição no quadro de avaliadores, sem substituir a decisão de aprovação da comissão.
- Não recebe automaticamente o papel de avaliador ou membro da comissão.
- Ações administrativas sensíveis exigem motivo e registro de auditoria.

## Separação entre papéis globais e funções por recurso

Os papéis globais já previstos na autenticação são `admin`, `comissao` e `avaliador`. Funções de administrador de time, responsável por baba e organizador de torneio são **vínculos de escopo** com um recurso identificado, não papéis globais.

Modelo conceitual:

- `user_roles`: papéis globais de segurança.
- `resource_memberships`: usuário, tipo de recurso (`team`, `baba`, `tournament`), ID do recurso, função, estado, concedido por, datas e motivo.
- `athlete_profiles`: perfil esportivo associado a uma conta, com identidade municipal única.
- `evaluator_applications`: candidatura, documentos/declaracões, estado e decisões da comissão.

O backend deve verificar usuário, papel, recurso, estado do vínculo e ação em toda operação protegida. Ocultar botões no aplicativo não é controle de acesso.

## Estados recomendados para vínculos

- `pending`: aguardando confirmação.
- `active`: vínculo autorizado e válido.
- `suspended`: temporariamente sem poderes.
- `revoked`: vínculo encerrado, mantendo histórico.

A aprovação deve registrar quem autorizou, quando, em qual recurso e por qual motivo. Não apagar vínculos antigos: encerrar e criar novo registro quando houver troca de responsável.

## Interface mobile

A área Perfil apresenta os tipos de perfil, descrição, permissões e requisitos de autorização. Ela é apenas estrutura visual até que cadastro, solicitação, aprovação, persistência e autorização estejam integrados ao backend. A interface não pode declarar que um perfil foi concedido sem resposta confirmada do servidor.

## Segurança, privacidade e LGPD

- Exibir publicamente apenas dados necessários e autorizados.
- Não expor telefone pessoal nem endereço residencial.
- Fotos e dados identificáveis de menores dependem de autorização aplicável e consentimento do responsável.
- Registrar alterações de perfil, vínculos e permissões em trilha de auditoria.
- Revogar acesso imediatamente quando a conta ou o vínculo for suspenso.
- Um administrador de recurso só atua no recurso ao qual está vinculado.
