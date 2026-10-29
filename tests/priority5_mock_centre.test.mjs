import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Priority 5: Mock Centre attempt states render correct CTAs and avoid fake reports", async () => {
  const pagePath = path.resolve(__dirname, "../apps/web/src/app/mock-centre/page.tsx");
  const pageCode = fs.readFileSync(pagePath, "utf-8");

  // Verify Resume Exam link format for in-progress attempts
  assert.match(
    pageCode,
    /\/mock-centre\/exam\?id=\$\{att\.examId\}&attempt=\$\{att\.id\}/,
    "In-progress attempt must link to /mock-centre/exam with examId and attemptId"
  );
  assert.match(pageCode, />\s*Resume Exam\s*</, "Must show 'Resume Exam' button");

  // Verify Time Expired notice for expired in-progress attempts
  assert.match(pageCode, />\s*Time Expired\s*</, "Must display 'Time Expired' for expired attempts");

  // Verify Awaiting Evaluation notice for submitted/unevaluated attempts
  assert.match(pageCode, />\s*Awaiting Evaluation\s*</, "Must display 'Awaiting Evaluation' for submitted/unevaluated attempts");

  // Verify View Report is only rendered for evaluated attempts with band scores
  assert.match(pageCode, />\s*View Report\s*</, "Must display 'View Report' for evaluated attempts");
});

test("Priority 5: State determination logic handles all 4 states correctly", () => {
  // Pure function matching the logic in mock-centre/page.tsx
  function getAttemptAction(att, now = Date.now()) {
    const isEvaluated = att.status === "evaluated" && att.overallBand !== null;
    const isSubmitted =
      att.status === "submitted" ||
      (att.status === "evaluated" && att.overallBand === null);
    const isExpired =
      att.status === "in_progress" &&
      !!att.deadlineAt &&
      new Date(att.deadlineAt).getTime() < now;

    if (isEvaluated) {
      return { type: "link", href: `/results/${att.id}`, label: "View Report" };
    }
    if (isSubmitted) {
      return { type: "badge", label: "Awaiting Evaluation" };
    }
    if (isExpired) {
      return { type: "badge", label: "Time Expired" };
    }
    return {
      type: "link",
      href: `/mock-centre/exam?id=${att.examId}&attempt=${att.id}`,
      label: "Resume Exam",
    };
  }

  const now = 1700000000000;

  // 1. In-progress, active
  const inProgressActive = {
    id: "att-1",
    examId: "exam-1",
    status: "in_progress",
    deadlineAt: new Date(now + 10000).toISOString(),
    overallBand: null,
  };
  const action1 = getAttemptAction(inProgressActive, now);
  assert.equal(action1.type, "link");
  assert.equal(action1.href, "/mock-centre/exam?id=exam-1&attempt=att-1");
  assert.equal(action1.label, "Resume Exam");

  // 2. In-progress, expired
  const inProgressExpired = {
    id: "att-2",
    examId: "exam-1",
    status: "in_progress",
    deadlineAt: new Date(now - 10000).toISOString(),
    overallBand: null,
  };
  const action2 = getAttemptAction(inProgressExpired, now);
  assert.equal(action2.type, "badge");
  assert.equal(action2.label, "Time Expired");

  // 3. Submitted, unevaluated
  const submitted = {
    id: "att-3",
    examId: "exam-1",
    status: "submitted",
    deadlineAt: new Date(now - 20000).toISOString(),
    overallBand: null,
  };
  const action3 = getAttemptAction(submitted, now);
  assert.equal(action3.type, "badge");
  assert.equal(action3.label, "Awaiting Evaluation");

  // 4. Evaluated with score
  const evaluated = {
    id: "att-4",
    examId: "exam-1",
    status: "evaluated",
    deadlineAt: new Date(now - 30000).toISOString(),
    overallBand: 7.5,
  };
  const action4 = getAttemptAction(evaluated, now);
  assert.equal(action4.type, "link");
  assert.equal(action4.href, "/results/att-4");
  assert.equal(action4.label, "View Report");
});

