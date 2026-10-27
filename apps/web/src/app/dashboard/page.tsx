"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Target,
  Clock,
  CheckCircle2,
  CalendarCheck,
  FileCheck2,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  Bot,
  SpellCheck,
  Bookmark,
  AlertCircle,
  PlayCircle,
  TrendingUp,
  RefreshCw,
  Award,
  RotateCcw,
} from "lucide-react";
import { StudentDashboardData } from "@/server/services/dashboard.service";
import {
  formatTestType,
  formatSkill,
  pluralize,
  getDhakaGreeting,
} from "@/lib/dashboard-utils";

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to load dashboard data.");
      }
      setData(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error || "Unable to load dashboard data.");
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load dashboard.";
        setError(msg);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!data) return;
    setTogglingTaskId(taskId);

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        todayPlan: {
          ...prev.todayPlan,
          tasks: prev.todayPlan.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !currentCompleted } : t
          ),
        },
      };
    });

    try {
      const res = await fetch("/api/study-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed: !currentCompleted }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        // Authoritative rollback on failure
        fetchDashboardData();
      } else if (json.plan?.tasks) {
        // Authoritative reconciliation
        const taskMap = new Map<string, boolean>(
          json.plan.tasks.map((t: { id: string; completed: boolean }) => [t.id, t.completed])
        );
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            todayPlan: {
              ...prev.todayPlan,
              tasks: prev.todayPlan.tasks.map((t) => ({
                ...t,
                completed: taskMap.has(t.id) ? taskMap.get(t.id)! : t.completed,
              })),
            },
          };
        });
      }
    } catch {
      fetchDashboardData();
    } finally {
      setTogglingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-label="Loading student dashboard">
        <div className="h-44 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-white dark:bg-[#123C3A] rounded-2xl border border-[#D4E8E3] dark:border-[#205653]"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
          <div className="h-72 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto" aria-hidden="true">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">
          Unable to Load Student Dashboard
        </h2>
        <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#123C3A] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const { student, overview, todayPlan, continueLearning, inProgressAttempt, recentActivities, stats } = data;

  // Daily Progress Calculation (Task 4)
  const completedMinutesToday = todayPlan.tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.durationMinutes, 0);
  const dailyCommitment = student.dailyMinutes;
  const progressPercent = Math.min(100, Math.round((completedMinutesToday / dailyCommitment) * 100));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ========================================================================= */}
      {/* A. Personalized Welcome Hero Card */}
      {/* ========================================================================= */}
      <section
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white via-[#F4FAF8] to-[#E8F7F4] dark:from-[#123C3A] dark:via-[#0F3230] dark:to-[#0A2422] p-6 sm:p-8 border border-[#D4E8E3] dark:border-[#205653] shadow-sm"
        aria-labelledby="welcome-heading"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>IELTS Preparation Journey</span>
            </div>
            <h2
              id="welcome-heading"
              className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight"
            >
              {getDhakaGreeting()}, {student.fullName}!
            </h2>
            <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] max-w-xl leading-relaxed">
              Targeting Band {student.targetBand.toFixed(1)}{" "}
              <span className="font-semibold">{formatTestType(student.testType)}</span>. Your daily commitment is {student.dailyMinutes} minutes to support consistent score progression.
            </p>

            {/* Hero Metadata & Daily Progress Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                <Target className="w-4 h-4 text-[#25A995]" aria-hidden="true" />
                <span>Target Band: {student.targetBand.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                <Clock className="w-4 h-4 text-[#25A995]" aria-hidden="true" />
                <span>
                  {student.daysRemaining > 0
                    ? `${pluralize(student.daysRemaining, "day")} until test`
                    : "Test date reached"}
                </span>
              </div>
              {/* Daily Progress Indicator (Task 4) */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]"
                role="status"
                aria-label={`Daily progress: ${completedMinutesToday} of ${dailyCommitment} minutes completed`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#25A995]" aria-hidden="true" />
                <span>
                  Today: {completedMinutesToday} / {dailyCommitment} min ({progressPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Continue Learning / Next Priority Action (Task 1 & 9) */}
          <div className="shrink-0 p-5 rounded-2xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] shadow-sm max-w-sm w-full md:w-auto">
            <span className="text-xs font-bold text-[#3D6462] dark:text-[#A0C5C1] uppercase tracking-wider block">
              Next Priority Action
            </span>
            <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8] mt-1 truncate">
              {continueLearning.title}
            </div>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-0.5 line-clamp-1">
              {continueLearning.subtitle}
            </p>
            <Link
              href={continueLearning.href}
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#123C3A] text-white text-xs font-bold transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2"
            >
              <span>{continueLearning.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* B. IELTS 4 Skills Progress Overview Cards (Task 7 & 8) */}
      {/* ========================================================================= */}
      <section aria-labelledby="skills-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3
            id="skills-heading"
            className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
          >
            IELTS Skill Readiness & Practice Scores
          </h3>
          <span className="text-xs text-[#3D6462] dark:text-[#A0C5C1] font-medium hidden sm:inline">
            Standard Band Rounding Applied
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Reading */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
                <BookOpen className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F4FAF8] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]">
                {overview.skills.reading.label}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Reading</div>
              <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-0.5">
                {pluralize(overview.skills.reading.practiceCount, "mock test")} taken
              </div>
            </div>
            <Link
              href="/skills/reading"
              className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] rounded"
            >
              <span>Practice Reading</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          {/* Listening */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
                <Headphones className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F4FAF8] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]">
                {overview.skills.listening.label}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Listening</div>
              <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-0.5">
                {pluralize(overview.skills.listening.practiceCount, "audio simulation")} completed
              </div>
            </div>
            <Link
              href="/skills/listening"
              className="text-xs font-bold text-sky-600 hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded"
            >
              <span>Practice Listening</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          {/* Writing (Task 7: accurate counts, no partial criteria) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <Edit3 className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F4FAF8] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]">
                {overview.skills.writing.label}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Writing</div>
              <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-0.5">
                {pluralize(overview.skills.writing.practiceCount, "writing task")} evaluated
              </div>
            </div>
            <Link
              href="/skills/writing"
              className="text-xs font-bold text-amber-600 hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded"
            >
              <span>Practice Writing</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          {/* Speaking (Task 7: accurate counts, no partial criteria) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                <Mic className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F4FAF8] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]">
                {overview.skills.speaking.label}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Speaking</div>
              <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-0.5">
                {pluralize(overview.skills.speaking.practiceCount, "speaking session")} evaluated
              </div>
            </div>
            <Link
              href="/skills/speaking"
              className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded"
            >
              <span>Practice Speaking</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Diagnostic Status Transparency Note (Task 8) */}
        <div className="p-3.5 rounded-xl bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#3D6462] dark:text-[#A0C5C1] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#25A995] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Score Transparency:</strong> Estimated band scores use the standard IELTS half-band rounding rule (averages ending in .25 round up to .5, and ending in .75 round up to next whole band). Unofficial practice estimates for self-study.
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* C & D. Today's Study Plan & Quick Actions (Two-Column Layout) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Today's Study Plan Tasks (Task 3: completed = strikethrough + Review) */}
        <section
          aria-labelledby="plan-heading"
          className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#25A995]" aria-hidden="true" />
              <h3
                id="plan-heading"
                className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
              >
                Today&apos;s Study Tasks ({todayPlan.day})
              </h3>
            </div>
            <Link
              href="/study-plan"
              className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] rounded"
            >
              <span>View Full Week</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-3">
            {todayPlan.tasks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#F9FCFB] dark:bg-[#0E2F2D] border border-[#D4E8E3] dark:border-[#205653] text-center space-y-1.5">
                <p className="text-xs sm:text-sm font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                  No study tasks scheduled for today ({todayPlan.day})
                </p>
                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                  Take a scheduled rest day or practice with the Mistake Notebook and Vocabulary Bank.
                </p>
              </div>
            ) : (
              todayPlan.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                    task.completed
                      ? "bg-[#F9FCFB] dark:bg-[#0E2F2D] border-[#D4E8E3] dark:border-[#205653] opacity-80"
                      : "bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] hover:border-[#0F766E]/50 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      disabled={togglingTaskId === task.id}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                        task.completed
                          ? "bg-[#0F766E] border-[#0F766E] text-white"
                          : "border-[#C9DDE7] dark:border-[#205653] bg-white dark:bg-[#123C3A] hover:border-[#0F766E]"
                      }`}
                      aria-label={
                        task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`
                      }
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />}
                    </button>

                    <div className="min-w-0">
                      <div
                        className={`text-xs sm:text-sm font-bold truncate ${
                          task.completed
                            ? "line-through text-[#5A7385] dark:text-[#A0C5C1]"
                            : "text-[#123C3A] dark:text-[#F4FAF8]"
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8F7F4] dark:bg-[#123C3A] text-[#0F766E] dark:text-[#5EEAD4]">
                          {formatSkill(task.skill)}
                        </span>
                        <span className="text-xs text-[#3D6462] dark:text-[#A0C5C1] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#0F766E]" aria-hidden="true" />
                          {task.durationMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Task Action State (Task 3: completed = Review, not Start) */}
                  <Link
                    href={`/skills/${task.skill === "mock" ? "reading" : task.skill}`}
                    className={`shrink-0 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                      task.completed
                        ? "bg-[#F4FAF8] dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-white"
                        : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#0F766E] hover:text-[#0F766E]"
                    }`}
                  >
                    {task.completed ? "Review" : "Start"}
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Quick Learning Actions & Tool Hub (Task 9: Guarded Mock Test) */}
        <section
          aria-labelledby="actions-heading"
          className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4"
        >
          <h3
            id="actions-heading"
            className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
          >
            Quick Learning Actions
          </h3>

          <div className="space-y-2.5">
            {/* Guarded Mock Test action */}
            {inProgressAttempt ? (
              <Link
                href={`/mock-centre/exam?id=${inProgressAttempt.examId}&attempt=${inProgressAttempt.id}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#E8F7F4] dark:bg-[#174A48] border border-[#25A995]/50 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#25A995] text-white flex items-center justify-center shadow-2xs">
                    <RotateCcw className="w-4 h-4 animate-spin-slow" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-1.5">
                      <span>Resume Mock Test</span>
                      <span className="px-1.5 py-0.5 rounded text-xs bg-[#25A995] text-white font-extrabold uppercase">
                        Active
                      </span>
                    </div>
                    <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1] truncate max-w-[180px]">
                      {inProgressAttempt.examTitle}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#25A995] group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                href="/mock-centre"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#174A48] hover:bg-[#E8F7F4] dark:hover:bg-[#174A48]/80 border border-[#D4E8E3] dark:border-[#205653] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#123C3A] text-[#25A995] flex items-center justify-center shadow-2xs">
                    <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                      Take Mock Test
                    </div>
                    <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                      Timed full test simulation
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#3D6462] group-hover:text-[#25A995] group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            )}

            <Link
              href="/tutor"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#174A48] hover:bg-[#E8F7F4] dark:hover:bg-[#174A48]/80 border border-[#D4E8E3] dark:border-[#205653] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#123C3A] text-sky-600 flex items-center justify-center shadow-2xs">
                  <Bot className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    Ask AI Tutor
                  </div>
                  <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                    Rubric & criteria assistance
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#3D6462] group-hover:text-[#25A995] group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>

            <Link
              href="/vocabulary"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#174A48] hover:bg-[#E8F7F4] dark:hover:bg-[#174A48]/80 border border-[#D4E8E3] dark:border-[#205653] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#123C3A] text-amber-600 flex items-center justify-center shadow-2xs">
                  <SpellCheck className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    Review Vocabulary
                  </div>
                  <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                    {pluralize(stats.vocabularySavedCount, "word")} ({stats.vocabularyMasteredCount} mastered)
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#3D6462] group-hover:text-[#25A995] group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>

            <Link
              href="/notebook"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#174A48] hover:bg-[#E8F7F4] dark:hover:bg-[#174A48]/80 border border-[#D4E8E3] dark:border-[#205653] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#123C3A] text-rose-600 flex items-center justify-center shadow-2xs">
                  <Bookmark className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    Mistake Notebook
                  </div>
                  <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                    {pluralize(stats.unresolvedMistakesCount, "unresolved error note")}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#3D6462] group-hover:text-[#25A995] group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* E. Recent Activity & Consistency (Task 1, 2, 5, 12) */}
      {/* ========================================================================= */}
      <section
        aria-labelledby="activity-heading"
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#25A995]" aria-hidden="true" />
            <h3
              id="activity-heading"
              className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
            >
              Recent Practice & Learning History
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#3D6462] dark:text-[#A0C5C1]">
            Weekly Consistency: {pluralize(overview.studyStreakDays, "day")} active
          </span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-sm font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
              No practice attempts recorded yet
            </p>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              Complete your first practice test or interactive lesson to start tracking your progress.
            </p>
            <Link
              href={
                inProgressAttempt
                  ? `/mock-centre/exam?id=${inProgressAttempt.examId}&attempt=${inProgressAttempt.id}`
                  : "/mock-centre"
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#123C3A] text-white text-xs font-bold mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {inProgressAttempt ? "Resume In-Progress Mock Test" : "Take Diagnostic Mock Test"}
              </span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#D4E8E3] dark:divide-[#205653]">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995] flex items-center justify-center shrink-0">
                    {act.type === "exam" ? (
                      <Award className="w-4 h-4" aria-hidden="true" />
                    ) : act.type === "mistake" ? (
                      <Bookmark className="w-4 h-4 text-rose-500" aria-hidden="true" />
                    ) : (
                      <BookOpen className="w-4 h-4" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                      {act.title}
                    </div>
                    <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                      {act.detail}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1] shrink-0 font-medium">
                  {new Date(act.timestamp).toLocaleDateString("en-US", {
                    timeZone: "Asia/Dhaka",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* F. Required Single Platform Disclaimer Footer (Task 8) */}
      {/* ========================================================================= */}
      <footer className="pt-6 border-t border-[#D4E8E3] dark:border-[#205653] text-center text-xs text-[#3D6462] dark:text-[#A0C5C1]">
        <p>
          BandBloom is an independent preparation platform and is not affiliated with, approved, or endorsed by British Council, IDP: IELTS Australia, or Cambridge Assessment English.
        </p>
      </footer>
    </div>
  );
}

