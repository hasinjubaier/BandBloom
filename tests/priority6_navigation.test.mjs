import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Priority 6: Practice and Lessons navigation ping-pong loop is broken", () => {
  const practicePath = path.resolve(__dirname, "../apps/web/src/app/practice/page.tsx");
  const practiceCode = fs.readFileSync(practicePath, "utf-8");

  // Verify Practice labs point to distinct /skills/* destinations instead of /lessons
  assert.match(practiceCode, /href:\s*["']\/skills\/reading["']/);
  assert.match(practiceCode, /href:\s*["']\/skills\/listening["']/);
  assert.match(practiceCode, /href:\s*["']\/skills\/writing["']/);
  assert.match(practiceCode, /href:\s*["']\/skills\/speaking["']/);
  assert.doesNotMatch(
    practiceCode,
    /href:\s*["']\/lessons["']/,
    "Practice page labs must not point back to /lessons"
  );

  const lessonsPath = path.resolve(__dirname, "../apps/web/src/app/lessons/page.tsx");
  const lessonsCode = fs.readFileSync(lessonsPath, "utf-8");

  // Verify Lessons start practice links point to distinct /skills/${l.skill} instead of /practice
  assert.match(
    lessonsCode,
    /href=\{\s*`\/skills\/\$\{l\.skill\}`\s*\}/,
    "Lessons must link to /skills/${l.skill}"
  );
  assert.doesNotMatch(
    lessonsCode,
    /href=["']\/practice["']/,
    "Lessons must not ping-pong back to /practice"
  );
});

test("Priority 6: skillsConfig routes point to distinct skill pages", () => {
  const configPath = path.resolve(__dirname, "../apps/web/src/data/skillsConfig.ts");
  const configCode = fs.readFileSync(configPath, "utf-8");

  assert.match(configCode, /id:\s*"reading"[\s\S]*?href:\s*"\/skills\/reading"/);
  assert.match(configCode, /id:\s*"listening"[\s\S]*?href:\s*"\/skills\/listening"/);
  assert.match(configCode, /id:\s*"writing"[\s\S]*?href:\s*"\/skills\/writing"/);
  assert.match(configCode, /id:\s*"speaking"[\s\S]*?href:\s*"\/skills\/speaking"/);
});

test("Priority 6: Invalid skill slug triggers Next.js notFound()", () => {
  const skillPagePath = path.resolve(__dirname, "../apps/web/src/app/skills/[skill]/page.tsx");
  const skillCode = fs.readFileSync(skillPagePath, "utf-8");

  // Verify notFound import
  assert.match(skillCode, /import\s*\{\s*notFound\s*\}\s*from\s*["']next\/navigation["']/);

  // Verify fallback is removed and notFound() is invoked
  assert.doesNotMatch(
    skillCode,
    /SKILL_DATA\[["']reading["']\]/,
    "Must never silently fall back to reading"
  );
  assert.match(
    skillCode,
    /if\s*\(!info\)\s*\{\s*notFound\(\);\s*\}/,
    "Must call notFound() when skill is invalid"
  );
});

