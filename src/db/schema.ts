import {
  pgTable, text, varchar, real, integer, boolean,
  timestamp, pgEnum, json, index, unique
} from "drizzle-orm/pg-core"

// ─── Enums ────────────────────────────────────────────────────────────────────

export const fuelTypeEnum = pgEnum("fuel_type", [
  "GASOLINE", "DIESEL", "LPG", "ELECTRIC", "HYBRID",
])

export const tripStatusEnum = pgEnum("trip_status", [
  "IN_PROGRESS", "COMPLETED", "CANCELLED",
])

export const maintenanceTypeEnum = pgEnum("maintenance_type", [
  "OIL_CHANGE", "TIRE_ROTATION", "BRAKE_CHECK", "AIR_FILTER", "GENERAL_SERVICE", "OTHER",
])

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  countryName: varchar("country_name", { length: 100 }).notNull(),
  fuelPrice: real("fuel_price").notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
})

// ─── Vehicles ────────────────────────────────────────────────────────────────

export const vehicles = pgTable("vehicles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  fuelType: fuelTypeEnum("fuel_type").notNull().default("GASOLINE"),
  tankCapacity: real("tank_capacity").notNull(),
  avgConsumption: real("avg_consumption"),
  plateNumber: varchar("plate_number", { length: 20 }),
  color: varchar("color", { length: 50 }),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("vehicles_user_id_idx").on(t.userId)])

// ─── Trips ────────────────────────────────────────────────────────────────────

export const trips = pgTable("trips", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: text("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  status: tripStatusEnum("status").notNull().default("IN_PROGRESS"),

  // Before trip
  startGaugePercent: real("start_gauge_percent"),
  startGaugeUrl: text("start_gauge_url"),
  startLocation: text("start_location"),
  startLat: real("start_lat"),
  startLng: real("start_lng"),
  startTime: timestamp("start_time"),
  startOdometer: real("start_odometer"),

  // After trip
  endGaugePercent: real("end_gauge_percent"),
  endGaugeUrl: text("end_gauge_url"),
  endLocation: text("end_location"),
  endLat: real("end_lat"),
  endLng: real("end_lng"),
  endTime: timestamp("end_time"),
  endOdometer: real("end_odometer"),

  // Calculated
  distanceKm: real("distance_km"),
  fuelConsumedL: real("fuel_consumed_l"),
  fuelCostLocal: real("fuel_cost_local"),
  fuelPricePerLiter: real("fuel_price_per_liter"),
  efficiencyKmPerL: real("efficiency_km_per_l"),
  co2EmittedKg: real("co2_emitted_kg"),

  // AI
  aiSummary: text("ai_summary"),
  aiEfficiencyRating: varchar("ai_efficiency_rating", { length: 20 }),
  aiTips: json("ai_tips").$type<string[]>().default([]),
  aiCo2Context: text("ai_co2_context"),

  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("trips_user_id_idx").on(t.userId),
  index("trips_vehicle_id_idx").on(t.vehicleId),
])

// ─── Fuel Prices ──────────────────────────────────────────────────────────────

export const fuelPrices = pgTable("fuel_prices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  countryName: varchar("country_name", { length: 100 }).notNull(),
  fuelType: fuelTypeEnum("fuel_type").notNull().default("GASOLINE"),
  pricePerL: real("price_per_l").notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  source: varchar("source", { length: 50 }),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
}, (t) => [index("fuel_prices_country_idx").on(t.countryCode, t.fuelType)])

// ─── Maintenance ──────────────────────────────────────────────────────────────

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  vehicleId: text("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  type: maintenanceTypeEnum("type").notNull(),
  description: text("description"),
  odometer: integer("odometer"),
  cost: real("cost"),
  performedAt: timestamp("performed_at").notNull(),
  nextDueKm: integer("next_due_km"),
  nextDueDate: timestamp("next_due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ─── Notification Preferences ─────────────────────────────────────────────────

export const notificationPreferences = pgTable("notification_preferences", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  lowFuelAlertEnabled: boolean("low_fuel_alert_enabled").notNull().default(true),
  lowFuelThreshold: integer("low_fuel_threshold").notNull().default(20),
  maintenanceReminders: boolean("maintenance_reminders").notNull().default(true),
  weeklyReport: boolean("weekly_report").notNull().default(true),
  pushSubscription: json("push_subscription"),
})

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Vehicle = typeof vehicles.$inferSelect
export type NewVehicle = typeof vehicles.$inferInsert
export type Trip = typeof trips.$inferSelect
export type NewTrip = typeof trips.$inferInsert
export type FuelPrice = typeof fuelPrices.$inferSelect
