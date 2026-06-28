import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/trip.dart';
import '../widgets/glass_card.dart';
import 'trip_detail_screen.dart';

class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  List<Trip> _trips = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.get('/api/trips?limit=50');
      if (!mounted) return;
      setState(() {
        _trips = (res['trips'] as List? ?? []).map((t) => Trip.fromJson(t)).toList();
        _loading = false;
      });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _load,
        color: const Color(0xFF3B82F6),
        backgroundColor: const Color(0xFF1E293B),
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
              sliver: SliverToBoxAdapter(
                child: Text('Sürüş Geçmişi', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
              ),
            ),
            if (_loading)
              const SliverFillRemaining(child: Center(child: CircularProgressIndicator(color: Color(0xFF3B82F6))))
            else if (_trips.isEmpty)
              SliverFillRemaining(
                child: Center(child: GlassCard(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Icon(Icons.route_rounded, size: 48, color: Colors.white.withOpacity(0.2)),
                    const SizedBox(height: 12),
                    Text('Henüz sürüş yok', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 16)),
                  ]),
                )),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                sliver: SliverList(delegate: SliverChildBuilderDelegate(
                  (ctx, i) => _TripItem(trip: _trips[i]),
                  childCount: _trips.length,
                )),
              ),
          ],
        ),
      ),
    );
  }
}

class _TripItem extends StatelessWidget {
  final Trip trip;
  const _TripItem({required this.trip});

  @override
  Widget build(BuildContext context) {
    final rating = _rating(trip.efficiencyKmPerL);
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => TripDetailScreen(trip: trip))),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        child: GlassCard(
          child: Row(children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(color: rating.$2.withOpacity(0.15), borderRadius: BorderRadius.circular(14)),
              child: Icon(Icons.route_rounded, color: rating.$2, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(trip.startLocation ?? 'Bilinmiyor', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis),
              const SizedBox(height: 3),
              Row(children: [
                _chip('${trip.distanceKm?.toStringAsFixed(1) ?? '?'} km', const Color(0xFF3B82F6)),
                const SizedBox(width: 6),
                _chip('${trip.fuelConsumedL?.toStringAsFixed(1) ?? '?'} L', const Color(0xFF8B5CF6)),
              ]),
            ])),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              if (trip.fuelCostLocal != null)
                Text('${trip.fuelCostLocal!.toStringAsFixed(0)} ₺', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.w700, fontSize: 15)),
              Text(rating.$1, style: TextStyle(color: rating.$2, fontSize: 11, fontWeight: FontWeight.w600)),
            ]),
          ]),
        ),
      ),
    );
  }

  Widget _chip(String label, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(6)),
    child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
  );

  (String, Color) _rating(double? kmL) {
    if (kmL == null) return ('—', Colors.white38);
    if (kmL >= 15) return ('Çok İyi', const Color(0xFF10B981));
    if (kmL >= 12) return ('İyi', const Color(0xFF3B82F6));
    if (kmL >= 9) return ('Orta', const Color(0xFFF59E0B));
    return ('Kötü', const Color(0xFFEF4444));
  }
}
