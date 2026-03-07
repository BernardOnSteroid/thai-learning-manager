// ============================================================
// Thai Pronunciation Practice with Web Speech API
// Version: 1.0.0
// ============================================================

// ============ Global State ============
let thaiVoices = [];
let selectedThaiVoice = null;
let thaiSpeechRate = 0.9; // Slightly slower for better Thai pronunciation
let thaiPronunciationStats = {};

// ============ Browser Compatibility Check ============
function checkThaiSpeechSupport() {
    const hasSynthesis = 'speechSynthesis' in window;
    const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    
    return {
        synthesis: hasSynthesis,
        recognition: hasRecognition,
        browserSupported: hasSynthesis
    };
}

// ============ Load Thai Voices ============
function loadThaiVoices() {
    const allVoices = window.speechSynthesis.getVoices();
    
    // Filter Thai voices (th-TH)
    thaiVoices = allVoices.filter(voice => voice.lang.startsWith('th'));
    
    // Auto-select first Thai voice if available
    if (thaiVoices.length > 0 && !selectedThaiVoice) {
        selectedThaiVoice = thaiVoices[0];
    }
    
    console.log('Available Thai voices:', thaiVoices.length);
    console.log('Thai voices:', thaiVoices.map(v => v.name));
    
    return thaiVoices;
}

// ============ Initialize Voices ============
function initializeThaiVoices() {
    loadThaiVoices();
    
    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadThaiVoices;
    }
}

// ============ Load Statistics from localStorage ============
function loadThaiPronunciationStats() {
    try {
        const saved = localStorage.getItem('thai-pronunciation-stats');
        if (saved) {
            thaiPronunciationStats = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading Thai pronunciation stats:', error);
        thaiPronunciationStats = {};
    }
}

// ============ Save Statistics to localStorage ============
function saveThaiPronunciationStats() {
    try {
        localStorage.setItem('thai-pronunciation-stats', JSON.stringify(thaiPronunciationStats));
    } catch (error) {
        console.error('Error saving Thai pronunciation stats:', error);
    }
}

// ============ Main Thai Speech Function ============
function speakThai(text, elementId = null, options = {}) {
    if (!text) {
        console.warn('No text to speak');
        return;
    }
    
    const support = checkThaiSpeechSupport();
    if (!support.synthesis) {
        console.error('Speech synthesis not supported in this browser');
        return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH'; // Thai language
    utterance.rate = options.rate || thaiSpeechRate;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    // Use selected Thai voice if available
    if (selectedThaiVoice) {
        utterance.voice = selectedThaiVoice;
    } else {
        // Try to find any Thai voice
        const voices = window.speechSynthesis.getVoices();
        const thaiVoice = voices.find(v => v.lang.startsWith('th'));
        if (thaiVoice) {
            utterance.voice = thaiVoice;
        }
    }
    
    // Visual feedback for button
    let btn = null;
    if (elementId) {
        btn = document.getElementById(elementId);
        if (btn) {
            // Add speaking class for visual feedback
            btn.classList.add('speaking', 'opacity-50');
            btn.disabled = true;
            
            // Change icon if it exists
            const icon = btn.querySelector('i');
            if (icon && icon.classList.contains('fa-volume-up')) {
                icon.classList.remove('fa-volume-up');
                icon.classList.add('fa-spinner', 'fa-spin');
            }
        }
    }
    
    // Handle speech end
    utterance.onend = () => {
        if (btn) {
            btn.classList.remove('speaking', 'opacity-50');
            btn.disabled = false;
            
            const icon = btn.querySelector('i');
            if (icon && icon.classList.contains('fa-spinner')) {
                icon.classList.remove('fa-spinner', 'fa-spin');
                icon.classList.add('fa-volume-up');
            }
        }
    };
    
    // Handle speech error
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        if (btn) {
            btn.classList.remove('speaking', 'opacity-50');
            btn.disabled = false;
            
            const icon = btn.querySelector('i');
            if (icon && icon.classList.contains('fa-spinner')) {
                icon.classList.remove('fa-spinner', 'fa-spin');
                icon.classList.add('fa-volume-up');
            }
        }
    };
    
    // Speak!
    window.speechSynthesis.speak(utterance);
    
    console.log('Speaking Thai:', text);
}

// ============ Convenience Functions ============

// Speak Thai word/phrase with romanization hint
function speakThaiWithRomanization(thaiText, romanization, elementId = null) {
    // Show romanization as tooltip or notification if available
    if (romanization) {
        console.log('Thai:', thaiText, '| Romanization:', romanization);
    }
    speakThai(thaiText, elementId);
}

// Speak slower for learning
function speakThaiSlowly(text, elementId = null) {
    speakThai(text, elementId, { rate: 0.7 });
}

// Speak at normal speed
function speakThaiNormal(text, elementId = null) {
    speakThai(text, elementId, { rate: 0.9 });
}

// Speak faster
function speakThaiFast(text, elementId = null) {
    speakThai(text, elementId, { rate: 1.2 });
}

// Stop speaking
function stopThaiSpeech() {
    window.speechSynthesis.cancel();
}

// ============ Initialize on Load ============
if (typeof window !== 'undefined') {
    // Initialize voices
    initializeThaiVoices();
    
    // Load stats
    loadThaiPronunciationStats();
    
    // Make functions globally available
    window.speakThai = speakThai;
    window.speakThaiWithRomanization = speakThaiWithRomanization;
    window.speakThaiSlowly = speakThaiSlowly;
    window.speakThaiNormal = speakThaiNormal;
    window.speakThaiFast = speakThaiFast;
    window.stopThaiSpeech = stopThaiSpeech;
    window.checkThaiSpeechSupport = checkThaiSpeechSupport;
    
    console.log('✅ Thai pronunciation system initialized');
    console.log('   Functions: speakThai(), speakThaiSlowly(), speakThaiNormal(), speakThaiFast()');
}
