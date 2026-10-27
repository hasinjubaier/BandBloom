import { query } from "@/server/db";

export interface VocabularyWord {
  id: string;
  word: string;
  partOfSpeech: string;
  bandLevel: string;
  meaning: string;
  collocation: string | null;
  exampleSentence: string | null;
  mastery: "learning" | "reviewing" | "mastered";
  intervalDays: number;
  lastReviewedAt?: string | null;
  createdAt?: string;
}

export const DEV_FIXTURE_VOCABULARY: VocabularyWord[] = [
  {
    id: "vocab-1",
    word: "Exacerbate",
    partOfSpeech: "verb",
    bandLevel: "Band 8.0+",
    meaning: "To make a problem, bad situation, or negative feeling worse",
    collocation: "exacerbate the environmental crisis / housing shortage",
    exampleSentence:
      "Rapid industrialization without effluent treatment has exacerbated regional water contamination.",
    mastery: "learning",
    intervalDays: 1,
  },
  {
    id: "vocab-2",
    word: "Corroborate",
    partOfSpeech: "verb",
    bandLevel: "Band 7.5+",
    meaning: "To confirm or give support to a statement, theory, or finding",
    collocation: "corroborate empirical findings / testimony",
    exampleSentence:
      "Recent satellite telemetry corroborates the climatologists' initial hypothesis.",
    mastery: "reviewing",
    intervalDays: 3,
  },
  {
    id: "vocab-3",
    word: "Ubiquitous",
    partOfSpeech: "adjective",
    bandLevel: "Band 7.5+",
    meaning: "Present, appearing, or found everywhere",
    collocation: "ubiquitous influence / digital devices",
    exampleSentence:
      "Smartphone usage has become ubiquitous among secondary school learners across urban hubs.",
    mastery: "mastered",
    intervalDays: 7,
  },
  {
    id: "vocab-4",
    word: "Pragmatic",
    partOfSpeech: "adjective",
    bandLevel: "Band 7.0+",
    meaning: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations",
    collocation: "pragmatic approach / policy solution",
    exampleSentence:
      "Urban planners require a pragmatic approach to balance infrastructure expansion with carbon reduction.",
    mastery: "learning",
    intervalDays: 1,
  },
  {
    id: "vocab-5",
    word: "Mitigate",
    partOfSpeech: "verb",
    bandLevel: "Band 7.5+",
    meaning: "Make something bad less severe, serious, or painful",
    collocation: "mitigate climate impacts / adverse risks",
    exampleSentence:
      "Governments must implement strict carbon tariffs to mitigate further ozone depletion.",
    mastery: "reviewing",
    intervalDays: 3,
  },
  {
    id: "vocab-6",
    word: "Eloquent",
    partOfSpeech: "adjective",
    bandLevel: "Band 8.0+",
    meaning: "Fluent or persuasive in speaking or writing",
    collocation: "eloquent discourse / presentation",
    exampleSentence:
      "The speaker delivered an eloquent critique of modern public transportation infrastructure.",
    mastery: "learning",
    intervalDays: 1,
  },
];

export interface StudentVocabularyStats {
  totalSaved: number;
  learningCount: number;
  reviewingCount: number;
  masteredCount: number;
  catalogAvailableCount: number;
}

export async function getStudentVocabularyStats(userId: string): Promise<StudentVocabularyStats> {
  const statsRes = await query<{
    total_saved: number;
    learning_count: number;
    reviewing_count: number;
    mastered_count: number;
  }>(
    `SELECT 
       COUNT(*)::int AS total_saved,
       COUNT(*) FILTER (WHERE mastery = 'learning')::int AS learning_count,
       COUNT(*) FILTER (WHERE mastery = 'reviewing')::int AS reviewing_count,
       COUNT(*) FILTER (WHERE mastery = 'mastered')::int AS mastered_count
     FROM user_vocabulary_progress
     WHERE user_id = $1`,
    [userId]
  );

  const catalogRes = await query<{ catalog_count: number }>(
    `SELECT COUNT(*)::int AS catalog_count FROM vocabulary_items`
  );

  const row = statsRes.rows[0];
  return {
    totalSaved: Number(row?.total_saved || 0),
    learningCount: Number(row?.learning_count || 0),
    reviewingCount: Number(row?.reviewing_count || 0),
    masteredCount: Number(row?.mastered_count || 0),
    catalogAvailableCount: Number(catalogRes.rows[0]?.catalog_count || 0),
  };
}

export async function getStudentSavedVocabulary(
  userId: string,
  filter?: { mastery?: string; bandLevel?: string; query?: string }
): Promise<VocabularyWord[]> {
  let sql = `
    SELECT 
      v.id,
      v.word,
      v.part_of_speech AS "partOfSpeech",
      v.band_level AS "bandLevel",
      v.meaning,
      v.collocation,
      v.example_sentence AS "exampleSentence",
      p.mastery,
      p.interval_days AS "intervalDays",
      p.last_reviewed_at::text AS "lastReviewedAt",
      p.created_at::text AS "createdAt"
    FROM user_vocabulary_progress p
    JOIN vocabulary_items v ON v.id = p.vocabulary_item_id
    WHERE p.user_id = $1
  `;
  const params: unknown[] = [userId];
  let paramIndex = 2;

  if (filter?.mastery) {
    sql += ` AND p.mastery = $${paramIndex++}`;
    params.push(filter.mastery);
  }
  if (filter?.bandLevel) {
    sql += ` AND v.band_level = $${paramIndex++}`;
    params.push(filter.bandLevel);
  }
  if (filter?.query) {
    sql += ` AND (v.word ILIKE $${paramIndex} OR v.meaning ILIKE $${paramIndex} OR v.collocation ILIKE $${paramIndex})`;
    params.push(`%${filter.query}%`);
    paramIndex++;
  }

  sql += ` ORDER BY p.last_reviewed_at DESC NULLS LAST, p.created_at DESC`;

  const res = await query<VocabularyWord>(sql, params);
  return res.rows;
}

