// Thai Learning Manager - Backend API
// Version: 1.0.0-thai
// Database: Neon PostgreSQL with CEFR levels and Thai tones

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import * as db from './db'
import * as ai from './ai'
import * as auth from './auth'

// Version constant
const VERSION = '1.0.0-thai'

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
  const publicPaths = ['/api/auth/', '/api/health', '/api/version']
  
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

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))

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
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;700&family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <style>
          body {
            font-family: 'Sarabun', 'Noto Sans Thai', sans-serif;
          }
          .thai-text {
            font-family: 'Noto Sans Thai', sans-serif;
          }
        </style>
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-md sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-gray-800 thai-text">
                            <i class="fas fa-language text-blue-600 mr-2"></i>
                            🇹🇭 Thai Learning Manager
                        </h1>
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
                        <a href="/docs" class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600">
                            <i class="fas fa-book mr-1"></i>Docs
                        </a>
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
                    <a href="/docs" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">
                        <i class="fas fa-book mr-2"></i>API Docs
                    </a>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
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
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                        <div class="bg-white rounded p-3 text-center">
                            <div class="text-2xl mb-1">🔵</div>
                            <p class="font-semibold text-gray-800">Mid</p>
                            <p class="text-gray-600 text-xs">Flat tone</p>
                        </div>
                        <div class="bg-white rounded p-3 text-center">
                            <div class="text-2xl mb-1">🟢</div>
                            <p class="font-semibold text-gray-800">Low</p>
                            <p class="text-gray-600 text-xs">Low falling</p>
                        </div>
                        <div class="bg-white rounded p-3 text-center">
                            <div class="text-2xl mb-1">🔴</div>
                            <p class="font-semibold text-gray-800">Falling</p>
                            <p class="text-gray-600 text-xs">Sharp drop</p>
                        </div>
                        <div class="bg-white rounded p-3 text-center">
                            <div class="text-2xl mb-1">🟠</div>
                            <p class="font-semibold text-gray-800">High</p>
                            <p class="text-gray-600 text-xs">High level</p>
                        </div>
                        <div class="bg-white rounded p-3 text-center">
                            <div class="text-2xl mb-1">🟣</div>
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
      const total = allEntries.find((e: any) => e.cefr_level === level)?.total || 0
      const mastered = masteredEntries.find((e: any) => e.cefr_level === level)?.mastered || 0
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

