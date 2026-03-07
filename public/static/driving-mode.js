// ============================================================
// Thai Learning - Driving Mode (Audio Learning Mode)
// Version: 1.0.0
// Hands-free continuous audio learning for Thai vocabulary
// ============================================================

let drivingModeState = {
  isPlaying: false,
  isPaused: false,
  currentIndex: 0,
  items: [],
  settings: {
    speed: 1.0,
    pauseBetweenWords: 2000,    // 2 seconds
    pauseBetweenSections: 1000, // 1 second
    repeatWord: true,
    includeExamples: true,
    autoAdvance: true
  }
};

// ============ Load Settings ============
function loadDrivingModeSettings() {
  const saved = localStorage.getItem('thai-driving-mode-settings');
  if (saved) {
    try {
      drivingModeState.settings = { ...drivingModeState.settings, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load driving mode settings:', e);
    }
  }
}

// ============ Save Settings ============
function saveDrivingModeSettings() {
  localStorage.setItem('thai-driving-mode-settings', JSON.stringify(drivingModeState.settings));
}

// ============ Speak with Delay ============
function speakWithDelay(text, lang = 'th-TH', delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!drivingModeState.isPlaying) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = drivingModeState.settings.speed;
      
      // Find appropriate voice
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(lang.substring(0, 2)));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    }, delay);
  });
}

// ============ Speak Single Word Entry ============
async function speakWordEntry(entry) {
  if (!drivingModeState.isPlaying) return;

  const settings = drivingModeState.settings;

  try {
    // 1. Speak Thai word
    console.log('🔊 Speaking Thai:', entry.thai_script);
    await speakWithDelay(entry.thai_script, 'th-TH', 0);
    await new Promise(r => setTimeout(r, settings.pauseBetweenSections));

    if (!drivingModeState.isPlaying) return;

    // 2. Speak romanization
    console.log('🔊 Speaking romanization:', entry.romanization);
    await speakWithDelay(`Romanization: ${entry.romanization}`, 'en-US', 0);
    await new Promise(r => setTimeout(r, settings.pauseBetweenSections));

    if (!drivingModeState.isPlaying) return;

    // 3. Speak meaning
    console.log('🔊 Speaking meaning:', entry.meaning);
    await speakWithDelay(`Meaning: ${entry.meaning}`, 'en-US', 0);
    await new Promise(r => setTimeout(r, settings.pauseBetweenSections));

    if (!drivingModeState.isPlaying) return;

    // 4. Speak tone information
    if (entry.tone) {
      console.log('🔊 Speaking tone:', entry.tone);
      await speakWithDelay(`${entry.tone} tone`, 'en-US', 0);
      await new Promise(r => setTimeout(r, settings.pauseBetweenSections));
    }

    if (!drivingModeState.isPlaying) return;

    // 5. Speak example if available and enabled
    if (settings.includeExamples && entry.examples && entry.examples.length > 0) {
      const example = entry.examples[0];
      console.log('🔊 Speaking example');
      await speakWithDelay('Example:', 'en-US', 0);
      await new Promise(r => setTimeout(r, 500));
      
      await speakWithDelay(example.thai, 'th-TH', 0);
      await new Promise(r => setTimeout(r, settings.pauseBetweenSections));
      
      await speakWithDelay(example.english, 'en-US', 0);
      await new Promise(r => setTimeout(r, settings.pauseBetweenSections));
    }

    if (!drivingModeState.isPlaying) return;

    // 6. Repeat Thai word if enabled
    if (settings.repeatWord) {
      console.log('🔊 Repeating Thai word');
      await speakWithDelay(entry.thai_script, 'th-TH', 0);
      await new Promise(r => setTimeout(r, settings.pauseBetweenWords));
    }

  } catch (error) {
    console.error('Error speaking entry:', error);
  }
}

// ============ Start Driving Mode Session ============
async function startDrivingMode(items) {
  if (!items || items.length === 0) {
    showToast('No items to play', 'error');
    return;
  }

  drivingModeState.items = items;
  drivingModeState.currentIndex = 0;
  drivingModeState.isPlaying = true;
  drivingModeState.isPaused = false;

  updateDrivingModeUI();

  // Start playback
  await playNextWord();
}

// ============ Play Next Word ============
async function playNextWord() {
  if (!drivingModeState.isPlaying) return;

  if (drivingModeState.currentIndex >= drivingModeState.items.length) {
    // Session complete
    stopDrivingMode();
    showToast('Driving mode session complete!', 'success');
    return;
  }

  const entry = drivingModeState.items[drivingModeState.currentIndex];
  updateDrivingModeUI();

  await speakWordEntry(entry);

  // Auto-advance if still playing and not paused
  if (drivingModeState.isPlaying && !drivingModeState.isPaused && drivingModeState.settings.autoAdvance) {
    drivingModeState.currentIndex++;
    await playNextWord();
  }
}

// ============ Control Functions ============
function pauseDrivingMode() {
  drivingModeState.isPaused = true;
  window.speechSynthesis.cancel();
  updateDrivingModeUI();
  console.log('⏸️ Driving mode paused');
}

