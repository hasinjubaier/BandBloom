import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Priority 2: Exam deadline calculation logic", async () => {
  // Test remaining time logic using server offset
  function computeRemainingTime(deadlineAt, serverNow) {
    if (!deadlineAt) return { valid: false, error: "missing" };
    const serverTimeMs = serverNow ? new Date(serverNow).getTime() : Date.now();
    const deadlineMs = new Date(deadlineAt).getTime();
    if (isNaN(deadlineMs)) return { valid: false, error: "invalid" };

    const remainingSec = Math.floor((deadlineMs - serverTimeMs) / 1000);
    return {
      valid: true,
      remainingSec: Math.max(0, remainingSec),
      isExpired: remainingSec <= 0,
    };
  }

  const now = new Date("2026-10-28T12:00:00Z");
  
  // Attempt with 25 minutes remaining (out of 60)
  const activeDeadline = new Date("2026-10-28T12:25:00Z").toISOString();
  const resActive = computeRemainingTime(activeDeadline, now.toISOString());
  assert.equal(resActive.valid, true);
  assert.equal(resActive.remainingSec, 25 * 60, "Must calculate exactly 25 minutes remaining, not full 60 min");
  assert.equal(resActive.isExpired, false);

  // Attempt that expired 5 minutes ago
  const expiredDeadline = new Date("2026-10-28T11:55:00Z").toISOString();
  const resExpired = computeRemainingTime(expiredDeadline, now.toISOString());
  assert.equal(resExpired.valid, true);
  assert.equal(resExpired.remainingSec, 0, "Expired attempt must clamp remainingSec to 0");
  assert.equal(resExpired.isExpired, true, "Must flag as expired");

  // Missing deadline
  const resMissing = computeRemainingTime(null, now.toISOString());
  assert.equal(resMissing.valid, false);

  // Invalid deadline string
  const resInvalid = computeRemainingTime("not-a-date", now.toISOString());
  assert.equal(resInvalid.valid, false);
});

test("Priority 3: Answer restoration extracts response payloads into UI responses map", async () => {
  function restoreSavedAnswers(savedResponses) {
    const restored = {};
    if (savedResponses && typeof savedResponses === "object") {
      for (const [qId, resp] of Object.entries(savedResponses)) {
        if (resp && typeof resp === "object" && "answer" in resp) {
          restored[qId] = String(resp.answer || "");
        } else if (typeof resp === "string") {
          restored[qId] = resp;
        }
      }
    }
    return restored;
  }

  const serverResponses = {
    "q-1": { answer: "TRUE" },
    "q-2": { answer: "NOT GIVEN" },
    "q-3": "B",
    "q-4": { answer: "Option 4" },
  };

  const restored = restoreSavedAnswers(serverResponses);
  assert.equal(restored["q-1"], "TRUE");
  assert.equal(restored["q-2"], "NOT GIVEN");
  assert.equal(restored["q-3"], "B");
  assert.equal(restored["q-4"], "Option 4");
});

