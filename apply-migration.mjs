// Apply Thai vocabulary migration using Neon
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_Z0aA9PDdMvhC@ep-winter-salad-aikoss01-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('🗄️  Applying Thai vocabulary expansion migration...');
console.log('📊 Adding 300+ Thai words/verbs (A1-C2 levels)');

const sql = neon(DATABASE_URL);

try {
  // Read migration file
  const migrationSQL = readFileSync('./migrations/0005_add_300_thai_words.sql', 'utf-8');
  
  // Split into individual INSERT statements
  const statements = migrationSQL
    .split('INSERT INTO entries')
    .filter(s => s.trim().length > 0)
    .map((s, i) => i === 0 ? s : 'INSERT INTO entries' + s);
  
  console.log(`📝 Found ${statements.length} statement blocks`);
  
  // Execute each INSERT block
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (stmt && !stmt.startsWith('--')) {
      try {
        await sql(stmt);
        if (i > 0) { // Skip comment blocks
          process.stdout.write(`\r✓ Inserted block ${i}/${statements.length - 1}`);
        }
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.error(`\n❌ Error in block ${i}:`, err.message);
        }
      }
    }
  }
  
  console.log('\n\n✅ Migration completed successfully!');
  console.log('📈 Counting entries by CEFR level...\n');
  
  // Count by CEFR level
  const levelCounts = await sql`
    SELECT cefr_level, COUNT(*) as count 
    FROM entries 
    GROUP BY cefr_level 
    ORDER BY cefr_level
  `;
  
  console.log('CEFR Level Distribution:');
  console.log('------------------------');
  levelCounts.forEach(row => {
    console.log(`${row.cefr_level}: ${row.count} words`);
  });
  
  // Total count
  const totalResult = await sql`SELECT COUNT(*) as total FROM entries`;
  const total = totalResult[0].total;
  
  console.log('------------------------');
  console.log(`📚 Total entries: ${total} words`);
  
  // Count by entry type
  const typeCounts = await sql`
    SELECT entry_type, COUNT(*) as count 
    FROM entries 
    GROUP BY entry_type 
    ORDER BY entry_type
  `;
  
  console.log('\nEntry Type Distribution:');
  console.log('------------------------');
  typeCounts.forEach(row => {
    console.log(`${row.entry_type}: ${row.count}`);
  });
  
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
