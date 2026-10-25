"use client";

import React from "react";
import { FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">Terms of Service</h1>
        <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">Rules governing your use of BandBloom platform.</p>
      </div>

      <div className="bg-white dark:bg-[#123C3A] p-8 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] space-y-6 text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">1. Acceptable Use</h2>
          <p>
            BandBloom provides practice exercises, diagnostic scoring, and tutoring exclusively for individual academic preparation. Users agree not to scrape, redistribute, or commercially exploit platform questions, audio recordings, or answer keys.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">2. Integrity of Question Banks</h2>
          <p>
            Users may not upload leaked official test examination materials. Any user detected distributing unauthorized test materials is subject to immediate account termination.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">3. Service Availability</h2>
          <p>
            While BandBloom strives for continuous uptime and data persistence, mock exams and AI features are provided on an "as is" and "as available" basis.
          </p>
        </section>
      </div>
    </div>
  );
}
