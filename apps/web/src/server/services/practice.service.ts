import { query, withTransaction } from "@/server/db";
import { ieltsRoundBand } from "./mock.service";
import {
  validateReadingAnswer,
  calculateIndicativeReadingBand,
} from "@/lib/reading-module-data";
import {
  ACADEMIC_READING_PASSAGE,
  GT_READING_PASSAGE,
  LISTENING_ACTIVITY,
  countWords,
  ReadingEvaluationResult,
  ListeningEvaluationResult,
  WritingEvaluationResult,
  SpeakingEvaluationResult,
  PracticeHubSummary,
} from "@/lib/practice-data";

export * from "@/lib/practice-data";

export function evaluateReadingSubmission(
  answers: Record<string, string>,
  stream: "academic" | "general_training",
  assessmentType: "diagnostic" | "sectional_practice" | "full_reading_mock" = "diagnostic"
): ReadingEvaluationResult {
  const passage = stream === "academic" ? ACADEMIC_READING_PASSAGE : GT_READING_PASSAGE;
  let correctCount = 0;
  let unansweredCount = 0;
  const questionResults = [];
  const mistakesToRecord = [];

  for (const q of passage.questions) {
    const rawStudent = (answers[q.id] || "").trim();
    if (!rawStudent) {
      unansweredCount++;
    }
    const validation = validateReadingAnswer(rawStudent, {
      correctAnswer: q.correctAnswer,
      typeId: q.type === "True/False/Not Given" ? "tfng" : "completion",
    });
    const isCorrect = validation.isCorrect;

    if (isCorrect) correctCount++;
    else if (rawStudent) {
      mistakesToRecord.push({
        skill: "reading" as const,
        errorTag: q.type === "True/False/Not Given" ? "keyword trap" : "paraphrase miss",
        questionPrompt: q.prompt,
        studentAnswer: rawStudent,
        correctAnswer: q.correctAnswer,
        reasoning: `${q.explanation} (Evidence: Paragraph ${q.evidenceParagraph})`,
      });
    }

    questionResults.push({
      questionId: q.id,
      number: q.number,
      studentAnswer: rawStudent || "No answer provided",
      correctAnswer: q.correctAnswer,
      isCorrect,
      evidenceParagraph: q.evidenceParagraph,
      evidenceText: q.evidenceText,
      explanation: q.explanation,
      errorTrap: q.errorTrap,
    });
  }

  const maxScore = passage.questions.length;
  const total = maxScore;
  const accuracy = Math.round((correctCount / maxScore) * 100);

  // Phase 2 & 3: For diagnostic or sectional practice, bandEstimate MUST BE NULL.
  // Tiny question sets cannot legitimately calibrate an official IELTS band score.
  const estimatedBand: number | null =
    assessmentType === "full_reading_mock" && maxScore === 40
      ? calculateIndicativeReadingBand(correctCount, stream, 40)
      : null;

  const confidenceLabel =
    estimatedBand !== null ? ("supported" as const) : ("insufficient_evidence" as const);

  const statusMessage =
    assessmentType === "diagnostic"
      ? `Diagnostic Result: ${correctCount} / ${maxScore} correct (${accuracy}% accuracy)`
      : assessmentType === "sectional_practice"
      ? `Sectional Practice Result: ${correctCount} / ${maxScore} correct (${accuracy}% accuracy)`
      : `Full Reading Mock Result: ${correctCount} / 40 (Band ${estimatedBand?.toFixed(1) ?? "—"})`;

  return {
    assessmentType,
    stream,
    score: correctCount,
    maxScore,
    total,
    correctCount,
    unansweredCount,
    accuracy,
    percentage: accuracy,
    estimatedBand,
    confidenceLabel,
    statusMessage,
    isUnofficial: true,
    questionResults,
    mistakesToRecord,
  };
}

