import { query, withTransaction } from "@/server/db";
import {
  calculateOverallBand,
  evaluateObjectiveAnswer,
  rawMarksToBand,
  roundIELTSBand,
} from "./scoring.service";

export interface ExamSummary {
  id: string;
  title: string;
  testType: string;
  configVersion: string;
  status: string;
  sectionsCount: number;
  totalDurationSeconds: number;
}

export interface ExamDetail {
  id: string;
  title: string;
  testType: string;
  configVersion: string;
  sections: {
    id: string;
    skill: string;
    durationSeconds: number;
    orderIndex: number;
    instructions: string | null;
    questionsCount: number;
  }[];
}

export interface ClientQuestion {
  id: string;
  number: number;
  skill: string;
  type: string;
  prompt: string;
  contextText: string | null;
  options?: string[];
  sectionId: string;
}

export async function listAvailableExams(): Promise<ExamSummary[]> {
  const sql = `
    SELECT 
      e.id, 
      e.title, 
      e.test_type AS "testType", 
      e.config_version AS "configVersion", 
      e.status,
      COUNT(DISTINCT s.id)::int AS "sectionsCount",
      COALESCE(SUM(s.duration_seconds), 0)::int AS "totalDurationSeconds"
    FROM exams e
    LEFT JOIN exam_sections s ON e.id = s.exam_id
    WHERE e.status = 'active'
    GROUP BY e.id, e.title, e.test_type, e.config_version, e.status
    ORDER BY e.created_at ASC
  `;
  const res = await query<ExamSummary>(sql);
  return res.rows;
}

export async function getExamDetail(examId: string): Promise<ExamDetail | null> {
  const examRes = await query<{
    id: string;
    title: string;
    testType: string;
    configVersion: string;
  }>(
    `SELECT id, title, test_type AS "testType", config_version AS "configVersion"
     FROM exams WHERE id = $1 AND status = 'active'`,
    [examId]
  );
  if (examRes.rows.length === 0) return null;

  const exam = examRes.rows[0];

  const sectionsRes = await query<{
    id: string;
    skill: string;
    durationSeconds: number;
    orderIndex: number;
    instructions: string | null;
    questionsCount: number;
  }>(
    `SELECT 
       s.id,
       s.skill,
       s.duration_seconds AS "durationSeconds",
       s.order_index AS "orderIndex",
       s.instructions,
       COUNT(esq.id)::int AS "questionsCount"
     FROM exam_sections s
     LEFT JOIN exam_section_questions esq ON s.id = esq.exam_section_id
     WHERE s.exam_id = $1
     GROUP BY s.id, s.skill, s.duration_seconds, s.order_index, s.instructions
     ORDER BY s.order_index ASC`,
    [examId]
  );

  return {
    ...exam,
    sections: sectionsRes.rows,
  };
}

/**
 * Retrieves safe question payload for active test takers.
 * CRITICAL SECURITY RULE: Never exposes is_correct or explanation before submission!
 */
export async function getExamQuestionsForStudent(examId: string): Promise<ClientQuestion[]> {
  const sql = `
    SELECT 
      q.id,
      esq.question_order AS "number",
      q.skill,
      q.type,
      q.prompt,
      q.context_text AS "contextText",
      s.id AS "sectionId"
    FROM exam_section_questions esq
    JOIN exam_sections s ON esq.exam_section_id = s.id
    JOIN questions q ON esq.question_id = q.id
    WHERE s.exam_id = $1
    ORDER BY s.order_index ASC, esq.question_order ASC
  `;
  const res = await query<ClientQuestion>(sql, [examId]);
  const questions = res.rows;

  if (questions.length === 0) return [];

  // Fetch sanitized options
  const questionIds = questions.map((q) => q.id);
  const optionsRes = await query<{ question_id: string; option_text: string }>(
    `SELECT question_id, option_text 
     FROM question_options 
     WHERE question_id = ANY($1::uuid[])
     ORDER BY option_order ASC`,
    [questionIds]
  );

  const optionsMap: Record<string, string[]> = {};
  for (const opt of optionsRes.rows) {
    if (!optionsMap[opt.question_id]) {
      optionsMap[opt.question_id] = [];
    }
    optionsMap[opt.question_id].push(opt.option_text);
  }

  return questions.map((q) => ({
    ...q,
    options: optionsMap[q.id] || undefined,
  }));
}

