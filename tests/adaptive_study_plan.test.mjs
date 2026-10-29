/**
 * BandBloom IELTS SaaS - Adaptive Study Plan Engine Integration Test Suite
 * 
 * Verifies all 10 core requirements of the Adaptive Study Plan Engine:
 * 1. Starter Plan generation for new students (honest baseline, Day 1 diagnostic CTA).
 * 2. Strict Academic vs General Training content integrity.
 * 3. Adaptive prioritization based on mock test / diagnostic band scores.
 * 4. Error tag & mistake notebook driven weakness targeting.
 * 5. Task completion toggling, timestamping, and database persistence.
 * 6. Task rescheduling to another day without duplication or data loss.
 * 7. Plan regeneration adaptively preserving completed-task history.
 * 8. Weekly self-reflection recording and persistence.
 * 9. Multi-tenant security & student isolation guard.
 * 10. Clean database fixture teardown.
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
const USER_A_EMAIL = `studyplan_academic_${TIMESTAMP}@bandbloom.test`;
const USER_B_EMAIL = `studyplan_gt_${TIMESTAMP}@bandbloom.test`;
const TEST_PASSWORD = "StudyPlanPass2026!";

let userAId = null;
let userBId = null;
let sessionA = null;
let sessionB = null;

// Helpers to register and authenticate test users
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

  // Update profile test_type and target_band
  await pool.query(
    `UPDATE profiles
     SET test_type = $1, target_band = 7.5, daily_minutes = 120, target_date = CURRENT_DATE + INTERVAL '45 days'
     WHERE user_id = $2`,
    [testType, userId]
  );

  return userId;
}

test("Setup: Register test student accounts for Academic and General Training", async () => {
  sessionA = new CookieSession(BASE_URL);
  sessionB = new CookieSession(BASE_URL);

  userAId = await registerUser(sessionA, USER_A_EMAIL, "Academic Candidate", "academic");
  userBId = await registerUser(sessionB, USER_B_EMAIL, "General Training Candidate", "general_training");

  assert.ok(userAId, "User A (Academic) should be created");
  assert.ok(userBId, "User B (General Training) should be created");
});

test("Test 1: Starter Plan Generation for New Student (No Diagnostics, Zero Fabricated Scores)", async () => {
  const res = await sessionA.fetch("/api/study-plan");
  assert.equal(res.status, 200);

  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.plan, "Plan should exist");

  const plan = json.plan;
  assert.equal(plan.planType, "starter", "Brand new user must receive a starter plan");
  assert.equal(plan.currentEstimatedBand, null, "Baseline proficiency must be null, never fabricated");
  assert.equal(plan.testType, "academic");
  assert.equal(plan.targetBand, 7.5);
  assert.equal(plan.tasks.length, 7, "Must contain exactly 7 scheduled days");

  // Day 1 must be a diagnostic mock test
  const day1Task = plan.tasks[0];
  assert.equal(day1Task.day, "Monday");
  assert.equal(day1Task.skill, "mock");
  assert.equal(day1Task.actionHref, "/mock-centre");
  assert.match(day1Task.title.toLowerCase(), /diagnostic/);
  assert.match(day1Task.whyRecommended.toLowerCase(), /baseline|diagnostic/);

  // Verify DB record
  const dbRes = await pool.query(
    `SELECT plan_version, is_active, plan_json
     FROM study_plans
     WHERE user_id = $1 AND is_active = true`,
    [userAId]
  );
  assert.equal(dbRes.rows.length, 1);
  assert.equal(dbRes.rows[0].plan_version, 1);
  assert.equal(dbRes.rows[0].plan_json.planType, "starter");
});

test("Test 2: Strict Academic vs General Training Content Integrity", async () => {
  // Fetch General Training Student plan
  const resB = await sessionB.fetch("/api/study-plan");
  assert.equal(resB.status, 200);
  const jsonB = await resB.json();
  const planB = jsonB.plan;

  assert.equal(planB.testType, "general_training");
  assert.equal(planB.tasks.length, 7);

  // GT writing task on Wednesday must be letter writing, not Academic Task 1 data chart
  const gtWritingTask = planB.tasks.find((t) => t.day === "Wednesday");
  assert.ok(gtWritingTask, "GT plan should include Wednesday writing task");
  assert.equal(gtWritingTask.skill, "writing");
  assert.match(
    gtWritingTask.title.toLowerCase() + " " + gtWritingTask.objective.toLowerCase(),
    /letter|task 1 general|general training/
  );
  assert.doesNotMatch(
    gtWritingTask.title.toLowerCase(),
    /data report|bar chart|line graph|pie chart|process diagram/
  );

  // Academic writing task must be Academic Task 1 or Academic Task 2
  const resA = await sessionA.fetch("/api/study-plan");
  const jsonA = await resA.json();
  const planA = jsonA.plan;
  const academicWritingTask = planA.tasks.find((t) => t.day === "Wednesday");
  assert.ok(academicWritingTask, "Academic plan should include Wednesday writing task");
  assert.equal(academicWritingTask.skill, "writing");
  assert.doesNotMatch(academicWritingTask.title.toLowerCase(), /general training letter/);
});

test("Test 3: Adaptive Prioritization from Scored Assessment / Mock Results", async () => {
  // Fetch valid exam ID
  const examRes = await pool.query("SELECT id FROM exams LIMIT 1");
  const examId = examRes.rows[0].id;

  // Insert a completed exam attempt for Student A where Writing is the weakest skill (Band 5.5 vs 7.0 Reading)
  const attemptRes = await pool.query(
    `INSERT INTO attempts (user_id, exam_id, status, started_at, deadline_at, submitted_at)
     VALUES ($1, $2, 'evaluated', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '1 hour', NOW() - INTERVAL '1 hour')
     RETURNING id`,
    [userAId, examId]
  );
  const attemptId = attemptRes.rows[0].id;

  // Insert band scores: Writing is weakest (Band 5.5)
  await pool.query(
    `INSERT INTO scores (attempt_id, skill, estimated_band, scoring_version, is_unofficial)
     VALUES 
       ($1, 'overall', 6.5, 1, true),
       ($1, 'listening', 6.5, 1, true),
       ($1, 'reading', 7.0, 1, true),
       ($1, 'writing', 5.5, 1, true),
       ($1, 'speaking', 6.5, 1, true)`,
    [attemptId]
  );

  // Trigger adaptive plan regeneration
  const regenRes = await sessionA.fetch("/api/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "regenerate" }),
  });
  assert.equal(regenRes.status, 200);
  const regenJson = await regenRes.json();
  const adaptedPlan = regenJson.plan;

  assert.equal(adaptedPlan.planType, "adaptive_diagnostic");
  assert.equal(adaptedPlan.currentEstimatedBand, 6.5);

  // Monday (first active day) must be prioritized to the weakest skill (writing)
  const mondayTask = adaptedPlan.tasks.find((t) => t.day === "Monday");
  assert.equal(mondayTask.skill, "writing", "Monday must prioritize the student's weakest skill (Writing)");
  assert.match(mondayTask.whyRecommended.toLowerCase(), /writing/);
  assert.match(mondayTask.whyRecommended, /5\.5/, "Rationale should reference student's actual assessed band");
});

test("Test 4: Error Tag Driven Weakness Prioritization from Mistake Notebook", async () => {
  // Add an unmastered mistake note for Student A targeting "True/False/Not Given" in Reading
  await pool.query(
    `INSERT INTO mistake_notes (user_id, skill, error_tag, user_notes, original_answer, correct_reasoning, retry_status)
     VALUES ($1, 'reading', 'True/False/Not Given', 'Struggled with distinguishing False from Not Given', 'True', 'Passage stated contrary', 'pending')`,
    [userAId]
  );

  // Regenerate plan
  const regenRes = await sessionA.fetch("/api/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "regenerate" }),
  });
  assert.equal(regenRes.status, 200);
  const plan = (await regenRes.json()).plan;

  // Plan type now transitions to adaptive_performance because mistake notes exist
  assert.equal(plan.planType, "adaptive_performance");

  // Find the reading task
  const readingTask = plan.tasks.find((t) => t.skill === "reading");
  assert.ok(readingTask, "Plan should contain a reading task");
  assert.match(
    readingTask.title.toLowerCase() + " " + readingTask.objective.toLowerCase() + " " + readingTask.whyRecommended.toLowerCase(),
    /true\/false\/not given/,
    "Reading task must target the student's unmastered mistake tag"
  );
});

test("Test 5: Task Completion Toggle, Timestamps, and Recalculated Stats", async () => {
  const getRes = await sessionA.fetch("/api/study-plan");
  const plan = (await getRes.json()).plan;
  const targetTask = plan.tasks[0];

  assert.equal(targetTask.completed, false);
  const initialCompletedCount = plan.stats.completedTasks;

  // Toggle to completed
  const patchRes = await sessionA.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: targetTask.id, completed: true }),
  });
  assert.equal(patchRes.status, 200);
  const updatedPlan = (await patchRes.json()).plan;

  const updatedTask = updatedPlan.tasks.find((t) => t.id === targetTask.id);
  assert.equal(updatedTask.completed, true);
  assert.equal(updatedTask.status, "completed");
  assert.ok(updatedTask.completedAt, "completedAt timestamp must be set");
  assert.equal(updatedPlan.stats.completedTasks, initialCompletedCount + 1);

  // Verify database record
  const dbRes = await pool.query(
    `SELECT plan_json FROM study_plans WHERE user_id = $1 AND is_active = true`,
    [userAId]
  );
  const dbPlan = dbRes.rows[0].plan_json;
  const dbTask = dbPlan.tasks.find((t) => t.id === targetTask.id);
  assert.equal(dbTask.completed, true);
  assert.equal(dbTask.status, "completed");

  // Toggle back to planned
  const revertRes = await sessionA.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: targetTask.id, completed: false }),
  });
  assert.equal(revertRes.status, 200);
  const revertedPlan = (await revertRes.json()).plan;
  const revertedTask = revertedPlan.tasks.find((t) => t.id === targetTask.id);
  assert.equal(revertedTask.completed, false);
  assert.equal(revertedTask.status, "planned");
});

test("Test 6: Task Rescheduling to Another Day Without Duplication (Within Daily Limit)", async () => {
  const getRes = await sessionA.fetch("/api/study-plan");
  const plan = (await getRes.json()).plan;

  // Move Sunday's task (40 mins) to Thursday (45 mins) - total 85 mins fits comfortably within 120 mins daily preference
  const sundayTask = plan.tasks.find((t) => t.day === "Sunday");
  assert.ok(sundayTask, "Sunday task should exist");

  const rescheduleRes = await sessionA.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: sundayTask.id, newDay: "Thursday" }),
  });
  assert.equal(rescheduleRes.status, 200);
  const rescheduledPlan = (await rescheduleRes.json()).plan;

  assert.equal(rescheduledPlan.tasks.length, 7, "Rescheduling must not duplicate or lose tasks");
  const movedTask = rescheduledPlan.tasks.find((t) => t.id === sundayTask.id);
  assert.equal(movedTask.day, "Thursday");
  assert.notEqual(movedTask.date, sundayTask.date);

  // Verify persistence in DB
  const dbRes = await pool.query(
    `SELECT plan_json FROM study_plans WHERE user_id = $1 AND is_active = true`,
    [userAId]
  );
  const dbMovedTask = dbRes.rows[0].plan_json.tasks.find((t) => t.id === sundayTask.id);
  assert.equal(dbMovedTask.day, "Thursday");
});

test("Test 7: Adaptive Plan Regeneration Strictly Preserving Completed Tasks", async () => {
  // First, mark a task as completed
  const getRes = await sessionA.fetch("/api/study-plan");
  const plan = (await getRes.json()).plan;
  const taskToComplete = plan.tasks[0];

  await sessionA.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: taskToComplete.id, completed: true }),
  });

  const previousVersion = plan.planVersion;

  // Regenerate plan
  const regenRes = await sessionA.fetch("/api/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "regenerate" }),
  });
  assert.equal(regenRes.status, 200);
  const newPlan = (await regenRes.json()).plan;

  assert.equal(newPlan.planVersion, previousVersion + 1, "Plan version should increment");

  // The previously completed task must still be completed with its status intact
  const preservedTask = newPlan.tasks.find((t) => t.id === taskToComplete.id);
  assert.ok(preservedTask, "Completed task must be preserved across regeneration");
  assert.equal(preservedTask.completed, true);
  assert.equal(preservedTask.status, "completed");
  assert.ok(preservedTask.completedAt);
});

test("Test 8: Weekly Self-Reflection Form Persistence", async () => {
  const reflectionData = {
    whatImproved: "Greatly improved paragraph skimming and True/False/Not Given confidence.",
    difficultSkill: "writing",
    weakQuestionType: "Task 1 Overview",
    nextCycleGoal: "Score Band 7.0 on Academic Writing Task 1.",
  };

  const res = await sessionA.fetch("/api/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "reflection",
      reflection: reflectionData,
    }),
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(json.plan.reflection, "Reflection should be in the response");
  assert.equal(json.plan.reflection.whatImproved, reflectionData.whatImproved);
  assert.equal(json.plan.reflection.difficultSkill, "writing");
  assert.ok(json.plan.reflection.submittedAt);

  // Verify persistence in DB
  const dbRes = await pool.query(
    `SELECT plan_json->'reflection' AS reflection
     FROM study_plans
     WHERE user_id = $1 AND is_active = true`,
    [userAId]
  );
  assert.equal(dbRes.rows[0].reflection.whatImproved, reflectionData.whatImproved);
  assert.equal(dbRes.rows[0].reflection.nextCycleGoal, reflectionData.nextCycleGoal);
});

test("Test 9: Tenant Data Isolation Guard (Cross-Student Mutation & Data Separation)", async () => {
  // 1. Attempt to toggle an unauthorized/foreign task ID
  const attackRes = await sessionB.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: "task-foreign-student-a-task", completed: true }),
  });
  assert.equal(attackRes.status, 400, "Should reject foreign/non-existent task manipulation");
  const attackJson = await attackRes.json();
  assert.equal(attackJson.success, false);
  assert.match(attackJson.error.toLowerCase(), /not found/);

  // 2. Student A marks task-mon-1 as completed
  await sessionA.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: "task-mon-1", completed: true }),
  });

  // Verify Student A's task is completed
  const resA = await sessionA.fetch("/api/study-plan");
  const planA = (await resA.json()).plan;
  const taskAMon = planA.tasks.find((t) => t.id === "task-mon-1");
  assert.equal(taskAMon.completed, true);

  // 3. Verify Student B's task-mon-1 is completely untouched (strict isolation)
  const resB = await sessionB.fetch("/api/study-plan");
  const planB = (await resB.json()).plan;
  const taskBMon = planB.tasks.find((t) => t.id === "task-mon-1");
  assert.equal(taskBMon.completed, false, "Student A's task completion must NEVER leak to Student B");
  assert.equal(planB.stats.completedTasks, 0, "Student B's completion stats must remain 0");

  // 4. Verify database level row isolation
  const dbResA = await pool.query(
    `SELECT plan_json FROM study_plans WHERE user_id = $1 AND is_active = true`,
    [userAId]
  );
  const dbResB = await pool.query(
    `SELECT plan_json FROM study_plans WHERE user_id = $1 AND is_active = true`,
    [userBId]
  );
  assert.equal(dbResA.rows[0].plan_json.stats.completedTasks >= 1, true);
  assert.equal(dbResB.rows[0].plan_json.stats.completedTasks, 0);
});

test("Test 10: Input Validation & Boundary Checks", async () => {
  // Invalid action
  const invalidAction = await sessionA.fetch("/api/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "invalid_action" }),
  });
  assert.equal(invalidAction.status, 400);

  // Missing task ID on PATCH
  const missingTaskId = await sessionA.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: true }),
  });
  assert.equal(missingTaskId.status, 400);

  // Invalid reschedule day
  const invalidDay = await sessionA.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: "any-task", newDay: "Funday" }),
  });
  assert.equal(invalidDay.status, 400);
});

test("Test 11: Rescheduling Constraints & Day Capacity Enforcement", async () => {
  // 1. Attempting to reschedule a completed task must be rejected
  const getRes = await sessionA.fetch("/api/study-plan");
  const plan = (await getRes.json()).plan;
  const completedTask = plan.tasks.find((t) => t.completed);
  assert.ok(completedTask, "Completed task should exist from previous tests");

  const rescheduleCompletedRes = await sessionA.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: completedTask.id, newDay: "Tuesday" }),
  });
  assert.equal(rescheduleCompletedRes.status, 400);
  const completedErr = await rescheduleCompletedRes.json();
  assert.match(completedErr.error.toLowerCase(), /completed tasks cannot be rescheduled/);

  // 2. Duplicate rescheduling request to the SAME day is idempotent (returns 200 with unchanged plan)
  const uncompletedTask = plan.tasks.find((t) => !t.completed);
  assert.ok(uncompletedTask, "Uncompleted task should exist");

  const duplicateRes = await sessionA.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: uncompletedTask.id, newDay: uncompletedTask.day }),
  });
  assert.equal(duplicateRes.status, 200);

  // 3. Rescheduling into an occupied day that exceeds dailyMinutes must be rejected
  const wednesdayTask = plan.tasks.find((t) => t.day === "Wednesday");
  const otherTask = plan.tasks.find((t) => !t.completed && t.day !== "Wednesday" && (t.durationMinutes || 0) >= 45);
  if (wednesdayTask && otherTask) {
    const timeLimitRes = await sessionA.fetch("/api/study-plan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: otherTask.id, newDay: "Wednesday" }),
    });
    assert.equal(timeLimitRes.status, 400);
    const timeLimitErr = await timeLimitRes.json();
    assert.match(timeLimitErr.error.toLowerCase(), /exceed your daily preference/);
  }
});

test("Test 12: Aggregate Daily Study Minutes Scaling & Rescheduling Constraint", async () => {
  // Update User B profile to minimum boundary (30 daily minutes)
  await pool.query(`UPDATE profiles SET daily_minutes = 30 WHERE user_id = $1`, [userBId]);
  const regen30 = await sessionB.fetch("/api/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "regenerate" }),
  });
  assert.equal(regen30.status, 200);
  const plan30 = (await regen30.json()).plan;
  assert.equal(plan30.dailyMinutes, 30);

  // 1. Verify sum of task durations on every single day <= dailyMinutes (30)
  for (const day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]) {
    const dayTasks = plan30.tasks.filter((t) => t.day === day);
    const daySum = dayTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
    assert.ok(
      daySum <= 30,
      `Day ${day} aggregate duration ${daySum} must not exceed dailyMinutes (30)`
    );
  }

  // 2. Attempting to reschedule into an occupied day that exceeds dailyMinutes must be rejected
  const tueTask = plan30.tasks.find((t) => t.day === "Tuesday");
  const exceedRes = await sessionB.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: tueTask.id, newDay: "Monday" }),
  });
  assert.equal(exceedRes.status, 400);
  const exceedErr = await exceedRes.json();
  assert.match(exceedErr.error.toLowerCase(), /exceed your daily preference/);

  // 3. Update User B profile to 120 daily minutes and verify scaling
  await pool.query(`UPDATE profiles SET daily_minutes = 120 WHERE user_id = $1`, [userBId]);
  const regen120 = await sessionB.fetch("/api/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "regenerate" }),
  });
  assert.equal(regen120.status, 200);
  const plan120 = (await regen120.json()).plan;
  assert.equal(plan120.dailyMinutes, 120);

  for (const day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]) {
    const dayTasks = plan120.tasks.filter((t) => t.day === day);
    const daySum = dayTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
    assert.ok(
      daySum <= 120,
      `Day ${day} aggregate duration ${daySum} must not exceed dailyMinutes (120)`
    );
  }
});

test("Test 13: Exam Sprint Scheduling Adaptation (daysRemaining <= 14)", async () => {
  // Set User A target date to 10 days in the future
  await pool.query(
    `UPDATE profiles SET target_date = CURRENT_DATE + INTERVAL '10 days' WHERE user_id = $1`,
    [userAId]
  );

  const regenRes = await sessionA.fetch("/api/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "regenerate" }),
  });
  assert.equal(regenRes.status, 200);
  const plan = (await regenRes.json()).plan;

  assert.ok(plan.daysRemaining !== null && plan.daysRemaining <= 14);
  assert.match(plan.weeklyGoal.toLowerCase(), /exam sprint/);
});

test("Test 14: Cumulative Reflection History Across Plan Versions & Cycles", async () => {
  // Submit Cycle 1 reflection
  const ref1 = {
    whatImproved: "Scanning speed for Headings Matching",
    difficultSkill: "reading",
    weakQuestionType: "Headings",
    nextCycleGoal: "Reach Band 7.5 in Section 3 Reading",
  };
  const res1 = await sessionA.fetch("/api/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reflection", reflection: ref1 }),
  });
  assert.equal(res1.status, 200);
  const plan1 = (await res1.json()).plan;
  assert.ok(Array.isArray(plan1.reflectionHistory));
  assert.ok(plan1.reflectionHistory.length >= 1);
  const histCountAfterRef1 = plan1.reflectionHistory.length;

  // Adapt/Regenerate Plan (version increments)
  const regenRes = await sessionA.fetch("/api/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "regenerate" }),
  });
  assert.equal(regenRes.status, 200);
  const regeneratedPlan = (await regenRes.json()).plan;

  // Reflection history MUST be preserved into the new plan version
  assert.ok(Array.isArray(regeneratedPlan.reflectionHistory));
  assert.equal(
    regeneratedPlan.reflectionHistory.length,
    histCountAfterRef1,
    "Reflection history must carry over across plan regenerations"
  );

  // Submit Cycle 2 reflection
  const ref2 = {
    whatImproved: "Task 1 data selection and overview paragraph",
    difficultSkill: "writing",
    weakQuestionType: "Task 1 Overview",
    nextCycleGoal: "Band 7.5 in Writing Task 1",
  };
  const res2 = await sessionA.fetch("/api/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reflection", reflection: ref2 }),
  });
  assert.equal(res2.status, 200);
  const plan2 = (await res2.json()).plan;

  assert.equal(
    plan2.reflectionHistory.length,
    histCountAfterRef1 + 1,
    "New reflection must append to history without overwriting prior records"
  );
  assert.equal(plan2.reflection.whatImproved, ref2.whatImproved);

  // Direct DB check: verify archived plans exist in PostgreSQL
  const dbPlans = await pool.query(
    `SELECT plan_version, is_active, plan_json->'reflectionHistory' AS history
     FROM study_plans
     WHERE user_id = $1
     ORDER BY plan_version ASC`,
    [userAId]
  );
  assert.ok(dbPlans.rows.length >= 2, "Multiple plan versions should be archived in DB");
  const activeDbPlan = dbPlans.rows.find((r) => r.is_active);
  assert.ok(activeDbPlan, "Active plan must exist in DB");
  assert.ok(Array.isArray(activeDbPlan.history));
});

test("Test 15: Authenticated Multi-Session Persistence (Fresh Session Re-Authentication)", async () => {
  // 1. Mark task-fri-1 as completed in session A
  const toggleRes = await sessionA.fetch("/api/study-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId: "task-fri-1", completed: true }),
  });
  assert.equal(toggleRes.status, 200);
  const updatedPlan = (await toggleRes.json()).plan;
  const friTask = updatedPlan.tasks.find((t) => t.id === "task-fri-1");
  assert.equal(friTask.completed, true);
  const expectedCompletedCount = updatedPlan.stats.completedTasks;

  // 2. Create a BRAND NEW isolated CookieSession (simulating user logging in on a new device or browser)
  const freshSession = new CookieSession(BASE_URL);
  const loginRes = await freshSession.fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: USER_A_EMAIL,
      password: TEST_PASSWORD,
    }),
  });
  assert.equal(loginRes.status, 200, "Fresh login must succeed");

  // 3. Retrieve plan using the fresh session
  const freshPlanRes = await freshSession.fetch("/api/study-plan");
  assert.equal(freshPlanRes.status, 200);
  const freshPlan = (await freshPlanRes.json()).plan;

  const persistedFriTask = freshPlan.tasks.find((t) => t.id === "task-fri-1");
  assert.ok(persistedFriTask);
  assert.equal(persistedFriTask.completed, true, "Completion status must persist across fresh sessions");
  assert.ok(persistedFriTask.completedAt);
  assert.equal(
    freshPlan.stats.completedTasks,
    expectedCompletedCount,
    "Stats must accurately reflect persisted completions in fresh session"
  );
});

test("Test 16: Practice Destination Resource Link Integrity & Task-Specific Context", async () => {
  const ALLOWED_PATHS = new Set([
    "/mock-centre",
    "/skills/reading",
    "/skills/listening",
    "/skills/writing",
    "/skills/speaking",
    "/notebook",
    "/vocabulary",
    "/lessons",
    "/practice",
  ]);

  // Fetch Academic Plan
  const resA = await sessionA.fetch("/api/study-plan");
  const planA = (await resA.json()).plan;

  for (const task of planA.tasks) {
    assert.ok(task.actionHref, `Task ${task.id} must have actionHref`);
    const parsedUrl = new URL(task.actionHref, BASE_URL);
    assert.ok(
      ALLOWED_PATHS.has(parsedUrl.pathname),
      `Task ${task.id} destination path '${parsedUrl.pathname}' must exist in application routes`
    );
    assert.ok(task.actionLabel && task.actionLabel.trim().length > 0);

    // Academic plan check
    assert.doesNotMatch(task.title.toLowerCase(), /general training letter/);
  }

  // Fetch General Training Plan
  const resB = await sessionB.fetch("/api/study-plan");
  const planB = (await resB.json()).plan;

  for (const task of planB.tasks) {
    assert.ok(task.actionHref, `Task ${task.id} must have actionHref`);
    const parsedUrl = new URL(task.actionHref, BASE_URL);
    assert.ok(
      ALLOWED_PATHS.has(parsedUrl.pathname),
      `Task ${task.id} destination path '${parsedUrl.pathname}' must exist in application routes`
    );
    assert.ok(task.actionLabel && task.actionLabel.trim().length > 0);

    // GT plan check
    const wednesdayTask = planB.tasks.find((t) => t.day === "Wednesday");
    assert.match(wednesdayTask.title.toLowerCase(), /gt|letter/);
    assert.doesNotMatch(wednesdayTask.title.toLowerCase(), /data report|bar chart/);
  }

  // Verify task-specific navigation and content resolution
  const academicWriting = planA.tasks.find((t) => t.day === "Wednesday");
  assert.match(academicWriting.actionHref, /type=academic/);
  assert.match(academicWriting.actionHref, /task=task1/);

  const gtWriting = planB.tasks.find((t) => t.day === "Wednesday");
  assert.match(gtWriting.actionHref, /type=general_training/);
  assert.match(gtWriting.actionHref, /task=letter/);

  // Fetch destination routes over HTTP and verify rendered stream context
  const acadPageRes = await sessionA.fetch(academicWriting.actionHref);
  assert.equal(acadPageRes.status, 200);
  const acadHtml = await acadPageRes.text();
  assert.match(acadHtml, /IELTS Academic|Academic Task 1/i);

  const gtPageRes = await sessionB.fetch(gtWriting.actionHref);
  assert.equal(gtPageRes.status, 200);
  const gtHtml = await gtPageRes.text();
  assert.match(gtHtml, /General Training|Letter/i);
});

after(async () => {
  // Teardown test fixtures
  if (userAId || userBId) {
    const ids = [userAId, userBId].filter(Boolean);
    await pool.query(`DELETE FROM mistake_notes WHERE user_id = ANY($1)`, [ids]);
    await pool.query(`DELETE FROM study_plans WHERE user_id = ANY($1)`, [ids]);
    await pool.query(`DELETE FROM scores WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = ANY($1))`, [ids]);
    await pool.query(`DELETE FROM responses WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = ANY($1))`, [ids]);
    await pool.query(`DELETE FROM attempts WHERE user_id = ANY($1)`, [ids]);
    await pool.query(`DELETE FROM consents WHERE user_id = ANY($1)`, [ids]);
    await pool.query(`DELETE FROM sessions WHERE user_id = ANY($1)`, [ids]);
    await pool.query(`DELETE FROM profiles WHERE user_id = ANY($1)`, [ids]);
    await pool.query(`DELETE FROM users WHERE id = ANY($1)`, [ids]);
  }
  await pool.end();
});
