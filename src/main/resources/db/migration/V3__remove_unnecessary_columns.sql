-- Remove unnecessary columns from driver_profiles
ALTER TABLE driver_profiles DROP COLUMN IF EXISTS rating;
ALTER TABLE driver_profiles DROP COLUMN IF EXISTS total_trips;
ALTER TABLE driver_profiles DROP COLUMN IF EXISTS willing_to_drive;
ALTER TABLE driver_profiles DROP COLUMN IF EXISTS years_of_experience;

-- Remove price_per_km from bookings and set default status to PENDING
ALTER TABLE bookings DROP COLUMN IF EXISTS price_per_km;
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'PENDING';

-- Set default status for vehicles to PENDING
ALTER TABLE vehicles ALTER COLUMN status SET DEFAULT 'PENDING';
