-- ==========================================================
-- Flyway Migration: V3__drop_not_null_on_legacy_columns.sql
-- Description: Drop NOT NULL constraint on legacy columns
-- ==========================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE users ALTER COLUMN name DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
    END IF;
END $$;
