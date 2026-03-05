// Thai Learning Manager - Database Helper Functions
// Version: 1.0.0-thai
// Database: Neon PostgreSQL with CEFR levels and Thai tones

import { neon } from '@neondatabase/serverless';

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
  next_review?: string;
  last_reviewed?: string;
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

// ============ Entry CRUD Operations ============

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
  
  let query = 'SELECT * FROM entries WHERE 1=1';
  const params: any[] = [];
  let paramCount = 1;

  if (filters?.cefr_level) {
    query += ` AND cefr_level = $${paramCount}`;
    params.push(filters.cefr_level);
    paramCount++;
  }

  if (filters?.entry_type) {
    query += ` AND entry_type = $${paramCount}`;
    params.push(filters.entry_type);
    paramCount++;
  }

  if (filters?.tone) {
    query += ` AND tone = $${paramCount}`;
    params.push(filters.tone);
    paramCount++;
  }

  if (filters?.archived !== undefined) {
    query += ` AND archived = $${paramCount}`;
    params.push(filters.archived);
    paramCount++;
  }

  query += ' ORDER BY created_at DESC';

  if (filters?.limit) {
    query += ` LIMIT $${paramCount}`;
    params.push(filters.limit);
  } else {
    query += ' LIMIT 100';
  }

  const result = await sql.query(query, params);
  return result.rows;
}

