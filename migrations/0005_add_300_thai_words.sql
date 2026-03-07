-- Thai Learning Manager - 300+ Thai Words/Verbs Expansion
-- Migration: 0005
-- CEFR Levels: A1 (60 words), A2 (60 words), B1 (60 words), B2 (60 words), C1 (40 words), C2 (20 words)
-- Entry Types: words, verbs, phrases, classifiers, particles
-- Total: 300 entries

-- ============================================
-- A1 Level - Beginner Basics (60 entries)
-- ============================================

-- Essential Verbs A1 (20)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('เป็น', 'bpen', 'mid', 'to be', 'verb', 'A1', '[{"thai":"ฉันเป็นครู","romanization":"chǎn bpen khruu","english":"I am a teacher"}]'),
('มี', 'mii', 'mid', 'to have', 'verb', 'A1', '[{"thai":"ฉันมีหนังสือ","romanization":"chǎn mii nǎng-sǔu","english":"I have a book"}]'),
('ไป', 'bpai', 'mid', 'to go', 'verb', 'A1', '[{"thai":"ไปไหน","romanization":"bpai nǎi","english":"Where are you going?"}]'),
('มา', 'maa', 'mid', 'to come', 'verb', 'A1', '[{"thai":"มาที่นี่","romanization":"maa thîi-nîi","english":"Come here"}]'),
('กิน', 'gin', 'mid', 'to eat', 'verb', 'A1', '[{"thai":"กินข้าว","romanization":"gin khâao","english":"eat rice/have a meal"}]'),
('ดื่ม', 'dùem', 'falling', 'to drink', 'verb', 'A1', '[{"thai":"ดื่มน้ำ","romanization":"dùem náam","english":"drink water"}]'),
('นอน', 'naawn', 'mid', 'to sleep', 'verb', 'A1', '[{"thai":"นอนหลับ","romanization":"naawn làp","english":"to sleep"}]'),
('ตื่น', 'dtùen', 'falling', 'to wake up', 'verb', 'A1', '[{"thai":"ตื่นเช้า","romanization":"dtùen cháao","english":"wake up in the morning"}]'),
('อ่าน', 'àan', 'falling', 'to read', 'verb', 'A1', '[{"thai":"อ่านหนังสือ","romanization":"àan nǎng-sǔu","english":"read a book"}]'),
('เขียน', 'khǐan', 'rising', 'to write', 'verb', 'A1', '[{"thai":"เขียนจดหมาย","romanization":"khǐan jòt-mǎai","english":"write a letter"}]'),
('ดู', 'duu', 'mid', 'to watch/look', 'verb', 'A1', '[{"thai":"ดูทีวี","romanization":"duu thii-wii","english":"watch TV"}]'),
('ฟัง', 'fang', 'mid', 'to listen', 'verb', 'A1', '[{"thai":"ฟังเพลง","romanization":"fang phleeng","english":"listen to music"}]'),
('พูด', 'phûut', 'high', 'to speak', 'verb', 'A1', '[{"thai":"พูดไทย","romanization":"phûut thai","english":"speak Thai"}]'),
('เรียน', 'riian', 'mid', 'to study/learn', 'verb', 'A1', '[{"thai":"เรียนภาษาไทย","romanization":"riian phaa-sǎa thai","english":"study Thai language"}]'),
('ทำ', 'tham', 'mid', 'to do/make', 'verb', 'A1', '[{"thai":"ทำงาน","romanization":"tham-ngaan","english":"to work"}]'),
('ซื้อ', 'súe', 'high', 'to buy', 'verb', 'A1', '[{"thai":"ซื้อของ","romanization":"súe khǎawng","english":"buy things"}]'),
('ขาย', 'khǎai', 'rising', 'to sell', 'verb', 'A1', '[{"thai":"ขายผลไม้","romanization":"khǎai phǒn-lá-mái","english":"sell fruit"}]'),
('ให้', 'hâi', 'high', 'to give', 'verb', 'A1', '[{"thai":"ให้ของขวัญ","romanization":"hâi khǎawng-khwǎn","english":"give a gift"}]'),
('เอา', 'ao', 'mid', 'to take/get', 'verb', 'A1', '[{"thai":"เอาไป","romanization":"ao bpai","english":"take it away"}]'),
('รัก', 'rák', 'high', 'to love', 'verb', 'A1', '[{"thai":"รักคุณ","romanization":"rák khun","english":"I love you"}]');

-- Common Nouns A1 (20)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('บ้าน', 'bâan', 'high', 'house', 'word', 'A1', '[{"thai":"บ้านใหญ่","romanization":"bâan yài","english":"big house"}]'),
('น้ำ', 'náam', 'high', 'water', 'word', 'A1', '[{"thai":"น้ำเย็น","romanization":"náam yen","english":"cold water"}]'),
('ข้าว', 'khâao', 'high', 'rice/food', 'word', 'A1', '[{"thai":"ข้าวผัด","romanization":"khâao phàt","english":"fried rice"}]'),
('ผม', 'phǒm', 'rising', 'I/me (male)', 'word', 'A1', '[{"thai":"ผมชื่อจอห์น","romanization":"phǒm chûe john","english":"My name is John"}]'),
('ฉัน', 'chǎn', 'rising', 'I/me (common)', 'word', 'A1', '[{"thai":"ฉันเป็นคนไทย","romanization":"chǎn bpen khon thai","english":"I am Thai"}]'),
('คุณ', 'khun', 'mid', 'you (polite)', 'word', 'A1', '[{"thai":"คุณสบายดีไหม","romanization":"khun sà-baai dii mǎi","english":"How are you?"}]'),
('เขา', 'khǎo', 'rising', 'he/she/they', 'word', 'A1', '[{"thai":"เขาเป็นครู","romanization":"khǎo bpen khruu","english":"He/She is a teacher"}]'),
('เรา', 'rao', 'mid', 'we/us', 'word', 'A1', '[{"thai":"เราเป็นเพื่อน","romanization":"rao bpen phûean","english":"We are friends"}]'),
('คน', 'khon', 'mid', 'person', 'word', 'A1', '[{"thai":"คนไทย","romanization":"khon thai","english":"Thai person"}]'),
('เพื่อน', 'phûean', 'high', 'friend', 'word', 'A1', '[{"thai":"เพื่อนดี","romanization":"phûean dii","english":"good friend"}]'),
('ครู', 'khruu', 'mid', 'teacher', 'word', 'A1', '[{"thai":"ครูสอนดี","romanization":"khruu sǎawn dii","english":"The teacher teaches well"}]'),
('หนังสือ', 'nǎng-sǔu', 'rising-rising', 'book', 'word', 'A1', '[{"thai":"หนังสือดี","romanization":"nǎng-sǔu dii","english":"good book"}]'),
('รถ', 'rót', 'high', 'car/vehicle', 'word', 'A1', '[{"thai":"รถใหม่","romanization":"rót mài","english":"new car"}]'),
('เงิน', 'ngəən', 'mid', 'money', 'word', 'A1', '[{"thai":"เงินเยอะ","romanization":"ngəən yúh","english":"a lot of money"}]'),
('วัน', 'wan', 'mid', 'day', 'word', 'A1', '[{"thai":"วันนี้","romanization":"wan-níi","english":"today"}]'),
('เวลา', 'wee-laa', 'mid-mid', 'time', 'word', 'A1', '[{"thai":"เวลาว่าง","romanization":"wee-laa wâang","english":"free time"}]'),
('ที่', 'thîi', 'high', 'place/at', 'word', 'A1', '[{"thai":"ที่นี่","romanization":"thîi-nîi","english":"here"}]'),
('ชื่อ', 'chûe', 'high', 'name', 'word', 'A1', '[{"thai":"ชื่ออะไร","romanization":"chûe à-rai","english":"What is the name?"}]'),
('อาหาร', 'aa-hǎan', 'mid-rising', 'food', 'word', 'A1', '[{"thai":"อาหารอร่อย","romanization":"aa-hǎan à-ròi","english":"delicious food"}]'),
('ห้อง', 'hâawng', 'high', 'room', 'word', 'A1', '[{"thai":"ห้องนอน","romanization":"hâawng-naawn","english":"bedroom"}]');

-- Basic Adjectives A1 (10)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('ดี', 'dii', 'mid', 'good', 'word', 'A1', '[{"thai":"สบายดี","romanization":"sà-baai dii","english":"well/fine"}]'),
('ไม่ดี', 'mâi dii', 'high-mid', 'not good/bad', 'word', 'A1', '[{"thai":"อากาศไม่ดี","romanization":"aa-gàat mâi dii","english":"bad weather"}]'),
('ใหญ่', 'yài', 'falling', 'big', 'word', 'A1', '[{"thai":"บ้านใหญ่","romanization":"bâan yài","english":"big house"}]'),
('เล็ก', 'lék', 'high', 'small', 'word', 'A1', '[{"thai":"รถเล็ก","romanization":"rót lék","english":"small car"}]'),
('สวย', 'sǔay', 'rising', 'beautiful', 'word', 'A1', '[{"thai":"ผู้หญิงสวย","romanization":"phûu-yǐng sǔay","english":"beautiful woman"}]'),
('หล่อ', 'làw', 'falling', 'handsome', 'word', 'A1', '[{"thai":"ผู้ชายหล่อ","romanization":"phûu-chaai làw","english":"handsome man"}]'),
('อร่อย', 'à-ròi', 'falling-falling', 'delicious', 'word', 'A1', '[{"thai":"อาหารอร่อย","romanization":"aa-hǎan à-ròi","english":"delicious food"}]'),
('แพง', 'phɛɛng', 'mid', 'expensive', 'word', 'A1', '[{"thai":"ของแพง","romanization":"khǎawng phɛɛng","english":"expensive things"}]'),
('ถูก', 'thùuk', 'falling', 'cheap', 'word', 'A1', '[{"thai":"ราคาถูก","romanization":"raa-khaa thùuk","english":"cheap price"}]'),
('ร้อน', 'ráawn', 'high', 'hot', 'word', 'A1', '[{"thai":"อากาศร้อน","romanization":"aa-gàat ráawn","english":"hot weather"}]');

