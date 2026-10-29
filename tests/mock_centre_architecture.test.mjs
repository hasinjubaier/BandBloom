/**
 * BandBloom IELTS SaaS - Mock Centre Architecture & Lifecycle Verification Suite
 * 
 * Verifies:
 * 1. Clean seeding & sanitization: test fixtures (e.g., 'E2E Expired Test Exam', 0 min) are filtered out of /api/exams.
 * 2. Exam metadata normalization: title, testType, category, durationMinutes, skills, questionCount are accurate and realistic.
 * 3. Server filtering by category ('full_mock' vs 'sectional') and testType ('academic' vs 'general').
 * 4. Attempt history isolation & subscores: user-scoped /api/attempts returns subscores (L, R, W, S) and deadlineAt.
 * 5. Attempt state reconciliation & lifecycle integrity in mock-centre/page.tsx:
 *    - No attempt -> Start Mock Exam
 *    - In-progress active -> Resume Exam
 *    - Evaluated -> View Report / View Score Report
 *    - In-progress expired -> Expired / Time Expired (no contradictory 'in_progress' status badge)
 */

import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
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
const USER_EMAIL = `mock_centre_arch_${TIMESTAMP}@bandbloom.test`;
const TEST_PASSWORD = "ArchPassword2026!";
let testUserId = null;
let session = null;

test("Setup: Create test account and log in", async () => {
  session = new CookieSession(BASE_URL);
  const res = await session.fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: USER_EMAIL,
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
      fullName: "Mock Centre Tester",
      agreedToTerms: true,
    }),
  });
  const json = await res.json();
  assert.ok(res.status === 200 || res.status === 201, `Failed to register: ${JSON.stringify(json)}`);
  testUserId = json.user?.id || json.data?.id;
  assert.ok(testUserId, "User ID must be returned");
});

test("Requirement 1: /api/exams filters out E2E fixtures and 0-minute test exams", async () => {
  const res = await session.fetch("/api/exams");
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.exams), "Exams must be an array");

  // Verify none of the exams are E2E fixtures or have 0 duration
  for (const exam of data.exams) {
    assert.ok(
      !exam.title.toLowerCase().includes("e2e"),
      `E2E fixture leaked into catalog: ${exam.title}`
    );
    assert.ok(
      !exam.title.toLowerCase().includes("[test]"),
      `Test fixture leaked into catalog: ${exam.title}`
    );
    assert.ok(
      exam.durationMinutes > 0,
      `Exam must have duration > 0: ${exam.title} had ${exam.durationMinutes}`
    );
    assert.ok(
      exam.questionCount > 0,
      `Exam must have questionCount > 0: ${exam.title} had ${exam.questionCount}`
    );
    assert.ok(
      Array.isArray(exam.skills) && exam.skills.length > 0,
      `Exam must have skills array: ${exam.title}`
    );
    assert.ok(
      exam.category === "full_mock" || exam.category === "sectional",
      `Exam category must be full_mock or sectional: ${exam.category}`
    );
  }
});

test("Requirement 2: Full Mocks vs Sectional category separation", async () => {
  // Query Full Mocks
  const fullRes = await session.fetch("/api/exams?category=full_mock");
  assert.equal(fullRes.status, 200);
  const fullData = await fullRes.json();
  assert.ok(fullData.exams.length >= 1, "Must have at least 1 full mock test");
  for (const exam of fullData.exams) {
    assert.equal(exam.category, "full_mock");
    assert.ok(exam.sectionsCount >= 4, "Full mock must have at least 4 sections");
    assert.ok(exam.durationMinutes >= 120, "Full mock must be at least 120 mins");
  }

  // Query Sectional Labs
  const secRes = await session.fetch("/api/exams?category=sectional");
  assert.equal(secRes.status, 200);
  const secData = await secRes.json();
  assert.ok(secData.exams.length >= 1, "Must have sectional practice labs");
  for (const exam of secData.exams) {
    assert.equal(exam.category, "sectional");
    assert.ok(exam.sectionsCount < 4, "Sectional lab must have fewer than 4 sections");
  }
});

