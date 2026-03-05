/**
 * Thai Learning Manager - Gemini AI Integration
 * AI-powered content generation for Thai vocabulary entries
 * Version: 1.0.0-thai
 */

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface GenerateEntryParams {
  prompt: string;
  cefr_level?: string;
  entry_type?: string;
  count?: number;
}

interface EnhanceEntryParams {
  thai_script: string;
  romanization?: string;
  meaning?: string;
}

/**
 * Call Gemini API with prompt
 */
async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as GeminiResponse;
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}

/**
 * Generate new Thai vocabulary entry using AI
 */
export async function generateEntry(params: GenerateEntryParams, apiKey: string) {
  const { prompt, cefr_level = 'A1', entry_type = 'word', count = 1 } = params;
  
  const systemPrompt = `You are a Thai language expert helping to create vocabulary entries for learners.

Generate ${count} Thai vocabulary ${entry_type}(s) based on this request: "${prompt}"

Requirements:
- CEFR Level: ${cefr_level}
- Entry Type: ${entry_type} (word/verb/phrase/classifier/particle)
- Thai Tones: mid (→), low (↘), falling (↓), high (↑), rising (↗)

Return ONLY valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "thai_script": "Thai characters",
    "romanization": "romanized pronunciation",
    "tone": "mid/low/falling/high/rising",
    "meaning": "English meaning",
    "entry_type": "${entry_type}",
    "cefr_level": "${cefr_level}",
    "difficulty": 1-5,
    "classifier": "classifier if noun, empty otherwise",
    "polite_form": "polite ending if applicable",
    "grammar_notes": "brief usage note",
    "examples": [
      {
        "thai": "example sentence in Thai",
        "romanization": "romanized example",
        "english": "English translation"
      }
    ]
  }
]

Generate accurate, natural Thai vocabulary suitable for ${cefr_level} level learners.`;

  const response = await callGeminiAPI(systemPrompt, apiKey);
  
  // Extract JSON from response (handle markdown code blocks)
  let jsonText = response.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '');
  }
  
  try {
    const entries = JSON.parse(jsonText);
    return Array.isArray(entries) ? entries : [entries];
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Enhance existing Thai entry with AI
 */
export async function enhanceEntry(params: EnhanceEntryParams, apiKey: string) {
  const { thai_script, romanization, meaning } = params;
  
  const systemPrompt = `You are a Thai language expert. Enhance this Thai vocabulary entry with additional information.

Current entry:
- Thai: ${thai_script}
${romanization ? `- Romanization: ${romanization}` : ''}
${meaning ? `- Meaning: ${meaning}` : ''}

Please provide:
1. Correct romanization (if missing/incorrect)
2. Tone classification (mid/low/falling/high/rising)
3. Accurate English meaning
4. Entry type (word/verb/phrase/classifier/particle)
5. CEFR level (A1/A2/B1/B2/C1/C2)
6. Difficulty (1-5)
7. Classifier (if noun)
8. Polite form (if applicable)
9. Grammar notes
10. 2-3 example sentences with translations

Return ONLY valid JSON with this structure (no markdown):
{
  "thai_script": "${thai_script}",
  "romanization": "correct romanization",
  "tone": "tone name",
  "meaning": "precise meaning",
  "entry_type": "type",
  "cefr_level": "level",
  "difficulty": 1-5,
  "classifier": "classifier or empty",
  "polite_form": "polite form or empty",
  "grammar_notes": "usage notes",
  "examples": [
    {"thai": "example", "romanization": "rom", "english": "translation"}
  ]
}`;

  const response = await callGeminiAPI(systemPrompt, apiKey);
  
  // Extract JSON from response
  let jsonText = response.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '');
  }
  
  return JSON.parse(jsonText);
}

/**
 * Generate batch of entries by topic
 */
export async function generateBatch(topic: string, cefr_level: string, count: number, apiKey: string) {
  const systemPrompt = `You are a Thai language expert creating vocabulary for learners.

Generate ${count} Thai vocabulary entries about: "${topic}"
CEFR Level: ${cefr_level}

Mix different entry types (words, verbs, phrases, classifiers) appropriately for the topic.

Return ONLY valid JSON array (no markdown, no explanation):
[
  {
    "thai_script": "Thai text",
    "romanization": "pronunciation",
    "tone": "mid/low/falling/high/rising",
    "meaning": "English meaning",
    "entry_type": "word/verb/phrase/classifier/particle",
    "cefr_level": "${cefr_level}",
    "difficulty": 1-5,
    "classifier": "if applicable",
    "polite_form": "if applicable",
    "grammar_notes": "brief note",
    "examples": [
      {"thai": "example", "romanization": "rom", "english": "translation"}
    ]
  }
]

Create diverse, practical vocabulary for ${cefr_level} learners studying "${topic}".`;

  const response = await callGeminiAPI(systemPrompt, apiKey);
  
  // Extract JSON
  let jsonText = response.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '');
  }
  
  const entries = JSON.parse(jsonText);
  return Array.isArray(entries) ? entries : [entries];
}

/**
 * Generate example sentences for existing entry
 */
export async function generateExamples(thai_script: string, meaning: string, count: number, apiKey: string) {
  const systemPrompt = `Create ${count} natural Thai example sentences using the word "${thai_script}" (meaning: ${meaning}).

Return ONLY valid JSON array (no markdown):
[
  {
    "thai": "Thai sentence",
    "romanization": "romanized sentence",
    "english": "English translation"
  }
]

Make examples practical and natural for language learners.`;

  const response = await callGeminiAPI(systemPrompt, apiKey);
  
  let jsonText = response.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '');
  }
  
  return JSON.parse(jsonText);
}

/**
 * Validate AI-generated entry structure
 */
export function validateEntry(entry: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredFields = ['thai_script', 'romanization', 'tone', 'meaning', 'entry_type', 'cefr_level'];
  
  for (const field of requiredFields) {
    if (!entry[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  const validTones = ['mid', 'low', 'falling', 'high', 'rising'];
  if (entry.tone && !validTones.includes(entry.tone)) {
    errors.push(`Invalid tone: ${entry.tone}. Must be one of: ${validTones.join(', ')}`);
  }
  
  const validTypes = ['word', 'verb', 'phrase', 'classifier', 'particle', 'custom'];
  if (entry.entry_type && !validTypes.includes(entry.entry_type)) {
    errors.push(`Invalid entry_type: ${entry.entry_type}`);
  }
  
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (entry.cefr_level && !validLevels.includes(entry.cefr_level)) {
    errors.push(`Invalid cefr_level: ${entry.cefr_level}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
