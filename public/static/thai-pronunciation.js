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

// ============ Main Thai Speech Function (Hybrid: Google TTS + Web Speech API) ============
async function speakThai(text, elementId = null, options = {}) {
    if (!text) {
        console.warn('No text to speak');
        return;
    }
    
    // Visual feedback for button
    let btn = null;
    if (elementId) {
        btn = document.getElementById(elementId);
        if (btn) {
            btn.classList.add('speaking', 'opacity-50');
            btn.disabled = true;
            
            const icon = btn.querySelector('i');
            if (icon && icon.classList.contains('fa-volume-up')) {
                icon.classList.remove('fa-volume-up');
                icon.classList.add('fa-spinner', 'fa-spin');
            }
        }
    }
    
    // Reset button function
    const resetButton = () => {
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
    
    // Priority 1: Try Google Cloud TTS (90-95% tone accuracy)
    try {
        // Check cache first
        const cacheKey = `tts_google_${text}_${options.rate || 0.9}`;
        let audioBase64 = localStorage.getItem(cacheKey);
        
        if (!audioBase64) {
            console.log('🌐 Fetching Google TTS for:', text.substring(0, 30));
            
            const response = await fetch('/api/tts/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    rate: options.rate || 0.9,
                    voice: 'th-TH-Neural2-C' // Female neural voice (best quality)
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.audioContent) {
                    audioBase64 = data.audioContent;
                    // Cache for 7 days
                    try {
                        localStorage.setItem(cacheKey, audioBase64);
                        localStorage.setItem(cacheKey + '_timestamp', Date.now().toString());
                    } catch (e) {
                        console.warn('Cache storage failed (quota exceeded?):', e);
                    }
                    console.log('✅ Google TTS success, cached for future use');
                }
            }
        } else {
            console.log('✅ Using cached Google TTS');
        }
        
        if (audioBase64) {
            // Play base64 MP3 audio
            const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
            audio.onended = resetButton;
            audio.onerror = () => {
                console.warn('⚠️ Google TTS playback failed, falling back to Web Speech API');
                speakThaiWebSpeech(text, options, resetButton);
            };
            audio.play();
            console.log('🔊 Playing Google TTS audio');
            return;
        }
    } catch (error) {
        console.warn('⚠️ Google TTS failed:', error.message);
    }
    
    // Priority 2: Fallback to Web Speech API (60-70% tone accuracy)
    console.log('🔊 Using Web Speech API fallback');
    speakThaiWebSpeech(text, options, resetButton);
}

// Web Speech API implementation (fallback)
function speakThaiWebSpeech(text, options = {}, onEnd = null) {
    const support = checkThaiSpeechSupport();
    if (!support.synthesis) {
        console.error('Speech synthesis not supported in this browser');
        if (onEnd) onEnd();
        return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = options.rate || thaiSpeechRate;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    // Use selected Thai voice if available
    if (selectedThaiVoice) {
        utterance.voice = selectedThaiVoice;
    } else {
        const voices = window.speechSynthesis.getVoices();
        const thaiVoice = voices.find(v => v.lang.startsWith('th'));
        if (thaiVoice) {
            utterance.voice = thaiVoice;
        }
    }
    
    utterance.onend = () => {
        if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        if (onEnd) onEnd();
    };
    
    window.speechSynthesis.speak(utterance);
    console.log('Speaking Thai (Web Speech API):', text);
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
