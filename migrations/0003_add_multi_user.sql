-- Migration 0003: Add Multi-User Support
-- Description: Add users table and user_progress table for per-user progress tracking
-- Date: 2026-03-05

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  preferences TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active INTEGER DEFAULT 1
);

-- User progress table (replaces learning_progress)
CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  entry_id INTEGER NOT NULL,
  state TEXT DEFAULT 'new' CHECK(state IN ('new', 'learning', 'mastered')),
  mastery_level INTEGER DEFAULT 0,
  last_reviewed DATETIME,
  next_review DATETIME,
  review_count INTEGER DEFAULT 0,
  easy_count INTEGER DEFAULT 0,
  hard_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (entry_id) REFERENCES thai_learning_entries(id) ON DELETE CASCADE,
  UNIQUE(user_id, entry_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_entry ON user_progress(entry_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_state ON user_progress(user_id, state);
CREATE INDEX IF NOT EXISTS idx_user_progress_review ON user_progress(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_user_progress_timestamp 
AFTER UPDATE ON user_progress
BEGIN
  UPDATE user_progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Migration note: Old learning_progress table will be deprecated
-- Data migration needed if there's existing progress data
