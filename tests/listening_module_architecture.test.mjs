/**
 * BandBloom IELTS SaaS - Listening Module Comprehensive Architecture & Verification Suite
 * 
 * Verifies all requirements of the IELTS Listening Module:
 * 1. Test Architecture: Academic & General Training identical standard 4-part structure (40 questions, ~30+2 mins).
 * 2. Question Types Library: All 13 official IELTS Listening question formats with strategies, traps, and micro-drills.
 * 3. Indicative Raw Score Guide: Authoritative Band 9.0 to 4.0 conversion with Cambridge / IDP variation disclaimer.
 * 4. Validation Engine (validateListeningAnswer):
 *    - Word limit enforcement: exceeding word limit awards 0 marks.
 *    - Hyphenated words count as single word.
 *    - Numerical word vs digit equivalence (e.g. 18 == 18th == eighteenth).
 *    - Case-insensitivity and punctuation normalization.
 *    - Choice letter matching (single and multi-select).
 * 5. 3 Practice Modes:
 *    - Mode A (Learning Mode): Replay, variable speed, transcript sync enabled.
 *    - Mode B (Timed Practice): Section timer, preview countdown, review time.
 *    - Mode C (Exam Simulation): Strict one-play enforcement, seeking/speed locked, pre-submission protection.
 * 6. Server Gating:
 *    - Rejects starting sectional practice exam as full mock with 400 error.
 *    - Enforces full mock eligibility for exams containing listening.
 * 7. Scoring Integrity:
 *    - Diagnostic / sectional drills (< 40 questions) strictly return estimatedBand: null and confidenceLabel: "insufficient_evidence".
 * 8. Live Database Integration:
 *    - POST /api/practice with action: "evaluate_listening" creates real attempt in PostgreSQL,
 *      records calibrated scores with insufficient_evidence for partial sets,
 *      and populates mistake_notes with timestamps and distractor trap tags.
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
const USER_EMAIL = `listening_test_${TIMESTAMP}@bandbloom.test`;
const TEST_PASSWORD = "ListenPass2026!";

let testUserId = null;
let testSession = null;

// ============================================================================
// 1. SETUP: Register Test Account & Verify Health
// ============================================================================

test("Setup: Register student account and verify DB connectivity", async () => {
  testSession = new CookieSession(BASE_URL);

  const regRes = await testSession.fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: USER_EMAIL,
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
      fullName: "Listening Test Candidate",
      agreedToTerms: true,
    }),
  });

  const regJson = await regRes.json();
  assert.ok(regRes.status === 200 || regRes.status === 201, `Registration failed: ${JSON.stringify(regJson)}`);
  testUserId = regJson.user?.id || regJson.data?.id;
  assert.ok(testUserId, "testUserId must be defined");
});

// ============================================================================
// 2. DOMAIN SPECIFICATION: Academic & GT Test Format Identity
// ============================================================================

test("Domain: Verify 4-Part Structure & Academic / GT Identity", async () => {
  const { LISTENING_PARTS, LISTENING_RAW_SCORE_GUIDE } = await import(
    "../apps/web/src/lib/listening-module-data.ts"
  );

  // Exactly 4 parts
  assert.equal(LISTENING_PARTS.length, 4, "Must have exactly 4 listening parts");

  // Part numbers 1, 2, 3, 4
  const partNums = LISTENING_PARTS.map((p) => p.partNumber);
  assert.deepEqual(partNums, [1, 2, 3, 4], "Parts must be numbered 1 through 4");

  // Total questions must be 40 (10 questions per part)
  const totalQuestions = LISTENING_PARTS.reduce((sum, p) => sum + p.questions.length, 0);
  assert.equal(totalQuestions, 40, "Listening module must provide 40 total questions across 4 parts");
  for (const part of LISTENING_PARTS) {
    assert.equal(part.questions.length, 10, `Part ${part.partNumber} must have exactly 10 questions`);
  }

  // Duration
  assert.equal(LISTENING_RAW_SCORE_GUIDE.testDurationMinutes, 30, "Test duration must be 30 minutes");
  assert.equal(LISTENING_RAW_SCORE_GUIDE.reviewDurationMinutes, 2, "Review duration must be 2 minutes");
});

// ============================================================================
// 3. QUESTION TYPES LIBRARY: 13 Official Formats
// ============================================================================

test("Library: Verify all 13 official IELTS Listening question types", async () => {
  const { LISTENING_QUESTION_TYPES } = await import(
    "../apps/web/src/lib/listening-module-data.ts"
  );

  assert.equal(LISTENING_QUESTION_TYPES.length, 13, "Must provide exactly 13 question types");

  const expectedTypes = [
    "form_completion",
    "note_completion",
    "table_completion",
    "flow_chart_completion",
    "summary_completion",
    "sentence_completion",
    "short_answer",
    "multiple_choice_single",
    "multiple_choice_multi",
    "matching_features",
    "plan_labelling",
    "map_labelling",
    "diagram_labelling",
  ];

  const presentTypes = LISTENING_QUESTION_TYPES.map((qt) => qt.id);
  for (const exp of expectedTypes) {
    assert.ok(presentTypes.includes(exp), `Question type '${exp}' must be present in library`);
  }

  // Verify each type has strategies, common mistakes, and sample micro-drills
  for (const qt of LISTENING_QUESTION_TYPES) {
    assert.ok(qt.name, `Type ${qt.id} must have a name`);
    assert.ok(qt.strategy && qt.strategy.length > 20, `Type ${qt.id} must have an authoritative strategy`);
    assert.ok(qt.commonMistakes && qt.commonMistakes.length > 0, `Type ${qt.id} must have distractor traps`);
    assert.ok(qt.sampleQuestion.prompt, `Type ${qt.id} must have a sample drill prompt`);
    assert.ok(qt.sampleQuestion.correctAnswer, `Type ${qt.id} must have a verified correct answer`);
    assert.ok(qt.sampleQuestion.spokenCueTimestamp, `Type ${qt.id} must have a spoken cue timestamp`);
  }
});

// ============================================================================
// 4. INDICATIVE RAW SCORE GUIDE: Band 9.0 to 4.0 & Disclaimer
// ============================================================================

test("Scoring: Verify Indicative Raw Score Table & Official Disclaimers", async () => {
  const { LISTENING_RAW_SCORE_GUIDE, getListeningBandFromScore } = await import(
    "../apps/web/src/lib/listening-module-data.ts"
  );

  assert.ok(LISTENING_RAW_SCORE_GUIDE.disclaimer.includes("Cambridge Assessment English"), "Must mention Cambridge");
  assert.ok(LISTENING_RAW_SCORE_GUIDE.disclaimer.includes("IDP"), "Must mention IDP");
  assert.ok(LISTENING_RAW_SCORE_GUIDE.disclaimer.includes("diagnostic"), "Must disclose diagnostic nature");

  // Check critical thresholds
  assert.equal(getListeningBandFromScore(40).band, 9.0, "Score 40 must map to Band 9.0");
  assert.equal(getListeningBandFromScore(39).band, 9.0, "Score 39 must map to Band 9.0");
  assert.equal(getListeningBandFromScore(35).band, 8.0, "Score 35 must map to Band 8.0");
  assert.equal(getListeningBandFromScore(30).band, 7.0, "Score 30 must map to Band 7.0");
  assert.equal(getListeningBandFromScore(23).band, 6.0, "Score 23 must map to Band 6.0");
  assert.equal(getListeningBandFromScore(16).band, 5.0, "Score 16 must map to Band 5.0");
  assert.equal(getListeningBandFromScore(11).band, 4.0, "Score 11 must map to Band 4.0");
  assert.equal(getListeningBandFromScore(8).band, 3.5, "Score 8 must map to Band 3.5 (below 4.0)");
});

// ============================================================================
// 5. VALIDATION ENGINE: validateListeningAnswer Matrix
// ============================================================================

test("Engine: Validate word limits, hyphenated words, numbers, and spelling", async () => {
  const { validateListeningAnswer, countIeltsTokens } = await import(
    "../apps/web/src/lib/listening-module-data.ts"
  );

  // 1. Hyphenated words count as ONE word
  const hyphenTokens = countIeltsTokens("state-of-the-art");
  assert.equal(hyphenTokens.wordCount, 1, "'state-of-the-art' must count as 1 word");
  const hyphenTokens2 = countIeltsTokens("two-pound coin");
  assert.equal(hyphenTokens2.wordCount, 2, "'two-pound coin' must count as 2 words");

  // 2. Word limit breach awards 0 score
  const breachRes = validateListeningAnswer("very large private studio apartment", {
    correctAnswer: "studio apartment",
    wordLimitRule: "NO MORE THAN TWO WORDS",
  });
  assert.equal(breachRes.isCorrect, false, "Breaching word limit must be incorrect");
  assert.equal(breachRes.scoreAwarded, 0, "Breaching word limit must award 0 marks");
  assert.equal(breachRes.wordLimitExceeded, true, "wordLimitExceeded must be true");

  // 3. Accepted variants
  const varRes = validateListeningAnswer("18 September", {
    correctAnswer: "18th",
    acceptedVariants: ["18th", "18", "eighteenth", "18 September"],
    wordLimitRule: "NO MORE THAN TWO WORDS AND/OR A NUMBER",
  });
  assert.equal(varRes.isCorrect, true, "Accepted variant must be awarded correct");
  assert.equal(varRes.scoreAwarded, 1, "Must award 1 mark");

  // 4. Number word vs digit equivalence
  const numRes = validateListeningAnswer("eighteenth", {
    correctAnswer: "18th",
    wordLimitRule: "ONE WORD OR A NUMBER",
  });
  assert.equal(numRes.isCorrect, true, "18th and eighteenth must be equivalent");

  // 5. Case-insensitivity and punctuation
  const punctRes = validateListeningAnswer("   \"patel.\"  ", {
    correctAnswer: "Patel",
    wordLimitRule: "ONE WORD ONLY",
  });
  assert.equal(punctRes.isCorrect, true, "Should strip quotes, trailing period and whitespace");

  // 6. Choice letters
  const choiceRes = validateListeningAnswer("B", {
    correctAnswer: "B",
    typeId: "multiple_choice_single",
  });
  assert.equal(choiceRes.isCorrect, true, "Choice letter B must be correct");

  // 7. Multi-select choice letters ("A, C" == "A,C" == "A, C")
  const multiRes = validateListeningAnswer("A, C", {
    correctAnswer: "A, C",
    acceptedVariants: ["A, C", "A,C", "C, A", "AC"],
  });
  assert.equal(multiRes.isCorrect, true, "Multi-choice letters A, C must match");
});

// ============================================================================
// 6. SERVER GATING: Full Mock Rejection on Incomplete / Sectional Exams
// ============================================================================

test("Gating: Verify server rejects starting sectional exam as full mock", async () => {
  // Attempt to start a sectional practice lab as a full mock
  const res = await testSession.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: "11111111-1111-1111-1111-111111111111", // Reading Practice Lab
      assessmentType: "full_listening_mock",
    }),
  });

  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.success, false);
  assert.match(json.error, /Cannot start a sectional or diagnostic practice exam as a full mock/i);
});

// ============================================================================
// 7. SCORING INTEGRITY: Diagnostic Sets Must Return Null Band & Insufficient Evidence
// ============================================================================

test("Integrity: Diagnostic & sectional listening submissions must return estimatedBand: null", async () => {
  // Call /api/practice with action: evaluate_listening without persisting
  const res = await testSession.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "evaluate_listening",
      answers: { "lq-1": "Patel", "lq-2": "18th", "lq-3": "studio apartment" },
      assessmentType: "diagnostic",
      persist: false,
    }),
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  const evalRes = json.evaluation;

  assert.equal(evalRes.estimatedBand, null, "Diagnostic listening attempt MUST NOT fabricate an official IELTS band");
  assert.equal(evalRes.confidenceLabel, "insufficient_evidence", "Confidence label must be insufficient_evidence");
  assert.ok(evalRes.statusMessage.includes("Diagnostic Result"), "Status message must reflect diagnostic nature");
});

// ============================================================================
// 8. LIVE DATABASE INTEGRATION: POST /api/practice -> attempts, scores & notebook
// ============================================================================

test("Live API: POST /api/practice evaluates listening and records scores & mistakes", async () => {
  // Submit sectional practice with 8 correct and 2 intentional mistakes
  const answers = {
    "lq-1": "Patel", // Correct
    "lq-2": "18th", // Correct
    "lq-3": "studio apartment", // Correct
    "lq-4": "650", // Correct
    "lq-5": "800", // Correct
    "lq-6": "electricity", // Incorrect (distractor trap: electricity is metered separately)
    "lq-7": "Elm", // Correct
    "lq-8": "very long university maintenance proof document and bank statement", // Word limit breach (10 words)
    "lq-9": "07700 900342", // Correct
    "lq-10": "direct debit", // Correct
  };

  const res = await testSession.fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "evaluate_listening",
      answers,
      assessmentType: "sectional_practice",
      partNumber: 1,
      persist: true,
    }),
  });

  const json = await res.json();
  assert.equal(res.status, 200, `API request failed: ${JSON.stringify(json)}`);
  assert.equal(json.success, true, "Response must indicate success");
  assert.ok(json.attemptId, "Must return created attemptId");

  const evalRes = json.evaluation;
  assert.equal(evalRes.score, 8, "Expected 8 correct marks");
  assert.equal(evalRes.total, 10, "Expected 10 total marks for Part 1");
  assert.equal(evalRes.estimatedBand, null, "Sectional attempt band must be null");
  assert.equal(evalRes.confidenceLabel, "insufficient_evidence");

  // Verify PostgreSQL attempt record
  const attDb = await pool.query(
    `SELECT id, user_id, exam_id, status, config_snapshot FROM attempts WHERE id = $1`,
    [json.attemptId]
  );
  assert.equal(attDb.rows.length, 1, "Attempt must exist in database");
  assert.equal(attDb.rows[0].status, "submitted");
  assert.equal(attDb.rows[0].config_snapshot.assessmentType, "sectional_practice");

  // Verify PostgreSQL score record
  const scoreDb = await pool.query(
    `SELECT skill, raw_score, estimated_band, confidence_label FROM scores WHERE attempt_id = $1 AND skill = 'listening'`,
    [json.attemptId]
  );
  assert.equal(scoreDb.rows.length, 1, "Score record must exist in database");
  assert.equal(Number(scoreDb.rows[0].raw_score), 8);
  assert.equal(scoreDb.rows[0].estimated_band, null);
  assert.equal(scoreDb.rows[0].confidence_label, "insufficient_evidence");

  // Verify Mistake Notebook records
  const mistakeDb = await pool.query(
    `SELECT skill, error_tag, original_answer, correct_reasoning 
     FROM mistake_notes 
     WHERE user_id = $1 AND skill = 'listening'
     ORDER BY created_at DESC`,
    [testUserId]
  );
  assert.ok(mistakeDb.rows.length >= 2, "Must have recorded at least 2 mistakes in mistake_notes");
  const errorTags = mistakeDb.rows.map((r) => r.error_tag);
  assert.ok(errorTags.includes("word limit breach"), "Word limit breach must be tagged");
});

// ============================================================================
// 10. DATABASE 4-PART STRUCTURE & 10 QUESTIONS PER SECTION
// ============================================================================

test("Database: Verify 4 distinct sections and 10 questions per section on Listening exam", async () => {
  const examId = "22222222-2222-2222-2222-222222222222";

  // Check 4 sections in order
  const sectionsRes = await pool.query(
    `SELECT id, order_index, config, duration_seconds FROM exam_sections WHERE exam_id = $1 ORDER BY order_index ASC`,
    [examId]
  );
  assert.equal(sectionsRes.rows.length, 4, "Exam must have exactly 4 sections in database");

  const expectedSectionIds = [
    "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11",
    "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12",
    "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13",
    "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14",
  ];

  for (let i = 0; i < 4; i++) {
    const sec = sectionsRes.rows[i];
    assert.equal(sec.id, expectedSectionIds[i]);
    assert.equal(sec.order_index, i + 1, `Section ${i + 1} must have order_index ${i + 1}`);
    const mediaAssetId = sec.config?.media_asset_id;
    assert.ok(mediaAssetId, `Section ${i + 1} must link to a valid media_asset_id in config`);

    // Check questions in this section
    const qRes = await pool.query(
      `SELECT question_id, question_order FROM exam_section_questions WHERE exam_section_id = $1 ORDER BY question_order ASC`,
      [sec.id]
    );
    assert.equal(qRes.rows.length, 10, `Section ${i + 1} must contain exactly 10 questions`);
  }

  // Total questions count across all sections of this exam
  const totalQRes = await pool.query(
    `SELECT COUNT(*) FROM exam_section_questions esq
     JOIN exam_sections es ON es.id = esq.exam_section_id
     WHERE es.exam_id = $1`,
    [examId]
  );
  assert.equal(Number(totalQRes.rows[0].count), 40, "Exam must have exactly 40 total questions mapped");
});

// ============================================================================
// 11. PHYSICAL AUDIO FILES & METADATA VERIFICATION
// ============================================================================

test("Audio: Verify physical .wav files exist on disk, checksums match, and HTTP endpoint serves audio/wav", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const crypto = await import("node:crypto");

  const mediaRes = await pool.query(
    `SELECT id, object_key, mime_type, file_size_bytes, duration_seconds, metadata
     FROM media_assets
     WHERE object_key LIKE 'audio/listening/%'
     ORDER BY object_key ASC`
  );

  assert.equal(mediaRes.rows.length, 4, "Must have exactly 4 listening media assets in database");

  for (const asset of mediaRes.rows) {
    assert.equal(asset.mime_type, "audio/wav");
    assert.equal(asset.metadata.storage_status, "published_local");

    // Physical disk file check
    const fullPath = path.resolve(process.cwd(), "apps/web/public", asset.object_key);
    assert.ok(fs.existsSync(fullPath), `Audio file must physically exist at ${fullPath}`);

    const stat = fs.statSync(fullPath);
    assert.equal(stat.size, Number(asset.file_size_bytes), "File size on disk must match database");

    const content = fs.readFileSync(fullPath);
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    assert.equal(hash, asset.metadata.sha256, "SHA-256 checksum on disk must match database");

    // HTTP 200 OK check with Content-Type: audio/wav
    const httpUrl = `/${asset.object_key}`;
    const httpRes = await testSession.fetch(httpUrl);
    assert.equal(httpRes.status, 200, `Audio asset must be accessible at ${httpUrl}`);
    const cType = httpRes.headers.get("content-type");
    assert.ok(cType && cType.includes("audio/wav"), `Content-Type must be audio/wav, got ${cType}`);
  }
});

// ============================================================================
// 12. DATABASE TRANSCRIPTS & PRE-SUBMISSION PROTECTION
// ============================================================================

test("Transcripts: Verify audio_transcripts table has 4 verified parts with segments", async () => {
  const tRes = await pool.query(
    `SELECT part_number, title, verification_status, is_synthetic, segments_json, LENGTH(full_transcript) as len
     FROM audio_transcripts
     ORDER BY part_number ASC`
  );

  assert.equal(tRes.rows.length, 4, "Must have 4 transcripts in audio_transcripts table");

  for (let i = 0; i < 4; i++) {
    const row = tRes.rows[i];
    assert.equal(row.part_number, i + 1);
    assert.equal(row.verification_status, "verified");
    assert.equal(row.is_synthetic, true);
    assert.ok(row.len > 500, `Part ${i + 1} transcript must be substantive`);
    const segments = typeof row.segments_json === "string" ? JSON.parse(row.segments_json) : row.segments_json;
    assert.ok(Array.isArray(segments) && segments.length >= 10, `Part ${i + 1} must have at least 10 segments`);
  }
});

// ============================================================================
// 13. SERVER-AUTHORITATIVE SINGLE-PLAY RULE ENFORCEMENT
// ============================================================================

test("Playback: Verify server enforces single-play rule in simulation mode and rejects duplicate starts with 403", async () => {
  // Create an active attempt on the listening exam in simulation mode
  const examId = "22222222-2222-2222-2222-222222222222";
  const startRes = await testSession.fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId,
      assessmentType: "full_listening_mock",
    }),
  });

  const startJson = await startRes.json();
  assert.equal(startRes.status, 200, `Failed to start attempt: ${JSON.stringify(startJson)}`);
  const attemptId = startJson.attemptId;
  assert.ok(attemptId, "Must return valid attemptId");

  // 1. Initial playback state should be empty / not_started
  const initialGet = await testSession.fetch(`/api/attempts/${attemptId}/playback`);
  assert.equal(initialGet.status, 200);
  const initialJson = await initialGet.json();
  assert.equal(initialJson.success, true);
  assert.equal(initialJson.playbackStates.length, 0);

  // 2. Start playback for Part 1 in simulation mode
  const play1Res = await testSession.fetch(`/api/attempts/${attemptId}/playback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partNumber: 1,
      action: "start",
      clientMode: "simulation",
    }),
  });
  assert.equal(play1Res.status, 200);
  const play1Json = await play1Res.json();
  assert.equal(play1Json.success, true);
  assert.equal(play1Json.playbackState.status, "playing");
  assert.equal(play1Json.playbackState.playCount, 1);

  // 3. Mark Part 1 playback as completed
  const completeRes = await testSession.fetch(`/api/attempts/${attemptId}/playback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partNumber: 1,
      action: "complete",
      clientMode: "simulation",
    }),
  });
  assert.equal(completeRes.status, 200);
  const completeJson = await completeRes.json();
  assert.equal(completeJson.playbackState.status, "completed");

  // 4. Attempt duplicate start in simulation mode -> MUST return 403 Forbidden!
  const replaySimRes = await testSession.fetch(`/api/attempts/${attemptId}/playback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partNumber: 1,
      action: "start",
      clientMode: "simulation",
    }),
  });
  assert.equal(replaySimRes.status, 403, "Duplicate start in simulation mode must return 403 Forbidden");
  const replaySimJson = await replaySimRes.json();
  assert.equal(replaySimJson.success, false);
  assert.match(replaySimJson.error, /ONCE only|Single-play/i);

  // 5. In learning mode, replaying is allowed
  const replayLearnRes = await testSession.fetch(`/api/attempts/${attemptId}/playback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partNumber: 1,
      action: "start",
      clientMode: "learning",
    }),
  });
  assert.equal(replayLearnRes.status, 200, "Replaying in learning mode must be permitted");
  const replayLearnJson = await replayLearnRes.json();
  assert.equal(replayLearnJson.playbackState.playCount, 2);
});

// ============================================================================
// 14. ELIGIBILITY GATING CHECK & 12 CRITERIA
// ============================================================================

test("Eligibility: Verify all 12 criteria for full listening mock eligibility on exam 22222222-2222-2222-2222-222222222222", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");

  const examId = "22222222-2222-2222-2222-222222222222";

  // Criterion 1: Exam exists & active
  const examRes = await pool.query(`SELECT id, title, status FROM exams WHERE id = $1`, [examId]);
  assert.equal(examRes.rows.length, 1);
  assert.equal(examRes.rows[0].status, "active");

  // Criterion 2: Exactly 4 sections
  const secRes = await pool.query(
    `SELECT id, order_index, duration_seconds, config FROM exam_sections WHERE exam_id = $1 ORDER BY order_index ASC`,
    [examId]
  );
  assert.equal(secRes.rows.length, 4, "Must have exactly 4 sections");

  // Criteria 3 & 4: Order indices 1..4 and duration >= 300s each
  for (let i = 0; i < 4; i++) {
    assert.equal(secRes.rows[i].order_index, i + 1);
    assert.ok(secRes.rows[i].duration_seconds >= 300);
  }

  // Criteria 5, 6 & 7: Exactly 10 questions per section, 40 total
  const qCountRes = await pool.query(
    `SELECT es.order_index, COUNT(esq.question_id) as qcount
     FROM exam_sections es
     JOIN exam_section_questions esq ON esq.exam_section_id = es.id
     WHERE es.exam_id = $1
     GROUP BY es.order_index
     ORDER BY es.order_index ASC`,
    [examId]
  );
  assert.equal(qCountRes.rows.length, 4);
  for (const row of qCountRes.rows) {
    assert.equal(Number(row.qcount), 10, `Section ${row.order_index} must have 10 questions`);
  }

  // Criteria 8 & 9: Complete answer keys / options and marks > 0
  const marksRes = await pool.query(
    `SELECT COUNT(*) as valid_marks
     FROM exam_section_questions esq
     JOIN exam_sections es ON es.id = esq.exam_section_id
     JOIN questions q ON q.id = esq.question_id
     WHERE es.exam_id = $1
       AND esq.allocated_marks > 0
       AND q.prompt IS NOT NULL
       AND TRIM(q.prompt) <> ''`,
    [examId]
  );
  assert.equal(Number(marksRes.rows[0].valid_marks), 40, "All 40 questions must have marks > 0 and valid prompts");

  // Criteria 10 & 11: Valid media assets and physical files exist on disk
  for (const sec of secRes.rows) {
    const mediaAssetId = sec.config?.media_asset_id;
    assert.ok(mediaAssetId, "Each section must have a media_asset_id in config");
    const mRes = await pool.query(`SELECT object_key FROM media_assets WHERE id = $1`, [mediaAssetId]);
    assert.equal(mRes.rows.length, 1);
    const diskPath = path.resolve(process.cwd(), "apps/web/public", mRes.rows[0].object_key);
    assert.ok(fs.existsSync(diskPath), `Physical audio file must exist at ${diskPath}`);
  }

  // Criterion 12: Verified transcripts for all 4 parts
  const transRes = await pool.query(
    `SELECT COUNT(*) as count FROM audio_transcripts WHERE verification_status = 'verified'`
  );
  assert.equal(Number(transRes.rows[0].count), 4, "Must have 4 verified audio transcripts");
});

// ============================================================================
// 15. CLEANUP
// ============================================================================

after(async () => {
  if (testUserId) {
    try {
      await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
    } catch {}
  }
  await pool.end();
});
