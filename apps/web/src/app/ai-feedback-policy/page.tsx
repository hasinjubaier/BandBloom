"use client";

import React from "react";
import { BrainCircuit, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AIFeedbackPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F7F4] dark:bg-[#123C3A] text-[#25A995] text-xs font-semibold border border-[#25A995]/30">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Evaluation Safeguards</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">AI & Rubric Evaluation Policy</h1>
        <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">Rules governing automated scoring & RAG assistance (Section 4.3 & 13.1).</p>
      </div>

      <div className="bg-white dark:bg-[#123C3A] p-8 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] space-y-6 text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">1. Practice Estimate Status</h2>
          <p>
            AI-generated scores across Writing and Speaking are labeled as "unofficial diagnostic estimates". When evidence in a candidate draft is insufficient or ambiguous, the system is engineered to suppress categorical band declarations and highlight rubric uncertainty rather than fabricating confidence.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">2. Grounded RAG Ingestion</h2>
          <p>
            Our AI Tutor references only approved, published curriculum documents (`status = 'published'` and `permission_status IN ('owned', 'licensed')`). When a question exceeds available reference knowledge, the system adheres to refusal and points learners directly to official sources.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">3. Reviewer Escalation</h2>
          <p>
            If a learner believes an automated grading rubric misrepresented their grammatical structure or topic development, they can flag the response for reviewer inspection via the "Report Inaccuracy" button.
          </p>
        </section>
      </div>
    </div>
  );
}
