-- ==========================================================
-- Flyway Migration: V8__align_vehicle_and_booking_with_srs.sql
-- Description: Align vehicle and booking schema with SRS
-- ==========================================================

-- 1. Update vehicles table: rename make -> brand, add price_per_km, drop legacy fields
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicles' AND column_name = 'make'
    ) THEN
        ALTER TABLE vehicles RENAME COLUMN make TO brand;
    END IF;
END $$;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS brand VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS price_per_km INTEGER NOT NULL DEFAULT 0;
ALTER TABLE vehicles DROP COLUMN IF EXISTS daily_rate;
ALTER TABLE vehicles DROP COLUMN IF EXISTS transmission;
ALTER TABLE vehicles DROP COLUMN IF EXISTS image_url;

-- 2. Create vehicle_images table for multiple image references
CREATE TABLE IF NOT EXISTS vehicle_images (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_vehicle_images_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);

-- 3. Update bookings table: remove daily_rate, total_amount, total_days, alter final_agreed_amount to INTEGER
ALTER TABLE bookings DROP COLUMN IF EXISTS daily_rate;
ALTER TABLE bookings DROP COLUMN IF EXISTS total_amount;
ALTER TABLE bookings DROP COLUMN IF EXISTS total_days;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_agreed_amount INTEGER;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'final_agreed_amount'
    ) THEN
        ALTER TABLE bookings ALTER COLUMN final_agreed_amount TYPE INTEGER USING final_agreed_amount::INTEGER;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'dropoff_location'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'drop_location'
    ) THEN
        ALTER TABLE bookings RENAME COLUMN dropoff_location TO drop_location;
    END IF;
END $$;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS drop_location VARCHAR(150);