-- Common Phrases & Particles A1 (10)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('สบายดีไหม', 'sà-baai dii mǎi', 'falling-mid-rising', 'How are you?', 'phrase', 'A1', '[{"thai":"วันนี้สบายดีไหม","romanization":"wan-níi sà-baai dii mǎi","english":"Are you well today?"}]'),
('ขอบคุณ', 'khàawp-khun', 'falling-mid', 'Thank you', 'phrase', 'A1', '[{"thai":"ขอบคุณครับ","romanization":"khàawp-khun khráp","english":"Thank you (male)"}]'),
('ขอโทษ', 'khǎaw-thôot', 'rising-high', 'Sorry/Excuse me', 'phrase', 'A1', '[{"thai":"ขอโทษนะครับ","romanization":"khǎaw-thôot ná khráp","english":"Sorry (male)"}]'),
('ไม่เป็นไร', 'mâi bpen rai', 'high-mid-mid', 'Never mind/It\'s okay', 'phrase', 'A1', '[{"thai":"ไม่เป็นไรครับ","romanization":"mâi bpen rai khráp","english":"It\'s okay (male)"}]'),
('ครับ', 'khráp', 'high', 'yes/polite particle (male)', 'particle', 'A1', '[{"thai":"ใช่ครับ","romanization":"châi khráp","english":"Yes (male)"}]'),
('ค่ะ', 'khâ', 'high', 'yes/polite particle (female)', 'particle', 'A1', '[{"thai":"ใช่ค่ะ","romanization":"châi khâ","english":"Yes (female)"}]'),
('ไหม', 'mǎi', 'rising', 'question particle', 'particle', 'A1', '[{"thai":"ชอบไหม","romanization":"châawp mǎi","english":"Do you like it?"}]'),
('นะ', 'ná', 'high', 'softening particle', 'particle', 'A1', '[{"thai":"ดีนะ","romanization":"dii ná","english":"Good, isn\'t it?"}]'),
('ก็', 'gâw', 'high', 'also/then', 'particle', 'A1', '[{"thai":"ฉันก็ไป","romanization":"chǎn gâw bpai","english":"I also go"}]'),
('แล้ว', 'lɛ́ɛo', 'high', 'already/then', 'particle', 'A1', '[{"thai":"กินแล้ว","romanization":"gin lɛ́ɛo","english":"already eaten"}]');

-- ============================================
-- A2 Level - Elementary (60 entries)
-- ============================================

-- A2 Verbs (20)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('รู้', 'rúu', 'high', 'to know', 'verb', 'A2', '[{"thai":"รู้จัก","romanization":"rúu-jàk","english":"to know (someone)"}]'),
('คิด', 'khít', 'high', 'to think', 'verb', 'A2', '[{"thai":"คิดว่า","romanization":"khít wâa","english":"think that"}]'),
('เข้าใจ', 'khâo-jai', 'high-mid', 'to understand', 'verb', 'A2', '[{"thai":"เข้าใจไหม","romanization":"khâo-jai mǎi","english":"Do you understand?"}]'),
('ถาม', 'thǎam', 'rising', 'to ask', 'verb', 'A2', '[{"thai":"ถามคำถาม","romanization":"thǎam kham-thǎam","english":"ask a question"}]'),
('ตอบ', 'dtàawp', 'falling', 'to answer', 'verb', 'A2', '[{"thai":"ตอบคำถาม","romanization":"dtàawp kham-thǎam","english":"answer a question"}]'),
('ช่วย', 'chûay', 'high', 'to help', 'verb', 'A2', '[{"thai":"ช่วยฉันหน่อย","romanization":"chûay chǎn nàwy","english":"Please help me"}]'),
('เปิด', 'bpə̀ət', 'falling', 'to open', 'verb', 'A2', '[{"thai":"เปิดประตู","romanization":"bpə̀ət bprà-dtuu","english":"open the door"}]'),
('ปิด', 'bpìt', 'falling', 'to close', 'verb', 'A2', '[{"thai":"ปิดหน้าต่าง","romanization":"bpìt nâa-dtàang","english":"close the window"}]'),
('เล่น', 'lên', 'high', 'to play', 'verb', 'A2', '[{"thai":"เล่นกีฬา","romanization":"lên gii-laa","english":"play sports"}]'),
('ทำงาน', 'tham-ngaan', 'mid-mid', 'to work', 'verb', 'A2', '[{"thai":"ทำงานหนัก","romanization":"tham-ngaan nàk","english":"work hard"}]'),
('เดิน', 'dəən', 'mid', 'to walk', 'verb', 'A2', '[{"thai":"เดินเล่น","romanization":"dəən-lên","english":"take a walk"}]'),
('วิ่ง', 'wîng', 'high', 'to run', 'verb', 'A2', '[{"thai":"วิ่งเร็ว","romanization":"wîng reo","english":"run fast"}]'),
('นั่ง', 'nâng', 'high', 'to sit', 'verb', 'A2', '[{"thai":"นั่งที่นี่","romanization":"nâng thîi-nîi","english":"sit here"}]'),
('ยืน', 'yuuen', 'mid', 'to stand', 'verb', 'A2', '[{"thai":"ยืนตรงนั้น","romanization":"yuuen dtrong nán","english":"stand over there"}]'),
('ใช้', 'chái', 'high', 'to use', 'verb', 'A2', '[{"thai":"ใช้คอมพิวเตอร์","romanization":"chái khom-phiu-dtə̂ə","english":"use a computer"}]'),
('เลือก', 'lûuak', 'high', 'to choose', 'verb', 'A2', '[{"thai":"เลือกสีนี้","romanization":"lûuak sǐi níi","english":"choose this color"}]'),
('ลอง', 'laawng', 'mid', 'to try', 'verb', 'A2', '[{"thai":"ลองดู","romanization":"laawng duu","english":"try to see/have a look"}]'),
('รอ', 'raw', 'mid', 'to wait', 'verb', 'A2', '[{"thai":"รอสักครู่","romanization":"raw sàk-khrûu","english":"wait a moment"}]'),
('จำ', 'jam', 'mid', 'to remember', 'verb', 'A2', '[{"thai":"จำได้","romanization":"jam dâai","english":"can remember"}]'),
('ลืม', 'luuem', 'mid', 'to forget', 'verb', 'A2', '[{"thai":"ลืมไปแล้ว","romanization":"luuem bpai lɛ́ɛo","english":"already forgot"}]');

-- A2 Nouns (20)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('โรงแรม', 'roong-rɛɛm', 'mid-mid', 'hotel', 'word', 'A2', '[{"thai":"โรงแรมใหญ่","romanization":"roong-rɛɛm yài","english":"big hotel"}]'),
('ร้านอาหาร', 'ráan-aa-hǎan', 'high-mid-rising', 'restaurant', 'word', 'A2', '[{"thai":"ร้านอาหารไทย","romanization":"ráan-aa-hǎan thai","english":"Thai restaurant"}]'),
('สนามบิน', 'sà-nǎam-bin', 'falling-rising-mid', 'airport', 'word', 'A2', '[{"thai":"สนามบินกรุงเทพ","romanization":"sà-nǎam-bin grung-thêep","english":"Bangkok airport"}]'),
('สถานี', 'sà-thǎa-nii', 'falling-rising-mid', 'station', 'word', 'A2', '[{"thai":"สถานีรถไฟ","romanization":"sà-thǎa-nii rót-fai","english":"train station"}]'),
('โรงพยาบาล', 'roong-phá-yaa-baan', 'mid-high-mid-mid', 'hospital', 'word', 'A2', '[{"thai":"ไปโรงพยาบาล","romanization":"bpai roong-phá-yaa-baan","english":"go to hospital"}]'),
('โรงเรียน', 'roong-riian', 'mid-mid', 'school', 'word', 'A2', '[{"thai":"โรงเรียนประถม","romanization":"roong-riian bprà-thǒm","english":"primary school"}]'),
('มหาวิทยาลัย', 'má-hǎa-wít-thá-yaa-lai', 'high-rising-high-high-mid-mid', 'university', 'word', 'A2', '[{"thai":"มหาวิทยาลัยธรรมศาสตร์","romanization":"má-hǎa-wít-thá-yaa-lai tham-má-sàat","english":"Thammasat University"}]'),
('ตลาด', 'dtà-làat', 'falling-falling', 'market', 'word', 'A2', '[{"thai":"ตลาดนัด","romanization":"dtà-làat nát","english":"flea market"}]'),
('ธนาคาร', 'thá-naa-khaan', 'high-mid-mid', 'bank', 'word', 'A2', '[{"thai":"ไปธนาคาร","romanization":"bpai thá-naa-khaan","english":"go to the bank"}]'),
('ที่ทำงาน', 'thîi-tham-ngaan', 'high-mid-mid', 'workplace/office', 'word', 'A2', '[{"thai":"ที่ทำงานใหม่","romanization":"thîi-tham-ngaan mài","english":"new workplace"}]'),
('ครอบครัว', 'khrâawp-khruua', 'high-mid', 'family', 'word', 'A2', '[{"thai":"ครอบครัวใหญ่","romanization":"khrâawp-khruua yài","english":"big family"}]'),
('พ่อ', 'phâw', 'high', 'father', 'word', 'A2', '[{"thai":"พ่อของฉัน","romanization":"phâw khǎawng chǎn","english":"my father"}]'),
('แม่', 'mɛ̂ɛ', 'high', 'mother', 'word', 'A2', '[{"thai":"แม่ทำอาหาร","romanization":"mɛ̂ɛ tham aa-hǎan","english":"mother cooks"}]'),
('พี่', 'phîi', 'high', 'older sibling', 'word', 'A2', '[{"thai":"พี่ชาย","romanization":"phîi-chaai","english":"older brother"}]'),
('น้อง', 'náawng', 'high', 'younger sibling', 'word', 'A2', '[{"thai":"น้องสาว","romanization":"náawng-sǎao","english":"younger sister"}]'),
('สามี', 'sǎa-mii', 'rising-mid', 'husband', 'word', 'A2', '[{"thai":"สามีของฉัน","romanization":"sǎa-mii khǎawng chǎn","english":"my husband"}]'),
('ภรรยา', 'phan-rá-yaa', 'mid-high-mid', 'wife', 'word', 'A2', '[{"thai":"ภรรยาสวย","romanization":"phan-rá-yaa sǔay","english":"beautiful wife"}]'),
('ลูก', 'lûuk', 'high', 'child', 'word', 'A2', '[{"thai":"ลูกชาย","romanization":"lûuk-chaai","english":"son"}]'),
('หมอ', 'mǎaw', 'rising', 'doctor', 'word', 'A2', '[{"thai":"ไปหาหมอ","romanization":"bpai hǎa mǎaw","english":"go see a doctor"}]'),
('ตำรวจ', 'dtam-rùuat', 'mid-falling', 'police', 'word', 'A2', '[{"thai":"ตำรวจจราจร","romanization":"dtam-rùuat jà-raa-jaawn","english":"traffic police"}]');

