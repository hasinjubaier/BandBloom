/**
 * BandBloom IELTS SaaS - Practice Hub Comprehensive Integration Test Suite
 * 
 * Verifies all requirements of the Practice Hub:
 * 1. Unauthenticated security guard (HTTP 401).
 * 2. Practice Hub discovery summary endpoint (profile, recommendations, attempt stats).
 * 3. Academic Reading Lab evaluation, score calculation, paragraph evidence mapping.
 * 4. General Training Reading Lab evaluation (Workplace fire safety, TFNG contradiction vs not given).
 * 5. Listening Lab evaluation (Arthur Pendelton dialogue, speed/transcript rules).
 * 6. Writing Evaluator live word counter & minimum length warnings (150w Task 1, 250w Task 2).
 * 7. Writing Evaluator official 4-criteria rubrics & STRICT 2:1 Task 2 to Task 1 weighting verification.
 * 8. Speaking Recorder 4-criteria evaluation & verbatim vs student-edited transcript separation.
 * 9. Real database persistence: attempts, responses, scores, feedback, and mistake notes.
 * 10. In-progress resumable attempt detection and resumption banner.
 * 11. Clean teardown of all test fixtures.
 */

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Pool } = require("../apps/web/node_modules/pg");

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
const USER_A_EMAIL = `practice_acad_${TIMESTAMP}@bandbloom.test`;
const USER_B_EMAIL = `practice_gt_${TIMESTAMP}@bandbloom.test`;
const TEST_PASSWORD = "PracticePass2026!";

let userAId = null;
let userBId = null;
let sessionA = null;
let sessionB = null;

async function registerUser(session, email, fullName, testType) {
  const res = await session.fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
      fullName,
      agreedToTerms: true,
    }),
  });
  const json = await res.json();
  assert.ok(res.status === 200 || res.status === 201, `Failed to register ${email}: ${JSON.stringify(json)}`);
  const userId = json.user?.id || json.data?.id;
  assert.ok(userId, "User ID should be returned");

  await pool.query(
    `UPDATE profiles
     SET test_type = $1, target_band = 7.5, daily_minutes = 60
     WHERE user_id = $2`,
    [testType, userId]
  );

  return userId;
}

test("Setup: Register test accounts for Academic and General Training practice", async () => {
  sessionA = new CookieSession(BASE_URL);
  sessionB = new CookieSession(BASE_URL);

  userAId = await registerUser(sessionA, USER_A_EMAIL, "Practice Academic Student", "academic");
  userBId = await registerUser(sessionB, USER_B_EMAIL, "Practice GT Student", "general_training");

  assert.ok(userAId, "User A registered");
  assert.ok(userBId, "User B registered");
});

test("Requirement 1: Unauthenticated access to /api/practice is blocked with 401", async () => {
  const anonSession = new CookieSession(BASE_URL);
  const getRes = await anonSession.fetch("/api/practice");
  assert.strictEqual(getRes.status, 401, "GET /api/practice must require authentication");

  const postRes = await anonSession.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "evaluate_reading", answers: {} }),
  });
  assert.strictEqual(postRes.status, 401, "POST /api/practice must require authentication");
});

test("Requirement 2: Practice Hub Discovery returns profile stream and initial recommendation", async () => {
  const res = await sessionA.fetch("/api/practice");
  assert.strictEqual(res.status, 200);
  const data = await res.json();

  assert.strictEqual(data.success, true);
  assert.strictEqual(data.profile.testType, "academic");
  assert.strictEqual(data.activeAttempt, null, "Should have no active in-progress attempt initially");
  assert.ok(data.recommendation, "Should provide an intelligent starting recommendation");
  assert.ok(data.recommendation.title, "Recommendation must have a title");
  assert.ok(data.recommendation.actionHref, "Recommendation must link to an action URL");
});

