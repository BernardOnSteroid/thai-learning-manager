const { getStats, getDashboardStats, getEntries } = require('./src/db.ts');
require('dotenv').config({ path: '.dev.vars' });

async function testDb() {
  console.log('🧪 Testing Thai database helper functions...');
  
  try {
    // Test getStats
    const stats = await getStats(process.env.DATABASE_URL);
    console.log('✅ getStats():', stats);
    
    // Test getEntries
    const entries = await getEntries(process.env.DATABASE_URL, { limit: 5 });
    console.log('✅ getEntries():', entries.length, 'entries');
    if (entries.length > 0) {
      console.log('   First entry:', entries[0].thai_script, '-', entries[0].meaning);
    }
    
    // Test getDashboardStats
    const dashboard = await getDashboardStats(process.env.DATABASE_URL);
    console.log('✅ getDashboardStats():', {
      total: dashboard.totalEntries,
      byType: dashboard.byType,
      byCefr: dashboard.byCefr
    });
    
    console.log('\n🎉 All database helper functions working!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDb();
