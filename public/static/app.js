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
  document.getElementById('total-entries').textContent = stats.total_entries || 0;
  document.getElementById('learning-progress').textContent = stats.learning_progress || 0;
  document.getElementById('due-review').textContent = stats.due_for_review || 0;
  
  // Calculate progress percentage
  const progressPercent = stats.total_entries > 0 
    ? Math.round((stats.learning_progress / stats.total_entries) * 100)
    : 0;
  document.getElementById('progress-percent').textContent = progressPercent + '%';
  
  // Update progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = progressPercent + '%';
  }
  
  // Render state breakdown
  if (dashboardStats.byState) {
    document.getElementById('state-new').textContent = dashboardStats.byState.new || 0;
    document.getElementById('state-learning').textContent = dashboardStats.byState.learning || 0;
    document.getElementById('state-mastered').textContent = dashboardStats.byState.mastered || 0;
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
    document.getElementById('focus-level').textContent = data.recommendation.focus_level;
    document.getElementById('focus-message').textContent = data.recommendation.message;
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
  // Loading is replaced by actual content
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

// Placeholder functions for other pages
async function loadEntriesPage() {
  const container = document.getElementById('entries-content');
  if (container) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Entries management coming in Prompt 7...</p>';
  }
}

async function loadLearnPage() {
  const container = document.getElementById('learn-content');
  if (container) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Learning mode coming in Prompt 8...</p>';
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
