// Thai Learning Manager - Backend API
// Version: 1.6.0
// Database: Neon PostgreSQL with CEFR levels and Thai tones

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import * as db from './db'
import * as ai from './ai'
import * as auth from './auth'

// Version constant
const VERSION = '1.7.1'

// Bindings for Cloudflare environment variables
type Bindings = {
  DATABASE_URL: string
  GEMINI_API_KEY?: string
}

// Variables stored in context
type Variables = {
  userId: string
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Authentication middleware - protects API routes (except auth, health, version)
app.use('/api/*', async (c, next) => {
  // Skip auth for public endpoints
  const path = new URL(c.req.url).pathname
  const publicPaths = ['/api/auth/', '/api/health', '/api/version', '/api/entries/random']
  
  if (publicPaths.some(p => path.startsWith(p))) {
    return await next()
  }
  
  // Extract and verify JWT token
  const token = auth.extractToken(c.req.header('Authorization'))
  if (!token) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401)
  }
  
  const payload = auth.verifyToken(token)
  if (!payload) {
    return c.json({ error: 'Unauthorized - Invalid or expired token' }, 401)
  }
  
  // Store userId in context for use in route handlers
  c.set('userId', payload.userId)
  
  await next()
})

// ============ Health & Version ============

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    message: 'Thai Learning Manager API',
    version: VERSION,
    database: 'Neon PostgreSQL',
    language: 'Thai',
    levels: 'CEFR (A1-C2)',
    features: [
      'thai-tones',
      'classifiers',
      'particles',
      'spaced-repetition',
      'cefr-progression'
    ]
  })
})

app.get('/api/version', (c) => {
  return c.json({
    version: VERSION,
    language: 'Thai',
    levels: 'CEFR (A1-C2)'
  })
})

// ============ Authentication ============

// Register new user
app.post('/api/auth/register', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const { email, password, name } = await c.req.json()

    // Validate input
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    if (!auth.validateEmail(email)) {
      return c.json({ error: 'Invalid email format' }, 400)
    }

    const passwordCheck = auth.validatePassword(password)
    if (!passwordCheck.valid) {
      return c.json({ error: passwordCheck.message }, 400)
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(DATABASE_URL, email)
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 409)
    }

    // Hash password and create user
    const passwordHash = await auth.hashPassword(password)
    const userId = auth.generateUserId()

    await db.createUser(DATABASE_URL, {
      id: userId,
      email,
      password_hash: passwordHash,
      name: name || null
    })

    // Create JWT token
    const token = auth.createToken({ userId, email })

    // Return user data (without password)
    return c.json({
      token,
      user: {
        id: userId,
        email,
        name: name || null
      }
    }, 201)
  } catch (error: any) {
    console.error('Error registering user:', error)
    return c.json({ error: 'Failed to register user', details: error.message }, 500)
  }
})

// Login user
app.post('/api/auth/login', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const { email, password } = await c.req.json()

    // Validate input
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    // Get user from database
    const user = await db.getUserByEmail(DATABASE_URL, email)
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Check if user is active
    if (user.is_active === 0) {
      return c.json({ error: 'Account is disabled' }, 403)
    }

    // Verify password
    const isValid = await auth.verifyPassword(password, user.password_hash)
    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Update last login
    await db.updateUserLastLogin(DATABASE_URL, user.id)

    // Create JWT token
    const token = auth.createToken({ userId: user.id, email: user.email })

    // Return user data (without password)
    return c.json({
      token,
      user: auth.sanitizeUser(user)
    })
  } catch (error: any) {
    console.error('Error logging in:', error)
    return c.json({ error: 'Failed to login', details: error.message }, 500)
  }
})

// Request password reset
app.post('/api/auth/forgot-password', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const { email } = await c.req.json()

    // Validate input
    if (!email) {
      return c.json({ error: 'Email is required' }, 400)
    }

    if (!auth.validateEmail(email)) {
      return c.json({ error: 'Invalid email format' }, 400)
    }

    // Check if user exists
    const user = await db.getUserByEmail(DATABASE_URL, email)
    
    // Always return success even if user doesn't exist (security)
    // This prevents email enumeration attacks
    if (!user) {
      return c.json({ 
        message: 'If an account exists with this email, a password reset link will be sent.' 
      })
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = auth.generateResetToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // Store reset token in database
    await db.storeResetToken(DATABASE_URL, email, resetToken, expiresAt)

    // In production, send email with reset link
    // For now, return the token (REMOVE IN PRODUCTION)
    const resetUrl = `${new URL(c.req.url).origin}/reset-password?token=${resetToken}`

    return c.json({
      message: 'If an account exists with this email, a password reset link will be sent.',
      // TODO: Remove in production - only for testing
      resetUrl: resetUrl,
      resetToken: resetToken
    })
  } catch (error: any) {
    console.error('Error requesting password reset:', error)
    return c.json({ error: 'Failed to process password reset request', details: error.message }, 500)
  }
})

// Reset password with token
app.post('/api/auth/reset-password', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const { token, newPassword } = await c.req.json()

    // Validate input
    if (!token || !newPassword) {
      return c.json({ error: 'Token and new password are required' }, 400)
    }

    const passwordCheck = auth.validatePassword(newPassword)
    if (!passwordCheck.valid) {
      return c.json({ error: passwordCheck.message }, 400)
    }

    // Get user by reset token (also checks expiry)
    const user = await db.getUserByResetToken(DATABASE_URL, token)
    if (!user) {
      return c.json({ error: 'Invalid or expired reset token' }, 400)
    }

    // Hash new password
    const newPasswordHash = await auth.hashPassword(newPassword)

    // Update password and clear reset token
    await db.updateUserPassword(DATABASE_URL, user.id, newPasswordHash)

    return c.json({
      message: 'Password reset successfully. You can now login with your new password.'
    })
  } catch (error: any) {
    console.error('Error resetting password:', error)
    return c.json({ error: 'Failed to reset password', details: error.message }, 500)
  }
})

// Verify token and get current user
app.get('/api/auth/me', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    // Extract and verify token
    const token = auth.extractToken(c.req.header('Authorization'))
    if (!token) {
      return c.json({ error: 'No token provided' }, 401)
    }

    const payload = auth.verifyToken(token)
    if (!payload) {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }

    // Get user from database
    const user = await db.getUserById(DATABASE_URL, payload.userId)
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Check if user is active
    if (user.is_active === 0) {
      return c.json({ error: 'Account is disabled' }, 403)
    }

    return c.json({
      user: auth.sanitizeUser(user)
    })
  } catch (error: any) {
    console.error('Error verifying token:', error)
    return c.json({ error: 'Failed to verify token', details: error.message }, 500)
  }
})