export async function getStudentVocabulary(
  userId: string,
  filter?: { mastery?: string; bandLevel?: string; query?: string; savedOnly?: boolean }
): Promise<VocabularyWord[]> {
  if (filter?.savedOnly) {
    return getStudentSavedVocabulary(userId, filter);
  }

  let sql = `
    SELECT 
      v.id,
      v.word,
      v.part_of_speech AS "partOfSpeech",
      v.band_level AS "bandLevel",
      v.meaning,
      v.collocation,
      v.example_sentence AS "exampleSentence",
      COALESCE(p.mastery, 'learning') AS mastery,
      COALESCE(p.interval_days, 1) AS "intervalDays",
      p.last_reviewed_at::text AS "lastReviewedAt",
      p.created_at::text AS "createdAt"
    FROM vocabulary_items v
    LEFT JOIN user_vocabulary_progress p 
      ON v.id = p.vocabulary_item_id AND p.user_id = $1
    WHERE 1=1
  `;
  const params: unknown[] = [userId];
  let paramIndex = 2;

  if (filter?.mastery) {
    sql += ` AND COALESCE(p.mastery, 'learning') = $${paramIndex++}`;
    params.push(filter.mastery);
  }
  if (filter?.bandLevel) {
    sql += ` AND v.band_level = $${paramIndex++}`;
    params.push(filter.bandLevel);
  }
  if (filter?.query) {
    sql += ` AND (v.word ILIKE $${paramIndex} OR v.meaning ILIKE $${paramIndex} OR v.collocation ILIKE $${paramIndex})`;
    params.push(`%${filter.query}%`);
    paramIndex++;
  }

  sql += ` ORDER BY v.created_at ASC`;

  const res = await query<VocabularyWord>(sql, params);
  return res.rows;
}

export async function toggleVocabularyMastery(
  userId: string,
  vocabId: string,
  newMastery?: "learning" | "reviewing" | "mastered"
): Promise<{ mastery: string; intervalDays: number }> {
  const nextMasteryOrder: Record<string, { next: "learning" | "reviewing" | "mastered"; interval: number }> = {
    learning: { next: "reviewing", interval: 3 },
    reviewing: { next: "mastered", interval: 7 },
    mastered: { next: "learning", interval: 1 },
  };

  const existing = await query<{ mastery: string }>(
    `SELECT mastery FROM user_vocabulary_progress 
     WHERE user_id = $1 AND vocabulary_item_id = $2`,
    [userId, vocabId]
  );

  const currentMastery = existing.rows[0]?.mastery || "learning";
  const target = newMastery || nextMasteryOrder[currentMastery].next;
  const interval = target === "mastered" ? 7 : target === "reviewing" ? 3 : 1;

  await query(
    `INSERT INTO user_vocabulary_progress (user_id, vocabulary_item_id, mastery, interval_days, last_reviewed_at)
     VALUES ($1, $2, $3, $4, clock_timestamp())
     ON CONFLICT (user_id, vocabulary_item_id)
     DO UPDATE SET mastery = EXCLUDED.mastery, interval_days = EXCLUDED.interval_days, last_reviewed_at = clock_timestamp()`,
    [userId, vocabId, target, interval]
  );

  return { mastery: target, intervalDays: interval };
}

export async function addCustomVocabulary(
  userId: string,
  wordData: {
    word: string;
    partOfSpeech: string;
    bandLevel: string;
    meaning: string;
    collocation?: string;
    exampleSentence?: string;
  }
): Promise<VocabularyWord> {
  const insertRes = await query<{ id: string }>(
    `INSERT INTO vocabulary_items (word, part_of_speech, band_level, meaning, collocation, example_sentence)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (word) DO UPDATE SET meaning = EXCLUDED.meaning
     RETURNING id`,
    [
      wordData.word.trim(),
      wordData.partOfSpeech.trim(),
      wordData.bandLevel.trim(),
      wordData.meaning.trim(),
      wordData.collocation?.trim() || null,
      wordData.exampleSentence?.trim() || null,
    ]
  );

  const vocabId = insertRes.rows[0].id;

  await query(
    `INSERT INTO user_vocabulary_progress (user_id, vocabulary_item_id, mastery, interval_days)
     VALUES ($1, $2, 'learning', 1)
     ON CONFLICT (user_id, vocabulary_item_id) DO NOTHING`,
    [userId, vocabId]
  );

  return {
    id: vocabId,
    word: wordData.word.trim(),
    partOfSpeech: wordData.partOfSpeech.trim(),
    bandLevel: wordData.bandLevel.trim(),
    meaning: wordData.meaning.trim(),
    collocation: wordData.collocation?.trim() || null,
    exampleSentence: wordData.exampleSentence?.trim() || null,
    mastery: "learning",
    intervalDays: 1,
  };
}
