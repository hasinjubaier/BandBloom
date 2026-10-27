/**
 * BandBloom IELTS SaaS - Student Dashboard Production Service & Concurrency Test Suite
 * Directly exercises the actual TypeScript backend services, transactions, and PostgreSQL database.
 */

const assert = require("assert");
const { Pool } = require("../apps/web/node_modules/pg");

// Import production services directly via tsx runtime
const {
  getStudentStudyPlan,
  toggleTaskCompletion,
  getMondayOfWeek,
} = require("../apps/web/src/server/services/study-plan.service");

const {
  getStudentVocabularyStats,
  getStudentSavedVocabulary,
} = require("../apps/web/src/server/services/vocabulary.service");

const {
  getStudentMistakes,
} = require("../apps/web/src/server/services/notebook.service");

const {
  getStudentDashboardSummary,
  calculateStudyStreak,
} = require("../apps/web/src/server/services/dashboard.service");

const {
  sanitizeTimezone,
  pluralize,
  getDhakaDaysRemaining,
  getDhakaGreeting,
  formatTestType,
  formatSkill,
} = require("../apps/web/src/lib/dashboard-utils");

const pool = new Pool({
  host: process.env.PGHOST || "127.0.0.1",
  port: Number(process.env.PGPORT || 5433),
  user: process.env.PGUSER || "bandbloom_user",
  password: process.env.PGPASSWORD || "bandbloom_password",
  database: process.env.PGDATABASE || "bandbloom_db",
});

let passed = 0;
let failed = 0;

async function runTest(name, fn) {
  try {
    const res = fn();
    if (res && typeof res.then === "function") {
      await res;
    }
    passed++;
    console.log(` [PASS] ${name}`);
  } catch (err) {
    failed++;
    console.error(` [FAIL] ${name}:`, err);
  }
}