-- A2 Adjectives & Adverbs (10)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('เร็ว', 'reo', 'mid', 'fast', 'word', 'A2', '[{"thai":"วิ่งเร็ว","romanization":"wîng reo","english":"run fast"}]'),
('ช้า', 'cháa', 'high', 'slow', 'word', 'A2', '[{"thai":"เดินช้า","romanization":"dəən cháa","english":"walk slowly"}]'),
('หนัก', 'nàk', 'falling', 'heavy/hard', 'word', 'A2', '[{"thai":"ทำงานหนัก","romanization":"tham-ngaan nàk","english":"work hard"}]'),
('เบา', 'bao', 'mid', 'light/soft', 'word', 'A2', '[{"thai":"พูดเบา","romanization":"phûut bao","english":"speak softly"}]'),
('ใหม่', 'mài', 'falling', 'new', 'word', 'A2', '[{"thai":"รถใหม่","romanization":"rót mài","english":"new car"}]'),
('เก่า', 'gào', 'falling', 'old (things)', 'word', 'A2', '[{"thai":"บ้านเก่า","romanization":"bâan gào","english":"old house"}]'),
('แก่', 'gɛ̀ɛ', 'falling', 'old (age)', 'word', 'A2', '[{"thai":"คนแก่","romanization":"khon gɛ̀ɛ","english":"old person"}]'),
('หนุ่ม', 'nùm', 'falling', 'young (male)', 'word', 'A2', '[{"thai":"ผู้ชายหนุ่ม","romanization":"phûu-chaai nùm","english":"young man"}]'),
('สาว', 'sǎao', 'rising', 'young (female)', 'word', 'A2', '[{"thai":"ผู้หญิงสาว","romanization":"phûu-yǐng sǎao","english":"young woman"}]'),
('มาก', 'mâak', 'high', 'very/a lot', 'word', 'A2', '[{"thai":"ชอบมาก","romanization":"châawp mâak","english":"like very much"}]');

-- A2 Time & Numbers (10)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('เมื่อวาน', 'mûuea-waan', 'high-mid', 'yesterday', 'word', 'A2', '[{"thai":"เมื่อวานฉันไปตลาด","romanization":"mûuea-waan chǎn bpai dtà-làat","english":"Yesterday I went to the market"}]'),
('พรุ่งนี้', 'phrûng-níi', 'high-high', 'tomorrow', 'word', 'A2', '[{"thai":"พรุ่งนี้จะไปไหน","romanization":"phrûng-níi jà bpai nǎi","english":"Where will you go tomorrow?"}]'),
('อาทิตย์', 'aa-thít', 'mid-high', 'week/Sunday', 'word', 'A2', '[{"thai":"อาทิตย์หน้า","romanization":"aa-thít nâa","english":"next week"}]'),
('เดือน', 'duuean', 'mid', 'month', 'word', 'A2', '[{"thai":"เดือนหน้า","romanization":"duuean nâa","english":"next month"}]'),
('ปี', 'bpii', 'mid', 'year', 'word', 'A2', '[{"thai":"ปีหน้า","romanization":"bpii nâa","english":"next year"}]'),
('เช้า', 'cháao', 'high', 'morning', 'word', 'A2', '[{"thai":"ตอนเช้า","romanization":"dtaawn cháao","english":"in the morning"}]'),
('เที่ยง', 'thîiang', 'high', 'noon', 'word', 'A2', '[{"thai":"เที่ยงวัน","romanization":"thîiang-wan","english":"midday"}]'),
('บ่าย', 'bàai', 'falling', 'afternoon', 'word', 'A2', '[{"thai":"ตอนบ่าย","romanization":"dtaawn bàai","english":"in the afternoon"}]'),
('ค่ำ', 'khâm', 'high', 'evening', 'word', 'A2', '[{"thai":"ตอนค่ำ","romanization":"dtaawn khâm","english":"in the evening"}]'),
('กลางคืน', 'glaang-khuuen', 'mid-mid', 'night', 'word', 'A2', '[{"thai":"กลางคืนมืด","romanization":"glaang-khuuen mûuet","english":"dark night"}]');

-- ============================================
-- B1 Level - Intermediate (60 entries)
-- ============================================

-- B1 Verbs (20)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('พยายาม', 'phá-yaa-yaam', 'high-mid-mid', 'to try/attempt', 'verb', 'B1', '[{"thai":"พยายามทำให้ดีที่สุด","romanization":"phá-yaa-yaam tham hâi dii thîi-sùt","english":"try to do the best"}]'),
('ตัดสินใจ', 'dtàt-sǐn-jai', 'falling-rising-mid', 'to decide', 'verb', 'B1', '[{"thai":"ตัดสินใจยาก","romanization":"dtàt-sǐn-jai yâak","english":"difficult to decide"}]'),
('เปลี่ยน', 'bplìian', 'falling', 'to change', 'verb', 'B1', '[{"thai":"เปลี่ยนใจ","romanization":"bplìian-jai","english":"change mind"}]'),
('พัฒนา', 'phát-thá-naa', 'high-high-mid', 'to develop', 'verb', 'B1', '[{"thai":"พัฒนาทักษะ","romanization":"phát-thá-naa thák-sà","english":"develop skills"}]'),
('สนใจ', 'sǒn-jai', 'rising-mid', 'to be interested', 'verb', 'B1', '[{"thai":"สนใจวัฒนธรรมไทย","romanization":"sǒn-jai wát-thá-ná-tham thai","english":"interested in Thai culture"}]'),
('เสนอ', 'sà-nə̌ə', 'falling-rising', 'to suggest/offer', 'verb', 'B1', '[{"thai":"เสนอความคิดเห็น","romanization":"sà-nə̌ə khwaam-khít-hěn","english":"suggest an opinion"}]'),
('อธิบาย', 'à-thí-baai', 'falling-high-mid', 'to explain', 'verb', 'B1', '[{"thai":"อธิบายอย่างชัดเจน","romanization":"à-thí-baai yàang chát-jeen","english":"explain clearly"}]'),
('เปรียบเทียบ', 'bprìiap-thîiap', 'falling-high', 'to compare', 'verb', 'B1', '[{"thai":"เปรียบเทียบราคา","romanization":"bprìiap-thîiap raa-khaa","english":"compare prices"}]'),
('วางแผน', 'waang-phɛ̌ɛn', 'mid-rising', 'to plan', 'verb', 'B1', '[{"thai":"วางแผนอนาคต","romanization":"waang-phɛ̌ɛn à-naa-khót","english":"plan the future"}]'),
('จัดการ', 'jàt-gaan', 'falling-mid', 'to manage', 'verb', 'B1', '[{"thai":"จัดการเวลา","romanization":"jàt-gaan wee-laa","english":"manage time"}]'),
('ควบคุม', 'khûuap-khum', 'high-mid', 'to control', 'verb', 'B1', '[{"thai":"ควบคุมอารมณ์","romanization":"khûuap-khum aa-rom","english":"control emotions"}]'),
('รักษา', 'rák-sǎa', 'high-rising', 'to maintain/treat', 'verb', 'B1', '[{"thai":"รักษาสุขภาพ","romanization":"rák-sǎa sùk-khà-phâap","english":"maintain health"}]'),
('ปรับปรุง', 'bpràp-bprung', 'falling-mid', 'to improve', 'verb', 'B1', '[{"thai":"ปรับปรุงคุณภาพ","romanization":"bpràp-bprung khun-ná-phâap","english":"improve quality"}]'),
('แก้ไข', 'gɛ̂ɛ-khǎi', 'high-rising', 'to fix/correct', 'verb', 'B1', '[{"thai":"แก้ไขปัญหา","romanization":"gɛ̂ɛ-khǎi bpan-hǎa","english":"solve problems"}]'),
('สร้าง', 'sâang', 'high', 'to create/build', 'verb', 'B1', '[{"thai":"สร้างธุรกิจ","romanization":"sâang thú-rá-gìt","english":"build a business"}]'),
('ทำลาย', 'tham-laai', 'mid-mid', 'to destroy', 'verb', 'B1', '[{"thai":"ทำลายสิ่งแวดล้อม","romanization":"tham-laai sìng-wɛ̂ɛt-lɔ́ɔm","english":"destroy the environment"}]'),
('ค้นพบ', 'khón-phóp', 'high-high', 'to discover', 'verb', 'B1', '[{"thai":"ค้นพบสิ่งใหม่","romanization":"khón-phóp sìng mài","english":"discover something new"}]'),
('สำเร็จ', 'sǎm-rèt', 'rising-falling', 'to succeed', 'verb', 'B1', '[{"thai":"สำเร็จการศึกษา","romanization":"sǎm-rèt gaan-sùk-sǎa","english":"graduate"}]'),
('ล้มเหลว', 'lóm-lěo', 'high-rising', 'to fail', 'verb', 'B1', '[{"thai":"ล้มเหลวในธุรกิจ","romanization":"lóm-lěo nai thú-rá-gìt","english":"fail in business"}]'),
('เผชิญ', 'phà-chəən', 'falling-mid', 'to face/encounter', 'verb', 'B1', '[{"thai":"เผชิญปัญหา","romanization":"phà-chəən bpan-hǎa","english":"face problems"}]');