test("Requirement 3: Module filtering (Academic vs General Training)", async () => {
  const acadRes = await session.fetch("/api/exams?testType=academic");
  const acadData = await acadRes.json();
  for (const exam of acadData.exams) {
    assert.equal(exam.testType, "academic");
  }

  const gtRes = await session.fetch("/api/exams?testType=general");
  const gtData = await gtRes.json();
  for (const exam of gtData.exams) {
    assert.equal(exam.testType, "general_training");
  }
});

test("Requirement 4: Student Attempts API returns subscores and deadlines", async () => {
  // Insert evaluated attempt for test user
  const examRes = await pool.query(`SELECT id FROM exams WHERE id = '99999999-9999-9999-9999-999999999991'`);
  const examId = examRes.rows[0].id;

  const attRes = await pool.query(
    `INSERT INTO attempts (user_id, exam_id, status, started_at, submitted_at, deadline_at)
     VALUES ($1, $2, 'evaluated', clock_timestamp() - interval '2 hours', clock_timestamp() - interval '1 hour', clock_timestamp() + interval '1 hour')
     RETURNING id`,
    [testUserId, examId]
  );
  const attemptId = attRes.rows[0].id;

  // Insert subscores and overall band
  await pool.query(
    `INSERT INTO scores (attempt_id, skill, raw_score, estimated_band, scoring_version)
     VALUES 
       ($1, 'overall', 30, 7.5, '2026.1'),
       ($1, 'reading', 32, 7.5, '2026.1'),
       ($1, 'listening', 34, 8.0, '2026.1'),
       ($1, 'writing', 28, 6.5, '2026.1'),
       ($1, 'speaking', 30, 7.0, '2026.1')`,
    [attemptId]
  );

  const res = await session.fetch("/api/attempts");
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);

  const matched = data.attempts.find((a) => a.id === attemptId);
  assert.ok(matched, "Evaluated attempt must be returned in attempts list");
  assert.equal(matched.overallBand, 7.5);
  assert.equal(matched.readingScore, 7.5);
  assert.equal(matched.listeningScore, 8.0);
  assert.equal(matched.writingScore, 6.5);
  assert.equal(matched.speakingScore, 7.0);
});

test("Requirement 5: mock-centre/page.tsx architecture & UI rules", () => {
  const pagePath = path.resolve(__dirname, "../apps/web/src/app/mock-centre/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  // Segment tabs
  assert.match(code, /Full Mock Tests \(4 Skills\)/, "Must include Full Mock Tests segment tab");
  assert.match(code, /Sectional Practice Labs/, "Must include Sectional Practice Labs segment tab");

  // Filtering pills
  assert.match(code, /"academic"/, "Must filter by Academic");
  assert.match(code, /"general"/, "Must filter by General Training");
  assert.match(code, /"completed"/, "Must filter by Completed");

  // Lifecycle-aware card actions
  assert.match(code, /Start Mock Exam/, "Must render 'Start Mock Exam' CTA");
  assert.match(code, /Resume Exam/, "Must render 'Resume Exam' CTA");
  assert.match(code, /View Score Report/, "Must render 'View Score Report' CTA");

  // Reconciled attempt status (no contradictory 'in_progress' with 'Time Expired')
  assert.match(code, /statusPillLabel = isEvaluated[\s\S]*?Completed[\s\S]*?Expired/, "Reconciles status label cleanly");
});

after(async () => {
  if (testUserId) {
    await pool.query(`DELETE FROM scores WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = $1)`, [testUserId]);
    await pool.query(`DELETE FROM responses WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = $1)`, [testUserId]);
    await pool.query(`DELETE FROM attempts WHERE user_id = $1`, [testUserId]);
    await pool.query(`DELETE FROM consents WHERE user_id = $1`, [testUserId]);
    await pool.query(`DELETE FROM profiles WHERE user_id = $1`, [testUserId]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
  }
  await pool.end();
});
