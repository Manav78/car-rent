-- ==========================================================
-- Flyway Migration: V4__align_status_and_approval_enums.sql
-- Description: Align driver and vehicle status/approval defaults and data
-- ==========================================================

-- 1. Update column defaults on driver_profiles
ALTER TABLE driver_profiles ALTER COLUMN status SET DEFAULT 'INACTIVE';
ALTER TABLE driver_profiles ALTER COLUMN approval_status SET DEFAULT 'PENDING';

-- 2. Update column defaults on vehicles
ALTER TABLE vehicles ALTER COLUMN status SET DEFAULT 'INACTIVE';
ALTER TABLE vehicles ALTER COLUMN approval_status SET DEFAULT 'PENDING';

-- 3. Data migration for driver_profiles:
-- Map legacy AVAILABLE -> ACTIVE
UPDATE driver_profiles
SET status = 'ACTIVE'
WHERE status = 'AVAILABLE';

-- Map legacy OFFLINE -> INACTIVE with mandatory inactive_reason
UPDATE driver_profiles
SET status = 'INACTIVE',
    inactive_reason = COALESCE(inactive_reason, 'Previously marked OFFLINE')
WHERE status = 'OFFLINE';

-- Map legacy PENDING in operational status to INACTIVE and ensure approval_status is PENDING
UPDATE driver_profiles
SET status = 'INACTIVE',
    approval_status = 'PENDING',
    inactive_reason = COALESCE(inactive_reason, 'Pending Super Admin approval')
WHERE status = 'PENDING';

-- Map legacy REJECTED in operational status to INACTIVE and ensure approval_status is REJECTED
UPDATE driver_profiles
SET status = 'INACTIVE',
    approval_status = 'REJECTED',
    inactive_reason = COALESCE(inactive_reason, 'Rejected by Super Admin')
WHERE status = 'REJECTED';

-- Map legacy APPROVED in operational status to ACTIVE and ensure approval_status is APPROVED
UPDATE driver_profiles
SET status = 'ACTIVE',
    approval_status = 'APPROVED',
    inactive_reason = NULL
WHERE status = 'APPROVED';

-- 4. Data migration for vehicles:
-- Map legacy PENDING in operational status to INACTIVE and ensure approval_status is PENDING
UPDATE vehicles
SET status = 'INACTIVE',
    approval_status = 'PENDING'
WHERE status = 'PENDING';

-- Map legacy REJECTED in operational status to INACTIVE and ensure approval_status is REJECTED
UPDATE vehicles
SET status = 'INACTIVE',
    approval_status = 'REJECTED'
WHERE status = 'REJECTED';

-- Map legacy APPROVED in operational status to AVAILABLE and ensure approval_status is APPROVED
UPDATE vehicles
SET status = 'AVAILABLE',
    approval_status = 'APPROVED'
WHERE status = 'APPROVED';

-- 5. Synchronize vehicle booking lock:
-- Vehicles with active bookings in PENDING or CONFIRMED state must be BOOKED
UPDATE vehicles
SET status = 'BOOKED'
WHERE id IN (
    SELECT DISTINCT vehicle_id
    FROM bookings
    WHERE status IN ('PENDING', 'CONFIRMED')
);

-- Vehicles with bookings in IN_PROGRESS state must be ON_TRIP
UPDATE vehicles
SET status = 'ON_TRIP'
WHERE id IN (
    SELECT DISTINCT vehicle_id
    FROM bookings
    WHERE status = 'IN_PROGRESS'
);