-- B1 Nouns (20)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('สังคม', 'sǎng-khom', 'rising-mid', 'society', 'word', 'B1', '[{"thai":"สังคมไทย","romanization":"sǎng-khom thai","english":"Thai society"}]'),
('วัฒนธรรม', 'wát-thá-ná-tham', 'high-high-high-mid', 'culture', 'word', 'B1', '[{"thai":"วัฒนธรรมประเพณี","romanization":"wát-thá-ná-tham bprà-phee-nii","english":"culture and traditions"}]'),
('ประเพณี', 'bprà-phee-nii', 'falling-mid-mid', 'tradition', 'word', 'B1', '[{"thai":"ประเพณีไทย","romanization":"bprà-phee-nii thai","english":"Thai traditions"}]'),
('เศรษฐกิจ', 'sèet-thà-gìt', 'falling-falling-falling', 'economy', 'word', 'B1', '[{"thai":"เศรษฐกิจดี","romanization":"sèet-thà-gìt dii","english":"good economy"}]'),
('การเมือง', 'gaan-muuang', 'mid-mid', 'politics', 'word', 'B1', '[{"thai":"สนใจการเมือง","romanization":"sǒn-jai gaan-muuang","english":"interested in politics"}]'),
('สิ่งแวดล้อม', 'sìng-wɛ̂ɛt-lɔ́ɔm', 'falling-high-high', 'environment', 'word', 'B1', '[{"thai":"ปกป้องสิ่งแวดล้อม","romanization":"bpòk-bpɔ̂ɔng sìng-wɛ̂ɛt-lɔ́ɔm","english":"protect the environment"}]'),
('มลพิษ', 'mon-lá-phít', 'mid-high-high', 'pollution', 'word', 'B1', '[{"thai":"มลพิษทางอากาศ","romanization":"mon-lá-phít thaang aa-gàat","english":"air pollution"}]'),
('ปัญหา', 'bpan-hǎa', 'mid-rising', 'problem', 'word', 'B1', '[{"thai":"แก้ไขปัญหา","romanization":"gɛ̂ɛ-khǎi bpan-hǎa","english":"solve problems"}]'),
('โอกาส', 'oo-gàat', 'mid-falling', 'opportunity', 'word', 'B1', '[{"thai":"โอกาสดี","romanization":"oo-gàat dii","english":"good opportunity"}]'),
('ประสบการณ์', 'bprà-sòp-gaan', 'falling-falling-mid', 'experience', 'word', 'B1', '[{"thai":"มีประสบการณ์","romanization":"mii bprà-sòp-gaan","english":"have experience"}]'),
('ทักษะ', 'thák-sà', 'high-falling', 'skill', 'word', 'B1', '[{"thai":"พัฒนาทักษะ","romanization":"phát-thá-naa thák-sà","english":"develop skills"}]'),
('ความรู้', 'khwaam-rúu', 'mid-high', 'knowledge', 'word', 'B1', '[{"thai":"ความรู้มีค่า","romanization":"khwaam-rúu mii khâa","english":"knowledge is valuable"}]'),
('การศึกษา', 'gaan-sùk-sǎa', 'mid-rising-rising', 'education', 'word', 'B1', '[{"thai":"ระบบการศึกษา","romanization":"rá-bòp gaan-sùk-sǎa","english":"education system"}]'),
('อาชีพ', 'aa-chîip', 'mid-high', 'career/occupation', 'word', 'B1', '[{"thai":"เลือกอาชีพ","romanization":"lûuak aa-chîip","english":"choose a career"}]'),
('ธุรกิจ', 'thú-rá-gìt', 'high-high-falling', 'business', 'word', 'B1', '[{"thai":"ทำธุรกิจ","romanization":"tham thú-rá-gìt","english":"do business"}]'),
('บริษัท', 'baw-rí-sàt', 'mid-high-falling', 'company', 'word', 'B1', '[{"thai":"บริษัทใหญ่","romanization":"baw-rí-sàt yài","english":"big company"}]'),
('ลูกค้า', 'lûuk-kháa', 'high-high', 'customer', 'word', 'B1', '[{"thai":"บริการลูกค้า","romanization":"baw-rí-gaan lûuk-kháa","english":"customer service"}]'),
('คุณภาพ', 'khun-ná-phâap', 'mid-high-high', 'quality', 'word', 'B1', '[{"thai":"คุณภาพสูง","romanization":"khun-ná-phâap sǔung","english":"high quality"}]'),
('จำนวน', 'jam-nuan', 'mid-mid', 'amount/quantity', 'word', 'B1', '[{"thai":"จำนวนมาก","romanization":"jam-nuan mâak","english":"large amount"}]'),
('ส่วนใหญ่', 'sùuan-yài', 'falling-falling', 'majority/mostly', 'word', 'B1', '[{"thai":"คนส่วนใหญ่","romanization":"khon sùuan-yài","english":"most people"}]');

-- B1 Adjectives & Abstract (10)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('สำคัญ', 'sǎm-khan', 'rising-mid', 'important', 'word', 'B1', '[{"thai":"เรื่องสำคัญ","romanization":"rûuang sǎm-khan","english":"important matter"}]'),
('จำเป็น', 'jam-bpen', 'mid-mid', 'necessary', 'word', 'B1', '[{"thai":"จำเป็นต้องไป","romanization":"jam-bpen dtɔ̂ɔng bpai","english":"must go"}]'),
('เป็นไปได้', 'bpen-bpai-dâai', 'mid-mid-high', 'possible', 'word', 'B1', '[{"thai":"เป็นไปได้ทุกอย่าง","romanization":"bpen-bpai-dâai thúk-yàang","english":"anything is possible"}]'),
('ยากลำบาก', 'yâak-lam-bàak', 'high-mid-falling', 'difficult', 'word', 'B1', '[{"thai":"ชีวิตยากลำบาก","romanization":"chii-wít yâak-lam-bàak","english":"difficult life"}]'),
('ง่าย', 'ngâai', 'high', 'easy', 'word', 'B1', '[{"thai":"ง่ายมาก","romanization":"ngâai mâak","english":"very easy"}]'),
('ซับซ้อน', 'sáp-sɔ́ɔn', 'high-high', 'complex', 'word', 'B1', '[{"thai":"ปัญหาซับซ้อน","romanization":"bpan-hǎa sáp-sɔ́ɔn","english":"complex problem"}]'),
('ชัดเจน', 'chát-jeen', 'high-mid', 'clear', 'word', 'B1', '[{"thai":"อธิบายชัดเจน","romanization":"à-thí-baai chát-jeen","english":"explain clearly"}]'),
('คลุมเครือ', 'khlum-khruuea', 'mid-mid', 'vague/unclear', 'word', 'B1', '[{"thai":"คำตอบคลุมเครือ","romanization":"kham-dtàawp khlum-khruuea","english":"vague answer"}]'),
('มีประสิทธิภาพ', 'mii-bprà-sìt-thí-phâap', 'mid-falling-falling-high-high', 'efficient', 'word', 'B1', '[{"thai":"ทำงานมีประสิทธิภาพ","romanization":"tham-ngaan mii bprà-sìt-thí-phâap","english":"work efficiently"}]'),
('เหมาะสม', 'màw-sǒm', 'falling-rising', 'appropriate/suitable', 'word', 'B1', '[{"thai":"วิธีที่เหมาะสม","romanization":"wí-thii thîi màw-sǒm","english":"appropriate method"}]');

