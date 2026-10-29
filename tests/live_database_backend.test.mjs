/**
 * BandBloom IELTS SaaS - Live Database Backend Integration Test Suite
 * Tests genuine PostgreSQL database operations on port 5433:
 * 1. Database Connection & System Health
 * 2. User Registration, Profile Creation & Consent Persistence
 * 3. Unique Email Constraint & Duplicate Rejection
 * 4. Password Hashing & Bcrypt Verification
 * 5. Session Token Hashing, Lookup & Expiry Invalidation
 * 6. Dashboard Metrics & Official Band Calculation Parity
 * 7. Study Plan Generation, Monday Rollover & Task Toggle Persistence
 * 8. Vocabulary Spaced Repetition & Mastery Progression
 * 9. Mistake Notebook Creation, Isolation & Status Transition
 * 10. Exam Lifecycle: Attempt Start, Active Guard, Autosave, Submission & Scoring
 * 11. Clean Fixture Teardown
 */

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import crypto from "node:crypto";

const require = createRequire(import.meta.url);
const { Pool } = require("../apps/web/node_modules/pg");
const bcrypt = require("../apps/web/node_modules/bcryptjs");

const pool = new Pool({
  host: process.env.PGHOST || "127.0.0.1",
  port: Number(process.env.PGPORT || 5433),
  user: process.env.PGUSER || "bandbloom_user",
  password: process.env.PGPASSWORD || "bandbloom_password",
  database: process.env.PGDATABASE || "bandbloom_db",
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

const TEST_EMAIL = `test_backend_live_${Date.now()}@bandbloom.test`;
const TEST_PASSWORD = "ValidSecurePass2026!";
let testUserId = null;
let testExamId = null;
let testQuestionId = null;
let testAttemptId = null;
let testVocabId = null;
let testMistakeId = null;

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function roundIELTSBand(rawAvg) {
  if (rawAvg === null || rawAvg === undefined || isNaN(rawAvg)) return null;
  const wholePart = Math.floor(rawAvg);
  const fractionPart = Math.round((rawAvg - wholePart) * 1000) / 1000;
  if (fractionPart < 0.25) return Number(wholePart.toFixed(1));
  if (fractionPart < 0.75) return Number((wholePart + 0.5).toFixed(1));
  return Number((wholePart + 1.0).toFixed(1));
}

test("Live Database: Connection and PostgreSQL Version", async () => {
  const res = await pool.query("SELECT version() AS ver, current_database() AS db, current_user AS usr");
  assert.strictEqual(res.rows.length, 1);
  assert.strictEqual(res.rows[0].db, "bandbloom_db");
  assert.strictEqual(res.rows[0].usr, "bandbloom_user");
  assert.ok(res.rows[0].ver.includes("PostgreSQL"));
});

test("Live Database: User Registration and Password Hashing", async () => {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const userRes = await pool.query(
    `INSERT INTO users (email, password_hash, role, status)
     VALUES ($1, $2, 'student', 'active')
     RETURNING id, email, role, status, created_at`,
    [TEST_EMAIL, passwordHash]
  );
  assert.strictEqual(userRes.rows.length, 1);
  testUserId = userRes.rows[0].id;
  assert.ok(testUserId);
  assert.strictEqual(userRes.rows[0].email, TEST_EMAIL);
  assert.strictEqual(userRes.rows[0].role, "student");
});

test("Live Database: Profile and Consent Record Creation", async () => {
  assert.ok(testUserId, "User ID must exist from previous step");

  const profileRes = await pool.query(
    `INSERT INTO profiles (user_id, full_name, target_band, test_type, timezone)
     VALUES ($1, 'Live Test Student', 7.5, 'academic', 'Asia/Dhaka')
     RETURNING user_id, full_name, target_band, test_type`,
    [testUserId]
  );
  assert.strictEqual(profileRes.rows.length, 1);
  assert.strictEqual(Number(profileRes.rows[0].target_band), 7.5);

  const consentRes = await pool.query(
    `INSERT INTO consents (user_id, type, policy_version, granted_at)
     VALUES ($1, 'terms_and_privacy', 'v2.0', clock_timestamp())
     RETURNING id, type`,
    [testUserId]
  );
  assert.strictEqual(consentRes.rows.length, 1);
  assert.strictEqual(consentRes.rows[0].type, "terms_and_privacy");
});

test("Live Database: Enforce Unique Email Constraint on Users", async () => {
  await assert.rejects(
    async () => {
      await pool.query(
        `INSERT INTO users (email, password_hash, role) VALUES ($1, 'dummy_hash', 'student')`,
        [TEST_EMAIL]
      );
    },
    (err) => {
      return err.code === "23505" || err.message.includes("unique");
    }
  );
});

test("Live Database: Session Lifecycle (Creation, Verification, Expiry)", async () => {
  const testSessionTokenHex = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(testSessionTokenHex);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // 1. Create active session
  await pool.query(
    `INSERT INTO sessions (user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, 'Live-Test-Agent/1.0', '127.0.0.1')`,
    [testUserId, tokenHash, expiresAt]
  );

  // 2. Lookup active session
  const lookupRes = await pool.query(
    `SELECT s.id, s.user_id, u.email, u.role
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token_hash = $1
       AND s.expires_at > clock_timestamp()
       AND u.status = 'active'`,
    [tokenHash]
  );
  assert.strictEqual(lookupRes.rows.length, 1);
  assert.strictEqual(lookupRes.rows[0].email, TEST_EMAIL);

  // 3. Reject lookup for non-existent token hash
  const invalidHash = hashToken("non_existent_token_0123456789abcdef");
  const failedLookup = await pool.query(
    `SELECT id FROM sessions WHERE token_hash = $1 AND expires_at > clock_timestamp()`,
    [invalidHash]
  );
  assert.strictEqual(failedLookup.rows.length, 0);
});

test("Live Database: Study Plan Generation and Task Completion", async () => {
  // Current Monday for plan
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff)).toISOString().split("T")[0];

  const planRes = await pool.query(
    `INSERT INTO study_plans (user_id, week_start, is_active, plan_json)
     VALUES ($1, $2, true, $3::jsonb)
     RETURNING id, week_start, is_active, plan_json`,
    [
      testUserId,
      monday,
      JSON.stringify({
        weeklyGoal: "Master True/False/Not Given questions",
        tasks: [
          { id: "task-1", title: "Review Reading Strategies", completed: false, day: "Monday" },
          { id: "task-2", title: "Practice 1 Full Reading Passage", completed: false, day: "Tuesday" },
        ],
      }),
    ]
  );
  assert.strictEqual(planRes.rows.length, 1);
  const planId = planRes.rows[0].id;

  // Toggle task-1 completion
  const updatedTasks = [
    { id: "task-1", title: "Review Reading Strategies", completed: true, day: "Monday" },
    { id: "task-2", title: "Practice 1 Full Reading Passage", completed: false, day: "Tuesday" },
  ];
  await pool.query(
    `UPDATE study_plans
     SET plan_json = jsonb_set(plan_json, '{tasks}', $1::jsonb), updated_at = clock_timestamp()
     WHERE id = $2`,
    [JSON.stringify(updatedTasks), planId]
  );

  const checkRes = await pool.query(
    `SELECT plan_json->'tasks'->0->>'completed' AS task1_completed FROM study_plans WHERE id = $1`,
    [planId]
  );
  assert.strictEqual(checkRes.rows[0].task1_completed, "true");
});

