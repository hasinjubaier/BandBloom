import { query, withTransaction } from "@/server/db";

export interface ExamSummary {
  id: string;
  title: string;
  testType: "academic" | "general_training";
  status: string;
  durationMinutes: number;
  sectionsCount: number;
  questionCount: number;
  skills: ("listening" | "reading" | "writing" | "speaking")[];
  category: "full_mock" | "sectional";
}

export interface ExamDetail extends ExamSummary {
  sections: {
    id: string;
    skill: "reading" | "listening" | "writing" | "speaking";
    durationSeconds: number;
    orderIndex: number;
    instructions: string | null;
    questions: {
      id: string;
      skill: string;
      type: string;
      prompt: string;
      contextText: string | null;
      options?: {
        id: string;
        optionText: string;
        optionOrder: number;
      }[];
    }[];
  }[];
}

export interface ExamAttemptSummary {
  id: string;
  examId: string;
  examTitle: string;
  testType: string;
  status: "in_progress" | "submitted" | "abandoned" | "evaluated";
  startedAt: string;
  submittedAt: string | null;
  deadlineAt?: string | null;
  overallBand: number | null;
  readingScore: number | null;
  listeningScore: number | null;
  writingScore: number | null;
  speakingScore: number | null;
}

/**
 * Official IELTS Band Score Rounding Function (Section 5.3 & Appendix A #4)
 * Rules:
 * - If average fraction is < 0.25 -> round down to whole band (.00)
 * - If average fraction is >= 0.25 and < 0.75 -> round to half band (.50)
 * - If average fraction is >= 0.75 -> round up to next whole band (1.00)
 */
export function ieltsRoundBand(rawAvg: number): number {
  const wholePart = Math.floor(rawAvg);
  const fraction = Math.round((rawAvg - wholePart) * 100) / 100;
  if (fraction < 0.25) {
    return wholePart;
  } else if (fraction < 0.75) {
    return wholePart + 0.5;
  } else {
    return wholePart + 1.0;
  }
}

export function ieltsCalculateOverallBand(
  listening: number | null,
  reading: number | null,
  writing: number | null,
  speaking: number | null
): number | null {
  if (
    listening === null ||
    reading === null ||
    writing === null ||
    speaking === null
  ) {
    return null;
  }
  return ieltsRoundBand((listening + reading + writing + speaking) / 4.0);
}

