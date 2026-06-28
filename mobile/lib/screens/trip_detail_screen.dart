import 'package:flutter/material.dart';
import '../models/trip.dart';
import '../widgets/glass_card.dart';

class TripDetailScreen extends StatelessWidget {
  final Trip trip;
  const TripDetailScreen({super.key, required this.trip});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080D1A),
      appBar: AppBar(title: const Text('Sürüş Detayı')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Stats
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.4,
              children: [
                _statCard('Mesafe', '${trip.distanceKm?.toStringAsFixed(1) ?? '?'} km', Icons.route_rounded, const Color(0xFF3B82F6)),
                _statCard('Yakıt', '${trip.fuelConsumedL?.toStringAsFixed(2) ?? '?'} L', Icons.local_gas_station_rounded, const Color(0xFF8B5CF6)),
                _statCard('Maliyet', '${trip.fuelCostLocal?.toStringAsFixed(0) ?? '?'} ₺', Icons.payments_rounded, const Color(0xFF10B981)),
                _statCard('CO₂', '${trip.co2EmittedKg?.toStringAsFixed(2) ?? '?'} kg', Icons.eco_rounded, const Color(0xFFF59E0B)),
              ],
            ),
            const SizedBox(height: 16),

            // Route
            GlassCard(
              child: Column(children: [
                _routeRow(Icons.trip_origin_rounded, 'Başlangıç', trip.startLocation ?? '—', const Color(0xFF3B82F6)),
                Padding(padding: const EdgeInsets.only(left: 12), child: Container(width: 1, height: 20, color: Colors.white12)),
                _routeRow(Icons.location_on_rounded, 'Bitiş', trip.endLocation ?? '—', const Color(0xFF10B981)),
              ]),
            ),
            const SizedBox(height: 16),

            // AI Summary
            if (trip.aiSummary != null && trip.aiSummary!.isNotEmpty)
              GlassCard(
                borderColor: const Color(0xFF3B82F6).withOpacity(0.2),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: const [
                    Icon(Icons.auto_awesome_rounded, color: Color(0xFF3B82F6), size: 16),
                    SizedBox(width: 6),
                    Text('AI Analizi', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 12, fontWeight: FontWeight.w700)),
                  ]),
                  const SizedBox(height: 10),
                  Text(trip.aiSummary!, style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13, height: 1.6)),
                  if (trip.aiTips.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    ...trip.aiTips.map((tip) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('• ', style: TextStyle(color: Color(0xFF60A5FA), fontWeight: FontWeight.w700)),
                        Expanded(child: Text(tip, style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 13))),
                      ]),
                    )),
                  ],
                ]),
              ),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color) => GlassCard(
    padding: const EdgeInsets.all(14),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Icon(icon, color: color, size: 20),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
        Text(label, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
      ]),
    ]),
  );

  Widget _routeRow(IconData icon, String label, String value, Color color) => Row(children: [
    Icon(icon, color: color, size: 18),
    const SizedBox(width: 10),
    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
      Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13), overflow: TextOverflow.ellipsis),
    ])),
  ]);
}
