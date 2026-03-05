const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.dev.vars' });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  console.log('🔗 Connecting to Neon PostgreSQL...');
  
  const migrationSql = fs.readFileSync('migrations/0001_thai_initial_schema.sql', 'utf8');
  
  console.log('🚀 Running Thai database migration...');
  
  try {
    await pool.query(migrationSql);
    console.log('✅ Migration completed successfully!');
    
    // Test query
    const result = await pool.query('SELECT COUNT(*) as count FROM entries');
    console.log(`📊 Entries in database: ${result.rows[0].count}`);
    
    // Get test entry
    const testEntry = await pool.query('SELECT thai_script, meaning, cefr_level FROM entries LIMIT 1');
    if (testEntry.rows.length > 0) {
      console.log('✅ Test entry:', testEntry.rows[0]);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