function resumeDrivingMode() {
  drivingModeState.isPaused = false;
  updateDrivingModeUI();
  console.log('▶️ Driving mode resumed');
  playNextWord();
}

function skipWord() {
  window.speechSynthesis.cancel();
  drivingModeState.currentIndex++;
  
  if (drivingModeState.currentIndex >= drivingModeState.items.length) {
    stopDrivingMode();
    showToast('Session complete!', 'success');
  } else {
    playNextWord();
  }
}

function previousWord() {
  window.speechSynthesis.cancel();
  drivingModeState.currentIndex = Math.max(0, drivingModeState.currentIndex - 1);
  playNextWord();
}

function stopDrivingMode() {
  drivingModeState.isPlaying = false;
  drivingModeState.isPaused = false;
  window.speechSynthesis.cancel();
  updateDrivingModeUI();
  console.log('⏹️ Driving mode stopped');
}

// ============ Update UI ============
function updateDrivingModeUI() {
  const playBtn = document.getElementById('driving-play-btn');
  const pauseBtn = document.getElementById('driving-pause-btn');
  const stopBtn = document.getElementById('driving-stop-btn');
  const skipBtn = document.getElementById('driving-skip-btn');
  const prevBtn = document.getElementById('driving-prev-btn');
  const progressText = document.getElementById('driving-progress-text');
  const progressBar = document.getElementById('driving-progress-bar');
  const currentWordDisplay = document.getElementById('driving-current-word');

  if (!playBtn) return;

  const { isPlaying, isPaused, currentIndex, items } = drivingModeState;

  // Update buttons
  if (isPlaying && !isPaused) {
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
  } else {
    playBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
  }

  stopBtn.disabled = !isPlaying;
  skipBtn.disabled = !isPlaying;
  prevBtn.disabled = !isPlaying || currentIndex === 0;

  // Update progress
  if (items.length > 0) {
    const progress = Math.round((currentIndex / items.length) * 100);
    if (progressText) {
      progressText.textContent = `${currentIndex} / ${items.length}`;
    }
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // Update current word display
    if (currentWordDisplay && currentIndex < items.length) {
      const entry = items[currentIndex];
      currentWordDisplay.innerHTML = `
        <div class="text-6xl font-bold text-purple-900 thai-text mb-2">${entry.thai_script}</div>
        <div class="text-2xl text-gray-600">${entry.romanization}</div>
        <div class="text-xl text-gray-800 mt-2">${entry.meaning}</div>
      `;
    }
  }
}

// ============ Load Items for Driving Mode ============
async function loadDrivingModeItems(mode) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login first', 'error');
      return [];
    }

    let endpoint = '';
    let items = [];

    switch (mode) {
      case 'recent':
        // Get recently learned items
        endpoint = '/api/user-progress?limit=20&sort=recently_learned';
        break;
      case 'due':
        // Get due reviews
        endpoint = '/api/user-progress/due?limit=20';
        break;
      case 'random':
        // Get random items
        endpoint = '/api/entries/random?limit=20';
        break;
      default:
        endpoint = '/api/entries/random?limit=20';
    }

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    items = await response.json();

    // Ensure we have thai_script, romanization, meaning fields
    if (items.length > 0 && !items[0].thai_script) {
      console.error('Invalid data format:', items[0]);
      showToast('Invalid data format from API', 'error');
      return [];
    }

    return items;

  } catch (error) {
    console.error('Error loading driving mode items:', error);
    showToast('Failed to load items: ' + error.message, 'error');
    return [];
  }
}

// ============ Initialize Driving Mode ============
async function initializeDrivingMode(mode = 'random') {
  loadDrivingModeSettings();
  
  showToast('Loading items...', 'info');
  const items = await loadDrivingModeItems(mode);
  
  if (items.length === 0) {
    showToast('No items available', 'error');
    return;
  }

  showToast(`Loaded ${items.length} items`, 'success');
  await startDrivingMode(items);
}

// ============ Update Settings ============
function updateDrivingModeSpeed(speed) {
  drivingModeState.settings.speed = parseFloat(speed);
  saveDrivingModeSettings();
}

function toggleDrivingModeSetting(setting) {
  drivingModeState.settings[setting] = !drivingModeState.settings[setting];
  saveDrivingModeSettings();
}

// ============ Make Functions Global ============
if (typeof window !== 'undefined') {
  window.startDrivingMode = startDrivingMode;
  window.pauseDrivingMode = pauseDrivingMode;
  window.resumeDrivingMode = resumeDrivingMode;
  window.stopDrivingMode = stopDrivingMode;
  window.skipWord = skipWord;
  window.previousWord = previousWord;
  window.initializeDrivingMode = initializeDrivingMode;
  window.updateDrivingModeSpeed = updateDrivingModeSpeed;
  window.toggleDrivingModeSetting = toggleDrivingModeSetting;
  window.drivingModeState = drivingModeState;

  console.log('✅ Driving Mode initialized');
  console.log('   Functions: initializeDrivingMode(), pauseDrivingMode(), resumeDrivingMode(), stopDrivingMode()');
}
