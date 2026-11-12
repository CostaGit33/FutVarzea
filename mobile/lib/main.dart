import 'package:flutter/material.dart';

void main() => runApp(const FutVarzeaApp());

class FutVarzeaApp extends StatelessWidget {
  const FutVarzeaApp({super.key});

  @override
  Widget build(BuildContext context) {
    const green = Color(0xFF147D4B);
    return MaterialApp(
      title: 'FutVárzea',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: green),
        scaffoldBackgroundColor: const Color(0xFFF5F7F5),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFF5F7F5),
          foregroundColor: Color(0xFF17231C),
          elevation: 0,
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
            side: const BorderSide(color: Color(0xFFE7ECE8)),
          ),
        ),
      ),
      home: const MainNavigation(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int index = 0;

  static const pages = [HomePage(), DirectoryPage(), ProfilePage()];

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(child: pages[index]),
        bottomNavigationBar: NavigationBar(
          selectedIndex: index,
          onDestinationSelected: (value) => setState(() => index = value),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home),
              label: 'Início',
            ),
            NavigationDestination(
              icon: Icon(Icons.groups_outlined),
              selectedIcon: Icon(Icons.groups),
              label: 'Babas',
            ),
            NavigationDestination(
              icon: Icon(Icons.account_circle_outlined),
              selectedIcon: Icon(Icons.account_circle),
              label: 'Perfil',
            ),
          ],
        ),
      );
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) => ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        children: [
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: const Color(0xFF147D4B),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: const Icon(Icons.sports_soccer, color: Colors.white, size: 27),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('FutVárzea', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
                    Text('O futebol amador da nossa região',
                        style: TextStyle(color: Color(0xFF68756C), fontSize: 12)),
                  ],
                ),
              ),
              IconButton(onPressed: () {}, icon: const Icon(Icons.notifications_none_rounded)),
            ],
          ),
          const SizedBox(height: 26),
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: const LinearGradient(
                colors: [Color(0xFF126B43), Color(0xFF21945D)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('A várzea tem história. E tem números.',
                    style: TextStyle(color: Colors.white, fontSize: 25, height: 1.15, fontWeight: FontWeight.w800)),
                SizedBox(height: 10),
                Text('Descubra comunidades, atletas e competições do futebol amador.',
                    style: TextStyle(color: Color(0xFFE4F5EA), height: 1.4)),
                SizedBox(height: 18),
                Row(children: [
                  Icon(Icons.location_on_outlined, color: Colors.white, size: 17),
                  SizedBox(width: 5),
                  Text('Eunápolis e região',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                ]),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('Explore a plataforma', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          const FeatureTile(icon: Icons.map_outlined, title: 'Mapa dos babas',
              description: 'Locais, dias e horários dos encontros.'),
          const FeatureTile(icon: Icons.groups_2_outlined, title: 'Times e comunidades',
              description: 'Conheça os grupos de futebol amador.'),
          const FeatureTile(icon: Icons.leaderboard_outlined, title: 'Rankings e atletas',
              description: 'Desempenho com critérios transparentes.'),
          const FeatureTile(icon: Icons.verified_outlined, title: 'Validação',
              description: 'Cadastros e partidas com histórico auditável.'),
          const SizedBox(height: 12),
          const Text('Primeira versão estrutural: os módulos serão ativados conforme a API for implementada.',
              style: TextStyle(color: Color(0xFF68756C), fontSize: 12, height: 1.45)),
        ],
      );
}

class FeatureTile extends StatelessWidget {
  const FeatureTile({super.key, required this.icon, required this.title, required this.description});
  final IconData icon;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) => Card(
        margin: const EdgeInsets.only(bottom: 10),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 7),
          leading: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(color: const Color(0xFFE8F4EC), borderRadius: BorderRadius.circular(14)),
            child: Icon(icon, color: const Color(0xFF147D4B)),
          ),
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          subtitle: Padding(padding: const EdgeInsets.only(top: 4), child: Text(description)),
          trailing: const Icon(Icons.chevron_right, color: Color(0xFF89958D)),
        ),
      );
}

class DirectoryPage extends StatelessWidget {
  const DirectoryPage({super.key});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 18),
            const Text('Babas', style: TextStyle(fontSize: 27, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            const Text('Encontre e conheça os babas da região.',
                style: TextStyle(color: Color(0xFF68756C))),
            const Spacer(),
            const Center(
              child: Column(children: [
                Icon(Icons.sports_soccer, size: 58, color: Color(0xFF147D4B)),
                SizedBox(height: 14),
                Text('Conteúdo em preparação',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                SizedBox(height: 7),
                Text('Esta área será conectada aos dados oficiais da plataforma.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF68756C), height: 1.4)),
              ]),
            ),
            const Spacer(),
          ],
        ),
      );
}

