// Thai Learning Manager - Database Helper Functions
// Version: 1.0.0-thai (Fixed for Neon serverless with sql.query)
// Database: Neon PostgreSQL with CEFR levels and Thai tones

import { neon, neonConfig } from '@neondatabase/serverless';

// Enable fullResults mode for .query() method
neonConfig.fullResults = false;

// ============ TypeScript Interfaces ============

export interface ThaiEntry {
  id?: string;
  thai_script: string;
  romanization: string;
  tone: 'mid' | 'low' | 'falling' | 'high' | 'rising';
  meaning: string;
  entry_type: 'word' | 'verb' | 'phrase' | 'classifier' | 'particle' | 'custom';
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  difficulty?: number;
  examples?: Array<{
    thai: string;
    romanization: string;
    english: string;
  }>;
  grammar_notes?: string;
  classifier?: string;
  polite_form?: string;
  created_at?: string;
  archived?: boolean;
}

export interface LearningProgress {
  id?: string;
  entry_id: string;
  srs_level: number;
  ease_factor: number;
  interval: number;
  next_review: Date;
  last_reviewed?: Date | null;
  correct_count: number;
  incorrect_count: number;
  created_at?: string;
}

export interface Settings {
  id?: string;
  user_id: string;
  key: string;
  value: string;
  created_at?: string;
}

// ============ Database Connection ============

export function getDbClient(databaseUrl: string) {
  return neon(databaseUrl);
}

// ============ Entry Management ============

export async function getEntries(
  databaseUrl: string,
  filters?: {
    cefr_level?: string;
    entry_type?: string;
    tone?: string;
    archived?: boolean;
    limit?: number;
  }
): Promise<ThaiEntry[]> {
  const sql = getDbClient(databaseUrl);
  
  // Build query with conditions
  let query = 'SELECT * FROM entries WHERE archived = ' + (filters?.archived !== undefined ? filters.archived : 'false');
  
  if (filters?.cefr_level) {
    query += ` AND cefr_level = '${filters.cefr_level}'`;
  }
  if (filters?.entry_type) {
    query += ` AND entry_type = '${filters.entry_type}'`;
  }
  if (filters?.tone) {
    query += ` AND tone = '${filters.tone}'`;
  }
  
  query += ' ORDER BY created_at DESC';
  
  if (filters?.limit) {
    query += ` LIMIT ${filters.limit}`;
  }
  
  // Execute raw SQL query using neon() function
  const entries = await sql(query);
  return entries as ThaiEntry[];
}

export async function getEntryById(databaseUrl: string, id: string): Promise<ThaiEntry | null> {
  const sql = getDbClient(databaseUrl);
  const result = await sql`SELECT * FROM entries WHERE id = ${id}`;
  return result[0] || null;
}

export async function createEntry(databaseUrl: string, entry: Omit<ThaiEntry, 'id'>): Promise<ThaiEntry> {
  const sql = getDbClient(databaseUrl);
  
  const result = await sql`
    INSERT INTO entries (
      thai_script, romanization, tone, meaning, entry_type, cefr_level,
      difficulty, examples, grammar_notes, classifier, polite_form, archived
    ) VALUES (
      ${entry.thai_script}, ${entry.romanization}, ${entry.tone}, ${entry.meaning},
      ${entry.entry_type}, ${entry.cefr_level}, ${entry.difficulty || 3},
      ${JSON.stringify(entry.examples || [])}, ${entry.grammar_notes || ''},
      ${entry.classifier || ''}, ${entry.polite_form || ''}, ${entry.archived || false}
    )
    RETURNING *
  `;
  
  return result[0];
}