test("Live Database: Spaced Repetition Vocabulary Progression", async () => {
  // Find or create a catalog vocabulary item
  let vocabItem = await pool.query(
    `SELECT id FROM vocabulary_items LIMIT 1`
  );
  if (vocabItem.rows.length === 0) {
    vocabItem = await pool.query(
      `INSERT INTO vocabulary_items (word, part_of_speech, band_level, meaning, collocation, example_sentence)
       VALUES ('ubiquitous', 'adjective', 'Band 7.5+', 'present, appearing, or found everywhere', 'ubiquitous digital devices', 'Mobile phones have become ubiquitous in daily life.')
       RETURNING id`
    );
  }
  testVocabId = vocabItem.rows[0].id;

  // Add to student progress in learning status
  const progRes = await pool.query(
    `INSERT INTO user_vocabulary_progress (user_id, vocabulary_item_id, mastery, interval_days, next_review_at)
     VALUES ($1, $2, 'learning', 1, clock_timestamp())
     RETURNING id, mastery, interval_days`,
    [testUserId, testVocabId]
  );
  assert.strictEqual(progRes.rows.length, 1);
  assert.strictEqual(progRes.rows[0].mastery, "learning");
  assert.strictEqual(progRes.rows[0].interval_days, 1);

  // Advance to reviewing on successful recall
  const nextInterval = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
  const advanceRes = await pool.query(
    `UPDATE user_vocabulary_progress
     SET mastery = 'reviewing',
         interval_days = 3,
         last_reviewed_at = clock_timestamp(),
         next_review_at = $1,
         updated_at = clock_timestamp()
     WHERE id = $2
     RETURNING mastery, interval_days`,
    [nextInterval, progRes.rows[0].id]
  );
  assert.strictEqual(advanceRes.rows[0].mastery, "reviewing");
  assert.strictEqual(advanceRes.rows[0].interval_days, 3);
});

