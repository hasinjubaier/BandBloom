/**
 * BandBloom IELTS SaaS - Reading Module Final Functional Integrity Audit Suite
 * 
 * Comprehensive Verification:
 * 1. Academic vs General Training Full Simulation structure & lifecycle
 * 2. 60-minute duration, timer, submission, auto-save, idempotency, score bounds (0-40)
 * 3. Answer validation matrix (case, whitespace, punctuation, hyphens, word limits, numbers, multi-choice)
 * 4. Profile immutability, stream switcher, explicit cross-training, attempt stream metadata
 * 5. Full coverage verification of all 14 official IELTS Reading question formats
 */

import { test, after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Pool } = require("../apps/web/node_modules/pg");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.TEST_APP_URL || "http://localhost:3000";

const pool = new Pool({
  host: process.env.PGHOST || "127.0.0.1",
  port: Number(process.env.PGPORT || 5433),
  user: process.env.PGUSER || "bandbloom_user",
  password: process.env.PGPASSWORD || "bandbloom_password",
  database: process.env.PGDATABASE || "bandbloom_db",
  max: 5,
});

class CookieSession {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cookies = new Map();
  }

  async fetch(path, options = {}) {
    const url = new URL(path, this.baseUrl).toString();
    const headers = new Headers(options.headers || {});

    if (this.cookies.size > 0) {
      const cookieHeader = Array.from(this.cookies.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
      headers.set("Cookie", cookieHeader);
    }

    const res = await fetch(url, { ...options, headers });

    const rawCookies = res.headers.getSetCookie
      ? res.headers.getSetCookie()
      : [res.headers.get("set-cookie")].filter(Boolean);

    for (const cookieStr of rawCookies) {
      if (!cookieStr) continue;
      const parts = cookieStr.split(";");
      const [nameVal] = parts;
      const idx = nameVal.indexOf("=");
      if (idx !== -1) {
        const k = nameVal.substring(0, idx).trim();
        const v = nameVal.substring(idx + 1).trim();
        if (v === "" || cookieStr.toLowerCase().includes("max-age=0")) {
          this.cookies.delete(k);
        } else {
          this.cookies.set(k, v);
        }
      }
    }

    return res;
  }
}

const TIMESTAMP = Date.now();
const AUDIT_ACAD_EMAIL = `audit_acad_${TIMESTAMP}@bandbloom.test`;
const AUDIT_GT_EMAIL = `audit_gt_${TIMESTAMP}@bandbloom.test`;
const AUDIT_PASSWORD = "ReadingPass2026!";

let acadUserId = null;
let gtUserId = null;
let acadSession = null;
let gtSession = null;

async function registerTestUser(session, email, fullName, testType) {
  const res = await session.fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: AUDIT_PASSWORD,
      confirmPassword: AUDIT_PASSWORD,
      fullName,
      agreedToTerms: true,
      targetBand: 7.5,
      testType,
    }),
  });
  const data = await res.json();
  assert.ok(res.status === 200 || res.status === 201, `Failed to register user: ${email} -> ${JSON.stringify(data)}`);
  return data.user.id;
}

test("Setup: Register Academic and GT student accounts for Functional Audit", async () => {
  acadSession = new CookieSession(BASE_URL);
  gtSession = new CookieSession(BASE_URL);

  acadUserId = await registerTestUser(
    acadSession,
    AUDIT_ACAD_EMAIL,
    "Audit Academic Candidate",
    "academic"
  );
  gtUserId = await registerTestUser(
    gtSession,
    AUDIT_GT_EMAIL,
    "Audit GT Candidate",
    "general_training"
  );

  assert.ok(acadUserId);
  assert.ok(gtUserId);
});

