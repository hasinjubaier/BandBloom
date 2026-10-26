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
} from "lucide-react";
import { StudentDashboardData } from "@/server/services/dashboard.service";

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
      if (!res.ok) {
        // Rollback on failure
        fetchDashboardData();
      }
    } catch {
      fetchDashboardData();
    } finally {
      setTogglingTaskId(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
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
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">
          Unable to Load Student Dashboard
        </h2>
        <p className="text-xs text-[#67839A] dark:text-[#A0C5C1]">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const { student, overview, todayPlan, continueLearning, recentActivities, stats } = data;

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
              <Sparkles className="w-3.5 h-3.5" />
              <span>IELTS Preparation Journey</span>
            </div>
            <h2
              id="welcome-heading"
              className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight"
            >
              {getGreeting()}, {student.fullName}!
            </h2>
            <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] max-w-xl leading-relaxed">
              Targeting Band {student.targetBand.toFixed(1)}{" "}
              <span className="capitalize">{student.testType}</span>. Your personalized daily
              commitment is {student.dailyMinutes} minutes to ensure consistent score progression.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                <Target className="w-4 h-4 text-[#25A995]" />
                <span>Target Band: {student.targetBand.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                <Clock className="w-4 h-4 text-[#25A995]" />
                <span>
                  {student.daysRemaining > 0
                    ? `${student.daysRemaining} days until test`
                    : "Test date reached"}
                </span>
              </div>
            </div>
          </div>

          {/* Continue Learning CTA Pill */}
          <div className="shrink-0 p-5 rounded-2xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] shadow-sm max-w-sm w-full md:w-auto">
            <span className="text-[10px] font-bold text-[#67839A] dark:text-[#A0C5C1] uppercase tracking-wider">
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
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>{continueLearning.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* B. IELTS 4 Skills Progress Overview Cards */}
      {/* ========================================================================= */}
      <section aria-labelledby="skills-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3
            id="skills-heading"
            className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
          >
            IELTS Skill Readiness & Practice Scores
          </h3>
          <span className="text-xs text-[#67839A] dark:text-[#A0C5C1] font-medium hidden sm:inline">
            Official IELTS Band Rounding Formula Applied
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Reading */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#25A995] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F4FAF8] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]">
                {overview.skills.reading.label}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Reading</div>
              <div className="text-xs text-[#67839A] dark:text-[#A0C5C1] mt-0.5">
                {overview.skills.reading.practiceCount} mock section tests taken
              </div>
            </div>
            <Link
              href="/skills/reading"
              className="text-xs font-bold text-[#25A995] hover:underline inline-flex items-center gap-1"
            >
              <span>Practice Reading</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Listening */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F4FAF8] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]">
                {overview.skills.listening.label}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Listening</div>
              <div className="text-xs text-[#67839A] dark:text-[#A0C5C1] mt-0.5">
                {overview.skills.listening.practiceCount} audio simulations completed
              </div>
            </div>
            <Link
              href="/skills/listening"
              className="text-xs font-bold text-sky-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Practice Listening</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Writing */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F4FAF8] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]">
                {overview.skills.writing.label}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Writing</div>
              <div className="text-xs text-[#67839A] dark:text-[#A0C5C1] mt-0.5">
                Task 1 & Task 2 Rubric Graded
              </div>
            </div>
            <Link
              href="/skills/writing"
              className="text-xs font-bold text-amber-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Practice Writing</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Speaking */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F4FAF8] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]">
                {overview.skills.speaking.label}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Speaking</div>
              <div className="text-xs text-[#67839A] dark:text-[#A0C5C1] mt-0.5">
                Parts 1, 2, 3 Fluency & Coherence
              </div>
            </div>
            <Link
              href="/skills/speaking"
              className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Practice Speaking</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Diagnostic Status Footnote */}
        <div className="p-3 rounded-xl bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[11px] text-[#3D6462] dark:text-[#A0C5C1] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#25A995] shrink-0 mt-0.5" />
          <span>
            <strong>Score Transparency:</strong> Estimated band scores are calculated using the official IELTS rounding rule (averages ending in .25 round up to .5, ending in .75 round up to next whole band). AI-generated diagnostics serve practice benchmarks and do not constitute official test results.
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* C & D. Today's Study Plan & Quick Actions (Two-Column Layout) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Today's Study Plan Tasks */}
        <section
          aria-labelledby="plan-heading"
          className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#25A995]" />
              <h3
                id="plan-heading"
                className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
              >
                Today&apos;s Study Tasks ({todayPlan.day})
              </h3>
            </div>
            <Link
              href="/study-plan"
              className="text-xs font-bold text-[#25A995] hover:underline inline-flex items-center gap-1"
            >
              <span>View Full Week</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {todayPlan.tasks.length === 0 ? (
              <p className="text-xs text-[#67839A] dark:text-[#A0C5C1] py-4 text-center">
                All scheduled tasks for today are completed! Great job maintaining consistency.
              </p>
            ) : (
              todayPlan.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                    task.completed
                      ? "bg-[#F9FCFB] dark:bg-[#0E2F2D] border-[#D4E8E3] dark:border-[#205653] opacity-75"
                      : "bg-white dark:bg-[#174A48] border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995]/50 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      disabled={togglingTaskId === task.id}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                        task.completed
                          ? "bg-[#25A995] border-[#25A995] text-white"
                          : "border-[#C9DDE7] dark:border-[#205653] bg-white dark:bg-[#123C3A] hover:border-[#25A995]"
                      }`}
                      aria-label={
                        task.completed ? "Mark task incomplete" : "Mark task complete"
                      }
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>

                    <div className="min-w-0">
                      <div
                        className={`text-xs sm:text-sm font-bold truncate ${
                          task.completed
                            ? "line-through text-[#67839A] dark:text-[#A0C5C1]"
                            : "text-[#123C3A] dark:text-[#F4FAF8]"
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8F7F4] dark:bg-[#123C3A] text-[#25A995]">
                          {task.skill}
                        </span>
                        <span className="text-[11px] text-[#67839A] dark:text-[#A0C5C1] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.durationMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/skills/${task.skill === "mock" ? "reading" : task.skill}`}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[11px] font-semibold text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#25A995] transition-colors"
                  >
                    Start
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Quick Learning Actions & Tool Hub */}
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
            <Link
              href="/mock-centre"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#174A48] hover:bg-[#E8F7F4] dark:hover:bg-[#174A48]/80 border border-[#D4E8E3] dark:border-[#205653] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#123C3A] text-[#25A995] flex items-center justify-center shadow-2xs">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    Take Mock Exam
                  </div>
                  <div className="text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                    Timed full exam simulation
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#67839A] group-hover:text-[#25A995] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/tutor"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#174A48] hover:bg-[#E8F7F4] dark:hover:bg-[#174A48]/80 border border-[#D4E8E3] dark:border-[#205653] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#123C3A] text-sky-600 flex items-center justify-center shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    Ask AI Tutor
                  </div>
                  <div className="text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                    Rubric & criteria assistance
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#67839A] group-hover:text-[#25A995] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/vocabulary"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#174A48] hover:bg-[#E8F7F4] dark:hover:bg-[#174A48]/80 border border-[#D4E8E3] dark:border-[#205653] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#123C3A] text-amber-600 flex items-center justify-center shadow-2xs">
                  <SpellCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    Review Vocabulary
                  </div>
                  <div className="text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                    {stats.vocabularySavedCount} words ({stats.vocabularyMasteredCount} mastered)
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#67839A] group-hover:text-[#25A995] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/notebook"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#174A48] hover:bg-[#E8F7F4] dark:hover:bg-[#174A48]/80 border border-[#D4E8E3] dark:border-[#205653] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#123C3A] text-rose-600 flex items-center justify-center shadow-2xs">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    Mistake Notebook
                  </div>
                  <div className="text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                    {stats.unresolvedMistakesCount} unresolved error notes
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#67839A] group-hover:text-[#25A995] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* E. Recent Activity & Consistency */}
      {/* ========================================================================= */}
      <section
        aria-labelledby="activity-heading"
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#25A995]" />
            <h3
              id="activity-heading"
              className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
            >
              Recent Practice & Learning History
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#67839A] dark:text-[#A0C5C1]">
            Weekly Consistency: {overview.studyStreakDays} days active
          </span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-sm font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
              No practice attempts recorded yet
            </p>
            <p className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
              Complete your first practice test or interactive lesson to start tracking your progress.
            </p>
            <Link
              href="/mock-centre"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25A995] text-white text-xs font-bold mt-2"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Take Diagnostic Mock</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#D4E8E3] dark:divide-[#205653]">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995] flex items-center justify-center shrink-0">
                    {act.type === "exam" ? (
                      <Award className="w-4 h-4" />
                    ) : act.type === "mistake" ? (
                      <Bookmark className="w-4 h-4 text-rose-500" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                      {act.title}
                    </div>
                    <div className="text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
                      {act.detail}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-[#8AA4B7] shrink-0">
                  {new Date(act.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