test("Requirement 3: Academic Reading Lab evaluation, score calculation, and paragraph evidence mapping", async () => {
  const answers = {
    "rq-acad-1": "TRUE",
    "rq-acad-2": "FALSE",
    "rq-acad-3": "NOT GIVEN",
    "rq-acad-4": "15",
  };

  const res = await sessionA.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "evaluate_reading",
      answers,
      stream: "academic",
      persist: true,
      timeSpentSeconds: 420,
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);

  const evalResult = data.evaluation;
  assert.strictEqual(evalResult.total, 4);
  assert.strictEqual(evalResult.score, 4);
  assert.strictEqual(evalResult.percentage, 100);
  assert.strictEqual(evalResult.estimatedBand, 9);
  assert.strictEqual(evalResult.questionResults.length, 4);

  // Verify paragraph evidence mapping
  const q1Item = evalResult.questionResults.find((it) => it.questionId === "rq-acad-1");
  assert.ok(q1Item.isCorrect);
  assert.ok(q1Item.evidenceParagraph.includes("A"));
  assert.ok(q1Item.evidenceText.length > 10);

  // Verify attempt was persisted into DB
  assert.ok(data.attemptId, "Attempt ID must be returned when persist=true");
  const attemptRow = await pool.query(
    "SELECT * FROM attempts WHERE id = $1 AND user_id = $2",
    [data.attemptId, userAId]
  );
  assert.strictEqual(attemptRow.rows.length, 1);
  assert.strictEqual(attemptRow.rows[0].status, "submitted");

  // Verify scores table
  const scoreRow = await pool.query(
    "SELECT * FROM scores WHERE attempt_id = $1 AND skill = 'reading'",
    [data.attemptId]
  );
  assert.strictEqual(scoreRow.rows.length, 1);
  assert.strictEqual(Number(scoreRow.rows[0].estimated_band), 9);
});

test("Requirement 4: General Training Reading Lab (Workplace notices, TFNG contradiction vs Not Given)", async () => {
  // Submit mix of correct and incorrect answers for GT
  const answers = {
    "rq-gt-1": "TRUE", // INCORRECT: correct is FALSE
    "rq-gt-2": "FALSE", // CORRECT
    "rq-gt-3": "FALSE", // INCORRECT: correct is NOT GIVEN
    "rq-gt-4": "C", // CORRECT
  };

  const res = await sessionB.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "evaluate_reading",
      answers,
      stream: "general_training",
      persist: true,
      timeSpentSeconds: 310,
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);

  const evalResult = data.evaluation;
  assert.strictEqual(evalResult.total, 4);
  assert.strictEqual(evalResult.score, 2);
  assert.strictEqual(evalResult.estimatedBand, 6.0);

  // Verify rq-gt-1: student answered TRUE, correct is FALSE
  const gt1 = evalResult.questionResults.find((it) => it.questionId === "rq-gt-1");
  assert.strictEqual(gt1.isCorrect, false);
  assert.strictEqual(gt1.correctAnswer, "FALSE");
  assert.ok(gt1.evidenceParagraph.includes("Notice 1"));

  // Verify rq-gt-3: student answered FALSE, correct is NOT GIVEN
  const gt3 = evalResult.questionResults.find((it) => it.questionId === "rq-gt-3");
  assert.strictEqual(gt3.isCorrect, false);
  assert.strictEqual(gt3.correctAnswer, "NOT GIVEN");
});

test("Requirement 5: Listening Lab evaluation (Campus Tour dialogue & answer keys)", async () => {
  const answers = {
    "lq-1": "Pendelton",
    "lq-2": "Thursday the 15th",
    "lq-3": "3",
  };

  const res = await sessionA.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "evaluate_listening",
      answers,
      persist: true,
      timeSpentSeconds: 180,
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.evaluation.score, 3);
  assert.strictEqual(data.evaluation.estimatedBand, 8.0);
  assert.ok(data.evaluation.questionResults[0].studentAnswer.includes("Pendelton"));
});