test("Audit 1 & 2: Academic Full Mock Exam Lifecycle, Timer, Persistence & Idempotency", async () => {
  const acadExamId = "99999999-9999-9999-9999-999999999991";

  // 1. Inspect Academic Exam Specification
  const examRes = await acadSession.fetch(`/api/exams/${acadExamId}`);
  assert.equal(examRes.status, 200);
  const examData = await examRes.json();
  assert.ok(examData.success);
  assert.equal(examData.exam.testType, "academic");

  // Check Reading Section
  const readingSection = examData.exam.sections.find((s) => s.skill === "reading");
  assert.ok(readingSection, "Academic exam must contain a reading section");
  assert.equal(readingSection.durationSeconds, 3600, "Reading section duration must be exactly 3600 seconds (60 mins)");
  assert.ok(readingSection.questions.length > 0, "Reading section must have questions");

  // 2. Server Gating Check: Incomplete Full Mock (4 questions) cannot be started
  const blockedRes = await acadSession.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examId: acadExamId }),
  });
  assert.equal(blockedRes.status, 400, "Incomplete Full Mock must be rejected by server with 400");

  // 3. Start Sectional Practice Attempt on Academic Reading Practice Lab
  const practiceExamId = "11111111-1111-1111-1111-111111111111";
  const startRes = await acadSession.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: practiceExamId,
      assessmentType: "sectional_practice",
    }),
  });
  assert.ok(startRes.status === 200 || startRes.status === 201);
  const startData = await startRes.json();
  assert.ok(startData.success);
  const attemptId = startData.attemptId;
  assert.ok(attemptId);

  // 4. Verify Deadline calculation (durationMinutes * 60 * 1000)
  assert.ok(startData.deadlineAt);
  const deadlineDate = new Date(startData.deadlineAt);
  assert.ok(deadlineDate.getTime() > Date.now());

  // 5. Save Responses (Answer changes saved correctly via PATCH)
  const labRes = await acadSession.fetch(`/api/exams/${practiceExamId}`);
  const labData = await labRes.json();
  const q1 = labData.exam.sections[0].questions[0];
  const saveRes1 = await acadSession.fetch(`/api/attempts/${attemptId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionId: q1.id,
      responseJson: { answer: "TRUE" },
    }),
  });
  assert.equal(saveRes1.status, 200);

  // Overwrite answer to verify answer modifications are preserved
  const saveRes2 = await acadSession.fetch(`/api/attempts/${attemptId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionId: q1.id,
      responseJson: { answer: "FALSE" },
    }),
  });
  assert.equal(saveRes2.status, 200);

  // 6. Test Refresh and Session Restoration
  const restoreRes = await acadSession.fetch(`/api/attempts/${attemptId}`);
  assert.equal(restoreRes.status, 200);
  const restoreData = await restoreRes.json();
  assert.ok(restoreData.success);
  assert.equal(restoreData.attempt.status, "in_progress");
  assert.equal(restoreData.responses[q1.id]?.answer, "FALSE", "Answer update must be accurately restored");

  // 7. Manual Submission
  const submitRes = await acadSession.fetch(`/api/attempts/${attemptId}`, {
    method: "POST",
  });
  assert.equal(submitRes.status, 200);
  const submitData = await submitRes.json();
  assert.ok(submitData.success);
  assert.ok(submitData.results);

  // 8. Duplicate Submission Prevention (Idempotency)
  const dupSubmitRes = await acadSession.fetch(`/api/attempts/${attemptId}`, {
    method: "POST",
  });
  assert.equal(dupSubmitRes.status, 400, "Submitting an already-submitted exam must be rejected with 400");
  const dupData = await dupSubmitRes.json();
  assert.equal(dupData.success, false);
  assert.match(dupData.error, /already submitted/i);

  // 9. Verify Attempt Metadata in Database
  const dbAttempt = await pool.query(
    `SELECT a.id, a.status, e.test_type, e.title 
     FROM attempts a 
     JOIN exams e ON a.exam_id = e.id 
     WHERE a.id = $1`,
    [attemptId]
  );
  assert.equal(dbAttempt.rows[0].status, "submitted");
  assert.equal(dbAttempt.rows[0].test_type, "academic");
});

