// ============================================================
// Thai Tone Visual Indicators - SVG pitch contour generator
// Version: 2.0.0
// ============================================================

/**
 * Generate SVG tone indicator based on Thai tone type
 * Visualizes pitch contours as curves
 * 
 * @param {string} tone - One of: 'mid', 'low', 'falling', 'high', 'rising'
 * @param {string} size - One of: 'small', 'normal', 'large'
 * @returns {string} HTML string with SVG tone indicator
 */
function getToneIndicator(tone, size = 'normal') {
  const sizeClass = size === 'large' ? 'tone-indicator-large' : 
                    size === 'small' ? 'tone-indicator-small' : '';
  
  // Define pitch contours using SVG paths
  // Y-axis: 0 (top) = high pitch, 24 (bottom) = low pitch
  const contours = {
    // Mid tone: Flat line at middle (33 in Chao notation)
    mid: {
      path: 'M 4,12 L 20,12',
      label: 'Mid tone (flat)',
      description: '→ Flat, neutral pitch'
    },
    
    // Low tone: Slight fall from mid-low to low (21 in Chao notation)
    low: {
      path: 'M 4,10 Q 12,12 20,16',
      label: 'Low tone (falling)',
      description: '↘ Starts mid-low, falls gently'
    },
    
    // Falling tone: Sharp fall from high to low (51 in Chao notation)
    falling: {
      path: 'M 4,4 Q 12,8 20,20',
      label: 'Falling tone (sharp drop)',
      description: '↓ Starts high, drops sharply'
    },
    
    // High tone: Rise from mid to high (45 in Chao notation)
    high: {
      path: 'M 4,14 Q 12,8 20,4',
      label: 'High tone (rising)',
      description: '↑ Starts mid, rises to high'
    },
    
    // Rising tone: Rise from low to mid-high (24 in Chao notation)
    rising: {
      path: 'M 4,20 Q 12,12 20,6',
      label: 'Rising tone (climbing)',
      description: '↗ Starts low, rises steadily'
    }
  };
  
  const toneData = contours[tone] || contours.mid;
  
  return `
    <div class="tone-indicator ${tone} ${sizeClass}" 
         data-tone="${toneData.label}" 
         title="${toneData.description}"
         role="img"
         aria-label="${toneData.description}">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <!-- Reference lines (optional, subtle) -->
        <line x1="2" y1="12" x2="22" y2="12" 
              stroke="#e0e0e0" stroke-width="0.5" stroke-dasharray="1,1"/>
        
        <!-- Tone contour path -->
        <path d="${toneData.path}" 
              class="tone-curve" 
              stroke-linecap="round"/>
        
        <!-- Direction indicator (arrow/marker) -->
        ${getToneMarker(tone)}
      </svg>
    </div>
  `;
}

/**
 * Generate direction marker for tone (arrow, dot, etc.)
 */
function getToneMarker(tone) {
  switch(tone) {
    case 'mid':
      // Horizontal arrow pointing right
      return '<polygon points="18,12 21,10 21,14" class="tone-arrow" fill="currentColor"/>';
    
    case 'low':
      // Small downward arrow
      return '<polygon points="20,16 18,14 22,14" class="tone-arrow" fill="currentColor"/>';
    
    case 'falling':
      // Large downward arrow
      return '<polygon points="20,20 18,17 22,17" class="tone-arrow" fill="currentColor"/>';
    
    case 'high':
      // Upward arrow
      return '<polygon points="20,4 18,7 22,7" class="tone-arrow" fill="currentColor"/>';
    
    case 'rising':
      // Diagonal upward arrow
      return '<polygon points="20,6 18,9 22,9" class="tone-arrow" fill="currentColor"/>';
    
    default:
      return '';
  }
}

/**
 * Get tone badge HTML with visual indicator
 * Replaces old color-coded badges
 */
function getToneBadge(tone, toneName = null) {
  if (!toneName) {
    toneName = tone.charAt(0).toUpperCase() + tone.slice(1);
  }
  
  return `
    <div class="tone-badge">
      ${getToneIndicator(tone, 'small')}
      <span>${toneName} tone</span>
    </div>
  `;
}

/**
 * Get tone explanation with visual and text
 * For educational purposes
 */
function getToneExplanation(tone) {
  const explanations = {
    mid: {
      name: 'Mid Tone (สามัญ)',
      chao: '33',
      description: 'Flat, neutral pitch maintained throughout',
      example: 'กา (gaa) = crow',
      tip: 'Keep your voice steady at a comfortable middle pitch'
    },
    low: {
      name: 'Low Tone (เอก)',
      chao: '21',
      description: 'Starts at mid-low pitch and falls gently',
      example: 'ใหม่ (mài) = new',
      tip: 'Start relaxed and let your voice drop slightly'
    },
    falling: {
      name: 'Falling Tone (โท)',
      chao: '51',
      description: 'Starts high and drops sharply',
      example: 'ไม่ (mâi) = no/not',
      tip: 'Start high with emphasis and drop firmly'
    },
    high: {
      name: 'High Tone (ตรี)',
      chao: '45',
      description: 'Starts mid-high and rises',
      example: 'ไหม้ (mái) = burn',
      tip: 'Start high and lift your voice even higher'
    },
    rising: {
      name: 'Rising Tone (จัตวา)',
      chao: '24',
      description: 'Starts low and rises to mid-high',
      example: 'ไหม (mǎi) = silk / question particle',
      tip: 'Start low and smoothly rise like asking a question'
    }
  };
  
  const data = explanations[tone];
  if (!data) return '';
  
  return `
    <div class="tone-explanation">
      ${getToneIndicator(tone, 'large')}
      <div>
        <h4>${data.name}</h4>
        <p><strong>Pitch pattern:</strong> ${data.chao} (Chao notation)</p>
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Example:</strong> ${data.example}</p>
        <p><strong>Tip:</strong> ${data.tip}</p>
      </div>
    </div>
  `;
}

/**
 * Get all 5 Thai tones as a reference chart
 */
function getToneReferenceChart() {
  const tones = ['mid', 'low', 'falling', 'high', 'rising'];
  
  return `
    <div class="tone-reference-chart">
      <h3>Thai Tones Reference</h3>
      <div class="tone-grid">
        ${tones.map(tone => `
          <div class="tone-card">
            ${getToneIndicator(tone, 'large')}
            <div class="tone-card-content">
              ${getToneExplanation(tone)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Make functions globally available
if (typeof window !== 'undefined') {
  window.getToneIndicator = getToneIndicator;
  window.getToneBadge = getToneBadge;
  window.getToneExplanation = getToneExplanation;
  window.getToneReferenceChart = getToneReferenceChart;
  window.getToneMarker = getToneMarker;
  
  console.log('✅ Thai tone visual indicators initialized');
  console.log('   Functions: getToneIndicator(), getToneBadge(), getToneExplanation()');
}
