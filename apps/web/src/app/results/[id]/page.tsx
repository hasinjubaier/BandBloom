"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ResultData {
  attempt: {
    id: string;
    examId: string;
    examTitle: string;
    testType: string;
    status: string;
    startedAt: string;
    submittedAt: string | null;
  };
  exam: {
    id: string;
    title: string;
    testType: string;
  };
  scores: {
    overall: number | null;
    reading: number | null;
    listening: number | null;
    writing: number | null;
    speaking: number | null;
  };
}

export function formatBandDisplay(val: number | null | undefined): string {
  if (val === null || val === undefined) {
    return "Unavailable";
  }
  return `Band ${val.toFixed(1)}`;
}

function DetailedResultContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/attempts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Attempt not found or access denied.");
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          setData(json);
        } else {
          setError(json.error || "Failed to load attempt.");
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load attempt.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#25A995] animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-center space-y-4 max-w-md mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
          Unable to Load Result
        </h3>
        <p className="text-xs text-[#67839A] dark:text-[#A0C5C1]">{error}</p>
        <Link
          href="/results"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25A995] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Results</span>
        </Link>
      </div>
    );
  }

  const { attempt, exam, scores } = data;

  if (attempt.status === "in_progress") {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#E8F7F4] text-[#25A995] flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">
          Exam Attempt In Progress
        </h3>
        <p className="text-xs text-[#67839A] dark:text-[#A0C5C1] leading-relaxed">
          This mock test attempt is currently in progress and has not been submitted. Diagnostic scores and band evaluations are generated only after the exam is completed and submitted.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/mock-centre/exam?id=${attempt.examId}&attempt=${attempt.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25A995] text-white text-xs font-bold shadow-xs hover:bg-[#123C3A] transition-colors"
          >
            <span>Resume Mock Exam</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/results"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D4E8E3] dark:border-[#205653] text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Results</span>
          </Link>
        </div>
      </div>
    );
  }

  if (attempt.status === "submitted" && (scores.overall === null || scores.overall === undefined)) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">
          Evaluation In Progress
        </h3>
        <p className="text-xs text-[#67839A] dark:text-[#A0C5C1] leading-relaxed">
          Your exam has been submitted and is currently awaiting diagnostic evaluation. Your official band report will be available here once marking is finalized.
        </p>
        <div className="pt-2">
          <Link
            href="/results"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25A995] text-white text-xs font-bold shadow-xs hover:bg-[#123C3A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Results</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Top Navigation Link */}
      <Link
        href="/results"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25A995] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Results & Progress</span>
      </Link>

      {/* Main Score Report Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-white via-[#F4FAF8] to-[#E8F7F4] dark:from-[#123C3A] dark:via-[#0F3230] dark:to-[#0A2422] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Official Diagnostic Score Report</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8]">
            {exam.title}
          </h2>
          <div className="flex items-center gap-3 text-xs text-[#67839A] dark:text-[#A0C5C1]">
            <span className="capitalize">{exam.testType} Standard</span>
            <span>•</span>
            <span>Completed: {new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Big Overall Band Display */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-center shadow-sm shrink-0 min-w-[180px]">
          <div className="text-4xl font-black text-[#25A995]">
            {formatBandDisplay(scores.overall)}
          </div>
          <div className="text-[10px] font-bold text-[#67839A] dark:text-[#A0C5C1] uppercase tracking-wider mt-1">
            Overall Practice Band
          </div>
        </div>
      </section>

      {/* 4 Skill Score Breakdown Grid */}
      <section className="space-y-4" aria-labelledby="breakdown-heading">
        <h3
          id="breakdown-heading"
          className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]"
        >
          Four-Skill Performance Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#25A995]" />
                Reading
              </span>
              <span className="text-sm font-black text-[#25A995]">
                {formatBandDisplay(scores.reading)}
              </span>
            </div>
            <p className="text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
              Accurate scanning and TFNG discrimination demonstrated.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-sky-600" />
                Listening
              </span>
              <span className="text-sm font-black text-sky-600">
                {formatBandDisplay(scores.listening)}
              </span>
            </div>
            <p className="text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
              Strong comprehension in Section 1 and Section 2 dialogues.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-600" />
                Writing
              </span>
              <span className="text-sm font-black text-amber-600">
                {formatBandDisplay(scores.writing)}
              </span>
            </div>
            <p className="text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
              Clear thesis statement; paragraph coherence can be strengthened.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-indigo-600" />
                Speaking
              </span>
              <span className="text-sm font-black text-indigo-600">
                {formatBandDisplay(scores.speaking)}
              </span>
            </div>
            <p className="text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
              Natural intonation and extended discourse in Part 2.
            </p>
          </div>
        </div>
      </section>

      {/* Official Band Calculation Rules Explanatory Note */}
      <section className="p-5 rounded-2xl bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#3D6462] dark:text-[#A0C5C1] space-y-2">
        <div className="font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#25A995]" />
          <span>Official IELTS Half-Band Rounding Rules</span>
        </div>
        <p className="leading-relaxed">
          The overall band score is calculated by taking the arithmetic average of the four components (Listening + Reading + Writing + Speaking) / 4. If the average ends in .25, it is rounded up to the next half band (e.g. 6.25 becomes 6.5). If it ends in .75, it is rounded up to the next whole band (e.g. 6.75 becomes 7.0).
        </p>
      </section>
    </div>
  );
}

export default function DetailedResultPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#25A995] animate-spin" />
        </div>
      }
    >
      <DetailedResultContent {...props} />
    </Suspense>
  );
}