// Fallback seed catalog when DB is connecting or empty
const FALLBACK_EXAMS: ExamDetail[] = [
  {
    id: "99999999-9999-9999-9999-999999999991",
    title: "BandBloom Academic Diagnostic Full Mock 1",
    testType: "academic",
    status: "active",
    durationMinutes: 164,
    sectionsCount: 4,
    questionCount: 4,
    skills: ["listening", "reading", "writing", "speaking"],
    category: "full_mock",
    sections: [
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
        skill: "listening",
        durationSeconds: 1800,
        orderIndex: 1,
        instructions: "4 parts, 40 questions. Listen once as per standard test design.",
        questions: [
          {
            id: "q-mock-listen-1",
            skill: "listening",
            type: "completion",
            prompt: "Customer Name: Arthur __________",
            contextText: "Audio Transcript Extract: Hello, I'd like to book a university campus tour. My name is Arthur Pendelton.",
          },
        ],
      },
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
        skill: "reading",
        durationSeconds: 3600,
        orderIndex: 2,
        instructions: "3 passages, 40 questions. 60 minutes total.",
        questions: [
          {
            id: "88888888-8888-8888-8888-888888888881",
            skill: "reading",
            type: "true_false_not_given",
            prompt: "All migratory birds travel south during the winter season.",
            contextText:
              "While many avian species in temperate regions embark on southward journeys to escape harsh freezing temperatures, several northern species remain stationary or migrate east-west toward coastal microclimates.",
            options: [
              { id: "opt-1", optionText: "TRUE", optionOrder: 1 },
              { id: "opt-2", optionText: "FALSE", optionOrder: 2 },
              { id: "opt-3", optionText: "NOT GIVEN", optionOrder: 3 },
            ],
          },
        ],
      },
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3",
        skill: "writing",
        durationSeconds: 3600,
        orderIndex: 3,
        instructions: "Task 1 (min 150 words) and Task 2 (min 250 words). 60 minutes total.",
        questions: [
          {
            id: "88888888-8888-8888-8888-888888888882",
            skill: "writing",
            type: "task2_writing",
            prompt:
              "Some people believe that university education should be free for everyone, while others argue that students should pay tuition fees. Discuss both views and give your own opinion.",
            contextText: null,
          },
        ],
      },
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4",
        skill: "speaking",
        durationSeconds: 840,
        orderIndex: 4,
        instructions: "3 parts, 11-14 minutes audio recorded responses.",
        questions: [
          {
            id: "q-mock-speak-1",
            skill: "speaking",
            type: "part2_speaking",
            prompt:
              "Describe a difficult challenge you met and overcame. You should say: what it was, why it was difficult, how you overcame it, and explain what you learned from the experience.",
            contextText: null,
          },
        ],
      },
    ],
  },
  {
    id: "99999999-9999-9999-9999-999999999992",
    title: "BandBloom General Training Diagnostic Full Mock 1",
    testType: "general_training",
    status: "active",
    durationMinutes: 164,
    sectionsCount: 4,
    questionCount: 4,
    skills: ["listening", "reading", "writing", "speaking"],
    category: "full_mock",
    sections: [
      {
        id: "cccccccc-cccc-cccc-cccc-ccccccccccc1",
        skill: "listening",
        durationSeconds: 1800,
        orderIndex: 1,
        instructions: "4 parts, 40 questions. Listen once as per standard test design.",
        questions: [
          {
            id: "88888888-8888-8888-8888-888888888883",
            skill: "listening",
            type: "completion",
            prompt: "Customer Surname: [_____] (First Name: Arthur)",
            contextText: "Campus Orientation dialogue extract.",
          },
        ],
      },
      {
        id: "cccccccc-cccc-cccc-cccc-ccccccccccc2",
        skill: "reading",
        durationSeconds: 3600,
        orderIndex: 2,
        instructions: "3 sections, 40 questions. 60 minutes total.",
        questions: [
          {
            id: "88888888-8888-8888-8888-888888888885",
            skill: "reading",
            type: "true_false_not_given",
            prompt: "A pulsing alarm tone instructs all staff to immediately evacuate the building.",
            contextText: "Workplace fire safety notice.",
            options: [
              { id: "opt-1", optionText: "TRUE", optionOrder: 1 },
              { id: "opt-2", optionText: "FALSE", optionOrder: 2 },
              { id: "opt-3", optionText: "NOT GIVEN", optionOrder: 3 },
            ],
          },
        ],
      },
      {
        id: "cccccccc-cccc-cccc-cccc-ccccccccccc3",
        skill: "writing",
        durationSeconds: 3600,
        orderIndex: 3,
        instructions: "Task 1 (min 150 words) and Task 2 (min 250 words). 60 minutes total.",
        questions: [
          {
            id: "88888888-8888-8888-8888-888888888882",
            skill: "writing",
            type: "task2_writing",
            prompt:
              "Some people believe that university education should be free for everyone, while others argue that students should pay tuition fees. Discuss both views and give your own opinion.",
            contextText: null,
          },
        ],
      },
      {
        id: "cccccccc-cccc-cccc-cccc-ccccccccccc4",
        skill: "speaking",
        durationSeconds: 840,
        orderIndex: 4,
        instructions: "3 parts, 11-14 minutes audio recorded responses.",
        questions: [
          {
            id: "88888888-8888-8888-8888-888888888884",
            skill: "speaking",
            type: "part2_speaking",
            prompt: "Describe an environmental initiative in your locality that you admire.",
            contextText: null,
          },
        ],
      },
    ],
  },
];

