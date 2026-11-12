import 'package:flutter/material.dart';

void main() {
  runApp(const FutVarzeaApp());
}

class FutVarzeaApp extends StatelessWidget {
  const FutVarzeaApp({super.key});

  @override
  Widget build(BuildContext context) {
    const seed = Color(0xFF147D4B);
    return MaterialApp(
      title: 'FutVárzea',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: seed,
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF5F7F5),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFF5F7F5),
          foregroundColor: Color(0xFF17231C),
          elevation: 0,
          centerTitle: false,
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
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
  int _index = 0;

  static const _pages = [
    HomePage(),
    DirectoryPage(
      title: 'Babas',
      subtitle: 'Encontre e conheça os babas da região.',
      icon: Icons.sports_soccer,
    ),
    DirectoryPage(
      title: 'Atletas',
      subtitle: 'Consulte perfis e acompanhe os destaques.',
      icon: Icons.person_search,
    ),
    ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: _pages[_index]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
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
            icon: Icon(Icons.emoji_events_outlined),
            selectedIcon: Icon(Icons.emoji_events),
            label: 'Atletas',
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
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
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
              child: const Icon(
                Icons.sports_soccer,
                color: Colors.white,
                size: 27,
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'FutVárzea',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                  ),
                  Text(
                    'O futebol amador da nossa região',
                    style: TextStyle(color: Color(0xFF68756C), fontSize: 12),
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: () {},
              tooltip: 'Notificações',
              icon: const Icon(Icons.notifications_none_rounded),
            ),
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
              Text(
                'A várzea tem história. E tem números.',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 25,
                  height: 1.15,
                  fontWeight: FontWeight.w800,
                ),
              ),
              SizedBox(height: 10),
              Text(
                'Descubra comunidades, atletas e competições do futebol amador.',
                style: TextStyle(color: Color(0xFFE4F5EA), height: 1.4),
              ),
              SizedBox(height: 18),
              Row(
                children: [
                  Icon(Icons.location_on_outlined, color: Colors.white, size: 17),
                  SizedBox(width: 5),
                  Text(
                    'Eunápolis e região',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        const Text(
          'Explore a plataforma',
          style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 12),
        const _FeatureTile(
          icon: Icons.map_outlined,
          title: 'Mapa dos babas',
          description: 'Locais, dias e horários dos encontros.',
          tag: 'Em preparação',
        ),
        const _FeatureTile(
          icon: Icons.groups_2_outlined,
          title: 'Times e comunidades',
          description: 'Conheça os grupos de futebol amador.',
          tag: 'Em preparação',
        ),
        const _FeatureTile(
          icon: Icons.leaderboard_outlined,
          title: 'Rankings e atletas',
          description: 'Desempenho com critérios transparentes.',
          tag: 'Em preparação',
        ),
        const _FeatureTile(
          icon: Icons.verified_outlined,
          title: 'Validação',
          description: 'Cadastros e partidas com histórico auditável.',
          tag: 'Em preparação',
        ),
        const SizedBox(height: 12),
        const Text(
          'Esta é a primeira versão estrutural do aplicativo. Os recursos serão ativados conforme os módulos da API forem implementados.',
          style: TextStyle(color: Color(0xFF68756C), fontSize: 12, height: 1.45),
        ),
      ],
    );
  }
}

class _FeatureTile extends StatelessWidget {
  const _FeatureTile({
    required this.icon,
    required this.title,
    required this.description,
    required this.tag,
  });

  final IconData icon;
  final String title;
  final String description;
  final String tag;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 7),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: const Color(0xFFE8F4EC),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: const Color(0xFF147D4B)),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(description),
        ),
        trailing: const Icon(Icons.chevron_right, color: Color(0xFF89958D)),
      ),
    );
  }
}

class DirectoryPage extends StatelessWidget {
  const DirectoryPage({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 18),
          Text(title, style: const TextStyle(fontSize: 27, fontWeight: FontWeight.w800)),
          const SizedBox(height: 6),
          Text(subtitle, style: const TextStyle(color: Color(0xFF68756C))),
          const Spacer(),
          Center(
            child: Column(
              children: [
                Icon(icon, size: 58, color: const Color(0xFF147D4B)),
                const SizedBox(height: 14),
                const Text(
                  'Conteúdo em preparação',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 7),
                const Text(
                  'Esta área será conectada aos dados oficiais da plataforma quando o módulo correspondente estiver disponível.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Color(0xFF68756C), height: 1.4),
                ),
              ],
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 18),
          const Text('Meu perfil', style: TextStyle(fontSize: 27, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          const Text(
            'Entre na sua conta para acessar seus dados e recursos personalizados.',
            style: TextStyle(color: Color(0xFF68756C), height: 1.4),
          ),
          const SizedBox(height: 22),
          Card(
            child: ListTile(
              leading: const Icon(Icons.lock_outline, color: Color(0xFF147D4B)),
              title: const Text('Autenticação'),
              subtitle: const Text('Integração com a API será habilitada na próxima etapa.'),
            ),
          ),
        ],
      ),
    );
  }
}
