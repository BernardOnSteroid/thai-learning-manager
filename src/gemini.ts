/**
 * Thai Learning Manager - Gemini AI Integration
 * Version: 1.0.0-thai
 * 
 * AI-powered features:
 * - Generate Thai vocabulary entries with examples
 * - Auto-romanization from Thai script
 * - Grammar explanation generation
 * - Example sentence generation
 * - Entry quality validation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Valid values for Thai entry types
const ENTRY_TYPES = ['word', 'verb', 'phrase', 'classifier', 'particle', 'custom'] as const;
const TONES = ['mid', 'low', 'falling', 'high', 'rising'] as const;
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type EntryType = typeof ENTRY_TYPES[number];
export type Tone = typeof TONES[number];
export type CEFRLevel = typeof CEFR_LEVELS[number];

export interface GeneratedEntry {
  thai_script: string;
  romanization: string;
  tone: Tone;
  meaning: string;
  entry_type: EntryType;
  cefr_level: CEFRLevel;
  difficulty: number;
  classifier?: string;
  polite_form?: string;
  grammar_notes?: string;
  examples: Array<{
    thai: string;
    romanization: string;
    english: string;
  }>;
}

/**
 * Initialize Gemini AI client
 */
function getGeminiClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate Thai vocabulary entries using Gemini AI
 * @param apiKey - Gemini API key
 * @param topic - Topic or theme for vocabulary (e.g., "food", "travel", "emotions")
 * @param cefrLevel - Target CEFR level (A1-C2)
 * @param count - Number of entries to generate (default: 5)
 */
export async function generateVocabularyEntries(
  apiKey: string,
  topic: string,
  cefrLevel: CEFRLevel,
  count: number = 5
): Promise<GeneratedEntry[]> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a Thai language expert creating vocabulary entries for a language learning app.

Generate exactly ${count} Thai vocabulary entries related to "${topic}" at CEFR level ${cefrLevel}.

IMPORTANT REQUIREMENTS:
1. Each entry MUST include:
   - thai_script: Thai text (ไทย)
   - romanization: Phonetic romanization (e.g., "sawasdee")
   - tone: One of [mid, low, falling, high, rising]
   - meaning: English translation
   - entry_type: One of [word, verb, phrase, classifier, particle]
   - cefr_level: "${cefrLevel}"
   - difficulty: Number 1-5 (${cefrLevel === 'A1' ? '1-2' : cefrLevel === 'A2' ? '2-3' : cefrLevel === 'B1' ? '3' : cefrLevel === 'B2' ? '3-4' : '4-5'} for ${cefrLevel})
   - classifier: Thai classifier (if applicable, empty string otherwise)
   - polite_form: Polite form if needed (e.g., "ครับ/ค่ะ")
   - grammar_notes: Brief grammar explanation
   - examples: Array of 1-2 example sentences, each with:
     * thai: Example in Thai script
     * romanization: Romanization of example
     * english: English translation

2. Ensure DIVERSITY:
   - Mix of words, verbs, phrases
   - Include classifiers for nouns where appropriate
   - Vary tones (mid, low, falling, high, rising)
   
3. ACCURACY:
   - Use correct Thai script (ไทย)
   - Accurate romanization (RTGS or similar)
   - Proper tone marking
   - Culturally appropriate content

4. CEFR LEVEL GUIDELINES:
   - A1: Basic survival Thai (greetings, numbers, essential words)
   - A2: Tourist Thai (ordering food, asking directions, shopping)
   - B1: Daily life (describing experiences, expressing opinions)
   - B2: Fluent conversation (abstract topics, complex sentences)
   - C1: Professional/academic (specialized vocabulary, nuanced expressions)
   - C2: Native-like (idioms, cultural references, sophisticated language)

Return ONLY a valid JSON array with no additional text or markdown. Format:

[
  {
    "thai_script": "สวัสดี",
    "romanization": "sawasdee",
    "tone": "rising",
    "meaning": "hello, goodbye",
    "entry_type": "phrase",
    "cefr_level": "${cefrLevel}",
    "difficulty": 1,
    "classifier": "",
    "polite_form": "ครับ/ค่ะ",
    "grammar_notes": "Universal greeting used any time of day",
    "examples": [
      {
        "thai": "สวัสดีครับ",
        "romanization": "sawasdee krap",
        "english": "Hello (male speaker)"
      }
    ]
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean up response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    // Parse JSON response
    const entries: GeneratedEntry[] = JSON.parse(cleanedText);
    
    // Validate entries
    entries.forEach((entry, index) => {
      if (!entry.thai_script || !entry.romanization || !entry.meaning) {
        throw new Error(`Entry ${index + 1} missing required fields`);
      }
      if (!TONES.includes(entry.tone)) {
        throw new Error(`Entry ${index + 1} has invalid tone: ${entry.tone}`);
      }
      if (!ENTRY_TYPES.includes(entry.entry_type)) {
        throw new Error(`Entry ${index + 1} has invalid entry_type: ${entry.entry_type}`);
      }
      if (!CEFR_LEVELS.includes(entry.cefr_level)) {
        throw new Error(`Entry ${index + 1} has invalid cefr_level: ${entry.cefr_level}`);
      }
    });
    
    return entries;
  } catch (error: any) {
    throw new Error(`Failed to generate vocabulary: ${error.message}`);
  }
}

