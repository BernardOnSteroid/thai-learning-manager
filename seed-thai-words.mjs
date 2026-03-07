// Seed Thai words via API - simpler approach
const API_BASE = 'http://localhost:3001';
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZWZhdWx0X3VzZXIiLCJpYXQiOjE3MDk2MTYwMDB9.gFWkX5l4NRVX6Jx-nQlR2y_3HSfXgZmYcDZ4FfM7mhg';

// Sample of 50 most important words to start (we can expand later)
const words = [
  // A1 Verbs (10)
  { thai_script: 'ยืน', romanization: 'yuuen', tone: 'mid', meaning: 'to stand', entry_type: 'verb', cefr_level: 'A1', examples: [{thai:"ยืนตรงนั้น",romanization:"yuuen dtrong nán",english:"stand over there"}] },
  { thai_script: 'ใช้', romanization: 'chái', tone: 'high', meaning: 'to use', entry_type: 'verb', cefr_level: 'A1', examples: [{thai:"ใช้คอมพิวเตอร์",romanization:"chái khom-phiu-dtə̂ə",english:"use a computer"}] },
  { thai_script: 'เลือก', romanization: 'lûuak', tone: 'high', meaning: 'to choose', entry_type: 'verb', cefr_level: 'A1', examples: [{thai:"เลือกสีนี้",romanization:"lûuak sǐi níi",english:"choose this color"}] },
  { thai_script: 'ลอง', romanization: 'laawng', tone: 'mid', meaning: 'to try', entry_type: 'verb', cefr_level: 'A1', examples: [{thai:"ลองดู",romanization:"laawng duu",english:"try to see"}] },
  { thai_script: 'รอ', romanization: 'raw', tone: 'mid', meaning: 'to wait', entry_type: 'verb', cefr_level: 'A1', examples: [{thai:"รอสักครู่",romanization:"raw sàk-khrûu",english:"wait a moment"}] },
  { thai_script: 'จำ', romanization: 'jam', tone: 'mid', meaning: 'to remember', entry_type: 'verb', cefr_level: 'A1', examples: [{thai:"จำได้",romanization:"jam dâai",english:"can remember"}] },
  { thai_script: 'ลืม', romanization: 'luuem', tone: 'mid', meaning: 'to forget', entry_type: 'verb', cefr_level: 'A1', examples: [{thai:"ลืมไปแล้ว",romanization:"luuem bpai lɛ́ɛo",english:"already forgot"}] },
  { thai_script: 'รู้', romanization: 'rúu', tone: 'high', meaning: 'to know', entry_type: 'verb', cefr_level: 'A2', examples: [{thai:"รู้จัก",romanization:"rúu-jàk",english:"to know someone"}] },
  { thai_script: 'คิด', romanization: 'khít', tone: 'high', meaning: 'to think', entry_type: 'verb', cefr_level: 'A2', examples: [{thai:"คิดว่า",romanization:"khít wâa",english:"think that"}] },
  { thai_script: 'เข้าใจ', romanization: 'khâo-jai', tone: 'high-mid', meaning: 'to understand', entry_type: 'verb', cefr_level: 'A2', examples: [{thai:"เข้าใจไหม",romanization:"khâo-jai mǎi",english:"Do you understand?"}] },
  
  // A1 Nouns (10)
  { thai_script: 'โรงแรม', romanization: 'roong-rɛɛm', tone: 'mid-mid', meaning: 'hotel', entry_type: 'word', cefr_level: 'A2', examples: [{thai:"โรงแรมใหญ่",romanization:"roong-rɛɛm yài",english:"big hotel"}] },
  { thai_script: 'ร้านอาหาร', romanization: 'ráan-aa-hǎan', tone: 'high-mid-rising', meaning: 'restaurant', entry_type: 'word', cefr_level: 'A2', examples: [{thai:"ร้านอาหารไทย",romanization:"ráan-aa-hǎan thai",english:"Thai restaurant"}] },
  { thai_script: 'สนามบิน', romanization: 'sà-nǎam-bin', tone: 'falling-rising-mid', meaning: 'airport', entry_type: 'word', cefr_level: 'A2', examples: [{thai:"สนามบินกรุงเทพ",romanization:"sà-nǎam-bin grung-thêep",english:"Bangkok airport"}] },
  { thai_script: 'สถานี', romanization: 'sà-thǎa-nii', tone: 'falling-rising-mid', meaning: 'station', entry_type: 'word', cefr_level: 'A2', examples: [{thai:"สถานีรถไฟ",romanization:"sà-thǎa-nii rót-fai",english:"train station"}] },
  { thai_script: 'โรงพยาบาล', romanization: 'roong-phá-yaa-baan', tone: 'mid-high-mid-mid', meaning: 'hospital', entry_type: 'word', cefr_level: 'A2', examples: [{thai:"ไปโรงพยาบาล",romanization:"bpai roong-phá-yaa-baan",english:"go to hospital"}] },
  { thai_script: 'โรงเรียน', romanization: 'roong-riian', tone: 'mid-mid', meaning: 'school', entry_type: 'word', cefr_level: 'A2', examples: [{thai:"โรงเรียนประถม",romanization:"roong-riian bprà-thǒm",english:"primary school"}] },
  { thai_script: 'ตลาด', romanization: 'dtà-làat', tone: 'falling-falling', meaning: 'market', entry_type: 'word', cefr_level: 'A2', examples: [{thai:"ตลาดนัด",romanization:"dtà-làat nát",english:"flea market"}] },
  { thai_script: 'ธนาคาร', romanization: 'thá-naa-khaan', tone: 'high-mid-mid', meaning: 'bank', entry_type: 'word', cefr_level: 'A2', examples: [{thai:"ไปธนาคาร",romanization:"bpai thá-naa-khaan",english:"go to the bank"}] },
  { thai_script: 'ครอบครัว', romanization: 'khrâawp-khruua', tone: 'high-mid', meaning: 'family', entry_type: 'word', cefr_level: 'A2', examples: [{thai:"ครอบครัวใหญ่",romanization:"khrâawp-khruua yài",english:"big family"}] },
  { thai_script: 'หมอ', romanization: 'mǎaw', tone: 'rising', meaning: 'doctor', entry_type: 'word', cefr_level: 'A2', examples: [{thai:"ไปหาหมอ",romanization:"bpai hǎa mǎaw",english:"go see a doctor"}] },
  
  // B1 Words (10)
  { thai_script: 'พยายาม', romanization: 'phá-yaa-yaam', tone: 'high-mid-mid', meaning: 'to try/attempt', entry_type: 'verb', cefr_level: 'B1', examples: [{thai:"พยายามทำให้ดีที่สุด",romanization:"phá-yaa-yaam tham hâi dii thîi-sùt",english:"try to do the best"}] },
  { thai_script: 'ตัดสินใจ', romanization: 'dtàt-sǐn-jai', tone: 'falling-rising-mid', meaning: 'to decide', entry_type: 'verb', cefr_level: 'B1', examples: [{thai:"ตัดสินใจยาก",romanization:"dtàt-sǐn-jai yâak",english:"difficult to decide"}] },
  { thai_script: 'เปลี่ยน', romanization: 'bplìian', tone: 'falling', meaning: 'to change', entry_type: 'verb', cefr_level: 'B1', examples: [{thai:"เปลี่ยนใจ",romanization:"bplìian-jai",english:"change mind"}] },
  { thai_script: 'พัฒนา', romanization: 'phát-thá-naa', tone: 'high-high-mid', meaning: 'to develop', entry_type: 'verb', cefr_level: 'B1', examples: [{thai:"พัฒนาทักษะ",romanization:"phát-thá-naa thák-sà",english:"develop skills"}] },
  { thai_script: 'สนใจ', romanization: 'sǒn-jai', tone: 'rising-mid', meaning: 'to be interested', entry_type: 'verb', cefr_level: 'B1', examples: [{thai:"สนใจวัฒนธรรมไทย",romanization:"sǒn-jai wát-thá-ná-tham thai",english:"interested in Thai culture"}] },
  { thai_script: 'สังคม', romanization: 'sǎng-khom', tone: 'rising-mid', meaning: 'society', entry_type: 'word', cefr_level: 'B1', examples: [{thai:"สังคมไทย",romanization:"sǎng-khom thai",english:"Thai society"}] },
  { thai_script: 'วัฒนธรรม', romanization: 'wát-thá-ná-tham', tone: 'high-high-high-mid', meaning: 'culture', entry_type: 'word', cefr_level: 'B1', examples: [{thai:"วัฒนธรรมประเพณี",romanization:"wát-thá-ná-tham bprà-phee-nii",english:"culture and traditions"}] },
  { thai_script: 'เศรษฐกิจ', romanization: 'sèet-thà-gìt', tone: 'falling-falling-falling', meaning: 'economy', entry_type: 'word', cefr_level: 'B1', examples: [{thai:"เศรษฐกิจดี",romanization:"sèet-thà-gìt dii",english:"good economy"}] },
  { thai_script: 'ปัญหา', romanization: 'bpan-hǎa', tone: 'mid-rising', meaning: 'problem', entry_type: 'word', cefr_level: 'B1', examples: [{thai:"แก้ไขปัญหา",romanization:"gɛ̂ɛ-khǎi bpan-hǎa",english:"solve problems"}] },
  { thai_script: 'ทักษะ', romanization: 'thák-sà', tone: 'high-falling', meaning: 'skill', entry_type: 'word', cefr_level: 'B1', examples: [{thai:"พัฒนาทักษะ",romanization:"phát-thá-naa thák-sà",english:"develop skills"}] },
  
  // B2 Words (10)
  { thai_script: 'วิเคราะห์', romanization: 'wí-khrór', tone: 'high-high', meaning: 'to analyze', entry_type: 'verb', cefr_level: 'B2', examples: [{thai:"วิเคราะห์ข้อมูล",romanization:"wí-khrór khâaw-muun",english:"analyze data"}] },
  { thai_script: 'ประเมิน', romanization: 'bprà-məən', tone: 'falling-mid', meaning: 'to evaluate', entry_type: 'verb', cefr_level: 'B2', examples: [{thai:"ประเมินผลงาน",romanization:"bprà-məən phǒn-ngaan",english:"evaluate work"}] },
  { thai_script: 'นโยบาย', romanization: 'ná-yoo-baai', tone: 'high-mid-mid', meaning: 'policy', entry_type: 'word', cefr_level: 'B2', examples: [{thai:"นโยบายรัฐบาล",romanization:"ná-yoo-baai rát-thà-baan",english:"government policy"}] },
  { thai_script: 'กลยุทธ์', romanization: 'gon-lá-yút', tone: 'mid-high-high', meaning: 'strategy', entry_type: 'word', cefr_level: 'B2', examples: [{thai:"กลยุทธ์ทางธุรกิจ",romanization:"gon-lá-yút thaang thú-rá-gìt",english:"business strategy"}] },
  { thai_script: 'ผลกระทบ', romanization: 'phǒn-grà-thóp', tone: 'rising-falling-high', meaning: 'impact/effect', entry_type: 'word', cefr_level: 'B2', examples: [{thai:"ผลกระทบต่อสิ่งแวดล้อม",romanization:"phǒn-grà-thóp dtàw sìng-wɛ̂ɛt-lɔ́ɔm",english:"environmental impact"}] },
  { thai_script: 'ข้อมูล', romanization: 'khâaw-muun', tone: 'high-mid', meaning: 'data/information', entry_type: 'word', cefr_level: 'B2', examples: [{thai:"วิเคราะห์ข้อมูล",romanization:"wí-khrór khâaw-muun",english:"analyze data"}] },
  { thai_script: 'สำคัญยิ่ง', romanization: 'sǎm-khan-yîng', tone: 'rising-mid-high', meaning: 'crucial', entry_type: 'word', cefr_level: 'B2', examples: [{thai:"ประเด็นสำคัญยิ่ง",romanization:"bprà-den sǎm-khan-yîng",english:"crucial issue"}] },
  { thai_script: 'น่าเชื่อถือ', romanization: 'nâa-chûuea-thǔue', tone: 'high-high-rising', meaning: 'reliable/credible', entry_type: 'word', cefr_level: 'B2', examples: [{thai:"แหล่งข้อมูลน่าเชื่อถือ",romanization:"lɛ̀ng khâaw-muun nâa-chûuea-thǔue",english:"reliable source"}] },
  { thai_script: 'ครอบคลุม', romanization: 'khrâawp-khlum', tone: 'high-mid', meaning: 'comprehensive', entry_type: 'word', cefr_level: 'B2', examples: [{thai:"การศึกษาที่ครอบคลุม",romanization:"gaan-sùk-sǎa thîi khrâawp-khlum",english:"comprehensive study"}] },
  { thai_script: 'แม่นยำ', romanization: 'mɛ̂ɛn-yam', tone: 'high-mid', meaning: 'accurate/precise', entry_type: 'word', cefr_level: 'B2', examples: [{thai:"ข้อมูลแม่นยำ",romanization:"khâaw-muun mɛ̂ɛn-yam",english:"accurate data"}] },
  
  // C1 Words (10)
  { thai_script: 'กระตุ้น', romanization: 'grà-dtûn', tone: 'falling-high', meaning: 'to stimulate/provoke', entry_type: 'verb', cefr_level: 'C1', examples: [{thai:"กระตุ้นเศรษฐกิจ",romanization:"grà-dtûn sèet-thà-gìt",english:"stimulate the economy"}] },
  { thai_script: 'จูงใจ', romanization: 'juung-jai', tone: 'mid-mid', meaning: 'to motivate/persuade', entry_type: 'verb', cefr_level: 'C1', examples: [{thai:"จูงใจลูกค้า",romanization:"juung-jai lûuk-kháa",english:"motivate customers"}] },
  { thai_script: 'คาดการณ์', romanization: 'khâat-gaan', tone: 'high-mid', meaning: 'to anticipate', entry_type: 'verb', cefr_level: 'C1', examples: [{thai:"คาดการณ์ผลกระทบ",romanization:"khâat-gaan phǒn-grà-thóp",english:"anticipate impact"}] },
  { thai_script: 'ความเสี่ยง', romanization: 'khwaam-sìiang', tone: 'mid-falling', meaning: 'risk', entry_type: 'word', cefr_level: 'C1', examples: [{thai:"ประเมินความเสี่ยง",romanization:"bprà-məən khwaam-sìiang",english:"assess risk"}] },
  { thai_script: 'ความยุติธรรม', romanization: 'khwaam-yút-dtì-tham', tone: 'mid-high-falling-mid', meaning: 'justice', entry_type: 'word', cefr_level: 'C1', examples: [{thai:"ระบบความยุติธรรม",romanization:"rá-bòp khwaam-yút-dtì-tham",english:"justice system"}] },
  { thai_script: 'กลไก', romanization: 'gon-lái', tone: 'mid-mid', meaning: 'mechanism', entry_type: 'word', cefr_level: 'C1', examples: [{thai:"กลไกตลาด",romanization:"gon-lái dtà-làat",english:"market mechanism"}] },
  { thai_script: 'ปรากฏการณ์', romanization: 'bpraa-gòt-gaan', tone: 'mid-falling-mid', meaning: 'phenomenon', entry_type: 'word', cefr_level: 'C1', examples: [{thai:"ปรากฏการณ์ทางธรรมชาติ",romanization:"bpraa-gòt-gaan thaang tham-má-châat",english:"natural phenomenon"}] },
  { thai_script: 'บทบาท', romanization: 'bòt-bàat', tone: 'falling-falling', meaning: 'role', entry_type: 'word', cefr_level: 'C1', examples: [{thai:"บทบาทสำคัญ",romanization:"bòt-bàat sǎm-khan",english:"important role"}] },
  { thai_script: 'ความชอบธรรม', romanization: 'khwaam-châawp-tham', tone: 'mid-high-mid', meaning: 'legitimacy', entry_type: 'word', cefr_level: 'C1', examples: [{thai:"ความชอบธรรมทางกฎหมาย",romanization:"khwaam-châawp-tham thaang gòt-mǎai",english:"legal legitimacy"}] },
  { thai_script: 'ผลประโยชน์', romanization: 'phǒn-bprà-yòot', tone: 'rising-falling-falling', meaning: 'interest/benefit', entry_type: 'word', cefr_level: 'C1', examples: [{thai:"ผลประโยชน์ทับซ้อน",romanization:"phǒn-bprà-yòot tháp-sɔ́ɔn",english:"conflict of interest"}] }
];

console.log(`🗄️  Seeding ${words.length} Thai words via API...`);

let inserted = 0, skipped = 0, errors = 0;

for (const word of words) {
  try {
    const res = await fetch(`${API_BASE}/api/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JWT}` },
      body: JSON.stringify(word)
    });
    
    if (res.ok) {
      inserted++;
      process.stdout.write(`\r✓ ${inserted} inserted, ${skipped} skipped, ${errors} errors`);
    } else if (res.status === 409 || res.status === 400) {
      skipped++;
      process.stdout.write(`\r✓ ${inserted} inserted, ${skipped} skipped, ${errors} errors`);
    } else {
      errors++;
      console.log(`\n❌ Error ${word.thai_script}: ${res.status}`);
    }
    await new Promise(r => setTimeout(r, 20));
  } catch (e) {
    errors++;
    console.log(`\n❌ Network error ${word.thai_script}: ${e.message}`);
  }
}

console.log(`\n\n✅ Completed: ${inserted} new, ${skipped} skipped, ${errors} errors`);

// Get stats
try {
  const stats = await (await fetch(`${API_BASE}/api/stats`)).json();
  console.log(`\n📚 Total entries in database: ${stats.totalEntries}`);
} catch{}