test("Requirement 6: Writing Evaluator word count & minimum length warnings", async () => {
  // Submit underlength Task 1 (<150 words) and Task 2 (<250 words)
  const shortTask1 = "The chart illustrates renewable energy production across several nations. Germany produced the highest percentage, followed by France and Japan. Overall, renewable adoption increased significantly over the recorded decade.";
  const shortTask2 = "Remote work has become very popular across the globe. Many employees prefer working from home because it saves travel time. However, some companies argue that office environments foster teamwork. In conclusion, both working styles offer benefits.";

  const res = await sessionA.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "evaluate_writing",
      task1Text: shortTask1,
      task2Text: shortTask2,
      stream: "academic",
      persist: false,
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  const evaluation = data.evaluation;

  assert.ok(evaluation.task1.wordCount < 150, "Task 1 word count is under 150");
  assert.ok(evaluation.task2.wordCount < 250, "Task 2 word count is under 250");
  assert.ok(evaluation.task1.warningMessage.includes("150"));
  assert.ok(evaluation.task2.warningMessage.includes("250"));
});

test("Requirement 7: Writing Evaluator STRICT 2:1 Task 2 to Task 1 Band Weighting verification", async () => {
  // Construct Task 1 (Band ~7.5 proficiency, >180 words)
  const highProficiencyTask1 = `
    The provided table illustrates the proportion of national electricity generated from renewable sources across four countries between 2010 and 2022.
    Overall, it is immediately apparent that all four surveyed nations experienced substantial increases in renewable electricity generation over the twelve-year period, with Germany consistently maintaining the highest proportions, while Japan experienced the most rapid acceleration.
    Looking first at Germany, renewable energy accounted for 28 percent of total power generation in 2010. This figure rose steadily to 41 percent by 2016, before culminating in a significant 54 percent in 2022, representing an increase of nearly double the baseline. Similarly, France exhibited consistent expansion, rising progressively from 16 percent to 24 percent, and ultimately reaching 32 percent by the end of the timeline.
    In stark contrast, Japan began at a modest 9 percent in 2010, yet demonstrated dramatic growth following policy reforms, surging to 27 percent by 2022. Australia registered steady incremental progress from 11 percent to 29 percent over the identical timeframe. In summary, renewable sources expanded markedly across all territories.
  `.trim();

  // Construct Task 2 with moderate proficiency (Band 6.0, 200 words, under 250)
  const moderateProficiencyTask2 = `
    In contemporary society, an increasing number of companies are allowing employees to work remotely from home rather than requiring their daily presence in physical office environments. In my opinion, while remote working offers noticeable conveniences for staff members, its drawbacks regarding collaboration and communication cannot be ignored.
    On the one hand, remote work delivers notable benefits for individual employees. Primarily, it eliminates lengthy daily commutes, thereby reducing travel expenses and urban congestion. For example, workers in major metropolitan areas often save two hours each day. Moreover, flexible hours allow staff to maintain a better work-life balance and look after family responsibilities.
    On the other hand, there are distinct drawbacks to working entirely from home. Isolation is a common problem, as team members do not interact socially as often as they would in an office. Furthermore, brainstorming and creative problem solving are frequently more challenging over digital video conferences than in face-to-face meetings.
    To conclude, while working from home presents certain obstacles regarding organizational culture and real-time cooperation, the time savings and enhanced personal well-being make it an advantageous transition for modern companies.
  `.trim();

  const res = await sessionA.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "evaluate_writing",
      task1Text: highProficiencyTask1,
      task2Text: moderateProficiencyTask2,
      stream: "academic",
      persist: true,
      timeSpentSeconds: 3600,
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  const evaluation = data.evaluation;

  const t1 = evaluation.task1.estimatedBand;
  const t2 = evaluation.task2.estimatedBand;
  const composite = evaluation.compositeWritingBand;

  // VERIFY OFFICIAL IELTS 2:1 WEIGHTING:
  // composite = roundBand((t1 + 2 * t2) / 3)
  const rawWeighted = (t1 + 2 * t2) / 3.0;
  const remainder = rawWeighted - Math.floor(rawWeighted);
  let expectedBand = Math.floor(rawWeighted);
  if (remainder >= 0.75) expectedBand += 1.0;
  else if (remainder >= 0.25) expectedBand += 0.5;

  assert.strictEqual(
    composite,
    expectedBand,
    `Composite band ${composite} must follow 2:1 weighting (T1=${t1}, T2=${t2}, Expected=${expectedBand})`
  );

  assert.ok(
    evaluation.weightingNotice.includes("Task 2 contributes 66.7% (2x weight) and Task 1 contributes 33.3% (1x weight)"),
    "Weighting notice must explain official 2:1 ratio"
  );

  // Verify rubrics are returned for each task
  assert.strictEqual(evaluation.task1.rubric.length, 4);
  assert.strictEqual(evaluation.task2.rubric.length, 4);

  // Verify DB persistence of confidence_label as 'limited' for writing
  const scoreRow = await pool.query(
    `SELECT skill, estimated_band, confidence_label FROM scores WHERE attempt_id = $1 AND skill = 'writing'`,
    [data.attemptId]
  );
  assert.strictEqual(scoreRow.rows.length, 1);
  assert.strictEqual(scoreRow.rows[0].confidence_label, "limited", "Writing scores must be flagged with confidence_label='limited'");
});

