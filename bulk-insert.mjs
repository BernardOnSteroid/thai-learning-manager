// Bulk insert Thai vocabulary via API
// This script extracts data from SQL and POSTs to /api/entries

import { readFileSync } from 'fs';

const API_URL = 'http://localhost:3001/api/entries';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZWZhdWx0X3VzZXIiLCJpYXQiOjE3MDk2MTYwMDB9.gFWkX5l4NRVX6Jx-nQlR2y_3HSfXgZmYcDZ4FfM7mhg'; // default_user token

// Read and parse SQL file
const sql = readFileSync('./migrations/0005_add_300_thai_words.sql', 'utf-8');

// Extract INSERT statements
const insertMatches = sql.match(/INSERT INTO entries[^;]+;/g) || [];

console.log(`📝 Found ${insertMatches.length} INSERT statement blocks`);
console.log('🗄️  Parsing entries...');

const entries = [];
insertMatches.forEach((insertStmt, idx) => {
  // Extract VALUES section
  const valuesMatch = insertStmt.match(/VALUES\s+([\s\S]+);/);
  if (!valuesMatch) return;
  
  const valuesSection = valuesMatch[1];
  
  // Split by "),(" to get individual rows
  const rows = valuesSection.split(/\),\s*\(/);
  
  rows.forEach((row, rowIdx) => {
    // Clean up the row
    row = row.replace(/^\(/, '').replace(/\)$/, '');
    
    // Parse values - handle quoted strings and JSON
    const values = [];
    let current = '';
    let inString = false;
    let inJson = false;
    let depth = 0;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const prevChar = i > 0 ? row[i-1] : '';
      
      if (char === "'" && prevChar !== '\\') {
        inString = !inString;
        current += char;
      } else if (char === '[' && !inString) {
        inJson = true;
        depth++;
        current += char;
      } else if (char === ']' && !inString && inJson) {
        depth--;
        if (depth === 0) inJson = false;
        current += char;
      } else if (char === ',' && !inString && !inJson && depth === 0) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) values.push(current.trim());
    
    if (values.length >= 6) {
      const entry = {
        thai_script: values[0].replace(/^'|'$/g, ''),
        romanization: values[1].replace(/^'|'$/g, ''),
        tone: values[2].replace(/^'|'$/g, ''),
        meaning: values[3].replace(/^'|'$/g, ''),
        entry_type: values[4].replace(/^'|'$/g, ''),
        cefr_level: values[5].replace(/^'|'$/g, ''),
        examples: values[6] ? JSON.parse(values[6].replace(/^'|'$/g, '').replace(/""/g, '"')) : []
      };
      entries.push(entry);
    }
  });
});

console.log(`✅ Parsed ${entries.length} entries`);
console.log('📤 Starting bulk insert via API...\n');

// Insert entries via API
let inserted = 0;
let skipped = 0;
let errors = 0;

for (const entry of entries) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`
      },
      body: JSON.stringify(entry)
    });
    
    if (response.ok) {
      inserted++;
      process.stdout.write(`\r✓ Inserted: ${inserted} | Skipped: ${skipped} | Errors: ${errors}`);
    } else if (response.status === 409) {
      // Duplicate - skip
      skipped++;
      process.stdout.write(`\r✓ Inserted: ${inserted} | Skipped: ${skipped} | Errors: ${errors}`);
    } else {
      errors++;
      const error = await response.text();
      console.log(`\n❌ Error inserting ${entry.thai_script}: ${error}`);
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 10));
    
  } catch (err) {
    errors++;
    console.log(`\n❌ Network error for ${entry.thai_script}: ${err.message}`);
  }
}

console.log('\n\n✅ Bulk insert completed!');
console.log(`📊 Final stats:`);
console.log(`   - Inserted: ${inserted}`);
console.log(`   - Skipped (duplicates): ${skipped}`);
console.log(`   - Errors: ${errors}`);

// Fetch stats from API
try {
  const statsResponse = await fetch('http://localhost:3001/api/stats');
  const stats = await statsResponse.json();
  console.log('\n📚 Database totals:');
  console.log(`   - Total entries: ${stats.totalEntries}`);
  console.log(`   - Learning progress: ${stats.learningProgress}`);
  console.log(`   - Due for review: ${stats.dueForReview}`);
} catch (err) {
  console.log('\n⚠️  Could not fetch final stats');
}
