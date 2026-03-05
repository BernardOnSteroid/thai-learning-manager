-- Thai Learning Manager Database Schema
-- Version: 1.0.0-thai
-- CEFR-based with Thai-specific features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main entries table with Thai-specific fields
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thai_script TEXT NOT NULL,
  romanization TEXT NOT NULL,
  tone VARCHAR(10) NOT NULL CHECK (tone IN ('mid', 'low', 'falling', 'high', 'rising')),
  meaning TEXT NOT NULL,
  entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('word', 'verb', 'phrase', 'classifier', 'particle', 'custom')),
  cefr_level VARCHAR(2) NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  examples JSONB DEFAULT '[]',
  grammar_notes TEXT,
  classifier VARCHAR(50),
  polite_form TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Learning progress with SRS algorithm
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  srs_level INTEGER DEFAULT 0,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  next_review TIMESTAMP,
  last_reviewed TIMESTAMP,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(entry_id)
);

-- User settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) DEFAULT 'default_user',
  key VARCHAR(100) NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Performance indexes
CREATE INDEX idx_entries_cefr ON entries(cefr_level);
CREATE INDEX idx_entries_type ON entries(entry_type);
CREATE INDEX idx_entries_archived ON entries(archived);
CREATE INDEX idx_entries_tone ON entries(tone);
CREATE INDEX idx_entries_script ON entries(thai_script);
CREATE INDEX idx_progress_entry ON learning_progress(entry_id);
CREATE INDEX idx_progress_review ON learning_progress(next_review);
CREATE INDEX idx_progress_srs ON learning_progress(srs_level);

-- Insert test entry to verify schema
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, difficulty, grammar_notes)
VALUES ('สวัสดี', 'sawasdee', 'rising', 'hello, goodbye', 'phrase', 'A1', 1, 'Add ครับ (khrap) for male speakers, ค่ะ (kha) for female speakers');
