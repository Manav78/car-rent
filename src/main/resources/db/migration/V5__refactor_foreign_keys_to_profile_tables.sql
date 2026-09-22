-- =============================================================================
-- Flyway Migration: V5__refactor_foreign_keys_to_profile_tables.sql
-- Description: Transition bookings and vehicles foreign keys from users.id
--              to domain profile primary keys (driver_profiles, customer_profiles, owner_profiles)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. VEHICLES: Transition owner_id from users.id -> owner_profiles.id
-- -----------------------------------------------------------------------------
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS fk_vehicles_owner;

UPDATE vehicles v
SET owner_id = op.id
FROM owner_profiles op
WHERE v.owner_id = op.user_id;

ALTER TABLE vehicles
ADD CONSTRAINT fk_vehicles_owner
FOREIGN KEY (owner_id) REFERENCES owner_profiles (id) ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- 2. BOOKINGS: Transition customer_id from users.id -> customer_profiles.id
-- -----------------------------------------------------------------------------
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_customer;

UPDATE bookings b
SET customer_id = cp.id
FROM customer_profiles cp
WHERE b.customer_id = cp.user_id;

ALTER TABLE bookings
ADD CONSTRAINT fk_bookings_customer
FOREIGN KEY (customer_id) REFERENCES customer_profiles (id) ON DELETE RESTRICT;

-- -----------------------------------------------------------------------------
-- 3. BOOKINGS: Transition driver_id from users.id -> driver_profiles.id
-- -----------------------------------------------------------------------------
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_driver;

UPDATE bookings b
SET driver_id = dp.id
FROM driver_profiles dp
WHERE b.driver_id = dp.user_id;

ALTER TABLE bookings
ADD CONSTRAINT fk_bookings_driver
FOREIGN KEY (driver_id) REFERENCES driver_profiles (id) ON DELETE SET NULL;