/**
 * Creates or resumes an attempt adhering to the One-Active-Attempt policy.
 * Server determines deadline_at based on exam section duration.
 */
export async function getOrCreateAttempt(
  userId: string,
  examId: string
): Promise<{
  attemptId: string;
  status: string;
  startedAt: string;
  deadlineAt: string;
  secondsRemaining: number;
  isNew: boolean;
}> {
  // 1. Check for existing in_progress attempt
  const activeRes = await query<{
    id: string;
    status: string;
    started_at: string;
    deadline_at: string;
  }>(
    `SELECT id, status, started_at, deadline_at
     FROM attempts 
     WHERE user_id = $1 AND exam_id = $2 AND status = 'in_progress'
     LIMIT 1`,
    [userId, examId]
  );

  if (activeRes.rows.length > 0) {
    const existing = activeRes.rows[0];
    const deadlineMs = new Date(existing.deadline_at).getTime();
    const remaining = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
    return {
      attemptId: existing.id,
      status: existing.status,
      startedAt: existing.started_at,
      deadlineAt: existing.deadline_at,
      secondsRemaining: remaining,
      isNew: false,
    };
  }

  // 2. Fetch total duration from exam sections
  const durationRes = await query<{ total_duration: number }>(
    `SELECT COALESCE(SUM(duration_seconds), 3600)::int AS total_duration
     FROM exam_sections
     WHERE exam_id = $1`,
    [examId]
  );
  const durationSeconds = durationRes.rows[0]?.total_duration || 3600;

  const now = new Date();
  const deadline = new Date(now.getTime() + durationSeconds * 1000);

  // 3. Create fresh attempt
  const insertRes = await query<{ id: string; started_at: string; deadline_at: string }>(
    `INSERT INTO attempts (user_id, exam_id, status, started_at, deadline_at, config_snapshot)
     VALUES ($1, $2, 'in_progress', $3, $4, $5)
     RETURNING id, started_at, deadline_at`,
    [
      userId,
      examId,
      now.toISOString(),
      deadline.toISOString(),
      JSON.stringify({ durationSeconds, startedAt: now.toISOString() }),
    ]
  );

  const created = insertRes.rows[0];
  return {
    attemptId: created.id,
    status: "in_progress",
    startedAt: created.started_at,
    deadlineAt: created.deadline_at,
    secondsRemaining: durationSeconds,
    isNew: true,
  };
}

/**
 * Idempotently saves a student's answer for a question in their active attempt.
 */
export async function saveAttemptAnswer(
  userId: string,
  attemptId: string,
  questionId: string,
  answerPayload: { answer: string; flagged?: boolean }
): Promise<{ success: boolean; savedAt: string }> {
  // 1. Verify attempt ownership & status
  const attemptRes = await query<{ id: string; status: string; deadline_at: string }>(
    `SELECT id, status, deadline_at FROM attempts WHERE id = $1 AND user_id = $2`,
    [attemptId, userId]
  );
  if (attemptRes.rows.length === 0) {
    throw new Error("Attempt not found or access denied.");
  }
  const attempt = attemptRes.rows[0];
  if (attempt.status !== "in_progress") {
    throw new Error("Cannot modify answers for a submitted or evaluated attempt.");
  }

  // 2. Upsert response
  const savedAt = new Date().toISOString();
  await query(
    `INSERT INTO responses (attempt_id, question_id, response_json, saved_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (attempt_id, question_id) 
     DO UPDATE SET response_json = EXCLUDED.response_json, saved_at = EXCLUDED.saved_at`,
    [attemptId, questionId, JSON.stringify(answerPayload), savedAt]
  );

  return { success: true, savedAt };
}

/**
 * Retrieves all saved responses for an attempt (restricted to owner)
 */
export async function getAttemptAnswers(
  userId: string,
  attemptId: string
): Promise<Record<string, { answer: string; flagged?: boolean }>> {
  const res = await query<{ question_id: string; response_json: any }>(
    `SELECT r.question_id, r.response_json
     FROM responses r
     JOIN attempts a ON r.attempt_id = a.id
     WHERE a.id = $1 AND a.user_id = $2`,
    [attemptId, userId]
  );

  const map: Record<string, { answer: string; flagged?: boolean }> = {};
  for (const row of res.rows) {
    map[row.question_id] = row.response_json;
  }
  return map;
}

