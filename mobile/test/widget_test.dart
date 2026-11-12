import 'package:flutter/material.dart';
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
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const FutVarzeaApp());
    await tester.tap(find.text('Perfil'));
    await tester.pumpAndSettle();

    for (final label in [
      'Jogador / atleta',
      'Avaliador',
      'Administrador de time',
      'Responsável por baba',
      'Organizador de torneio',
      'Administrador da plataforma',
    ]) {
      await tester.scrollUntilVisible(
        find.text(label),
        300,
        scrollable: find.byType(Scrollable).last,
      );
      expect(find.text(label), findsOneWidget);
    }

    await tester.scrollUntilVisible(
      find.text('Avaliador'),
      300,
      scrollable: find.byType(Scrollable).last,
    );
    await tester.tap(find.text('Avaliador'));
    await tester.pumpAndSettle();
    expect(find.text('Permissões previstas'), findsOneWidget);
    expect(find.textContaining('15 avaliadores ativos'), findsOneWidget);
  });
}
