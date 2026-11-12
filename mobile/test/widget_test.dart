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
}
