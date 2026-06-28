CREATE TYPE "public"."fuel_type" AS ENUM('GASOLINE', 'DIESEL', 'LPG', 'ELECTRIC', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."maintenance_type" AS ENUM('OIL_CHANGE', 'TIRE_ROTATION', 'BRAKE_CHECK', 'AIR_FILTER', 'GENERAL_SERVICE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "fuel_prices" (
	"id" text PRIMARY KEY NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"country_name" varchar(100) NOT NULL,
	"fuel_type" "fuel_type" DEFAULT 'GASOLINE' NOT NULL,
	"price_per_l" real NOT NULL,
	"currency" varchar(10) NOT NULL,
	"source" varchar(50),
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"type" "maintenance_type" NOT NULL,
	"description" text,
	"odometer" integer,
	"cost" real,
	"performed_at" timestamp NOT NULL,
	"next_due_km" integer,
	"next_due_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"low_fuel_alert_enabled" boolean DEFAULT true NOT NULL,
	"low_fuel_threshold" integer DEFAULT 20 NOT NULL,
	"maintenance_reminders" boolean DEFAULT true NOT NULL,
	"weekly_report" boolean DEFAULT true NOT NULL,
	"push_subscription" json,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"session_token" text NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"status" "trip_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"start_gauge_percent" real,
	"start_gauge_url" text,
	"start_location" text,
	"start_lat" real,
	"start_lng" real,
	"start_time" timestamp,
	"start_odometer" real,
	"end_gauge_percent" real,
	"end_gauge_url" text,
	"end_location" text,
	"end_lat" real,
	"end_lng" real,
	"end_time" timestamp,
	"end_odometer" real,
	"distance_km" real,
	"fuel_consumed_l" real,
	"fuel_cost_local" real,
	"fuel_price_per_liter" real,
	"efficiency_km_per_l" real,
	"co2_emitted_kg" real,
	"ai_summary" text,
	"ai_efficiency_rating" varchar(20),
	"ai_tips" json DEFAULT '[]'::json,
	"ai_co2_context" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"country_name" varchar(100) NOT NULL,
	"fuel_price" real NOT NULL,
	"currency" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"brand" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"fuel_type" "fuel_type" DEFAULT 'GASOLINE' NOT NULL,
	"tank_capacity" real NOT NULL,
	"avg_consumption" real,
	"plate_number" varchar(20),
	"color" varchar(50),
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fuel_prices_country_idx" ON "fuel_prices" USING btree ("country_code","fuel_type");--> statement-breakpoint
CREATE INDEX "trips_user_id_idx" ON "trips" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trips_vehicle_id_idx" ON "trips" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "vehicles_user_id_idx" ON "vehicles" USING btree ("user_id");