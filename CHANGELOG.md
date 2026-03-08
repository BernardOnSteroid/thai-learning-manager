# Changelog

All notable changes to Thai Learning Manager will be documented in this file.

## [1.6.0] - 2026-03-08

### Added
- **Password Reset Feature**: Complete password reset flow for users who forget their password
  - `/forgot-password` page - Request password reset via email
  - `/reset-password` page - Reset password with token
  - `POST /api/auth/forgot-password` - Request reset token endpoint
  - `POST /api/auth/reset-password` - Reset password endpoint
  - Database migration to add `reset_token` and `reset_token_expires` fields
  - Token-based password reset with 1-hour expiration
  - Security: Email enumeration protection
  - Auto-redirect to login after successful password reset

### Changed
- Version bumped to 1.6.0 across all files
- Enhanced auth module with reset token generation and verification
- Database schema updated with password reset support

### Security
- Reset tokens expire after 1 hour for security
- Tokens are cleared from database after password reset
- Email enumeration protection (same message whether user exists or not)

## [1.5.0] - 2026-03-07

### Added
- **Version Display**: Version number now visible in navigation bar and footer
- **300-Word Vocabulary Expansion**: Complete CEFR coverage (A1-C2)
  - A1: 60 words, A2: 60 words, B1: 60 words
  - B2: 60 words, C1: 40 words, C2: 20 words
- **Driving Mode**: Hands-free learning feature perfect for commutes
  - Three modes: Recently Learned, Due for Review, Random Words
  - Customizable speech speed (0.7x - 1.2x)
  - Player controls: Play, Pause, Skip, Previous
  - Settings: Repeat word, Include examples
- **Complete Documentation Suite**:
  - QUICK-START-GUIDE.md (8.5 KB)
  - DRIVING-MODE-README.md (8.0 KB)
  - 1-PAGE-SUMMARY.md (6.9 KB)
  - CHANGELOG.md (this file)

### Changed
- Enhanced UI with version display throughout the app
- Updated API endpoints to return version information
- Improved documentation structure

## [1.0.0-thai] - 2026-03-05

### Initial Release
- **Core Features**:
  - Dashboard with learning statistics
  - Browse 51 Thai vocabulary entries
  - Learn mode for studying new words
  - Review mode with spaced repetition (SM-2 algorithm)
  - Multi-user support with JWT authentication
- **Thai Language Support**:
  - 5 Thai tones (mid, low, falling, high, rising)
  - Romanization for pronunciation
  - Example sentences
  - CEFR levels (A1-C2)
- **Technology Stack**:
  - Hono (Cloudflare Workers)
  - Neon PostgreSQL
  - TailwindCSS
  - Cloudflare Pages deployment
- **Authentication**:
  - User registration and login
  - JWT-based sessions
  - Password hashing with bcrypt

---

**Format**: Based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
**Versioning**: [Semantic Versioning](https://semver.org/)
