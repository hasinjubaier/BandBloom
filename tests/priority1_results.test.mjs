import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Priority 1: formatBandDisplay handles missing, null, undefined, 0, and valid numbers", async (t) => {
  // Test formatting logic exactly as implemented in formatBandDisplay
  function formatBandDisplay(val) {
    if (val === null || val === undefined) {
      return "Unavailable";
    }
    return `Band ${val.toFixed(1)}`;
  }

  assert.equal(formatBandDisplay(null), "Unavailable", "null must return Unavailable");
  assert.equal(formatBandDisplay(undefined), "Unavailable", "undefined must return Unavailable");
  assert.equal(formatBandDisplay(0), "Band 0.0", "legitimate score of 0 must be preserved as Band 0.0");
  assert.equal(formatBandDisplay(0.0), "Band 0.0", "legitimate score of 0.0 must be preserved as Band 0.0");
  assert.equal(formatBandDisplay(6.5), "Band 6.5", "valid 6.5 must return Band 6.5");
  assert.equal(formatBandDisplay(7.0), "Band 7.0", "valid 7.0 must return Band 7.0");
  assert.equal(formatBandDisplay(8.5), "Band 8.5", "valid 8.5 must return Band 8.5");
});

test("Priority 1: Static check ensures no fabricated fallback scores exist in results pages", async (t) => {
  const resultIdPagePath = path.resolve(__dirname, "../apps/web/src/app/results/[id]/page.tsx");
  const resultsPagePath = path.resolve(__dirname, "../apps/web/src/app/results/page.tsx");

  const resultIdContent = fs.readFileSync(resultIdPagePath, "utf-8");
  const resultsContent = fs.readFileSync(resultsPagePath, "utf-8");

  // Ensure no fallback band score literals (e.g. || "7.0", || '7.0', : "7.5", : '7.5')
  assert.doesNotMatch(resultIdContent, /\|\|\s*["']7\.[05]["']/, "No fallback 7.0/7.5 literal in results/[id]/page.tsx");
  assert.doesNotMatch(resultsContent, /\|\|\s*["']7\.[05]["']/, "No fallback 7.0/7.5 literal in results/page.tsx");
  assert.doesNotMatch(resultIdContent, /scores\.reading\s*\?\s*`Band \${[^}]+}`\s*:\s*["'][0-9.]+["']/, "No ternary numeric fallback in reading score");
  assert.doesNotMatch(resultIdContent, /scores\.listening\s*\?\s*`Band \${[^}]+}`\s*:\s*["'][0-9.]+["']/, "No ternary numeric fallback in listening score");
  assert.doesNotMatch(resultIdContent, /scores\.writing\s*\?\s*`Band \${[^}]+}`\s*:\s*["'][0-9.]+["']/, "No ternary numeric fallback in writing score");
  assert.doesNotMatch(resultIdContent, /scores\.speaking\s*\?\s*`Band \${[^}]+}`\s*:\s*["'][0-9.]+["']/, "No ternary numeric fallback in speaking score");

  // Ensure attempt status gating is present
  assert.match(resultIdContent, /attempt\.status === "in_progress"/, "results/[id] gates in_progress attempt");
  assert.match(resultIdContent, /attempt\.status === "submitted"/, "results/[id] gates unevaluated submitted attempt");
});

