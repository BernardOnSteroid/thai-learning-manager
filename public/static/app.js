// Thai Learning Manager - Frontend JavaScript
// Version: 1.0.0-thai
// Build Date: 2026-03-05

console.log('🇹🇭 Thai Learning Manager Frontend v1.0.0 loaded');

// ============ Configuration ============

const API_BASE = '';  // Same origin
let currentPage = 'dashboard';

// ============ API Helper Functions ============

async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============ Dashboard Functions ============

async function loadDashboard() {
  try {
    showLoading('dashboard-content');
    
    // Fetch all dashboard data in parallel
    const [stats, cefrProgression, dashboardStats] = await Promise.all([
      apiRequest('/api/revision/stats'),
      apiRequest('/api/cefr/progression'),
      apiRequest('/api/dashboard/stats')
    ]);
    
    // Render stats cards
    renderStatsCards(stats, dashboardStats);
    
    // Render CEFR progression
    renderCEFRProgression(cefrProgression);
    
    // Render charts
    renderCharts(dashboardStats, cefrProgression);
    
    hideLoading('dashboard-content');
  } catch (error) {
    showError('dashboard-content', 'Failed to load dashboard: ' + error.message);
  }
}

function renderStatsCards(stats, dashboardStats) {
  // Safely update stats cards
  const totalEntriesEl = document.getElementById('total-entries');
  const learningProgressEl = document.getElementById('learning-progress');
  const dueReviewEl = document.getElementById('due-review');
  const progressPercentEl = document.getElementById('progress-percent');
  
  if (totalEntriesEl) totalEntriesEl.textContent = stats.total_entries || 0;
  if (learningProgressEl) learningProgressEl.textContent = stats.learning_progress || 0;
  if (dueReviewEl) dueReviewEl.textContent = stats.due_for_review || 0;
  
  // Calculate progress percentage
  const progressPercent = stats.total_entries > 0 
    ? Math.round((stats.learning_progress / stats.total_entries) * 100)
    : 0;
  if (progressPercentEl) progressPercentEl.textContent = progressPercent + '%';
  
  // Update progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = progressPercent + '%';
  }
  
  // Render state breakdown
  if (dashboardStats && dashboardStats.byState) {
    const stateNewEl = document.getElementById('state-new');
    const stateLearningEl = document.getElementById('state-learning');
    const stateMasteredEl = document.getElementById('state-mastered');
    
    if (stateNewEl) stateNewEl.textContent = dashboardStats.byState.new || 0;
    if (stateLearningEl) stateLearningEl.textContent = dashboardStats.byState.learning || 0;
    if (stateMasteredEl) stateMasteredEl.textContent = dashboardStats.byState.mastered || 0;
  }
}

