import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../widgets/glass_card.dart';
import 'home_screen.dart';

const _brands = ['Audi','BMW','Citroën','Dacia','Fiat','Ford','Honda','Hyundai','Kia','Mercedes-Benz','Nissan','Opel','Peugeot','Renault','SEAT','Škoda','Tesla','Toyota','Volkswagen','Volvo'];
const _fuelTypes = ['GASOLINE','DIESEL','LPG','HYBRID','ELECTRIC'];
const _fuelLabels = {'GASOLINE':'⛽ Benzin','DIESEL':'🛢️ Dizel','LPG':'🔵 LPG','HYBRID':'🍃 Hibrit','ELECTRIC':'⚡ Elektrik'};

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  int _step = 0;
  bool _loading = false;

  // Step 1
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  // Step 2
  String _currency = 'TRY';
  double _fuelPrice = 44.72;

  // Step 3
  String _brand = 'Toyota';
  final _modelCtrl = TextEditingController();
  int _year = DateTime.now().year;
  String _fuelType = 'GASOLINE';
  double _tankCapacity = 50;

  Future<void> _submit() async {
    setState(() => _loading = true);
    final err = await context.read<AuthService>().register({
      'name': _nameCtrl.text.trim(),
      'email': _emailCtrl.text.trim(),
      'password': _passCtrl.text,
      'countryCode': 'TR',
      'countryName': 'Türkiye',
      'fuelPrice': _fuelPrice,
      'currency': _currency,
      'vehicle': {
        'brand': _brand,
        'model': _modelCtrl.text.trim(),
        'year': _year,
        'fuelType': _fuelType,
        'tankCapacity': _tankCapacity,
      },
    });
    if (!mounted) return;
    setState(() => _loading = false);
    if (err != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err), backgroundColor: Colors.red.shade700));
    } else {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HomeScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080D1A),
      appBar: AppBar(title: const Text('Kayıt Ol')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Step dots
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(3, (i) => AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 5),
                width: i == _step ? 28 : 10,
                height: 10,
                decoration: BoxDecoration(
                  color: i <= _step ? const Color(0xFF3B82F6) : Colors.white12,
                  borderRadius: BorderRadius.circular(5),
                ),
              )),
            ),
            const SizedBox(height: 28),
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _buildStep(_step),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                if (_step > 0)
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _step--),
                      child: GlassCard(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        child: const Center(child: Text('Geri', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w600))),
                      ),
                    ),
                  ),
                if (_step > 0) const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: GlassButton(
                    label: _step < 2 ? 'Devam Et' : 'Hesap Oluştur',
                    icon: _step < 2 ? Icons.arrow_forward : Icons.check,
                    loading: _loading,
                    gradient: _step < 2
                        ? const [Color(0xFF3B82F6), Color(0xFF2563EB)]
                        : const [Color(0xFF10B981), Color(0xFF059669)],
                    onTap: _step < 2 ? () => setState(() => _step++) : _submit,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep(int s) {
    if (s == 0) {
      return Column(key: const ValueKey(0), crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Hesap Bilgileri', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
        const SizedBox(height: 20),
        _field(_nameCtrl, 'Ad Soyad', Icons.person_outline),
        const SizedBox(height: 12),
        _field(_emailCtrl, 'E-posta', Icons.email_outlined, keyboardType: TextInputType.emailAddress),
        const SizedBox(height: 12),
        _field(_passCtrl, 'Şifre (en az 6 karakter)', Icons.lock_outline, obscure: true),
      ]);
    }
    if (s == 1) {
      return Column(key: const ValueKey(1), crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Yakıt Fiyatı', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Text('Ülkenizdeki litre fiyatını girin', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 14)),
        const SizedBox(height: 24),
        GlassCard(child: Column(children: [
          Row(children: [
            Expanded(child: TextFormField(
              initialValue: _fuelPrice.toString(),
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700),
              onChanged: (v) => _fuelPrice = double.tryParse(v) ?? _fuelPrice,
              decoration: const InputDecoration(border: InputBorder.none, hintText: '0.00', hintStyle: TextStyle(color: Colors.white24)),
            )),
            GlassCard(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              child: DropdownButton<String>(
                value: _currency,
                underline: const SizedBox(),
                style: const TextStyle(color: Colors.white),
                dropdownColor: const Color(0xFF0F172A),
                items: ['TRY','EUR','USD','GBP'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) => setState(() => _currency = v!),
              ),
            ),
          ]),
        ])),
      ]);
    }
    return Column(key: const ValueKey(2), crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Araç Bilgileri', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
      const SizedBox(height: 20),
      GlassCard(child: DropdownButton<String>(
        value: _brand, isExpanded: true, underline: const SizedBox(),
        style: const TextStyle(color: Colors.white), dropdownColor: const Color(0xFF0F172A),
        items: _brands.map((b) => DropdownMenuItem(value: b, child: Text(b))).toList(),
        onChanged: (v) => setState(() => _brand = v!),
      )),
      const SizedBox(height: 12),
      _field(_modelCtrl, 'Model (ör: Corolla)', Icons.directions_car_outlined),
      const SizedBox(height: 12),
      Row(children: [
        Expanded(child: GlassCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Yıl', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
          Text('$_year', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 18)),
          Slider(value: _year.toDouble(), min: 1990, max: (DateTime.now().year + 1).toDouble(), divisions: DateTime.now().year - 1988, activeColor: const Color(0xFF3B82F6), onChanged: (v) => setState(() => _year = v.round())),
        ]))),
        const SizedBox(width: 12),
        Expanded(child: GlassCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Depo (L)', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
          Text('${_tankCapacity.round()} L', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 18)),
          Slider(value: _tankCapacity, min: 20, max: 120, activeColor: const Color(0xFF3B82F6), onChanged: (v) => setState(() => _tankCapacity = v)),
        ]))),
      ]),
      const SizedBox(height: 12),
      GlassCard(child: DropdownButton<String>(
        value: _fuelType, isExpanded: true, underline: const SizedBox(),
        style: const TextStyle(color: Colors.white), dropdownColor: const Color(0xFF0F172A),
        items: _fuelTypes.map((f) => DropdownMenuItem(value: f, child: Text(_fuelLabels[f]!))).toList(),
        onChanged: (v) => setState(() => _fuelType = v!),
      )),
    ]);
  }

  Widget _field(TextEditingController ctrl, String hint, IconData icon, {bool obscure = false, TextInputType? keyboardType}) {
    return TextField(
      controller: ctrl, obscureText: obscure, keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white, fontSize: 15),
      decoration: InputDecoration(
        hintText: hint, hintStyle: TextStyle(color: Colors.white.withOpacity(0.25)),
        prefixIcon: Icon(icon, size: 18, color: Colors.white38),
        filled: true, fillColor: Colors.white.withOpacity(0.07),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF3B82F6))),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      ),
    );
  }
}
