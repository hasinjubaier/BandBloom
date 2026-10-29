"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Clock,
  PlayCircle,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Layers,
  Filter,
  Sparkles,
} from "lucide-react";
import { ExamSummary, ExamAttemptSummary } from "@/server/services/mock.service";

/**
 * Pure state determination helper for previous attempts.
 * Preserved for testing and architectural clarity.
 */
export function getAttemptAction(
  att: ExamAttemptSummary,
  now: number = Date.now()
) {
  const isEvaluated = att.status === "evaluated" && att.overallBand !== null;
  const isSubmitted =
    att.status === "submitted" ||
    (att.status === "evaluated" && att.overallBand === null);
  const isExpired =
    att.status === "in_progress" &&
    !!att.deadlineAt &&
    new Date(att.deadlineAt).getTime() < now;

  if (isEvaluated) {
    return { type: "link" as const, href: `/results/${att.id}`, label: "View Report" };
  }
  if (isSubmitted) {
    return { type: "badge" as const, label: "Awaiting Evaluation" };
  }
  if (isExpired) {
    return { type: "badge" as const, label: "Time Expired" };
  }
  return {
    type: "link" as const,
    href: `/mock-centre/exam?id=${att.examId}&attempt=${att.id}`,
    label: "Resume Exam",
  };
}

/**
 * Format duration minutes into realistic human-readable strings (e.g., "2h 44m", "60m")
 */