// ============ Text-to-Speech (Google Cloud TTS) ============

app.post('/api/tts/google', async (c) => {
  const { GOOGLE_TTS_API_KEY } = c.env
  
  if (!GOOGLE_TTS_API_KEY) {
    console.warn('⚠️ GOOGLE_TTS_API_KEY not configured, falling back to Web Speech API')
    return c.json({ 
      error: 'Google TTS not configured',
      fallback: 'web-speech-api'
    }, 503)
  }

  try {
    const { text, rate = 0.9, voice = 'th-TH-Neural2-C' } = await c.req.json()

    if (!text) {
      return c.json({ error: 'Text is required' }, 400)
    }

    console.log('🔊 Generating TTS for:', text.substring(0, 50))

    // Call Google Cloud Text-to-Speech API
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + GOOGLE_TTS_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'th-TH',
          name: voice, // th-TH-Neural2-C (female neural, best quality)
          ssmlGender: voice.includes('C') ? 'FEMALE' : 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: rate,
          pitch: 0,
          volumeGainDb: 0
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Google TTS API error:', error)
      return c.json({ 
        error: 'Google TTS API error', 
        details: error,
        fallback: 'web-speech-api'
      }, response.status)
    }

    const data = await response.json()

    if (!data.audioContent) {
      return c.json({ 
        error: 'No audio content returned',
        fallback: 'web-speech-api'
      }, 500)
    }

    console.log('✅ TTS generated successfully')

    // Return base64 MP3 audio
    return c.json({
      audioContent: data.audioContent, // Base64 encoded MP3
      voice: voice,
      rate: rate
    })

  } catch (error: any) {
    console.error('TTS generation error:', error)
    return c.json({ 
      error: 'Failed to generate speech',
      details: error.message,
      fallback: 'web-speech-api'
    }, 500)
  }
})

// ============ Entries CRUD ============

app.get('/api/entries', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const cefrLevel = c.req.query('cefr_level')
    const entryType = c.req.query('entry_type')
    const tone = c.req.query('tone')
    const archived = c.req.query('archived') === 'true'
    const limit = parseInt(c.req.query('limit') || '100')

    const entries = await db.getEntries(DATABASE_URL, {
      cefr_level: cefrLevel,
      entry_type: entryType,
      tone: tone,
      archived,
      limit
    })

    return c.json(entries)
  } catch (error: any) {
    console.error('Error fetching entries:', error)
    return c.json({ error: 'Failed to fetch entries', details: error.message }, 500)
  }
})

// Get entries with random sorting (for driving mode)
// IMPORTANT: This must come BEFORE /api/entries/:id to avoid route collision
app.get('/api/entries/random', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const cefrLevel = c.req.query('cefr_level')

    const entries = await db.getRandomEntries(DATABASE_URL, { limit, cefr_level: cefrLevel })
    return c.json(entries)
  } catch (error: any) {
    console.error('Error fetching random entries:', error)
    return c.json({ error: 'Failed to fetch random entries', details: error.message }, 500)
  }
})

app.get('/api/entries/:id', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const id = c.req.param('id')
    const entry = await db.getEntryById(DATABASE_URL, id)

    if (!entry) {
      return c.json({ error: 'Entry not found' }, 404)
    }

    return c.json(entry)
  } catch (error: any) {
    console.error('Error fetching entry:', error)
    return c.json({ error: 'Failed to fetch entry', details: error.message }, 500)
  }
})

app.post('/api/entries', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const body = await c.req.json()

    // Validate required fields
    if (!body.thai_script || !body.romanization || !body.tone || !body.meaning || !body.entry_type || !body.cefr_level) {
      return c.json({ 
        error: 'Missing required fields',
        required: ['thai_script', 'romanization', 'tone', 'meaning', 'entry_type', 'cefr_level']
      }, 400)
    }

    // Validate tone
    const validTones = ['mid', 'low', 'falling', 'high', 'rising']
    if (!validTones.includes(body.tone)) {
      return c.json({ error: 'Invalid tone. Must be: mid, low, falling, high, or rising' }, 400)
    }

    // Validate CEFR level
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    if (!validLevels.includes(body.cefr_level)) {
      return c.json({ error: 'Invalid CEFR level. Must be: A1, A2, B1, B2, C1, or C2' }, 400)
    }

    const entry = await db.createEntry(DATABASE_URL, body)
    return c.json(entry, 201)
  } catch (error: any) {
    console.error('Error creating entry:', error)
    return c.json({ error: 'Failed to create entry', details: error.message }, 500)
  }
})

app.patch('/api/entries/:id', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const id = c.req.param('id')
    const updates = await c.req.json()

    const entry = await db.updateEntry(DATABASE_URL, id, updates)
    return c.json(entry)
  } catch (error: any) {
    console.error('Error updating entry:', error)
    return c.json({ error: 'Failed to update entry', details: error.message }, 500)
  }
})

app.delete('/api/entries/:id', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const id = c.req.param('id')
    await db.deleteEntry(DATABASE_URL, id)
    return c.json({ success: true, message: 'Entry deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting entry:', error)
    return c.json({ error: 'Failed to delete entry', details: error.message }, 500)
  }
})

app.post('/api/entries/:id/archive', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const id = c.req.param('id')
    const entry = await db.archiveEntry(DATABASE_URL, id, true)
    return c.json(entry)
  } catch (error: any) {
    console.error('Error archiving entry:', error)
    return c.json({ error: 'Failed to archive entry', details: error.message }, 500)
  }
})

app.post('/api/entries/:id/unarchive', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const id = c.req.param('id')
    const entry = await db.archiveEntry(DATABASE_URL, id, false)
    return c.json(entry)
  } catch (error: any) {
    console.error('Error unarchiving entry:', error)
    return c.json({ error: 'Failed to unarchive entry', details: error.message }, 500)
  }
})

// ============ Dashboard & Statistics ============

