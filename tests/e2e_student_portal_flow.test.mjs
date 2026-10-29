/**
 * BandBloom IELTS SaaS - Real End-to-End (E2E) Student Portal Integration Suite
 * 
 * Verifies all 15 End-to-End requirements against the live Next.js server at http://localhost:3000:
 * 1. Register a dedicated test account.
 * 2. Log in with valid credentials and establish real session cookie.
 * 3. Open the Dashboard and verify live metrics aggregation.
 * 4. Read the authenticated student profile.
 * 5. Update and persist a study task (toggle completion).
 * 6. Add a custom vocabulary item and verify persistence across reloads.
 * 7. Add a mistake notebook entry and verify persistence across reloads.
 * 8. Start a mock test and save an answer.
 * 9. Refresh the exam page and verify saved answers are reconstituted.
 * 10. Verify server-side deadline enforcement and 'abandoned' state persistence.
 * 11. Submit the mock test and verify its persisted state and score.
 * 12. Confirm missing or unevaluated scores are not fabricated.
 * 13. Log out and verify the session is revoked.
 * 14. Confirm protected APIs reject the revoked session with HTTP 401.
 * 15. Confirm cross-student tenant data isolation (Student A vs Student B).
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

    for (const c of rawCookies) {
      if (!c) continue;
      const [nameVal] = c.split(";");
      const [name, ...valParts] = nameVal.split("=");
      const val = valParts.join("=");
      if (!val || c.includes("Max-Age=0") || c.includes("expires=Thu, 01 Jan 1970")) {
        this.cookies.delete(name.trim());
      } else {
        this.cookies.set(name.trim(), val.trim());
      }
    }

    return res;
  }
}

const studentSessionA = new CookieSession(BASE_URL);
const studentSessionB = new CookieSession(BASE_URL);

const emailA = `e2e_student_a_${Date.now()}@bandbloom.test`;
const emailB = `e2e_student_b_${Date.now()}@bandbloom.test`;
const passwordA = "E2ESecurePassword2026!";
const passwordB = "E2ESecurePassword2026!";

let userAId = null;
let userBId = null;
let attemptAId = null;
let testExamId = null;
let savedTaskId = null;
let lastSessionCookieA = null;

test("E2E Step 1: Register Student A Account", async () => {
  const res = await studentSessionA.fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "E2E Student Alpha",
      email: emailA,
      password: passwordA,
      confirmPassword: passwordA,
      agreedToTerms: true,
    }),
  });

  const data = await res.json();
  assert.ok(res.status === 200 || res.status === 201, "Registration should return 200 or 201");
  assert.strictEqual(data.success, true);
  assert.ok(data.user?.id, "User ID must be returned");
  userAId = data.user.id;
});

test("E2E Step 2: Log in with Valid Credentials and Receive Session Cookie", async () => {
  const res = await studentSessionA.fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailA,
      password: passwordA,
    }),
  });

  assert.strictEqual(res.status, 200, "Login should return 200 OK");
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.user.email, emailA);

  const sessionCookie = studentSessionA.cookies.get("bandbloom_session");
  assert.ok(sessionCookie, "bandbloom_session cookie must be established");
  assert.strictEqual(sessionCookie.length, 64, "Session token must be 64-character hex");
  lastSessionCookieA = sessionCookie;
});

test("E2E Step 3: Open Authenticated Dashboard", async () => {
  const res = await studentSessionA.fetch("/api/dashboard");
  assert.strictEqual(res.status, 200, "Dashboard API should return 200 OK");
  const data = await res.json();
  assert.strictEqual(data.success, true);
  const summary = data.data || data;
  assert.strictEqual(summary.student.email, emailA);
  assert.strictEqual(Number(summary.student.targetBand), 7.5);
  assert.strictEqual(summary.overview.completedExamsCount, 0);
  assert.strictEqual(summary.overview.studyStreakDays, 0);
});

test("E2E Step 4: Read Authenticated Profile", async () => {
  const res = await studentSessionA.fetch("/api/profile");
  assert.strictEqual(res.status, 200, "Profile API should return 200 OK");
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.profile.fullName, "E2E Student Alpha");
  assert.strictEqual(data.profile.testType, "academic");
});

test("E2E Step 5: Update and Persist Study Plan Task", async () => {
  // 1. Fetch current study plan
  const planRes = await studentSessionA.fetch("/api/study-plan");
  assert.strictEqual(planRes.status, 200);
  const planData = await planRes.json();
  assert.strictEqual(planData.success, true);
  assert.ok(planData.plan.tasks.length > 0, "Plan should contain tasks");

  savedTaskId = planData.plan.tasks[0].id;

  // 2. Toggle task completion to true
  const patchRes = await studentSessionA.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: savedTaskId, completed: true }),
  });
  assert.strictEqual(patchRes.status, 200);
  const patchData = await patchRes.json();
  assert.strictEqual(patchData.success, true);

  // 3. Re-fetch study plan to verify persistence
  const verifyRes = await studentSessionA.fetch("/api/study-plan");
  const verifyData = await verifyRes.json();
  const updatedTask = verifyData.plan.tasks.find((t) => t.id === savedTaskId);
  assert.ok(updatedTask, "Task must exist");
  assert.strictEqual(updatedTask.completed, true, "Task completion must persist");
});

test("E2E Step 6: Add Custom Vocabulary Item and Verify Persistence", async () => {
  const newWord = `Corroborate_${Date.now()}`;
  const addRes = await studentSessionA.fetch("/api/vocabulary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      word: newWord,
      partOfSpeech: "verb",
      bandLevel: "Band 8.0+",
      meaning: "To confirm or give support to a statement or finding",
      collocation: "corroborate findings",
      exampleSentence: "Subsequent telemetry corroborated the initial hypothesis.",
    }),
  });
  assert.strictEqual(addRes.status, 200);
  const addData = await addRes.json();
  assert.strictEqual(addData.success, true);

  // Re-fetch vocabulary to verify persistence
  const listRes = await studentSessionA.fetch("/api/vocabulary");
  assert.strictEqual(listRes.status, 200);
  const listData = await listRes.json();
  const found = listData.vocabulary.find((v) => v.word.toLowerCase() === newWord.toLowerCase());
  assert.ok(found, "Added word must appear in vocabulary bank");
  assert.strictEqual(found.mastery, "learning");
});

test("E2E Step 7: Add Mistake Notebook Entry and Verify Persistence", async () => {
  const addRes = await studentSessionA.fetch("/api/notebook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill: "reading",
      errorTag: "tfng_unwarranted_assumption",
      questionPrompt: "Did the text confirm the bays were flooded?",
      studentAnswer: "True",
      reasoning: "Passage only stated water levels rose; did not state bays flooded. Correct answer: Not Given.",
    }),
  });
  assert.strictEqual(addRes.status, 200);
  const addData = await addRes.json();
  assert.strictEqual(addData.success, true);
  assert.ok(addData.note?.id);

  // Re-fetch mistake notes to verify persistence
  const listRes = await studentSessionA.fetch("/api/notebook?skill=reading");
  assert.strictEqual(listRes.status, 200);
  const listData = await listRes.json();
  const found = listData.mistakes.find((m) => m.id === addData.note.id);
  assert.ok(found, "Added mistake note must persist and be retrievable");
  assert.strictEqual(found.retryStatus, "pending");
});

test("E2E Step 8: Start Mock Test and Save Answer", async () => {
  // Find published exam
  const examQuery = await pool.query(
    `SELECT id FROM exams WHERE status IN ('active', 'published') LIMIT 1`
  );
  assert.ok(examQuery.rows.length > 0, "Published exam must exist");
  testExamId = examQuery.rows[0].id;

  // 1. Start attempt
  const startRes = await studentSessionA.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examId: testExamId }),
  });
  assert.strictEqual(startRes.status, 200);
  const startData = await startRes.json();
  assert.strictEqual(startData.success, true);
  assert.ok(startData.attemptId);
  attemptAId = startData.attemptId;

  // 2. Fetch attempt details to get question IDs
  const attemptDetailRes = await studentSessionA.fetch(`/api/attempts/${attemptAId}`);
  assert.strictEqual(attemptDetailRes.status, 200);
  const attemptDetail = await attemptDetailRes.json();

  let targetQuestionId = null;
  if (attemptDetail.exam?.sections?.[0]?.questions?.[0]) {
    targetQuestionId = attemptDetail.exam.sections[0].questions[0].id;
  } else {
    // Lookup question from database if exam sections are empty
    const qQuery = await pool.query(`SELECT id FROM questions LIMIT 1`);
    targetQuestionId = qQuery.rows[0].id;
  }

  // 3. Save response
  const saveRes = await studentSessionA.fetch(`/api/attempts/${attemptAId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionId: targetQuestionId,
      responseJson: { answer: "Option B: Cohesive Paragraphing" },
    }),
  });
  assert.strictEqual(saveRes.status, 200);
  const saveData = await saveRes.json();
  assert.strictEqual(saveData.success, true);
});

test("E2E Step 9: Refresh Exam Page and Verify Saved Answer Restoration", async () => {
  const getRes = await studentSessionA.fetch(`/api/attempts/${attemptAId}`);
  assert.strictEqual(getRes.status, 200);
  const data = await getRes.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.attempt.status, "in_progress");

  // Verify responses object is populated
  const responseKeys = Object.keys(data.responses || {});
  assert.ok(responseKeys.length > 0, "Saved response must be reconstituted in responses map");
});

test("E2E Step 10: Server-Side Deadline Enforcement and Abandoned State Persistence", async () => {
  // Create a second exam for the expired attempt test to respect the One-Active-Attempt invariant
  const secondExam = await pool.query(
    `INSERT INTO exams (title, test_type, status)
     VALUES ('E2E Expired Test Exam', 'academic', 'active')
     RETURNING id`
  );
  const secondExamId = secondExam.rows[0].id;

  const expiredRes = await pool.query(
    `INSERT INTO attempts (user_id, exam_id, status, started_at, deadline_at)
     VALUES ($1, $2, 'in_progress', clock_timestamp() - interval '90 minutes', clock_timestamp() - interval '30 minutes')
     RETURNING id`,
    [userAId, secondExamId]
  );
  const expiredAttemptId = expiredRes.rows[0].id;

  // Attempt to submit expired attempt
  const submitExpiredRes = await studentSessionA.fetch(`/api/attempts/${expiredAttemptId}`, {
    method: "POST",
  });

  assert.strictEqual(submitExpiredRes.status, 400, "Expired attempt submission must be rejected with 400");
  const errData = await submitExpiredRes.json();
  assert.strictEqual(errData.success, false);
  assert.ok(errData.error.includes("expired"));

  // Verify DB state: attempt status MUST be 'abandoned' permanently
  const dbCheck = await pool.query(`SELECT status FROM attempts WHERE id = $1`, [expiredAttemptId]);
  assert.strictEqual(dbCheck.rows[0].status, "abandoned", "Expired attempt must persist as abandoned in database");
});

test("E2E Step 11 & 12: Submit Valid Mock Test and Verify Score Integrity", async () => {
  // Submit the active in_progress attempt
  const submitRes = await studentSessionA.fetch(`/api/attempts/${attemptAId}`, {
    method: "POST",
  });
  assert.strictEqual(submitRes.status, 200);
  const submitData = await submitRes.json();
  assert.strictEqual(submitData.success, true);
  assert.ok(submitData.results?.overallBand);

  // Fetch attempt results
  const resultRes = await studentSessionA.fetch(`/api/attempts/${attemptAId}`);
  assert.strictEqual(resultRes.status, 200);
  const resultData = await resultRes.json();
  assert.strictEqual(resultData.attempt.status, "submitted");
  assert.strictEqual(Number(resultData.scores.overall), submitData.results.overallBand);

  // Test that an uncompleted/unevaluated attempt does NOT fabricate scores
  const pendingAttemptRes = await pool.query(
    `INSERT INTO attempts (user_id, exam_id, status, started_at, deadline_at)
     VALUES ($1, $2, 'in_progress', clock_timestamp(), clock_timestamp() + interval '60 minutes')
     RETURNING id`,
    [userAId, testExamId]
  );
  const pendingId = pendingAttemptRes.rows[0].id;

  const pendingFetch = await studentSessionA.fetch(`/api/attempts/${pendingId}`);
  const pendingData = await pendingFetch.json();
  assert.strictEqual(pendingData.scores.overall, null, "Unevaluated attempt overall score must be null (not fabricated)");
  assert.strictEqual(pendingData.scores.reading, null, "Unevaluated attempt reading score must be null");
});

test("E2E Step 13 & 14: Logout and Verify Session Invalidation across Protected APIs", async () => {
  // 1. Perform Logout
  const logoutRes = await studentSessionA.fetch("/api/auth/logout", {
    method: "POST",
  });
  assert.strictEqual(logoutRes.status, 200);

  // 2. Verify protected endpoints reject the session with 401
  const dashRes = await studentSessionA.fetch("/api/dashboard");
  assert.strictEqual(dashRes.status, 401, "Dashboard must reject unauthenticated request with 401");

  const profRes = await studentSessionA.fetch("/api/profile");
  assert.strictEqual(profRes.status, 401, "Profile must reject unauthenticated request with 401");

  // 3. Verify passing the previous session cookie manually is also rejected
  const replayRes = await fetch(`${BASE_URL}/api/dashboard`, {
    headers: { Cookie: `bandbloom_session=${lastSessionCookieA}` },
  });
  assert.strictEqual(replayRes.status, 401, "Invalidated session token replay must be rejected with 401");
});

test("E2E Step 15: Cross-Student Tenant Isolation (Student B cannot access Student A's data)", async () => {
  // 1. Register Student B
  const regB = await studentSessionB.fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "E2E Student Beta",
      email: emailB,
      password: passwordB,
      confirmPassword: passwordB,
      agreedToTerms: true,
    }),
  });
  assert.ok(regB.status === 200 || regB.status === 201);
  const dataB = await regB.json();
  userBId = dataB.user.id;

  // 2. Login Student B
  const loginB = await studentSessionB.fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailB, password: passwordB }),
  });
  assert.strictEqual(loginB.status, 200);

  // 3. Student B attempts to access Student A's exam attempt
  const crossAttemptRes = await studentSessionB.fetch(`/api/attempts/${attemptAId}`);
  assert.strictEqual(crossAttemptRes.status, 404, "Student B must receive 404/denial when attempting to view Student A's attempt");

  // 4. Student B attempts to submit or modify Student A's exam attempt
  const crossSubmitRes = await studentSessionB.fetch(`/api/attempts/${attemptAId}`, {
    method: "POST",
  });
  assert.ok(
    crossSubmitRes.status === 400 || crossSubmitRes.status === 404 || crossSubmitRes.status === 500,
    "Student B cross-submission must be rejected"
  );

  // 5. Student B's mistake notes MUST NOT contain Student A's mistake notes
  const mistakesBRes = await studentSessionB.fetch("/api/notebook");
  assert.strictEqual(mistakesBRes.status, 200);
  const mistakesBData = await mistakesBRes.json();
  assert.strictEqual(mistakesBData.mistakes.length, 0, "Student B notebook must be isolated and empty");
});

// Clean Teardown
after(async () => {
  const usersToClean = [userAId, userBId].filter(Boolean);
  for (const uid of usersToClean) {
    try {
      await pool.query(`DELETE FROM mistake_notes WHERE user_id = $1`, [uid]);
      await pool.query(`DELETE FROM user_vocabulary_progress WHERE user_id = $1`, [uid]);
      await pool.query(`DELETE FROM study_plans WHERE user_id = $1`, [uid]);
      await pool.query(`DELETE FROM scores WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = $1)`, [uid]);
      await pool.query(`DELETE FROM responses WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = $1)`, [uid]);
      await pool.query(`DELETE FROM attempts WHERE user_id = $1`, [uid]);
      await pool.query(`DELETE FROM auth_tokens WHERE user_id = $1`, [uid]);
      await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [uid]);
      await pool.query(`DELETE FROM consents WHERE user_id = $1`, [uid]);
      await pool.query(`DELETE FROM profiles WHERE user_id = $1`, [uid]);
      await pool.query(`DELETE FROM users WHERE id = $1`, [uid]);
    } catch (err) {
      console.warn("Teardown warning:", err.message);
    }
  }
  await pool.end();
});
