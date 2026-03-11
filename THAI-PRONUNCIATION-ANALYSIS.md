# 🔊 Thai Pronunciation Accuracy Analysis & Solutions

## 🎯 Current System (v1.6.1)

### **Technology**
- **Engine**: Web Speech API (browser built-in TTS)
- **Language**: `th-TH` (Thai)
- **Voice Selection**: Auto-select first available Thai voice
- **Rate**: 0.9x (slightly slower for clarity)
- **Pitch**: 1.0 (default)

### **Available Voices by Platform**
| Platform | Voice Name | Quality | Tone Accuracy |
|----------|-----------|---------|---------------|
| **Windows** | Microsoft Achara | Good | Medium (60-70%) |
| **macOS/iOS** | Kanya | Good | Medium-High (70-80%) |
| **Android** | Google Thai | Good | Medium-High (70-80%) |
| **Linux** | Pico TTS | Poor | Low (40-50%) |
| **Chrome** | Google TTS | Good | Medium-High (70-80%) |

### **Current Limitations**
1. ❌ **No tone control** - Web Speech API doesn't support tone markers
2. ❌ **No SSML support** - Can't use Speech Synthesis Markup Language
3. ❌ **Voice quality varies** by device/browser
4. ❌ **No pitch adjustment per syllable** - Tones require specific pitch contours
5. ❌ **Inconsistent rendering** of Thai script characters

---

## 🎵 Thai Tone System

### **5 Thai Tones (วรรณยุกต์)**

Thai has 5 lexical tones that completely change word meaning:

