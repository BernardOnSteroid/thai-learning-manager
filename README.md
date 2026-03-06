# 🇹🇭 Thai Learning Manager

> **A modern, AI-powered Thai language learning platform with CEFR-based progression and spaced repetition.**

[![Version](https://img.shields.io/badge/version-1.0.0--thai-blue.svg)](https://github.com/BernardOnSteroid/thai-learning-manager)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Cloudflare Pages](https://img.shields.io/badge/deploy-Cloudflare_Pages-orange.svg)](https://pages.cloudflare.com)

## 🌟 Features

### 🔐 **Multi-User Authentication** ✨ NEW!
- **Secure registration & login** with JWT tokens
- **Per-user progress tracking** - each user has isolated learning data
- **Shared vocabulary database** - all 52 Thai entries available to everyone
- **Session persistence** - stay logged in across browser sessions
- **User profiles** - display name and email in navigation
- **Logout functionality** - secure session termination

### 📚 **Comprehensive Thai Vocabulary System**
- **52+ A1-level entries** covering essential survival Thai
- **CEFR-aligned** progression (A1 → C2)
- **5 Thai tones** with visual indicators: Mid (→), Low (↘), Falling (↓), High (↑), Rising (↗)
- **Entry types**: Words, Verbs, Phrases, Classifiers, Particles
- **Thai script + romanization** for accurate pronunciation

### 🤖 **AI-Powered Content Generation**
- **Gemini AI integration** for vocabulary generation
- **Natural language prompts**: "Thai words for fruits", "restaurant vocabulary"
- **Automatic validation** of AI-generated content
- **Smart enhancement**: Auto-complete romanization, tones, examples
- **Batch generation**: Create themed vocabulary sets (3-10 entries)

### 📖 **Smart Learning System**
- **Flashcards**: Click-to-flip with Thai script, romanization, meanings
- **Spaced Repetition (SM-2)**: Scientifically-proven algorithm
- **6-level rating system**: 0 (total blackout) → 5 (perfect recall)
- **Progress tracking**: New → Learning → Mastered states
- **CEFR progression**: Track mastery by level

### 📊 **Dashboard & Analytics**
- **Real-time statistics**: Total entries, learning progress, due reviews
- **CEFR progression bars**: Visual progress by level (A1-C2)
- **Distribution charts**: Entry types, tone distribution, learning states
- **Focus recommendations**: AI-suggested next learning level

### ✏️ **Entry Management**
- **Full CRUD operations**: Create, Read, Update, Delete
- **Advanced filters**: By CEFR level, entry type, tone, status
- **Archive system**: Soft-delete with restore capability
- **Search functionality**: Find entries quickly
- **Bulk operations**: Efficient management

## 🚀 Live Demo

**Dashboard**: [https://thai-webapp.pages.dev](https://3001-ik0v75642hq1r9v9istbr-c07dda5e.sandbox.novita.ai/)

## 🛠️ Tech Stack

### **Frontend**
- **HTML/CSS/JavaScript**: Vanilla JS for lightweight performance
- **Tailwind CSS**: Modern, responsive design (CDN)
- **Font Awesome**: Icon library (CDN)
- **Chart.js**: Data visualizations (CDN)
- **Thai Fonts**: Noto Sans Thai, Sarabun (Google Fonts)

### **Backend**
- **Hono**: Fast, lightweight web framework
- **TypeScript**: Type-safe development
- **Cloudflare Workers**: Edge runtime deployment
- **Neon PostgreSQL**: Serverless database (US-East-1)
- **Gemini AI (Flash)**: Content generation

### **Infrastructure**
- **Cloudflare Pages**: Static site hosting + Functions
- **GitHub**: Version control & CI/CD
- **PM2**: Process management (development)
- **Wrangler**: Cloudflare CLI tool

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Cloudflare Account** (free tier works)
- **Neon PostgreSQL** database (free tier works)
- **Gemini API Key** (Google AI Studio - free)
- **Git** for version control

## 🔧 Installation

### **1. Clone Repository**
```bash
git clone https://github.com/BernardOnSteroid/thai-learning-manager.git
cd thai-learning-manager
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
Create `.dev.vars` file:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
GEMINI_API_KEY=your_gemini_api_key_here
```

### **4. Database Setup**
```bash
# Run migrations
npm run db:migrate:local

# Import seed data (52 A1 entries)
node import_seed.cjs
```

### **5. Development Server**
```bash
# Build the project
npm run build

# Start with PM2
pm2 start ecosystem.config.cjs

# Or use wrangler directly
npm run dev:sandbox
```

**Visit**: http://localhost:3001

## 📦 Available Scripts

```bash
# Development
npm run dev              # Vite dev server
npm run dev:sandbox      # Wrangler dev server (0.0.0.0:3000)
npm run dev:d1          # With D1 database binding

# Build & Deploy
npm run build           # Build for production
npm run preview         # Preview production build
npm run deploy          # Deploy to Cloudflare Pages
npm run deploy:prod     # Deploy with project name

# Database
npm run db:migrate:local    # Apply migrations locally
npm run db:migrate:prod     # Apply migrations to production
npm run db:seed            # Seed test data
npm run db:reset           # Reset local database
npm run db:console:local   # Local D1 console
npm run db:console:prod    # Production D1 console

# Git
npm run git:init       # Initialize git repository
npm run git:commit     # Quick commit with message
npm run git:status     # Check git status
npm run git:log        # View commit history

# Utilities
npm run clean-port     # Kill processes on port 3000
npm test              # Test health endpoint
```

## 🗄️ Database Schema

### **Tables**

#### **entries**
```sql
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thai_script TEXT NOT NULL,              -- Thai characters (ไทย)
  romanization TEXT NOT NULL,             -- Phonetic pronunciation
  tone TEXT NOT NULL,                     -- mid/low/falling/high/rising
  meaning TEXT NOT NULL,                  -- English translation
  entry_type TEXT NOT NULL,               -- word/verb/phrase/classifier/particle
  cefr_level TEXT NOT NULL,               -- A1/A2/B1/B2/C1/C2
  difficulty INTEGER DEFAULT 1,           -- 1-5 scale
  classifier TEXT DEFAULT '',             -- Thai classifier (ตัว, อัน, คน, etc.)
  polite_form TEXT DEFAULT '',            -- ครับ/ค่ะ if applicable
  grammar_notes TEXT DEFAULT '',          -- Usage notes
  examples JSONB DEFAULT '[]',            -- Example sentences
  archived BOOLEAN DEFAULT false,         -- Soft delete
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_entries_cefr ON entries(cefr_level);
CREATE INDEX idx_entries_type ON entries(entry_type);
CREATE INDEX idx_entries_tone ON entries(tone);
CREATE INDEX idx_entries_archived ON entries(archived);
```

#### **learning_progress**
```sql
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  srs_level INTEGER DEFAULT 0,            -- Spaced repetition level
  ease_factor NUMERIC(3,2) DEFAULT 2.5,   -- SM-2 algorithm
  interval INTEGER DEFAULT 1,             -- Days until next review
  next_review TIMESTAMP DEFAULT NOW(),    -- Next review date
  last_reviewed TIMESTAMP,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, entry_id)
);

CREATE INDEX idx_progress_next_review ON learning_progress(next_review);
CREATE INDEX idx_progress_user ON learning_progress(user_id);
```

## 🌐 API Endpoints

### **Health & Info**
- `GET /api/health` - Service health check
- `GET /api/version` - Version information

### **Entries Management**
- `GET /api/entries` - List entries (with filters)
- `POST /api/entries` - Create new entry
- `GET /api/entries/:id` - Get single entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry
- `PATCH /api/entries/:id/archive` - Toggle archive status

### **Learning & Review**
- `GET /api/learning/new` - Get new entries to learn
- `POST /api/learning/start` - Mark entry as started
- `GET /api/revision/due` - Get entries due for review
- `POST /api/revision/submit` - Submit review rating (0-5)
- `GET /api/revision/stats` - Review statistics

### **Dashboard & Analytics**
- `GET /api/dashboard/stats` - Complete dashboard statistics
- `GET /api/cefr/progression` - CEFR level progression

### **AI Generation (Gemini)**
- `POST /api/ai/generate-entry` - Generate entries from prompt
- `POST /api/ai/enhance-entry` - Enhance existing entry
- `POST /api/ai/generate-batch` - Generate batch by topic
- `POST /api/ai/generate-examples` - Generate example sentences

## 🎯 Project Structure

```
thai-learning-manager/
├── src/
│   ├── index.tsx          # Main Hono application & API routes
│   ├── db.ts              # Database helper functions (Neon)
│   ├── ai.ts              # Gemini AI integration
│   └── gemini.ts          # Alternative AI module
├── public/
│   └── static/
│       ├── app.js         # Frontend JavaScript (1,774 lines)
│       └── styles.css     # Custom CSS (if any)
├── migrations/            # SQL migration files
├── seed_data/            # Initial Thai vocabulary data
│   ├── thai_300_complete.json  # 52 A1 entries
│   └── import_thai_data.cjs    # Import script
├── dist/                 # Build output (gitignored)
│   ├── _worker.js        # Compiled Cloudflare Worker
│   └── _routes.json      # Routing configuration
├── .wrangler/           # Wrangler state (gitignored)
├── ecosystem.config.cjs # PM2 configuration
├── wrangler.jsonc       # Cloudflare configuration
├── vite.config.ts       # Vite build configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies & scripts
├── .gitignore          # Git ignore rules
├── .dev.vars           # Environment variables (gitignored)
├── .env                # Alternative env file (gitignored)
└── README.md           # This file
```

## 📚 Usage Guide

### **1. Browse & Search Entries**
- Navigate to "Browse Entries"
- Use filters: CEFR level, entry type, tone, status
- Click entries to view details
- Edit or delete entries with action buttons

### **2. Create Entries (Manual)**
- Click "Create New Entry" button
- Fill in required fields:
  - Thai Script (ไทย)
  - Romanization
  - Tone (dropdown)
  - Meaning
  - Entry Type
  - CEFR Level
- Add optional fields: classifier, polite form, grammar notes, examples
- Click "Save Entry"

### **3. Create Entries (AI-Powered)**
- Click purple "AI Generate" button
- Enter natural language prompt:
  - "Thai words for colors"
  - "Common verbs for shopping"
  - "Restaurant vocabulary"
- Select CEFR level, entry type, count
- Click "Generate with AI"
- Review AI-generated entries
- Save valid entries individually

### **4. Learning New Entries**
- Navigate to "Learn New"
- Select CEFR level (A1-C2)
- Study flashcards (click to flip)
- Click "Got It!" when learned
- Or "Skip" to review later

### **5. Spaced Repetition Review**
- Navigate to "Review"
- View due items count
- Study flashcard (front: Thai script + romanization)
- Rate recall quality:
  - **0**: Total blackout
  - **1**: Incorrect, familiar
  - **2**: Incorrect, easy
  - **3**: Correct, difficult
  - **4**: Correct, hesitation
  - **5**: Perfect recall
- Algorithm adjusts next review date automatically

### **6. Track Progress**
- Dashboard shows:
  - Total entries
  - Learning progress (New/Learning/Mastered)
  - Due for review
  - Progress percentage
- CEFR Progression:
  - % mastered per level
  - Visual progress bars
  - Focus recommendations
- Charts:
  - Entry type distribution
  - Tone distribution
  - CEFR distribution

## 🚀 Deployment to Cloudflare Pages

### **Prerequisites**
1. Cloudflare account
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Cloudflare API token

### **Steps**

#### **1. Setup Cloudflare Authentication**
```bash
# Login to Cloudflare
wrangler login

# Or use API token
export CLOUDFLARE_API_TOKEN=your_token_here
```

#### **2. Create Cloudflare Pages Project**
```bash
# Build the project
npm run build

# Create Pages project
wrangler pages project create thai-webapp \
  --production-branch main \
  --compatibility-date 2024-01-01
```

#### **3. Deploy**
```bash
# Deploy to production
npm run deploy

# Or with specific project name
npm run deploy:prod
```

#### **4. Set Environment Variables**
```bash
# Add DATABASE_URL
wrangler pages secret put DATABASE_URL --project-name thai-webapp

# Add GEMINI_API_KEY
wrangler pages secret put GEMINI_API_KEY --project-name thai-webapp

# List secrets
wrangler pages secret list --project-name thai-webapp
```

#### **5. Custom Domain (Optional)**
```bash
wrangler pages domain add yourdomain.com --project-name thai-webapp
```

### **Deployment URLs**
- **Production**: `https://thai-webapp.pages.dev`
- **Branch**: `https://main.thai-webapp.pages.dev`
- **Custom**: `https://yourdomain.com` (if configured)

## 🧪 Testing

### **Health Check**
```bash
curl https://thai-webapp.pages.dev/api/health
```

### **List Entries**
```bash
curl https://thai-webapp.pages.dev/api/entries?limit=5
```

### **AI Generation Test**
```bash
curl -X POST https://thai-webapp.pages.dev/api/ai/generate-entry \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Thai words for colors", "cefr_level": "A1", "entry_type": "word", "count": 3}'
```

### **Dashboard Stats**
```bash
curl https://thai-webapp.pages.dev/api/dashboard/stats
```

## 🎨 Design System

### **Colors**
- **Primary**: Blue (#3B82F6) - Actions, links
- **Success**: Green (#22C55E) - Positive actions
- **Warning**: Orange (#F97316) - Alerts
- **Info**: Purple (#A855F7) - AI features
- **Gray Scale**: (#F3F4F6 → #111827) - Backgrounds, text

### **Typography**
- **Thai Script**: Noto Sans Thai, Sarabun
- **English**: System fonts (sans-serif)
- **Code**: Monospace

### **Tone Colors**
- **Mid (→)**: Gray
- **Low (↘)**: Blue
- **Falling (↓)**: Red
- **High (↑)**: Green
- **Rising (↗)**: Purple

## 📊 Current Statistics

- **Total Entries**: 51 (all A1 level)
- **Entry Types**: Words (17), Verbs (15), Phrases (10), Classifiers (5), Particles (4)
- **Tone Distribution**: Mid (43%), Falling (31%), High (12%), Low (10%), Rising (4%)
- **Database**: Neon PostgreSQL (US-East-1)
- **Build Size**: 212.93 kB (dist/_worker.js)
- **Frontend**: 1,774 lines (public/static/app.js)
- **Backend**: 911 lines (src/index.tsx) + 412 lines (src/db.ts)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**BernardOnSteroid**
- GitHub: [@BernardOnSteroid](https://github.com/BernardOnSteroid)

## 🙏 Acknowledgments

- **Hono Framework** - Lightning-fast web framework
- **Cloudflare** - Edge computing platform
- **Neon** - Serverless PostgreSQL
- **Google Gemini** - AI content generation
- **Thai Language Community** - Vocabulary and cultural insights

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/BernardOnSteroid/thai-learning-manager/issues)
- **Documentation**: This README
- **API Docs**: Visit `/docs` endpoint on deployed site

## 🗺️ Roadmap

### **Phase 1: Foundation** ✅
- [x] Database schema with CEFR levels
- [x] CRUD API for entries
- [x] Dashboard UI
- [x] Entry management UI

### **Phase 2: Learning** ✅
- [x] Flashcard system
- [x] Spaced repetition (SM-2)
- [x] Progress tracking

### **Phase 3: AI** ✅
- [x] Gemini AI integration
- [x] Content generation
- [x] Entry enhancement

### **Phase 4: Deployment** 🔄
- [x] GitHub repository
- [ ] Cloudflare Pages deployment
- [ ] Custom domain

### **Phase 5: Enhancement** 📅
- [ ] User authentication
- [ ] Multiple user support
- [ ] Audio pronunciation (TTS)
- [ ] Mobile app (PWA)
- [ ] More vocabulary (A2-C2 levels)
- [ ] Conversation practice
- [ ] Cultural notes

---

**Built with ❤️ for Thai language learners worldwide** 🇹🇭

**Version**: 1.0.0-thai  
**Last Updated**: 2026-03-05  
**Status**: Production Ready ✨