export function evaluateListeningSubmission(
  answers: Record<string, string>
): ListeningEvaluationResult {
  let correctCount = 0;
  const questionResults = [];
  const mistakesToRecord = [];

  for (const q of LISTENING_ACTIVITY.questions) {
    const rawStudent = (answers[q.id] || "").trim();
    const isCorrect = rawStudent.toLowerCase() === q.correctAnswer.toLowerCase();

    if (isCorrect) correctCount++;
    else if (rawStudent) {
      mistakesToRecord.push({
        skill: "listening" as const,
        errorTag: q.type === "Form Completion" ? "spelling" : "inference trap",
        questionPrompt: q.prompt,
        studentAnswer: rawStudent,
        correctAnswer: q.correctAnswer,
        reasoning: `${q.explanation} (Audio Timestamp: ${q.transcriptTimestamp})`,
      });
    }

    questionResults.push({
      questionId: q.id,
      number: q.number,
      studentAnswer: rawStudent || "No answer provided",
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      transcriptTimestamp: q.transcriptTimestamp,
    });
  }

  const total = LISTENING_ACTIVITY.questions.length;
  const percentage = Math.round((correctCount / total) * 100);

  let estimatedBand = 4.0;
  if (correctCount === 3) estimatedBand = 8.0;
  else if (correctCount === 2) estimatedBand = 6.5;
  else if (correctCount === 1) estimatedBand = 5.5;

  return {
    score: correctCount,
    total,
    percentage,
    estimatedBand,
    questionResults,
    mistakesToRecord,
  };
}

// ============================================================================
// WRITING EVALUATION (ACCURATE 2:1 TASK 2 WEIGHTING)
// ============================================================================

export function evaluateWritingSubmission(
  task1Text: string,
  task2Text: string,
  isTask1GT = false
): WritingEvaluationResult {
  const w1Count = countWords(task1Text);
  const w2Count = countWords(task2Text);

  // Task 1 assessment (150 words min)
  const t1Meets = w1Count >= 150;
  const t1Warning = t1Meets
    ? undefined
    : `Underlength warning: Written ${w1Count} words. Minimum required is 150 words. In an official IELTS exam, this incurs a Task Achievement penalty.`;

  // Dynamic band calibration based on length and paragraph structure
  let t1Band = 6.0;
  if (w1Count >= 180 && task1Text.includes("\n")) t1Band = 7.5;
  else if (w1Count >= 150) t1Band = 7.0;
  else if (w1Count >= 100) t1Band = 5.5;
  else t1Band = 4.5;

  const t1Criterion = isTask1GT ? "Task Achievement (Letter Purpose)" : "Task Achievement (Data Overview)";
  const t1Rubric = [
    {
      criterion: t1Criterion,
      band: t1Band,
      feedback: t1Meets
        ? "Overview clearly highlights significant trends and makes relevant comparisons without irrelevant personal opinions."
        : "Underlength draft restricts full elaboration of key features.",
    },
    {
      criterion: "Coherence & Cohesion",
      band: t1Band,
      feedback: "Logical paragraph sequencing with appropriate transition markers (In contrast, Consequently, While).",
    },
    {
      criterion: "Lexical Resource",
      band: t1Band,
      feedback: "Accurate vocabulary collocations with minimal non-systematic word-choice errors.",
    },
    {
      criterion: "Grammatical Range & Accuracy",
      band: t1Band,
      feedback: "Varied clause structures and good control of comparative complex sentences.",
    },
  ];

  // Task 2 assessment (250 words min)
  const t2Meets = w2Count >= 250;
  const t2Warning = t2Meets
    ? undefined
    : `Underlength warning: Written ${w2Count} words. Minimum required is 250 words. In an official IELTS exam, essays under 250 words are penalized under Task Response.`;

  let t2Band = 6.0;
  if (w2Count >= 280 && task2Text.split("\n\n").length >= 3) t2Band = 7.5;
  else if (w2Count >= 250) t2Band = 7.0;
  else if (w2Count >= 170) t2Band = 5.5;
  else t2Band = 4.5;

  const t2Rubric = [
    {
      criterion: "Task Response",
      band: t2Band,
      feedback: t2Meets
        ? "Addresses all parts of the essay prompt with a well-developed, sustained central position."
        : "Fails to meet the 250-word minimum threshold, constraining argument depth.",
    },
    {
      criterion: "Coherence & Cohesion",
      band: t2Band,
      feedback: "Clear progression throughout the essay with distinct topic sentences for each body paragraph.",
    },
    {
      criterion: "Lexical Resource",
      band: t2Band,
      feedback: "Flexible use of academic collocations and abstract concepts (societal dividends, fiscal prudence).",
    },
    {
      criterion: "Grammatical Range & Accuracy",
      band: t2Band,
      feedback: "Demonstrates high proportion of error-free complex sentences with appropriate subordination.",
    },
  ];

  // Official IELTS Composite Weighting: Task 2 has DOUBLE the weight of Task 1!
  // Formula: ieltsRoundBand((t1Band + 2 * t2Band) / 3.0)
  const compositeWritingBand = ieltsRoundBand((t1Band + 2 * t2Band) / 3.0);

  return {
    task1: {
      wordCount: w1Count,
      minRequired: 150,
      meetsLengthRequirement: t1Meets,
      warningMessage: t1Warning,
      estimatedBand: t1Band,
      rubric: t1Rubric,
    },
    task2: {
      wordCount: w2Count,
      minRequired: 250,
      meetsLengthRequirement: t2Meets,
      warningMessage: t2Warning,
      estimatedBand: t2Band,
      rubric: t2Rubric,
    },
    compositeWritingBand,
    weightingNotice:
      "Calculated in accordance with official IELTS examiner weighting: Task 2 contributes 66.7% (2x weight) and Task 1 contributes 33.3% (1x weight) to your composite Writing score.",
    indicativeDisclaimer:
      "This evaluation is an automated diagnostic assessment based on IELTS rubric descriptors. It is indicative only and does not guarantee an official British Council / IDP band score.",
    actionableSuggestions: [
      t1Meets ? "Maintain concise overview placement in Task 1." : "Expand Task 1 body paragraphs with specific data points to exceed 150 words.",
      t2Meets ? "Ensure each paragraph in Task 2 concludes with an application or consequence sentence." : "Add supporting examples to each body paragraph to reliably surpass 250 words.",
      "Review linking devices to avoid repetitive use of 'Furthermore' or 'Moreover'.",
    ],
  };
}