app.get('/api/dashboard/stats', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const userId = c.get('userId') // From auth middleware
    const sql = db.getDbClient(DATABASE_URL)
    
    // Get total entries (shared across all users)
    const totalResult = await sql`SELECT COUNT(*) as count FROM entries WHERE archived = false`
    const totalEntries = parseInt(totalResult[0].count)
    
    // Get user's progress stats
    const progressStats = await db.getUserProgressStats(DATABASE_URL, userId)
    
    // Calculate stats by state
    const newCount = totalEntries - progressStats.length
    const learningCount = progressStats.filter((p: any) => p.state === 'learning').length
    const masteredCount = progressStats.filter((p: any) => p.state === 'mastered').length
    
    // Calculate due for review
    const dueCount = progressStats.filter((p: any) => 
      p.next_review && new Date(p.next_review) <= new Date() && p.state !== 'mastered'
    ).length
    
    // Calculate stats by type
    const byType: any = {}
    progressStats.forEach((p: any) => {
      byType[p.entry_type] = (byType[p.entry_type] || 0) + 1
    })
    
    // Calculate stats by CEFR level
    const byCefr: any = {}
    progressStats.forEach((p: any) => {
      byCefr[p.cefr_level] = (byCefr[p.cefr_level] || 0) + 1
    })
    
    return c.json({
      totalEntries,
      learningProgress: progressStats.length,
      dueForReview: dueCount,
      progressPercent: totalEntries > 0 ? Math.round((progressStats.length / totalEntries) * 100) : 0,
      byState: {
        new: newCount,
        learning: learningCount,
        mastered: masteredCount
      },
      byType,
      byCefr
    })
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    return c.json({ error: 'Failed to fetch stats', details: error.message }, 500)
  }
})

app.get('/api/stats', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const stats = await db.getStats(DATABASE_URL)
    return c.json(stats)
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return c.json({ error: 'Failed to fetch stats', details: error.message }, 500)
  }
})

// ============ Settings ============

app.get('/api/settings', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const settings = await db.getSettings(DATABASE_URL)
    return c.json(settings)
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return c.json({ error: 'Failed to fetch settings', details: error.message }, 500)
  }
})

app.post('/api/settings', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const { key, value } = await c.req.json()
    await db.updateSettings(DATABASE_URL, 'default_user', key, value)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return c.json({ error: 'Failed to update settings', details: error.message }, 500)
  }
})

// ============ User Progress (for Driving Mode) ============

// Get user's learning progress - recently learned items
app.get('/api/user-progress', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const userId = c.get('userId')
    const limit = parseInt(c.req.query('limit') || '20')
    const sort = c.req.query('sort') || 'recently_learned'

    const progress = await db.getUserLearningProgressWithEntries(DATABASE_URL, userId, { limit, sort })
    return c.json(progress)
  } catch (error: any) {
    console.error('Error fetching user progress:', error)
    return c.json({ error: 'Failed to fetch user progress', details: error.message }, 500)
  }
})

// Get due reviews for the user
app.get('/api/user-progress/due', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const userId = c.get('userId')
    const limit = parseInt(c.req.query('limit') || '20')

    const dueItems = await db.getUserDueReviews(DATABASE_URL, userId, limit)
    return c.json(dueItems)
  } catch (error: any) {
    console.error('Error fetching due reviews:', error)
    return c.json({ error: 'Failed to fetch due reviews', details: error.message }, 500)
  }
})

// ============ API Documentation ============

app.get('/docs', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thai Learning Manager - API Documentation</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50 p-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          <i class="fas fa-book mr-2"></i>Thai Learning Manager API
        </h1>
        <p class="text-gray-600 mb-8">Version: ${VERSION} | Database: Neon PostgreSQL | Language: Thai (CEFR A1-C2)</p>
        
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-2xl font-bold mb-4">🌐 Features</h2>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Thai Tones:</strong> 5-tone system (mid, low, falling, high, rising)</li>
            <li><strong>CEFR Levels:</strong> A1 (Breakthrough) to C2 (Mastery)</li>
            <li><strong>Classifiers:</strong> Thai-specific counting words (ลักษณนาม)</li>
            <li><strong>Particles:</strong> Polite forms and sentence particles (ครับ/ค่ะ)</li>
            <li><strong>Spaced Repetition:</strong> SM-2 algorithm for optimal learning</li>
          </ul>
        </div>

        <h2 class="text-2xl font-bold mt-6 mb-4">📚 Endpoints:</h2>
        
        <div class="space-y-4">
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-bold text-lg mb-2">GET /api/health</h3>
            <p class="text-sm text-gray-600">Health check with system information</p>
          </div>
          
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-bold text-lg mb-2">GET /api/entries</h3>
            <p class="text-sm text-gray-600 mb-2">Get Thai entries with filters</p>
            <p class="text-xs text-gray-500">Query params: cefr_level, entry_type, tone, archived, limit</p>
          </div>
          
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-bold text-lg mb-2">POST /api/entries</h3>
            <p class="text-sm text-gray-600">Create new Thai entry</p>
            <p class="text-xs text-gray-500">Required: thai_script, romanization, tone, meaning, entry_type, cefr_level</p>
          </div>
          
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-bold text-lg mb-2">GET /api/dashboard/stats</h3>
            <p class="text-sm text-gray-600">Dashboard statistics (by type, CEFR level, tone, learning progress)</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `)
})

// ============ Password Reset UI Pages ============

// Forgot Password Page
app.get('/forgot-password', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Forgot Password - Thai Learning Manager</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
            <div class="text-center mb-8">
                <i class="fas fa-key text-indigo-600 text-5xl mb-4"></i>
                <h1 class="text-3xl font-bold text-gray-800">Forgot Password?</h1>
                <p class="text-gray-600 mt-2">Enter your email to receive a password reset link</p>
            </div>

            <div id="message" class="hidden mb-4 p-4 rounded"></div>

            <form id="forgotPasswordForm" class="space-y-4">
                <div>
                    <label class="block text-gray-700 font-medium mb-2">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="your@email.com"
                    />
                </div>

                <button 
                    type="submit" 
                    class="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                    <i class="fas fa-paper-plane mr-2"></i>Send Reset Link
                </button>
            </form>

            <div class="mt-6 text-center">
                <a href="/" class="text-indigo-600 hover:underline">
                    <i class="fas fa-arrow-left mr-1"></i>Back to Login
                </a>
            </div>
        </div>

        <script>
            document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const messageDiv = document.getElementById('message');
                
                try {
                    const response = await fetch('/api/auth/forgot-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                    
                    const data = await response.json();
                    
                    messageDiv.className = 'mb-4 p-4 rounded bg-green-100 text-green-700';
                    messageDiv.textContent = data.message;
                    messageDiv.classList.remove('hidden');
                    
                    // Show reset URL in development (remove in production)
                    if (data.resetUrl) {
                        messageDiv.innerHTML += '<br><br><strong>Development Mode:</strong><br><a href="' + data.resetUrl + '" class="text-blue-600 underline">Click here to reset password</a>';
                    }
                    
                    document.getElementById('forgotPasswordForm').reset();
                } catch (error) {
                    messageDiv.className = 'mb-4 p-4 rounded bg-red-100 text-red-700';
                    messageDiv.textContent = 'An error occurred. Please try again.';
                    messageDiv.classList.remove('hidden');
                }
            });
        </script>
    </body>
    </html>
  `)
})