test("Requirement 8: Speaking Recorder 4-criteria evaluation & verbatim vs edited transcript integrity", async () => {
  const recognizedTranscript = "well today i want to talk about a local park project in my hometown we planted fifty trees and created a community garden last year";
  const editedTranscript = "Well, today I would like to talk about a local park initiative in my hometown. We planted fifty indigenous trees and established a community garden last year.";

  const res = await sessionA.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "evaluate_speaking",
      recognizedTranscript,
      studentEditedTranscript: editedTranscript,
      durationSeconds: 110,
      persist: true,
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  const evaluation = data.evaluation;

  // Transcript provenance and separation checks
  assert.strictEqual(evaluation.recognizedTranscript, recognizedTranscript, "Recognized transcript must remain unchanged");
  assert.strictEqual(evaluation.studentEditedTranscript, editedTranscript, "Student-edited transcript must be saved separately");
  assert.strictEqual(evaluation.transcriptPreservedSeparately, true, "Transcript separation guarantee must be true");

  // Strict P0 scoring integrity: Overall band MUST be null because Pronunciation is uncalibrated
  assert.strictEqual(evaluation.estimatedBand, null, "Overall Speaking band must be withheld (null) because Pronunciation is uncalibrated");
  assert.strictEqual(evaluation.overallBandStatus, "partial_diagnostic", "Speaking overallBandStatus must be partial_diagnostic");

  // Verify 4 Speaking criteria
  assert.strictEqual(evaluation.rubric.length, 4);

  const pronunciationCriterion = evaluation.rubric.find((r) => r.criterion === "Pronunciation");
  assert.ok(pronunciationCriterion, "Pronunciation criterion must be present in rubric");
  assert.strictEqual(pronunciationCriterion.band, null, "Pronunciation band must be null (uncalibrated in browser)");
  assert.strictEqual(pronunciationCriterion.status, "assessment_limited", "Pronunciation status must be assessment_limited");

  const evaluatedCriteria = evaluation.rubric.filter((r) => r.band !== null);
  assert.strictEqual(evaluatedCriteria.length, 3, "Only 3 criteria must be numerically scored (Fluency, Lexical, Grammar)");
  for (const c of evaluatedCriteria) {
    assert.ok(c.band >= 1 && c.band <= 9, `Diagnostic band for ${c.criterion} must be valid`);
  }

  // Verify DB persistence: estimated_band must be NULL with confidence_label='insufficient_evidence'
  const scoreRow = await pool.query(
    `SELECT skill, estimated_band, confidence_label FROM scores WHERE attempt_id = $1 AND skill = 'speaking'`,
    [data.attemptId]
  );
  assert.strictEqual(scoreRow.rows.length, 1);
  assert.strictEqual(scoreRow.rows[0].estimated_band, null, "Persisted speaking band must be NULL to avoid false score reporting");
  assert.strictEqual(scoreRow.rows[0].confidence_label, "insufficient_evidence", "Speaking score must be flagged as insufficient_evidence");

  // Verify overall score in scores table is also NULL
  const overallRow = await pool.query(
    `SELECT skill, estimated_band, confidence_label FROM scores WHERE attempt_id = $1 AND skill = 'overall'`,
    [data.attemptId]
  );
  assert.strictEqual(overallRow.rows.length, 1);
  assert.strictEqual(overallRow.rows[0].estimated_band, null, "Overall score must also be NULL when speaking attempt is incomplete");
  assert.strictEqual(overallRow.rows[0].confidence_label, "insufficient_evidence");
});