export async function getEntryById(
  databaseUrl: string,
  id: string
): Promise<ThaiEntry | null> {
  const sql = getDbClient(databaseUrl);
  const result = await sql.query('SELECT * FROM entries WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createEntry(
  databaseUrl: string,
  entry: ThaiEntry
): Promise<ThaiEntry> {
  const sql = getDbClient(databaseUrl);
  
  const result = await sql.query(
    `INSERT INTO entries (
      thai_script, romanization, tone, meaning, entry_type, cefr_level,
      difficulty, examples, grammar_notes, classifier, polite_form, archived
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      entry.thai_script,
      entry.romanization,
      entry.tone,
      entry.meaning,
      entry.entry_type,
      entry.cefr_level,
      entry.difficulty || null,
      JSON.stringify(entry.examples || []),
      entry.grammar_notes || null,
      entry.classifier || null,
      entry.polite_form || null,
      entry.archived || false
    ]
  );
  
  return result.rows[0];
}

export async function updateEntry(
  databaseUrl: string,
  id: string,
  updates: Partial<ThaiEntry>
): Promise<ThaiEntry> {
  const sql = getDbClient(databaseUrl);
  
  const fields: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  const allowedFields = [
    'thai_script', 'romanization', 'tone', 'meaning', 'entry_type', 'cefr_level',
    'difficulty', 'examples', 'grammar_notes', 'classifier', 'polite_form', 'archived'
  ];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramCount}`);
      params.push(key === 'examples' ? JSON.stringify(value) : value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  params.push(id);
  const query = `UPDATE entries SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
  
  const result = await sql.query(query, params);
  return result.rows[0];
}

export async function deleteEntry(
  databaseUrl: string,
  id: string
): Promise<void> {
  const sql = getDbClient(databaseUrl);
  
  // Delete learning progress first (cascade will handle it, but explicit is better)
  await sql.query('DELETE FROM learning_progress WHERE entry_id = $1', [id]);
  await sql.query('DELETE FROM entries WHERE id = $1', [id]);
}

export async function archiveEntry(
  databaseUrl: string,
  id: string,
  archived: boolean
): Promise<ThaiEntry> {
  const sql = getDbClient(databaseUrl);
  const result = await sql.query(
    'UPDATE entries SET archived = $1 WHERE id = $2 RETURNING *',
    [archived, id]
  );
  return result.rows[0];
}

// ============ Learning Progress Operations ============

export async function getLearningProgress(
  databaseUrl: string,
  entryId: string
): Promise<LearningProgress | null> {
  const sql = getDbClient(databaseUrl);
  const result = await sql.query(
    'SELECT * FROM learning_progress WHERE entry_id = $1',
    [entryId]
  );
  return result.rows[0] || null;
}

export async function createLearningProgress(
  databaseUrl: string,
  entryId: string
): Promise<LearningProgress> {
  const sql = getDbClient(databaseUrl);
  
  const result = await sql.query(
    `INSERT INTO learning_progress (
      entry_id, srs_level, ease_factor, interval, correct_count, incorrect_count
    ) VALUES ($1, 0, 2.5, 0, 0, 0)
    RETURNING *`,
    [entryId]
  );
  
  return result.rows[0];
}

export async function updateLearningProgress(
  databaseUrl: string,
  entryId: string,
  updates: {
    srs_level?: number;
    ease_factor?: number;
    interval?: number;
    next_review?: Date;
    last_reviewed?: Date;
    correct_count?: number;
    incorrect_count?: number;
  }
): Promise<LearningProgress> {
  const sql = getDbClient(databaseUrl);
  
  const fields: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      params.push(value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  params.push(entryId);
  const query = `UPDATE learning_progress SET ${fields.join(', ')} WHERE entry_id = $${paramCount} RETURNING *`;
  
  const result = await sql.query(query, params);
  return result.rows[0];
}

export async function getDueForReview(
  databaseUrl: string,
  limit: number = 20
): Promise<Array<ThaiEntry & { progress: LearningProgress }>> {
  const sql = getDbClient(databaseUrl);
  
  const result = await sql.query(
    `SELECT 
      e.*,
      jsonb_build_object(
        'id', lp.id,
        'srs_level', lp.srs_level,
        'ease_factor', lp.ease_factor,
        'interval', lp.interval,
        'next_review', lp.next_review,
        'last_reviewed', lp.last_reviewed,
        'correct_count', lp.correct_count,
        'incorrect_count', lp.incorrect_count
      ) as progress
    FROM entries e
    INNER JOIN learning_progress lp ON e.id = lp.entry_id
    WHERE e.archived = false
      AND lp.next_review <= NOW()
    ORDER BY lp.next_review ASC, e.difficulty ASC
    LIMIT $1`,
    [limit]
  );
  
  return result.rows;
}

// ============ Statistics Functions ============

export async function getStats(databaseUrl: string) {
  const sql = getDbClient(databaseUrl);
  
  const totalResult = await sql.query('SELECT COUNT(*) as count FROM entries WHERE archived = false');
  const progressResult = await sql.query('SELECT COUNT(*) as count FROM learning_progress');
  const dueResult = await sql.query(
    'SELECT COUNT(*) as count FROM learning_progress WHERE next_review <= NOW()'
  );
  
  return {
    total_entries: parseInt(totalResult.rows[0].count),
    learning_progress: parseInt(progressResult.rows[0].count),
    due_for_review: parseInt(dueResult.rows[0].count)
  };
}

export async function getDashboardStats(databaseUrl: string) {
  const sql = getDbClient(databaseUrl);
  
  // Get all entries
  const entries = await sql.query('SELECT * FROM entries WHERE archived = false');
  const archivedCount = await sql.query('SELECT COUNT(*) as count FROM entries WHERE archived = true');
  
  // Get learning progress
  const progress = await sql.query('SELECT * FROM learning_progress');
  
  // Calculate stats
  const byType: Record<string, number> = {};
  const byCefr: Record<string, number> = {};
  const byTone: Record<string, number> = {};
  
  entries.rows.forEach((entry: any) => {
    byType[entry.entry_type] = (byType[entry.entry_type] || 0) + 1;
    byCefr[entry.cefr_level] = (byCefr[entry.cefr_level] || 0) + 1;
    byTone[entry.tone] = (byTone[entry.tone] || 0) + 1;
  });
  
  // Learning states
  const byState = {
    new: entries.rows.length - progress.rows.length,
    learning: progress.rows.filter((p: any) => p.srs_level < 4).length,
    mastered: progress.rows.filter((p: any) => p.srs_level >= 4).length
  };
  
  return {
    totalEntries: entries.rows.length,
    archivedEntries: parseInt(archivedCount.rows[0].count),
    byType,
    byCefr,
    byTone,
    byState,
    totalLearning: progress.rows.length
  };
}

export async function getCEFRProgression(databaseUrl: string) {
  const sql = getDbClient(databaseUrl);
  
  const entries = await sql.query('SELECT cefr_level FROM entries WHERE archived = false');
  const progress = await sql.query(
    `SELECT e.cefr_level, lp.srs_level
    FROM entries e
    INNER JOIN learning_progress lp ON e.id = lp.entry_id
    WHERE e.archived = false`
  );
  
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const result: Record<string, any> = {};
  
  levels.forEach(level => {
    const totalInLevel = entries.rows.filter((e: any) => e.cefr_level === level).length;
    const masteredInLevel = progress.rows.filter(
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
  const result = await sql.query('SELECT key, value FROM settings WHERE user_id = $1', [userId]);
  
  const settings: Record<string, string> = {};
  result.rows.forEach((row: any) => {
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
  
  await sql.query(
    `INSERT INTO settings (user_id, key, value)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, key)
    DO UPDATE SET value = $3`,
    [userId, key, value]
  );
}