// Reset Password Page
app.get('/reset-password', (c) => {
  const token = c.req.query('token');
  
  if (!token) {
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invalid Reset Link - Thai Learning Manager</title>
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
              <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
              <h1 class="text-2xl font-bold text-gray-800 mb-4">Invalid Reset Link</h1>
              <p class="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
              <a href="/forgot-password" class="text-indigo-600 hover:underline">Request a new reset link</a>
          </div>
      </body>
      </html>
    `)
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - Thai Learning Manager</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
            <div class="text-center mb-8">
                <i class="fas fa-lock text-indigo-600 text-5xl mb-4"></i>
                <h1 class="text-3xl font-bold text-gray-800">Reset Password</h1>
                <p class="text-gray-600 mt-2">Enter your new password</p>
            </div>

            <div id="message" class="hidden mb-4 p-4 rounded"></div>

            <form id="resetPasswordForm" class="space-y-4">
                <input type="hidden" id="token" value="${token}">
                
                <div>
                    <label class="block text-gray-700 font-medium mb-2">New Password</label>
                    <input 
                        type="password" 
                        id="newPassword" 
                        required
                        minlength="6"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="At least 6 characters"
                    />
                </div>

                <div>
                    <label class="block text-gray-700 font-medium mb-2">Confirm Password</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        required
                        minlength="6"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Re-enter password"
                    />
                </div>

                <button 
                    type="submit" 
                    class="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                    <i class="fas fa-check mr-2"></i>Reset Password
                </button>
            </form>

            <div class="mt-6 text-center">
                <a href="/" class="text-indigo-600 hover:underline">
                    <i class="fas fa-arrow-left mr-1"></i>Back to Login
                </a>
            </div>
        </div>

        <script>
            document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const token = document.getElementById('token').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const messageDiv = document.getElementById('message');
                
                // Validate passwords match
                if (newPassword !== confirmPassword) {
                    messageDiv.className = 'mb-4 p-4 rounded bg-red-100 text-red-700';
                    messageDiv.textContent = 'Passwords do not match. Please try again.';
                    messageDiv.classList.remove('hidden');
                    return;
                }
                
                try {
                    const response = await fetch('/api/auth/reset-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token, newPassword })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        messageDiv.className = 'mb-4 p-4 rounded bg-green-100 text-green-700';
                        messageDiv.textContent = data.message;
                        messageDiv.classList.remove('hidden');
                        
                        // Redirect to login after 2 seconds
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 2000);
                    } else {
                        messageDiv.className = 'mb-4 p-4 rounded bg-red-100 text-red-700';
                        messageDiv.textContent = data.error || 'Failed to reset password';
                        messageDiv.classList.remove('hidden');
                    }
                } catch (error) {
                    messageDiv.className = 'mb-4 p-4 rounded bg-red-100 text-red-700';
                    messageDiv.textContent = 'An error occurred. Please try again.';
                    messageDiv.classList.remove('hidden');
                }
            });
        </script>
    </body>
    </html>
  `)
})

