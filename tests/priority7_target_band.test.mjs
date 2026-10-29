import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Priority 7: Canonical TargetBand type and VALID_TARGET_BANDS set", () => {
  const typesPath = path.resolve(__dirname, "../apps/web/src/types/index.ts");
  const typesContent = fs.readFileSync(typesPath, "utf-8");
  assert.match(
    typesContent,
    /export type TargetBand = 6\.5 \| 7\.0 \| 7\.5 \| 8\.0 \| 8\.5 \| 9\.0;/,
    "TargetBand type must strictly be 6.5 | 7.0 | 7.5 | 8.0 | 8.5 | 9.0"
  );
  assert.doesNotMatch(
    typesContent,
    /6\.0\s*\|/,
    "TargetBand type must NOT include 6.0"
  );

  const hookPath = path.resolve(__dirname, "../apps/web/src/hooks/useTargetBand.ts");
  const hookContent = fs.readFileSync(hookPath, "utf-8");
  assert.match(
    hookContent,
    /VALID_TARGET_BANDS:\s*readonly\s*TargetBand\[\]\s*=\s*\[6\.5,\s*7\.0,\s*7\.5,\s*8\.0,\s*8\.5,\s*9\.0\]/,
    "VALID_TARGET_BANDS must strictly contain [6.5, 7.0, 7.5, 8.0, 8.5, 9.0]"
  );
});

test("Priority 7: Profile target band takes precedence and arbitrary gates are removed", () => {
  const hookPath = path.resolve(__dirname, "../apps/web/src/hooks/useTargetBand.ts");
  const hookContent = fs.readFileSync(hookPath, "utf-8");

  // Removed requirement on bandbloom_has_chosen_goal
  assert.doesNotMatch(
    hookContent,
    /localStorage\.getItem\(\s*["']bandbloom_has_chosen_goal["']\s*\)/,
    "Arbitrary localStorage gate 'bandbloom_has_chosen_goal' must be removed"
  );

  // Profile target band checked first before localStorage fallback
  const profileIndex = hookContent.indexOf("profile?.targetBand !== undefined");
  const storageIndex = hookContent.indexOf('localStorage.getItem("bandbloom_target_band")');
  assert.ok(
    profileIndex !== -1 && profileIndex < storageIndex,
    "Profile targetBand must take precedence over localStorage"
  );
});

test("Priority 7: Settings and Onboarding align to canonical target band set", () => {
  const settingsPath = path.resolve(__dirname, "../apps/web/src/app/settings/page.tsx");
  const settingsContent = fs.readFileSync(settingsPath, "utf-8");
  assert.doesNotMatch(
    settingsContent,
    /<option\s+value=["']6\.0["']\s*>\s*Band 6\.0<\/option>/,
    "Settings page must not offer 6.0 as a valid supported option"
  );
  assert.match(
    settingsContent,
    /<option\s+value=["']6\.5["']\s*>\s*Band 6\.5<\/option>/,
    "Settings page must offer 6.5"
  );
  assert.match(
    settingsContent,
    /Unsupported \(Band/,
    "Settings page must flag unsupported stored bands"
  );

  const onboardingPath = path.resolve(__dirname, "../apps/web/src/app/onboarding/page.tsx");
  const onboardingContent = fs.readFileSync(onboardingPath, "utf-8");
  assert.match(
    onboardingContent,
    /\[6\.5,\s*7\.0,\s*7\.5,\s*8\.0,\s*8\.5,\s*9\.0\]/,
    "Onboarding must only list canonical supported bands"
  );
  assert.doesNotMatch(
    onboardingContent,
    /\[6\.0,/,
    "Onboarding must not include 6.0"
  );
});

test("Priority 7: Profile API validates and rejects unsupported target bands", () => {
  const apiPath = path.resolve(__dirname, "../apps/web/src/app/api/profile/route.ts");
  const apiContent = fs.readFileSync(apiPath, "utf-8");
  assert.match(
    apiContent,
    /VALID_TARGET_BANDS\s*=\s*\[6\.5,\s*7\.0,\s*7\.5,\s*8\.0,\s*8\.5,\s*9\.0\]/,
    "Profile API must validate against canonical supported bands"
  );
  assert.match(
    apiContent,
    /status:\s*400/,
    "Profile API must return 400 for unsupported target bands"
  );
});

