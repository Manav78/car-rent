-- ==========================================================
-- Flyway Migration: V7__add_customer_booking_fields.sql
-- Description: Add customer booking fields (phone number, trip type, passenger count, agreed amount, rejection reason) to bookings table
-- ==========================================================

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone_number VARCHAR(20);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_type VARCHAR(30);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_count INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_agreed_amount NUMERIC(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);