function formatExamDuration(durationMinutes: number): string {
  if (durationMinutes <= 0) return "Untimed";
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

type TabCategory = "full_mock" | "sectional";
type FilterModule = "all" | "academic" | "general" | "completed";

export default function MockCentrePage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [attempts, setAttempts] = useState<ExamAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  // Architectural UI Filter State
  const [activeTab, setActiveTab] = useState<TabCategory>("full_mock");
  const [activeFilter, setActiveFilter] = useState<FilterModule>("all");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [examsRes, attemptsRes] = await Promise.all([
        fetch("/api/exams"),
        fetch("/api/attempts"),
      ]);

      const examsJson = await examsRes.json();
      const attemptsJson = await attemptsRes.json();

      setNow(Date.now());
      if (examsJson.success) setExams(examsJson.exams);
      if (attemptsJson.success) setAttempts(attemptsJson.attempts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load mock tests.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetch("/api/exams"), fetch("/api/attempts")])
      .then(async ([examsRes, attemptsRes]) => {
        const examsJson = await examsRes.json();
        const attemptsJson = await attemptsRes.json();
        if (!isMounted) return;
        setNow(Date.now());
        if (examsJson.success) setExams(examsJson.exams);
        if (attemptsJson.success) setAttempts(attemptsJson.attempts);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load mock tests.";
        setError(msg);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Filtered catalog computation
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // 1. Grouping by Tab
      const categoryMatch =
        activeTab === "full_mock"
          ? exam.category === "full_mock" || exam.sectionsCount >= 4
          : exam.category === "sectional" || exam.sectionsCount < 4;

      if (!categoryMatch) return false;

      // 2. Filter Pills
      if (activeFilter === "academic") {
        return exam.testType === "academic";
      }
      if (activeFilter === "general") {
        return (
          exam.testType === "general_training" ||
          (exam.testType as string) === "general"
        );
      }
      if (activeFilter === "completed") {
        return attempts.some(
          (a) =>
            a.examId === exam.id &&
            (a.status === "evaluated" || a.status === "submitted")
        );
      }
      return true;
    });
  }, [exams, activeTab, activeFilter, attempts]);

  // Counts for tabs
  const fullMockCount = useMemo(
    () => exams.filter((e) => e.category === "full_mock" || e.sectionsCount >= 4).length,
    [exams]
  );
  const sectionalCount = useMemo(
    () => exams.filter((e) => e.category === "sectional" || e.sectionsCount < 4).length,
    [exams]
  );

  const completedAttemptsCount = attempts.filter(
    (a) => a.status === "submitted" || a.status === "evaluated"
  ).length;

  const activeAttemptsCount = attempts.filter((a) => {
    if (a.status !== "in_progress") return false;
    if (!a.deadlineAt || !now) return true;
    return new Date(a.deadlineAt).getTime() > now;
  }).length;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true">
        <div className="h-36 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
        <div className="flex gap-3">
          <div className="h-10 w-48 bg-white dark:bg-[#123C3A] rounded-xl border border-[#D4E8E3] dark:border-[#205653]" />
          <div className="h-10 w-48 bg-white dark:bg-[#123C3A] rounded-xl border border-[#D4E8E3] dark:border-[#205653]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-56 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Computer-Delivered Testing Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            IELTS Mock Test Centre
          </h2>
          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] max-w-xl">
            Simulate the exact timing, navigation, and interface of official computer-delivered IELTS tests. Responses are graded against official IELTS band descriptors.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {activeAttemptsCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-center">
              <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                {activeAttemptsCount}
              </div>
              <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                In Progress
              </div>
            </div>
          )}
          <div className="p-4 rounded-2xl bg-[#E8F7F4] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-center">
            <div className="text-lg font-black text-[#25A995]">
              {completedAttemptsCount}
            </div>
            <div className="text-[10px] font-bold text-[#67839A] dark:text-[#A0C5C1] uppercase tracking-wider">
              Completed
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchData}
            className="px-3 py-1 font-semibold rounded-lg bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Segment Tabs: Full Mock Tests vs Sectional Practice Labs */}
      <section className="space-y-5" aria-labelledby="available-exams-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4E8E3] dark:border-[#205653] pb-4">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#F0F7F5] dark:bg-[#0D2D2C] border border-[#D4E8E3] dark:border-[#205653]">
            <button
              type="button"
              onClick={() => setActiveTab("full_mock")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "full_mock"
                  ? "bg-[#25A995] text-white shadow-xs"
                  : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Mock Tests (4 Skills)</span>
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === "full_mock"
                    ? "bg-white/20 text-white"
                    : "bg-[#D4E8E3] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]"
                }`}
              >
                {fullMockCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sectional")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "sectional"
                  ? "bg-[#25A995] text-white shadow-xs"
                  : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sectional Practice Labs</span>
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === "sectional"
                    ? "bg-white/20 text-white"
                    : "bg-[#D4E8E3] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]"
                }`}
              >
                {sectionalCount}
              </span>
            </button>
          </div>

          {/* Filtering Pills: All, Academic, General, Completed */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#67839A] dark:text-[#A0C5C1] mr-1 hidden sm:inline flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>
            {(
              [
                { id: "all", label: "All" },
                { id: "academic", label: "Academic" },
                { id: "general", label: "General Training" },
                { id: "completed", label: "Completed" },
              ] as const
            ).map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveFilter(pill.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeFilter === pill.id
                    ? "bg-[#123C3A] text-white dark:bg-[#F4FAF8] dark:text-[#123C3A] shadow-xs"
                    : "bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:border-[#25A995]"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredExams.length === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] space-y-3">
            <BookOpen className="w-8 h-8 text-[#67839A] dark:text-[#A0C5C1] mx-auto" />
            <h4 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              No mock tests match your current filter
            </h4>
            <p className="text-xs text-[#67839A] dark:text-[#A0C5C1] max-w-sm mx-auto">
              Try switching your filter pill to &quot;All&quot; or selecting another category above.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="px-4 py-1.5 rounded-xl bg-[#25A995] text-white text-xs font-bold hover:bg-[#1E8A7A] transition-colors"
            >
              Show All Available Tests
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredExams.map((exam) => {
              // Find latest attempt for this specific exam
              const examAttempts = attempts.filter((a) => a.examId === exam.id);
              const latestAttempt = examAttempts[0];

              const isEvaluated =
                latestAttempt &&
                latestAttempt.status === "evaluated" &&
                latestAttempt.overallBand !== null;
              const isSubmitted =
                latestAttempt &&
                (latestAttempt.status === "submitted" ||
                  (latestAttempt.status === "evaluated" &&
                    latestAttempt.overallBand === null));
              const isExpired =
                latestAttempt &&
                latestAttempt.status === "in_progress" &&
                !!latestAttempt.deadlineAt &&
                now !== null &&
                new Date(latestAttempt.deadlineAt).getTime() < now;
              const isActive =
                latestAttempt &&
                latestAttempt.status === "in_progress" &&
                !isExpired;

              const remainingMins =
                isActive && now !== null && latestAttempt.deadlineAt
                  ? Math.max(
                      1,
                      Math.round(
                        (new Date(latestAttempt.deadlineAt).getTime() - now) /
                          60000
                      )
                    )
                  : null;

              // Metadata subtext: dynamic, accurate
              const sectionLabel =
                exam.sectionsCount === 1 ? "1 Section" : `${exam.sectionsCount} Sections`;
              const questionLabel =
                exam.questionCount === 1 ? "1 Question" : `${exam.questionCount} Questions`;
              const typeDescriptor =
                exam.category === "full_mock"
                  ? "Complete Exam Simulation"
                  : "Targeted Skill Lab";
              const realSubtext = `${sectionLabel} • ${questionLabel} • ${typeDescriptor}`;

              const isAcademic = exam.testType === "academic";

              return (
                <div
                  key={exam.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#25A995]/60 transition-all duration-200"
                >
                  <div className="space-y-3">
                    {/* Header Badges: Module, Skills, Duration */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                            isAcademic
                              ? "bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995]"
                              : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40"
                          }`}
                        >
                          {isAcademic ? "Academic" : "General Training"}
                        </span>

                        {/* Skill Indicators */}
                        {exam.skills && exam.skills.length > 0 && (
                          <div className="flex items-center gap-1">
                            {exam.skills.map((s) => {
                              const sCode = s.charAt(0).toUpperCase();
                              const colorClass =
                                s === "listening"
                                  ? "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-900/50"
                                  : s === "reading"
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50"
                                  : s === "writing"
                                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-900/50"
                                  : "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-900/50";
                              return (
                                <span
                                  key={s}
                                  title={`Includes ${s}`}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black border ${colorClass}`}
                                >
                                  {sCode}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-[#67839A] dark:text-[#A0C5C1]">
                        <Clock className="w-3.5 h-3.5 text-[#25A995]" />
                        <span>{formatExamDuration(exam.durationMinutes)}</span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8] leading-snug">
                      {exam.title}
                    </h4>

                    <p className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
                      {realSubtext}
                    </p>
                  </div>

                  {/* Lifecycle-Aware Action Footer */}
                  <div className="pt-3 border-t border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between gap-3">
                    <div className="text-xs">
                      {isEvaluated ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#25A995]" />
                          <span className="font-extrabold text-[#25A995]">
                            Band {latestAttempt.overallBand?.toFixed(1)}
                          </span>
                        </div>
                      ) : isActive ? (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          Attempt active
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#25A995]">
                          Full Diagnostics
                        </span>
                      )}
                    </div>

                    {/* Action Button Switching */}
                    {isActive ? (
                      <Link
                        href={`/mock-centre/exam?id=${exam.id}&attempt=${latestAttempt.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resume Exam</span>
                        {remainingMins !== null && (
                          <span className="text-[10px] font-medium opacity-90">
                            ({remainingMins}m)
                          </span>
                        )}
                      </Link>
                    ) : isEvaluated ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/results/${latestAttempt.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#25A995] hover:bg-[#25A995]/10 text-[#25A995] dark:text-[#5FE3D0] text-xs font-bold transition-colors shadow-xs"
                        >
                          <span>View Score Report</span>
                        </Link>
                        <Link
                          href={`/mock-centre/exam?id=${exam.id}`}
                          title="Start a fresh attempt"
                          className="px-2.5 py-2 rounded-xl border border-[#D4E8E3] dark:border-[#205653] text-[11px] font-bold text-[#67839A] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-white transition-colors"
                        >
                          Retake
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={`/mock-centre/exam?id=${exam.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Start Mock Exam</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Completed Attempts History Table */}
      {attempts.length > 0 && (
        <section className="space-y-4" aria-labelledby="history-heading">
          <div className="flex items-center justify-between">
            <h3
              id="history-heading"
              className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
            >
              Your Previous Attempts
            </h3>
            <span className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
              {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"} recorded
            </span>
          </div>

          <div className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] overflow-hidden shadow-xs divide-y divide-[#D4E8E3] dark:divide-[#205653]">
            {attempts.map((att) => {
              const isEvaluated =
                att.status === "evaluated" && att.overallBand !== null;
              const isSubmitted =
                att.status === "submitted" ||
                (att.status === "evaluated" && att.overallBand === null);
              const isExpired =
                att.status === "in_progress" &&
                !!att.deadlineAt &&
                now !== null &&
                new Date(att.deadlineAt).getTime() < now;
              const isActive = att.status === "in_progress" && !isExpired;

              // Reconciled status badge without conflicting states
              const statusPillLabel = isEvaluated
                ? "Completed"
                : isSubmitted
                ? "Awaiting Evaluation"
                : isExpired
                ? "Expired"
                : "In Progress";

              return (
                <div
                  key={att.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F4FAF8]/40 dark:hover:bg-[#174A48]/30 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                      {att.examTitle}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#67839A] dark:text-[#A0C5C1]">
                      <span>
                        Started: {new Date(att.startedAt).toLocaleDateString()}
                      </span>

                      {/* Reconciled single status pill */}
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          isEvaluated
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : isSubmitted
                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            : isExpired
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        Status: {statusPillLabel}
                      </span>

                      {/* Subscores pill when evaluated */}
                      {isEvaluated && (
                        <span className="hidden md:inline text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
                          L: {att.listeningScore !== null ? att.listeningScore.toFixed(1) : "--"} • R:{" "}
                          {att.readingScore !== null ? att.readingScore.toFixed(1) : "--"} • W:{" "}
                          {att.writingScore !== null ? att.writingScore.toFixed(1) : "--"} • S:{" "}
                          {att.speakingScore !== null ? att.speakingScore.toFixed(1) : "--"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {isEvaluated ? (
                      <div className="text-right">
                        <div className="text-base font-extrabold text-[#25A995]">
                          Band {att.overallBand?.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                          Overall Practice
                        </div>
                      </div>
                    ) : isSubmitted ? (
                      <span className="text-xs text-[#8AA4B7]">Submitted</span>
                    ) : (
                      <span className="text-xs text-[#8AA4B7]">
                        {isExpired ? "Time Expired" : "In Progress"}
                      </span>
                    )}

                    {/* Action buttons matching exact regex in test assertions */}
                    {isEvaluated ? (
                      <Link
                        href={`/results/${att.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#25A995] transition-colors"
                      >
                        View Report
                      </Link>
                    ) : isSubmitted ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#67839A] dark:text-[#A0C5C1]">
                        Awaiting Evaluation
                      </span>
                    ) : isExpired ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-[#FFF1F0] dark:bg-[#3D1E1E] border border-[#FFA39E] dark:border-[#5C2223] text-xs font-semibold text-[#CF1322] dark:text-[#FF7875]">
                        Time Expired
                      </span>
                    ) : (
                      <Link
                        href={`/mock-centre/exam?id=${att.examId}&attempt=${att.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-[#25A995] text-white text-xs font-semibold hover:bg-[#1E8A7A] transition-colors"
                      >
                        Resume Exam
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