class ProfileType {
  const ProfileType({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.description,
    required this.permissions,
    this.approval,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final String description;
  final List<String> permissions;
  final String? approval;
}

const profileTypes = [
  ProfileType(
    title: 'Jogador / atleta',
    subtitle: 'Perfil esportivo individual',
    icon: Icons.person,
    description: 'Perfil municipal do atleta, com histórico esportivo e vínculos autorizados.',
    permissions: ['Editar dados do próprio perfil', 'Solicitar vínculo com times e babas',
      'Consultar partidas, estatísticas e rankings', 'Solicitar correção de dados'],
  ),
  ProfileType(
    title: 'Avaliador',
    subtitle: 'Avaliação técnica autorizada',
    icon: Icons.fact_check_outlined,
    description: 'Avaliador passa por candidatura e aprovação da comissão administrativa.',
    permissions: ['Consultar atletas para avaliação', 'Preencher ficha técnica e justificar notas',
      'Consultar o próprio histórico de avaliações'],
    approval: 'Exige aprovação da comissão e vaga entre os 15 avaliadores ativos.',
  ),
  ProfileType(
    title: 'Administrador de time',
    subtitle: 'Gestão de uma equipe',
    icon: Icons.shield_outlined,
    description: 'Responsável pelo cadastro e pela gestão do time ao qual foi vinculado.',
    permissions: ['Editar cadastro e identidade do time', 'Gerenciar elenco e solicitações de vínculo',
      'Indicar responsáveis e contatos institucionais', 'Solicitar participação em torneios',
      'Consultar dados e atividades do próprio time'],
    approval: 'A gestão depende de vínculo confirmado e autorização do time.',
  ),
  ProfileType(
    title: 'Responsável por baba',
    subtitle: 'Gestão de uma comunidade esportiva',
    icon: Icons.groups_2_outlined,
    description: 'Responsável por manter os dados do baba e organizar suas atividades.',
    permissions: ['Editar local, dias e horários do baba', 'Gerenciar responsáveis e participantes',
      'Solicitar validação cadastral', 'Registrar informações de atividades e partidas',
      'Responder a pendências de validação'],
    approval: 'Ações públicas e elegibilidade a rankings dependem da validação da plataforma.',
  ),
  ProfileType(
    title: 'Organizador de torneio',
    subtitle: 'Gestão de competição',
    icon: Icons.emoji_events_outlined,
    description: 'Responsável pela organização de uma competição específica.',
    permissions: ['Criar e editar dados do torneio', 'Gerenciar inscrições de equipes',
      'Publicar regulamento e calendário', 'Informar resultados para validação',
      'Consultar a classificação da competição'],
    approval: 'Torneio e resultados precisam cumprir as regras de validação.',
  ),
  ProfileType(
    title: 'Administrador da plataforma',
    subtitle: 'Acesso administrativo restrito',
    icon: Icons.admin_panel_settings_outlined,
    description: 'Perfil interno para administração global, segurança e governança da plataforma.',
    permissions: ['Gerenciar contas e permissões globais', 'Autorizar substituição no quadro de avaliadores',
      'Analisar auditoria e ocorrências', 'Administrar configurações da plataforma'],
    approval: 'Concessão manual e restrita. Cadastro comum nunca recebe este acesso.',
  ),
];

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) => ListView(
        padding: const EdgeInsets.fromLTRB(20, 22, 20, 30),
        children: [
          const Text('Perfis e acessos', style: TextStyle(fontSize: 27, fontWeight: FontWeight.w800)),
          const SizedBox(height: 7),
          const Text('Uma conta pode ter mais de uma função. Cada função libera apenas os recursos autorizados.',
              style: TextStyle(color: Color(0xFF68756C), height: 1.4)),
          const SizedBox(height: 18),
          Card(
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: Color(0xFFE8F4EC),
                child: Icon(Icons.account_circle_outlined, color: Color(0xFF147D4B), size: 30),
              ),
              title: const Text('Conta FutVárzea', style: TextStyle(fontWeight: FontWeight.w800)),
              subtitle: const Text('Entre ou crie uma conta para solicitar seus perfis.'),
              trailing: const Icon(Icons.lock_outline),
            ),
          ),
          const SizedBox(height: 20),
          const Text('Escolha um perfil', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 10),
          for (final type in profileTypes)
            Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                leading: Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(color: const Color(0xFFE8F4EC), borderRadius: BorderRadius.circular(14)),
                  child: Icon(type.icon, color: const Color(0xFF147D4B)),
                ),
                title: Text(type.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                subtitle: Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(type.subtitle),
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(
                  builder: (_) => ProfileDetailPage(profile: type),
                )),
              ),
            ),
          const SizedBox(height: 8),
          const Text('Os perfis e permissões exibidos representam a estrutura planejada. A ativação real depende da autenticação e das regras implementadas no servidor.',
              style: TextStyle(color: Color(0xFF68756C), fontSize: 12, height: 1.45)),
        ],
      );
}

class ProfileDetailPage extends StatelessWidget {
  const ProfileDetailPage({super.key, required this.profile});
  final ProfileType profile;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(profile.title)),
        body: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F4EC),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(profile.icon, size: 38, color: const Color(0xFF147D4B)),
                  const SizedBox(height: 14),
                  Text(profile.title, style: const TextStyle(fontSize: 23, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 7),
                  Text(profile.description, style: const TextStyle(height: 1.45)),
                ],
              ),
            ),
            const SizedBox(height: 22),
            const Text('Permissões previstas', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            for (final permission in profile.permissions)
              Card(
                child: ListTile(
                  dense: true,
                  leading: const Icon(Icons.check_circle_outline, color: Color(0xFF147D4B)),
                  title: Text(permission),
                ),
              ),
            if (profile.approval != null) ...[
              const SizedBox(height: 14),
              Card(
                color: const Color(0xFFFFF8E8),
                child: ListTile(
                  leading: const Icon(Icons.info_outline, color: Color(0xFF8A641B)),
                  title: const Text('Autorização'),
                  subtitle: Text(profile.approval!),
                ),
              ),
            ],
            const SizedBox(height: 18),
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text('Solicitações e edição de dados serão habilitadas quando o fluxo de perfis estiver conectado à API. Esta tela ainda não concede permissões nem salva uma candidatura.',
                    style: TextStyle(color: Color(0xFF68756C), height: 1.45)),
              ),
            ),
          ],
        ),
      );
}
