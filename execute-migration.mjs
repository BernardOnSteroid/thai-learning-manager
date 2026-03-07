// Direct SQL execution using pg client
import pg from 'pg';
import { readFileSync } from 'fs';

const DATABASE_URL = 'postgresql://neondb_owner:npg_Z0aA9PDdMvhC@ep-winter-salad-aikoss01-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log('🔌 Connecting to database...');
await client.connect();

console.log('✅ Connected!');
console.log('📄 Reading migration file...');

const sql = readFileSync('./migrations/0005_fixed.sql', 'utf-8');

console.log('🗄️  Executing migration...\n');

try {
  // Execute the entire SQL file
  await client.query(sql);
  
  console.log('\n✅ Migration executed successfully!');
  console.log('📊 Fetching statistics...\n');
  
  // Get counts by level
  const levelResult = await client.query(`
    SELECT cefr_level, COUNT(*) as count 
    FROM entries 
    GROUP BY cefr_level 
    ORDER BY cefr_level
  `);
  
  console.log('📚 Entries by CEFR Level:');
  console.log('------------------------');
  levelResult.rows.forEach(row => {
    console.log(`${row.cefr_level.padEnd(4)} : ${row.count.padStart(3)} words`);
  });
  
  // Get total
  const totalResult = await client.query('SELECT COUNT(*) as total FROM entries');
  console.log('------------------------');
  console.log(`Total: ${totalResult.rows[0].total} words`);
  
  // Get counts by type
  const typeResult = await client.query(`
    SELECT entry_type, COUNT(*) as count 
    FROM entries 
    GROUP BY entry_type 
    ORDER BY entry_type
  `);
  
  console.log('\n📝 Entries by Type:');
  console.log('------------------------');
  typeResult.rows.forEach(row => {
    console.log(`${row.entry_type.padEnd(12)} : ${row.count.padStart(3)}`);
  });
  
} catch (error) {
  // Check if it's a duplicate key error (entries already exist)
  if (error.message.includes('duplicate key')) {
    console.log('\n⚠️  Some entries already exist (duplicate key), fetching current stats...\n');
    
    // Still show stats even if some already exist
    const levelResult = await client.query(`
      SELECT cefr_level, COUNT(*) as count 
      FROM entries 
      GROUP BY cefr_level 
      ORDER BY cefr_level
    `);
    
    console.log('📚 Current Entries by CEFR Level:');
    console.log('------------------------');
    levelResult.rows.forEach(row => {
      console.log(`${row.cefr_level.padEnd(4)} : ${row.count.padStart(3)} words`);
    });
    
    const totalResult = await client.query('SELECT COUNT(*) as total FROM entries');
    console.log('------------------------');
    console.log(`Total: ${totalResult.rows[0].total} words`);
  } else {
    console.error('\n❌ Error executing migration:', error.message);
    throw error;
  }
}

await client.end();
console.log('\n👋 Done!');
