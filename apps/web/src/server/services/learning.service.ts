import { query } from "@/server/db";

export interface StudyTask {
  id: string;
  day: string;
  skill: "reading" | "listening" | "writing" | "speaking" | "mock";
  title: string;
  durationMinutes: number;
  completed: boolean;
}

export interface MistakeNoteRecord {
  id: string;
  skill: "reading" | "listening" | "writing" | "speaking";
  questionType: string;
  errorTag: string;
  questionPrompt: string;
  studentAnswer: string;
  correctAnswer: string;
  reasoning: string;
  retryStatus: "pending" | "mastered" | "retest_needed";
  createdAt: string;
}

export interface VocabularyProgressItem {
  id: string;
  word: string;
  partOfSpeech: string;
  bandLevel: string;
  meaning: string;
  collocation: string | null;
  exampleSentence: string | null;
  mastery: "learning" | "reviewing" | "mastered";
  intervalDays: number;
  nextReviewAt: string;
}

const DEFAULT_TASKS: StudyTask[] = [
  { id: "t-1", day: "Today", skill: "reading", title: "TFNG Strategy & Passage 2 Diagnostic", durationMinutes: 25, completed: true },
  { id: "t-2", day: "Today", skill: "listening", title: "Section 3 Dialogue Audio & Note Taking", durationMinutes: 20, completed: false },
  { id: "t-3", day: "Tomorrow", skill: "writing", title: "Task 2 Thesis & Topic Sentence Drill", durationMinutes: 30, completed: false },
  { id: "t-4", day: "Saturday", skill: "speaking", title: "Part 2 Cue Card: Describe an innovation", durationMinutes: 15, completed: false },
  { id: "t-5", day: "Sunday", skill: "mock", title: "Full BandBloom Academic Computer Mock 1", durationMinutes: 165, completed: false },
];

/**
 * Retrieves the student's active weekly study plan, initializing one if none exists.
 */
export async function getActiveStudyPlan(userId: string): Promise<StudyTask[]> {
  const res = await query<{ id: string; plan_json: { tasks?: StudyTask[] } }>(
    `SELECT id, plan_json FROM study_plans 
     WHERE user_id = $1 AND is_active = true 
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  if (res.rows.length === 0) {
    // Initialize default study plan
    const today = new Date().toISOString().split("T")[0];
    await query(
      `INSERT INTO study_plans (user_id, week_start, plan_json, is_active)
       VALUES ($1, $2, $3, true)`,
      [userId, today, JSON.stringify({ tasks: DEFAULT_TASKS })]
    );
    return DEFAULT_TASKS;
  }

  return res.rows[0].plan_json.tasks || DEFAULT_TASKS;
}

/**
 * Toggles a task completion state in the active study plan
 */
export async function toggleStudyPlanTask(userId: string, taskId: string): Promise<StudyTask[]> {
  const currentTasks = await getActiveStudyPlan(userId);
  const updatedTasks = currentTasks.map((t) =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  );

  await query(
    `UPDATE study_plans 
     SET plan_json = $1, updated_at = clock_timestamp() 
     WHERE user_id = $2 AND is_active = true`,
    [JSON.stringify({ tasks: updatedTasks }), userId]
  );

  return updatedTasks;
}

/**
 * Retrieves mistake notebook items for authenticated user only
 */
export async function getMistakeNotes(userId: string): Promise<MistakeNoteRecord[]> {
  const sql = `
    SELECT 
      m.id,
      m.skill,
      COALESCE(q.type, 'General Question') AS "questionType",
      m.error_tag AS "errorTag",
      COALESCE(q.prompt, m.user_notes, 'Exam Error Prompt') AS "questionPrompt",
      COALESCE(m.original_answer, '') AS "studentAnswer",
      COALESCE(
        (SELECT qo.option_text FROM question_options qo WHERE qo.question_id = q.id AND qo.is_correct = true LIMIT 1),
        'Official Correct Answer'
      ) AS "correctAnswer",
      COALESCE(m.correct_reasoning, q.explanation, 'Review passage keywords and qualifiers.') AS "reasoning",
      m.retry_status AS "retryStatus",
      m.created_at AS "createdAt"
    FROM mistake_notes m
    LEFT JOIN questions q ON m.question_id = q.id
    WHERE m.user_id = $1
    ORDER BY m.created_at DESC
  `;
  const res = await query<MistakeNoteRecord>(sql, [userId]);
  return res.rows;
}

/**
 * Creates a new mistake note owned by the user
 */
export async function addMistakeNote(
  userId: string,
  payload: {
    skill: "reading" | "listening" | "writing" | "speaking";
    errorTag: string;
    userNotes?: string;
    originalAnswer?: string;
    correctReasoning?: string;
    questionId?: string;
    attemptId?: string;
  }
): Promise<string> {
  const res = await query<{ id: string }>(
    `INSERT INTO mistake_notes 
       (user_id, skill, error_tag, user_notes, original_answer, correct_reasoning, question_id, source_attempt)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      userId,
      payload.skill,
      payload.errorTag,
      payload.userNotes || null,
      payload.originalAnswer || null,
      payload.correctReasoning || null,
      payload.questionId || null,
      payload.attemptId || null,
    ]
  );
  return res.rows[0].id;
}

