"use client";

import React, { use, Suspense } from "react";
import Link from "next/link";
import {
  Award,
  AlertTriangle,
  BookOpen,
  Headphones,
  FileText,
  Mic,
  ArrowRight,
  TrendingUp,
  BookmarkPlus,
  RefreshCcw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { roundIELTSBand } from "@/context/ExamContext";
import { useLanguage } from "@/context/LanguageContext";

function ResultsContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { language } = useLanguage();

  // Test results data
  const testResults = {
    examTitle: "BandBloom Academic Diagnostic Mock 1",
    date: "2026-10-20",
    testType: "Academic",
    scores: {
      listening: 7.5,
      reading: 8.0,
      writing: 6.5,
      speaking: 7.0,
    },
    rawMarks: {
      listening: "33 / 40",
      reading: "35 / 40",
    },
  };

  const rawAverage =
    (testResults.scores.listening +
      testResults.scores.reading +
      testResults.scores.writing +
      testResults.scores.speaking) /
    4.0;

  const roundedOverallBand = roundIELTSBand(rawAverage);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* 1. Unofficial Disclaimer Notice (Mandatory Section 5.3) */}
      <div className="bg-[#FFF6F3] border border-[#FF8A65]/30 dark:bg-[#FF8A65]/15 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#123C3A] dark:text-[#F4FAF8]">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#FF8A65] shrink-0" />
          <span>
            <strong className="text-[#FF8A65]">Official Scoring Disclaimer:</strong> This score card represents an algorithmic practice estimate based on official 2026 marking conversions. It is not an official IELTS Test Report Form (TRF) and cannot be submitted for university or immigration applications.
          </span>
        </div>
      </div>

      {/* 2. Top Summary Card: Overall Band & Mathematical Rounding */}
      <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Attempt Report</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
              {testResults.examTitle}
            </h1>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              Completed on {testResults.date} • Standard Academic Delivery Form
            </p>
          </div>

          {/* Big Overall Band Badge */}
          <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/90 border border-[#D4E8E3] dark:border-[#205653] rounded-2xl p-6 text-center min-w-[220px] shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-[#3D6462] dark:text-[#A0C5C1] font-bold block mb-1">
              Overall Band Score
            </span>
            <div className="text-5xl font-black text-[#25A995]">
              {roundedOverallBand.toFixed(1)}
            </div>
            <div className="mt-2 text-[11px] text-[#3D6462] dark:text-[#A0C5C1] font-medium">
              Average: {rawAverage.toFixed(2)} → Rounded Up
            </div>
          </div>
        </div>

        {/* Rounding Rule Mathematical Proof Box */}
        <div className="mt-8 pt-6 border-t border-[#D4E8E3] dark:border-[#205653] text-xs text-[#3D6462] dark:text-[#A0C5C1] bg-[#F4FAF8] dark:bg-[#0A1C1B]/60 p-4 rounded-xl border border-[#D4E8E3] dark:border-[#205653] space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
            <Award className="w-4 h-4 text-[#25A995]" />
            <span>Official IELTS Rounding Proof (Section 5.3):</span>
          </div>
          <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
            Sum of 4 skills: ({testResults.scores.listening} + {testResults.scores.reading} + {testResults.scores.writing} + {testResults.scores.speaking}) = 29.0.
            Raw average: 29.0 / 4 = <strong>{rawAverage.toFixed(2)}</strong>. Under official guidelines, any fraction ending in .25 rounds up to the next half band. Therefore, {rawAverage.toFixed(2)} officially becomes <strong>Band {roundedOverallBand.toFixed(1)}</strong>.
          </p>
        </div>
      </div>

      {/* 3. Four Skill Component Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Listening */}
        <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#25A995]">
              {testResults.scores.listening.toFixed(1)}
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Listening</h3>
          <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            Raw Marks: <strong className="text-[#123C3A] dark:text-[#F4FAF8]">{testResults.rawMarks.listening}</strong>
          </p>
          <div className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] pt-2 border-t border-[#D4E8E3] dark:border-[#205653]">
            Strong in Section 1 & 2. Missed 2 questions in Section 3 due to distractor traps.
          </div>
        </div>

        {/* Reading */}
        <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#25A995]">
              {testResults.scores.reading.toFixed(1)}
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Reading</h3>
          <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            Raw Marks: <strong className="text-[#123C3A] dark:text-[#F4FAF8]">{testResults.rawMarks.reading}</strong>
          </p>
          <div className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] pt-2 border-t border-[#D4E8E3] dark:border-[#205653]">
            High accuracy on Academic Passage 1 & 2. 1 keyword trap identified in TFNG.
          </div>
        </div>

        {/* Writing */}
        <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#FFF6F3] text-[#FF8A65] border border-[#FF8A65]/30 dark:bg-[#FF8A65]/20">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#FF8A65]">
              {testResults.scores.writing.toFixed(1)}
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Writing</h3>
          <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            Task 1: Band 7.0 • Task 2: Band 6.5
          </p>
          <div className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] pt-2 border-t border-[#D4E8E3] dark:border-[#205653]">
            Task 2 weighting accounts for 66% of final writing score. Expand Coherence.
          </div>
        </div>

        {/* Speaking */}
        <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#25A995]">
              {testResults.scores.speaking.toFixed(1)}
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Speaking</h3>
          <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            Fluency: 7.5 • Pronunciation: 7.0
          </p>
          <div className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] pt-2 border-t border-[#D4E8E3] dark:border-[#205653]">
            Fluid cue card presentation (115s). Natural lexical range maintained.
          </div>
        </div>
      </div>

      {/* 4. Next Step Recommendations & Mistake Sync */}
      <div className="bg-white dark:bg-[#123C3A] p-6 sm:p-8 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
            Target Weakness: Focus on Writing Task 2 to reach Band 8.0
          </h3>
          <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            Your Reading and Listening scores already qualify for prestigious university admissions. Raising Writing to 7.0 will elevate your overall to Band 8.0.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/skills/writing"
            className="px-5 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-[#25A995]/25"
          >
            <span>Practice Task 2 Essay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] hover:bg-[#D4E8E3]/50 text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] text-xs font-medium transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ExamResultsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto p-12 text-center text-[#3D6462] dark:text-[#A0C5C1]">Loading Exam Score Report...</div>}>
      <ResultsContent params={params} />
    </Suspense>
  );
}
