# Thai Learning Manager v1.0.0

CEFR-based spaced repetition system for learning Thai language.

## Features
- 300 Thai entries (A1-C2 CEFR levels)
- 5-tone system support (mid, low, falling, high, rising)
- Thai classifiers (ลักษณนาม) - essential for proper Thai
- Particles and polite forms (ครับ/ค่ะ)
- Spaced repetition (SM-2 algorithm)
- CEFR progression tracking
- AI-powered enrichment (optional)
- Mobile responsive design

## Tech Stack
- **Backend**: Hono + Cloudflare Workers
- **Database**: Neon PostgreSQL (separate from Japanese app)
- **Frontend**: Vanilla JS + Tailwind CSS + Thai fonts
- **Deployment**: Cloudflare Pages
- **AI**: Google Gemini (optional)

## Entry Types
1. Words (คำศัพท์) - Nouns, adjectives
2. Verbs (กริยา) - Action words
3. Phrases (วลี) - Common expressions
4. Classifiers (ลักษณนาม) - Thai-specific counting words
5. Particles (อนุภาค) - ครับ, ค่ะ, นะ, etc.
6. Custom - User-defined

## CEFR Levels
- **A1** (Breakthrough) - Basic survival Thai
- **A2** (Waystage) - Tourist conversations
- **B1** (Threshold) - Daily life communication
- **B2** (Vantage) - Fluent conversations
- **C1** (Proficiency) - Professional/academic
- **C2** (Mastery) - Native-like fluency

## Local Development
```bash
npm install
npm run build
pm2 start ecosystem.config.cjs
```

Access at: http://localhost:3001

## Project Status
- Version: 1.0.0-thai
- Entries: 0 (will add 300 seed entries)
- Database: Neon PostgreSQL (pending setup)
- Deployment: Pending

## Separation from Japanese App
This is a COMPLETELY SEPARATE project from the Japanese Learning App:
- Different directory: /home/user/thai-webapp
- Different database: New Neon project
- Different port: 3001 (Japanese uses 3000)
- Different GitHub repo: thai-learning
- Different Cloudflare project: thai-webapp

Both apps can run simultaneously without conflicts.