function renderCEFRProgression(data) {
  const container = document.getElementById('cefr-progression-bars');
  if (!container) return;
  
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const levelNames = {
    'A1': 'Breakthrough',
    'A2': 'Waystage',
    'B1': 'Threshold',
    'B2': 'Vantage',
    'C1': 'Proficiency',
    'C2': 'Mastery'
  };
  
  const colors = {
    'A1': 'bg-green-500',
    'A2': 'bg-blue-500',
    'B1': 'bg-yellow-500',
    'B2': 'bg-orange-500',
    'C1': 'bg-red-500',
    'C2': 'bg-purple-500'
  };
  
  container.innerHTML = levels.map(level => {
    const levelData = data.progression[level] || { total: 0, mastered: 0, percentage: 0 };
    const color = colors[level];
    
    return `
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1">
          <div class="flex items-center">
            <span class="font-semibold text-gray-700 w-12">${level}</span>
            <span class="text-sm text-gray-500 ml-2">${levelNames[level]}</span>
          </div>
          <div class="text-sm text-gray-600">
            ${levelData.mastered}/${levelData.total} (${levelData.percentage}%)
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div class="${color} h-3 rounded-full transition-all duration-500" 
               style="width: ${levelData.percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
  
  // Show recommendation
  if (data.recommendation) {
    const focusLevelEl = document.getElementById('focus-level');
    const focusMessageEl = document.getElementById('focus-message');
    
    if (focusLevelEl) {
      focusLevelEl.textContent = data.recommendation.focus_level;
    }
    if (focusMessageEl) {
      focusMessageEl.textContent = data.recommendation.message;
    }
  }
}

let charts = {};

function renderCharts(dashboardStats, cefrProgression) {
  // CEFR Bar Chart
  renderCEFRChart(cefrProgression);
  
  // Entry Type Pie Chart
  renderTypeChart(dashboardStats.byType || {});
  
  // Tone Distribution Chart
  renderToneChart(dashboardStats.byTone || {});
}

function renderCEFRChart(cefrProgression) {
  const ctx = document.getElementById('cefr-chart');
  if (!ctx) return;
  
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const data = levels.map(level => {
    const levelData = cefrProgression.progression[level] || { total: 0 };
    return levelData.total;
  });
  
  if (charts.cefrChart) {
    charts.cefrChart.destroy();
  }
  
  charts.cefrChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: levels,
      datasets: [{
        label: 'Entries per CEFR Level',
        data: data,
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',   // A1 - green
          'rgba(59, 130, 246, 0.7)',  // A2 - blue
          'rgba(234, 179, 8, 0.7)',   // B1 - yellow
          'rgba(249, 115, 22, 0.7)',  // B2 - orange
          'rgba(239, 68, 68, 0.7)',   // C1 - red
          'rgba(168, 85, 247, 0.7)'   // C2 - purple
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
          'rgb(168, 85, 247)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Entries by CEFR Level',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

function renderTypeChart(byType) {
  const ctx = document.getElementById('type-chart');
  if (!ctx) return;
  
  const types = Object.keys(byType);
  const data = Object.values(byType);
  
  if (types.length === 0) {
    ctx.parentElement.innerHTML = '<p class="text-gray-500 text-center py-8">No entries yet</p>';
    return;
  }
  
  if (charts.typeChart) {
    charts.typeChart.destroy();
  }
  
  charts.typeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: types.map(t => t.charAt(0).toUpperCase() + t.slice(1)),
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',   // blue
          'rgba(34, 197, 94, 0.7)',    // green
          'rgba(249, 115, 22, 0.7)',   // orange
          'rgba(168, 85, 247, 0.7)',   // purple
          'rgba(236, 72, 153, 0.7)',   // pink
          'rgba(234, 179, 8, 0.7)'     // yellow
        ],
        borderColor: 'white',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Entries by Type',
          font: { size: 16 }
        }
      }
    }
  });
}

function renderToneChart(byTone) {
  const ctx = document.getElementById('tone-chart');
  if (!ctx) return;
  
  const tones = Object.keys(byTone);
  const data = Object.values(byTone);
  
  if (tones.length === 0) {
    ctx.parentElement.innerHTML = '<p class="text-gray-500 text-center py-8">No entries yet</p>';
    return;
  }
  
  const toneNames = {
    'mid': '🔵 Mid',
    'low': '🟢 Low',
    'falling': '🔴 Falling',
    'high': '🟠 High',
    'rising': '🟣 Rising'
  };
  
  if (charts.toneChart) {
    charts.toneChart.destroy();
  }
  
  charts.toneChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: tones.map(t => toneNames[t] || t),
      datasets: [{
        label: 'Entries by Tone',
        data: data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',   // blue - mid
          'rgba(34, 197, 94, 0.7)',    // green - low
          'rgba(239, 68, 68, 0.7)',    // red - falling
          'rgba(249, 115, 22, 0.7)',   // orange - high
          'rgba(168, 85, 247, 0.7)'    // purple - rising
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(168, 85, 247)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Thai Tone Distribution',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// ============ Navigation ============

function showPage(pageName) {
  currentPage = pageName;
  
  // Hide all pages
  document.querySelectorAll('[id$="-page"]').forEach(page => {
    page.classList.add('hidden');
  });
  
  // Show selected page
  const page = document.getElementById(pageName + '-page');
  if (page) {
    page.classList.remove('hidden');
  }
  
  // Update navigation active state
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === pageName) {
      link.classList.add('text-blue-600', 'font-semibold');
      link.classList.remove('text-gray-600');
    } else {
      link.classList.remove('text-blue-600', 'font-semibold');
      link.classList.add('text-gray-600');
    }
  });
  
  // Load page data
  switch (pageName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'entries':
      loadEntriesPage();
      break;
    case 'learn':
      loadLearnPage();
      break;
    case 'review':
      loadReviewPage();
      break;
  }
}

// ============ Utility Functions ============

function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    `;
  }
}

function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = ''; // Clear loading spinner
  }
}

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <i class="fas fa-exclamation-circle mr-2"></i>
        ${message}
      </div>
    `;
  }
}

function showSuccess(message) {
  // TODO: Implement toast notification
  alert(message);
}

// ============ Entry Management Functions ============

let currentEntries = [];
let currentFilters = { cefr_level: '', entry_type: '', tone: '', archived: false };

async function loadEntriesPage() {
  const container = document.getElementById('entries-content');
  if (!container) return;
  
  showLoading('entries-content');
  
  try {
    // Render filter controls and create button
    container.innerHTML = `
      <div class="mb-6">
        <!-- Create Entry Buttons -->
        <div class="flex gap-3 mb-6">
          <button onclick="showCreateEntryForm()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center">
            <i class="fas fa-plus mr-2"></i>Create New Entry
          </button>
          <button onclick="showAIGenerationForm()" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center">
            <i class="fas fa-robot mr-2"></i>AI Generate
          </button>
        </div>
        
        <!-- Filter Controls -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-filter text-blue-600 mr-2"></i>Filters
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">CEFR Level</label>
              <select id="filter-cefr" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onchange="applyFilters()">
                <option value="">All Levels</option>
                <option value="A1">A1 - Breakthrough</option>
                <option value="A2">A2 - Waystage</option>
                <option value="B1">B1 - Threshold</option>
                <option value="B2">B2 - Vantage</option>
                <option value="C1">C1 - Proficiency</option>
                <option value="C2">C2 - Mastery</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Entry Type</label>
              <select id="filter-type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onchange="applyFilters()">
                <option value="">All Types</option>
                <option value="word">Word</option>
                <option value="verb">Verb</option>
                <option value="phrase">Phrase</option>
                <option value="classifier">Classifier</option>
                <option value="particle">Particle</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <select id="filter-tone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onchange="applyFilters()">
                <option value="">All Tones</option>
                <option value="mid">🔵 Mid</option>
                <option value="low">🟢 Low</option>
                <option value="falling">🔴 Falling</option>
                <option value="high">🟠 High</option>
                <option value="rising">🟣 Rising</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select id="filter-archived" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onchange="applyFilters()">
                <option value="false">Active Only</option>
                <option value="true">Archived Only</option>
                <option value="all">All Entries</option>
              </select>
            </div>
          </div>
          
          <div class="mt-4 flex justify-end">
            <button onclick="clearFilters()" class="text-sm text-blue-600 hover:text-blue-800">
              <i class="fas fa-redo mr-1"></i>Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      <!-- Entries List -->
      <div id="entries-list"></div>
      
      <!-- Create/Edit Entry Modal -->
      <div id="entry-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 id="modal-title" class="text-2xl font-bold text-gray-800">Create New Entry</h3>
              <button onclick="closeEntryModal()" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times text-2xl"></i>
              </button>
            </div>
            
            <form id="entry-form" onsubmit="submitEntry(event)">
              <input type="hidden" id="entry-id" value="">
              
              <!-- Thai Script -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Thai Script <span class="text-red-600">*</span>
                </label>
                <input type="text" id="thai-script" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 thai-text text-2xl"
                       placeholder="สวัสดี">
              </div>
              
              <!-- Romanization -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Romanization <span class="text-red-600">*</span>
                </label>
                <input type="text" id="romanization" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                       placeholder="sawasdee">
              </div>
              
              <!-- Row: Tone, Entry Type, CEFR Level -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tone <span class="text-red-600">*</span>
                  </label>
                  <select id="tone" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select tone</option>
                    <option value="mid">🔵 Mid</option>
                    <option value="low">🟢 Low</option>
                    <option value="falling">🔴 Falling</option>
                    <option value="high">🟠 High</option>
                    <option value="rising">🟣 Rising</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Entry Type <span class="text-red-600">*</span>
                  </label>
                  <select id="entry-type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select type</option>
                    <option value="word">Word</option>
                    <option value="verb">Verb</option>
                    <option value="phrase">Phrase</option>
                    <option value="classifier">Classifier</option>
                    <option value="particle">Particle</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    CEFR Level <span class="text-red-600">*</span>
                  </label>
                  <select id="cefr-level" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select level</option>
                    <option value="A1">A1 - Breakthrough</option>
                    <option value="A2">A2 - Waystage</option>
                    <option value="B1">B1 - Threshold</option>
                    <option value="B2">B2 - Vantage</option>
                    <option value="C1">C1 - Proficiency</option>
                    <option value="C2">C2 - Mastery</option>
                  </select>
                </div>
              </div>
              
              <!-- Meaning -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Meaning (English) <span class="text-red-600">*</span>
                </label>
                <input type="text" id="meaning" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                       placeholder="hello, goodbye">
              </div>
              
              <!-- Difficulty -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty (1-5)
                </label>
                <input type="number" id="difficulty" min="1" max="5" value="3"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              </div>
              
              <!-- Classifier -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Classifier (ลักษณนาม)
                </label>
                <input type="text" id="classifier" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 thai-text"
                       placeholder="ตัว, คน, อัน">
              </div>
              
              <!-- Polite Form -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Polite Form
                </label>
                <input type="text" id="polite-form" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 thai-text"
                       placeholder="ครับ/ค่ะ">
              </div>
              
              <!-- Grammar Notes -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Grammar Notes
                </label>
                <textarea id="grammar-notes" rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Usage notes, conjugation patterns, etc."></textarea>
              </div>
              
              <!-- Examples -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Example Sentences (JSON array - optional)
                </label>
                <textarea id="examples" rows="4"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder='[{"thai":"สวัสดีครับ","romanization":"sawasdee krap","english":"Hello (male)"}]'></textarea>
                <p class="text-xs text-gray-500 mt-1">Format: Array of objects with thai, romanization, and english fields</p>
              </div>
              
              <!-- Form Actions -->
              <div class="flex justify-end space-x-3">
                <button type="button" onclick="closeEntryModal()" 
                        class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" 
                        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                  <i class="fas fa-save mr-2"></i><span id="submit-btn-text">Create Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    // Load entries
    await loadEntries();
    
  } catch (error) {
    showError('entries-content', 'Failed to load entries page: ' + error.message);
  }
}

