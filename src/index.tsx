// Thai Learning Manager - Backend API
// Version: 1.0.0-thai
// Database: Neon PostgreSQL with CEFR levels and Thai tones

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import * as db from './db'
import * as ai from './ai'

// Version constant
const VERSION = '1.0.0-thai'

// Bindings for Cloudflare environment variables
type Bindings = {
  DATABASE_URL: string
  GEMINI_API_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

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
    const stats = await db.getDashboardStats(DATABASE_URL)
    return c.json(stats)
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
    const limit = parseInt(c.req.query('limit') || '20')
    const cefrLevel = c.req.query('cefr_level')
    const entryType = c.req.query('entry_type')
    
    const items = await db.getDueForReview(DATABASE_URL, limit)
    
    // Filter by CEFR level if specified
    let filtered = items
    if (cefrLevel) {
      filtered = items.filter((item: any) => item.cefr_level === cefrLevel)
    }
    if (entryType) {
      filtered = filtered.filter((item: any) => item.entry_type === entryType)
    }
    
    return c.json(filtered)
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
    const { entry_id, quality } = await c.req.json()
    
    if (!entry_id || quality === undefined) {
      return c.json({ error: 'Missing entry_id or quality' }, 400)
    }
    
    if (quality < 0 || quality > 5) {
      return c.json({ error: 'Quality must be between 0 and 5' }, 400)
    }
    
    // Get or create learning progress
    let progress = await db.getLearningProgress(DATABASE_URL, entry_id)
    
    if (!progress) {
      progress = await db.createLearningProgress(DATABASE_URL, entry_id)
    }
    
    // Calculate new SRS values
    const srsResult = calculateSRS(
      quality,
      progress.srs_level,
      progress.ease_factor,
      progress.interval
    )
    
    // Update progress
    const updatedProgress = await db.updateLearningProgress(DATABASE_URL, entry_id, {
      srs_level: srsResult.newSrsLevel,
      ease_factor: srsResult.newEaseFactor,
      interval: srsResult.newInterval,
      next_review: srsResult.nextReviewDate,
      last_reviewed: new Date(),
      correct_count: quality >= 3 ? progress.correct_count + 1 : progress.correct_count,
      incorrect_count: quality < 3 ? progress.incorrect_count + 1 : progress.incorrect_count
    })
    
    return c.json({
      success: true,
      srs_level: srsResult.newSrsLevel,
      interval: srsResult.newInterval,
      next_review: srsResult.nextReviewDate,
      progress: updatedProgress
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
    const stats = await db.getStats(DATABASE_URL)
    return c.json(stats)
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
    const limit = parseInt(c.req.query('limit') || '10')
    const cefrLevel = c.req.query('cefr_level') || 'A1'
    
    // Get entries that don't have learning progress yet
    const sql = db.getDbClient(DATABASE_URL)
    const result = await sql.query(
      `SELECT e.* FROM entries e
       LEFT JOIN learning_progress lp ON e.id = lp.entry_id
       WHERE lp.id IS NULL
         AND e.archived = false
         AND e.cefr_level = $1
       ORDER BY e.difficulty ASC, e.created_at ASC
       LIMIT $2`,
      [cefrLevel, limit]
    )
    
    return c.json(result.rows)
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
    const { entry_id } = await c.req.json()
    
    if (!entry_id) {
      return c.json({ error: 'Missing entry_id' }, 400)
    }
    
    // Create learning progress
    const progress = await db.createLearningProgress(DATABASE_URL, entry_id)
    
    return c.json({
      success: true,
      progress
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
    const progression = await db.getCEFRProgression(DATABASE_URL)
    
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
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
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

