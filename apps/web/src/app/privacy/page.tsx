"use client";

import React from "react";
import { Shield, Lock, FileText, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F7F4] dark:bg-[#123C3A] text-[#25A995] text-xs font-semibold border border-[#25A995]/30">
          <Shield className="w-3.5 h-3.5" />
          <span>Data Protection & Privacy</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
          BandBloom Privacy Policy
        </h1>
        <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
          Governed by Privacy-First Architecture (Section 2.3 & 14.3). Effective: October 2026.
        </p>
      </div>

      <div className="bg-white dark:bg-[#123C3A] p-8 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] space-y-6 text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">1. Scope of Personal Data Collection</h2>
          <p>
            BandBloom limits student data collection strictly to what is necessary for pedagogical progression: email address, target examination track (Academic vs General Training), target band goal, daily study minutes, and test date. We do not collect extraneous demographic or financial information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">2. Speaking Voice Recordings & Audio Retention</h2>
          <p>
            Student audio recorded in the Speaking Lab is stored in private, access-restricted cloud storage and isolated via individual user tenant boundaries. Audio files are utilized exclusively for speech-to-text transcription and candidate review. Learners may delete their audio recordings at any time through the Settings panel.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">3. Writing Essays & AI Data Isolation</h2>
          <p>
            Essays submitted for AI rubric grading are transmitted securely to language model inference endpoints under agreements forbidding third-party model training on candidate text. BandBloom does not sell, license, or publish candidate essays or recordings to external marketing agencies or academic mills.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">4. Right to Data Export & Erasure (GDPR / Statutory Compliance)</h2>
          <p>
            Under our API routes (`GET /api/v1/me/export` and `DELETE /api/v1/me`), students retain the irrevocable right to export their complete attempt history and request permanent deletion of their profile, essays, and recorded audio assets.
          </p>
        </section>
      </div>
    </div>
  );
}