async function loadEntries() {
  try {
    // Build query string with filters
    const params = new URLSearchParams();
    if (currentFilters.cefr_level) params.append('cefr_level', currentFilters.cefr_level);
    if (currentFilters.entry_type) params.append('entry_type', currentFilters.entry_type);
    if (currentFilters.tone) params.append('tone', currentFilters.tone);
    if (currentFilters.archived !== 'all') {
      params.append('archived', currentFilters.archived === 'true' ? 'true' : 'false');
    }
    params.append('limit', '100');
    
    const entries = await apiRequest(`/api/entries?${params.toString()}`);
    currentEntries = entries;
    
    renderEntriesList(entries);
  } catch (error) {
    showError('entries-list', 'Failed to load entries: ' + error.message);
  }
}

function renderEntriesList(entries) {
  const container = document.getElementById('entries-list');
  if (!container) return;
  
  if (entries.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow p-8 text-center">
        <i class="fas fa-inbox text-gray-300 text-6xl mb-4"></i>
        <p class="text-gray-600 text-lg mb-2">No entries found</p>
        <p class="text-gray-500 text-sm">Create your first Thai entry to get started!</p>
      </div>
    `;
    return;
  }
  
  const toneEmojis = {
    'mid': '🔵',
    'low': '🟢',
    'falling': '🔴',
    'high': '🟠',
    'rising': '🟣'
  };
  
  const cefrColors = {
    'A1': 'bg-green-100 text-green-800',
    'A2': 'bg-blue-100 text-blue-800',
    'B1': 'bg-yellow-100 text-yellow-800',
    'B2': 'bg-orange-100 text-orange-800',
    'C1': 'bg-red-100 text-red-800',
    'C2': 'bg-purple-100 text-purple-800'
  };
  
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <p class="text-sm text-gray-600">
          <strong>${entries.length}</strong> ${entries.length === 1 ? 'entry' : 'entries'} found
        </p>
      </div>
      
      <div class="divide-y divide-gray-200">
        ${entries.map(entry => `
          <div class="p-6 hover:bg-gray-50 transition-colors ${entry.archived ? 'opacity-50' : ''}">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-2xl font-bold text-gray-800 thai-text mr-3">${entry.thai_script}</h3>
                  <span class="text-lg text-gray-500">${toneEmojis[entry.tone]}</span>
                  <span class="ml-3 px-2 py-1 text-xs font-semibold rounded ${cefrColors[entry.cefr_level]}">${entry.cefr_level}</span>
                  <span class="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">${entry.entry_type}</span>
                  ${entry.archived ? '<span class="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">Archived</span>' : ''}
                </div>
                <p class="text-gray-600 mb-1"><strong>${entry.romanization}</strong></p>
                <p class="text-gray-700 mb-2">${entry.meaning}</p>
                ${entry.classifier ? `<p class="text-sm text-gray-600"><strong>Classifier:</strong> <span class="thai-text">${entry.classifier}</span></p>` : ''}
                ${entry.grammar_notes ? `<p class="text-sm text-gray-600 mt-2"><strong>Notes:</strong> ${entry.grammar_notes}</p>` : ''}
              </div>
              
              <div class="flex space-x-2 ml-4">
                <button onclick="editEntry('${entry.id}')" 
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="toggleArchive('${entry.id}', ${!entry.archived})" 
                        class="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                        title="${entry.archived ? 'Unarchive' : 'Archive'}">
                  <i class="fas fa-${entry.archived ? 'box-open' : 'archive'}"></i>
                </button>
                <button onclick="deleteEntry('${entry.id}')" 
                        class="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function applyFilters() {
  currentFilters.cefr_level = document.getElementById('filter-cefr').value;
  currentFilters.entry_type = document.getElementById('filter-type').value;
  currentFilters.tone = document.getElementById('filter-tone').value;
  currentFilters.archived = document.getElementById('filter-archived').value;
  loadEntries();
}

function clearFilters() {
  document.getElementById('filter-cefr').value = '';
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-tone').value = '';
  document.getElementById('filter-archived').value = 'false';
  currentFilters = { cefr_level: '', entry_type: '', tone: '', archived: false };
  loadEntries();
}

function showCreateEntryForm() {
  document.getElementById('modal-title').textContent = 'Create New Entry';
  document.getElementById('submit-btn-text').textContent = 'Create Entry';
  document.getElementById('entry-form').reset();
  document.getElementById('entry-id').value = '';
  document.getElementById('entry-modal').classList.remove('hidden');
}

function closeEntryModal() {
  document.getElementById('entry-modal').classList.add('hidden');
}

async function submitEntry(event) {
  event.preventDefault();
  
  const entryId = document.getElementById('entry-id').value;
  const isEdit = !!entryId;
  
  // Parse examples JSON if provided
  let examples = [];
  const examplesText = document.getElementById('examples').value.trim();
  if (examplesText) {
    try {
      examples = JSON.parse(examplesText);
    } catch (e) {
      alert('Invalid JSON format for examples. Please check and try again.');
      return;
    }
  }
  
  const entryData = {
    thai_script: document.getElementById('thai-script').value,
    romanization: document.getElementById('romanization').value,
    tone: document.getElementById('tone').value,
    meaning: document.getElementById('meaning').value,
    entry_type: document.getElementById('entry-type').value,
    cefr_level: document.getElementById('cefr-level').value,
    difficulty: parseInt(document.getElementById('difficulty').value) || 3,
    classifier: document.getElementById('classifier').value || '',
    polite_form: document.getElementById('polite-form').value || '',
    grammar_notes: document.getElementById('grammar-notes').value || '',
    examples: examples
  };
  
  try {
    if (isEdit) {
      await apiRequest(`/api/entries/${entryId}`, {
        method: 'PUT',
        body: JSON.stringify(entryData)
      });
      showSuccess('Entry updated successfully!');
    } else {
      await apiRequest('/api/entries', {
        method: 'POST',
        body: JSON.stringify(entryData)
      });
      showSuccess('Entry created successfully!');
    }
    
    closeEntryModal();
    await loadEntries();
    await loadDashboard(); // Refresh dashboard stats
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function editEntry(entryId) {
  try {
    const entry = await apiRequest(`/api/entries/${entryId}`);
    
    document.getElementById('modal-title').textContent = 'Edit Entry';
    document.getElementById('submit-btn-text').textContent = 'Update Entry';
    document.getElementById('entry-id').value = entry.id;
    document.getElementById('thai-script').value = entry.thai_script;
    document.getElementById('romanization').value = entry.romanization;
    document.getElementById('tone').value = entry.tone;
    document.getElementById('meaning').value = entry.meaning;
    document.getElementById('entry-type').value = entry.entry_type;
    document.getElementById('cefr-level').value = entry.cefr_level;
    document.getElementById('difficulty').value = entry.difficulty || 3;
    document.getElementById('classifier').value = entry.classifier || '';
    document.getElementById('polite-form').value = entry.polite_form || '';
    document.getElementById('grammar-notes').value = entry.grammar_notes || '';
    
    if (entry.examples && entry.examples.length > 0) {
      document.getElementById('examples').value = JSON.stringify(entry.examples, null, 2);
    } else {
      document.getElementById('examples').value = '';
    }
    
    document.getElementById('entry-modal').classList.remove('hidden');
    
  } catch (error) {
    alert('Error loading entry: ' + error.message);
  }
}

async function deleteEntry(entryId) {
  if (!confirm('Are you sure you want to permanently delete this entry?')) {
    return;
  }
  
  try {
    await apiRequest(`/api/entries/${entryId}`, {
      method: 'DELETE'
    });
    showSuccess('Entry deleted successfully!');
    await loadEntries();
    await loadDashboard();
  } catch (error) {
    alert('Error deleting entry: ' + error.message);
  }
}

async function toggleArchive(entryId, archived) {
  try {
    await apiRequest(`/api/entries/${entryId}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ archived })
    });
    showSuccess(archived ? 'Entry archived' : 'Entry unarchived');
    await loadEntries();
    await loadDashboard();
  } catch (error) {
    alert('Error updating entry: ' + error.message);
  }
}

async function loadLearnPage() {
  const container = document.getElementById('learn-content');
  if (container) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Learning mode coming in Prompt 8...</p>';
  }
}

// ============ Learning & Review Functions ============

let learningSession = {
  items: [],
  currentIndex: 0,
  completed: []
};

let reviewSession = {
  items: [],
  currentIndex: 0,
  completed: []
};

async function loadLearnPage() {
  const container = document.getElementById('learn-content');
  if (!container) return;
  
  showLoading('learn-content');
  
  try {
    container.innerHTML = `
      <div class="mb-6">
        <!-- CEFR Level Selector -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-layer-group text-green-600 mr-2"></i>
            Select Learning Level
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button onclick="startLearningSession('A1')" class="p-4 border-2 border-green-300 hover:border-green-500 rounded-lg text-center transition-colors">
              <div class="text-2xl font-bold text-green-600">A1</div>
              <div class="text-sm text-gray-600">Breakthrough</div>
            </button>
            <button onclick="startLearningSession('A2')" class="p-4 border-2 border-blue-300 hover:border-blue-500 rounded-lg text-center transition-colors">
              <div class="text-2xl font-bold text-blue-600">A2</div>
              <div class="text-sm text-gray-600">Waystage</div>
            </button>
            <button onclick="startLearningSession('B1')" class="p-4 border-2 border-yellow-300 hover:border-yellow-500 rounded-lg text-center transition-colors">
              <div class="text-2xl font-bold text-yellow-600">B1</div>
              <div class="text-sm text-gray-600">Threshold</div>
            </button>
            <button onclick="startLearningSession('B2')" class="p-4 border-2 border-orange-300 hover:border-orange-500 rounded-lg text-center transition-colors">
              <div class="text-2xl font-bold text-orange-600">B2</div>
              <div class="text-sm text-gray-600">Vantage</div>
            </button>
            <button onclick="startLearningSession('C1')" class="p-4 border-2 border-red-300 hover:border-red-500 rounded-lg text-center transition-colors">
              <div class="text-2xl font-bold text-red-600">C1</div>
              <div class="text-sm text-gray-600">Proficiency</div>
            </button>
            <button onclick="startLearningSession('C2')" class="p-4 border-2 border-purple-300 hover:border-purple-500 rounded-lg text-center transition-colors">
              <div class="text-2xl font-bold text-purple-600">C2</div>
              <div class="text-sm text-gray-600">Mastery</div>
            </button>
          </div>
        </div>
        
        <!-- Learning Session Container -->
        <div id="learning-session-container"></div>
      </div>
    `;
    
  } catch (error) {
    showError('learn-content', 'Failed to load learning page: ' + error.message);
  }
}

async function startLearningSession(cefrLevel) {
  try {
    showLoading('learning-session-container');
    
    // Fetch new items for this level
    const items = await apiRequest(`/api/learning/new?cefr_level=${cefrLevel}&limit=10`);
    
    if (items.length === 0) {
      document.getElementById('learning-session-container').innerHTML = `
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
          <p class="text-gray-600 mb-4">No new ${cefrLevel} items to learn right now.</p>
          <button onclick="loadLearnPage()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            <i class="fas fa-arrow-left mr-2"></i>Choose Another Level
          </button>
        </div>
      `;
      return;
    }
    
    learningSession = {
      items: items,
      currentIndex: 0,
      completed: []
    };
    
    renderLearningCard();
    
  } catch (error) {
    showError('learning-session-container', 'Failed to start learning session: ' + error.message);
  }
}

function renderLearningCard() {
  const container = document.getElementById('learning-session-container');
  if (!container) return;
  
  const item = learningSession.items[learningSession.currentIndex];
  const progress = learningSession.currentIndex + 1;
  const total = learningSession.items.length;
  
  const toneEmojis = {
    'mid': '🔵',
    'low': '🟢',
    'falling': '🔴',
    'high': '🟠',
    'rising': '🟣'
  };
  
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-8">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-600">Learning Progress</span>
          <span class="text-sm font-medium text-gray-600">${progress} / ${total}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-green-600 h-2 rounded-full transition-all duration-300" style="width: ${(progress / total) * 100}%"></div>
        </div>
      </div>
      
      <!-- Flashcard -->
      <div id="flashcard" class="mb-8 relative" style="min-height: 300px;">
        <div id="card-front" class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 text-center cursor-pointer border-2 border-green-200" onclick="flipCard()">
          <div class="mb-4">
            <span class="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">${item.cefr_level}</span>
            <span class="ml-2 px-3 py-1 bg-gray-600 text-white text-sm font-semibold rounded-full">${item.entry_type}</span>
          </div>
          <div class="text-6xl font-bold text-gray-800 thai-text mb-4">${item.thai_script}</div>
          <div class="text-3xl text-gray-600 mb-2">${item.romanization}</div>
          <div class="text-2xl mb-4">${toneEmojis[item.tone]} ${item.tone} tone</div>
          <p class="text-gray-500 text-sm">Click to see meaning</p>
        </div>
        
        <div id="card-back" class="hidden bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-200" onclick="flipCard()">
          <div class="mb-4">
            <span class="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">${item.cefr_level}</span>
            <span class="ml-2 px-3 py-1 bg-gray-600 text-white text-sm font-semibold rounded-full">${item.entry_type}</span>
          </div>
          <div class="text-4xl font-bold text-gray-800 thai-text mb-2">${item.thai_script}</div>
          <div class="text-2xl text-gray-600 mb-4">${item.romanization}</div>
          <div class="text-3xl font-bold text-blue-800 mb-4">${item.meaning}</div>
          ${item.classifier ? `<p class="text-gray-700 mb-2"><strong>Classifier:</strong> <span class="thai-text text-xl">${item.classifier}</span></p>` : ''}
          ${item.polite_form ? `<p class="text-gray-700 mb-2"><strong>Polite form:</strong> <span class="thai-text text-xl">${item.polite_form}</span></p>` : ''}
          ${item.grammar_notes ? `<p class="text-gray-600 text-sm mt-4"><strong>Notes:</strong> ${item.grammar_notes}</p>` : ''}
          ${item.examples && item.examples.length > 0 ? `
            <div class="mt-4 text-left bg-white rounded-lg p-4">
              <strong class="text-gray-700">Example:</strong>
              <p class="thai-text text-xl text-gray-800 mt-2">${item.examples[0].thai}</p>
              <p class="text-gray-600">${item.examples[0].romanization}</p>
              <p class="text-gray-600">${item.examples[0].english}</p>
            </div>
          ` : ''}
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex justify-center space-x-4">
        <button onclick="markAsLearned()" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center">
          <i class="fas fa-check mr-2"></i>Got It! Next
        </button>
        <button onclick="skipItem()" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold">
          <i class="fas fa-forward mr-2"></i>Skip
        </button>
      </div>
    </div>
  `;
}

function flipCard() {
  const front = document.getElementById('card-front');
  const back = document.getElementById('card-back');
  
  if (front && back) {
    front.classList.toggle('hidden');
    back.classList.toggle('hidden');
  }
}

async function markAsLearned() {
  const item = learningSession.items[learningSession.currentIndex];
  
  try {
    // Start learning this item (create progress record)
    await apiRequest('/api/learning/start', {
      method: 'POST',
      body: JSON.stringify({ entry_id: item.id })
    });
    
    learningSession.completed.push(item.id);
    
    // Move to next item or finish
    learningSession.currentIndex++;
    
    if (learningSession.currentIndex < learningSession.items.length) {
      renderLearningCard();
    } else {
      showLearningComplete();
    }
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function skipItem() {
  learningSession.currentIndex++;
  
  if (learningSession.currentIndex < learningSession.items.length) {
    renderLearningCard();
  } else {
    showLearningComplete();
  }
}

function showLearningComplete() {
  const container = document.getElementById('learning-session-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-8 text-center">
      <i class="fas fa-trophy text-yellow-500 text-6xl mb-4"></i>
      <h3 class="text-3xl font-bold text-gray-800 mb-2">Session Complete!</h3>
      <p class="text-xl text-gray-600 mb-6">You learned ${learningSession.completed.length} new items</p>
      
      <div class="flex justify-center space-x-4">
        <button onclick="loadDashboard(); showPage('dashboard')" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
          <i class="fas fa-chart-line mr-2"></i>View Dashboard
        </button>
        <button onclick="loadLearnPage()" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg">
          <i class="fas fa-redo mr-2"></i>Learn More
        </button>
      </div>
    </div>
  `;
  
  // Refresh dashboard stats
  if (currentPage === 'dashboard') {
    loadDashboard();
  }
}

// ============ Review Session Functions ============

async function loadReviewPage() {
  const container = document.getElementById('review-content');
  if (!container) return;
  
  showLoading('review-content');
  
  try {
    // Get due items count
    const stats = await apiRequest('/api/revision/stats');
    const dueCount = stats.due_for_review || 0;
    
    container.innerHTML = `
      <div class="mb-6">
        <!-- Review Stats Card -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-gray-800 mb-2">
                <i class="fas fa-brain text-orange-600 mr-2"></i>
                Items Due for Review
              </h3>
              <p class="text-gray-600">Reinforce your learning with spaced repetition</p>
            </div>
            <div class="text-center">
              <div class="text-5xl font-bold text-orange-600">${dueCount}</div>
              <div class="text-sm text-gray-600 mt-1">due now</div>
            </div>
          </div>
          
          ${dueCount > 0 ? `
            <button onclick="startReviewSession()" class="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center justify-center">
              <i class="fas fa-play mr-2"></i>Start Review Session
            </button>
          ` : `
            <div class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <i class="fas fa-check-circle text-green-600 text-3xl mb-2"></i>
              <p class="text-green-800 font-semibold">You're all caught up!</p>
              <p class="text-green-700 text-sm mt-1">No reviews due right now. Come back later!</p>
            </div>
          `}
        </div>
        
        <!-- Review Tips -->
        <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6">
          <h4 class="text-lg font-semibold text-orange-800 mb-3">
            <i class="fas fa-lightbulb text-orange-600 mr-2"></i>
            Review Tips
          </h4>
          <ul class="space-y-2 text-orange-800">
            <li class="flex items-start">
              <i class="fas fa-check text-orange-600 mr-2 mt-1"></i>
              <span>Rate honestly - it helps the algorithm optimize your learning</span>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check text-orange-600 mr-2 mt-1"></i>
              <span>0-2 = Failed recall (item resets to beginning)</span>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check text-orange-600 mr-2 mt-1"></i>
              <span>3-5 = Successful recall (increases review interval)</span>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check text-orange-600 mr-2 mt-1"></i>
              <span>5 = Perfect recall (maximum interval increase)</span>
            </li>
          </ul>
        </div>
        
        <!-- Review Session Container -->
        <div id="review-session-container" class="mt-6"></div>
      </div>
    `;
    
  } catch (error) {
    showError('review-content', 'Failed to load review page: ' + error.message);
  }
}

async function startReviewSession() {
  try {
    showLoading('review-session-container');
    
    // Fetch due items
    const items = await apiRequest('/api/revision/due?limit=20');
    
    if (items.length === 0) {
      document.getElementById('review-session-container').innerHTML = `
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">No Reviews Due!</h3>
          <p class="text-gray-600">Come back later for more reviews.</p>
        </div>
      `;
      return;
    }
    
    reviewSession = {
      items: items,
      currentIndex: 0,
      completed: []
    };
    
    renderReviewCard();
    
  } catch (error) {
    showError('review-session-container', 'Failed to start review session: ' + error.message);
  }
}

function renderReviewCard() {
  const container = document.getElementById('review-session-container');
  if (!container) return;
  
  const item = reviewSession.items[reviewSession.currentIndex];
  const progress = reviewSession.currentIndex + 1;
  const total = reviewSession.items.length;
  
  const toneEmojis = {
    'mid': '🔵',
    'low': '🟢',
    'falling': '🔴',
    'high': '🟠',
    'rising': '🟣'
  };
  
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-8">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-600">Review Progress</span>
          <span class="text-sm font-medium text-gray-600">${progress} / ${total}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-orange-600 h-2 rounded-full transition-all duration-300" style="width: ${(progress / total) * 100}%"></div>
        </div>
      </div>
      
      <!-- Question Card -->
      <div id="review-flashcard" class="mb-8">
        <div id="review-front" class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 text-center cursor-pointer border-2 border-orange-200" onclick="flipReviewCard()">
          <div class="mb-4">
            <span class="px-3 py-1 bg-orange-600 text-white text-sm font-semibold rounded-full">${item.cefr_level}</span>
            <span class="ml-2 px-3 py-1 bg-gray-600 text-white text-sm font-semibold rounded-full">${item.entry_type}</span>
          </div>
          <div class="text-6xl font-bold text-gray-800 thai-text mb-4">${item.thai_script}</div>
          <div class="text-3xl text-gray-600">${item.romanization}</div>
          <p class="text-gray-500 text-sm mt-6">Try to recall the meaning, then click to check</p>
        </div>
        
        <div id="review-back" class="hidden bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-200">
          <div class="mb-4">
            <span class="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">${item.cefr_level}</span>
            <span class="ml-2 px-3 py-1 bg-gray-600 text-white text-sm font-semibold rounded-full">${item.entry_type}</span>
          </div>
          <div class="text-4xl font-bold text-gray-800 thai-text mb-2">${item.thai_script}</div>
          <div class="text-2xl text-gray-600 mb-4">${item.romanization}</div>
          <div class="text-3xl font-bold text-blue-800 mb-4">${item.meaning}</div>
          <div class="text-xl mb-4">${toneEmojis[item.tone]} ${item.tone} tone</div>
          ${item.classifier ? `<p class="text-gray-700 mb-2"><strong>Classifier:</strong> <span class="thai-text text-xl">${item.classifier}</span></p>` : ''}
          ${item.grammar_notes ? `<p class="text-gray-600 text-sm mt-4">${item.grammar_notes}</p>` : ''}
          
          <!-- Rating Buttons -->
          <div class="mt-6">
            <p class="text-sm font-semibold text-gray-700 mb-3 text-center">How well did you recall this?</p>
            <div class="grid grid-cols-6 gap-2">
              <button onclick="submitRating(0)" class="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors">
                0
                <div class="text-xs mt-1">Fail</div>
              </button>
              <button onclick="submitRating(1)" class="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors">
                1
                <div class="text-xs mt-1">Hard</div>
              </button>
              <button onclick="submitRating(2)" class="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-colors">
                2
                <div class="text-xs mt-1">Poor</div>
              </button>
              <button onclick="submitRating(3)" class="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold transition-colors">
                3
                <div class="text-xs mt-1">OK</div>
              </button>
              <button onclick="submitRating(4)" class="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors">
                4
                <div class="text-xs mt-1">Good</div>
              </button>
              <button onclick="submitRating(5)" class="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors">
                5
                <div class="text-xs mt-1">Perfect</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function flipReviewCard() {
  const front = document.getElementById('review-front');
  const back = document.getElementById('review-back');
  
  if (front && back) {
    front.classList.toggle('hidden');
    back.classList.toggle('hidden');
  }
}

async function submitRating(quality) {
  const item = reviewSession.items[reviewSession.currentIndex];
  
  try {
    // Submit review rating
    const result = await apiRequest('/api/revision/submit', {
      method: 'POST',
      body: JSON.stringify({
        entry_id: item.id,
        quality: quality
      })
    });
    
    reviewSession.completed.push({
      id: item.id,
      quality: quality,
      next_review: result.next_review
    });
    
    // Move to next item or finish
    reviewSession.currentIndex++;
    
    if (reviewSession.currentIndex < reviewSession.items.length) {
      renderReviewCard();
    } else {
      showReviewComplete();
    }
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function showReviewComplete() {
  const container = document.getElementById('review-session-container');
  if (!container) return;
  
  const avgQuality = reviewSession.completed.reduce((sum, item) => sum + item.quality, 0) / reviewSession.completed.length;
  const passed = reviewSession.completed.filter(item => item.quality >= 3).length;
  const failed = reviewSession.completed.filter(item => item.quality < 3).length;
  
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-8 text-center">
      <i class="fas fa-star text-yellow-500 text-6xl mb-4"></i>
      <h3 class="text-3xl font-bold text-gray-800 mb-4">Review Complete!</h3>
      
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-3xl font-bold text-blue-600">${reviewSession.completed.length}</div>
          <div class="text-sm text-gray-600">Reviewed</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-3xl font-bold text-green-600">${passed}</div>
          <div class="text-sm text-gray-600">Passed</div>
        </div>
        <div class="bg-red-50 rounded-lg p-4">
          <div class="text-3xl font-bold text-red-600">${failed}</div>
          <div class="text-sm text-gray-600">Failed</div>
        </div>
      </div>
      
      <div class="bg-purple-50 rounded-lg p-4 mb-6">
        <div class="text-2xl font-bold text-purple-600">${avgQuality.toFixed(1)}/5</div>
        <div class="text-sm text-gray-600">Average Rating</div>
      </div>
      
      <div class="flex justify-center space-x-4">
        <button onclick="loadDashboard(); showPage('dashboard')" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
          <i class="fas fa-chart-line mr-2"></i>View Dashboard
        </button>
        <button onclick="loadReviewPage()" class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg">
          <i class="fas fa-redo mr-2"></i>Review More
        </button>
      </div>
    </div>
  `;
  
  // Refresh dashboard stats
  if (currentPage === 'dashboard') {
    loadDashboard();
  }
}

async function loadReviewPage() {
  const container = document.getElementById('review-content');
  if (container) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Review mode coming in Prompt 8...</p>';
  }
}

// ============ Mobile Menu Toggle ============

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// ============ Initialize ============

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Thai Learning Manager...');
  
  // Setup navigation
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageName = link.dataset.page;
      showPage(pageName);
      
      // Close mobile menu if open
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    });
  });
  
  // Setup mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  
  // Load initial page
  showPage('dashboard');
});

// ============ AI Generation Functions ============

function showAIGenerationForm() {
  const modal = document.createElement('div');
  modal.id = 'ai-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-robot text-purple-600 mr-2"></i>AI Entry Generator
          </h2>
          <button onclick="closeAIModal()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <!-- Prompt -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              What would you like to generate? <span class="text-red-500">*</span>
            </label>
            <textarea 
              id="ai-prompt" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Thai words for fruits, common verbs for shopping, greetings for tourists..."
              required
            ></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- CEFR Level -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">CEFR Level</label>
              <select id="ai-cefr" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Proficiency</option>
              </select>
            </div>
            
            <!-- Entry Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Entry Type</label>
              <select id="ai-type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="word">Word</option>
                <option value="verb">Verb</option>
                <option value="phrase">Phrase</option>
                <option value="classifier">Classifier</option>
                <option value="particle">Particle</option>
              </select>
            </div>
            
            <!-- Count -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Count</label>
              <input 
                type="number" 
                id="ai-count" 
                min="1" 
                max="10" 
                value="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <!-- Generated Results -->
          <div id="ai-results" class="hidden">
            <div class="border-t pt-4 mt-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">
                <i class="fas fa-check-circle text-green-600 mr-2"></i>Generated Entries
              </h3>
              <div id="ai-entries-list" class="space-y-3"></div>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button 
              onclick="generateAIEntries()" 
              id="ai-generate-btn"
              class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              <i class="fas fa-magic mr-2"></i>Generate with AI
            </button>
            <button 
              onclick="closeAIModal()" 
              class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.getElementById('ai-prompt').focus();
}

async function generateAIEntries() {
  const prompt = document.getElementById('ai-prompt').value.trim();
  const cefr_level = document.getElementById('ai-cefr').value;
  const entry_type = document.getElementById('ai-type').value;
  const count = parseInt(document.getElementById('ai-count').value);
  
  if (!prompt) {
    showError('Please enter a prompt for what you want to generate');
    return;
  }
  
  const btn = document.getElementById('ai-generate-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
  btn.disabled = true;
  
  try {
    const response = await fetch('/api/ai/generate-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, cefr_level, entry_type, count })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate entries');
    }
    
    // Display results
    displayAIResults(data.entries);
    
  } catch (error) {
    console.error('AI Generation error:', error);
    showError('Failed to generate entries: ' + error.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function displayAIResults(entries) {
  const resultsDiv = document.getElementById('ai-results');
  const listDiv = document.getElementById('ai-entries-list');
  
  resultsDiv.classList.remove('hidden');
  listDiv.innerHTML = '';
  
  entries.forEach((item, index) => {
    const entry = item.entry;
    const validation = item.validation;
    
    const entryCard = document.createElement('div');
    entryCard.className = `p-4 border rounded-lg ${validation.valid ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`;
    
    entryCard.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl thai-text">${entry.thai_script}</span>
            <span class="text-gray-600">(${entry.romanization})</span>
            <span class="badge-${entry.tone}">${getToneEmoji(entry.tone)} ${entry.tone}</span>
            <span class="badge-${entry.entry_type}">${entry.entry_type}</span>
            <span class="badge-${entry.cefr_level}">${entry.cefr_level}</span>
          </div>
          <p class="text-gray-700 mb-2"><strong>Meaning:</strong> ${entry.meaning}</p>
          ${entry.grammar_notes ? `<p class="text-sm text-gray-600 mb-2">${entry.grammar_notes}</p>` : ''}
          ${validation.valid ? '' : `<p class="text-red-600 text-sm"><i class="fas fa-exclamation-triangle mr-1"></i>${validation.errors.join(', ')}</p>`}
        </div>
        <button 
          onclick="saveAIEntry(${index})" 
          class="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
          ${!validation.valid ? 'disabled' : ''}
        >
          <i class="fas fa-save mr-1"></i>Save
        </button>
      </div>
    `;
    
    listDiv.appendChild(entryCard);
  });
  
  // Store entries for saving
  window.aiGeneratedEntries = entries;
}

async function saveAIEntry(index) {
  const entries = window.aiGeneratedEntries;
  if (!entries || !entries[index]) return;
  
  const entry = entries[index].entry;
  
  try {
    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save entry');
    }
    
    showSuccess(`Saved: ${entry.thai_script} (${entry.romanization})`);
    
    // Remove from display
    const listDiv = document.getElementById('ai-entries-list');
    listDiv.children[index].remove();
    
    // If all saved, close modal and refresh
    if (listDiv.children.length === 0) {
      closeAIModal();
      loadEntriesPage();
    }
    
  } catch (error) {
    console.error('Save error:', error);
    showError('Failed to save entry: ' + error.message);
  }
}

function closeAIModal() {
  const modal = document.getElementById('ai-modal');
  if (modal) {
    modal.remove();
  }
  window.aiGeneratedEntries = null;
}

function getToneEmoji(tone) {
  const emojis = {
    'mid': '→',
    'low': '↘',
    'falling': '↓',
    'high': '↑',
    'rising': '↗'
  };
  return emojis[tone] || '';
}