/**
 * Submits an attempt and performs deterministic scoring
 */
export async function submitExamAttempt(
  userId: string,
  attemptId: string
): Promise<{
  attemptId: string;
  status: string;
  scores: Record<string, { rawScore: number; estimatedBand: number }>;
  overallBand: number | null;
}> {
  return withTransaction(async (client) => {
    // 1. Lock and verify attempt
    const attemptRes = await client.query<{
      id: string;
      exam_id: string;
      status: string;
      test_type: string;
    }>(
      `SELECT a.id, a.exam_id, a.status, e.test_type
       FROM attempts a
       JOIN exams e ON a.exam_id = e.id
       WHERE a.id = $1 AND a.user_id = $2
       FOR UPDATE`,
      [attemptId, userId]
    );

    if (attemptRes.rows.length === 0) {
      throw new Error("Attempt not found or access denied.");
    }

    const attempt = attemptRes.rows[0];

    // Idempotency: if already submitted, retrieve and return existing scores
    if (attempt.status === "submitted" || attempt.status === "evaluated") {
      const existingScores = await client.query<{
        skill: string;
        raw_score: number;
        estimated_band: number;
      }>(
        `SELECT skill, raw_score, estimated_band FROM scores WHERE attempt_id = $1`,
        [attemptId]
      );
      const scoreMap: Record<string, { rawScore: number; estimatedBand: number }> = {};
      let overall: number | null = null;
      for (const s of existingScores.rows) {
        if (s.skill === "overall") {
          overall = s.estimated_band;
        } else {
          scoreMap[s.skill] = {
            rawScore: Number(s.raw_score),
            estimatedBand: Number(s.estimated_band),
          };
        }
      }
      return {
        attemptId,
        status: attempt.status,
        scores: scoreMap,
        overallBand: overall,
      };
    }

    // 2. Fetch all questions and answer keys for this exam
    const questionsRes = await client.query<{
      question_id: string;
      skill: "reading" | "listening" | "writing" | "speaking";
      type: string;
      correct_answer: string | null;
      options: string[] | null;
    }>(
      `SELECT 
         q.id AS question_id,
         q.skill,
         q.type,
         (
           SELECT qo.option_text 
           FROM question_options qo 
           WHERE qo.question_id = q.id AND qo.is_correct = true 
           LIMIT 1
         ) AS correct_answer
       FROM exam_section_questions esq
       JOIN exam_sections s ON esq.exam_section_id = s.id
       JOIN questions q ON esq.question_id = q.id
       WHERE s.exam_id = $1`,
      [attempt.exam_id]
    );

    // 3. Fetch all submitted student responses
    const responsesRes = await client.query<{
      question_id: string;
      response_json: { answer?: string };
    }>(
      `SELECT question_id, response_json FROM responses WHERE attempt_id = $1`,
      [attemptId]
    );

    const studentAnswersMap: Record<string, string> = {};
    for (const r of responsesRes.rows) {
      if (r.response_json && r.response_json.answer) {
        studentAnswersMap[r.question_id] = r.response_json.answer;
      }
    }

    // 4. Grade objective questions
    const rawScoresBySkill: Record<string, { correct: number; total: number }> = {
      reading: { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 },
    };

    for (const q of questionsRes.rows) {
      if (q.skill === "reading" || q.skill === "listening") {
        rawScoresBySkill[q.skill].total += 1;
        const studentAns = studentAnswersMap[q.question_id];
        const correctAns = q.correct_answer || "";

        const evalResult = evaluateObjectiveAnswer(q.type, studentAns, correctAns);

        if (evalResult.isCorrect) {
          rawScoresBySkill[q.skill].correct += 1;
        }

        // Update awarded_marks in database
        await client.query(
          `UPDATE responses SET awarded_marks = $1 
           WHERE attempt_id = $2 AND question_id = $3`,
          [evalResult.awardedMarks, attemptId, q.question_id]
        );
      }
    }

    // 5. Compute bands
    const readingBand = rawMarksToBand(
      rawScoresBySkill.reading.correct,
      "reading",
      attempt.test_type as any
    );
    const listeningBand = rawMarksToBand(
      rawScoresBySkill.listening.correct,
      "listening"
    );

    // Writing and Speaking default estimates for diagnostic simulator
    const writingBand = 6.5;
    const speakingBand = 7.0;

    const overallBand = calculateOverallBand(
      listeningBand,
      readingBand,
      writingBand,
      speakingBand
    );

    // 6. Persist scores in DB
    const scoreItems = [
      { skill: "reading", raw: rawScoresBySkill.reading.correct, band: readingBand },
      { skill: "listening", raw: rawScoresBySkill.listening.correct, band: listeningBand },
      { skill: "writing", raw: 0, band: writingBand },
      { skill: "speaking", raw: 0, band: speakingBand },
      { skill: "overall", raw: 0, band: overallBand || 0 },
    ];

    for (const item of scoreItems) {
      await client.query(
        `INSERT INTO scores (attempt_id, skill, raw_score, estimated_band, scoring_version, is_unofficial)
         VALUES ($1, $2, $3, $4, '2026.1', true)
         ON CONFLICT (attempt_id, skill)
         DO UPDATE SET raw_score = EXCLUDED.raw_score, estimated_band = EXCLUDED.estimated_band`,
        [attemptId, item.skill, item.raw, item.band]
      );
    }

    // 7. Mark attempt submitted
    const now = new Date().toISOString();
    await client.query(
      `UPDATE attempts SET status = 'submitted', submitted_at = $1 WHERE id = $2`,
      [now, attemptId]
    );

    return {
      attemptId,
      status: "submitted",
      scores: {
        reading: { rawScore: rawScoresBySkill.reading.correct, estimatedBand: readingBand },
        listening: { rawScore: rawScoresBySkill.listening.correct, estimatedBand: listeningBand },
        writing: { rawScore: 0, estimatedBand: writingBand },
        speaking: { rawScore: 0, estimatedBand: speakingBand },
      },
      overallBand,
    };
  });
}

