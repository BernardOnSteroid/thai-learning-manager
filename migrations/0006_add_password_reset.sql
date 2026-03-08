-- Migration 0006: Add Password Reset Support
-- Description: Add password reset token and expiry fields to users table
-- Date: 2026-03-08

-- Add password reset fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Index for faster reset token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Migration complete