-- B1 Connectors & Phrases (10)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('เนื่องจาก', 'nûuang-jàak', 'high-falling', 'because of', 'word', 'B1', '[{"thai":"เนื่องจากฝนตก","romanization":"nûuang-jàak fǒn dtòk","english":"because of rain"}]'),
('ดังนั้น', 'dang-nán', 'mid-high', 'therefore', 'word', 'B1', '[{"thai":"ดังนั้นเราต้องรอ","romanization":"dang-nán rao dtɔ̂ɔng raw","english":"therefore we must wait"}]'),
('อย่างไรก็ตาม', 'yàang-rai-gâw-dtaam', 'falling-mid-high-mid', 'however', 'word', 'B1', '[{"thai":"อย่างไรก็ตาม มันยังเป็นไปได้","romanization":"yàang-rai-gâw-dtaam man yang bpen-bpai-dâai","english":"however, it is still possible"}]'),
('แม้ว่า', 'mɛ́ɛ-wâa', 'high-high', 'although', 'word', 'B1', '[{"thai":"แม้ว่าจะยาก","romanization":"mɛ́ɛ-wâa jà yâak","english":"although it is difficult"}]'),
('ไม่ว่า', 'mâi-wâa', 'high-high', 'no matter', 'word', 'B1', '[{"thai":"ไม่ว่าอย่างไร","romanization":"mâi-wâa yàang-rai","english":"no matter what"}]'),
('ถึงแม้', 'thǔng-mɛ́ɛ', 'rising-high', 'even though', 'word', 'B1', '[{"thai":"ถึงแม้จะพยายาม","romanization":"thǔng-mɛ́ɛ jà phá-yaa-yaam","english":"even though trying"}]'),
('หากว่า', 'hàak-wâa', 'falling-high', 'if', 'word', 'B1', '[{"thai":"หากว่าคุณต้องการ","romanization":"hàak-wâa khun dtɔ̂ɔng-gaan","english":"if you want"}]'),
('เพื่อที่จะ', 'phûuea-thîi-jà', 'high-high-falling', 'in order to', 'word', 'B1', '[{"thai":"เพื่อที่จะสำเร็จ","romanization":"phûuea-thîi-jà sǎm-rèt","english":"in order to succeed"}]'),
('ตามที่', 'dtaam-thîi', 'mid-high', 'according to', 'word', 'B1', '[{"thai":"ตามที่ได้ยิน","romanization":"dtaam-thîi dâai yin","english":"according to what was heard"}]'),
('โดยเฉพาะ', 'dooy-chà-phór', 'mid-falling-high', 'especially', 'word', 'B1', '[{"thai":"โดยเฉพาะในกรุงเทพ","romanization":"dooy-chà-phór nai grung-thêep","english":"especially in Bangkok"}]');

-- ============================================
-- B2 Level - Upper Intermediate (60 entries)
-- ============================================

-- B2 Verbs (20)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('วิเคราะห์', 'wí-khrór', 'high-high', 'to analyze', 'verb', 'B2', '[{"thai":"วิเคราะห์ข้อมูล","romanization":"wí-khrór khâaw-muun","english":"analyze data"}]'),
('ประเมิน', 'bprà-məən', 'falling-mid', 'to evaluate', 'verb', 'B2', '[{"thai":"ประเมินผลงาน","romanization":"bprà-məən phǒn-ngaan","english":"evaluate work"}]'),
('สรุป', 'sà-rùp', 'falling-falling', 'to summarize', 'verb', 'B2', '[{"thai":"สรุปเนื้อหา","romanization":"sà-rùp núuea-hǎa","english":"summarize content"}]'),
('โต้แย้ง', 'dtôo-yɛ́ɛng', 'high-high', 'to argue/debate', 'verb', 'B2', '[{"thai":"โต้แย้งความคิดเห็น","romanization":"dtôo-yɛ́ɛng khwaam-khít-hěn","english":"debate opinions"}]'),
('ยืนยัน', 'yuuen-yan', 'mid-mid', 'to confirm', 'verb', 'B2', '[{"thai":"ยืนยันข้อมูล","romanization":"yuuen-yan khâaw-muun","english":"confirm information"}]'),
('ปฏิเสธ', 'bpà-dtì-sèet', 'falling-falling-falling', 'to deny/refuse', 'verb', 'B2', '[{"thai":"ปฏิเสธข้อกล่าวหา","romanization":"bpà-dtì-sèet khâaw-glàao-hǎa","english":"deny accusations"}]'),
('สนับสนุน', 'sà-nàp-sà-nǔn', 'falling-falling-falling-rising', 'to support', 'verb', 'B2', '[{"thai":"สนับสนุนโครงการ","romanization":"sà-nàp-sà-nǔn khroo-ing-gaan","english":"support the project"}]'),
('คัดค้าน', 'khát-kháan', 'high-high', 'to oppose', 'verb', 'B2', '[{"thai":"คัดค้านกฎหมาย","romanization":"khát-kháan gòt-mǎai","english":"oppose the law"}]'),
('เสริมสร้าง', 'səəm-sâang', 'mid-high', 'to strengthen/enhance', 'verb', 'B2', '[{"thai":"เสริมสร้างความมั่นคง","romanization":"səəm-sâang khwaam-mân-khong","english":"strengthen stability"}]'),
('ทำลาย', 'tham-laai', 'mid-mid', 'to damage/destroy', 'verb', 'B2', '[{"thai":"ทำลายชื่อเสียง","romanization":"tham-laai chûue-sǐiang","english":"damage reputation"}]'),
('ส่งเสริม', 'sòng-səəm', 'falling-mid', 'to promote', 'verb', 'B2', '[{"thai":"ส่งเสริมการท่องเที่ยว","romanization":"sòng-səəm gaan-thâawng-thîiao","english":"promote tourism"}]'),
('ป้องกัน', 'bpɔ̂ɔng-gan', 'high-mid', 'to prevent', 'verb', 'B2', '[{"thai":"ป้องกันโรค","romanization":"bpɔ̂ɔng-gan rôok","english":"prevent disease"}]'),
('แก้ไข', 'gɛ̂ɛ-khǎi', 'high-rising', 'to solve/fix', 'verb', 'B2', '[{"thai":"แก้ไขปัญหา","romanization":"gɛ̂ɛ-khǎi bpan-hǎa","english":"solve problems"}]'),
('พิจารณา', 'phí-jaa-rá-naa', 'high-mid-high-mid', 'to consider', 'verb', 'B2', '[{"thai":"พิจารณาอย่างรอบคอบ","romanization":"phí-jaa-rá-naa yàang râawp-khâawp","english":"consider carefully"}]'),
('ประสาน', 'bprà-sǎan', 'falling-rising', 'to coordinate', 'verb', 'B2', '[{"thai":"ประสานงาน","romanization":"bprà-sǎan-ngaan","english":"coordinate work"}]'),
('จัดตั้ง', 'jàt-dtâng', 'falling-high', 'to establish', 'verb', 'B2', '[{"thai":"จัดตั้งบริษัท","romanization":"jàt-dtâng baw-rí-sàt","english":"establish a company"}]'),
('ยุบ', 'yúp', 'high', 'to dissolve/close down', 'verb', 'B2', '[{"thai":"ยุบรัฐบาล","romanization":"yúp rát-thà-baan","english":"dissolve government"}]'),
('ขยาย', 'khà-yǎai', 'falling-rising', 'to expand', 'verb', 'B2', '[{"thai":"ขยายธุรกิจ","romanization":"khà-yǎai thú-rá-gìt","english":"expand business"}]'),
('ลดลง', 'lót-long', 'high-mid', 'to decrease', 'verb', 'B2', '[{"thai":"ราคาลดลง","romanization":"raa-khaa lót-long","english":"price decreases"}]'),
('เพิ่มขึ้น', 'phə̂əm-khûen', 'high-high', 'to increase', 'verb', 'B2', '[{"thai":"ยอดขายเพิ่มขึ้น","romanization":"yâawt-khǎai phə̂əm-khûen","english":"sales increase"}]');

