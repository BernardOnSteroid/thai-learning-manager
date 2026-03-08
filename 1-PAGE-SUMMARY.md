# 🇹🇭 Thai Learning Manager - 1-Page Feature Summary

**Version**: 1.5.0 | **Live**: https://thai.collin.cc | **Test**: https://3001-ik0v75642hq1r9v9istbr-c07dda5e.sandbox.novita.ai

---

## 🎯 What It Does
Learn Thai vocabulary using **spaced repetition** (SRS) with **300+ words** (CEFR A1-C2), authentic **pronunciation audio**, and **hands-free Driving Mode** for learning during commutes.

---

## ✨ Core Features

### 1. **📊 Dashboard** - Your Learning Hub
- **Stats at a glance**: Total words, learning progress, mastered items, accuracy
- **CEFR level breakdown**: Track progress from A1 (beginner) → C2 (mastery)
- **Due reviews counter**: Know what needs practice today

### 2. **📚 Browse** - Explore 300+ Words
- **Full vocabulary database**: 300 Thai words/phrases across all CEFR levels
- **Rich details per entry**:
  - Thai script (สวัสดี), Romanization (sà-wàt-dee), Tone markers
  - English meaning, Part of speech, CEFR level
  - Example sentences with translations
  - 🔊 **Native pronunciation audio** (click to hear)
- **Filters**: Search by level (A1-C2), type (verb/noun/particle), or keyword
- **Add custom entries**: Create your own flashcards

### 3. **📖 Learn** - Study New Words
- **Smart learning queue**: Get new words at your current CEFR level
- **Interactive study cards**:
  - See Thai script → Hear pronunciation → Read romanization → Understand meaning
  - View contextual examples
  - Mark as "learned" when ready
- **Recommended**: 5-10 new words per day

### 4. **🔄 Review** - Spaced Repetition Quiz
- **Flashcard-style reviews**: Thai word → Recall meaning → Reveal answer
- **Self-assessment**: Rate each word (Easy/Good/Hard)
- **SM-2 Algorithm**: Automatically schedules next review
  - Easy → Review in 7-15 days
  - Good → Review in 3-7 days
  - Hard → Review in 1-2 days
- **Track mastery**: Words graduate from "Learning" → "Mastered" over time

### 5. **🚗 Driving Mode** - Hands-Free Learning ⭐ NEW!
**Perfect for**: Commutes, traffic, gym, cooking, or any hands-free situation

**Three Learning Modes**:
- 🕐 **Recently Learned**: Review your latest vocabulary
- ⏰ **Due for Review**: Practice words needing attention
- 🎲 **Random Words**: Explore vocabulary at your level

**Audio Playback** (auto-repeats for each word):
1. Thai word (native pronunciation)
2. Romanization (sà-wàt-dee)
3. English meaning
4. Tone info (mid/low/falling/high/rising)
5. Example sentence (optional)
6. Thai word repeated (optional)

**Player Controls**:
- ▶️ Play | ⏸ Pause | ⏹ Stop | ⏭ Skip | ⏮ Previous
- Progress bar + word counter (5/20)

**Customization**:
- **Speed**: 0.7x (Slow), 0.9x (Normal), 1.0x (Standard), 1.2x (Fast)
- **Toggle**: Repeat word, Include examples
- **Pauses**: 2s between words, 1s between sections

**Safety**: Prominent "eyes on road, hands on wheel" reminder

---

## 🎓 Learning System

### **CEFR Levels** (European Framework)
- **A1**: Beginner basics (สวัสดี, ขอบคุณ)
- **A2**: Elementary everyday phrases
- **B1**: Intermediate conversations
- **B2**: Advanced fluency
- **C1**: Proficient expressions
- **C2**: Mastery level

### **Spaced Repetition (SRS)**
Smart algorithm schedules reviews at optimal intervals:
```
Day 0:  Learn → "Learning" status
Day 1:  Review (Easy) → Next review Day 4
Day 4:  Review (Good) → Next review Day 11
Day 11: Review (Easy) → Next review Day 26
Day 26: Review (Easy) → "MASTERED" ⭐
```