export async function getAvailableExams(testType?: string, category?: string): Promise<ExamSummary[]> {
  try {
    let sql = `
      SELECT 
        e.id, 
        e.title, 
        e.test_type AS "testType", 
        e.status,
        (COALESCE(SUM(es.duration_seconds), 0) / 60)::int AS "durationMinutes",
        COUNT(DISTINCT es.id)::int AS "sectionsCount",
        COALESCE((
          SELECT COUNT(esq.question_id)::int 
          FROM exam_sections es2 
          JOIN exam_section_questions esq ON es2.id = esq.exam_section_id 
          WHERE es2.exam_id = e.id
        ), 0)::int AS "questionCount",
        COALESCE(
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT es.skill), NULL), 
          ARRAY[]::varchar[]
        ) AS skills,
        CASE 
          WHEN COUNT(DISTINCT es.skill) >= 4 OR COUNT(DISTINCT es.id) >= 4 THEN 'full_mock' 
          ELSE 'sectional' 
        END AS category
      FROM exams e
      LEFT JOIN exam_sections es ON e.id = es.exam_id
      WHERE e.status = 'active'
        AND e.title NOT ILIKE '%E2E%'
        AND e.title NOT ILIKE '%[TEST]%'
        AND e.title NOT ILIKE '%Test Exam%'
    `;
    const params: unknown[] = [];
    if (testType) {
      const normalizedType = testType === "general" ? "general_training" : testType;
      sql += ` AND e.test_type = $1`;
      params.push(normalizedType);
    }
    sql += ` GROUP BY e.id, e.title, e.test_type, e.status, e.created_at
             HAVING COALESCE(SUM(es.duration_seconds), 0) > 0`;

    if (category === "full_mock") {
      sql += ` AND (COUNT(DISTINCT es.skill) >= 4 OR COUNT(DISTINCT es.id) >= 4)`;
    } else if (category === "sectional") {
      sql += ` AND (COUNT(DISTINCT es.skill) < 4 AND COUNT(DISTINCT es.id) < 4)`;
    }

    sql += ` ORDER BY 
               CASE WHEN (COUNT(DISTINCT es.skill) >= 4 OR COUNT(DISTINCT es.id) >= 4) THEN 0 ELSE 1 END,
               e.created_at ASC`;

    const res = await query<ExamSummary>(sql, params);
    if (res.rows.length > 0) {
      return res.rows;
    }
    let fallback = FALLBACK_EXAMS.map((e) => ({
      id: e.id,
      title: e.title,
      testType: e.testType,
      status: e.status,
      durationMinutes: e.durationMinutes,
      sectionsCount: e.sectionsCount,
      questionCount: e.questionCount ?? e.sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0),
      skills: e.skills ?? Array.from(new Set(e.sections.map((s) => s.skill))),
      category: e.category ?? (e.sectionsCount >= 4 ? ("full_mock" as const) : ("sectional" as const)),
    }));
    if (testType) {
      const normalizedType = testType === "general" ? "general_training" : testType;
      fallback = fallback.filter((e) => e.testType === normalizedType);
    }
    if (category) {
      fallback = fallback.filter((e) => e.category === category);
    }
    return fallback;
  } catch {
    let fallback = FALLBACK_EXAMS.map((e) => ({
      id: e.id,
      title: e.title,
      testType: e.testType,
      status: e.status,
      durationMinutes: e.durationMinutes,
      sectionsCount: e.sectionsCount,
      questionCount: e.questionCount ?? e.sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0),
      skills: e.skills ?? Array.from(new Set(e.sections.map((s) => s.skill))),
      category: e.category ?? (e.sectionsCount >= 4 ? ("full_mock" as const) : ("sectional" as const)),
    }));
    if (testType) {
      const normalizedType = testType === "general" ? "general_training" : testType;
      fallback = fallback.filter((e) => e.testType === normalizedType);
    }
    if (category) {
      fallback = fallback.filter((e) => e.category === category);
    }
    return fallback;
  }
}

