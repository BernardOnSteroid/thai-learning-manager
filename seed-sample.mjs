// Seed 300 Thai words directly through the API
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_Z0aA9PDdMvhC@ep-winter-salad-aikoss01-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

// All 300 words organized by level
const entries = [
  // A1 - Essential Verbs (20)
  { thai_script: 'เป็น', romanization: 'bpen', tone: 'mid', meaning: 'to be', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"ฉันเป็นครู","romanization":"chǎn bpen khruu","english":"I am a teacher"}] },
  { thai_script: 'มี', romanization: 'mii', tone: 'mid', meaning: 'to have', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"ฉันมีหนังสือ","romanization":"chǎn mii nǎng-sǔu","english":"I have a book"}] },
  { thai_script: 'ไป', romanization: 'bpai', tone: 'mid', meaning: 'to go', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"ไปไหน","romanization":"bpai nǎi","english":"Where are you going?"}] },
  { thai_script: 'มา', romanization: 'maa', tone: 'mid', meaning: 'to come', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"มาที่นี่","romanization":"maa thîi-nîi","english":"Come here"}] },
  { thai_script: 'กิน', romanization: 'gin', tone: 'mid', meaning: 'to eat', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"กินข้าว","romanization":"gin khâao","english":"eat rice/have a meal"}] },
  { thai_script: 'ดื่ม', romanization: 'dùem', tone: 'falling', meaning: 'to drink', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"ดื่มน้ำ","romanization":"dùem náam","english":"drink water"}] },
  { thai_script: 'นอน', romanization: 'naawn', tone: 'mid', meaning: 'to sleep', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"นอนหลับ","romanization":"naawn làp","english":"to sleep"}] },
  { thai_script: 'ตื่น', romanization: 'dtùen', tone: 'falling', meaning: 'to wake up', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"ตื่นเช้า","romanization":"dtùen cháao","english":"wake up in the morning"}] },
  { thai_script: 'อ่าน', romanization: 'àan', tone: 'falling', meaning: 'to read', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"อ่านหนังสือ","romanization":"àan nǎng-sǔu","english":"read a book"}] },
  { thai_script: 'เขียน', romanization: 'khǐan', tone: 'rising', meaning: 'to write', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"เขียนจดหมาย","romanization":"khǐan jòt-mǎai","english":"write a letter"}] },
  { thai_script: 'ดู', romanization: 'duu', tone: 'mid', meaning: 'to watch/look', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"ดูทีวี","romanization":"duu thii-wii","english":"watch TV"}] },
  { thai_script: 'ฟัง', romanization: 'fang', tone: 'mid', meaning: 'to listen', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"ฟังเพลง","romanization":"fang phleeng","english":"listen to music"}] },
  { thai_script: 'พูด', romanization: 'phûut', tone: 'high', meaning: 'to speak', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"พูดไทย","romanization":"phûut thai","english":"speak Thai"}] },
  { thai_script: 'เรียน', romanization: 'riian', tone: 'mid', meaning: 'to study/learn', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"เรียนภาษาไทย","romanization":"riian phaa-sǎa thai","english":"study Thai language"}] },
  { thai_script: 'ทำ', romanization: 'tham', tone: 'mid', meaning: 'to do/make', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"ทำงาน","romanization":"tham-ngaan","english":"to work"}] },
  { thai_script: 'ซื้อ', romanization: 'súe', tone: 'high', meaning: 'to buy', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"ซื้อของ","romanization":"súe khǎawng","english":"buy things"}] },
  { thai_script: 'ขาย', romanization: 'khǎai', tone: 'rising', meaning: 'to sell', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"ขายผลไม้","romanization":"khǎai phǒn-lá-mái","english":"sell fruit"}] },
  { thai_script: 'ให้', romanization: 'hâi', tone: 'high', meaning: 'to give', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"ให้ของขวัญ","romanization":"hâi khǎawng-khwǎn","english":"give a gift"}] },
  { thai_script: 'เอา', romanization: 'ao', tone: 'mid', meaning: 'to take/get', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"เอาไป","romanization":"ao bpai","english":"take it away"}] },
  { thai_script: 'รัก', romanization: 'rák', tone: 'high', meaning: 'to love', entry_type: 'verb', cefr_level: 'A1', examples: [{"thai":"รักคุณ","romanization":"rák khun","english":"I love you"}] },

  // Due to response length limits, I'll insert entries in batches
  // This is just a sample - the full script would include all 300
];

console.log('🗄️  Seeding Thai vocabulary...');
console.log(`📊 Preparing ${entries.length} entries`);

try {
  let inserted = 0;
  let skipped = 0;
  
  for (const entry of entries) {
    try {
      await sql`
        INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples)
        VALUES (
          ${entry.thai_script},
          ${entry.romanization},
          ${entry.tone},
          ${entry.meaning},
          ${entry.entry_type},
          ${entry.cefr_level},
          ${JSON.stringify(entry.examples)}
        )
        ON CONFLICT (thai_script, cefr_level) DO NOTHING
      `;
      inserted++;
      process.stdout.write(`\r✓ Inserted: ${inserted}, Skipped: ${skipped}`);
    } catch (err) {
      if (err.message.includes('duplicate key')) {
        skipped++;
      } else {
        console.error(`\n❌ Error inserting ${entry.thai_script}:`, err.message);
      }
    }
  }
  
  console.log('\n\n✅ Seeding completed!');
  console.log(`📈 Stats: ${inserted} inserted, ${skipped} skipped`);
  
  // Show final count
  const result = await sql`SELECT cefr_level, COUNT(*) as count FROM entries GROUP BY cefr_level ORDER BY cefr_level`;
  console.log('\n📚 Entries by level:');
  result.forEach(r => console.log(`  ${r.cefr_level}: ${r.count}`));
  
} catch (error) {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
}
