-- ==========================================================
-- Flyway Migration: V6__create_car_rental_tables.sql
-- Description: Create tables for customer, owner, driver profiles, vehicles, bookings, and notifications
-- ==========================================================

-- Customer profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    address VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    CONSTRAINT fk_customer_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS address VARCHAR(255);
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- Owner profiles table
CREATE TABLE IF NOT EXISTS owner_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(100),
    tax_number VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT fk_owner_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
ALTER TABLE owner_profiles ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE owner_profiles ADD COLUMN IF NOT EXISTS company_name VARCHAR(100);
ALTER TABLE owner_profiles ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50);
ALTER TABLE owner_profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- Driver profiles table
CREATE TABLE IF NOT EXISTS driver_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    license_number VARCHAR(50),
    license_expiry_date DATE,
    years_of_experience INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'AVAILABLE' NOT NULL,
    rating DOUBLE PRECISION DEFAULT 5.0,
    total_trips INTEGER DEFAULT 0,
    CONSTRAINT fk_driver_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS license_number VARCHAR(50);
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS license_expiry_date DATE;
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'AVAILABLE';
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION DEFAULT 5.0;
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS total_trips INTEGER DEFAULT 0;

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    license_plate VARCHAR(30) NOT NULL UNIQUE,
    daily_rate NUMERIC(10, 2) NOT NULL,
    seating_capacity INTEGER NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL,
    fuel_type VARCHAR(30) NOT NULL,
    transmission VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'AVAILABLE' NOT NULL,
    location VARCHAR(100),
    image_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_id BIGINT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS make VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS model VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS license_plate VARCHAR(30);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS daily_rate NUMERIC(10, 2);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS seating_capacity INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(30);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(30);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transmission VARCHAR(30);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'AVAILABLE';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    driver_id BIGINT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_location VARCHAR(150) NOT NULL,
    dropoff_location VARCHAR(150) NOT NULL,
    total_days INTEGER NOT NULL,
    daily_rate NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    booking_status VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_driver FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_id BIGINT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_id BIGINT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS driver_id BIGINT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(150);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dropoff_location VARCHAR(150);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_days INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS daily_rate NUMERIC(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_status VARCHAR(30) DEFAULT 'PENDING';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'PENDING';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'UNREAD' NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR(150);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(30);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'UNREAD';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_id ON vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
