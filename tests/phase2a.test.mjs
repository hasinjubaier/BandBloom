import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Phase 2A: ScoreCalculatorModal accessibility and backdrop click dismiss", () => {
  const modalPath = path.resolve(__dirname, "../apps/web/src/components/ui/ScoreCalculatorModal.tsx");
  const modalContent = fs.readFileSync(modalPath, "utf-8");

  // Verify backdrop dismiss on outside click
  assert.match(
    modalContent,
    /onClick=\{\(e\)\s*=>\s*\{\s*if\s*\(e\.target === e\.currentTarget\)\s*\{\s*onClose\(\);\s*\}\s*\}\}/,
    "Backdrop overlay click must trigger onClose when clicking outside modal card"
  );

  // Verify card container stops propagation
  assert.match(
    modalContent,
    /onClick=\{\(e\)\s*=>\s*e\.stopPropagation\(\)\}/,
    "Modal card container must stop propagation"
  );

  // Verify keyboard Escape handler
  assert.match(
    modalContent,
    /if\s*\(e\.key === ["']Escape["']\)\s*\{\s*e\.stopPropagation\(\);\s*onClose\(\);\s*return;\s*\}/,
    "Escape key must close the dialog"
  );

  // Verify focus trap Tab looping
  assert.match(
    modalContent,
    /if\s*\(e\.key === ["']Tab["']/,
    "Tab navigation must be trapped inside modal"
  );
});

test("Phase 2A: RootLayout suppresses hydration warnings for theme attribute manipulation", () => {
  const layoutPath = path.resolve(__dirname, "../apps/web/src/app/layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");

  assert.match(
    layoutContent,
    /<html[^>]*suppressHydrationWarning/,
    "Root html tag must include suppressHydrationWarning"
  );
});

test("Phase 2A: Component import resolution integrity", () => {
  const homePath = path.resolve(__dirname, "../apps/web/src/app/page.tsx");
  const homeContent = fs.readFileSync(homePath, "utf-8");

  assert.match(homeContent, /from\s*["']@\/components\/landing\/HeroSection["']/);
  assert.match(homeContent, /from\s*["']@\/components\/landing\/FreeLessonsSampleSection["']/);

  const indexPath = path.resolve(__dirname, "../apps/web/src/components/index.ts");
  const indexContent = fs.readFileSync(indexPath, "utf-8");

  assert.match(indexContent, /from\s*["']\.\/layout\/Navbar["']/);
  assert.match(indexContent, /from\s*["']\.\/ui\/ScoreCalculatorModal["']/);
  assert.match(indexContent, /from\s*["']\.\/landing\/HeroSection["']/);
});

