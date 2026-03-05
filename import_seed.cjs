#!/usr/bin/env node
/**
 * Thai Learning Manager - Seed Data Import Script
 * Imports Thai vocabulary entries from JSON file into Neon PostgreSQL database
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function importSeedData() {
  console.log(`${colors.cyan}🇹🇭 Thai Learning Manager - Seed Data Import${colors.reset}\n`);
  
  // Check DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(`${colors.red}❌ Error: DATABASE_URL not found in environment${colors.reset}`);
    console.log(`${colors.yellow}Please set DATABASE_URL in .dev.vars or .env${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.blue}📊 Database: Neon PostgreSQL${colors.reset}`);
  console.log(`${colors.blue}🔗 Connection: ${databaseUrl.substring(0, 30)}...${colors.reset}\n`);
  
  // Initialize database connection
  const sql = neon(databaseUrl);
  
  // Read seed data file
  const seedFilePath = path.join(__dirname, 'seed_data', 'thai_300_complete.json');
  console.log(`${colors.blue}📂 Reading seed data from: ${seedFilePath}${colors.reset}`);
  
  if (!fs.existsSync(seedFilePath)) {
    console.error(`${colors.red}❌ Error: Seed data file not found: ${seedFilePath}${colors.reset}`);
    process.exit(1);
  }
  
  const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));
  console.log(`${colors.green}✅ Loaded ${seedData.length} entries from seed file${colors.reset}\n`);
  
  // Statistics
  let stats = {
    total: seedData.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    byCefr: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
    byType: { word: 0, verb: 0, phrase: 0, classifier: 0, particle: 0, custom: 0 },
    byTone: { mid: 0, low: 0, falling: 0, high: 0, rising: 0 }
  };
  
  console.log(`${colors.cyan}🔄 Starting import...${colors.reset}\n`);
  
  // Import each entry
  for (let i = 0; i < seedData.length; i++) {
    const entry = seedData[i];
    const progress = `[${i + 1}/${seedData.length}]`;
    
    try {
      // Check if entry exists (by thai_script)
      const existing = await sql`
        SELECT id FROM entries WHERE thai_script = ${entry.thai_script} LIMIT 1
      `;
      
      if (existing.length > 0) {
        // Update existing entry
        await sql`
          UPDATE entries SET
            romanization = ${entry.romanization},
            tone = ${entry.tone},
            meaning = ${entry.meaning},
            entry_type = ${entry.entry_type},
            cefr_level = ${entry.cefr_level},
            difficulty = ${entry.difficulty || 1},
            classifier = ${entry.classifier || ''},
            polite_form = ${entry.polite_form || ''},
            grammar_notes = ${entry.grammar_notes || ''},
            examples = ${JSON.stringify(entry.examples || [])}
          WHERE thai_script = ${entry.thai_script}
        `;
        
        console.log(`${progress} ${colors.yellow}📝 Updated:${colors.reset} ${entry.thai_script} (${entry.romanization})`);
        stats.updated++;
      } else {
        // Insert new entry
        await sql`
          INSERT INTO entries (
            thai_script, romanization, tone, meaning, entry_type, cefr_level,
            difficulty, classifier, polite_form, grammar_notes, examples, archived
          ) VALUES (
            ${entry.thai_script},
            ${entry.romanization},
            ${entry.tone},
            ${entry.meaning},
            ${entry.entry_type},
            ${entry.cefr_level},
            ${entry.difficulty || 1},
            ${entry.classifier || ''},
            ${entry.polite_form || ''},
            ${entry.grammar_notes || ''},
            ${JSON.stringify(entry.examples || [])},
            false
          )
        `;
        
        console.log(`${progress} ${colors.green}✅ Imported:${colors.reset} ${entry.thai_script} (${entry.romanization}) [${entry.cefr_level}, ${entry.entry_type}, ${entry.tone} tone]`);
        stats.imported++;
      }
      
      // Update statistics
      stats.byCefr[entry.cefr_level] = (stats.byCefr[entry.cefr_level] || 0) + 1;
      stats.byType[entry.entry_type] = (stats.byType[entry.entry_type] || 0) + 1;
      stats.byTone[entry.tone] = (stats.byTone[entry.tone] || 0) + 1;
      
    } catch (error) {
      console.error(`${progress} ${colors.red}❌ Error:${colors.reset} ${entry.thai_script} - ${error.message}`);
      stats.errors++;
    }
  }
  
  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.cyan}📊 Import Summary${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`${colors.green}✅ Successfully imported: ${stats.imported}${colors.reset}`);
  console.log(`${colors.yellow}📝 Updated existing:      ${stats.updated}${colors.reset}`);
  console.log(`${colors.red}❌ Errors:                ${stats.errors}${colors.reset}`);
  console.log(`${colors.blue}📦 Total processed:       ${stats.imported + stats.updated}${colors.reset}`);
  
  console.log(`\n${colors.cyan}📈 Distribution by CEFR Level:${colors.reset}`);
  Object.entries(stats.byCefr).forEach(([level, count]) => {
    if (count > 0) {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      console.log(`   ${level}: ${count} entries (${percentage}%)`);
    }
  });
  
  console.log(`\n${colors.cyan}📊 Distribution by Entry Type:${colors.reset}`);
  Object.entries(stats.byType).forEach(([type, count]) => {
    if (count > 0) {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      console.log(`   ${type}: ${count} entries (${percentage}%)`);
    }
  });
  
  console.log(`\n${colors.cyan}🎵 Distribution by Tone:${colors.reset}`);
  const toneEmojis = {mid: '→', low: '↘', falling: '↓', high: '↑', rising: '↗'};
  Object.entries(stats.byTone).forEach(([tone, count]) => {
    if (count > 0) {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      console.log(`   ${tone} ${toneEmojis[tone]}: ${count} entries (${percentage}%)`);
    }
  });
  
  console.log(`\n${colors.green}✅ Import completed successfully!${colors.reset}\n`);
  
  // Verify database count
  const result = await sql`SELECT COUNT(*) as count FROM entries WHERE archived = false`;
  const totalInDb = parseInt(result[0].count);
  console.log(`${colors.blue}📊 Total entries in database: ${totalInDb}${colors.reset}\n`);
}

// Run import
importSeedData()
  .then(() => {
    console.log(`${colors.green}🎉 Seed data import finished!${colors.reset}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}❌ Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