/**
 * Generate romanization from Thai script using Gemini AI
 */
export async function generateRomanization(
  apiKey: string,
  thaiScript: string
): Promise<{ romanization: string; tone: Tone }> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a Thai language expert. Provide the phonetic romanization and tone for this Thai text.

Thai text: ${thaiScript}

Return ONLY a valid JSON object with this exact format, no additional text:

{
  "romanization": "phonetic romanization (RTGS or similar)",
  "tone": "one of: mid, low, falling, high, rising"
}

Examples:
- สวัสดี → {"romanization": "sawasdee", "tone": "rising"}
- ขอบคุณ → {"romanization": "khop khun", "tone": "low"}
- ไป → {"romanization": "pai", "tone": "mid"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean up response
    let cleanedText = text;
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    const result_data: { romanization: string; tone: string } = JSON.parse(cleanedText);
    
    // Validate tone
    if (!TONES.includes(result_data.tone as Tone)) {
      throw new Error(`Invalid tone: ${result_data.tone}`);
    }
    
    return {
      romanization: result_data.romanization,
      tone: result_data.tone as Tone
    };
  } catch (error: any) {
    throw new Error(`Failed to generate romanization: ${error.message}`);
  }
}

/**
 * Generate example sentences for a Thai word/phrase using Gemini AI
 */
export async function generateExamples(
  apiKey: string,
  thaiScript: string,
  romanization: string,
  meaning: string,
  cefrLevel: CEFRLevel
): Promise<Array<{ thai: string; romanization: string; english: string }>> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a Thai language expert. Generate 2-3 example sentences using this Thai word/phrase.

Word/Phrase: ${thaiScript} (${romanization})
Meaning: ${meaning}
CEFR Level: ${cefrLevel}

Requirements:
- Examples should be at ${cefrLevel} level
- Show natural, common usage
- Include context that helps understanding
- Use appropriate formality

Return ONLY a valid JSON array with this format, no additional text:

[
  {
    "thai": "Example sentence in Thai script",
    "romanization": "Phonetic romanization of the example",
    "english": "English translation"
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean up response
    let cleanedText = text;
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    const examples = JSON.parse(cleanedText);
    return examples;
  } catch (error: any) {
    throw new Error(`Failed to generate examples: ${error.message}`);
  }
}

/**
 * Generate grammar explanation for a Thai word/phrase using Gemini AI
 */
export async function generateGrammarNotes(
  apiKey: string,
  thaiScript: string,
  romanization: string,
  meaning: string,
  entryType: EntryType
): Promise<string> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a Thai language expert. Provide a brief, clear grammar explanation for this Thai ${entryType}.

${entryType.charAt(0).toUpperCase() + entryType.slice(1)}: ${thaiScript} (${romanization})
Meaning: ${meaning}

Requirements:
- Keep it concise (1-2 sentences)
- Focus on key usage rules
- Mention sentence position if relevant
- Note any special patterns or collocations
- Use simple, clear language

Return only the grammar explanation text, no additional formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text;
  } catch (error: any) {
    throw new Error(`Failed to generate grammar notes: ${error.message}`);
  }
}

/**
 * Enhance an existing entry with AI-generated content
 */
export async function enhanceEntry(
  apiKey: string,
  entry: Partial<GeneratedEntry>
): Promise<GeneratedEntry> {
  if (!entry.thai_script) {
    throw new Error('thai_script is required');
  }

  const enhanced: any = { ...entry };

  // Generate romanization and tone if missing
  if (!enhanced.romanization || !enhanced.tone) {
    const { romanization, tone } = await generateRomanization(apiKey, entry.thai_script);
    enhanced.romanization = romanization;
    enhanced.tone = tone;
  }

  // Generate grammar notes if missing
  if (!enhanced.grammar_notes && enhanced.meaning && enhanced.entry_type) {
    enhanced.grammar_notes = await generateGrammarNotes(
      apiKey,
      entry.thai_script,
      enhanced.romanization,
      enhanced.meaning,
      enhanced.entry_type
    );
  }

  // Generate examples if missing or empty
  if ((!enhanced.examples || enhanced.examples.length === 0) && enhanced.meaning && enhanced.cefr_level) {
    enhanced.examples = await generateExamples(
      apiKey,
      entry.thai_script,
      enhanced.romanization,
      enhanced.meaning,
      enhanced.cefr_level
    );
  }

  // Set defaults
  enhanced.difficulty = enhanced.difficulty || 1;
  enhanced.classifier = enhanced.classifier || '';
  enhanced.polite_form = enhanced.polite_form || '';

  return enhanced as GeneratedEntry;
}
