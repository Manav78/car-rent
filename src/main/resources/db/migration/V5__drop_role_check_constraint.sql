-- ==========================================================
-- Flyway Migration: V5__drop_role_check_constraint.sql
-- Description: Drop legacy check constraints on users table
-- ==========================================================

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