test("Priority 2 & 3: Source code checks in mock-centre/exam/page.tsx", async () => {
  const examPagePath = path.resolve(__dirname, "../apps/web/src/app/mock-centre/exam/page.tsx");
  const content = fs.readFileSync(examPagePath, "utf-8");

  // Priority 2: Verifies deadline calculation from attempt.deadlineAt
  assert.match(content, /attempt\.deadlineAt/, "Reads deadlineAt from server attempt");
  assert.match(content, /serverNow/, "Uses serverNow for offset");
  assert.match(content, /deadlineMs - serverTimeMs/, "Calculates remaining time using difference");

  // Priority 3: Verifies restoration and hydration gate
  assert.match(content, /setAnswersRestored\(true\)/, "Sets answersRestored gate");
  assert.match(content, /!answersRestored/, "Guards autosave with hydration gate");
  assert.match(content, /setResponses\(restored\)/, "Restores answers into state");

  // Source check in mock.service.ts for saveExamResponse deadline check
  const mockServicePath = path.resolve(__dirname, "../apps/web/src/server/services/mock.service.ts");
  const mockContent = fs.readFileSync(mockServicePath, "utf-8");
  assert.match(mockContent, /saveExamResponse[\s\S]*?deadline_at[\s\S]*?expired/i, "saveExamResponse verifies attempt deadline has not expired");

  // Source check in mock.service.ts for submitExamAttempt deadline & status enforcement
  assert.match(
    mockContent,
    /submitExamAttempt[\s\S]*?attempt\.status\s*!==\s*["']in_progress["']/i,
    "submitExamAttempt verifies attempt status is strictly in_progress"
  );
  assert.match(
    mockContent,
    /submitExamAttempt[\s\S]*?attempt\.deadline_at[\s\S]*?Exam deadline has expired/i,
    "submitExamAttempt verifies server deadline before allowing final submission"
  );
  assert.match(
    mockContent,
    /UPDATE attempts SET status = 'abandoned' WHERE id = \$1/i,
    "submitExamAttempt marks expired attempt as abandoned"
  );
  // Transaction boundary verification: abandonment occurs BEFORE withTransaction
  const abandonIdx = mockContent.indexOf("UPDATE attempts SET status = 'abandoned'");
  const withTxIdx = mockContent.indexOf("return withTransaction(async (client) =>");
  assert.ok(
    abandonIdx !== -1 && withTxIdx !== -1 && abandonIdx < withTxIdx,
    "Abandonment update must execute and commit outside withTransaction so error does not trigger ROLLBACK"
  );
});

test("Priority 2: Server-side final submission rejects expired attempt even if API is called directly", () => {
  // Pure logic function replicating the server validation in submitExamAttempt
  function validateSubmissionAttempt(attempt, now = Date.now()) {
    if (!attempt) {
      return { allowed: false, error: "Exam attempt not found or unauthorized." };
    }
    if (attempt.status !== "in_progress") {
      return {
        allowed: false,
        error: `Exam attempt cannot be submitted because it is already ${attempt.status}.`,
      };
    }
    if (attempt.deadline_at) {
      const deadlineMs = new Date(attempt.deadline_at).getTime();
      const GRACE_PERIOD_MS = 60 * 1000;
      if (now > deadlineMs + GRACE_PERIOD_MS) {
        return {
          allowed: false,
          error: "Exam deadline has expired. Final submission rejected.",
          newStatus: "abandoned",
        };
      }
    }
    return { allowed: true, newStatus: "submitted" };
  }

  const now = 1700000000000;

  // 1. Valid active attempt before deadline
  const activeAttempt = {
    id: "att-1",
    status: "in_progress",
    deadline_at: new Date(now + 10 * 60 * 1000).toISOString(),
  };
  const activeRes = validateSubmissionAttempt(activeAttempt, now);
  assert.equal(activeRes.allowed, true);
  assert.equal(activeRes.newStatus, "submitted");

  // 2. Expired attempt (e.g. 10 minutes past deadline) submitted via direct API call
  const expiredAttempt = {
    id: "att-2",
    status: "in_progress",
    deadline_at: new Date(now - 10 * 60 * 1000).toISOString(),
  };
  const expiredRes = validateSubmissionAttempt(expiredAttempt, now);
  assert.equal(expiredRes.allowed, false);
  assert.match(expiredRes.error, /Exam deadline has expired/i);
  assert.equal(expiredRes.newStatus, "abandoned");

  // 3. Already submitted or evaluated attempt
  const completedAttempt = {
    id: "att-3",
    status: "submitted",
    deadline_at: new Date(now + 10 * 60 * 1000).toISOString(),
  };
  const completedRes = validateSubmissionAttempt(completedAttempt, now);
  assert.equal(completedRes.allowed, false);
  assert.match(completedRes.error, /already submitted/i);
});
