import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function applyMigration() {
  try {
    console.log('🗄️  Applying migration: 0006_add_password_reset.sql')
    
    const migration = readFileSync('./migrations/0006_add_password_reset.sql', 'utf-8')
    
    // Execute migration
    await sql(migration)
    
    console.log('✅ Migration applied successfully')
    
    // Verify columns were added
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('reset_token', 'reset_token_expires')
    `
    
    console.log('✅ Password reset columns:',  result)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

applyMigration()