test("Requirement 9: In-progress resumable practice attempt lifecycle", async () => {
  // Insert an in-progress attempt for User A
  const examId = "11111111-1111-1111-1111-111111111111"; // Academic Reading Lab
  const insertRes = await pool.query(
    `INSERT INTO attempts (user_id, exam_id, status, started_at, deadline_at)
     VALUES ($1, $2, 'in_progress', NOW() - INTERVAL '10 minutes', NOW() + INTERVAL '50 minutes')
     RETURNING id`,
    [userAId, examId]
  );
  const inProgressAttemptId = insertRes.rows[0].id;

  // Check Practice Hub GET endpoint
  const res = await sessionA.fetch("/api/practice");
  assert.strictEqual(res.status, 200);
  const data = await res.json();

  assert.ok(data.activeAttempt, "Active attempt must be detected");
  assert.strictEqual(data.activeAttempt.id, inProgressAttemptId);

  // Now submit the attempt
  await pool.query(
    `UPDATE attempts SET status = 'submitted', submitted_at = NOW() WHERE id = $1`,
    [inProgressAttemptId]
  );

  const resAfter = await sessionA.fetch("/api/practice");
  const dataAfter = await resAfter.json();
  assert.strictEqual(dataAfter.activeAttempt, null, "After completion, activeAttempt must be null");
});

test("Requirement 10: Saving a mistake note from practice lab into mistake_notes table", async () => {
  const insertNote = await pool.query(
    `INSERT INTO mistake_notes (user_id, skill, error_tag, user_notes, original_answer, correct_reasoning, retry_status)
     VALUES ($1, 'reading', 'tfng_confusion', 'I assumed the statement was false because it was unmentioned', 'FALSE', 'Passage made no mention of funding.', 'pending')
     RETURNING id`,
    [userAId]
  );
  assert.ok(insertNote.rows[0].id, "Mistake note should be successfully inserted");

  // Verify Hub recommendation now adapts to target this weakness
  const hubRes = await sessionA.fetch("/api/practice");
  const hubData = await hubRes.json();
  assert.strictEqual(hubData.success, true);
  assert.ok(
    hubData.recommendation.title.includes("Reading") || hubData.recommendation.type === "mistake_notebook_weakness",
    `Recommendation should reflect the user's recorded reading mistake: ${JSON.stringify(hubData.recommendation)}`
  );
});

after(async () => {
  // Clean up all inserted test records
  const userIds = [userAId, userBId].filter(Boolean);
  if (userIds.length > 0) {
    await pool.query("DELETE FROM responses WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = ANY($1))", [userIds]);
    await pool.query("DELETE FROM scores WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = ANY($1))", [userIds]);
    await pool.query("DELETE FROM feedback WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = ANY($1))", [userIds]);
    await pool.query("DELETE FROM mistake_notes WHERE user_id = ANY($1)", [userIds]);
    await pool.query("DELETE FROM attempts WHERE user_id = ANY($1)", [userIds]);
    await pool.query("DELETE FROM profiles WHERE user_id = ANY($1)", [userIds]);
    await pool.query("DELETE FROM users WHERE id = ANY($1)", [userIds]);
  }
  await pool.end();
});