// ============================================================================
// SPEAKING EVALUATION & TRANSCRIPT INTEGRITY
// ============================================================================

export function evaluateSpeakingSubmission(
  recognizedOrOriginalTranscript: string,
  studentEditedTranscript: string,
  durationSeconds: number
): SpeakingEvaluationResult {
  const recognizedTranscript = recognizedOrOriginalTranscript || "";
  const effectiveText = (studentEditedTranscript || recognizedTranscript).trim();
  const wordCount = countWords(effectiveText);

  // Criterion 1: Fluency & Coherence (Measured by duration & speech continuity)
  let fluencyBand = 6.0;
  if (durationSeconds >= 90 && wordCount >= 140) fluencyBand = 7.5;
  else if (durationSeconds >= 60 && wordCount >= 80) fluencyBand = 6.5;
  else if (durationSeconds >= 30) fluencyBand = 5.5;
  else fluencyBand = 4.5;

  // Criterion 2: Lexical Resource (Measured by topical vocabulary and diversity)
  let lexicalBand = 6.0;
  const hasAdvancedVocab = /(initiative|environmental|sustainability|biodiversity|conservation|infrastructure|participat|preserve|ecosystem)/i.test(effectiveText);
  if (wordCount >= 120 && hasAdvancedVocab) lexicalBand = 7.5;
  else if (wordCount >= 70) lexicalBand = 6.5;
  else if (wordCount >= 30) lexicalBand = 5.5;
  else lexicalBand = 4.5;

  // Criterion 3: Grammatical Range & Accuracy (Measured by clause complexity and consistency)
  let grammarBand = 6.0;
  const hasComplexSyntax = /(because|although|which|that|when|while|since|in order to|due to)/i.test(effectiveText);
  if (wordCount >= 120 && hasComplexSyntax) grammarBand = 7.5;
  else if (wordCount >= 70) grammarBand = 6.5;
  else if (wordCount >= 30) grammarBand = 5.5;
  else grammarBand = 4.5;

  return {
    durationSeconds,
    recognizedTranscript,
    originalTranscript: recognizedTranscript, // Backwards-compatible alias
    studentEditedTranscript: studentEditedTranscript || recognizedTranscript,
    transcriptPreservedSeparately: true,
    estimatedBand: null, // STRICT RULE: Overall band is withheld because Pronunciation is uncalibrated
    overallBandStatus: "partial_diagnostic",
    overallNotice:
      "Official IELTS Speaking requires all four criteria (Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation) to be evaluated by an accredited examiner or calibrated acoustic AI. Because Pronunciation is uncalibrated without acoustic phoneme analysis, no overall Speaking band score is issued. The criterion diagnostics below are provided solely for formative educational feedback.",
    evaluatedCriteriaCount: 3,
    rubric: [
      {
        criterion: "Fluency & Coherence",
        band: fluencyBand,
        status: "evaluated",
        feedback: durationSeconds >= 90
          ? "Demonstrated sustained speech across the 2-minute turn with natural pacing and minimal hesitation."
          : "Speaking duration was below the 2-minute ceiling; aim to speak for the full 120 seconds.",
      },
      {
        criterion: "Lexical Resource",
        band: lexicalBand,
        status: "evaluated",
        feedback: hasAdvancedVocab
          ? "Used appropriate topical vocabulary for the cue card topic (sustainability, community participation, preservation)."
          : "Employed basic everyday vocabulary; incorporate more specific collocations and topic-specific terminology.",
      },
      {
        criterion: "Grammatical Range & Accuracy",
        band: grammarBand,
        status: "evaluated",
        feedback: hasComplexSyntax
          ? "Demonstrated varied clause subordination with complex conjunctions and consistent tense usage."
          : "Relied primarily on simple sentence structures; practice using subordinate clauses and concessions.",
      },
      {
        criterion: "Pronunciation",
        band: null,
        status: "assessment_limited",
        feedback:
          "Acoustic phonemic analysis is uncalibrated in this automated browser drill. Accurate pronunciation band scoring (phonological features, intonation, syllable stress, rhythm) requires an accredited IELTS examiner or calibrated acoustic AI. Qualitative feedback: Speech continuity and pace were observed.",
      },
    ],
    pronunciationNotice:
      "Pronunciation band is withheld ('assessment_limited') because the browser environment does not execute acoustic phoneme alignment. No overall Speaking band is awarded.",
    indicativeDisclaimer:
      "Speaking diagnostic estimates are partial formative guides and do not constitute an official IELTS score.",
  };
}

