import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../models/trip.dart';
import '../widgets/glass_card.dart';
import 'trip_detail_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _stats;
  List<Trip> _recent = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final statsRes = await ApiService.get('/api/stats');
      final tripsRes = await ApiService.get('/api/trips?limit=5');
      if (!mounted) return;
      setState(() {
        _stats = statsRes;
        _recent = (tripsRes['trips'] as List? ?? []).map((t) => Trip.fromJson(t)).toList();
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().user;
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _load,
        backgroundColor: const Color(0xFF1E293B),
        color: const Color(0xFF3B82F6),
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Merhaba, ${(user?['name'] as String?)?.split(' ').first ?? ''} 👋',
                              style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                            const SizedBox(height: 4),
                            Text('Yakıt durumuna göz at', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13)),
                          ],
                        )),
                        Container(
                          width: 42, height: 42,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)]),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text((user?['name'] as String? ?? 'U')[0].toUpperCase(),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    if (_loading)
                      const Center(child: CircularProgressIndicator(color: Color(0xFF3B82F6)))
                    else ...[
                      _statsGrid(),
                      const SizedBox(height: 24),
                      const Text('Son Sürüşler', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 12),
                    ],
                  ],
                ),
              ),
            ),
            if (!_loading)
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                sliver: _recent.isEmpty
                    ? SliverToBoxAdapter(child: GlassCard(
                        child: Column(children: [
                          Icon(Icons.route_rounded, size: 40, color: Colors.white.withOpacity(0.2)),
                          const SizedBox(height: 12),
                          Text('Henüz sürüş yok', style: TextStyle(color: Colors.white.withOpacity(0.4))),
                        ]),
                      ))
                    : SliverList(delegate: SliverChildBuilderDelegate(
                        (ctx, i) => _TripCard(trip: _recent[i]),
                        childCount: _recent.length,
                      )),
              ),
          ],
        ),
      ),
    );
  }

  Widget _statsGrid() {
    final s = _stats;
    return GridView.count(
      crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.6,
      children: [
        _StatCard('Toplam Sürüş', '${s?['totalTrips'] ?? 0}', Icons.route_rounded, const Color(0xFF3B82F6)),
        _StatCard('Yakıt (L)', '${(s?['totalFuelL'] as num?)?.toStringAsFixed(1) ?? '0'}', Icons.local_gas_station_rounded, const Color(0xFF10B981)),
        _StatCard('Mesafe (km)', '${(s?['totalKm'] as num?)?.toStringAsFixed(0) ?? '0'}', Icons.speed_rounded, const Color(0xFF8B5CF6)),
        _StatCard('CO₂ (kg)', '${(s?['totalCo2'] as num?)?.toStringAsFixed(1) ?? '0'}', Icons.eco_rounded, const Color(0xFFF59E0B)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color color;
  const _StatCard(this.label, this.value, this.icon, this.color);

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, size: 16, color: color),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
              Text(label, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}

class _TripCard extends StatelessWidget {
  final Trip trip;
  const _TripCard({required this.trip});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => TripDetailScreen(trip: trip))),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        child: GlassCard(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(color: const Color(0xFF3B82F6).withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.route_rounded, color: Color(0xFF3B82F6), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(trip.startLocation ?? 'Bilinmiyor', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14), overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 3),
                  Text(
                    '${trip.distanceKm?.toStringAsFixed(1) ?? '?'} km · ${trip.fuelConsumedL?.toStringAsFixed(1) ?? '?'} L',
                    style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12),
                  ),
                ],
              )),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (trip.fuelCostLocal != null)
                    Text('${trip.fuelCostLocal!.toStringAsFixed(0)} ₺', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.w700, fontSize: 14)),
                  const SizedBox(height: 3),
                  Icon(Icons.chevron_right_rounded, color: Colors.white.withOpacity(0.2), size: 18),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