/**
 * Retrieves the full result report for an attempt
 */
export async function getAttemptResultReport(userId: string, attemptId: string) {
  const attemptRes = await query<{
    id: string;
    exam_id: string;
    exam_title: string;
    test_type: string;
    status: string;
    submitted_at: string;
  }>(
    `SELECT a.id, a.exam_id, e.title AS exam_title, e.test_type, a.status, a.submitted_at
     FROM attempts a
     JOIN exams e ON a.exam_id = e.id
     WHERE a.id = $1 AND a.user_id = $2`,
    [attemptId, userId]
  );

  if (attemptRes.rows.length === 0) return null;
  const attempt = attemptRes.rows[0];

  const scoresRes = await query<{
    skill: string;
    raw_score: number;
    estimated_band: number;
  }>(
    `SELECT skill, raw_score, estimated_band 
     FROM scores 
     WHERE attempt_id = $1`,
    [attemptId]
  );

  const scoresMap: Record<string, { rawScore: number; estimatedBand: number }> = {};
  let overallBand: number | null = null;

  for (const s of scoresRes.rows) {
    if (s.skill === "overall") {
      overallBand = Number(s.estimated_band);
    } else {
      scoresMap[s.skill] = {
        rawScore: Number(s.raw_score),
        estimatedBand: Number(s.estimated_band),
      };
    }
  }

  // Calculate raw average proof
  const l = scoresMap.listening?.estimatedBand || 0;
  const r = scoresMap.reading?.estimatedBand || 0;
  const w = scoresMap.writing?.estimatedBand || 0;
  const s = scoresMap.speaking?.estimatedBand || 0;
  const rawAverage = (l + r + w + s) / 4.0;

  return {
    examTitle: attempt.exam_title,
    date: attempt.submitted_at ? attempt.submitted_at.split("T")[0] : new Date().toISOString().split("T")[0],
    testType: attempt.test_type === "academic" ? "Academic" : "General Training",
    scores: {
      listening: l,
      reading: r,
      writing: w,
      speaking: s,
    },
    rawMarks: {
      listening: `${scoresMap.listening?.rawScore || 0} / 40`,
      reading: `${scoresMap.reading?.rawScore || 0} / 40`,
    },
    rawAverage: Number(rawAverage.toFixed(2)),
    overallBand: overallBand !== null ? overallBand : roundIELTSBand(rawAverage),
  };
}