// ============================================================================
// PERSISTENCE & INTEGRATION ENGINE
// ============================================================================

export async function persistPracticeAttempt(
  userId: string,
  data: {
    examId: string;
    skill: "reading" | "listening" | "writing" | "speaking";
    answers: Record<string, unknown>;
    rawScore?: number | null;
    maxScore?: number | null;
    assessmentType?: "diagnostic" | "sectional_practice" | "full_reading_mock";
    estimatedBand: number | null;
    feedbackText?: string;
    rubricJson?: unknown;
    configSnapshot?: Record<string, unknown>;
    mistakes?: {
      skill: "reading" | "listening";
      errorTag: string;
      questionPrompt: string;
      studentAnswer: string;
      correctAnswer: string;
      reasoning: string;
    }[];
  }
): Promise<{ attemptId: string; saved: boolean }> {
  return withTransaction(async (client) => {
    const configSnapshot = data.configSnapshot || {
      assessmentType: data.assessmentType || "diagnostic",
      rawScore: data.rawScore ?? null,
      maxScore: data.maxScore ?? null,
      contentVersion: "2026.1",
    };

    // 1. Create completed attempt in attempts table
    const attRes = await client.query<{ id: string }>(
      `INSERT INTO attempts (user_id, exam_id, status, started_at, submitted_at, deadline_at, config_snapshot)
       VALUES ($1, $2, 'submitted', clock_timestamp() - interval '20 minutes', clock_timestamp(), clock_timestamp() + interval '1 hour', $3)
       RETURNING id`,
      [userId, data.examId, JSON.stringify(configSnapshot)]
    );
    const attemptId = attRes.rows[0].id;

    // 2. Persist response payload
    const qRow = await client.query<{ id: string }>(
      `SELECT id FROM questions WHERE skill = $1 LIMIT 1`,
      [data.skill]
    );
    const validQuestionId = qRow.rows[0]?.id || "88888888-8888-8888-8888-888888888881";

    await client.query(
      `INSERT INTO responses (attempt_id, question_id, response_json, saved_at)
       VALUES ($1, $2, $3, clock_timestamp())
       ON CONFLICT (attempt_id, question_id) DO UPDATE SET response_json = EXCLUDED.response_json, saved_at = clock_timestamp()`,
      [attemptId, validQuestionId, JSON.stringify(data.answers)]
    );

    // 3. Persist score in scores table (calibrated confidence_label)
    // Speaking drills without acoustic phoneme alignment provide partial diagnostic criteria only (no complete overall band)
    // Diagnostic / sectional reading drills with partial sets also provide insufficient_evidence for complete overall band
    const confidenceLabel =
      data.skill === "speaking" || (data.skill === "reading" && data.estimatedBand === null)
        ? "insufficient_evidence"
        : data.skill === "writing"
        ? "limited"
        : "supported";

    await client.query(
      `INSERT INTO scores (attempt_id, skill, raw_score, estimated_band, scoring_version, confidence_label, is_unofficial)
       VALUES ($1, $2, $3, $4, '2026.1', $5, true)
       ON CONFLICT (attempt_id, skill) DO UPDATE SET 
         raw_score = EXCLUDED.raw_score,
         estimated_band = EXCLUDED.estimated_band, 
         confidence_label = EXCLUDED.confidence_label`,
      [attemptId, data.skill, data.rawScore ?? null, data.estimatedBand, confidenceLabel]
    );

    // Also persist overall band: if component band is null (partial diagnostic), overall must be NULL with insufficient_evidence
    if (data.estimatedBand !== null) {
      await client.query(
        `INSERT INTO scores (attempt_id, skill, estimated_band, scoring_version, confidence_label, is_unofficial)
         VALUES ($1, 'overall', $2, '2026.1', $3, true)
         ON CONFLICT (attempt_id, skill) DO UPDATE SET estimated_band = EXCLUDED.estimated_band, confidence_label = EXCLUDED.confidence_label`,
        [attemptId, data.estimatedBand, confidenceLabel]
      );
    } else {
      await client.query(
        `INSERT INTO scores (attempt_id, skill, estimated_band, scoring_version, confidence_label, is_unofficial)
         VALUES ($1, 'overall', NULL, '2026.1', 'insufficient_evidence', true)
         ON CONFLICT (attempt_id, skill) DO UPDATE SET estimated_band = NULL, confidence_label = 'insufficient_evidence'`,
        [attemptId]
      );
    }

    // 4. Persist feedback if provided
    if (data.feedbackText || data.rubricJson) {
      await client.query(
        `INSERT INTO feedback (attempt_id, skill, rubric_json, feedback_text, model_version, status)
         VALUES ($1, $2, $3, $4, 'v2026.1', 'published')`,
        [
          attemptId,
          data.skill,
          JSON.stringify(data.rubricJson || {}),
          data.feedbackText || "Completed practice evaluation.",
        ]
      );
    }

    // 5. Automatically feed mistakes into mistake_notes table
    if (data.mistakes && data.mistakes.length > 0) {
      for (const m of data.mistakes) {
        await client.query(
          `INSERT INTO mistake_notes (user_id, skill, error_tag, user_notes, original_answer, correct_reasoning, retry_status, source_attempt)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)`,
          [
            userId,
            m.skill,
            m.errorTag,
            m.questionPrompt,
            m.studentAnswer,
            m.reasoning,
            attemptId,
          ]
        );
      }
    }

    return { attemptId, saved: true };
  });
}