// ============ Default Route ============

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thai Learning Manager - เรียนภาษาไทย</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Taviraj:wght@400;500;600;700&family=Trirong:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link href="/static/tone-indicators.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <style>
          body {
            font-family: 'Taviraj', 'Trirong', serif;
            font-size: 16px;
            line-height: 1.7;
          }
          .thai-text {
            font-family: 'Taviraj', 'Trirong', serif;
            letter-spacing: 0.025em;
            line-height: 1.8;
            font-weight: 500;
          }
          /* Enhance Thai character rendering */
          .thai-word {
            font-size: 1.1em;
            font-weight: 600;
            color: #1e40af;
          }
          /* Better button and heading fonts */
          button, .font-bold, h1, h2, h3, h4 {
            font-family: 'Taviraj', 'Trirong', serif;
            font-weight: 600;
          }
          /* Cards with Thai text */
          .card .thai-text {
            font-size: 1.15em;
            line-height: 2;
          }
        </style>
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-md sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-800 thai-text">
                                <i class="fas fa-language text-blue-600 mr-2"></i>
                                🇹🇭 Thai Learning Manager
                            </h1>
                            <p class="text-xs text-gray-500 ml-9">v1.5.0</p>
                        </div>
                    </div>
                    
                    <!-- Desktop Navigation -->
                    <div class="hidden md:flex items-center space-x-4">
                        <a href="#" data-page="dashboard" class="px-3 py-2 rounded-md text-sm font-medium text-blue-600">
                            <i class="fas fa-chart-line mr-1"></i>Dashboard
                        </a>
                        <a href="#" data-page="entries" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600">
                            <i class="fas fa-list mr-1"></i>Browse
                        </a>
                        <a href="#" data-page="learn" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600">
                            <i class="fas fa-graduation-cap mr-1"></i>Learn
                        </a>
                        <a href="#" data-page="review" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600">
                            <i class="fas fa-brain mr-1"></i>Review
                        </a>
                        <a href="#" data-page="driving" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600">
                            <i class="fas fa-car mr-1"></i>Driving Mode
                        </a>
                        <a href="/docs" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600">
                            <i class="fas fa-book mr-1"></i>Docs
                        </a>
                        
                        <!-- User Menu -->
                        <div class="relative">
                            <button id="user-menu-btn" class="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 focus:outline-none">
                                <i class="fas fa-user-circle text-xl"></i>
                                <span id="user-name">User</span>
                                <i class="fas fa-chevron-down text-xs"></i>
                            </button>
                            <div id="user-menu" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                <div class="px-4 py-2 text-xs text-gray-500 border-b">
                                    <div id="user-email">user@example.com</div>
                                </div>
                                <button onclick="handleLogout()" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mobile menu button -->
                    <div class="md:hidden flex items-center">
                        <button id="mobile-menu-btn" class="text-gray-600 hover:text-blue-600 focus:outline-none">
                            <i class="fas fa-bars text-2xl"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Mobile menu -->
            <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-200">
                <div class="px-2 pt-2 pb-3 space-y-1">
                    <a href="#" data-page="dashboard" class="block px-3 py-2 rounded-md text-base font-medium text-blue-600">
                        <i class="fas fa-chart-line mr-2"></i>Dashboard
                    </a>
                    <a href="#" data-page="entries" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">
                        <i class="fas fa-list mr-2"></i>Browse Entries
                    </a>
                    <a href="#" data-page="learn" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">
                        <i class="fas fa-graduation-cap mr-2"></i>Learn New
                    </a>
                    <a href="#" data-page="review" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">
                        <i class="fas fa-brain mr-2"></i>Review
                    </a>
                    <a href="#" data-page="driving" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">
                        <i class="fas fa-car mr-2"></i>Driving Mode
                    </a>
                    <a href="/docs" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">
                        <i class="fas fa-book mr-2"></i>API Docs
                    </a>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div id="app">
            
            <!-- Dashboard Page -->
            <div id="dashboard-page">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                        Learning Dashboard
                    </h2>
                    <p class="text-gray-600">Track your Thai learning progress</p>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 mb-1">Total Entries</p>
                                <p id="total-entries" class="text-3xl font-bold text-gray-800">0</p>
                            </div>
                            <div class="bg-blue-100 rounded-full p-3">
                                <i class="fas fa-book text-blue-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 mb-1">Learning</p>
                                <p id="learning-progress" class="text-3xl font-bold text-green-600">0</p>
                            </div>
                            <div class="bg-green-100 rounded-full p-3">
                                <i class="fas fa-graduation-cap text-green-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 mb-1">Due for Review</p>
                                <p id="due-review" class="text-3xl font-bold text-orange-600">0</p>
                            </div>
                            <div class="bg-orange-100 rounded-full p-3">
                                <i class="fas fa-brain text-orange-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 mb-1">Progress</p>
                                <p id="progress-percent" class="text-3xl font-bold text-purple-600">0%</p>
                            </div>
                            <div class="bg-purple-100 rounded-full p-3">
                                <i class="fas fa-chart-pie text-purple-600 text-2xl"></i>
                            </div>
                        </div>
                        <div class="mt-4">
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div id="progress-bar" class="bg-purple-600 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Learning State Breakdown -->
                <div class="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-layer-group text-blue-600 mr-2"></i>
                        Learning State
                    </h3>
                    <div class="grid grid-cols-3 gap-4">
                        <div class="text-center">
                            <p id="state-new" class="text-3xl font-bold text-blue-600">0</p>
                            <p class="text-sm text-gray-600 mt-1">New</p>
                        </div>
                        <div class="text-center">
                            <p id="state-learning" class="text-3xl font-bold text-yellow-600">0</p>
                            <p class="text-sm text-gray-600 mt-1">Learning</p>
                        </div>
                        <div class="text-center">
                            <p id="state-mastered" class="text-3xl font-bold text-green-600">0</p>
                            <p class="text-sm text-gray-600 mt-1">Mastered</p>
                        </div>
                    </div>
                </div>

                <!-- CEFR Progression -->
                <div class="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-layer-group text-blue-600 mr-2"></i>
                        CEFR Progression
                    </h3>
                    <div id="cefr-progression-bars" class="mb-4">
                        <!-- CEFR bars will be rendered here -->
                    </div>
                    <div class="bg-blue-50 rounded-lg p-4 mt-4">
                        <p class="text-sm text-blue-800">
                            <i class="fas fa-lightbulb mr-2"></i>
                            <strong>Focus Recommendation:</strong> 
                            <span id="focus-message">Loading...</span>
                        </p>
                    </div>
                </div>

                <!-- Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div style="height: 300px;">
                            <canvas id="cefr-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div style="height: 300px;">
                            <canvas id="type-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div style="height: 300px;">
                            <canvas id="tone-chart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Thai Tone Reference -->
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
                    <h3 class="text-lg font-bold text-purple-800 mb-3">
                        <i class="fas fa-music text-purple-600 mr-2"></i>
                        Thai Tone Reference
                    </h3>
                    <div id="tone-reference-cards" class="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                        <!-- Tone indicators will be rendered here by JavaScript -->
                    </div>
                </div>
                            <p class="font-semibold text-gray-800">Rising</p>
                            <p class="text-gray-600 text-xs">Upward rise</p>
                        </div>
                    </div>
                </div>
                
                <div id="dashboard-content"></div>
            </div>

            <!-- Entries Page -->
            <div id="entries-page" class="hidden">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-list text-blue-600 mr-2"></i>
                        Browse Entries
                    </h2>
                    <p class="text-gray-600">Search and manage your Thai vocabulary</p>
                </div>
                <div id="entries-content"></div>
            </div>

            <!-- Learn Page -->
            <div id="learn-page" class="hidden">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-graduation-cap text-green-600 mr-2"></i>
                        Learn New Items
                    </h2>
                    <p class="text-gray-600">Study new Thai vocabulary and phrases</p>
                </div>
                <div id="learn-content"></div>
            </div>

            <!-- Review Page -->
            <div id="review-page" class="hidden">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-brain text-orange-600 mr-2"></i>
                        Review Sessions
                    </h2>
                    <p class="text-gray-600">Reinforce your learning with spaced repetition</p>
                </div>
                <div id="review-content"></div>
            </div>

            <!-- Driving Mode Page -->
            <div id="driving-page" class="hidden">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-car text-purple-600 mr-2"></i>
                        Driving Mode
                    </h2>
                    <p class="text-gray-600">Hands-free audio learning for Thai vocabulary</p>
                </div>

                <!-- Mode Selection -->
                <div class="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 class="text-xl font-bold mb-4">
                        <i class="fas fa-list text-purple-600 mr-2"></i>
                        Choose Learning Mode
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onclick="initializeDrivingMode('recent')" class="p-4 border-2 border-purple-300 rounded-lg hover:bg-purple-50 text-left">
                            <div class="text-2xl mb-2">🕐</div>
                            <div class="font-bold text-lg">Recently Learned</div>
                            <div class="text-gray-600 text-sm">Review your most recent words</div>
                        </button>
                        <button onclick="initializeDrivingMode('due')" class="p-4 border-2 border-orange-300 rounded-lg hover:bg-orange-50 text-left">
                            <div class="text-2xl mb-2">⏰</div>
                            <div class="font-bold text-lg">Due for Review</div>
                            <div class="text-gray-600 text-sm">Practice words that need review</div>
                        </button>
                        <button onclick="initializeDrivingMode('random')" class="p-4 border-2 border-blue-300 rounded-lg hover:bg-blue-50 text-left">
                            <div class="text-2xl mb-2">🎲</div>
                            <div class="font-bold text-lg">Random Words</div>
                            <div class="text-gray-600 text-sm">Explore random vocabulary</div>
                        </button>
                    </div>
                </div>

                <!-- Settings Panel -->
                <div class="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 class="text-xl font-bold mb-4">
                        <i class="fas fa-cog text-purple-600 mr-2"></i>
                        Settings
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Speed Control -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-gauge mr-1"></i>
                                Speech Speed
                            </label>
                            <select id="driving-speed" onchange="updateDrivingModeSpeed(this.value)" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                <option value="0.7">Slow (0.7x)</option>
                                <option value="0.9" selected>Normal (0.9x)</option>
                                <option value="1.0">Standard (1.0x)</option>
                                <option value="1.2">Fast (1.2x)</option>
                            </select>
                        </div>

                        <!-- Toggle Settings -->
                        <div class="space-y-3">
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" checked onchange="toggleDrivingModeSetting('repeatWord')" class="rounded">
                                <span class="text-sm">Repeat Thai word at end</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" checked onchange="toggleDrivingModeSetting('includeExamples')" class="rounded">
                                <span class="text-sm">Include example sentences</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Player Controls -->
                <div class="bg-purple-50 rounded-lg shadow-lg p-6 mb-6">
                    <div class="mb-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-medium text-gray-700">Progress</span>
                            <span id="driving-progress-text" class="text-sm text-gray-600">0 / 0</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3">
                            <div id="driving-progress-bar" class="bg-purple-600 h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                    </div>

                    <!-- Current Word Display -->
                    <div id="driving-current-word" class="text-center py-8 mb-6 bg-white rounded-lg border-2 border-purple-200">
                        <div class="text-gray-400 text-xl">
                            <i class="fas fa-car text-3xl mb-2"></i>
                            <p>Select a mode above to start</p>
                        </div>
                    </div>

                    <!-- Control Buttons -->
                    <div class="flex justify-center items-center space-x-3">
                        <button id="driving-prev-btn" onclick="previousWord()" disabled class="bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="fas fa-step-backward"></i>
                        </button>
                        
                        <button id="driving-play-btn" onclick="resumeDrivingMode()" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
                            <i class="fas fa-play mr-2"></i>
                            Play
                        </button>
                        
                        <button id="driving-pause-btn" onclick="pauseDrivingMode()" class="hidden bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
                            <i class="fas fa-pause mr-2"></i>
                            Pause
                        </button>
                        
                        <button id="driving-stop-btn" onclick="stopDrivingMode()" disabled class="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="fas fa-stop"></i>
                        </button>
                        
                        <button id="driving-skip-btn" onclick="skipWord()" disabled class="bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="fas fa-step-forward"></i>
                        </button>
                    </div>
                </div>

                <!-- Safety Notice -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div class="flex items-start">
                        <i class="fas fa-exclamation-triangle text-yellow-600 text-xl mr-3 mt-1"></i>
                        <div>
                            <h4 class="font-bold text-yellow-800 mb-1">Safety First</h4>
                            <p class="text-sm text-yellow-700">
                                If you're using this while driving, please ensure it's safe and legal in your jurisdiction. 
                                Always keep your eyes on the road and hands on the wheel. Your safety is the priority.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- How It Works -->
                <div class="bg-white rounded-lg shadow p-6 mt-6">
                    <h3 class="text-xl font-bold mb-3">
                        <i class="fas fa-info-circle text-purple-600 mr-2"></i>
                        How It Works
                    </h3>
                    <ol class="list-decimal pl-6 space-y-2 text-gray-700">
                        <li>Choose a learning mode (Recent, Due, or Random)</li>
                        <li>The app will speak each Thai word clearly</li>
                        <li>You'll hear the romanization (pronunciation guide)</li>
                        <li>Then the English meaning</li>
                        <li>Followed by tone information</li>
                        <li>An example sentence (if available and enabled)</li>
                        <li>And finally, the Thai word repeated</li>
                    </ol>
                    <div class="mt-4 p-3 bg-purple-50 rounded-lg">
                        <p class="text-sm text-gray-700">
                            <strong>Tip:</strong> This mode works best with headphones or your car's audio system. 
                            Adjust the speech speed to match your comfort level.
                        </p>
                    </div>
                </div>
            </div>

            </div><!-- #app -->
        </main>

        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200 mt-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="text-center text-gray-600 text-sm">
                    <p class="mb-2">Thai Learning Manager v${VERSION} • Built with Hono + Neon PostgreSQL + Cloudflare Pages</p>
                    <p>CEFR-based spaced repetition • 5 Thai tones • Classifiers support</p>
                </div>
            </div>
        </footer>

        <!-- Load Scripts -->
        <script src="/static/tone-indicators.js"></script>
        <script src="/static/thai-pronunciation.js"></script>
        <script src="/static/driving-mode.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app

