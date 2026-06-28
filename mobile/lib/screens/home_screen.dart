import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import 'dashboard_screen.dart';
import 'trips_screen.dart';
import 'new_trip_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _index = 0;

  static const _screens = [DashboardScreen(), TripsScreen(), ProfileScreen()];
  static const _labels = ['Dashboard', 'Sürüşler', 'Profil'];
  static const _icons = [Icons.dashboard_rounded, Icons.route_rounded, Icons.person_rounded];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080D1A),
      body: IndexedStack(index: _index, children: _screens),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NewTripScreen())),
        backgroundColor: const Color(0xFF3B82F6),
        icon: const Icon(Icons.add_road_rounded, color: Colors.white),
        label: const Text('Yeni Sürüş', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        color: const Color(0xFF0D1525),
        shape: const CircularNotchedRectangle(),
        notchMargin: 8,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            ...[0, 1].map((i) => _navItem(i)),
            const SizedBox(width: 60),
            _navItem(2),
          ],
        ),
      ),
    );
  }

  Widget _navItem(int i) {
    final active = _index == i;
    return InkWell(
      onTap: () => setState(() => _index = i),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(_icons[i], color: active ? const Color(0xFF3B82F6) : Colors.white38, size: 22),
            const SizedBox(height: 3),
            Text(_labels[i], style: TextStyle(color: active ? const Color(0xFF3B82F6) : Colors.white38, fontSize: 11, fontWeight: active ? FontWeight.w600 : FontWeight.normal)),
          ],
        ),
      ),
    );
  }
}