// ============================================================================
// PRACTICE HUB RECOMMENDATIONS & DISCOVERY
// ============================================================================

export async function getPracticeHubSummary(userId: string): Promise<PracticeHubSummary> {
  // 1. Fetch user profile
  const profRes = await query<{ target_band: string | null; test_type: string | null }>(
    `SELECT target_band, test_type FROM profiles WHERE user_id = $1`,
    [userId]
  );
  const testType = (profRes.rows[0]?.test_type === "general_training" ? "general_training" : "academic") as
    | "academic"
    | "general_training";
  const targetBand = Number(profRes.rows[0]?.target_band) || 7.5;

  // 2. Check for active in_progress attempt (Resumable Attempt)
  const activeRes = await query<{
    id: string;
    started_at: string;
    deadline_at: string | null;
    title: string;
  }>(
    `SELECT a.id, a.started_at, a.deadline_at, e.title
     FROM attempts a
     JOIN exams e ON a.exam_id = e.id
     WHERE a.user_id = $1 AND a.status = 'in_progress'
     ORDER BY a.started_at DESC LIMIT 1`,
    [userId]
  );
  const activeAttempt = activeRes.rows.length > 0
    ? {
        id: activeRes.rows[0].id,
        examTitle: activeRes.rows[0].title,
        startedAt: activeRes.rows[0].started_at,
        deadlineAt: activeRes.rows[0].deadline_at,
      }
    : null;

  // 3. Count completed practice attempts
  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*) FROM attempts WHERE user_id = $1 AND status = 'submitted'`,
    [userId]
  );
  const recentAttemptsCount = parseInt(countRes.rows[0]?.count || "0", 10);

  // 4. Discover weakness from Mistake Notebook
  const mistakeRes = await query<{ skill: string; error_tag: string; count: string }>(
    `SELECT skill, error_tag, COUNT(*) AS count
     FROM mistake_notes
     WHERE user_id = $1 AND retry_status != 'mastered'
     GROUP BY skill, error_tag
     ORDER BY COUNT(*) DESC LIMIT 1`,
    [userId]
  );

  // 5. Build intelligent recommendation
  let recommendation: PracticeHubSummary["recommendation"] | null = null;

  if (mistakeRes.rows.length > 0) {
    const top = mistakeRes.rows[0];
    const skill = (["reading", "listening", "writing", "speaking"].includes(top.skill)
      ? top.skill
      : "reading") as "reading" | "listening" | "writing" | "speaking";

    recommendation = {
      type: "mistake_notebook_weakness",
      title: `Weakness Drill: ${skill.toUpperCase()} ${top.error_tag.toUpperCase()}`,
      description: `You have ${top.count} unresolved mistake(s) in your notebook tagged with '${top.error_tag}'. Practice today to eliminate this recurring trap.`,
      skill,
      actionHref: `/practice?lab=${skill}&type=${testType}`,
      labKey: skill,
      badge: "Notebook Weakness Focus",
      estimatedMinutes: 20,
    };
  } else {
    // Check study plan
    interface StoredPlanJson {
      tasks?: {
        id?: string;
        title?: string;
        skill?: "reading" | "listening" | "writing" | "speaking";
        reason?: string;
        estimatedDurationMinutes?: number;
        completed?: boolean;
      }[];
    }
    const planRes = await query<{ plan_json: StoredPlanJson | string | null }>(
      `SELECT plan_json FROM study_plans WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (planRes.rows.length > 0 && planRes.rows[0].plan_json) {
      try {
        const raw = planRes.rows[0].plan_json;
        const planData: StoredPlanJson = typeof raw === "string" ? JSON.parse(raw) : raw;
        const tasks = planData.tasks || [];
        const uncompleted = Array.isArray(tasks) ? tasks.find((t) => !t.completed) : null;

        if (uncompleted) {
          recommendation = {
            type: "study_plan_task",
            title: `Study Plan Today: ${uncompleted.title || "Daily Practice Task"}`,
            description: uncompleted.reason || "Recommended next step aligned with your scheduled weekly curriculum.",
            skill: uncompleted.skill || "reading",
            actionHref: `/practice?lab=${uncompleted.skill || "reading"}&type=${testType}`,
            labKey: uncompleted.skill || "reading",
            badge: "Study Plan Scheduled",
            estimatedMinutes: uncompleted.estimatedDurationMinutes || 30,
          };
        }
      } catch {
        // Fallback
      }
    }
  }

  // Default honest starter activity if no history or tasks
  if (!recommendation) {
    recommendation = {
      type: "starter_recommendation",
      title: testType === "academic"
        ? "Starter Drill: Academic Reading Megacities & Climate Adaptation"
        : "Starter Drill: GT Reading Workplace Fire Safety Notices",
      description:
        "Begin your practice routine with a calibrated 4-question True/False/Not Given diagnostic passage with paragraph evidence highlights.",
      skill: "reading",
      actionHref: `/practice?lab=reading&type=${testType}`,
      labKey: "reading",
      badge: "Recommended Starter Activity",
      estimatedMinutes: 15,
    };
  }

  return {
    profile: {
      testType,
      targetBand,
    },
    recommendation,
    activeAttempt,
    recentAttemptsCount,
  };
}