async function main() {
  console.log("======================================================================");
  console.log("BANDBLOOM IELTS SAAS - STUDENT DASHBOARD PRODUCTION REGRESSION SUITE");
  console.log("======================================================================");

  const cleanupUserIds = [];

  try {
    // -------------------------------------------------------------------------
    // Group 1: Personal Data Isolation & Empty States (Invoking Production Services)
    // -------------------------------------------------------------------------
    console.log("\n--- Group 1: Personal Data Isolation & Empty States (Production Services) ---");

    const emailA = `test_audit_user_a_${Date.now()}@example.com`;
    const emailB = `test_audit_user_b_${Date.now()}@example.com`;
    let userAId = null;
    let userBId = null;

    await runTest("Setup test students in database", async () => {
      const resA = await pool.query(
        `INSERT INTO users (email, role, status) VALUES ($1, 'student', 'active') RETURNING id`,
        [emailA]
      );
      userAId = resA.rows[0].id;
      cleanupUserIds.push(userAId);
      await pool.query(
        `INSERT INTO profiles (user_id, full_name, test_type, target_band, timezone) VALUES ($1, 'Audit Student A', 'general_training', 7.5, 'Asia/Dhaka')`,
        [userAId]
      );

      const resB = await pool.query(
        `INSERT INTO users (email, role, status) VALUES ($1, 'student', 'active') RETURNING id`,
        [emailB]
      );
      userBId = resB.rows[0].id;
      cleanupUserIds.push(userBId);
      await pool.query(
        `INSERT INTO profiles (user_id, full_name, test_type, target_band, timezone) VALUES ($1, 'Audit Student B', 'academic', 8.0, 'Asia/Dhaka')`,
        [userBId]
      );
    });

    await runTest("1. getStudentMistakes returns [] for brand new student (no SEED fixtures)", async () => {
      const mistakes = await getStudentMistakes(userAId);
      assert.ok(Array.isArray(mistakes));
      assert.strictEqual(mistakes.length, 0, "Expected empty array for brand new student");
    });

    await runTest("2. getStudentMistakes returns only the authenticated student's mistakes", async () => {
      // Insert mistake note for User B
      await pool.query(
        `INSERT INTO mistake_notes (user_id, skill, error_tag, user_notes, original_answer, correct_reasoning, retry_status)
         VALUES ($1, 'reading', 'True/False Trap', 'User B specific notes', 'False', 'Passage stated otherwise', 'pending')`,
        [userBId]
      );

      const mistakesA = await getStudentMistakes(userAId);
      const mistakesB = await getStudentMistakes(userBId);

      assert.strictEqual(mistakesA.length, 0, "User A must still have 0 mistakes");
      assert.strictEqual(mistakesB.length, 1, "User B must have 1 mistake");
      assert.strictEqual(mistakesB[0].errorTag, "True/False Trap");
    });

    await runTest("3. getStudentVocabularyStats returns 0 personal saved words, isolates catalog items", async () => {
      const stats = await getStudentVocabularyStats(userAId);
      assert.strictEqual(stats.totalSaved, 0);
      assert.strictEqual(stats.learningCount, 0);
      assert.strictEqual(stats.reviewingCount, 0);
      assert.strictEqual(stats.masteredCount, 0);
      assert.ok(stats.catalogAvailableCount >= 3, "Catalog should have global items");

      const savedWords = await getStudentSavedVocabulary(userAId);
      assert.strictEqual(savedWords.length, 0);
    });

    // -------------------------------------------------------------------------
    // Group 2: Concurrency-Safe Study Plans & Task Persistence
    // -------------------------------------------------------------------------
    console.log("\n--- Group 2: Study Plan Concurrency & Task Persistence ---");

    await runTest("4. Simultaneous initial getStudentStudyPlan calls do not create duplicate active plans", async () => {
      // Dispatch 3 concurrent plan initialization requests for User A
      const [plan1, plan2, plan3] = await Promise.all([
        getStudentStudyPlan(userAId, "Asia/Dhaka"),
        getStudentStudyPlan(userAId, "Asia/Dhaka"),
        getStudentStudyPlan(userAId, "Asia/Dhaka"),
      ]);

      assert.ok(plan1.id);
      assert.strictEqual(plan1.id, plan2.id, "Concurrent requests must return the same plan ID");
      assert.strictEqual(plan2.id, plan3.id, "Concurrent requests must return the same plan ID");

      // Verify at the database level that exactly 1 active plan exists
      const dbCheck = await pool.query(
        `SELECT COUNT(*)::int AS count FROM study_plans WHERE user_id = $1 AND is_active = true`,
        [userAId]
      );
      assert.strictEqual(dbCheck.rows[0].count, 1, "There must be exactly 1 active plan in the database");
    });

    await runTest("5. toggleTaskCompletion persists across reloads via service", async () => {
      const updatedPlan = await toggleTaskCompletion(userAId, "task-mon-1", true, "Asia/Dhaka");
      const monTask = updatedPlan.tasks.find((t) => t.id === "task-mon-1");
      assert.strictEqual(monTask?.completed, true);

      // Simulate a page reload by re-fetching via service
      const reloadedPlan = await getStudentStudyPlan(userAId, "Asia/Dhaka");
      const reloadedMonTask = reloadedPlan.tasks.find((t) => t.id === "task-mon-1");
      assert.strictEqual(reloadedMonTask?.completed, true);
    });

    await runTest("6. Concurrent toggleTaskCompletion on two different tasks preserves both (no lost updates)", async () => {
      // Concurrently toggle task-tue-1 and task-wed-1
      const [resTue, resWed] = await Promise.all([
        toggleTaskCompletion(userAId, "task-tue-1", true, "Asia/Dhaka"),
        toggleTaskCompletion(userAId, "task-wed-1", true, "Asia/Dhaka"),
      ]);

      assert.ok(resTue && resWed);

      // Reload plan and verify BOTH task-tue-1 and task-wed-1 are completed
      const finalPlan = await getStudentStudyPlan(userAId, "Asia/Dhaka");
      const tueTask = finalPlan.tasks.find((t) => t.id === "task-tue-1");
      const wedTask = finalPlan.tasks.find((t) => t.id === "task-wed-1");
      const monTask = finalPlan.tasks.find((t) => t.id === "task-mon-1");

      assert.strictEqual(monTask?.completed, true, "task-mon-1 must still be completed");
      assert.strictEqual(tueTask?.completed, true, "task-tue-1 must be completed");
      assert.strictEqual(wedTask?.completed, true, "task-wed-1 must be completed");
    });

    await runTest("7. toggleTaskCompletion rejects invalid task ID", async () => {
      await assert.rejects(
        () => toggleTaskCompletion(userAId, "non-existent-task-id", true),
        (err) => {
          assert.ok(err.message.includes("not found in active study plan"));
          return true;
        }
      );
    });

    await runTest("8. New week rollover archives old plan and preserves historical plan record", async () => {
      const emailC = `test_audit_user_c_${Date.now()}@example.com`;
      const resC = await pool.query(
        `INSERT INTO users (email, role, status) VALUES ($1, 'student', 'active') RETURNING id`,
        [emailC]
      );
      const userCId = resC.rows[0].id;
      cleanupUserIds.push(userCId);
      await pool.query(
        `INSERT INTO profiles (user_id, full_name, test_type, target_band, timezone) VALUES ($1, 'Audit Student C', 'academic', 7.0, 'Asia/Dhaka')`,
        [userCId]
      );

      // Insert an old historical active plan from last year
      const oldWeek = "2025-01-06";
      const oldPlanRes = await pool.query(
        `INSERT INTO study_plans (user_id, plan_version, week_start, plan_json, is_active)
         VALUES ($1, 1, $2, '{"tasks":[{"id":"old-1","completed":true}]}', true)
         RETURNING id`,
        [userCId, oldWeek]
      );
      const oldPlanId = oldPlanRes.rows[0].id;

      // Invoking getStudentStudyPlan must detect old week, archive it, and create current week plan
      const currentPlan = await getStudentStudyPlan(userCId, "Asia/Dhaka");
      const currentMonday = getMondayOfWeek(new Date(), "Asia/Dhaka");

      assert.strictEqual(currentPlan.weekStart, currentMonday);
      assert.notStrictEqual(currentPlan.id, oldPlanId);

      // Check DB: exactly 1 active plan, 2 total plans (history preserved)
      const countRes = await pool.query(
        `SELECT COUNT(*)::int AS total_plans, COUNT(*) FILTER (WHERE is_active = true)::int AS active_plans FROM study_plans WHERE user_id = $1`,
        [userCId]
      );
      assert.strictEqual(countRes.rows[0].total_plans, 2, "Historical plan must be preserved");
      assert.strictEqual(countRes.rows[0].active_plans, 1, "Only one plan may be active");

      // Verify old plan is inactive
      const oldCheck = await pool.query(`SELECT is_active FROM study_plans WHERE id = $1`, [oldPlanId]);
      assert.strictEqual(oldCheck.rows[0].is_active, false);
    });

    // -------------------------------------------------------------------------
    // Group 3: Study Streak Integrity & Verified Dates (Fix Verification)
    // -------------------------------------------------------------------------
    console.log("\n--- Group 3: Study Streak & Activity Authenticity ---");

    await runTest("9. Student with vocabulary saved weeks ago but NO recent activity sees 0 study streak", async () => {
      const emailE = `test_audit_user_e_${Date.now()}@example.com`;
      const resE = await pool.query(
        `INSERT INTO users (email, role, status) VALUES ($1, 'student', 'active') RETURNING id`,
        [emailE]
      );
      const userEId = resE.rows[0].id;
      cleanupUserIds.push(userEId);
      await pool.query(
        `INSERT INTO profiles (user_id, full_name, test_type, target_band, timezone) VALUES ($1, 'Audit Student E', 'academic', 7.5, 'Asia/Dhaka')`,
        [userEId]
      );

      // Fetch a catalog item ID
      const vocabItemRes = await pool.query(`SELECT id FROM vocabulary_items LIMIT 1`);
      const vocabItemId = vocabItemRes.rows[0].id;

      // Insert vocabulary progress with timestamps 14 days ago
      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);
      await pool.query(
        `INSERT INTO user_vocabulary_progress (user_id, vocabulary_item_id, mastery, interval_days, last_reviewed_at, created_at)
         VALUES ($1, $2, 'learning', 1, $3, $3)`,
        [userEId, vocabItemId, twoWeeksAgo]
      );

      // Fetch full dashboard summary via production service
      const dashboard = await getStudentDashboardSummary(userEId);

      assert.strictEqual(dashboard.stats.vocabularySavedCount, 1, "Should count 1 saved vocabulary word");
      // CRITICAL ASSERTION: The old bug awarded >= 1 day streak because vocab.id existed. Now it MUST be 0!
      assert.strictEqual(
        dashboard.overview.studyStreakDays,
        0,
        "Old vocabulary must NOT award a streak today; expected 0 days active"
      );
    });

    await runTest("10. Genuine activity today produces streak >= 1", async () => {
      // Call calculateStudyStreak with today date string
      const todayDhaka = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      const streakToday = calculateStudyStreak([todayDhaka], new Date(), "Asia/Dhaka");
      assert.strictEqual(streakToday, 1);

      // Past 5 days consecutive
      const dates = [];
      for (let i = 0; i < 5; i++) {
        const d = new Date(Date.now() - i * 86400000);
        dates.push(
          new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Dhaka",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(d)
        );
      }
      const streak5 = calculateStudyStreak(dates, new Date(), "Asia/Dhaka");
      assert.strictEqual(streak5, 5);
    });

    // -------------------------------------------------------------------------
    // Group 4: Timezone Validation & Formatting
    // -------------------------------------------------------------------------
    console.log("\n--- Group 4: Timezone Validation & Format Utilities ---");

    await runTest("11. sanitizeTimezone handles valid, invalid, empty, and non-string values safely", () => {
      assert.strictEqual(sanitizeTimezone("Asia/Dhaka"), "Asia/Dhaka");
      assert.strictEqual(sanitizeTimezone("America/New_York"), "America/New_York");
      assert.strictEqual(sanitizeTimezone("UTC"), "UTC");
      assert.strictEqual(sanitizeTimezone(null), "Asia/Dhaka");
      assert.strictEqual(sanitizeTimezone(undefined), "Asia/Dhaka");
      assert.strictEqual(sanitizeTimezone(""), "Asia/Dhaka");
      assert.strictEqual(sanitizeTimezone("   "), "Asia/Dhaka");
      assert.strictEqual(sanitizeTimezone("Invalid/Timezone"), "Asia/Dhaka");
      assert.strictEqual(sanitizeTimezone("GMT+6"), "Asia/Dhaka");
      assert.strictEqual(sanitizeTimezone(12345), "Asia/Dhaka");
    });

    await runTest("12. getStudentDashboardSummary does not crash on invalid profile timezone", async () => {
      const emailF = `test_audit_user_f_${Date.now()}@example.com`;
      const resF = await pool.query(
        `INSERT INTO users (email, role, status) VALUES ($1, 'student', 'active') RETURNING id`,
        [emailF]
      );
      const userFId = resF.rows[0].id;
      cleanupUserIds.push(userFId);
      // Profile has malformed timezone "Bogus/Zone"
      await pool.query(
        `INSERT INTO profiles (user_id, full_name, test_type, target_band, timezone) VALUES ($1, 'Audit Student F', 'academic', 7.0, 'Bogus/Zone')`,
        [userFId]
      );

      // Must not throw RangeError
      const summary = await getStudentDashboardSummary(userFId);
      assert.ok(summary);
      assert.strictEqual(summary.student.timezone, "Asia/Dhaka");
    });

    await runTest("13. Format and pluralize utility functions handle all edge cases safely", () => {
      assert.strictEqual(pluralize(0, "day"), "0 days");
      assert.strictEqual(pluralize(1, "day"), "1 day");
      assert.strictEqual(pluralize(2, "day"), "2 days");
      assert.strictEqual(pluralize(null, "day"), "0 days");
      assert.strictEqual(pluralize(undefined, "day"), "0 days");
      assert.strictEqual(pluralize(NaN, "day"), "0 days");

      assert.strictEqual(getDhakaDaysRemaining(null), 0);
      assert.strictEqual(getDhakaDaysRemaining(""), 0);
      assert.strictEqual(getDhakaDaysRemaining("not-a-date"), 0);

      assert.strictEqual(formatTestType("general_training"), "General Training");
      assert.strictEqual(formatTestType("academic"), "Academic");
      assert.strictEqual(formatSkill("reading"), "Reading");
    });

  } finally {
    // Cleanup test users and cascade-delete all test rows
    for (const uid of cleanupUserIds) {
      try {
        await pool.query(`DELETE FROM users WHERE id = $1`, [uid]);
      } catch {}
    }
    await pool.end();
  }

  console.log("\n======================================================================");
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("======================================================================");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
