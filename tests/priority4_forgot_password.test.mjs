import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Priority 4: Forgot Password page calls real API and guards against repeat submissions", async () => {
  const pagePath = path.resolve(__dirname, "../apps/web/src/app/forgot-password/page.tsx");
  const content = fs.readFileSync(pagePath, "utf-8");

  // Verify setTimeout simulation is removed
  assert.doesNotMatch(content, /setTimeout\s*\(\s*resolve,\s*800\s*\)/, "Dummy setTimeout simulation must be removed");

  // Verify real fetch to /api/auth/forgot-password
  assert.match(content, /fetch\(\s*["']\/api\/auth\/forgot-password["']/, "Must call /api/auth/forgot-password");
  assert.match(content, /method:\s*["']POST["']/, "Must use POST method");
  assert.match(content, /if\s*\(\s*isLoading\s*\)\s*return/, "Must guard against duplicate in-flight submissions");
  assert.match(content, /disabled=\{\s*isLoading\s*\}/, "Submit button must be disabled during loading");
});

test("Priority 4: Generic anti-enumeration response contract", async () => {
  const routePath = path.resolve(__dirname, "../apps/web/src/app/api/auth/forgot-password/route.ts");
  const routeContent = fs.readFileSync(routePath, "utf-8");

  // Verify route exists and returns generic message
  assert.match(routeContent, /success:\s*true/, "API returns success: true");
  assert.match(routeContent, /account exists/i, "API returns generic enumeration mitigation message");
  
  // Verify that HTTP response payload NEVER leaks token or tokenHash
  const responseMatch = routeContent.match(/NextResponse\.json\(\s*\{([\s\S]*?)\}\s*[,)]/);
  assert.ok(responseMatch, "Route must call NextResponse.json with payload");
  const responsePayload = responseMatch[1];
  assert.doesNotMatch(responsePayload, /token/i, "API response payload must NEVER leak token or tokenHash");
});

