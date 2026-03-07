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
  
  // Build filters - we'll use template literal with interpolation
  const archivedFilter = filters?.archived !== undefined ? filters.archived : false;
  
  // Execute based on filters
  let entries;
  
  if (!filters || (!filters.cefr_level && !filters.entry_type && !filters.tone)) {
    // No specific filters - just archived status
    entries = await sql`
      SELECT * FROM entries 
      WHERE archived = ${archivedFilter}
      ORDER BY created_at DESC
      LIMIT ${filters?.limit || 100}
    `;
  } else if (filters.cefr_level && !filters.entry_type && !filters.tone) {
    // CEFR filter only
    entries = await sql`
      SELECT * FROM entries 
      WHERE archived = ${archivedFilter} AND cefr_level = ${filters.cefr_level}
      ORDER BY created_at DESC
      LIMIT ${filters.limit || 100}
    `;
  } else if (filters.entry_type && !filters.cefr_level && !filters.tone) {
    // Type filter only
    entries = await sql`
      SELECT * FROM entries 
      WHERE archived = ${archivedFilter} AND entry_type = ${filters.entry_type}
      ORDER BY created_at DESC
      LIMIT ${filters.limit || 100}
    `;
  } else if (filters.tone && !filters.cefr_level && !filters.entry_type) {
    // Tone filter only
    entries = await sql`
      SELECT * FROM entries 
      WHERE archived = ${archivedFilter} AND tone = ${filters.tone}
      ORDER BY created_at DESC
      LIMIT ${filters.limit || 100}
    `;
  } else if (filters.cefr_level && filters.entry_type && !filters.tone) {
    // CEFR + Type
    entries = await sql`
      SELECT * FROM entries 
      WHERE archived = ${archivedFilter} 
        AND cefr_level = ${filters.cefr_level}
        AND entry_type = ${filters.entry_type}
      ORDER BY created_at DESC
      LIMIT ${filters.limit || 100}
    `;
  } else if (filters.cefr_level && filters.tone && !filters.entry_type) {
    // CEFR + Tone
    entries = await sql`
      SELECT * FROM entries 
      WHERE archived = ${archivedFilter} 
        AND cefr_level = ${filters.cefr_level}
        AND tone = ${filters.tone}
      ORDER BY created_at DESC
      LIMIT ${filters.limit || 100}
    `;
  } else if (filters.entry_type && filters.tone && !filters.cefr_level) {
    // Type + Tone
    entries = await sql`
      SELECT * FROM entries 
      WHERE archived = ${archivedFilter} 
        AND entry_type = ${filters.entry_type}
        AND tone = ${filters.tone}
      ORDER BY created_at DESC
      LIMIT ${filters.limit || 100}
    `;
  } else {
    // All three filters
    entries = await sql`
      SELECT * FROM entries 
      WHERE archived = ${archivedFilter}
        AND cefr_level = ${filters.cefr_level || 'A1'}
        AND entry_type = ${filters.entry_type || 'word'}
        AND tone = ${filters.tone || 'mid'}
      ORDER BY created_at DESC
      LIMIT ${filters.limit || 100}
    `;
  }
  
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

// ============ User Management ============

export interface UserRecord {
  id: string
  email: string
  password_hash: string
  name?: string | null
  preferences?: string | null
  created_at?: string
  last_login?: string | null
  is_active?: number
}

/**
 * Get user by email
 */
export async function getUserByEmail(
  databaseUrl: string,
  email: string
): Promise<UserRecord | null> {
  const sql = getDbClient(databaseUrl)
  const result = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
  return result.length > 0 ? result[0] as UserRecord : null
}

/**
 * Get user by ID
 */
