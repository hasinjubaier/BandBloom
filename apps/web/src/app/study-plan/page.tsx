"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  FileCheck2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Target,
  Award,
  RotateCcw,
  Check,
  TrendingUp,
  Send,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import type {
  StudyPlanData,
  StudyPlanSkill,
} from "@/server/services/study-plan.service";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<StudyPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Action states
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [reschedulingTaskId, setReschedulingTaskId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Reflection form state
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [isSubmittingReflection, setIsSubmittingReflection] = useState(false);
  const [reflectionWhatImproved, setReflectionWhatImproved] = useState("");
  const [reflectionDifficultSkill, setReflectionDifficultSkill] = useState("reading");
  const [reflectionWeakQuestionType, setReflectionWeakQuestionType] = useState("");
  const [reflectionNextCycleGoal, setReflectionNextCycleGoal] = useState("");

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const loadPlan = async () => {
    try {
      const res = await fetch("/api/study-plan");
      const json = await res.json();
      if (res.ok && json.success && json.plan) {
        setPlan(json.plan);
        if (json.plan.reflection) {
          setReflectionWhatImproved(json.plan.reflection.whatImproved || "");
          setReflectionDifficultSkill(json.plan.reflection.difficultSkill || "reading");
          setReflectionWeakQuestionType(json.plan.reflection.weakQuestionType || "");
          setReflectionNextCycleGoal(json.plan.reflection.nextCycleGoal || "");
        }
      } else {
        setError(json.error || "Failed to load study plan.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load study plan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/study-plan")
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.plan) {
          setPlan(json.plan);
          if (json.plan.reflection) {
            setReflectionWhatImproved(json.plan.reflection.whatImproved || "");
            setReflectionDifficultSkill(json.plan.reflection.difficultSkill || "reading");
            setReflectionWeakQuestionType(json.plan.reflection.weakQuestionType || "");
            setReflectionNextCycleGoal(json.plan.reflection.nextCycleGoal || "");
          }
        } else {
          setError(json.error || "Failed to load study plan.");
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load study plan.";
        setError(msg);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = async (taskId: string, currentStatus: boolean) => {
    if (!plan) return;
    setTogglingTaskId(taskId);

    const nextCompleted = !currentStatus;

    // Optimistic UI update
    setPlan((prev) => {
      if (!prev) return prev;
      const updatedTasks = prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: nextCompleted,
              status: nextCompleted ? ("completed" as const) : ("planned" as const),
              completedAt: nextCompleted ? new Date().toISOString() : null,
            }
          : t
      );
      const completedCount = updatedTasks.filter((t) => t.completed).length;
      const completedMinutes = updatedTasks
        .filter((t) => t.completed)
        .reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
      const totalPlannedMinutes = updatedTasks.reduce(
        (acc, t) => acc + (t.durationMinutes || 0),
        0
      );

      return {
        ...prev,
        tasks: updatedTasks,
        stats: {
          totalTasks: updatedTasks.length,
          completedTasks: completedCount,
          plannedMinutes: totalPlannedMinutes,
          completedMinutes,
          progressPercent:
            updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0,
        },
      };
    });

    try {
      const res = await fetch("/api/study-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed: nextCompleted }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || "Failed to update task completion.", "error");
        await loadPlan();
      } else {
        if (json.plan) setPlan(json.plan);
        showToast(
          nextCompleted ? "Activity marked as completed! 🎯" : "Activity marked as planned."
        );
      }
    } catch {
      showToast("Network error updating task.", "error");
      await loadPlan();
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleReschedule = async (taskId: string, newDay: string) => {
    if (!plan) return;
    setReschedulingTaskId(taskId);

    try {
      const res = await fetch("/api/study-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, newDay }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || "Failed to reschedule task.", "error");
        await loadPlan();
      } else {
        if (json.plan) setPlan(json.plan);
        showToast(`Task rescheduled to ${newDay}.`);
      }
    } catch {
      showToast("Network error rescheduling task.", "error");
      await loadPlan();
    } finally {
      setReschedulingTaskId(null);
    }
  };

  const handleRegenerate = async () => {
    if (!plan || isRegenerating) return;
    setIsRegenerating(true);

    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || "Failed to regenerate study plan.", "error");
      } else {
        if (json.plan) setPlan(json.plan);
        showToast("Study plan successfully adapted to your latest performance! 🚀");
      }
    } catch {
      showToast("Network error regenerating plan.", "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSubmitReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionWhatImproved.trim() || !reflectionNextCycleGoal.trim()) {
      showToast("Please provide details for both what improved and next cycle goal.", "error");
      return;
    }

    setIsSubmittingReflection(true);
    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reflection",
          reflection: {
            whatImproved: reflectionWhatImproved,
            difficultSkill: reflectionDifficultSkill,
            weakQuestionType: reflectionWeakQuestionType,
            nextCycleGoal: reflectionNextCycleGoal,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || "Failed to save reflection.", "error");
      } else {
        if (json.plan) setPlan(json.plan);
        setShowReflectionForm(false);
        showToast("Weekly reflection saved successfully! 📝");
      }
    } catch {
      showToast("Network error saving reflection.", "error");
    } finally {
      setIsSubmittingReflection(false);
    }
  };

  const getSkillIcon = (skill: StudyPlanSkill) => {
    switch (skill) {
      case "reading":
        return <BookOpen className="w-4 h-4 text-teal-600" />;
      case "listening":
        return <Headphones className="w-4 h-4 text-sky-600" />;
      case "writing":
        return <Edit3 className="w-4 h-4 text-amber-600" />;
      case "speaking":
        return <Mic className="w-4 h-4 text-indigo-600" />;
      case "mock":
        return <Award className="w-4 h-4 text-[#25A995]" />;
      default:
        return <FileCheck2 className="w-4 h-4 text-[#25A995]" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="h-44 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
        <div className="h-32 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-white dark:bg-[#123C3A] rounded-2xl border border-[#D4E8E3] dark:border-[#205653]"
            />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-24 bg-white dark:bg-[#123C3A] rounded-2xl border border-[#D4E8E3] dark:border-[#205653]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">
          Study Plan Unavailable
        </h2>
        <p className="text-xs sm:text-sm text-[#67839A] dark:text-[#A0C5C1]">
          {error || "Unable to retrieve your adaptive study plan."}
        </p>
        <button
          onClick={loadPlan}
          className="px-5 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#1E8A7A] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  // Derive Today's Day name in local browser context
  const todayDayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());

  // Today's task: match today's day, or the first pending task
  const todayTask =
    plan.tasks.find((t) => t.day.toLowerCase() === todayDayName.toLowerCase()) ||
    plan.tasks.find((t) => !t.completed) ||
    plan.tasks[0];

  // Skill breakdown computation
  const skillBreakdown = (["reading", "listening", "writing", "speaking"] as const).map(
    (skill) => {
      const skillTasks = plan.tasks.filter((t) => t.skill === skill);
      const completed = skillTasks.filter((t) => t.completed).length;
      const plannedMinutes = skillTasks.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
      return {
        skill,
        total: skillTasks.length,
        completed,
        plannedMinutes,
      };
    }
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-4">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-md transition-all duration-300 ${
            feedback.type === "success"
              ? "bg-[#E8F7F4] text-[#123C3A] border border-[#25A995]/40 dark:bg-[#174A48] dark:text-[#F4FAF8]"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <Check className="w-4 h-4 text-[#25A995] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-60 hover:opacity-100 p-1 cursor-pointer"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Plan Header Card */}
      <section
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        aria-label="Study Plan Header"
      >
        <div className="space-y-3 max-w-2xl">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>
                {plan.testType === "general_training"
                  ? "IELTS General Training"
                  : "IELTS Academic"}
              </span>
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] text-xs font-bold">
              <Target className="w-3 h-3 text-[#25A995]" />
              <span>Target: Band {plan.targetBand.toFixed(1)}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] text-xs font-semibold">
              <TrendingUp className="w-3 h-3 text-[#25A995]" />
              <span>
                {plan.currentEstimatedBand !== null
                  ? `Est: Band ${plan.currentEstimatedBand.toFixed(1)}`
                  : "Baseline: Diagnostic Pending"}
              </span>
            </span>

            {plan.daysRemaining !== null && plan.daysRemaining > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                <Clock className="w-3 h-3" />
                <span>{plan.daysRemaining} days to exam</span>
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
              Adaptive IELTS Study Plan
            </h1>
            <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] mt-1 leading-relaxed">
              {plan.planType === "starter"
                ? "Starter Plan: Complete your Day 1 diagnostic mock test to calibrate your genuine IELTS baseline score."
                : plan.planType === "adaptive_diagnostic"
                  ? "Adaptive Plan: Calibrated using your diagnostic baseline scores to target your weakest bands."
                  : "Performance-Tuned Plan: Continually adapted to your latest mock test submissions and mistake notebook."}
            </p>
          </div>

          {/* Goal Statement */}
          <div className="text-xs text-[#67839A] dark:text-[#A0C5C1] flex items-center gap-2">
            <span className="font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
              Weekly Objective:
            </span>
            <span>{plan.weeklyGoal}</span>
          </div>
        </div>

        {/* Progress & Adaptation CTA */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-2">
              <span>Weekly Completion</span>
              <span className="text-[#25A995] text-sm">{plan.stats.progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#D4E8E3] dark:bg-[#205653] overflow-hidden">
              <div
                className="h-full bg-[#25A995] transition-all duration-500 rounded-full"
                style={{ width: `${plan.stats.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#67839A] dark:text-[#A0C5C1] mt-2">
              <span>
                {plan.stats.completedTasks} of {plan.stats.totalTasks} tasks done
              </span>
              <span>
                {plan.stats.completedMinutes} / {plan.stats.plannedMinutes} mins
              </span>
            </div>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-4 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#1E8A7A] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            aria-label="Adapt study plan to latest performance"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Adapting Curriculum..." : "Adapt Plan to Progress"}</span>
          </button>
        </div>
      </section>

      {/* Daily Focus Banner ("Today's Priority") */}
      {todayTask && (
        <section
          className="p-6 rounded-3xl bg-gradient-to-br from-[#E8F7F4] via-white to-[#F4FAF8] dark:from-[#174A48] dark:via-[#123C3A] dark:to-[#0E2F2D] border-2 border-[#25A995]/30 shadow-xs relative overflow-hidden"
          aria-label="Today's Recommended Focus"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#25A995] text-white text-[11px] font-extrabold uppercase tracking-wider">
                  Today&apos;s Focus • {todayTask.day}
                </span>
                <span className="text-xs font-semibold text-[#67839A] dark:text-[#A0C5C1]">
                  {todayTask.date}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653]">
                    {getSkillIcon(todayTask.skill)}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    {todayTask.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] mt-1">
                  {todayTask.objective}
                </p>
              </div>

              {/* Rationale callout */}
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#123C3A]/80 border border-[#25A995]/20 text-[11px] sm:text-xs text-[#123C3A] dark:text-[#F4FAF8] flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#25A995] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#25A995]">Why recommended: </span>
                  <span>{todayTask.whyRecommended}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="shrink-0 flex sm:flex-col gap-2.5">
              <Link
                href={
                  todayTask.actionHref ||
                  (todayTask.skill === "mock"
                    ? "/mock-centre"
                    : `/skills/${todayTask.skill || "reading"}`)
                }
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-[#25A995] hover:bg-[#1E8A7A] text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>{todayTask.actionLabel || "Start Session"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => handleToggle(todayTask.id, todayTask.completed)}
                disabled={togglingTaskId === todayTask.id}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  todayTask.completed
                    ? "bg-[#25A995]/10 text-[#25A995] border-[#25A995]/30 hover:bg-[#25A995]/20"
                    : "bg-white dark:bg-[#123C3A] text-[#123C3A] dark:text-[#F4FAF8] border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995]"
                }`}
              >
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${todayTask.completed ? "text-[#25A995]" : "text-[#67839A]"}`}
                />
                <span>{todayTask.completed ? "Mark Incomplete" : "Mark Done"}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Skill Breakdown 4-Card Summary */}
      <section aria-label="IELTS Skill Breakdown">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-[#123C3A] dark:text-[#F4FAF8] uppercase tracking-wider">
            IELTS Skill Allocation
          </h3>
          <span className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
            Curriculum Balance: 7-Day Cycle
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {skillBreakdown.map((item) => (
            <div
              key={item.skill}
              className="p-4 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] flex flex-col justify-between gap-3 shadow-2xs hover:border-[#25A995]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSkillIcon(item.skill)}
                  <span className="text-xs font-bold capitalize text-[#123C3A] dark:text-[#F4FAF8]">
                    {item.skill}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995]">
                  {item.completed} / {item.total} tasks
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="w-full h-1.5 rounded-full bg-[#D4E8E3] dark:bg-[#205653] overflow-hidden">
                  <div
                    className="h-full bg-[#25A995] rounded-full transition-all duration-300"
                    style={{
                      width: `${item.total > 0 ? (item.completed / item.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
                  <span>{item.plannedMinutes} mins planned</span>
                  <Link
                    href={`/skills/${item.skill}`}
                    className="text-[#25A995] font-semibold hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Practice</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Educational Honesty Note */}
        <div className="mt-3 p-3 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48]/50 border border-[#D4E8E3] dark:border-[#205653] flex items-center gap-2 text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
          <ShieldCheck className="w-4 h-4 text-[#25A995] shrink-0" />
          <span>
            <strong>Educational Notice:</strong> Task completion reflects dedicated practice time,
            not verified official IELTS bands. Band estimates calibrate exclusively from scored
            examinations.
          </span>
        </div>
      </section>

      {/* Weekly Curriculum (Chronological Task List) */}
      <section className="space-y-4" aria-label="Weekly Study Tasks">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#25A995]" />
            <h3 className="text-base font-extrabold text-[#123C3A] dark:text-[#F4FAF8]">
              Weekly Curriculum Schedule
            </h3>
          </div>
          <span className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
            Week of {plan.weekStart}
          </span>
        </div>

        <div className="space-y-3">
          {plan.tasks.map((task) => {
            const isCompleted = task.completed || task.status === "completed";
            const isToggling = togglingTaskId === task.id;
            const isRescheduling = reschedulingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? "bg-[#F9FCFB] dark:bg-[#0E2F2D] border-[#D4E8E3] dark:border-[#205653] opacity-80"
                    : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995]/60 shadow-2xs"
                }`}
              >
                {/* Left: Checkbox + Day info + Title + Rationale */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggle(task.id, isCompleted)}
                    disabled={isToggling}
                    className={`w-6 h-6 mt-0.5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? "bg-[#25A995] border-[#25A995] text-white"
                        : "border-[#C9DDE7] dark:border-[#205653] bg-white dark:bg-[#123C3A] hover:border-[#25A995]"
                    }`}
                    aria-label={
                      isCompleted ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`
                    }
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#123C3A] dark:text-[#F4FAF8]">
                        {task.day}
                      </span>
                      <span className="text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                        {task.date}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995] inline-flex items-center gap-1">
                        {getSkillIcon(task.skill)}
                        {task.skill}
                      </span>
                      {task.testType !== "both" && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {task.testType === "general_training" ? "GT" : "Academic"}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Planned"}
                      </span>
                    </div>

                    <h4
                      className={`text-xs sm:text-sm font-bold ${
                        isCompleted
                          ? "line-through text-[#67839A] dark:text-[#A0C5C1]"
                          : "text-[#123C3A] dark:text-[#F4FAF8]"
                      }`}
                    >
                      {task.title}
                    </h4>

                    <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                      {task.objective}
                    </p>

                    {/* Why Recommended Pill */}
                    <div className="text-[11px] text-[#67839A] dark:text-[#A0C5C1] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#25A995] shrink-0" />
                      <span className="italic">{task.whyRecommended}</span>
                    </div>

                    <div className="text-[11px] text-[#67839A] dark:text-[#A0C5C1] flex items-center gap-2 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.durationMinutes} mins</span>
                      </span>
                      {task.completedAt && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          • Done on {new Date(task.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Action Button & Reschedule Dropdown */}
                <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                  {/* Reschedule Selector */}
                  {!isCompleted && (
                    <div className="relative inline-block">
                      <label htmlFor={`reschedule-${task.id}`} className="sr-only">
                        Reschedule {task.title} to another day
                      </label>
                      <select
                        id={`reschedule-${task.id}`}
                        aria-label={`Reschedule ${task.title}`}
                        disabled={isRescheduling}
                        value={task.day}
                        onChange={(e) => handleReschedule(task.id, e.target.value)}
                        className="text-[11px] font-semibold py-1.5 px-2.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:border-[#25A995] cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#25A995]"
                      >
                        <option disabled value={task.day}>
                          Reschedule...
                        </option>
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d} value={d}>
                            Move to {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Primary Activity Link */}
                  <Link
                    href={
                      task.actionHref ||
                      (task.skill === "mock"
                        ? "/mock-centre"
                        : `/skills/${task.skill || "reading"}`)
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#25A995] hover:text-[#25A995] transition-colors flex items-center gap-1"
                  >
                    <span>{task.actionLabel || "Practise"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weekly Self-Reflection & Strategy Section */}
      <section
        className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4"
        aria-label="Weekly Reflection"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#25A995]" />
              <h3 className="text-base font-extrabold text-[#123C3A] dark:text-[#F4FAF8]">
                Weekly Reflection & Strategy
              </h3>
            </div>
            <p className="text-xs text-[#67839A] dark:text-[#A0C5C1] mt-0.5">
              Reflective learning identifies persistent error patterns and guides optimal next-cycle
              adaptation.
            </p>
          </div>

          {plan.reflection && !showReflectionForm && (
            <button
              onClick={() => setShowReflectionForm(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#25A995] cursor-pointer"
            >
              Update Reflection
            </button>
          )}
        </div>

        {/* Existing reflection view */}
        {plan.reflection && !showReflectionForm ? (
          <div className="p-4 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48]/50 border border-[#D4E8E3] dark:border-[#205653] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#67839A] dark:text-[#A0C5C1]">
              <span className="font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                Cycle Logged on {new Date(plan.reflection.submittedAt).toLocaleDateString()}
              </span>
              <span className="capitalize font-bold text-[#25A995]">
                Focus Skill: {plan.reflection.difficultSkill}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653]">
                <div className="font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1">
                  What Improved:
                </div>
                <div className="text-[#3D6462] dark:text-[#A0C5C1]">
                  {plan.reflection.whatImproved}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653]">
                <div className="font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1">
                  Next Cycle Goal:
                </div>
                <div className="text-[#3D6462] dark:text-[#A0C5C1]">
                  {plan.reflection.nextCycleGoal}
                </div>
              </div>
            </div>

            {plan.reflection.weakQuestionType &&
              plan.reflection.weakQuestionType !== "none" && (
                <div className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
                  <span className="font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    Targeted Question Type:{" "}
                  </span>
                  <span>{plan.reflection.weakQuestionType}</span>
                </div>
              )}
          </div>
        ) : (
          /* Reflection Input Form */
          <form onSubmit={handleSubmitReflection} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1.5">
                  What improved this week? *
                </label>
                <textarea
                  required
                  rows={2}
                  value={reflectionWhatImproved}
                  onChange={(e) => setReflectionWhatImproved(e.target.value)}
                  placeholder="e.g., Improved True/False/Not Given scanning speed; clearer Task 2 topic sentences."
                  className="w-full text-xs p-3 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] focus:border-[#25A995] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1.5">
                  Primary goal for next study cycle *
                </label>
                <textarea
                  required
                  rows={2}
                  value={reflectionNextCycleGoal}
                  onChange={(e) => setReflectionNextCycleGoal(e.target.value)}
                  placeholder="e.g., Master Task 1 overview paragraph; score at least Band 7.0 on Section 3 listening."
                  className="w-full text-xs p-3 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] focus:border-[#25A995] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1.5">
                  Most challenging IELTS skill
                </label>
                <select
                  value={reflectionDifficultSkill}
                  onChange={(e) => setReflectionDifficultSkill(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] focus:border-[#25A995] focus:outline-hidden"
                >
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1.5">
                  Specific question type or error tag
                </label>
                <input
                  type="text"
                  value={reflectionWeakQuestionType}
                  onChange={(e) => setReflectionWeakQuestionType(e.target.value)}
                  placeholder="e.g., Headings Matching, Map Labelling, Task 1 Data Selection"
                  className="w-full text-xs p-2.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] focus:border-[#25A995] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {plan.reflection && (
                <button
                  type="button"
                  onClick={() => setShowReflectionForm(false)}
                  className="px-4 py-2 rounded-xl border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#67839A] hover:text-[#123C3A] cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmittingReflection}
                className="px-5 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#1E8A7A] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSubmittingReflection ? "Saving Reflection..." : "Save Reflection"}
                </span>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
