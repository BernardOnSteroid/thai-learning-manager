-- Migration: Add admin role and subscription fields
-- Version: 1.8.0
-- Date: 2026-03-11

-- Add admin role column
ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;

-- Add subscription fields
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'trial' CHECK(subscription_status IN ('trial', 'active', 'expired', 'cancelled'));
ALTER TABLE users ADD COLUMN subscription_start_date TIMESTAMP;
ALTER TABLE users ADD COLUMN subscription_end_date TIMESTAMP;
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Note: First user or designated email should be set as admin manually:
-- UPDATE users SET is_admin = 1 WHERE email = 'your-admin@email.com';