// ============ SRS Algorithm (SM-2) ============

function calculateSRS(quality: number, currentSrsLevel: number, easeFactor: number, interval: number) {
  // SM-2 Spaced Repetition Algorithm
  // quality: 0-5 (0=total failure, 5=perfect recall)
  
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3
  }
  
  let newInterval: number
  let newSrsLevel: number
  
  if (quality < 3) {
    // Failed - reset to beginning
    newInterval = 1
    newSrsLevel = 0
  } else {
    // Passed
    if (currentSrsLevel === 0) {
      newInterval = 1
    } else if (currentSrsLevel === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * newEaseFactor)
    }
    newSrsLevel = currentSrsLevel + 1
  }
  
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)
  
  return {
    newSrsLevel,
    newEaseFactor,
    newInterval,
    nextReviewDate
  }
}

// ============ Review System ============

app.get('/api/revision/due', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const userId = c.get('userId') // From auth middleware
    const limit = parseInt(c.req.query('limit') || '20')
    const cefrLevel = c.req.query('cefr_level')
    const entryType = c.req.query('entry_type')
    
    // Get entries due for review for this user
    const sql = db.getDbClient(DATABASE_URL)
    
    let query = sql`
      SELECT e.*, up.state, up.mastery_level, up.next_review, up.review_count
      FROM entries e
      INNER JOIN user_progress up ON e.id = up.entry_id
      WHERE up.user_id = ${userId}
        AND up.next_review <= CURRENT_TIMESTAMP
        AND up.state != 'mastered'
    `
    
    if (cefrLevel) {
      query = sql`
        SELECT e.*, up.state, up.mastery_level, up.next_review, up.review_count
        FROM entries e
        INNER JOIN user_progress up ON e.id = up.entry_id
        WHERE up.user_id = ${userId}
          AND up.next_review <= CURRENT_TIMESTAMP
          AND up.state != 'mastered'
          AND e.cefr_level = ${cefrLevel}
      `
    }
    
    const result = await query
    
    // Filter by entry type if specified
    let filtered = result
    if (entryType) {
      filtered = result.filter((item: any) => item.entry_type === entryType)
    }
    
    return c.json(filtered.slice(0, limit))
  } catch (error: any) {
    console.error('Error fetching due items:', error)
    return c.json({ error: 'Failed to fetch due items', details: error.message }, 500)
  }
})