-- B2 Nouns & Abstract Concepts (20)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('นโยบาย', 'ná-yoo-baai', 'high-mid-mid', 'policy', 'word', 'B2', '[{"thai":"นโยบายรัฐบาล","romanization":"ná-yoo-baai rát-thà-baan","english":"government policy"}]'),
('กลยุทธ์', 'gon-lá-yút', 'mid-high-high', 'strategy', 'word', 'B2', '[{"thai":"กลยุทธ์ทางธุรกิจ","romanization":"gon-lá-yút thaang thú-rá-gìt","english":"business strategy"}]'),
('ทฤษฎี', 'thrít-sà-dii', 'high-falling-mid', 'theory', 'word', 'B2', '[{"thai":"ทฤษฎีสัมพันธภาพ","romanization":"thrít-sà-dii sǎm-phan-thá-phâap","english":"theory of relativity"}]'),
('หลักการ', 'làk-gaan', 'falling-mid', 'principle', 'word', 'B2', '[{"thai":"หลักการพื้นฐาน","romanization":"làk-gaan phúuen-thǎan","english":"basic principle"}]'),
('แนวคิด', 'nɛɛo-khít', 'mid-high', 'concept', 'word', 'B2', '[{"thai":"แนวคิดใหม่","romanization":"nɛɛo-khít mài","english":"new concept"}]'),
('แนวทาง', 'nɛɛo-thaang', 'mid-mid', 'approach/guideline', 'word', 'B2', '[{"thai":"แนวทางการแก้ปัญหา","romanization":"nɛɛo-thaang gaan-gɛ̂ɛ bpan-hǎa","english":"approach to solving problems"}]'),
('ผลกระทบ', 'phǒn-grà-thóp', 'rising-falling-high', 'impact/effect', 'word', 'B2', '[{"thai":"ผลกระทบต่อสิ่งแวดล้อม","romanization":"phǒn-grà-thóp dtàw sìng-wɛ̂ɛt-lɔ́ɔm","english":"environmental impact"}]'),
('สาเหตุ', 'sǎa-hèet', 'rising-falling', 'cause/reason', 'word', 'B2', '[{"thai":"สาเหตุของปัญหา","romanization":"sǎa-hèet khǎawng bpan-hǎa","english":"cause of the problem"}]'),
('ผลลัพธ์', 'phǒn-lá-phát', 'rising-high-high', 'result/outcome', 'word', 'B2', '[{"thai":"ผลลัพธ์ที่ดี","romanization":"phǒn-lá-phát thîi dii","english":"good result"}]'),
('ข้อดี', 'khâaw-dii', 'high-mid', 'advantage', 'word', 'B2', '[{"thai":"มีข้อดีหลายอย่าง","romanization":"mii khâaw-dii lǎai-yàang","english":"has many advantages"}]'),
('ข้อเสีย', 'khâaw-sǐa', 'high-rising', 'disadvantage', 'word', 'B2', '[{"thai":"ข้อเสียที่ต้องพิจารณา","romanization":"khâaw-sǐa thîi dtɔ̂ɔng phí-jaa-rá-naa","english":"disadvantage to consider"}]'),
('มุมมอง', 'mum-maawng', 'mid-mid', 'perspective/viewpoint', 'word', 'B2', '[{"thai":"มุมมองที่แตกต่าง","romanization":"mum-maawng thîi dtɛ̀ɛk-dtàang","english":"different perspective"}]'),
('ทัศนคติ', 'thát-sà-ná-khá-dtì', 'high-falling-high-high-falling', 'attitude', 'word', 'B2', '[{"thai":"ทัศนคติเชิงบวก","romanization":"thát-sà-ná-khá-dtì chəəng-buuak","english":"positive attitude"}]'),
('ค่านิยม', 'khâa-ní-yom', 'high-high-mid', 'value/belief', 'word', 'B2', '[{"thai":"ค่านิยมทางสังคม","romanization":"khâa-ní-yom thaang sǎng-khom","english":"social values"}]'),
('มาตรฐาน', 'mâat-dtrà-thǎan', 'high-falling-rising', 'standard', 'word', 'B2', '[{"thai":"มาตรฐานสากล","romanization":"mâat-dtrà-thǎan sǎa-gon","english":"international standard"}]'),
('ข้อมูล', 'khâaw-muun', 'high-mid', 'data/information', 'word', 'B2', '[{"thai":"วิเคราะห์ข้อมูล","romanization":"wí-khrór khâaw-muun","english":"analyze data"}]'),
('หลักฐาน', 'làk-thǎan', 'falling-rising', 'evidence', 'word', 'B2', '[{"thai":"หลักฐานที่ชัดเจน","romanization":"làk-thǎan thîi chát-jeen","english":"clear evidence"}]'),
('ข้อสรุป', 'khâaw-sà-rùp', 'high-falling-falling', 'conclusion', 'word', 'B2', '[{"thai":"ข้อสรุปจากการวิจัย","romanization":"khâaw-sà-rùp jàak gaan-wí-jai","english":"conclusion from research"}]'),
('ความเห็น', 'khwaam-hěn', 'mid-rising', 'opinion', 'word', 'B2', '[{"thai":"แสดงความเห็น","romanization":"sà-dɛɛng khwaam-hěn","english":"express opinion"}]'),
('ข้อโต้แย้ง', 'khâaw-dtôo-yɛ́ɛng', 'high-high-high', 'argument/counterargument', 'word', 'B2', '[{"thai":"ข้อโต้แย้งที่น่าสนใจ","romanization":"khâaw-dtôo-yɛ́ɛng thîi nâa-sǒn-jai","english":"interesting argument"}]');

-- B2 Advanced Adjectives (10)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('สำคัญยิ่ง', 'sǎm-khan-yîng', 'rising-mid-high', 'crucial', 'word', 'B2', '[{"thai":"ประเด็นสำคัญยิ่ง","romanization":"bprà-den sǎm-khan-yîng","english":"crucial issue"}]'),
('มีนัยสำคัญ', 'mii-nai-sǎm-khan', 'mid-mid-rising-mid', 'significant', 'word', 'B2', '[{"thai":"การเปลี่ยนแปลงที่มีนัยสำคัญ","romanization":"gaan-bplìian-bplɛɛng thîi mii-nai-sǎm-khan","english":"significant change"}]'),
('คาดเดา', 'khâat-dao', 'high-mid', 'to predict/guess', 'word', 'B2', '[{"thai":"ยากที่จะคาดเดา","romanization":"yâak thîi-jà khâat-dao","english":"difficult to predict"}]'),
('น่าเชื่อถือ', 'nâa-chûuea-thǔue', 'high-high-rising', 'reliable/credible', 'word', 'B2', '[{"thai":"แหล่งข้อมูลน่าเชื่อถือ","romanization":"lɛ̀ng khâaw-muun nâa-chûuea-thǔue","english":"reliable source"}]'),
('น่าสงสัย', 'nâa-sǒng-sǎi', 'high-rising-rising', 'suspicious/doubtful', 'word', 'B2', '[{"thai":"พฤติกรรมน่าสงสัย","romanization":"phrúe-dtì-gam nâa-sǒng-sǎi","english":"suspicious behavior"}]'),
('ขัดแย้ง', 'khàt-yɛ́ɛng', 'falling-high', 'contradictory/conflicting', 'word', 'B2', '[{"thai":"ความคิดเห็นที่ขัดแย้ง","romanization":"khwaam-khít-hěn thîi khàt-yɛ́ɛng","english":"conflicting opinions"}]'),
('สอดคล้อง', 'sàwt-khláawng', 'falling-high', 'consistent', 'word', 'B2', '[{"thai":"สอดคล้องกับข้อมูล","romanization":"sàwt-khláawng gàp khâaw-muun","english":"consistent with data"}]'),
('ครอบคลุม', 'khrâawp-khlum', 'high-mid', 'comprehensive', 'word', 'B2', '[{"thai":"การศึกษาที่ครอบคลุม","romanization":"gaan-sùk-sǎa thîi khrâawp-khlum","english":"comprehensive study"}]'),
('แม่นยำ', 'mɛ̂ɛn-yam', 'high-mid', 'accurate/precise', 'word', 'B2', '[{"thai":"ข้อมูลแม่นยำ","romanization":"khâaw-muun mɛ̂ɛn-yam","english":"accurate data"}]'),
('เป็นกลาง', 'bpen-glaang', 'mid-mid', 'neutral/impartial', 'word', 'B2', '[{"thai":"มุมมองที่เป็นกลาง","romanization":"mum-maawng thîi bpen-glaang","english":"neutral perspective"}]');

-- B2 Formal Connectors (10)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('ยิ่งไปกว่านั้น', 'yîng-bpai-gwàa-nán', 'high-mid-falling-high', 'moreover/furthermore', 'word', 'B2', '[{"thai":"ยิ่งไปกว่านั้น ยังมีข้อดีอีกมาก","romanization":"yîng-bpai-gwàa-nán yang-mii khâaw-dii ìik mâak","english":"moreover, there are many more advantages"}]'),
('นอกจากนี้', 'nâawk-jàak-níi', 'high-falling-high', 'besides/in addition', 'word', 'B2', '[{"thai":"นอกจากนี้ยังมีปัญหาอื่น","romanization":"nâawk-jàak-níi yang-mii bpan-hǎa ùuen","english":"besides, there are other problems"}]'),
('ในทางตรงกันข้าม', 'nai-thaang-dtrong-gan-khâam', 'mid-mid-mid-mid-high', 'on the contrary', 'word', 'B2', '[{"thai":"ในทางตรงกันข้าม เราพบว่า","romanization":"nai-thaang-dtrong-gan-khâam rao phóp wâa","english":"on the contrary, we found that"}]'),
('อันที่จริง', 'an-thîi-jing', 'mid-high-mid', 'in fact/actually', 'word', 'B2', '[{"thai":"อันที่จริงแล้ว เรื่องนี้ซับซ้อน","romanization":"an-thîi-jing-lɛ́ɛo rûuang-níi sáp-sɔ́ɔn","english":"in fact, this matter is complex"}]'),
('จากที่ได้กล่าวมา', 'jàak-thîi-dâai-glàao-maa', 'falling-high-high-falling-mid', 'as mentioned', 'word', 'B2', '[{"thai":"จากที่ได้กล่าวมา จะเห็นว่า","romanization":"jàak-thîi-dâai-glàao-maa jà-hěn-wâa","english":"as mentioned, it can be seen that"}]'),
('เท่าที่ทราบ', 'thâo-thîi-sâap', 'high-high-high', 'as far as known', 'word', 'B2', '[{"thai":"เท่าที่ทราบ ยังไม่มีข้อมูล","romanization":"thâo-thîi-sâap yang-mâi-mii khâaw-muun","english":"as far as known, there is no data yet"}]'),
('โดยสรุป', 'dooy-sà-rùp', 'mid-falling-falling', 'in summary', 'word', 'B2', '[{"thai":"โดยสรุปแล้ว เราสามารถ","romanization":"dooy-sà-rùp-lɛ́ɛo rao-sǎa-mâat","english":"in summary, we can"}]'),
('ทั้งนี้', 'tháng-níi', 'high-high', 'in this regard/hereby', 'word', 'B2', '[{"thai":"ทั้งนี้ขึ้นอยู่กับสถานการณ์","romanization":"tháng-níi khûen-yùu-gàp sà-thǎa-ná-gaan","english":"this depends on the situation"}]'),
('เว้นแต่', 'wén-dtɛ̀ɛ', 'high-falling', 'unless/except', 'word', 'B2', '[{"thai":"เว้นแต่จะมีเหตุผลพิเศษ","romanization":"wén-dtɛ̀ɛ jà-mii hèet-phǒn phí-sèet","english":"unless there is a special reason"}]'),
('ทว่า', 'thá-wâa', 'high-high', 'but/however (formal)', 'word', 'B2', '[{"thai":"ทว่าเราไม่สามารถ","romanization":"thá-wâa rao-mâi-sǎa-mâat","english":"however, we cannot"}]');

