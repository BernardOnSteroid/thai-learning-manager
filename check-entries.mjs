import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL
const sql = neon(DATABASE_URL)

async function checkEntries() {
  try {
    // Check if entries table exists and has data
    const result = await sql`SELECT COUNT(*) as count FROM entries WHERE archived = false`
    console.log('✅ Total entries in database:', result[0].count)
    
    if (result[0].count > 0) {
      const sample = await sql`SELECT thai_script, romanization, cefr_level FROM entries LIMIT 3`
      console.log('Sample entries:', sample)
    } else {
      console.log('⚠️  No entries found in database!')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkEntries()
