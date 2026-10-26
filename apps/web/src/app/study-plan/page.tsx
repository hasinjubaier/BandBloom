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
} from "lucide-react";
import { StudyPlanData } from "@/server/services/study-plan.service";

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<StudyPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/study-plan")
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.plan) {
          setPlan(json.plan);
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

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetch("/api/study-plan")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.plan) {
          setPlan(json.plan);
        } else {
          setError(json.error || "Failed to load study plan.");
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load study plan.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  const handleToggle = async (taskId: string, currentStatus: boolean) => {
    if (!plan) return;
    setTogglingTaskId(taskId);

    // Optimistic UI update
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !currentStatus } : t
        ),
      };
    });

    try {
      const res = await fetch("/api/study-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed: !currentStatus }),
      });
      if (!res.ok) {
        handleRetry();
      }
    } catch {
      handleRetry();
    } finally {
      setTogglingTaskId(null);
    }
  };

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case "reading":
        return <BookOpen className="w-4 h-4 text-teal-600" />;
      case "listening":
        return <Headphones className="w-4 h-4 text-sky-600" />;
      case "writing":
        return <Edit3 className="w-4 h-4 text-amber-600" />;
      case "speaking":
        return <Mic className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileCheck2 className="w-4 h-4 text-[#25A995]" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 bg-white dark:bg-[#123C3A] rounded-2xl border border-[#D4E8E3] dark:border-[#205653]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
          Study Plan Unavailable
        </h2>
        <p className="text-xs text-[#67839A] dark:text-[#A0C5C1]">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 rounded-xl bg-[#25A995] text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const completedCount = plan.tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / plan.tasks.length) * 100);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Plan Header Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Weekly Curriculum</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            Personalized IELTS Study Plan
          </h2>
          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] max-w-xl">
            Tailored weekly schedule structured around your target band score. Check off each task as you complete it to sync your progress to your profile.
          </p>
        </div>

        {/* Progress Circular/Bar Stat */}
        <div className="shrink-0 p-5 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] min-w-[200px]">
          <div className="flex items-center justify-between text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-2">
            <span>Weekly Progress</span>
            <span className="text-[#25A995]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#D4E8E3] dark:bg-[#205653] overflow-hidden">
            <div
              className="h-full bg-[#25A995] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-[#67839A] dark:text-[#A0C5C1] mt-2">
            {completedCount} of {plan.tasks.length} tasks completed
          </div>
        </div>
      </section>

      {/* Days & Tasks List */}
      <section className="space-y-3" aria-label="Weekly Study Tasks">
        {plan.tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
              task.completed
                ? "bg-[#F9FCFB] dark:bg-[#0E2F2D] border-[#D4E8E3] dark:border-[#205653] opacity-80"
                : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995]/60 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                onClick={() => handleToggle(task.id, task.completed)}
                disabled={togglingTaskId === task.id}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  task.completed
                    ? "bg-[#25A995] border-[#25A995] text-white"
                    : "border-[#C9DDE7] dark:border-[#205653] bg-white dark:bg-[#123C3A] hover:border-[#25A995]"
                }`}
                aria-label={
                  task.completed
                    ? `Mark ${task.title} incomplete`
                    : `Mark ${task.title} complete`
                }
              >
                {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#123C3A] dark:text-[#F4FAF8]">
                    {task.day}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995] inline-flex items-center gap-1">
                    {getSkillIcon(task.skill)}
                    {task.skill}
                  </span>
                </div>

                <div
                  className={`text-xs sm:text-sm font-bold truncate ${
                    task.completed
                      ? "line-through text-[#67839A] dark:text-[#A0C5C1]"
                      : "text-[#123C3A] dark:text-[#F4FAF8]"
                  }`}
                >
                  {task.title}
                </div>

                <div className="text-[11px] text-[#67839A] dark:text-[#A0C5C1] mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Estimated: {task.durationMinutes} minutes</span>
                </div>
              </div>
            </div>

            <Link
              href={task.skill === "mock" ? "/mock-centre" : `/skills/${task.skill}`}
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#25A995] transition-colors flex items-center gap-1"
            >
              <span>Practice</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