-- ============================================
-- C1 Level - Advanced (40 entries)
-- ============================================

-- C1 Verbs (15)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('กระตุ้น', 'grà-dtûn', 'falling-high', 'to stimulate/provoke', 'verb', 'C1', '[{"thai":"กระตุ้นเศรษฐกิจ","romanization":"grà-dtûn sèet-thà-gìt","english":"stimulate the economy"}]'),
('จูงใจ', 'juung-jai', 'mid-mid', 'to motivate/persuade', 'verb', 'C1', '[{"thai":"จูงใจลูกค้า","romanization":"juung-jai lûuk-kháa","english":"motivate customers"}]'),
('บ่อนทำลาย', 'bàwn-tham-laai', 'falling-mid-mid', 'to undermine', 'verb', 'C1', '[{"thai":"บ่อนทำลายความเชื่อมั่น","romanization":"bàwn-tham-laai khwaam-chûuea-mân","english":"undermine confidence"}]'),
('ทำนาย', 'tham-naai', 'mid-mid', 'to predict/forecast', 'verb', 'C1', '[{"thai":"ทำนายแนวโน้ม","romanization":"tham-naai nɛɛo-nóo","english":"forecast trends"}]'),
('คาดการณ์', 'khâat-gaan', 'high-mid', 'to anticipate', 'verb', 'C1', '[{"thai":"คาดการณ์ผลกระทบ","romanization":"khâat-gaan phǒn-grà-thóp","english":"anticipate impact"}]'),
('ย้อนกลับ', 'yáawn-glàp', 'high-falling', 'to reverse', 'verb', 'C1', '[{"thai":"ย้อนกลับสถานการณ์","romanization":"yáawn-glàp sà-thǎa-ná-gaan","english":"reverse the situation"}]'),
('แทรกแซง', 'sɛ̂ɛk-sɛɛng', 'high-mid', 'to intervene', 'verb', 'C1', '[{"thai":"แทรกแซงกระบวนการ","romanization":"sɛ̂ɛk-sɛɛng grà-buan-gaan","english":"intervene in the process"}]'),
('ถอนตัว', 'thǎawn-dtuua', 'rising-mid', 'to withdraw', 'verb', 'C1', '[{"thai":"ถอนตัวจากโครงการ","romanization":"thǎawn-dtuua jàak khroo-ing-gaan","english":"withdraw from the project"}]'),
('หลีกเลี่ยง', 'lìik-lîiang', 'falling-high', 'to avoid', 'verb', 'C1', '[{"thai":"หลีกเลี่ยงความขัดแย้ง","romanization":"lìik-lîiang khwaam-khàt-yɛ́ɛng","english":"avoid conflict"}]'),
('เจรจา', 'jeen-rá-jaa', 'mid-high-mid', 'to negotiate', 'verb', 'C1', '[{"thai":"เจรจาข้อตกลง","romanization":"jeen-rá-jaa khâaw-dtòk-long","english":"negotiate an agreement"}]'),
('ประนีประนอม', 'bprà-nii-bprà-naawm', 'falling-mid-falling-mid', 'to compromise', 'verb', 'C1', '[{"thai":"ประนีประนอมกัน","romanization":"bprà-nii-bprà-naawm gan","english":"compromise with each other"}]'),
('เข้าข้าง', 'khâo-khâang', 'high-high', 'to side with/favor', 'verb', 'C1', '[{"thai":"เข้าข้างฝ่ายใดฝ่ายหนึ่ง","romanization":"khâo-khâang fàai-dai-fàai-nùeng","english":"side with one party"}]'),
('ครอบงำ', 'khrâawp-ngam', 'high-mid', 'to dominate', 'verb', 'C1', '[{"thai":"ครอบงำตลาด","romanization":"khrâawp-ngam dtà-làat","english":"dominate the market"}]'),
('เอาเปรียบ', 'ao-bprìiap', 'mid-falling', 'to take advantage', 'verb', 'C1', '[{"thai":"เอาเปรียบผู้อื่น","romanization":"ao-bprìiap phûu-ùuen","english":"take advantage of others"}]'),
('ปิดบัง', 'bpìt-bang', 'falling-mid', 'to conceal/hide', 'verb', 'C1', '[{"thai":"ปิดบังข้อเท็จจริง","romanization":"bpìt-bang khâaw-thét-jing","english":"conceal the truth"}]');

-- C1 Nouns & Complex Concepts (15)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('ภาระผูกพัน', 'phaa-rá-phùuk-phan', 'mid-high-falling-mid', 'obligation', 'word', 'C1', '[{"thai":"ภาระผูกพันทางกฎหมาย","romanization":"phaa-rá-phùuk-phan thaang gòt-mǎai","english":"legal obligation"}]'),
('ความเสี่ยง', 'khwaam-sìiang', 'mid-falling', 'risk', 'word', 'C1', '[{"thai":"ประเมินความเสี่ยง","romanization":"bprà-məən khwaam-sìiang","english":"assess risk"}]'),
('ความไม่แน่นอน', 'khwaam-mâi-nɛ̂ɛ-nəən', 'mid-high-high-mid', 'uncertainty', 'word', 'C1', '[{"thai":"ความไม่แน่นอนทางเศรษฐกิจ","romanization":"khwaam-mâi-nɛ̂ɛ-nəən thaang sèet-thà-gìt","english":"economic uncertainty"}]'),
('ความโปร่งใส', 'khwaam-bprôong-sǎi', 'mid-falling-rising', 'transparency', 'word', 'C1', '[{"thai":"ความโปร่งใสในการบริหาร","romanization":"khwaam-bprôong-sǎi nai-gaan baw-rí-hǎan","english":"transparency in management"}]'),
('คอร์รัปชั่น', 'khaaw-ráp-chân', 'mid-high-high', 'corruption', 'word', 'C1', '[{"thai":"ต่อสู้คอร์รัปชั่น","romanization":"dtàw-sûu khaaw-ráp-chân","english":"fight corruption"}]'),
('ความยุติธรรม', 'khwaam-yút-dtì-tham', 'mid-high-falling-mid', 'justice', 'word', 'C1', '[{"thai":"ระบบความยุติธรรม","romanization":"rá-bòp khwaam-yút-dtì-tham","english":"justice system"}]'),
('อคติ', 'à-khá-dtì', 'falling-high-falling', 'prejudice/bias', 'word', 'C1', '[{"thai":"ปราศจากอคติ","romanization":"bpràat-jàak à-khá-dtì","english":"free from prejudice"}]'),
('เงื่อนไข', 'ngûuean-khǎi', 'high-rising', 'condition/terms', 'word', 'C1', '[{"thai":"เงื่อนไขการจ้างงาน","romanization":"ngûuean-khǎi gaan-jâang-ngaan","english":"employment terms"}]'),
('ภาวะ', 'phaa-wá', 'mid-high', 'state/condition', 'word', 'C1', '[{"thai":"ภาวะเศรษฐกิจ","romanization":"phaa-wá sèet-thà-gìt","english":"economic condition"}]'),
('ประสิทธิผล', 'bprà-sìt-thì-phǒn', 'falling-falling-falling-rising', 'effectiveness', 'word', 'C1', '[{"thai":"ประสิทธิผลของนโยบาย","romanization":"bprà-sìt-thì-phǒn khǎawng ná-yoo-baai","english":"policy effectiveness"}]'),
('ข้อจำกัด', 'khâaw-jam-gàt', 'high-mid-falling', 'limitation/constraint', 'word', 'C1', '[{"thai":"ข้อจำกัดด้านงบประมาณ","romanization":"khâaw-jam-gàt dâan ngóp-bprà-maan","english":"budget constraint"}]'),
('โครงสร้าง', 'khrong-sâang', 'mid-high', 'structure', 'word', 'C1', '[{"thai":"โครงสร้างองค์กร","romanization":"khrong-sâang ong-gorn","english":"organizational structure"}]'),
('กลไก', 'gon-lái', 'mid-mid', 'mechanism', 'word', 'C1', '[{"thai":"กลไกตลาด","romanization":"gon-lái dtà-làat","english":"market mechanism"}]'),
('ปรากฏการณ์', 'bpraa-gòt-gaan', 'mid-falling-mid', 'phenomenon', 'word', 'C1', '[{"thai":"ปรากฏการณ์ทางธรรมชาติ","romanization":"bpraa-gòt-gaan thaang tham-má-châat","english":"natural phenomenon"}]'),
('บทบาท', 'bòt-bàat', 'falling-falling', 'role', 'word', 'C1', '[{"thai":"บทบาทสำคัญ","romanization":"bòt-bàat sǎm-khan","english":"important role"}]');

