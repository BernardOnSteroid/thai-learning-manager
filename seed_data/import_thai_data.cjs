// Import Thai seed data into Neon PostgreSQL
// Run with: node seed_data/import_thai_data.cjs

require('dotenv').config({ path: '.dev.vars' });
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importData() {
  console.log('🇹🇭 Starting Thai data import...\n');
  
  try {
    // Read the JSON file
    const jsonData = fs.readFileSync('./seed_data/thai_entries_300.json', 'utf8');
    const entries = JSON.parse(jsonData);
    
    console.log(`📊 Found ${entries.length} entries to import\n`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const entry of entries) {
      try {
        // Check if entry already exists (by thai_script)
        const checkResult = await pool.query(
          'SELECT id FROM entries WHERE thai_script = $1',
          [entry.thai_script]
        );
        
        if (checkResult.rows.length > 0) {
          console.log(`⏭️  Skipped: ${entry.thai_script} (already exists)`);
          skipped++;
          continue;
        }
        
        // Insert new entry
        const result = await pool.query(
          `INSERT INTO entries (
            thai_script, romanization, tone, meaning, entry_type, cefr_level,
            difficulty, examples, grammar_notes, classifier, polite_form, archived
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id`,
          [
            entry.thai_script,
            entry.romanization,
            entry.tone,
            entry.meaning,
            entry.entry_type,
            entry.cefr_level,
            entry.difficulty || 3,
            JSON.stringify(entry.examples || []),
            entry.grammar_notes || '',
            entry.classifier || '',
            entry.polite_form || '',
            false
          ]
        );
        
        console.log(`✅ Imported: ${entry.thai_script} (${entry.romanization}) - ${entry.cefr_level} ${entry.entry_type}`);
        imported++;
        
      } catch (err) {
        console.error(`❌ Error importing ${entry.thai_script}:`, err.message);
        errors++;
      }
    }
    
    console.log('\n📈 Import Summary:');
    console.log(`  ✅ Imported: ${imported}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  📊 Total processed: ${entries.length}`);
    
    // Show final count
    const countResult = await pool.query('SELECT COUNT(*) as count FROM entries');
    console.log(`\n🗄️  Total entries in database: ${countResult.rows[0].count}`);
    
    // Show distribution by CEFR level
    const cefrResult = await pool.query(`
      SELECT cefr_level, COUNT(*) as count 
      FROM entries 
      WHERE archived = false 
      GROUP BY cefr_level 
      ORDER BY cefr_level
    `);
    
    console.log('\n📊 CEFR Distribution:');
    cefrResult.rows.forEach(row => {
      console.log(`  ${row.cefr_level}: ${row.count} entries`);
    });
    
    // Show distribution by type
    const typeResult = await pool.query(`
      SELECT entry_type, COUNT(*) as count 
      FROM entries 
      WHERE archived = false 
      GROUP BY entry_type 
      ORDER BY entry_type
    `);
    
    console.log('\n📊 Type Distribution:');
    typeResult.rows.forEach(row => {
      console.log(`  ${row.entry_type}: ${row.count} entries`);
    });
    
    await pool.end();
    console.log('\n✨ Import complete!\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

importData();