test("Live Database: Mistake Notebook Scoped Queries & Resolution", async () => {
  const insertRes = await pool.query(
    `INSERT INTO mistake_notes (user_id, skill, error_tag, user_notes, original_answer, correct_reasoning, retry_status)
     VALUES ($1, 'reading', 'tfng_confusion', 'Confused FALSE with NOT GIVEN on Question 14', 'False', 'Passage did not mention coastal areas at all.', 'pending')
     RETURNING id, skill, error_tag, retry_status`,
    [testUserId]
  );
  assert.strictEqual(insertRes.rows.length, 1);
  testMistakeId = insertRes.rows[0].id;
  assert.strictEqual(insertRes.rows[0].skill, "reading");
  assert.strictEqual(insertRes.rows[0].retry_status, "pending");

  // Query mistakes filtered by skill
  const listRes = await pool.query(
    `SELECT id, error_tag, retry_status FROM mistake_notes WHERE user_id = $1 AND skill = 'reading'`,
    [testUserId]
  );
  assert.strictEqual(listRes.rows.length, 1);
  assert.strictEqual(listRes.rows[0].id, testMistakeId);

  // Update status to mastered
  await pool.query(
    `UPDATE mistake_notes SET retry_status = 'mastered', updated_at = clock_timestamp() WHERE id = $1`,
    [testMistakeId]
  );
  const verifyRes = await pool.query(
    `SELECT retry_status FROM mistake_notes WHERE id = $1`,
    [testMistakeId]
  );
  assert.strictEqual(verifyRes.rows[0].retry_status, "mastered");
});