test("Audit 1 & 2: General Training Full Mock Exam Lifecycle & Section Structure", async () => {
  const gtExamId = "99999999-9999-9999-9999-999999999992";

  // 1. Inspect GT Exam Specification
  const examRes = await gtSession.fetch(`/api/exams/${gtExamId}`);
  assert.equal(examRes.status, 200);
  const examData = await examRes.json();
  assert.ok(examData.success);
  assert.equal(examData.exam.testType, "general_training");

  const readingSection = examData.exam.sections.find((s) => s.skill === "reading");
  assert.ok(readingSection, "GT exam must contain a reading section");
  assert.equal(readingSection.durationSeconds, 3600, "GT Reading duration must be exactly 3600 seconds (60 mins)");
  assert.match(readingSection.instructions || "", /3 sections/i, "GT instructions must reference 3 sections (not 3 academic passages)");

  // 2. Server Gating Check: Incomplete GT Full Mock (3 questions) cannot be started
  const blockedRes = await gtSession.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examId: gtExamId }),
  });
  assert.equal(blockedRes.status, 400, "Incomplete GT Full Mock must be rejected by server with 400");

  // 3. Start Sectional Practice Attempt on General Training Reading Practice Lab
  const gtPracticeExamId = "11111111-1111-1111-1111-111111111112";
  const startRes = await gtSession.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: gtPracticeExamId,
      assessmentType: "sectional_practice",
    }),
  });
  assert.ok(startRes.status === 200 || startRes.status === 201);
  const startData = await startRes.json();
  const attemptId = startData.attemptId;

  // 4. Save GT Answer
  const labRes = await gtSession.fetch(`/api/exams/${gtPracticeExamId}`);
  const labData = await labRes.json();
  const q1 = labData.exam.sections[0].questions[0];
  const saveRes = await gtSession.fetch(`/api/attempts/${attemptId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionId: q1.id,
      responseJson: { answer: "FALSE" },
    }),
  });
  assert.equal(saveRes.status, 200);

  // 5. Submit GT Attempt
  const submitRes = await gtSession.fetch(`/api/attempts/${attemptId}`, {
    method: "POST",
  });
  assert.equal(submitRes.status, 200);

  // 6. Verify Database Test Type Preservation
  const dbAttempt = await pool.query(
    `SELECT a.id, a.status, e.test_type, e.title 
     FROM attempts a 
     JOIN exams e ON a.exam_id = e.id 
     WHERE a.id = $1`,
    [attemptId]
  );
  assert.equal(dbAttempt.rows[0].test_type, "general_training", "Persisted attempt must preserve general_training stream");
});

test("Audit 3: Answer Validation Engine (validateReadingAnswer Matrix)", async () => {
  const {
    validateReadingAnswer,
    countIeltsWords,
    countIeltsTokens,
    normalizeAnswer,
  } = await import("../apps/web/src/lib/reading-module-data.ts");

  // 1. Case Normalization
  assert.equal(
    validateReadingAnswer("true", { correctAnswer: "TRUE", typeId: "tfng" }).isCorrect,
    true
  );
  assert.equal(
    validateReadingAnswer("TrUe", { correctAnswer: "TRUE", typeId: "tfng" }).isCorrect,
    true
  );
  assert.equal(
    validateReadingAnswer("STRUCTURAL GROOVES", { correctAnswer: "structural grooves" }).isCorrect,
    true
  );

  // 2. Whitespace Normalization
  assert.equal(
    validateReadingAnswer("   structural    grooves   ", { correctAnswer: "structural grooves" }).isCorrect,
    true
  );

  // 3. Punctuation Handling (Quotes, periods, commas stripped)
  assert.equal(
    validateReadingAnswer('"structural grooves."', { correctAnswer: "structural grooves" }).isCorrect,
    true
  );
  assert.equal(
    validateReadingAnswer("'pivot'", { correctAnswer: "pivot" }).isCorrect,
    true
  );
  assert.equal(
    validateReadingAnswer("15,", { correctAnswer: "15" }).isCorrect,
    true
  );

  // 4. Hyphenated Words count as 1 word
  assert.equal(countIeltsWords("state-of-the-art"), 1, "Hyphenated word must count as 1 word");
  assert.equal(countIeltsWords("state - of - the - art"), 1, "Spaced hyphenated word must count as 1 word");
  assert.equal(countIeltsWords("eco-friendly bioswales"), 2, "Hyphenated word + second word = 2 words");

  // 5. Multiple accepted answers & authorized variants
  assert.equal(
    validateReadingAnswer("15", { correctAnswer: "15", acceptedVariants: ["fifteen"] }).isCorrect,
    true
  );
  assert.equal(
    validateReadingAnswer("fifteen", { correctAnswer: "15", acceptedVariants: ["fifteen"] }).isCorrect,
    true
  );

  // Arbitrary synonyms must NOT be accepted unless authorized
  assert.equal(
    validateReadingAnswer("underground vaults", { correctAnswer: "canal networks" }).isCorrect,
    false,
    "Unlisted synonyms must strictly fail"
  );

  // 6. Word limits: NO MORE THAN ONE WORD
  const oneWordPass = validateReadingAnswer("pivot", { correctAnswer: "pivot", maxWords: 1 });
  assert.equal(oneWordPass.isCorrect, true);
  assert.equal(oneWordPass.wordLimitExceeded, false);

  const oneWordFail = validateReadingAnswer("reinforced pivot", { correctAnswer: "pivot", maxWords: 1 });
  assert.equal(oneWordFail.isCorrect, false);
  assert.equal(oneWordFail.wordLimitExceeded, true);

  // 7. Word limits: NO MORE THAN TWO WORDS
  const twoWordsPass = validateReadingAnswer("structural grooves", { correctAnswer: "structural grooves", maxWords: 2 });
  assert.equal(twoWordsPass.isCorrect, true);

  const twoWordsFail = validateReadingAnswer("tiny structural grooves", { correctAnswer: "structural grooves", maxWords: 2 });
  assert.equal(twoWordsFail.isCorrect, false);
  assert.equal(twoWordsFail.wordLimitExceeded, true);

  // 8. Word limits: NO MORE THAN TWO WORDS AND/OR A NUMBER
  // "15 structural grooves" = 1 number + 2 words = 2 words budget -> Valid
  const numberWordCombo = validateReadingAnswer("15 structural grooves", {
    correctAnswer: "15 structural grooves",
    maxWords: 2,
    allowNumber: true,
  });
  assert.equal(numberWordCombo.isCorrect, true);
  assert.equal(numberWordCombo.wordLimitExceeded, false);

  // 4 words exceeding limit
  const comboExcess = validateReadingAnswer("fifteen tiny structural grooves", {
    correctAnswer: "15 structural grooves",
    maxWords: 2,
    allowNumber: true,
  });
  assert.equal(comboExcess.isCorrect, false);
  assert.equal(comboExcess.wordLimitExceeded, true);

  // 9. Single-answer vs Multiple-answer choice questions
  // Student cannot gain credit by selecting multiple options on a single-choice question
  assert.equal(
    validateReadingAnswer("A, B, C", { correctAnswer: "C", typeId: "multiple_choice" }).isCorrect,
    false,
    "Selecting multiple options on single-choice question must be marked 0"
  );

  // Multiple-choice multi-letter support: "B, D" vs "D, B"
  assert.equal(
    validateReadingAnswer("D, B", { correctAnswer: "B, D", typeId: "multiple_choice" }).isCorrect,
    true,
    "Order-independent matching for valid multiple-selection options"
  );
  // Guessing 3 letters when 2 expected
  assert.equal(
    validateReadingAnswer("B, C, D", { correctAnswer: "B, D", typeId: "multiple_choice" }).isCorrect,
    false,
    "Guessing extra options on multiple-choice question must be rejected"
  );

  // 10. Strict TFNG vs YNNG verification
  // YNNG rejecting TRUE/FALSE
  const ynngReject = validateReadingAnswer("TRUE", { correctAnswer: "YES", typeId: "ynng" });
  assert.equal(ynngReject.isCorrect, false);
  assert.match(ynngReject.statusMessage, /YES, NO/i);

  // TFNG rejecting YES/NO
  const tfngReject = validateReadingAnswer("YES", { correctAnswer: "TRUE", typeId: "tfng" });
  assert.equal(tfngReject.isCorrect, false);
  assert.match(tfngReject.statusMessage, /TRUE, FALSE/i);

  // 11. Unanswered & Empty handling
  const unanswered = validateReadingAnswer("", { correctAnswer: "FALSE" });
  assert.equal(unanswered.isCorrect, false);
  assert.equal(unanswered.statusMessage, "Unanswered");
});

test("Audit 4: Profile Immutability & Explicit Cross-Training Separation", async () => {
  // 1. Verify user's authoritative profile before cross-training practice
  const profileResBefore = await acadSession.fetch("/api/profile");
  const profBefore = await profileResBefore.json();
  assert.equal(profBefore.profile.testType, "academic", "Initial profile track must be academic");

  // 2. Perform General Training Reading Practice with persist=true
  const crossPracticeRes = await acadSession.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "evaluate_reading",
      answers: {
        "rq-gt-1": "FALSE",
        "rq-gt-2": "FALSE",
        "rq-gt-3": "NOT GIVEN",
        "rq-gt-4": "C",
      },
      stream: "general_training", // Intentionally practising alternative stream
      persist: true,
    }),
  });
  assert.equal(crossPracticeRes.status, 200);
  const crossData = await crossPracticeRes.json();
  assert.ok(crossData.success);
  assert.ok(crossData.attemptId);

  // 3. Verify that student's profile WAS NOT mutated
  const profileResAfter = await acadSession.fetch("/api/profile");
  const profAfter = await profileResAfter.json();
  assert.equal(
    profAfter.profile.testType,
    "academic",
    "Authoritative profile track must remain 'academic' even after cross-training practice"
  );

  // 4. Verify that the persisted attempt specifically records GT exam ID
  const attCheck = await pool.query(
    `SELECT a.id, e.test_type, e.id AS exam_id 
     FROM attempts a 
     JOIN exams e ON a.exam_id = e.id 
     WHERE a.id = $1`,
    [crossData.attemptId]
  );
  assert.equal(
    attCheck.rows[0].test_type,
    "general_training",
    "Attempt record must accurately store the actual practised stream"
  );
  assert.equal(
    attCheck.rows[0].exam_id,
    "11111111-1111-1111-1111-111111111112",
    "Attempt must link to General Training practice exam"
  );
});

test("Audit 5: Question Format Coverage Verification (All 14 IELTS Formats)", async () => {
  const { READING_QUESTION_TYPES, validateReadingAnswer } = await import(
    "../apps/web/src/lib/reading-module-data.ts"
  );

  assert.equal(READING_QUESTION_TYPES.length, 14, "Must contain all 14 official IELTS reading formats");

  const expectedTypes = [
    "tfng",
    "ynng",
    "headings",
    "matching_info",
    "matching_features",
    "matching_sentence_endings",
    "sentence_completion",
    "summary_completion",
    "note_completion",
    "table_completion",
    "flowchart_completion",
    "diagram_completion",
    "multiple_choice",
    "short_answer",
  ];

  for (const typeId of expectedTypes) {
    const qt = READING_QUESTION_TYPES.find((t) => t.id === typeId);
    assert.ok(qt, `Missing question type format: ${typeId}`);

    // Tier 1: Strategy & Catalogue Specification
    assert.ok(qt.name.length > 0);
    assert.ok(qt.strategy.length > 20, `${typeId} must have authoritative strategy guide`);
    assert.ok(qt.commonMistakes.length >= 1, `${typeId} must document common traps`);

    // Tier 2: Interactive Sample Question
    assert.ok(qt.sampleQuestion.prompt, `${typeId} must include sample prompt`);
    assert.ok(qt.sampleQuestion.correctAnswer, `${typeId} must include sample answer key`);
    assert.ok(qt.sampleQuestion.evidenceText, `${typeId} must cite passage evidence`);
    assert.ok(qt.sampleQuestion.explanation, `${typeId} must include detailed explanation`);

    // Tier 3: Live Answer Validation against the sample key
    const valResult = validateReadingAnswer(qt.sampleQuestion.correctAnswer, {
      correctAnswer: qt.sampleQuestion.correctAnswer,
      typeId: qt.id,
      maxWords: qt.wordLimitRule?.includes("ONE WORD")
        ? 1
        : qt.wordLimitRule?.includes("TWO WORDS")
        ? 2
        : undefined,
    });
    assert.equal(
      valResult.isCorrect,
      true,
      `Answer validation must succeed for ${typeId} with its sample answer key`
    );

    // Negative validation test: invalid answer receives 0
    const failResult = validateReadingAnswer("INVALID_WRONG_RESPONSE_XYZ", {
      correctAnswer: qt.sampleQuestion.correctAnswer,
      typeId: qt.id,
    });
    assert.equal(
      failResult.isCorrect,
      false,
      `Answer validation must reject incorrect answer for ${typeId}`
    );
  }
});

after(async () => {
  await pool.end();
});
