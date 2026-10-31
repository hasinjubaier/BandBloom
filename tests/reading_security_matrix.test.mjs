/**
 * BandBloom IELTS SaaS - Reading Module Security Matrix & Residual Defect Verification Suite
 * 
 * Tests:
 * 1. Server-Side Assessment Type Enforcement & Bypass Vectors (omitted, unknown, spoofed diagnostic, stream conflict, 404)
 * 2. Full Mock Content Eligibility Engine (40 distinct, duplicates check, allocated marks, module stream, answer keys)
 * 3. Pre-Submission Answer-Key Security (GET /api/exams/[id] and active GET /api/attempts/[id] payload sanitization)
 * 4. Cross-Student Tenant Isolation & Attempt Ownership
 * 5. Diagnostic Result Propagation & Null Band Score Integrity
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
const USER_A_EMAIL = `sec_user_a_${TIMESTAMP}@bandbloom.test`;
const USER_B_EMAIL = `sec_user_b_${TIMESTAMP}@bandbloom.test`;
const SEC_PASSWORD = "SecReadingPass2026!";

let userAId = null;
let userBId = null;
let sessionA = null;
let sessionB = null;

async function registerTestUser(session, email, fullName, testType) {
  const res = await session.fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: SEC_PASSWORD,
      confirmPassword: SEC_PASSWORD,
      fullName,
      agreedToTerms: true,
      targetBand: 7.5,
      testType,
    }),
  });
  const data = await res.json();
  assert.ok(res.status === 200 || res.status === 201, `Failed to register user: ${email}`);
  return data.user.id;
}

test("Setup: Register Candidates A & B for Security Matrix Testing", async () => {
  sessionA = new CookieSession(BASE_URL);
  sessionB = new CookieSession(BASE_URL);

  userAId = await registerTestUser(sessionA, USER_A_EMAIL, "Security Candidate A", "academic");
  userBId = await registerTestUser(sessionB, USER_B_EMAIL, "Security Candidate B", "academic");

  assert.ok(userAId);
  assert.ok(userBId);
});

test("Vector 1: Reject attempt when assessmentType is omitted on incomplete DB full mock", async () => {
  const acadFullMockId = "99999999-9999-9999-9999-999999999991";
  const res = await sessionA.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: acadFullMockId,
    }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.error, /requires strictly 40.*questions/i);
});

test("Vector 2: Reject unknown or invalid assessmentType string", async () => {
  const practiceLabId = "11111111-1111-1111-1111-111111111111";
  const res = await sessionA.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: practiceLabId,
      assessmentType: "unauthorized_arbitrary_type",
    }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.error, /Invalid assessment type/i);
});

test("Vector 3: Reject client sending 'diagnostic' on DB exam configured as full mock", async () => {
  const acadFullMockId = "99999999-9999-9999-9999-999999999991";
  const res = await sessionA.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: acadFullMockId,
      assessmentType: "diagnostic",
    }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.error, /Cannot start a full mock exam as a diagnostic attempt/i);
});

test("Vector 4: Reject client supplying conflicting test stream metadata", async () => {
  const acadPracticeLabId = "11111111-1111-1111-1111-111111111111"; // Academic
  const res = await sessionA.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: acadPracticeLabId,
      assessmentType: "sectional_practice",
      stream: "general_training", // conflicting!
    }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.error, /Test stream mismatch/i);
});

test("Vector 5: Return 404 for non-existent examId", async () => {
  const bogusExamId = "00000000-0000-0000-0000-000000000000";
  const res = await sessionA.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: bogusExamId,
      assessmentType: "sectional_practice",
    }),
  });

  assert.equal(res.status, 404);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.error, /not found/i);
});

test("Vector 6: Reject client requesting 'full_mock' on sectional practice exam", async () => {
  const acadPracticeLabId = "11111111-1111-1111-1111-111111111111";
  const res = await sessionA.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: acadPracticeLabId,
      assessmentType: "full_mock",
    }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.error, /Cannot start a sectional or diagnostic practice exam as a full mock/i);
});

test("Pre-Submission Answer-Key Security: GET /api/exams/[id] payload sanitization", async () => {
  const practiceLabId = "11111111-1111-1111-1111-111111111111";
  const res = await sessionA.fetch(`/api/exams/${practiceLabId}`);
  assert.equal(res.status, 200);
  const rawBody = await res.text();

  // Pre-submission payload must NEVER contain is_correct, explanation, or correctAnswer
  assert.ok(!rawBody.includes('"is_correct"'), "Payload must not expose is_correct");
  assert.ok(!rawBody.includes('"isCorrect"'), "Payload must not expose isCorrect");
  assert.ok(!rawBody.includes('"correctAnswer"'), "Payload must not expose correctAnswer");
  assert.ok(!rawBody.includes('"acceptedVariants"'), "Payload must not expose acceptedVariants");

  const data = JSON.parse(rawBody);
  for (const sec of data.exam.sections) {
    for (const q of sec.questions) {
      assert.equal(q.explanation, undefined);
      assert.equal(q.correctAnswer, undefined);
      if (q.options) {
        for (const opt of q.options) {
          assert.equal(opt.isCorrect, undefined);
          assert.equal(opt.is_correct, undefined);
        }
      }
    }
  }
});

test("Pre-Submission Answer-Key Security & Tenant Isolation: GET /api/attempts/[id]", async () => {
  const practiceLabId = "11111111-1111-1111-1111-111111111111";

  // Start in-progress attempt for User A
  const startRes = await sessionA.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: practiceLabId,
      assessmentType: "sectional_practice",
    }),
  });
  assert.equal(startRes.status, 200);
  const startData = await startRes.json();
  const attemptId = startData.attemptId;
  assert.ok(attemptId);

  // 1. Fetch active attempt as User A
  const getRes = await sessionA.fetch(`/api/attempts/${attemptId}`);
  assert.equal(getRes.status, 200);
  const rawBody = await getRes.text();

  assert.ok(!rawBody.includes('"is_correct"'), "Active attempt payload must not expose is_correct");
  assert.ok(!rawBody.includes('"isCorrect"'), "Active attempt payload must not expose isCorrect");
  assert.ok(!rawBody.includes('"correctAnswer"'), "Active attempt payload must not expose correctAnswer");

  const data = JSON.parse(rawBody);
  assert.equal(data.attempt.status, "in_progress");
  assert.equal(data.scores.overall, null, "In-progress attempt scores must be strictly null");
  assert.equal(data.scores.reading, null, "In-progress attempt reading score must be strictly null");

  // 2. Tenant Isolation: User B tries to fetch User A's attempt
  const crossUserGet = await sessionB.fetch(`/api/attempts/${attemptId}`);
  assert.equal(crossUserGet.status, 404, "Student B must not be able to view Student A attempt (404)");

  // 3. Tenant Isolation: User B tries to save answer on User A's attempt
  const crossUserPatch = await sessionB.fetch(`/api/attempts/${attemptId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionId: data.exam.sections[0].questions[0].id,
      responseJson: { answer: "HACK" },
    }),
  });
  assert.equal(crossUserPatch.status, 400, "Student B must not be able to modify Student A attempt (400)");

  // 4. Tenant Isolation: User B tries to submit User A's attempt
  const crossUserPost = await sessionB.fetch(`/api/attempts/${attemptId}`, {
    method: "POST",
  });
  assert.equal(crossUserPost.status, 400, "Student B must not be able to submit Student A attempt (400)");
});

test("Diagnostic Result Propagation & Null Score Preservation", async () => {
  // Complete a diagnostic submission via POST /api/practice
  const answers = {
    "rq-acad-1": "TRUE",
    "rq-acad-2": "FALSE",
    "rq-acad-3": "NOT GIVEN",
    "rq-acad-4": "15",
  };

  const evalRes = await sessionA.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "evaluate_reading",
      answers,
      stream: "academic",
      assessmentType: "diagnostic",
      persist: true,
    }),
  });

  assert.equal(evalRes.status, 200);
  const evalData = await evalRes.json();
  assert.ok(evalData.success);
  assert.equal(evalData.evaluation.assessmentType, "diagnostic");
  assert.equal(evalData.evaluation.estimatedBand, null, "Diagnostic must strictly yield estimatedBand: null");
  assert.equal(evalData.evaluation.confidenceLabel, "insufficient_evidence");
  assert.equal(evalData.evaluation.score, 4);
  assert.equal(evalData.evaluation.maxScore, 4);
  assert.equal(evalData.evaluation.accuracy, 100);

  const diagAttemptId = evalData.attemptId;
  assert.ok(diagAttemptId);

  // Verify GET /api/attempts returns diagnostic metadata with null band
  const attemptsRes = await sessionA.fetch("/api/attempts");
  assert.equal(attemptsRes.status, 200);
  const attemptsData = await attemptsRes.json();
  const matched = attemptsData.attempts.find((a) => a.id === diagAttemptId);
  assert.ok(matched);
  assert.equal(matched.assessmentType, "diagnostic");
  assert.equal(matched.readingScore, null, "Reading estimated band must remain null in summary");
  assert.equal(matched.overallBand, null, "Overall estimated band must remain null in summary");
  assert.equal(matched.rawScore, 4);
  assert.equal(matched.maxScore, 4);
  assert.equal(matched.accuracy, 100);

  // Verify GET /api/attempts/[id] returns diagnostic metadata without 0 conversion
  const detailRes = await sessionA.fetch(`/api/attempts/${diagAttemptId}`);
  assert.equal(detailRes.status, 200);
  const detailData = await detailRes.json();
  assert.equal(detailData.attempt.assessmentType, "diagnostic");
  assert.equal(detailData.scores.overall, null, "Scores overall must not be converted to 0");
  assert.equal(detailData.scores.reading, null, "Scores reading must not be converted to 0");
  assert.equal(detailData.attempt.rawScore, 4);
  assert.equal(detailData.attempt.maxScore, 4);
});

after(async () => {
  const userIds = [userAId, userBId].filter(Boolean);
  if (userIds.length > 0) {
    await pool.query("DELETE FROM feedback WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = ANY($1))", [userIds]);
    await pool.query("DELETE FROM mistake_notes WHERE user_id = ANY($1)", [userIds]);
    await pool.query("DELETE FROM scores WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = ANY($1))", [userIds]);
    await pool.query("DELETE FROM responses WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = ANY($1))", [userIds]);
    await pool.query("DELETE FROM attempts WHERE user_id = ANY($1)", [userIds]);
    await pool.query("DELETE FROM consents WHERE user_id = ANY($1)", [userIds]);
    await pool.query("DELETE FROM profiles WHERE user_id = ANY($1)", [userIds]);
    await pool.query("DELETE FROM users WHERE id = ANY($1)", [userIds]);
  }
  await pool.end();
});

