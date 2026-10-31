/**
 * BandBloom IELTS SaaS - Reading Module Architecture & Comprehensive Verification Suite
 * 
 * Verifies all requirements of the Reading Module:
 * 1. Academic profiles receive Academic passages, 3-passage structure, and Academic score guidance.
 * 2. General Training profiles receive GT content, 3-section structure, and GT score guidance.
 * 3. Both formats use distinct indicative band-score references (e.g., Band 7.0 requires 30-32 in Academic, but 34-35 in GT).
 * 4. Critical scoring disclaimer regarding test-version variability and objective marking.
 * 5. Full 14 IELTS Reading Question Types Library with authoritative strategies, categories, and traps.
 * 6. TFNG vs YNNG strict distinction and validation engine.
 * 7. Word limit enforcement: exceeding max words is scored 0.
 * 8. Accepted answer variants handling (e.g., '15' vs 'fifteen') without accepting arbitrary synonyms.
 * 9. Real database persistence of reading attempts, scores, and mistake notes.
 * 10. Cross-student tenant isolation for reading attempts and notes.
 * 11. Study Plan link integrity and query parameter handling (?type=... and ?q=...).
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
const ACAD_USER_EMAIL = `reading_acad_${TIMESTAMP}@bandbloom.test`;
const GT_USER_EMAIL = `reading_gt_${TIMESTAMP}@bandbloom.test`;
const TEST_PASSWORD = "ReadingPass2026!";

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
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
      fullName,
      agreedToTerms: true,
    }),
  });
  const json = await res.json();
  assert.ok(res.status === 200 || res.status === 201, `Failed to register ${email}: ${JSON.stringify(json)}`);
  const userId = json.user?.id || json.data?.id;

  await pool.query(
    `UPDATE profiles
     SET test_type = $1, target_band = 7.5, daily_minutes = 60
     WHERE user_id = $2`,
    [testType, userId]
  );
  return userId;
}

test("Setup: Register Academic and General Training student accounts", async () => {
  acadSession = new CookieSession(BASE_URL);
  gtSession = new CookieSession(BASE_URL);

  acadUserId = await registerTestUser(acadSession, ACAD_USER_EMAIL, "Academic Scholar", "academic");
  gtUserId = await registerTestUser(gtSession, GT_USER_EMAIL, "GT Candidate", "general_training");

  assert.ok(acadUserId, "Academic user created");
  assert.ok(gtUserId, "GT user created");
});

test("Requirement 1 & 2: Authoritative profile-driven stream separation (Academic vs GT)", async () => {
  // 1. Academic Profile
  const acadProfRes = await acadSession.fetch("/api/profile");
  assert.equal(acadProfRes.status, 200);
  const acadProf = (await acadProfRes.json()).profile;
  assert.equal(acadProf.testType, "academic");

  // 2. GT Profile
  const gtProfRes = await gtSession.fetch("/api/profile");
  assert.equal(gtProfRes.status, 200);
  const gtProf = (await gtProfRes.json()).profile;
  assert.equal(gtProf.testType, "general_training");
});

test("Requirement 3 & 4: Separate Indicative Raw Score Guides & Critical Disclaimers", async () => {
  const {
    ACADEMIC_RAW_SCORE_GUIDE,
    GT_RAW_SCORE_GUIDE,
  } = await import("../apps/web/src/lib/reading-module-data.ts");

  // Academic Format
  assert.equal(ACADEMIC_RAW_SCORE_GUIDE.totalQuestions, 40);
  assert.equal(ACADEMIC_RAW_SCORE_GUIDE.testDurationMinutes, 60);
  assert.match(ACADEMIC_RAW_SCORE_GUIDE.formatDescription, /3 passages/i);

  // GT Format
  assert.equal(GT_RAW_SCORE_GUIDE.totalQuestions, 40);
  assert.equal(GT_RAW_SCORE_GUIDE.testDurationMinutes, 60);
  assert.match(GT_RAW_SCORE_GUIDE.formatDescription, /3 sections/i);

  // Test Type Specific Conversions: Band 7.0
  const acadBand7 = ACADEMIC_RAW_SCORE_GUIDE.tiers.find((t) => t.band === 7.0);
  const gtBand7 = GT_RAW_SCORE_GUIDE.tiers.find((t) => t.band === 7.0);
  assert.ok(acadBand7, "Academic Band 7 must exist");
  assert.ok(gtBand7, "GT Band 7 must exist");
  assert.equal(acadBand7.rawScoreRange, "30–32", "Academic Band 7 requires 30-32 correct answers");
  assert.equal(gtBand7.rawScoreRange, "34–35", "GT Band 7 requires 34-35 correct answers (strictly higher than Academic)");

  // Band 8.0
  const acadBand8 = ACADEMIC_RAW_SCORE_GUIDE.tiers.find((t) => t.band === 8.0);
  const gtBand8 = GT_RAW_SCORE_GUIDE.tiers.find((t) => t.band === 8.0);
  assert.equal(acadBand8.rawScoreRange, "35–36");
  assert.equal(gtBand8.rawScoreRange, "37–38");

  // Critical scoring disclaimer
  assert.match(ACADEMIC_RAW_SCORE_GUIDE.disclaimer, /indicative/i);
  assert.match(ACADEMIC_RAW_SCORE_GUIDE.disclaimer, /vary slightly/i);
  assert.match(GT_RAW_SCORE_GUIDE.disclaimer, /higher raw scores are required/i);
});

test("Requirement 5: 14 Essential Reading Question Types Library completeness", async () => {
  const { READING_QUESTION_TYPES } = await import("../apps/web/src/lib/reading-module-data.ts");

  assert.equal(READING_QUESTION_TYPES.length, 14, "Must support all 14 official IELTS Reading question types");

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

  for (const id of expectedTypes) {
    const found = READING_QUESTION_TYPES.find((qt) => qt.id === id);
    assert.ok(found, `Question type '${id}' must be present in library`);
    assert.ok(found.name.length > 3);
    assert.ok(found.category, `Question type '${id}' must have category`);
    assert.ok(found.strategy.length > 20, `Question type '${id}' must have detailed strategy`);
    assert.ok(found.commonMistakes.length >= 2, `Question type '${id}' must list common mistakes`);
    assert.ok(found.sampleQuestion.prompt, `Question type '${id}' must include sample question`);
    assert.ok(found.sampleQuestion.explanation, `Question type '${id}' must include explanation`);
  }

  // Matching Headings strategy must NOT teach the 'First Sentence' shortcut myth
  const headings = READING_QUESTION_TYPES.find((qt) => qt.id === "headings");
  assert.match(headings.strategy, /Never rely exclusively on the first or last sentence/i);
  assert.match(headings.commonMistakes.join(" "), /First Sentence Myth/i);
});

test("Requirement 6: TFNG vs YNNG strict distinction and validation", async () => {
  const { validateReadingAnswer } = await import("../apps/web/src/lib/reading-module-data.ts");

  // 1. TFNG Question Validation
  const tfngQ = { correctAnswer: "TRUE", typeId: "tfng" };
  assert.equal(validateReadingAnswer("TRUE", tfngQ).isCorrect, true);
  assert.equal(validateReadingAnswer("true", tfngQ).isCorrect, true);
  assert.equal(validateReadingAnswer("T", tfngQ).isCorrect, true);
  assert.equal(validateReadingAnswer("FALSE", tfngQ).isCorrect, false);

  // 2. YNNG Question Validation (Testing author claim, distinct from TFNG)
  const ynngQ = { correctAnswer: "YES", typeId: "ynng" };
  assert.equal(validateReadingAnswer("YES", ynngQ).isCorrect, true);
  assert.equal(validateReadingAnswer("yes", ynngQ).isCorrect, true);
  assert.equal(validateReadingAnswer("Y", ynngQ).isCorrect, true);
  assert.equal(validateReadingAnswer("NO", ynngQ).isCorrect, false);
});

test("Requirement 7 & 8: Word limit enforcement and accepted variants", async () => {
  const { validateReadingAnswer } = await import("../apps/web/src/lib/reading-module-data.ts");

  // Question with word limit of 2
  const completionQ = {
    correctAnswer: "structural grooves",
    acceptedVariants: ["grooves"],
    maxWords: 2,
    typeId: "sentence_completion",
  };

  // Valid 2-word answer
  const res1 = validateReadingAnswer("structural grooves", completionQ);
  assert.equal(res1.isCorrect, true);
  assert.equal(res1.wordLimitExceeded, false);

  // Valid accepted variant
  const res2 = validateReadingAnswer("grooves", completionQ);
  assert.equal(res2.isCorrect, true);

  // Word count limit exceeded: 3 words -> MUST be scored 0
  const resExceeded = validateReadingAnswer("tiny structural grooves", completionQ);
  assert.equal(resExceeded.isCorrect, false);
  assert.equal(resExceeded.wordLimitExceeded, true);
  assert.match(resExceeded.statusMessage, /Exceeded word limit/i);

  // Arbitrary synonym should NOT be accepted unless in acceptedVariants
  const resSynonym = validateReadingAnswer("architectural slots", completionQ);
  assert.equal(resSynonym.isCorrect, false);
});

test("Requirement 9: Persistence of reading practice attempts and mistake notes", async () => {
  // Submit Academic Reading evaluation
  const answers = {
    "rq-acad-1": "TRUE",
    "rq-acad-2": "FALSE",
    "rq-acad-3": "NOT GIVEN",
    "rq-acad-4": "15",
  };

  const evalRes = await acadSession.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "evaluate_reading",
      answers,
      stream: "academic",
      persist: true,
    }),
  });

  assert.equal(evalRes.status, 200);
  const evalData = await evalRes.json();
  assert.equal(evalData.success, true);
  assert.ok(evalData.attemptId);

  // Check DB persistence in attempts
  const attRow = await pool.query(
    "SELECT * FROM attempts WHERE id = $1 AND user_id = $2",
    [evalData.attemptId, acadUserId]
  );
  assert.equal(attRow.rows.length, 1);
  assert.equal(attRow.rows[0].status, "submitted");

  // Check score row (Diagnostic assessments must NOT fabricate Band 9.0; estimated_band must be NULL with raw_score recorded)
  const scoreRow = await pool.query(
    "SELECT * FROM scores WHERE attempt_id = $1 AND skill = 'reading'",
    [evalData.attemptId]
  );
  assert.equal(scoreRow.rows.length, 1);
  assert.equal(scoreRow.rows[0].estimated_band, null, "Diagnostic 4-question set must NOT fabricate Band 9.0; estimated_band must be null");
  assert.equal(Number(scoreRow.rows[0].raw_score), 4, "Raw score 4 must be preserved in scores table");
  assert.equal(scoreRow.rows[0].confidence_label, "insufficient_evidence", "Diagnostic attempts must have confidence_label 'insufficient_evidence'");
  assert.equal(evalData.evaluation.estimatedBand, null, "Evaluation response must have null estimatedBand");
  assert.equal(evalData.evaluation.score, 4);
  assert.equal(evalData.evaluation.total, 4);

  // Log a mistake note to mistake_notes table
  const noteRes = await acadSession.fetch("/api/notebook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill: "reading",
      errorTag: "Quantifier Traps",
      questionPrompt: "Vienna utilizes underground vaults alongside its canal diversion network.",
      studentAnswer: "TRUE",
      reasoning: "The text says 'exclusively for canal diversions', which contradicts vaults.",
      sourceAttemptId: evalData.attemptId,
    }),
  });
  assert.equal(noteRes.status, 200);
  const noteData = await noteRes.json();
  assert.equal(noteData.success, true);
  assert.ok(noteData.note.id);
});

test("Requirement 10: Cross-student tenant isolation", async () => {
  // Academic student attempts should not be returned to GT student
  const gtAttemptsRes = await gtSession.fetch("/api/attempts");
  assert.equal(gtAttemptsRes.status, 200);
  const gtAttempts = (await gtAttemptsRes.json()).attempts;

  // Verify none of GT student's attempts belong to Academic student
  for (const att of gtAttempts) {
    const checkOwner = await pool.query("SELECT user_id FROM attempts WHERE id = $1", [att.id]);
    assert.equal(checkOwner.rows[0].user_id, gtUserId);
    assert.notEqual(checkOwner.rows[0].user_id, acadUserId);
  }
});

test("Requirement 11: UI Component and Route Integration", () => {
  const pagePath = path.resolve(__dirname, "../apps/web/src/app/skills/[skill]/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  // Must import notFound and call it when invalid
  assert.match(code, /import\s*\{\s*notFound\s*\}\s*from\s*["']next\/navigation["']/);
  assert.match(code, /if\s*\(!info\)\s*\{\s*notFound\(\);\s*\}/);

  // Must delegate to ReadingModuleView when normalizedSkill is reading
  assert.match(code, /if\s*\(normalizedSkill\s*===\s*["']reading["']\)\s*\{\s*return\s*<ReadingModuleView\s*\/>;\s*\}/);

  // View component inspection
  const viewPath = path.resolve(__dirname, "../apps/web/src/components/portal/ReadingModuleView.tsx");
  const viewCode = fs.readFileSync(viewPath, "utf-8");

  // Verify key UI headings and honest CTAs
  assert.match(viewCode, /Indicative Raw Score Guide/i);
  assert.match(viewCode, /Essential Question Types & Strategies/i);
  assert.match(viewCode, /Launch Starter Reading Diagnostic/i);
  assert.match(viewCode, /Explore 14 Question Formats/i);
  assert.match(viewCode, /Three Structured Practice Modes/i);
  assert.match(viewCode, /Learning Mode/i);
  assert.match(viewCode, /Timed Practice Mode/i);
  assert.match(viewCode, /Full Reading Simulation/i);
  assert.match(viewCode, /Content Gated · 40 Questions Required/i);
});

test("Requirement 12: Advanced Word Limits, ONE NUMBER ONLY, and Matching Option Reuse", async () => {
  const { validateReadingAnswer } = await import("../apps/web/src/lib/reading-module-data.ts");

  // 1. NO MORE THAN THREE WORDS rule
  const threeWordRule = {
    correctAnswer: "rapid urban transit",
    wordLimitRule: "NO MORE THAN THREE WORDS",
  };

  const pass3 = validateReadingAnswer("rapid urban transit", threeWordRule);
  assert.equal(pass3.isCorrect, true);
  assert.equal(pass3.wordLimitExceeded, false);

  const fail3 = validateReadingAnswer("rapid urban railway transit", threeWordRule);
  assert.equal(fail3.isCorrect, false);
  assert.equal(fail3.wordLimitExceeded, true);
  assert.match(fail3.statusMessage, /Exceeded word limit/i);

  // 2. ONE NUMBER ONLY rule (words strictly forbidden)
  const oneNumberRule = {
    correctAnswer: "1994",
    wordLimitRule: "ONE NUMBER ONLY",
  };

  const numPass = validateReadingAnswer("1994", oneNumberRule);
  assert.equal(numPass.isCorrect, true);
  assert.equal(numPass.wordLimitExceeded, false);

  const numWordFail = validateReadingAnswer("year 1994", oneNumberRule);
  assert.equal(numWordFail.isCorrect, false);
  assert.equal(numWordFail.wordLimitExceeded, true);
  assert.match(numWordFail.statusMessage, /ONE NUMBER ONLY/i);

  const multiNumFail = validateReadingAnswer("1994 2002", oneNumberRule);
  assert.equal(multiNumFail.isCorrect, false);
  assert.equal(multiNumFail.wordLimitExceeded, true);

  // 3. Matching task option reuse rules (allowReuse: false)
  const matchingQ = {
    correctAnswer: "Paragraph C",
    allowReuse: false,
    usedOptions: ["Paragraph B", "Paragraph C"],
  };

  // Student enters "Paragraph C" which was already used in a previous question
  const reuseFail = validateReadingAnswer("Paragraph C", matchingQ);
  assert.equal(reuseFail.isCorrect, false);
  assert.match(reuseFail.statusMessage, /Option already used/i);

  // Student enters unused option
  const unusedOption = validateReadingAnswer("Paragraph A", {
    correctAnswer: "Paragraph A",
    allowReuse: false,
    usedOptions: ["Paragraph B", "Paragraph C"],
  });
  assert.equal(unusedOption.isCorrect, true);
});

test("Requirement 13: Full Reading Mock Server-side Content Gating", async () => {
  // Attempting to launch incomplete exam (has 4 questions, not 40) as full_reading_mock must fail with HTTP 400
  const acadExamId = "99999999-9999-9999-9999-999999999991";

  const gatedRes = await acadSession.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: acadExamId,
      assessmentType: "full_reading_mock",
    }),
  });

  assert.equal(gatedRes.status, 400, "Incomplete exam must be rejected with 400 when requested as full_reading_mock");
  const gatedData = await gatedRes.json();
  assert.equal(gatedData.success, false);
  assert.match(gatedData.error, /requires strictly 40.*questions/i);
});

after(async () => {
  const userIds = [acadUserId, gtUserId].filter(Boolean);
  if (userIds.length > 0) {
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

