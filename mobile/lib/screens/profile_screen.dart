import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../widgets/glass_card.dart';
import 'login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().user;
    final name = user?['name'] as String? ?? '';
    final email = user?['email'] as String? ?? '';

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 12),
            // Avatar
            Container(
              width: 72, height: 72,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)]),
                borderRadius: BorderRadius.circular(22),
              ),
              child: Center(child: Text(name.isNotEmpty ? name[0].toUpperCase() : 'U', style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800))),
            ),
            const SizedBox(height: 12),
            Text(name, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
            Text(email, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13)),
            const SizedBox(height: 28),

            GlassCard(
              child: Column(children: [
                _item(Icons.directions_car_rounded, 'Araçlarım', () {}),
                _divider(),
                _item(Icons.local_gas_station_rounded, 'Yakıt Fiyatı Güncelle', () {}),
                _divider(),
                _item(Icons.notifications_rounded, 'Bildirimler', () {}),
              ]),
            ),
            const SizedBox(height: 16),
            GlassCard(
              borderColor: const Color(0xFFEF4444).withOpacity(0.3),
              child: _item(Icons.logout_rounded, 'Çıkış Yap', () async {
                await context.read<AuthService>().logout();
                if (context.mounted) {
                  Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginScreen()), (_) => false);
                }
              }, color: const Color(0xFFEF4444)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _item(IconData icon, String label, VoidCallback onTap, {Color color = Colors.white}) => ListTile(
    contentPadding: EdgeInsets.zero,
    leading: Icon(icon, color: color == Colors.white ? const Color(0xFF3B82F6) : color, size: 20),
    title: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w500, fontSize: 14)),
    trailing: color == Colors.white ? Icon(Icons.chevron_right_rounded, color: Colors.white.withOpacity(0.2), size: 18) : null,
    onTap: onTap,
  );

  Widget _divider() => Divider(color: Colors.white.withOpacity(0.06), height: 1);
}