export async function updateEntry(
  databaseUrl: string,
  id: string,
  updates: Partial<ThaiEntry>
): Promise<ThaiEntry> {
  const sql = getDbClient(databaseUrl);
  
  // Build SET clause dynamically
  const setClauses: string[] = [];
  if (updates.thai_script !== undefined) setClauses.push(`thai_script = '${updates.thai_script}'`);
  if (updates.romanization !== undefined) setClauses.push(`romanization = '${updates.romanization}'`);
  if (updates.tone !== undefined) setClauses.push(`tone = '${updates.tone}'`);
  if (updates.meaning !== undefined) setClauses.push(`meaning = '${updates.meaning}'`);
  if (updates.entry_type !== undefined) setClauses.push(`entry_type = '${updates.entry_type}'`);
  if (updates.cefr_level !== undefined) setClauses.push(`cefr_level = '${updates.cefr_level}'`);
  if (updates.difficulty !== undefined) setClauses.push(`difficulty = ${updates.difficulty}`);
  if (updates.examples !== undefined) setClauses.push(`examples = '${JSON.stringify(updates.examples)}'::jsonb`);
  if (updates.grammar_notes !== undefined) setClauses.push(`grammar_notes = '${updates.grammar_notes}'`);
  if (updates.classifier !== undefined) setClauses.push(`classifier = '${updates.classifier}'`);
  if (updates.polite_form !== undefined) setClauses.push(`polite_form = '${updates.polite_form}'`);
  if (updates.archived !== undefined) setClauses.push(`archived = ${updates.archived}`);
  
  const setClause = setClauses.join(', ');
  
  const result = await sql(`UPDATE entries SET ${setClause} WHERE id = '${id}' RETURNING *`);
  return result[0];
}

export async function deleteEntry(databaseUrl: string, id: string): Promise<void> {
  const sql = getDbClient(databaseUrl);
  await sql`DELETE FROM learning_progress WHERE entry_id = ${id}`;
  await sql`DELETE FROM entries WHERE id = ${id}`;
}

export async function archiveEntry(databaseUrl: string, id: string, archived: boolean): Promise<ThaiEntry> {
  const sql = getDbClient(databaseUrl);
  const result = await sql`UPDATE entries SET archived = ${archived} WHERE id = ${id} RETURNING *`;
  return result[0];
}

// ============ Learning Progress Management ============

export async function getLearningProgress(databaseUrl: string, entryId: string): Promise<LearningProgress | null> {
  const sql = getDbClient(databaseUrl);
  const result = await sql`SELECT * FROM learning_progress WHERE entry_id = ${entryId}`;
  return result[0] || null;
}

export async function createLearningProgress(databaseUrl: string, entryId: string): Promise<LearningProgress> {
  const sql = getDbClient(databaseUrl);
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + 1); // Next review in 1 day
  
  const result = await sql`
    INSERT INTO learning_progress (
      entry_id, srs_level, ease_factor, interval, next_review,
      correct_count, incorrect_count
    ) VALUES (
      ${entryId}, 0, 2.5, 1, ${nextReview.toISOString()}, 0, 0
    )
    RETURNING *
  `;
  
  return result[0];
}

export async function updateLearningProgress(
  databaseUrl: string,
  entryId: string,
  updates: Partial<LearningProgress>
): Promise<LearningProgress> {
  const sql = getDbClient(databaseUrl);
  
  const setClauses: string[] = [];
  if (updates.srs_level !== undefined) setClauses.push(`srs_level = ${updates.srs_level}`);
  if (updates.ease_factor !== undefined) setClauses.push(`ease_factor = ${updates.ease_factor}`);
  if (updates.interval !== undefined) setClauses.push(`interval = ${updates.interval}`);
  if (updates.next_review !== undefined) setClauses.push(`next_review = '${updates.next_review.toISOString()}'`);
  if (updates.last_reviewed !== undefined) setClauses.push(`last_reviewed = '${updates.last_reviewed.toISOString()}'`);
  if (updates.correct_count !== undefined) setClauses.push(`correct_count = ${updates.correct_count}`);
  if (updates.incorrect_count !== undefined) setClauses.push(`incorrect_count = ${updates.incorrect_count}`);
  
  const setClause = setClauses.join(', ');
  
  const result = await sql(`UPDATE learning_progress SET ${setClause} WHERE entry_id = '${entryId}' RETURNING *`);
  return result[0];
}

export async function getDueForReview(
  databaseUrl: string,
  limit: number = 20
): Promise<Array<ThaiEntry & { progress: LearningProgress }>> {
  const sql = getDbClient(databaseUrl);
  
  const result = await sql`
    SELECT e.*, lp.*,
      e.id as entry_id, lp.id as progress_id
    FROM entries e
    INNER JOIN learning_progress lp ON e.id = lp.entry_id
    WHERE lp.next_review <= NOW()
      AND e.archived = false
    ORDER BY lp.next_review ASC
    LIMIT ${limit}
  `;
  
  return result as any[];
}

