require('dotenv').config({ path: '.dev.vars' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testCount() {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM entries WHERE archived = false');
    console.log('Query result:', JSON.stringify(result, null, 2));
    console.log('Rows:', result.rows);
    console.log('First row:', result.rows[0]);
    console.log('Count value:', result.rows[0]?.count);
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testCount();
