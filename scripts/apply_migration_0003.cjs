#!/usr/bin/env node
/**
 * Apply Migration 0003 - Multi-User Support to Neon PostgreSQL
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.dev.vars') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .dev.vars');
  process.exit(1);
}

async function applyMigration() {
  console.log('🔄 Applying Migration 0003: Add Multi-User Support...\n');

  const sql = neon(DATABASE_URL);

  try {
    // Create users table
    console.log('1️⃣  Creating users table...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        preferences TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active INTEGER DEFAULT 1
      )
    `);
    console.log('✅ Users table created\n');

    // Create user_progress table
    console.log('2️⃣  Creating user_progress table...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        entry_id INTEGER NOT NULL,
        state TEXT DEFAULT 'new' CHECK(state IN ('new', 'learning', 'mastered')),
        mastery_level INTEGER DEFAULT 0,
        last_reviewed TIMESTAMP,
        next_review TIMESTAMP,
        review_count INTEGER DEFAULT 0,
        easy_count INTEGER DEFAULT 0,
        hard_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, entry_id)
      )
    `);
    console.log('✅ User_progress table created\n');

    // Add foreign key constraints (if not exists)
    console.log('3️⃣  Adding foreign key constraints...');
    try {
      await sql.query(`
        ALTER TABLE user_progress 
        ADD CONSTRAINT fk_user_progress_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ User FK added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('⚠️  User FK already exists');
      }
    }

    try {
      await sql.query(`
        ALTER TABLE user_progress 
        ADD CONSTRAINT fk_user_progress_entry 
        FOREIGN KEY (entry_id) REFERENCES thai_learning_entries(id) ON DELETE CASCADE
      `);
      console.log('✅ Entry FK added\n');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('⚠️  Entry FK already exists\n');
      }
    }

    // Create indexes
    console.log('4️⃣  Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_progress_entry ON user_progress(entry_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_progress_state ON user_progress(user_id, state)',
      'CREATE INDEX IF NOT EXISTS idx_user_progress_review ON user_progress(user_id, next_review)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'
    ];

    for (const idx of indexes) {
      try {
        await sql.query(idx);
      } catch (e) {
        // Ignore if already exists
      }
    }
    console.log('✅ Indexes created\n');

    // Create trigger function
    console.log('5️⃣  Creating trigger function...');
    await sql.query(`
      CREATE OR REPLACE FUNCTION update_user_progress_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('✅ Trigger function created\n');

    // Create trigger
    console.log('6️⃣  Creating trigger...');
    try {
      await sql.query(`DROP TRIGGER IF EXISTS update_user_progress_timestamp ON user_progress`);
      await sql.query(`
        CREATE TRIGGER update_user_progress_timestamp 
        BEFORE UPDATE ON user_progress
        FOR EACH ROW
        EXECUTE FUNCTION update_user_progress_timestamp()
      `);
      console.log('✅ Trigger created\n');
    } catch (e) {
      console.log('⚠️  Trigger already exists\n');
    }

    console.log('✅ Migration 0003 completed successfully!');
    console.log('\n📊 Verifying tables...');

    // Verify tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_progress')
      ORDER BY table_name
    `;

    console.log(`\n✅ Found ${tables.length} new tables:`);
    tables.forEach(t => console.log(`   - ${t.table_name}`));

    // Check users table structure
    const userColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;

    console.log(`\n📋 Users table structure (${userColumns.length} columns):`);
    userColumns.forEach(c => console.log(`   - ${c.column_name}: ${c.data_type}`));

    // Check user_progress table structure
    const progressColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_progress'
      ORDER BY ordinal_position
    `;

    console.log(`\n📋 User_progress table structure (${progressColumns.length} columns):`);
    progressColumns.forEach(c => console.log(`   - ${c.column_name}: ${c.data_type}`));

    console.log('\n🎉 Multi-user support is now enabled!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();
