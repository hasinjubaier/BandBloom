"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">Accessibility Statement</h1>
        <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">WCAG 2.2 Level AA Design Standards (Section 14.4).</p>
      </div>

      <div className="bg-white dark:bg-[#123C3A] p-8 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] space-y-6 text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">1. Keyboard & Navigation Access</h2>
          <p>
            All interactive controls, question inputs, audio playback triggers, and exam navigation matrices are fully navigable using keyboard tab and arrow controls with distinct high-contrast focus rings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">2. Visual Contrast & Text Scaling</h2>
          <p>
            Text color ratios maintain a minimum 4.5:1 contrast against dark background panels. The computer-delivered exam simulator includes on-screen font zoom controls (standard, large, extra large) matching official test center workstations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">3. Audio & Captions</h2>
          <p>
            Listening lab practices offer post-attempt unlocked verbatim transcripts with highlighted answers and distractor annotations.
          </p>
        </section>
      </div>
    </div>
  );
}
