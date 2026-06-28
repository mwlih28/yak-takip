import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  static const _storage = FlutterSecureStorage();
  Map<String, dynamic>? _user;
  String? _token;

  Map<String, dynamic>? get user => _user;
  String? get token => _token;
  bool get isLoggedIn => _token != null && _user != null;

  Future<void> init() async {
    _token = await _storage.read(key: 'token');
    final userStr = await _storage.read(key: 'user');
    if (userStr != null) _user = jsonDecode(userStr);
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    try {
      final res = await ApiService.post('/api/auth/mobile', {
        'email': email,
        'password': password,
      });
      if (res['token'] != null) {
        _token = res['token'];
        _user = res['user'];
        await _storage.write(key: 'token', value: _token);
        await _storage.write(key: 'user', value: jsonEncode(_user));
        notifyListeners();
        return null;
      }
      return res['error'] ?? 'Giriş başarısız.';
    } catch (e) {
      return 'Bağlantı hatası: $e';
    }
  }

  Future<String?> register(Map<String, dynamic> data) async {
    try {
      final res = await ApiService.post('/api/register', data);
      if (res['userId'] != null) {
        return await login(data['email'], data['password']);
      }
      return res['error'] ?? 'Kayıt başarısız.';
    } catch (e) {
      return 'Bağlantı hatası: $e';
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    await _storage.deleteAll();
    notifyListeners();
  }
}
