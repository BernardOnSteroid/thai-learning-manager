# Changelog - Thai Learning Manager

All notable changes to this project will be documented in this file.

## [1.5.0] - 2026-03-07

### 🎉 Major Features Added

#### Driving Mode Feature
- **Hands-free learning** for commuting and traffic situations
- **Audio-only interface** with native Thai text-to-speech
- **Three learning modes**:
  - Recently Learned Words (review progress)
  - Due for Review (spaced repetition)
  - Random Words (exploration)
- **Customizable settings**:
  - Speech speed control (0.7x - 1.2x)
  - Toggle repeat word option
  - Toggle example sentences
  - Adjustable pause durations
- **Player controls**: Play/Pause, Stop, Skip, Previous, Progress bar
- **Safety-first design**: Prominent warning, large touch targets, audio-focused UI
- **Mobile responsive**: Works on all screen sizes

#### Vocabulary Expansion
- **300+ Thai words/verbs** ready for database (migration file created)
- **Complete CEFR coverage**: A1 (60), A2 (60), B1 (60), B2 (60), C1 (40), C2 (20)
- **Quality entries**: Each includes Thai script, romanization, tone, meaning, examples
- **Seed scripts**: 50 high-priority words available via API seeder
- **Entry types**: Verbs, nouns, adjectives, phrases, particles, classifiers

#### Documentation
- **Quick Start Guide**: Visual onboarding with learning flow diagrams
- **Driving Mode README**: Complete feature documentation with usage guide
- **Vocabulary Expansion**: Technical documentation for 300-word collection
- **Deployment Instructions**: Step-by-step Cloudflare deployment guide

### 🔧 Backend Enhancements
- New API endpoint: `GET /api/entries/random?limit=20&cefr_level=A1`
- New API endpoint: `GET /api/user-progress?limit=20&sort=recently_learned`
- New API endpoint: `GET /api/user-progress/due?limit=20`
- Database functions: `getRandomEntries()`, `getUserLearningProgressWithEntries()`, `getUserDueReviews()`

### 🎨 Frontend Improvements
- Version number displayed in main navigation (v1.5.0)
- Driving Mode navigation link in desktop and mobile menus
- Mobile menu toggle functionality improved
- Consistent UI styling across all pages

### 📝 Files Added
- `public/static/driving-mode.js` (358 lines) - Driving Mode frontend logic
- `migrations/0005_add_300_thai_words.sql` (53 KB) - 300-word vocabulary
- `seed-thai-words.mjs` - API-based vocabulary seeder
- `DRIVING-MODE-README.md` - Feature documentation
- `QUICK-START-GUIDE.md` - User onboarding guide
- `VOCABULARY-EXPANSION.md` - Technical vocabulary docs
- `VOCABULARY-SUMMARY.md` - User-facing vocabulary overview
- `CHANGELOG.md` - This file

### 🐛 Bug Fixes
- Fixed mobile menu navigation issues
- Improved token authentication error handling
- Enhanced database connection stability

### 📊 Current Stats
- **Total entries**: 51 words (original) + 300 ready to load
- **API endpoints**: 15+ routes
- **Features**: Dashboard, Browse, Learn, Review, Driving Mode
- **Authentication**: JWT-based multi-user support
- **Database**: Neon PostgreSQL with spaced repetition

---

## [1.0.0-thai] - 2026-03-06

### Initial Release
- CEFR-based Thai vocabulary system (A1-C2)
- Spaced repetition learning (SM-2 algorithm)
- Thai tone markers (mid, low, falling, high, rising)
- Classifier and particle support
- Multi-user authentication with JWT
- Dashboard with progress tracking
- Browse, Learn, and Review modes
- Example sentences with romanization
- Neon PostgreSQL database integration
- Cloudflare Pages deployment ready

---

## Version Guidelines

- **Major version** (X.0.0): Breaking changes, major features
- **Minor version** (1.X.0): New features, no breaking changes
- **Patch version** (1.0.X): Bug fixes, minor improvements

## Links

- **Repository**: https://github.com/BernardOnSteroid/thai-learning-manager
- **Deployed**: https://thai.collin.cc
- **Documentation**: See README.md and docs folder
