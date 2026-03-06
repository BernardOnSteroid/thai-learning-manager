-- Migration: Fix user_progress.entry_id to match entries.id (UUID)
-- The entries table uses UUID for id, but user_progress uses INTEGER for entry_id
-- We need to change entry_id to TEXT to store UUIDs

-- Drop the foreign key first
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS fk_user_progress_entry;
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_entry_id_fkey;

-- Change entry_id type from INTEGER to TEXT
ALTER TABLE user_progress ALTER COLUMN entry_id TYPE TEXT;

-- Re-add the foreign key constraint
ALTER TABLE user_progress 
ADD CONSTRAINT fk_user_progress_entry 
FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE;
