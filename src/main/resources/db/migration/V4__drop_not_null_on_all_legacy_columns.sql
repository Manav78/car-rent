-- ==========================================================
-- Flyway Migration: V4__drop_not_null_on_all_legacy_columns.sql
-- Description: Drop NOT NULL on legacy status column
-- ==========================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ALTER COLUMN status DROP NOT NULL;
    END IF;
END $$;