export async function getUserById(
  databaseUrl: string,
  userId: string
): Promise<UserRecord | null> {
  const sql = getDbClient(databaseUrl)
  const result = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`
  return result.length > 0 ? result[0] as UserRecord : null
}

/**
 * Create a new user
 */
export async function createUser(
  databaseUrl: string,
  user: {
    id: string
    email: string
    password_hash: string
    name?: string | null
  }
): Promise<void> {
  const sql = getDbClient(databaseUrl)
  await sql`
    INSERT INTO users (id, email, password_hash, name, preferences, is_active)
    VALUES (${user.id}, ${user.email}, ${user.password_hash}, ${user.name || null}, '{}', 1)
  `
}

/**
 * Update user's last login timestamp
 */
export async function updateUserLastLogin(
  databaseUrl: string,
  userId: string
): Promise<void> {
  const sql = getDbClient(databaseUrl)
  await sql`
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP 
    WHERE id = ${userId}
  `
}

/**
 * Get user's progress for an entry
 */
export async function getUserProgress(
  databaseUrl: string,
  userId: string,
  entryId: string
): Promise<any | null> {
  const sql = getDbClient(databaseUrl)
  const result = await sql`
    SELECT * FROM user_progress 
    WHERE user_id = ${userId} AND entry_id = ${entryId}
    LIMIT 1
  `
  return result.length > 0 ? result[0] : null
}

/**
 * Create or update user progress for an entry
 */
export async function upsertUserProgress(
  databaseUrl: string,
  progress: {
    user_id: string
    entry_id: string
    state?: string
    mastery_level?: number
    last_reviewed?: string
    next_review?: string
    review_count?: number
    easy_count?: number
    hard_count?: number
  }
): Promise<void> {
  const sql = getDbClient(databaseUrl)
  
  await sql`
    INSERT INTO user_progress (
      user_id, entry_id, state, mastery_level, last_reviewed, next_review,
      review_count, easy_count, hard_count
    )
    VALUES (
      ${progress.user_id},
      ${progress.entry_id},
      ${progress.state || 'new'},
      ${progress.mastery_level || 0},
      ${progress.last_reviewed || null},
      ${progress.next_review || null},
      ${progress.review_count || 0},
      ${progress.easy_count || 0},
      ${progress.hard_count || 0}
    )
    ON CONFLICT (user_id, entry_id) DO UPDATE SET
      state = EXCLUDED.state,
      mastery_level = EXCLUDED.mastery_level,
      last_reviewed = EXCLUDED.last_reviewed,
      next_review = EXCLUDED.next_review,
      review_count = EXCLUDED.review_count,
      easy_count = EXCLUDED.easy_count,
      hard_count = EXCLUDED.hard_count,
      updated_at = CURRENT_TIMESTAMP
  `
}

/**
 * Get all progress entries for a user (for dashboard stats)
 */
export async function getUserProgressStats(
  databaseUrl: string,
  userId: string
): Promise<any[]> {
  const sql = getDbClient(databaseUrl)
  const result = await sql`
    SELECT 
      up.*,
      e.thai_script,
      e.meaning,
      e.cefr_level,
      e.entry_type
    FROM user_progress up
    JOIN entries e ON up.entry_id = e.id
    WHERE up.user_id = ${userId}
    ORDER BY up.updated_at DESC
  `
  return result as any[]
}


// ============ Driving Mode Helper Functions ============

/**
 * Get random entries with optional CEFR level filter
 */
export async function getRandomEntries(
  databaseUrl: string,
  options: { limit?: number; cefr_level?: string } = {}
): Promise<ThaiEntry[]> {
  const sql = getDbClient(databaseUrl)
  const limit = options.limit || 20
  
  let result
  if (options.cefr_level) {
    result = await sql`
      SELECT * FROM entries 
      WHERE archived = false AND cefr_level = ${options.cefr_level}
      ORDER BY RANDOM()
      LIMIT ${limit}
    `
  } else {
    result = await sql`
      SELECT * FROM entries 
      WHERE archived = false
      ORDER BY RANDOM()
      LIMIT ${limit}
    `
  }
  
  return result
}

/**
 * Get user learning progress with entries (for driving mode)
 */
export async function getUserLearningProgressWithEntries(
  databaseUrl: string,
  userId: string,
  options: { limit?: number; sort?: string } = {}
): Promise<Array<ThaiEntry & { progress: any }>> {
  const sql = getDbClient(databaseUrl)
  const limit = options.limit || 20
  
  let orderBy = "up.updated_at DESC" // default: recently learned
  if (options.sort === "recently_reviewed") {
    orderBy = "up.last_reviewed DESC NULLS LAST"
  } else if (options.sort === "mastery") {
    orderBy = "up.mastery_level DESC"
  }
  
  // Use string interpolation for ORDER BY since we control the values
  const query = `
    SELECT e.*, up.state, up.mastery_level, up.last_reviewed, up.next_review
    FROM entries e
    INNER JOIN user_progress up ON e.id = up.entry_id
    WHERE up.user_id = '${userId}' AND e.archived = false
    ORDER BY ${orderBy}
    LIMIT ${limit}
  `
  
  const result = await sql(query)
  return result as any[]
}

/**
 * Get due reviews for a user (for driving mode)
 */
export async function getUserDueReviews(
  databaseUrl: string,
  userId: string,
  limit: number = 20
): Promise<Array<ThaiEntry & { progress: any }>> {
  const sql = getDbClient(databaseUrl)
  
  const result = await sql`
    SELECT e.*, up.state, up.mastery_level, up.last_reviewed, up.next_review
    FROM entries e
    INNER JOIN user_progress up ON e.id = up.entry_id
    WHERE up.user_id = ${userId} 
      AND up.next_review <= NOW()
      AND e.archived = false
    ORDER BY up.next_review ASC
    LIMIT ${limit}
  `
  
  return result as any[]
}

