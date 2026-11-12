import 'package:flutter_test/flutter_test.dart';
import 'package:futvarzea/main.dart';

void main() {
  testWidgets('exibe a identidade do FutVárzea', (tester) async {
    await tester.pumpWidget(const FutVarzeaApp());
    expect(find.text('FutVárzea'), findsOneWidget);
    expect(find.text('Explore a plataforma'), findsOneWidget);
  });

  testWidgets('navega entre as áreas principais', (tester) async {
    await tester.pumpWidget(const FutVarzeaApp());
    await tester.tap(find.text('Babas'));
    await tester.pumpAndSettle();
    expect(find.text('Conteúdo em preparação'), findsOneWidget);
  });

  testWidgets('exibe os perfis e abre detalhes do avaliador', (tester) async {
    await tester.pumpWidget(const FutVarzeaApp());
    await tester.tap(find.text('Perfil'));
    await tester.pumpAndSettle();
    expect(find.text('Jogador / atleta'), findsOneWidget);
    expect(find.text('Administrador de time'), findsOneWidget);
    expect(find.text('Responsável por baba'), findsOneWidget);
    expect(find.text('Organizador de torneio'), findsOneWidget);
    await tester.tap(find.text('Avaliador'));
    await tester.pumpAndSettle();
    expect(find.text('Exige candidatura e aprovação'), findsNothing);
    expect(find.textContaining('15 avaliadores ativos'), findsOneWidget);
  });
}