// ============ Statistics Functions ============

export async function getStats(databaseUrl: string) {
  const sql = getDbClient(databaseUrl);
  
  const totalResult = await sql`SELECT COUNT(*) as count FROM entries WHERE archived = false`;
  const progressResult = await sql`SELECT COUNT(*) as count FROM learning_progress`;
  const dueResult = await sql`SELECT COUNT(*) as count FROM learning_progress WHERE next_review <= NOW()`;
  
  return {
    total_entries: totalResult[0]?.count ? parseInt(totalResult[0].count) : 0,
    learning_progress: progressResult[0]?.count ? parseInt(progressResult[0].count) : 0,
    due_for_review: dueResult[0]?.count ? parseInt(dueResult[0].count) : 0
  };
}

export async function getDashboardStats(databaseUrl: string) {
  const sql = getDbClient(databaseUrl);
  
  // Get all entries
  const entries = await sql`SELECT * FROM entries WHERE archived = false`;
  const archivedCount = await sql`SELECT COUNT(*) as count FROM entries WHERE archived = true`;
  
  // Get learning progress
  const progress = await sql`SELECT * FROM learning_progress`;
  
  // Calculate stats
  const byType: Record<string, number> = {};
  const byCefr: Record<string, number> = {};
  const byTone: Record<string, number> = {};
  
  entries.forEach((entry: any) => {
    byType[entry.entry_type] = (byType[entry.entry_type] || 0) + 1;
    byCefr[entry.cefr_level] = (byCefr[entry.cefr_level] || 0) + 1;
    byTone[entry.tone] = (byTone[entry.tone] || 0) + 1;
  });
  
  // Learning states
  const byState = {
    new: entries.length - progress.length,
    learning: progress.filter((p: any) => p.srs_level < 4).length,
    mastered: progress.filter((p: any) => p.srs_level >= 4).length
  };
  
  return {
    totalEntries: entries.length,
    archivedEntries: archivedCount[0]?.count ? parseInt(archivedCount[0].count) : 0,
    byType,
    byCefr,
    byTone,
    byState,
    totalLearning: progress.length
  };
}

export async function getCEFRProgression(databaseUrl: string): Promise<Record<string, any>> {
  const sql = getDbClient(databaseUrl);
  
  const entries = await sql`SELECT cefr_level FROM entries WHERE archived = false`;
  const progress = await sql`
    SELECT e.cefr_level, lp.srs_level
    FROM entries e
    INNER JOIN learning_progress lp ON e.id = lp.entry_id
    WHERE e.archived = false
  `;
  
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const result: Record<string, any> = {};
  
  // Use arrays directly
  const entryRows = entries || [];
  const progressRows = progress || [];
  
  levels.forEach(level => {
    const totalInLevel = entryRows.filter((e: any) => e.cefr_level === level).length;
    const masteredInLevel = progressRows.filter(
      (p: any) => p.cefr_level === level && p.srs_level >= 4
    ).length;
    
    result[level] = {
      total: totalInLevel,
      mastered: masteredInLevel,
      percentage: totalInLevel > 0 ? Math.round((masteredInLevel / totalInLevel) * 100) : 0
    };
  });
  
  return result;
}

// ============ Settings Operations ============

export async function getSettings(
  databaseUrl: string,
  userId: string = 'default_user'
): Promise<Record<string, string>> {
  const sql = getDbClient(databaseUrl);
  const result = await sql`SELECT key, value FROM settings WHERE user_id = ${userId}`;
  
  const settings: Record<string, string> = {};
  result.forEach((row: any) => {
    settings[row.key] = row.value;
  });
  
  return settings;
}

export async function updateSettings(
  databaseUrl: string,
  userId: string = 'default_user',
  key: string,
  value: string
): Promise<void> {
  const sql = getDbClient(databaseUrl);
  
  await sql`
    INSERT INTO settings (user_id, key, value)
    VALUES (${userId}, ${key}, ${value})
    ON CONFLICT (user_id, key)
    DO UPDATE SET value = ${value}
  `;
}