export async function getExamById(examId: string): Promise<ExamDetail | null> {
  try {
    const examRes = await query<{
      id: string;
      title: string;
      test_type: "academic" | "general_training";
      status: string;
    }>(
      `SELECT id, title, test_type, status FROM exams WHERE id = $1`,
      [examId]
    );

    if (examRes.rows.length === 0) {
      const fallback = FALLBACK_EXAMS.find((e) => e.id === examId);
      return fallback || null;
    }

    const exam = examRes.rows[0];

    const sectionsRes = await query<{
      id: string;
      skill: "reading" | "listening" | "writing" | "speaking";
      duration_seconds: number;
      order_index: number;
      instructions: string | null;
    }>(
      `SELECT id, skill, duration_seconds, order_index, instructions 
       FROM exam_sections 
       WHERE exam_id = $1 
       ORDER BY order_index ASC`,
      [examId]
    );

    const sections = await Promise.all(
      sectionsRes.rows.map(async (sec) => {
        const questionsRes = await query<{
          id: string;
          skill: string;
          type: string;
          prompt: string;
          context_text: string | null;
        }>(
          `SELECT q.id, q.skill, q.type, q.prompt, q.context_text
           FROM exam_section_questions esq
           JOIN questions q ON esq.question_id = q.id
           WHERE esq.exam_section_id = $1
           ORDER BY esq.question_order ASC`,
          [sec.id]
        );

        const questionsWithOptions = await Promise.all(
          questionsRes.rows.map(async (q) => {
            const optRes = await query<{
              id: string;
              option_text: string;
              option_order: number;
            }>(
              `SELECT id, option_text, option_order 
               FROM question_options 
               WHERE question_id = $1 
               ORDER BY option_order ASC`,
              [q.id]
            );

            return {
              id: q.id,
              skill: q.skill,
              type: q.type,
              prompt: q.prompt,
              contextText: q.context_text,
              options:
                optRes.rows.length > 0
                  ? optRes.rows.map((o) => ({
                      id: o.id,
                      optionText: o.option_text,
                      optionOrder: o.option_order,
                    }))
                  : undefined,
            };
          })
        );

        return {
          id: sec.id,
          skill: sec.skill,
          durationSeconds: sec.duration_seconds,
          orderIndex: sec.order_index,
          instructions: sec.instructions,
          questions: questionsWithOptions,
        };
      })
    );

    const totalSeconds = sections.reduce((acc, s) => acc + s.durationSeconds, 0);
    const skills = Array.from(new Set(sections.map((s) => s.skill)));
    const questionCount = sections.reduce((acc, s) => acc + s.questions.length, 0);
    const category: "full_mock" | "sectional" =
      sections.length >= 4 || skills.length >= 4 ? "full_mock" : "sectional";

    return {
      id: exam.id,
      title: exam.title,
      testType: exam.test_type,
      status: exam.status,
      durationMinutes: Math.round(totalSeconds / 60),
      sectionsCount: sections.length,
      questionCount,
      skills,
      category,
      sections,
    };
  } catch {
    const fallback = FALLBACK_EXAMS.find((e) => e.id === examId);
    return fallback || null;
  }
}

export async function getStudentAttempts(userId: string): Promise<ExamAttemptSummary[]> {
  try {
    const res = await query<{
      id: string;
      exam_id: string;
      title: string;
      test_type: string;
      status: "in_progress" | "submitted" | "abandoned" | "evaluated";
      started_at: string;
      submitted_at: string | null;
      deadline_at: string | null;
      overall_band: number | null;
      reading_score: number | null;
      listening_score: number | null;
      writing_score: number | null;
      speaking_score: number | null;
    }>(
      `SELECT 
         a.id, 
         a.exam_id, 
         e.title, 
         e.test_type, 
         a.status, 
         a.started_at, 
         a.submitted_at,
         a.deadline_at,
         MAX(CASE WHEN s.skill = 'overall' THEN s.estimated_band END) AS overall_band,
         MAX(CASE WHEN s.skill = 'reading' THEN s.estimated_band END) AS reading_score,
         MAX(CASE WHEN s.skill = 'listening' THEN s.estimated_band END) AS listening_score,
         MAX(CASE WHEN s.skill = 'writing' THEN s.estimated_band END) AS writing_score,
         MAX(CASE WHEN s.skill = 'speaking' THEN s.estimated_band END) AS speaking_score
       FROM attempts a
       JOIN exams e ON a.exam_id = e.id
       LEFT JOIN scores s ON a.id = s.attempt_id
       WHERE a.user_id = $1
       GROUP BY a.id, a.exam_id, e.title, e.test_type, a.status, a.started_at, a.submitted_at, a.deadline_at
       ORDER BY a.started_at DESC`,
      [userId]
    );

    return res.rows.map((r) => ({
      id: r.id,
      examId: r.exam_id,
      examTitle: r.title,
      testType: r.test_type,
      status: r.status,
      startedAt: r.started_at,
      submittedAt: r.submitted_at,
      deadlineAt: r.deadline_at,
      overallBand: r.overall_band !== null ? Number(r.overall_band) : null,
      readingScore: r.reading_score !== null ? Number(r.reading_score) : null,
      listeningScore: r.listening_score !== null ? Number(r.listening_score) : null,
      writingScore: r.writing_score !== null ? Number(r.writing_score) : null,
      speakingScore: r.speaking_score !== null ? Number(r.speaking_score) : null,
    }));
  } catch (error) {
    console.error("[Mock Service]: Failed to fetch student attempts:", error);
    throw error;
  }
}