app.post('/api/revision/submit', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const userId = c.get('userId') // From auth middleware
    const { entry_id, quality } = await c.req.json()
    
    if (!entry_id || quality === undefined) {
      return c.json({ error: 'Missing entry_id or quality' }, 400)
    }
    
    if (quality < 0 || quality > 5) {
      return c.json({ error: 'Quality must be between 0 and 5' }, 400)
    }
    
    // Get or create user progress
    let progress = await db.getUserProgress(DATABASE_URL, userId, entry_id)
    
    if (!progress) {
      // Create new progress
      await db.upsertUserProgress(DATABASE_URL, {
        user_id: userId,
        entry_id: entry_id,
        state: 'learning',
        mastery_level: 0,
        review_count: 0
      })
      progress = await db.getUserProgress(DATABASE_URL, userId, entry_id)
    }
    
    // Simple SRS calculation
    const currentMastery = progress.mastery_level || 0
    const newMastery = quality >= 3 ? currentMastery + 1 : Math.max(0, currentMastery - 1)
    
    // Calculate next review interval (simple algorithm)
    let intervalDays = 1
    if (newMastery >= 1) intervalDays = 2
    if (newMastery >= 2) intervalDays = 4
    if (newMastery >= 3) intervalDays = 7
    if (newMastery >= 4) intervalDays = 14
    if (newMastery >= 5) intervalDays = 30
    
    const nextReview = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString()
    
    // Determine state
    let state = 'learning'
    if (newMastery >= 5) state = 'mastered'
    
    // Update progress
    await db.upsertUserProgress(DATABASE_URL, {
      user_id: userId,
      entry_id: entry_id,
      state: state,
      mastery_level: newMastery,
      last_reviewed: new Date().toISOString(),
      next_review: nextReview,
      review_count: (progress.review_count || 0) + 1,
      easy_count: quality >= 4 ? (progress.easy_count || 0) + 1 : (progress.easy_count || 0),
      hard_count: quality < 3 ? (progress.hard_count || 0) + 1 : (progress.hard_count || 0)
    })
    
    return c.json({
      success: true,
      mastery_level: newMastery,
      interval_days: intervalDays,
      next_review: nextReview,
      state: state
    })
  } catch (error: any) {
    console.error('Error submitting review:', error)
    return c.json({ error: 'Failed to submit review', details: error.message }, 500)
  }
})

app.get('/api/revision/stats', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const userId = c.get('userId') // From auth middleware
    const progressStats = await db.getUserProgressStats(DATABASE_URL, userId)
    
    // Calculate stats
    const totalLearning = progressStats.length
    const dueNow = progressStats.filter((p: any) => 
      p.next_review && new Date(p.next_review) <= new Date()
    ).length
    const mastered = progressStats.filter((p: any) => p.state === 'mastered').length
    
    return c.json({
      total_learning: totalLearning,
      due_now: dueNow,
      mastered: mastered,
      learning: totalLearning - mastered
    })
  } catch (error: any) {
    console.error('Error fetching revision stats:', error)
    return c.json({ error: 'Failed to fetch stats', details: error.message }, 500)
  }
})

// ============ Learning System ============

app.get('/api/learning/new', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const userId = c.get('userId') // From auth middleware
    const limit = parseInt(c.req.query('limit') || '10')
    const cefrLevel = c.req.query('cefr_level') || 'A1'
    
    // Get entries that don't have progress yet for this user
    const sql = db.getDbClient(DATABASE_URL)
    const result = await sql`
      SELECT e.* FROM entries e
      LEFT JOIN user_progress up ON e.id = up.entry_id AND up.user_id = ${userId}
      WHERE up.id IS NULL
        AND e.archived = false
        AND e.cefr_level = ${cefrLevel}
      ORDER BY e.difficulty ASC, e.created_at ASC
      LIMIT ${limit}
    `
    
    return c.json(result)
  } catch (error: any) {
    console.error('Error fetching new items:', error)
    return c.json({ error: 'Failed to fetch new items', details: error.message }, 500)
  }
})

app.post('/api/learning/start', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const userId = c.get('userId') // From auth middleware
    const { entry_id } = await c.req.json()
    
    if (!entry_id) {
      return c.json({ error: 'Missing entry_id' }, 400)
    }
    
    // Create user progress with state 'learning'
    await db.upsertUserProgress(DATABASE_URL, {
      user_id: userId,
      entry_id: entry_id,
      state: 'learning',
      mastery_level: 0,
      last_reviewed: new Date().toISOString(),
      next_review: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +1 day
      review_count: 1
    })
    
    return c.json({
      success: true,
      message: 'Learning started'
    })
  } catch (error: any) {
    console.error('Error starting learning:', error)
    return c.json({ error: 'Failed to start learning', details: error.message }, 500)
  }
})

// ============ CEFR Progression ============