-- C1 Advanced Expressions (10)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('โดยนัย', 'dooy-nai', 'mid-mid', 'implicitly', 'word', 'C1', '[{"thai":"บอกโดยนัย","romanization":"bàawk dooy-nai","english":"imply/suggest indirectly"}]'),
('แฝงไว้', 'fɛ̌ɛng-wái', 'rising-high', 'latent/hidden', 'word', 'C1', '[{"thai":"ความหมายแฝงไว้","romanization":"khwaam-mǎai fɛ̌ɛng-wái","english":"hidden meaning"}]'),
('กระบวนทัศน์', 'grà-buan-thát', 'falling-mid-high', 'paradigm', 'word', 'C1', '[{"thai":"เปลี่ยนกระบวนทัศน์","romanization":"bplìian grà-buan-thát","english":"paradigm shift"}]'),
('ความชอบธรรม', 'khwaam-châawp-tham', 'mid-high-mid', 'legitimacy', 'word', 'C1', '[{"thai":"ความชอบธรรมทางกฎหมาย","romanization":"khwaam-châawp-tham thaang gòt-mǎai","english":"legal legitimacy"}]'),
('หลักนิติธรรม', 'làk-ní-dtì-tham', 'falling-high-falling-mid', 'rule of law', 'word', 'C1', '[{"thai":"ยึดมั่นในหลักนิติธรรม","romanization":"yúuet-mân nai làk-ní-dtì-tham","english":"adhere to the rule of law"}]'),
('ความขัดแย้ง', 'khwaam-khàt-yɛ́ɛng', 'mid-falling-high', 'conflict', 'word', 'C1', '[{"thai":"แก้ไขความขัดแย้ง","romanization":"gɛ̂ɛ-khǎi khwaam-khàt-yɛ́ɛng","english":"resolve conflict"}]'),
('ประนีประนอม', 'bprà-nii-bprà-naawm', 'falling-mid-falling-mid', 'compromise', 'word', 'C1', '[{"thai":"แสวงหาประนีประนอม","romanization":"sà-wɛ̌ɛng-hǎa bprà-nii-bprà-naawm","english":"seek compromise"}]'),
('เสริมพลัง', 'səəm-phlang', 'mid-mid', 'empowerment', 'word', 'C1', '[{"thai":"เสริมพลังชุมชน","romanization":"səəm-phlang chum-chon","english":"community empowerment"}]'),
('ผลประโยชน์', 'phǒn-bprà-yòot', 'rising-falling-falling', 'interest/benefit', 'word', 'C1', '[{"thai":"ผลประโยชน์ทับซ้อน","romanization":"phǒn-bprà-yòot tháp-sɔ́ɔn","english":"conflict of interest"}]'),
('เพื่อประโยชน์', 'phûuea-bprà-yòot', 'high-falling-falling', 'for the benefit of', 'word', 'C1', '[{"thai":"เพื่อประโยชน์สาธารณะ","romanization":"phûuea-bprà-yòot sǎa-thaa-rá-ná","english":"for public benefit"}]');

-- ============================================
-- C2 Level - Mastery (20 entries)
-- ============================================

-- C2 Advanced Verbs & Expressions (20)
INSERT INTO entries (thai_script, romanization, tone, meaning, entry_type, cefr_level, examples) VALUES
('เกื้อกูล', 'gûuea-guun', 'high-mid', 'to support/assist (formal)', 'verb', 'C2', '[{"thai":"เกื้อกูลซึ่งกันและกัน","romanization":"gûuea-guun sûeng-gan-lɛ́-gan","english":"mutually support each other"}]'),
('ผลักดัน', 'phlàk-dan', 'falling-mid', 'to push forward/promote', 'verb', 'C2', '[{"thai":"ผลักดันนโยบาย","romanization":"phlàk-dan ná-yoo-baai","english":"push forward policy"}]'),
('หยั่งรู้', 'yàng-rúu', 'falling-high', 'to fathom/understand deeply', 'verb', 'C2', '[{"thai":"หยั่งรู้ในจิตใจ","romanization":"yàng-rúu nai jìt-jai","english":"understand the heart/mind deeply"}]'),
('กล่อมเกลี้ยง', 'glàwm-glîiang', 'falling-high', 'to persuade/cajole', 'verb', 'C2', '[{"thai":"กล่อมเกลี้ยงให้เปลี่ยนใจ","romanization":"glàwm-glîiang hâi bplìian-jai","english":"persuade to change mind"}]'),
('พิสูจน์', 'phí-sùut', 'high-falling', 'to prove/verify', 'verb', 'C2', '[{"thai":"พิสูจน์ข้อเท็จจริง","romanization":"phí-sùut khâaw-thét-jing","english":"prove the truth"}]'),
('ประชดประชัน', 'bprà-chót-bprà-chan', 'falling-high-falling-mid', 'to compete/rival', 'verb', 'C2', '[{"thai":"ประชดประชันความสามารถ","romanization":"bprà-chót-bprà-chan khwaam-sǎa-mâat","english":"compete in ability"}]'),
('คลี่คลาย', 'khlîi-khlaai', 'high-mid', 'to resolve/unravel', 'verb', 'C2', '[{"thai":"คลี่คลายความขัดแย้ง","romanization":"khlîi-khlaai khwaam-khàt-yɛ́ɛng","english":"resolve conflicts"}]'),
('หย่อนยาน', 'yàwn-yaan', 'falling-mid', 'to deteriorate/decline', 'verb', 'C2', '[{"thai":"สุขภาพหย่อนยาน","romanization":"sùk-khà-phâap yàwn-yaan","english":"health deteriorates"}]'),
('สะท้อน', 'sà-tháawn', 'falling-high', 'to reflect', 'verb', 'C2', '[{"thai":"สะท้อนความเป็นจริง","romanization":"sà-tháawn khwaam-bpen-jing","english":"reflect reality"}]'),
('ประนีประนม', 'bprà-nii-bprà-nom', 'falling-mid-falling-mid', 'to be meticulous', 'verb', 'C2', '[{"thai":"ทำงานอย่างประนีประนม","romanization":"tham-ngaan yàang bprà-nii-bprà-nom","english":"work meticulously"}]'),
('ความคลุมเครือ', 'khwaam-khlum-khruuea', 'mid-mid-mid', 'ambiguity', 'word', 'C2', '[{"thai":"หลีกเลี่ยงความคลุมเครือ","romanization":"lìik-lîiang khwaam-khlum-khruuea","english":"avoid ambiguity"}]'),
('ความซับซ้อน', 'khwaam-sáp-sɔ́ɔn', 'mid-high-high', 'complexity', 'word', 'C2', '[{"thai":"ความซับซ้อนของปัญหา","romanization":"khwaam-sáp-sɔ́ɔn khǎawng bpan-hǎa","english":"complexity of the problem"}]'),
('ความเข้มงวด', 'khwaam-khêm-nguuat', 'mid-high-high', 'stringency/strictness', 'word', 'C2', '[{"thai":"ความเข้มงวดของกฎหมาย","romanization":"khwaam-khêm-nguuat khǎawng gòt-mǎai","english":"legal stringency"}]'),
('ความลึกซึ้ง', 'khwaam-lúek-súeng', 'mid-high-high', 'profundity/depth', 'word', 'C2', '[{"thai":"ความคิดที่ลึกซึ้ง","romanization":"khwaam-khít thîi lúek-súeng","english":"profound thought"}]'),
('นัยยะ', 'nai-yá', 'mid-high', 'implication', 'word', 'C2', '[{"thai":"นัยยะทางปรัชญา","romanization":"nai-yá thaang bpràt-yaa","english":"philosophical implication"}]'),
('อุดมการณ์', 'ù-dom-gaan', 'falling-mid-mid', 'ideology', 'word', 'C2', '[{"thai":"อุดมการณ์ทางการเมือง","romanization":"ù-dom-gaan thaang gaan-muuang","english":"political ideology"}]'),
('อภิปรัชญา', 'à-phíp-bprát-yaa', 'falling-high-falling-mid', 'metaphysics', 'word', 'C2', '[{"thai":"อภิปรัชญาตะวันตก","romanization":"à-phíp-bprát-yaa dtà-wan-dtòk","english":"Western metaphysics"}]'),
('ญาณวิทยา', 'yaan-wít-thá-yaa', 'mid-high-high-mid', 'epistemology', 'word', 'C2', '[{"thai":"ปัญหาทางญาณวิทยา","romanization":"bpan-hǎa thaang yaan-wít-thá-yaa","english":"epistemological problem"}]'),
('จริยธรรม', 'jà-rì-yá-tham', 'mid-falling-high-mid', 'ethics', 'word', 'C2', '[{"thai":"จริยธรรมทางธุรกิจ","romanization":"jà-rì-yá-tham thaang thú-rá-gìt","english":"business ethics"}]'),
('สุนทรียศาสตร์', 'sǔn-thaaw-rii-yá-sàat', 'rising-mid-mid-high-falling', 'aesthetics', 'word', 'C2', '[{"thai":"หลักสุนทรียศาสตร์","romanization":"làk sǔn-thaaw-rii-yá-sàat","english":"principles of aesthetics"}]');

-- Final commit message
-- Total entries: 300 (A1: 60, A2: 60, B1: 60, B2: 60, C1: 40, C2: 20)
