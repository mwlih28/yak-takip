import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import '../models/trip.dart';
import '../widgets/glass_card.dart';

class NewTripScreen extends StatefulWidget {
  const NewTripScreen({super.key});

  @override
  State<NewTripScreen> createState() => _NewTripScreenState();
}

class _NewTripScreenState extends State<NewTripScreen> {
  List<Vehicle> _vehicles = [];
  String? _vehicleId;
  File? _gaugeImage;
  Map<String, dynamic>? _gaugeResult;
  final _locationCtrl = TextEditingController();
  final _odometerCtrl = TextEditingController();
  bool _analyzing = false;
  bool _starting = false;

  @override
  void initState() {
    super.initState();
    _loadVehicles();
  }

  Future<void> _loadVehicles() async {
    try {
      final res = await ApiService.get('/api/vehicles');
      if (!mounted) return;
      setState(() {
        _vehicles = (res as List).map((v) => Vehicle.fromJson(v)).toList();
        final def = _vehicles.firstWhere((v) => v.isDefault, orElse: () => _vehicles.first);
        _vehicleId = def.id;
      });
    } catch (_) {}
  }

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final xfile = await picker.pickImage(source: source, imageQuality: 80, maxWidth: 1280);
    if (xfile == null) return;
    setState(() { _gaugeImage = File(xfile.path); _gaugeResult = null; });
    await _analyzeGauge(xfile.path);
  }

  Future<void> _analyzeGauge(String path) async {
    setState(() => _analyzing = true);
    try {
      final res = await ApiService.postMultipart('/api/analyze-gauge', path, 'image');
      if (!mounted) return;
      setState(() => _gaugeResult = res);
    } catch (_) {
    } finally {
      if (mounted) setState(() => _analyzing = false);
    }
  }

  Future<void> _startTrip() async {
    if (_vehicleId == null || _gaugeResult == null || _locationCtrl.text.isEmpty) return;
    setState(() => _starting = true);
    try {
      final res = await ApiService.post('/api/trips', {
        'vehicleId': _vehicleId,
        'startGaugePercent': _gaugeResult!['percentFull'],
        'startGaugeUrl': _gaugeResult!['imageUrl'] ?? '',
        'startLocation': _locationCtrl.text.trim(),
        if (_odometerCtrl.text.isNotEmpty) 'startOdometer': double.tryParse(_odometerCtrl.text),
      });
      if (!mounted) return;
      if (res['tripId'] != null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sürüş başlatıldı! İyi yolculuklar 🚗'), backgroundColor: Colors.green));
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res['error'] ?? 'Hata'), backgroundColor: Colors.red.shade700));
      }
    } finally {
      if (mounted) setState(() => _starting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080D1A),
      appBar: AppBar(title: const Text('Sürüş Başlat')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Araç seç
            const Text('Araç', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            GlassCard(
              child: DropdownButton<String>(
                value: _vehicleId, isExpanded: true, underline: const SizedBox(),
                style: const TextStyle(color: Colors.white), dropdownColor: const Color(0xFF0F172A),
                hint: const Text('Araç seçin', style: TextStyle(color: Colors.white38)),
                items: _vehicles.map((v) => DropdownMenuItem(value: v.id, child: Text(v.displayName))).toList(),
                onChanged: (v) => setState(() => _vehicleId = v),
              ),
            ),
            const SizedBox(height: 20),

            // Gösterge fotoğrafı
            const Text('Başlangıç Göstergesi', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            GlassCard(
              padding: EdgeInsets.zero,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: _gaugeImage != null
                    ? Stack(children: [
                        Image.file(_gaugeImage!, width: double.infinity, height: 180, fit: BoxFit.cover),
                        if (_analyzing)
                          Container(
                            width: double.infinity, height: 180,
                            color: Colors.black54,
                            child: const Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                              CircularProgressIndicator(color: Color(0xFF3B82F6)),
                              SizedBox(height: 10),
                              Text('AI analiz ediyor...', style: TextStyle(color: Colors.white70)),
                            ])),
                          ),
                        if (_gaugeResult != null && !_analyzing)
                          Positioned(bottom: 0, left: 0, right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(colors: [Colors.transparent, Colors.black.withOpacity(0.8)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
                              ),
                              child: Row(children: [
                                const Icon(Icons.local_gas_station, color: Color(0xFF10B981), size: 18),
                                const SizedBox(width: 6),
                                Text('Yakıt: %${_gaugeResult!['percentFull']}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                                const SizedBox(width: 8),
                                Text('(${_gaugeResult!['confidence']})', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                              ]),
                            ),
                          ),
                      ])
                    : InkWell(
                        onTap: () => _showImagePicker(),
                        child: Container(
                          width: double.infinity, height: 160,
                          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                            Icon(Icons.camera_alt_rounded, size: 40, color: Colors.white.withOpacity(0.2)),
                            const SizedBox(height: 10),
                            Text('Fotoğraf çek veya seç', style: TextStyle(color: Colors.white.withOpacity(0.4))),
                          ]),
                        ),
                      ),
              ),
            ),
            if (_gaugeImage != null && !_analyzing)
              TextButton.icon(
                onPressed: _showImagePicker,
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('Yeniden çek'),
                style: TextButton.styleFrom(foregroundColor: Colors.white38),
              ),

            const SizedBox(height: 20),
            // Konum
            const Text('Başlangıç Konumu', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            TextField(
              controller: _locationCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Nereden çıkıyorsunuz?', hintStyle: TextStyle(color: Colors.white.withOpacity(0.25)),
                prefixIcon: const Icon(Icons.location_on_outlined, size: 18, color: Colors.white38),
                filled: true, fillColor: Colors.white.withOpacity(0.07),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF3B82F6))),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _odometerCtrl,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Kilometre sayacı (opsiyonel)', hintStyle: TextStyle(color: Colors.white.withOpacity(0.25)),
                prefixIcon: const Icon(Icons.speed_rounded, size: 18, color: Colors.white38),
                filled: true, fillColor: Colors.white.withOpacity(0.07),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF3B82F6))),
              ),
            ),
            const SizedBox(height: 28),
            GlassButton(
              label: 'Sürüşü Başlat',
              icon: Icons.play_arrow_rounded,
              loading: _starting,
              onTap: (_vehicleId != null && _gaugeResult != null && _locationCtrl.text.isNotEmpty) ? _startTrip : null,
            ),
          ],
        ),
      ),
    );
  }

  void _showImagePicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Text('Fotoğraf Seç', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.camera_alt_rounded, color: Color(0xFF3B82F6)),
              title: const Text('Kamera', style: TextStyle(color: Colors.white)),
              onTap: () { Navigator.pop(context); _pickImage(ImageSource.camera); },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_rounded, color: Color(0xFF8B5CF6)),
              title: const Text('Galeri', style: TextStyle(color: Colors.white)),
              onTap: () { Navigator.pop(context); _pickImage(ImageSource.gallery); },
            ),
          ]),
        ),
      ),
    );
  }
}