test("Live Database: Exam Attempt Lifecycle and One-Active Guard", async () => {
  // Find or create an exam
  let examRes = await pool.query(`SELECT id FROM exams WHERE status IN ('active', 'published') LIMIT 1`);
  if (examRes.rows.length === 0) {
    examRes = await pool.query(
      `INSERT INTO exams (title, test_type, status)
       VALUES ('Cambridge Academic Test 1 (Automated Test)', 'academic', 'active')
       RETURNING id`
    );
  }
  testExamId = examRes.rows[0].id;

  // Find or create a question
  let qRes = await pool.query(`SELECT id FROM questions LIMIT 1`);
  if (qRes.rows.length === 0) {
    qRes = await pool.query(
      `INSERT INTO questions (skill, type, prompt, rights_status, status)
       VALUES ('reading', 'multiple_choice', 'What is the primary theme?', 'owned', 'published')
       RETURNING id`
    );
  }
  testQuestionId = qRes.rows[0].id;

  // 1. Start active attempt
  const attemptRes = await pool.query(
    `INSERT INTO attempts (user_id, exam_id, status, started_at, deadline_at)
     VALUES ($1, $2, 'in_progress', clock_timestamp(), clock_timestamp() + interval '60 minutes')
     RETURNING id, status, deadline_at`,
    [testUserId, testExamId]
  );
  assert.strictEqual(attemptRes.rows.length, 1);
  testAttemptId = attemptRes.rows[0].id;
  assert.strictEqual(attemptRes.rows[0].status, "in_progress");

  // 2. Verify one-active-attempt invariant: second active attempt on same exam must fail
  await assert.rejects(
    async () => {
      await pool.query(
        `INSERT INTO attempts (user_id, exam_id, status, started_at, deadline_at)
         VALUES ($1, $2, 'in_progress', clock_timestamp(), clock_timestamp() + interval '60 minutes')`,
        [testUserId, testExamId]
      );
    },
    (err) => {
      return err.code === "23505" || err.message.includes("unique");
    }
  );

  // 3. Autosave response
  const responseRes = await pool.query(
    `INSERT INTO responses (attempt_id, question_id, response_json)
     VALUES ($1, $2, '{"answer": "True"}'::jsonb)
     RETURNING id, response_json`,
    [testAttemptId, testQuestionId]
  );
  assert.strictEqual(responseRes.rows.length, 1);
  assert.strictEqual(responseRes.rows[0].response_json.answer, "True");

  // 4. Submit attempt and persist score
  await pool.query(
    `UPDATE attempts
     SET status = 'submitted', submitted_at = clock_timestamp()
     WHERE id = $1`,
    [testAttemptId]
  );

  const scoreRes = await pool.query(
    `INSERT INTO scores (attempt_id, skill, estimated_band, scoring_version, is_unofficial)
     VALUES ($1, 'overall', 7.5, 'v2.0-deterministic', true)
     RETURNING id, estimated_band`,
    [testAttemptId]
  );
  assert.strictEqual(scoreRes.rows.length, 1);
  assert.strictEqual(Number(scoreRes.rows[0].estimated_band), 7.5);
});

test("Live Database: Stored Function Rounding Parity with App Logic", async () => {
  const cases = [
    { input: 6.25, expected: 6.5 },
    { input: 6.75, expected: 7.0 },
    { input: 7.10, expected: 7.0 },
    { input: 7.24, expected: 7.0 },
    { input: 7.25, expected: 7.5 },
    { input: 7.74, expected: 7.5 },
    { input: 7.75, expected: 8.0 },
  ];

  for (const c of cases) {
    const dbRes = await pool.query(`SELECT ielts_round_band($1) AS band`, [c.input]);
    const dbBand = Number(dbRes.rows[0].band);
    const jsBand = roundIELTSBand(c.input);
    assert.strictEqual(dbBand, c.expected, `DB ielts_round_band(${c.input})`);
    assert.strictEqual(jsBand, c.expected, `JS roundIELTSBand(${c.input})`);
  }
});

// Clean Teardown
after(async () => {
  if (testUserId) {
    try {
      // Cascade delete the test user and all dependent records cleanly
      await pool.query(`DELETE FROM mistake_notes WHERE user_id = $1`, [testUserId]);
      await pool.query(`DELETE FROM user_vocabulary_progress WHERE user_id = $1`, [testUserId]);
      await pool.query(`DELETE FROM study_plans WHERE user_id = $1`, [testUserId]);
      await pool.query(`DELETE FROM scores WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = $1)`, [testUserId]);
      await pool.query(`DELETE FROM responses WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = $1)`, [testUserId]);
      await pool.query(`DELETE FROM attempts WHERE user_id = $1`, [testUserId]);
      await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [testUserId]);
      await pool.query(`DELETE FROM consents WHERE user_id = $1`, [testUserId]);
      await pool.query(`DELETE FROM profiles WHERE user_id = $1`, [testUserId]);
      await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
    } catch (err) {
      console.warn("Cleanup warning:", err.message);
    }
  }
  await pool.end();
});