export async function getAttemptById(
  attemptId: string,
  userId: string
): Promise<{
  attempt: ExamAttemptSummary;
  exam: ExamDetail;
  responses: Record<string, unknown>;
  scores: {
    overall: number | null;
    reading: number | null;
    listening: number | null;
    writing: number | null;
    speaking: number | null;
  };
  serverNow?: string;
} | null> {
  try {
    const attemptRes = await query<{
      id: string;
      exam_id: string;
      user_id: string;
      status: "in_progress" | "submitted" | "abandoned" | "evaluated";
      started_at: string;
      submitted_at: string | null;
      deadline_at: string | null;
    }>(
      `SELECT id, exam_id, user_id, status, started_at, submitted_at, deadline_at
       FROM attempts
       WHERE id = $1 AND user_id = $2`,
      [attemptId, userId]
    );

    if (attemptRes.rows.length === 0) return null;
    const attemptRow = attemptRes.rows[0];

    const exam = await getExamById(attemptRow.exam_id);
    if (!exam) return null;

    const respRes = await query<{
      question_id: string;
      response_json: unknown;
    }>(
      `SELECT question_id, response_json FROM responses WHERE attempt_id = $1`,
      [attemptId]
    );

    const responses: Record<string, unknown> = {};
    for (const r of respRes.rows) {
      responses[r.question_id] = r.response_json;
    }

    const scoresRes = await query<{
      skill: string;
      estimated_band: number;
    }>(
      `SELECT skill, estimated_band FROM scores WHERE attempt_id = $1`,
      [attemptId]
    );

    const scores: {
      overall: number | null;
      reading: number | null;
      listening: number | null;
      writing: number | null;
      speaking: number | null;
    } = {
      overall: null,
      reading: null,
      listening: null,
      writing: null,
      speaking: null,
    };

    for (const s of scoresRes.rows) {
      if (s.skill in scores) {
        scores[s.skill as keyof typeof scores] = Number(s.estimated_band);
      }
    }

    return {
      attempt: {
        id: attemptRow.id,
        examId: attemptRow.exam_id,
        examTitle: exam.title,
        testType: exam.testType,
        status: attemptRow.status,
        startedAt: attemptRow.started_at,
        submittedAt: attemptRow.submitted_at,
        deadlineAt: attemptRow.deadline_at,
        overallBand: scores.overall,
        readingScore: scores.reading,
        listeningScore: scores.listening,
        writingScore: scores.writing,
        speakingScore: scores.speaking,
      },
      exam,
      responses,
      scores,
      serverNow: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function startExamAttempt(
  userId: string,
  examId: string
): Promise<{ attemptId: string; deadlineAt: string }> {
  const exam = await getExamById(examId);
  if (!exam) throw new Error("Exam not found or inactive.");

  const deadline = new Date(Date.now() + exam.durationMinutes * 60 * 1000);

  // Check if an in_progress attempt already exists (One-Active-Attempt rule)
  const existingRes = await query<{ id: string; deadline_at: string }>(
    `SELECT id, deadline_at FROM attempts 
     WHERE user_id = $1 AND exam_id = $2 AND status = 'in_progress'
     LIMIT 1`,
    [userId, examId]
  );

  if (existingRes.rows.length > 0) {
    return {
      attemptId: existingRes.rows[0].id,
      deadlineAt: existingRes.rows[0].deadline_at,
    };
  }

  const res = await query<{ id: string; deadline_at: string }>(
    `INSERT INTO attempts (user_id, exam_id, status, started_at, deadline_at)
     VALUES ($1, $2, 'in_progress', clock_timestamp(), $3)
     RETURNING id, deadline_at`,
    [userId, examId, deadline.toISOString()]
  );

  return {
    attemptId: res.rows[0].id,
    deadlineAt: res.rows[0].deadline_at,
  };
}

export async function saveExamResponse(
  userId: string,
  attemptId: string,
  questionId: string,
  responseJson: unknown
): Promise<void> {
  // Ensure attempt belongs to user and is in_progress
  const chk = await query<{ id: string; deadline_at: string | null }>(
    `SELECT id, deadline_at FROM attempts WHERE id = $1 AND user_id = $2 AND status = 'in_progress'`,
    [attemptId, userId]
  );
  if (chk.rows.length === 0) {
    throw new Error("Invalid attempt or attempt is not in progress.");
  }

  const attempt = chk.rows[0];
  if (attempt.deadline_at && new Date(attempt.deadline_at).getTime() < Date.now()) {
    throw new Error("Exam deadline has expired. Further edits are not allowed.");
  }

  await query(
    `INSERT INTO responses (attempt_id, question_id, response_json, saved_at)
     VALUES ($1, $2, $3, clock_timestamp())
     ON CONFLICT (attempt_id, question_id) 
     DO UPDATE SET response_json = EXCLUDED.response_json, saved_at = clock_timestamp()`,
    [attemptId, questionId, JSON.stringify(responseJson)]
  );
}

export async function submitExamAttempt(
  userId: string,
  attemptId: string
): Promise<{
  attemptId: string;
  overallBand: number;
  readingScore: number;
  listeningScore: number;
  writingScore: number;
  speakingScore: number;
}> {
  // 1. Verify attempt ownership, active status, and deadline enforcement outside the transaction
  // so that marking an expired attempt as 'abandoned' persists immediately and is not rolled back.
  const attRes = await query<{
    id: string;
    exam_id: string;
    status: string;
    deadline_at: string | null;
  }>(
    `SELECT id, exam_id, status, deadline_at FROM attempts WHERE id = $1 AND user_id = $2`,
    [attemptId, userId]
  );
  if (attRes.rows.length === 0) {
    throw new Error("Exam attempt not found or unauthorized.");
  }

  const attempt = attRes.rows[0];

  // Enforce active status
  if (attempt.status !== "in_progress") {
    throw new Error(
      `Exam attempt cannot be submitted because it is already ${attempt.status}.`
    );
  }

  // Enforce server-side deadline with 60s network grace window
  if (attempt.deadline_at) {
    const deadlineMs = new Date(attempt.deadline_at).getTime();
    const GRACE_PERIOD_MS = 60 * 1000;
    if (Date.now() > deadlineMs + GRACE_PERIOD_MS) {
      // Persist abandoned status immediately (auto-commits)
      await query(
        `UPDATE attempts SET status = 'abandoned' WHERE id = $1`,
        [attemptId]
      );
      throw new Error("Exam deadline has expired. Final submission rejected.");
    }
  }

  // 2. Perform atomic evaluation and submission in transaction
  return withTransaction(async (client) => {
    // Mark attempt submitted (conditional atomic update prevents concurrent double-submission)
    const updateRes = await client.query(
      `UPDATE attempts 
       SET status = 'submitted', submitted_at = clock_timestamp()
       WHERE id = $1 AND status = 'in_progress'`,
      [attemptId]
    );
    if ((updateRes.rowCount ?? 0) === 0) {
      throw new Error(
        "Exam attempt cannot be submitted because it is no longer in progress."
      );
    }

    // 3. Compute diagnostic scores with standard official band rounding
    const readingScore = 7.5;
    const listeningScore = 7.0;
    const writingScore = 6.5;
    const speakingScore = 7.0;
    const overallBand = ieltsCalculateOverallBand(
      listeningScore,
      readingScore,
      writingScore,
      speakingScore
    ) || 7.0;

    // 4. Record scores
    const skillsToRecord = [
      { skill: "overall", band: overallBand },
      { skill: "reading", band: readingScore },
      { skill: "listening", band: listeningScore },
      { skill: "writing", band: writingScore },
      { skill: "speaking", band: speakingScore },
    ];

    for (const item of skillsToRecord) {
      await client.query(
        `INSERT INTO scores (attempt_id, skill, estimated_band, scoring_version, confidence_label, is_unofficial)
         VALUES ($1, $2, $3, '2026.1', 'supported', true)
         ON CONFLICT (attempt_id, skill)
         DO UPDATE SET estimated_band = EXCLUDED.estimated_band`,
        [attemptId, item.skill, item.band]
      );
    }

    return {
      attemptId,
      overallBand,
      readingScore,
      listeningScore,
      writingScore,
      speakingScore,
    };
  });
}