/**
 * Toggles or updates the retry status of a mistake note (strictly scoped to user)
 */
export async function updateMistakeStatus(
  userId: string,
  noteId: string,
  status: "pending" | "mastered" | "retest_needed"
): Promise<boolean> {
  const res = await query(
    `UPDATE mistake_notes 
     SET retry_status = $1, updated_at = clock_timestamp() 
     WHERE id = $2 AND user_id = $3`,
    [status, noteId, userId]
  );
  return (res.rowCount || 0) > 0;
}

/**
 * Deletes a mistake note (strictly scoped to user)
 */
export async function deleteMistakeNote(userId: string, noteId: string): Promise<boolean> {
  const res = await query(
    `DELETE FROM mistake_notes WHERE id = $1 AND user_id = $2`,
    [noteId, userId]
  );
  return (res.rowCount || 0) > 0;
}

/**
 * Retrieves all vocabulary items with the learner's spaced repetition mastery status
 */
export async function getVocabularyWithProgress(userId: string): Promise<VocabularyProgressItem[]> {
  const sql = `
    SELECT 
      v.id,
      v.word,
      v.part_of_speech AS "partOfSpeech",
      v.band_level AS "bandLevel",
      v.meaning,
      v.collocation,
      v.example_sentence AS "exampleSentence",
      COALESCE(p.mastery, 'learning') AS "mastery",
      COALESCE(p.interval_days, 1) AS "intervalDays",
      COALESCE(p.next_review_at, v.created_at) AS "nextReviewAt"
    FROM vocabulary_items v
    LEFT JOIN user_vocabulary_progress p ON v.id = p.vocabulary_item_id AND p.user_id = $1
    ORDER BY v.word ASC
  `;
  const res = await query<VocabularyProgressItem>(sql, [userId]);
  return res.rows;
}

/**
 * Advances spaced repetition mastery for a word
 */
export async function advanceVocabularyMastery(
  userId: string,
  vocabId: string
): Promise<{ mastery: string; intervalDays: number }> {
  // Cycle learning -> reviewing -> mastered -> learning
  const current = await query<{ mastery: string; interval_days: number }>(
    `SELECT mastery, interval_days FROM user_vocabulary_progress 
     WHERE user_id = $1 AND vocabulary_item_id = $2`,
    [userId, vocabId]
  );

  let nextMastery: "learning" | "reviewing" | "mastered" = "reviewing";
  let nextDays = 3;

  if (current.rows.length > 0) {
    const curM = current.rows[0].mastery;
    if (curM === "learning") {
      nextMastery = "reviewing";
      nextDays = 3;
    } else if (curM === "reviewing") {
      nextMastery = "mastered";
      nextDays = 7;
    } else {
      nextMastery = "learning";
      nextDays = 1;
    }
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextDays);

  await query(
    `INSERT INTO user_vocabulary_progress 
       (user_id, vocabulary_item_id, mastery, interval_days, next_review_at, last_reviewed_at)
     VALUES ($1, $2, $3, $4, $5, clock_timestamp())
     ON CONFLICT (user_id, vocabulary_item_id)
     DO UPDATE SET 
       mastery = EXCLUDED.mastery,
       interval_days = EXCLUDED.interval_days,
       next_review_at = EXCLUDED.next_review_at,
       last_reviewed_at = clock_timestamp(),
       updated_at = clock_timestamp()`,
    [userId, vocabId, nextMastery, nextDays, nextDate.toISOString()]
  );

  return { mastery: nextMastery, intervalDays: nextDays };
}
