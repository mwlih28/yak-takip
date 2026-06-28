class Trip {
  final String id;
  final String status;
  final String? startLocation;
  final String? endLocation;
  final double? distanceKm;
  final double? fuelConsumedL;
  final double? fuelCostLocal;
  final double? efficiencyKmPerL;
  final double? co2EmittedKg;
  final String? aiSummary;
  final List<String> aiTips;
  final DateTime? startTime;
  final DateTime? endTime;
  final String? vehicleName;

  Trip({
    required this.id,
    required this.status,
    this.startLocation,
    this.endLocation,
    this.distanceKm,
    this.fuelConsumedL,
    this.fuelCostLocal,
    this.efficiencyKmPerL,
    this.co2EmittedKg,
    this.aiSummary,
    this.aiTips = const [],
    this.startTime,
    this.endTime,
    this.vehicleName,
  });

  factory Trip.fromJson(Map<String, dynamic> j) => Trip(
    id: j['id'],
    status: j['status'] ?? 'COMPLETED',
    startLocation: j['startLocation'],
    endLocation: j['endLocation'],
    distanceKm: (j['distanceKm'] as num?)?.toDouble(),
    fuelConsumedL: (j['fuelConsumedL'] as num?)?.toDouble(),
    fuelCostLocal: (j['fuelCostLocal'] as num?)?.toDouble(),
    efficiencyKmPerL: (j['efficiencyKmPerL'] as num?)?.toDouble(),
    co2EmittedKg: (j['co2EmittedKg'] as num?)?.toDouble(),
    aiSummary: j['aiSummary'],
    aiTips: (j['aiTips'] as List?)?.cast<String>() ?? [],
    startTime: j['startTime'] != null ? DateTime.parse(j['startTime']) : null,
    endTime: j['endTime'] != null ? DateTime.parse(j['endTime']) : null,
    vehicleName: j['vehicle'] != null
        ? '${j['vehicle']['year']} ${j['vehicle']['brand']} ${j['vehicle']['model']}'
        : null,
  );
}

class Vehicle {
  final String id;
  final String brand;
  final String model;
  final int year;
  final String fuelType;
  final double tankCapacity;
  final bool isDefault;

  Vehicle({
    required this.id,
    required this.brand,
    required this.model,
    required this.year,
    required this.fuelType,
    required this.tankCapacity,
    this.isDefault = false,
  });

  String get displayName => '$year $brand $model';

  factory Vehicle.fromJson(Map<String, dynamic> j) => Vehicle(
    id: j['id'],
    brand: j['brand'],
    model: j['model'],
    year: j['year'],
    fuelType: j['fuelType'] ?? 'GASOLINE',
    tankCapacity: (j['tankCapacity'] as num).toDouble(),
    isDefault: j['isDefault'] ?? false,
  );
}
