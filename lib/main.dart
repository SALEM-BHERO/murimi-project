import 'package:flutter/material.dart';
import 'package:murimi_app/theme/app_theme.dart';
import 'package:murimi_app/screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MurimiApp());
}

class MurimiApp extends StatelessWidget {
  const MurimiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Murimi',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const LoginScreen(),
    );
  }
}