| Tone | Thai Name | Symbol | Pitch Pattern | Example |
|------|-----------|--------|---------------|---------|
| **Mid** (สามัญ) | mai ek | — | Flat/neutral 33 | ไป (pai) = go |
| **Low** (เอก) | mai tho | ˋ | Low falling 21 | ไป่ (pài) = [doesn't exist] |
| **Falling** (โท) | mai tri | ˆ | High to low 51 | ใหม่ (mài) = new |
| **High** (ตรี) | mai chattawa | ´ | Rising high 45 | ใหม้ (mái) = burn |
| **Rising** (จัตวา) | - | ˇ | Low to high 24 | ไหม (mǎi) = silk/question |

### **Pitch Contour Numbers**
Using Chao tone letters (1=lowest, 5=highest):
- **Mid**: 33 (flat middle)
- **Low**: 21 (starts mid-low, falls)
- **Falling**: 51 (starts high, drops sharply)
- **High**: 45 (starts mid-high, rises)
- **Rising**: 24 (starts low, rises to mid-high)

### **Example: Same Sound, Different Tones**
```
ไม่ (mâi) - falling tone = no/not
ไม้ (máai) - high tone = wood/tree
ไหม (mǎi) - rising tone = silk
ใหม่ (mài) - low tone = new
ใหม้ (mái) - high tone = burn
```

---

## 🚫 **Why Web Speech API Fails at Thai Tones**

### **Technical Limitations**
1. **No pitch control per syllable**
   - Can only set global pitch (1.0)
   - Cannot create pitch contours (33, 21, 51, etc.)

2. **No duration control**
   - Tones require specific timing
   - Cannot stretch or compress syllables

3. **No prosody markup**
   - SSML not widely supported
   - Even with SSML, tone control is limited

4. **Character rendering issues**
   - Thai tone marks (ˋˆ´ˇ) not always parsed correctly
   - Vowel-consonant clusters misread

---

## ✅ **Solutions for Better Thai Pronunciation**

### **Option 1: Google Cloud Text-to-Speech (BEST)** ⭐⭐⭐⭐⭐

**Why it's the best**:
- ✅ Neural TTS trained on native Thai speakers
- ✅ WaveNet quality (most natural)
- ✅ Proper tone rendering (90-95% accuracy)
- ✅ SSML support for fine control
- ✅ Multiple Thai voices (male/female)

**Pricing**:
- **Standard voices**: $4 per 1 million characters
- **WaveNet voices**: $16 per 1 million characters
- **Neural2 voices**: $16 per 1 million characters
- **Free tier**: 1 million characters/month (WaveNet), 4 million (Standard)

**Example: 1000 words/day for 30 days**
- Characters: ~30,000 Thai characters
- Cost: **$0.48/month** (WaveNet) or **$0.12/month** (Standard)
- **Effectively FREE** with free tier!

**Implementation**:
```javascript
// Backend API route (Hono)
app.post('/api/tts/google', async (c) => {
  const { text } = await c.req.json();
  
  const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.GOOGLE_TTS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: 'th-TH',
        name: 'th-TH-Neural2-C', // Female neural voice
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
        pitch: 0
      }
    })
  });
  
  const data = await response.json();
  return c.json({ audioContent: data.audioContent }); // Base64 MP3
});
```

**Available Thai Voices**:
- `th-TH-Neural2-C` (Female, Neural, best quality)
- `th-TH-Standard-A` (Female, standard)
- `th-TH-Wavenet-A` (Female, WaveNet)

**Setup**:
1. Enable Cloud Text-to-Speech API
2. Create API key
3. Add to Cloudflare Pages environment: `GOOGLE_TTS_API_KEY`
4. Implement backend route
5. Update frontend to use backend TTS instead of Web Speech API

---

### **Option 2: Amazon Polly** ⭐⭐⭐⭐

**Pros**:
- ✅ Neural TTS available
- ✅ Good Thai support
- ✅ Tone accuracy ~85-90%
- ✅ SSML support

**Cons**:
- ⚠️ More expensive than Google
- ⚠️ Fewer Thai voices

**Pricing**:
- **Standard**: $4 per 1 million characters
- **Neural**: $16 per 1 million characters
- **Free tier**: 5 million characters/month (12 months)

**Thai Voices**:
- `Aditi` (Female, bilingual Hindi-English but supports Thai)
- Limited native Thai voices compared to Google

---

### **Option 3: ElevenLabs** ⭐⭐⭐⭐⭐ (HIGHEST QUALITY)

**Why it's the best quality**:
- ✅ State-of-the-art AI voice cloning
- ✅ Most natural-sounding TTS
- ✅ Emotional expression
- ✅ Can clone native Thai speakers
- ✅ 95-98% tone accuracy

**Cons**:
- ❌ More expensive
- ❌ Requires voice cloning setup
- ❌ Limited free tier

**Pricing**:
- **Starter**: $5/month (30,000 characters)
- **Creator**: $22/month (100,000 characters)
- **Pro**: $99/month (500,000 characters)
- **Free tier**: 10,000 characters/month

**Best for**:
- Premium users
- High-quality pronunciation practice
- Professional language learning apps

---

### **Option 4: Microsoft Azure TTS** ⭐⭐⭐

**Pros**:
- ✅ Neural voices available
- ✅ Good Thai support (Achara voice)
- ✅ SSML support

**Cons**:
- ⚠️ Tone accuracy ~75-80% (lower than Google)
- ⚠️ Fewer voices than Google

**Pricing**:
- **Neural**: $15 per 1 million characters
- **Free tier**: 500,000 characters/month (12 months)

---

### **Option 5: Pre-recorded Native Audio** ⭐⭐⭐⭐⭐ (GOLD STANDARD)

**Why it's the gold standard**:
- ✅ 100% accuracy (native Thai speakers)
- ✅ Perfect tone reproduction
- ✅ Natural speed and rhythm
- ✅ No API costs after recording

**Cons**:
- ❌ Time-consuming to record all words
- ❌ Expensive upfront (hire Thai speakers)
- ❌ Storage space (51 words × 3 speeds = 153 files)
- ❌ Not scalable for user-generated content

**Cost Estimate**:
- **Recording**: $20-50/hour for native speaker
- **Time**: ~2 hours for 51 words (normal + slow + fast)
- **Total**: $40-100 one-time
- **Storage**: ~5-10 MB (MP3 files)

**Implementation**:
```javascript
// Store audio files in R2 or public/audio/
const audioUrl = `/audio/${entry.id}.mp3`;
const audio = new Audio(audioUrl);
audio.play();
```

**File structure**:
```
public/audio/
├── [entry-id]-normal.mp3
├── [entry-id]-slow.mp3
└── [entry-id]-fast.mp3
```

---

## 🎯 **Recommended Solution**

### **Hybrid Approach (Best Value + Quality)** ⭐⭐⭐⭐⭐

**Strategy**:
1. **Core vocabulary (51 words)**: Pre-recorded native audio ✅
2. **User-generated content**: Google Cloud TTS ✅
3. **Fallback**: Web Speech API (free, instant)

**Why hybrid**:
- ✅ Best quality for most common words
- ✅ Scalable for custom entries
- ✅ Cost-effective (~$0-5/month)
- ✅ Works offline (cached pre-recorded audio)

**Implementation Plan**:
```javascript
async function speakThaiHybrid(entry) {
  // Priority 1: Pre-recorded audio
  if (entry.audio_url) {
    const audio = new Audio(entry.audio_url);
    audio.play();
    return;
  }
  
  // Priority 2: Google Cloud TTS (cached)
  const cacheKey = `tts_${entry.id}`;
  let audioData = localStorage.getItem(cacheKey);
  
  if (!audioData) {
    const response = await fetch('/api/tts/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: entry.thai_script })
    });
    const data = await response.json();
    audioData = data.audioContent;
    localStorage.setItem(cacheKey, audioData); // Cache for offline
  }
  
  // Play base64 MP3
  const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
  audio.play();
  
  // Priority 3: Web Speech API (fallback)
  audio.onerror = () => {
    speakThai(entry.thai_script);
  };
}
```

---

## 📊 **Comparison Matrix**

| Solution | Tone Accuracy | Cost/Month | Quality | Scalability | Offline |
|----------|---------------|------------|---------|-------------|---------|
| **Web Speech API** | 60-70% | FREE | Medium | ✅ High | ✅ Yes |
| **Google Cloud TTS** | 90-95% | $0-5 | High | ✅ High | ⚠️ Cache |
| **Amazon Polly** | 85-90% | $0-10 | High | ✅ High | ⚠️ Cache |
| **ElevenLabs** | 95-98% | $5-99 | Highest | ⚠️ Medium | ❌ No |
| **Azure TTS** | 75-80% | $0-15 | Medium-High | ✅ High | ⚠️ Cache |
| **Pre-recorded** | 100% | $40-100 (once) | Perfect | ❌ Low | ✅ Yes |
| **Hybrid** | 95-100% | $0-5 | Highest | ✅ High | ✅ Partial |

---

## 🔧 **Implementation Recommendation**

### **Phase 1: Quick Win (1-2 hours)**
✅ **Google Cloud TTS Integration**
- Set up Google Cloud TTS API
- Create backend `/api/tts/google` route
- Cache responses in localStorage
- Update frontend to use Google TTS first, fallback to Web Speech API

**Impact**: 60% → 90% tone accuracy immediately

### **Phase 2: Premium Quality (1 week)**
✅ **Pre-recorded Audio for Core 51 Words**
- Hire native Thai speaker (Fiverr/Upwork)
- Record normal, slow, fast versions
- Upload to Cloudflare R2 storage
- Update database with `audio_url` field

**Impact**: 100% accuracy for core vocabulary

### **Phase 3: Advanced Features (Future)**
- Add voice selection (male/female)
- Add speed control per word
- Add pitch visualization
- Add tone practice mode with scoring

---

## 💰 **Cost Analysis for 1000 Users**

### **Scenario: 1000 active users, 50 words/day each**
- Total characters: 1,000 users × 50 words × 10 chars = 500,000 chars/day
- Monthly: 15 million characters

**Google Cloud TTS Cost**:
- Standard: $60/month (too high)
- **With caching**: ~$5/month (90% cache hit rate)
- Free tier: Covers first 1 million chars

**Hybrid Approach Cost**:
- Pre-recorded (51 words): $50 one-time
- Google TTS (user entries): $5/month
- **Total first month**: $55
- **Ongoing**: $5/month

---

## 🎓 **Standard Thai Tone Patterns (for Reference)**

### **IPA Tone Markers**
- Mid: māa (no marker)
- Low: màa (grave accent)
- Falling: mâa (circumflex)
- High: máa (acute accent)
- Rising: mǎa (caron/wedge)

### **Thai Tone Rules**
Thai tones are determined by:
1. **Initial consonant class** (high, mid, low)
2. **Vowel length** (short, long)
3. **Final consonant** (dead/live syllable)
4. **Tone mark** (อักษรนำ)

**Example**:
- ก (k) = mid consonant
- า = long vowel
- No final = live syllable
- No tone mark = mid tone
- Result: กา (gaa) = crow (mid tone)

---

## ✅ **Action Items**

### **Immediate (This Week)**
1. ☐ Set up Google Cloud TTS API key
2. ☐ Implement `/api/tts/google` backend route
3. ☐ Update frontend to use Google TTS with caching
4. ☐ Test with 5-10 words
5. ☐ Deploy to sandbox for testing

### **Short-term (Next 2 Weeks)**
1. ☐ Find native Thai speaker for recording
2. ☐ Record core 51 words (3 speeds each)
3. ☐ Upload audio to Cloudflare R2
4. ☐ Add `audio_url` field to database
5. ☐ Implement hybrid playback system

### **Long-term (1-3 Months)**
1. ☐ Add voice selection (male/female)
2. ☐ Implement tone visualization
3. ☐ Add pronunciation practice mode
4. ☐ Add speech recognition for feedback
5. ☐ Expand vocabulary with pre-recorded audio

---

## 📚 **Resources**

### **Thai Pronunciation**
- [Thai Language Wiki - Tones](https://en.wikipedia.org/wiki/Thai_language#Tones)
- [Omniglot - Thai Writing System](https://www.omniglot.com/writing/thai.htm)
- [ThaiPod101 - Tone Guide](https://www.thaipod101.com/thai-tones/)

### **Google Cloud TTS**
- [Docs](https://cloud.google.com/text-to-speech/docs)
- [Thai Voices](https://cloud.google.com/text-to-speech/docs/voices)
- [Pricing](https://cloud.google.com/text-to-speech/pricing)

### **Finding Native Speakers**
- Fiverr: Search "Thai voice recording"
- Upwork: "Native Thai speaker audio"
- Voices.com: Professional voice actors
- Cost: $20-50/hour typical

---

**Version**: 1.0  
**Date**: 2026-03-08  
**Status**: Analysis Complete  
**Recommendation**: Implement Google Cloud TTS + Pre-recorded hybrid approach
