import { query } from "@/server/db";

export interface MistakeNoteData {
  id: string;
  userId: string;
  skill: "reading" | "listening" | "writing" | "speaking";
  errorTag: string;
  questionPrompt: string;
  studentAnswer: string;
  correctAnswer: string;
  reasoning: string;
  retryStatus: "pending" | "mastered" | "retest_needed";
  sourceAttemptId: string | null;
  questionId: string | null;
  createdAt: string;
}

/**
 * UUID Normalizer: strictly returns null if the input is not a standard UUID string.
 * Prevents PostgreSQL 'invalid input syntax for type uuid: ""' errors.
 */
function toValidUuidOrNull(val?: string | null): string | null {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(trimmed) ? trimmed : null;
}

export const DEV_FIXTURE_MISTAKES: MistakeNoteData[] = [
  {
    id: "m-1",
    userId: "33333333-3333-3333-3333-333333333333",
    skill: "reading",
    errorTag: "keyword trap",
    questionPrompt: "The passage asserts that all coastal cities installed automated flood barriers before 2024.",
    studentAnswer: "TRUE",
    correctAnswer: "FALSE",
    reasoning: "The text stated 'several major ports', not 'all coastal cities'. The universal quantifier 'all' makes the statement False.",
    retryStatus: "pending",
    sourceAttemptId: null,
    questionId: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "m-2",
    userId: "33333333-3333-3333-3333-333333333333",
    skill: "listening",
    errorTag: "singular/plural",
    questionPrompt: "Section 1 Form Completion: Requested vehicle type: [_____]",
    studentAnswer: "minivans",
    correctAnswer: "minivan",
    reasoning: "Audio said: 'We just need a single minivan for the afternoon.' Pluralization exceeded the singular context requirement.",
    retryStatus: "mastered",
    sourceAttemptId: null,
    questionId: null,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "m-3",
    userId: "33333333-3333-3333-3333-333333333333",
    skill: "writing",
    errorTag: "paraphrase miss",
    questionPrompt: "Task 2 Prompt: Discuss the economic ramifications of automated transport networks.",
    studentAnswer: "Transport is becoming automated which has big effects on money and roads.",
    correctAnswer: "The proliferation of autonomous transit systems entails profound financial implications for urban economies.",
    reasoning: "Band 6 vocabulary ('big effects on money') needs to be elevated to academic lexicon ('profound financial implications').",
    retryStatus: "pending",
    sourceAttemptId: null,
    questionId: null,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export async function getStudentMistakes(
  userId: string,
  filter?: { skill?: string; retryStatus?: string }
): Promise<MistakeNoteData[]> {
  try {
    let sql = `
      SELECT 
        m.id,
        m.user_id AS "userId",
        m.skill,
        m.error_tag AS "errorTag",
        COALESCE(m.user_notes, '') AS "questionPrompt",
        COALESCE(m.original_answer, '') AS "studentAnswer",
        COALESCE(m.correct_reasoning, '') AS reasoning,
        m.retry_status AS "retryStatus",
        m.source_attempt AS "sourceAttemptId",
        m.question_id AS "questionId",
        m.created_at AS "createdAt"
      FROM mistake_notes m
      WHERE m.user_id = $1
    `;
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (filter?.skill) {
      sql += ` AND m.skill = $${paramIndex++}`;
      params.push(filter.skill);
    }
    if (filter?.retryStatus) {
      sql += ` AND m.retry_status = $${paramIndex++}`;
      params.push(filter.retryStatus);
    }

    sql += ` ORDER BY m.created_at DESC`;

    const res = await query<MistakeNoteData>(sql, params);
    return res.rows.map((r) => ({
      ...r,
      correctAnswer: "Refer to reasoning breakdown",
    }));
  } catch (error) {
    console.error("[Notebook Service]: Failed to fetch student mistakes:", error);
    throw error;
  }
}

export async function createMistakeNote(
  userId: string,
  data: {
    skill: "reading" | "listening" | "writing" | "speaking";
    errorTag: string;
    questionPrompt: string;
    studentAnswer: string;
    reasoning: string;
    sourceAttemptId?: string | null;
    questionId?: string | null;
  }
): Promise<MistakeNoteData> {
  const safeSourceAttempt = toValidUuidOrNull(data.sourceAttemptId);
  const safeQuestionId = toValidUuidOrNull(data.questionId);

  const res = await query<{ id: string; created_at: string }>(
    `INSERT INTO mistake_notes (
       user_id, skill, error_tag, user_notes, original_answer, correct_reasoning,
       retry_status, source_attempt, question_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
     RETURNING id, created_at`,
    [
      userId,
      data.skill,
      data.errorTag.trim(),
      data.questionPrompt.trim(),
      data.studentAnswer.trim(),
      data.reasoning.trim(),
      safeSourceAttempt,
      safeQuestionId,
    ]
  );

  return {
    id: res.rows[0].id,
    userId,
    skill: data.skill,
    errorTag: data.errorTag.trim(),
    questionPrompt: data.questionPrompt.trim(),
    studentAnswer: data.studentAnswer.trim(),
    correctAnswer: "Refer to reasoning breakdown",
    reasoning: data.reasoning.trim(),
    retryStatus: "pending",
    sourceAttemptId: safeSourceAttempt,
    questionId: safeQuestionId,
    createdAt: res.rows[0].created_at,
  };
}

export async function updateMistakeRetryStatus(
  userId: string,
  noteId: string,
  status?: "pending" | "mastered" | "retest_needed"
): Promise<{ id: string; retryStatus: string }> {
  const safeId = toValidUuidOrNull(noteId);
  const targetStatus = status || "mastered";

  if (!safeId) {
    throw new Error("Invalid mistake note ID format.");
  }

  const res = await query(
    `UPDATE mistake_notes 
     SET retry_status = $1, updated_at = clock_timestamp()
     WHERE id = $2 AND user_id = $3`,
    [targetStatus, safeId, userId]
  );

  if (res.rowCount === 0) {
    throw new Error("Mistake note not found or access denied.");
  }

  return { id: noteId, retryStatus: targetStatus };
}