### **Tone System**
Thai has 5 tones (crucial for meaning):
- **Mid**: Level pitch
- **Low**: Low pitch
- **Falling**: High → Low
- **High**: High pitch
- **Rising**: Low → High

---

## 📱 User Interface

### **Desktop**
- Clean navigation: Dashboard | Browse | Learn | Review | Driving Mode | Docs
- Large Thai text for readability
- Full keyboard shortcuts

### **Mobile**
- Responsive design
- Hamburger menu for easy navigation
- Touch-optimized controls
- Works great for Driving Mode (mount phone in car)

---

## 🔐 Security & Authentication
- **JWT-based auth**: Secure login/registration
- **Password hashing**: bcryptjs encryption
- **User isolation**: Each user sees only their own progress
- **Token expiry**: Auto-logout for security

---

## 💾 Technology Stack
- **Frontend**: HTML5, TailwindCSS, Vanilla JS
- **Backend**: Hono (Cloudflare Workers) + TypeScript
- **Database**: Neon PostgreSQL (serverless)
- **Audio**: Web Speech API (Thai TTS)
- **Hosting**: Cloudflare Pages (edge network, global CDN)
- **Domain**: thai.collin.cc (custom domain)

---

## 📊 Current Database
- **300+ vocabulary entries**: Full CEFR coverage (A1-C2)
- **Distribution**:
  - A1: 60 words (beginner essentials)
  - A2: 60 words (elementary)
  - B1: 60 words (intermediate)
  - B2: 60 words (upper-intermediate)
  - C1: 40 words (advanced)
  - C2: 20 words (mastery)
- Each entry: Thai script, romanization, tone, meaning, examples

---

## 🚀 Quick Start (2 Minutes)

1. **Register**: https://thai.collin.cc → Create account
2. **Browse**: Explore 300 words, click 🔊 to hear pronunciation
3. **Learn**: Study 5-10 new words
4. **Review**: Quiz yourself tomorrow (spaced repetition)
5. **Driving Mode**: Learn hands-free during commute 🚗

---

## 💡 Pro Tips

### **Daily Routine (15 min)**
- Morning (5 min): Review due flashcards
- Commute (10 min): Driving Mode hands-free
- Evening (5 min): Learn 3-5 new words

### **30-Day Challenge**
- Week 1: Learn 10 A1 words → Daily reviews
- Week 2: Learn 15 A1-A2 words → Start Driving Mode
- Week 3: Learn 20 A2-B1 words → Track progress
- Week 4: Master 50+ words → Conversational basics! 🎉

---

## 🆘 Support & Help

**Common Issues**:
- No audio? → Check browser supports Thai TTS (Chrome/Edge best)
- Login issues? → Clear cookies, try different browser
- Driving Mode not playing? → Check permissions, internet connection

**Documentation**:
- Quick Start Guide: `/QUICK-START-GUIDE.md`
- Driving Mode Manual: `/DRIVING-MODE-README.md`
- Full README: `/README.md`

---

## 🎯 Perfect For

✅ **Beginners**: Start with A1 basics, work up systematically  
✅ **Commuters**: Driving Mode turns traffic into learning time  
✅ **Busy people**: 15 min/day, spaced repetition does the work  
✅ **Travelers**: Prep for Thailand trips with practical vocabulary  
✅ **Language learners**: Proven SRS method for retention  

---

## 🔮 Version 1.5.0 Highlights

✨ **NEW**: Version number display (navigation bar + footer)  
✨ **NEW**: 300-word vocabulary expansion (was 51 words)  
✨ **NEW**: Driving Mode hands-free feature  
✨ **NEW**: Complete documentation suite  
✨ **NEW**: Quick-start guide for new users  

---

## 📞 Get Started Now

**Test v1.5.0**: https://3001-ik0v75642hq1r9v9istbr-c07dda5e.sandbox.novita.ai  
**Live Site**: https://thai.collin.cc  
**GitHub**: https://github.com/BernardOnSteroid/thai-learning-manager  

---

🇹🇭 **Happy Learning! สู้ๆ** (sûu sûu - Keep fighting!) 🇹🇭

*Built with ❤️ using Hono + Neon PostgreSQL + Cloudflare Pages*