app.get('/api/cefr/progression', async (c) => {
  const { DATABASE_URL } = c.env
  if (!DATABASE_URL) {
    return c.json({ error: 'DATABASE_URL not configured' }, 500)
  }

  try {
    const userId = c.get('userId') // From auth middleware
    const sql = db.getDbClient(DATABASE_URL)
    
    // Get all entries by CEFR level
    const allEntries = await sql`
      SELECT cefr_level, COUNT(*) as total
      FROM entries
      WHERE archived = false
      GROUP BY cefr_level
    `
    
    // Get user's mastered entries by CEFR level
    const masteredEntries = await sql`
      SELECT e.cefr_level, COUNT(*) as mastered
      FROM entries e
      INNER JOIN user_progress up ON e.id = up.entry_id
      WHERE up.user_id = ${userId} AND up.state = 'mastered'
      GROUP BY e.cefr_level
    `
    
    // Build progression object
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const progression: any = {}
    
    levels.forEach(level => {
      const total = parseInt(allEntries.find((e: any) => e.cefr_level === level)?.total || '0')
      const mastered = parseInt(masteredEntries.find((e: any) => e.cefr_level === level)?.mastered || '0')
      progression[level] = {
        total,
        mastered,
        percentage: total > 0 ? Math.round((mastered / total) * 100) : 0
      }
    })
    
    // Calculate overall progress
    let totalEntries = 0
    let totalMastered = 0
    
    Object.values(progression).forEach((level: any) => {
      totalEntries += level.total
      totalMastered += level.mastered
    })
    
    const overallPercentage = totalEntries > 0 
      ? Math.round((totalMastered / totalEntries) * 100)
      : 0
    
    // Determine current focus level (first level not mastered)
    let currentLevel = 'A1'
    for (const level of levels) {
      if (progression[level].percentage < 80) {
        currentLevel = level
        break
      }
    }
    
    return c.json({
      progression,
      overall: {
        total_entries: totalEntries,
        total_mastered: totalMastered,
        percentage: overallPercentage
      },
      recommendation: {
        focus_level: currentLevel,
        message: `Focus on ${currentLevel} - ${getLevelName(currentLevel)}`
      }
    })
  } catch (error: any) {
    console.error('Error fetching CEFR progression:', error)
    return c.json({ error: 'Failed to fetch progression', details: error.message }, 500)
  }
})

// ============ AI Generation Endpoints ============

app.post('/api/ai/generate-entry', async (c) => {
  const { DATABASE_URL, GEMINI_API_KEY } = c.env
  
  if (!GEMINI_API_KEY) {
    return c.json({ error: 'GEMINI_API_KEY not configured' }, 500)
  }
  
  try {
    const body = await c.req.json()
    const { prompt, cefr_level, entry_type, count } = body
    
    if (!prompt) {
      return c.json({ error: 'Missing required field: prompt' }, 400)
    }
    
    const entries = await ai.generateEntry({
      prompt,
      cefr_level: cefr_level || 'A1',
      entry_type: entry_type || 'word',
      count: count || 1
    }, GEMINI_API_KEY)
    
    // Validate entries
    const validated = entries.map((entry: any) => {
      const validation = ai.validateEntry(entry)
      return {
        entry,
        validation
      }
    })
    
    return c.json({
      success: true,
      count: entries.length,
      entries: validated
    })
  } catch (error: any) {
    console.error('Error generating entry:', error)
    return c.json({ 
      error: 'Failed to generate entry', 
      details: error.message 
    }, 500)
  }
})

app.post('/api/ai/enhance-entry', async (c) => {
  const { GEMINI_API_KEY } = c.env
  
  if (!GEMINI_API_KEY) {
    return c.json({ error: 'GEMINI_API_KEY not configured' }, 500)
  }
  
  try {
    const body = await c.req.json()
    const { thai_script, romanization, meaning } = body
    
    if (!thai_script) {
      return c.json({ error: 'Missing required field: thai_script' }, 400)
    }
    
    const enhanced = await ai.enhanceEntry({
      thai_script,
      romanization,
      meaning
    }, GEMINI_API_KEY)
    
    const validation = ai.validateEntry(enhanced)
    
    return c.json({
      success: true,
      entry: enhanced,
      validation
    })
  } catch (error: any) {
    console.error('Error enhancing entry:', error)
    return c.json({ 
      error: 'Failed to enhance entry', 
      details: error.message 
    }, 500)
  }
})

app.post('/api/ai/generate-batch', async (c) => {
  const { GEMINI_API_KEY } = c.env
  
  if (!GEMINI_API_KEY) {
    return c.json({ error: 'GEMINI_API_KEY not configured' }, 500)
  }
  
  try {
    const body = await c.req.json()
    const { topic, cefr_level, count } = body
    
    if (!topic) {
      return c.json({ error: 'Missing required field: topic' }, 400)
    }
    
    const entries = await ai.generateBatch(
      topic,
      cefr_level || 'A1',
      count || 5,
      GEMINI_API_KEY
    )
    
    // Validate all entries
    const validated = entries.map((entry: any) => {
      const validation = ai.validateEntry(entry)
      return {
        entry,
        validation
      }
    })
    
    return c.json({
      success: true,
      topic,
      count: entries.length,
      entries: validated
    })
  } catch (error: any) {
    console.error('Error generating batch:', error)
    return c.json({ 
      error: 'Failed to generate batch', 
      details: error.message 
    }, 500)
  }
})

app.post('/api/ai/generate-examples', async (c) => {
  const { GEMINI_API_KEY } = c.env
  
  if (!GEMINI_API_KEY) {
    return c.json({ error: 'GEMINI_API_KEY not configured' }, 500)
  }
  
  try {
    const body = await c.req.json()
    const { thai_script, meaning, count } = body
    
    if (!thai_script || !meaning) {
      return c.json({ error: 'Missing required fields: thai_script, meaning' }, 400)
    }
    
    const examples = await ai.generateExamples(
      thai_script,
      meaning,
      count || 3,
      GEMINI_API_KEY
    )
    
    return c.json({
      success: true,
      thai_script,
      count: examples.length,
      examples
    })
  } catch (error: any) {
    console.error('Error generating examples:', error)
    return c.json({ 
      error: 'Failed to generate examples', 
      details: error.message 
    }, 500)
  }
})

// ============ Helper Functions ============

function getLevelName(level: string): string {
  const names: Record<string, string> = {
    'A1': 'Breakthrough - Basic survival Thai',
    'A2': 'Waystage - Tourist conversations',
    'B1': 'Threshold - Daily life communication',
    'B2': 'Vantage - Fluent conversations',
    'C1': 'Proficiency - Professional/academic',
    'C2': 'Mastery - Native-like fluency'
  }
  return names[level] || level
}

