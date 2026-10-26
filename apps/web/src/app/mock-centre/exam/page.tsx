"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { ExamDetail } from "@/server/services/mock.service";

function ExamSimulatorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const examId = searchParams.get("id") || "99999999-9999-9999-9999-999999999991";
  const existingAttemptId = searchParams.get("attempt");

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(existingAttemptId);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(3600);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingAnswer, setSavingAnswer] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/attempts/${attemptId}`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/results/${attemptId}`);
      } else {
        router.push("/results");
      }
    } catch {
      router.push("/results");
    }
  }, [attemptId, submitting, router]);

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // Initialize Exam and Attempt
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        // 1. Fetch Exam Detail
        const examRes = await fetch(`/api/exams/${examId}`);
        const examJson = await examRes.json();
        if (examJson.success) {
          setExam(examJson.exam);
          setTimeLeftSeconds(examJson.exam.durationMinutes * 60);
        }

        // 2. Start or Resume Attempt
        if (!existingAttemptId) {
          const startRes = await fetch("/api/attempts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ examId }),
          });
          const startJson = await startRes.json();
          if (startJson.success) {
            setAttemptId(startJson.attemptId);
          }
        }
      } catch (e) {
        console.error("Exam init error:", e);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [examId, existingAttemptId]);

  // Exam Countdown Timer
  useEffect(() => {
    if (loading || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, timeLeftSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentSection = exam?.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];

  const handleSelectOption = async (optionText: string) => {
    if (!currentQuestion || !attemptId) return;
    const newResponses = { ...responses, [currentQuestion.id]: optionText };
    setResponses(newResponses);

    // Save response asynchronously
    setSavingAnswer(true);
    try {
      await fetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          responseJson: { answer: optionText },
        }),
      });
    } catch {}
    setSavingAnswer(false);
  };

  const handleTextChange = async (text: string) => {
    if (!currentQuestion || !attemptId) return;
    setResponses({ ...responses, [currentQuestion.id]: text });
  };

  const handleTextBlur = async () => {
    if (!currentQuestion || !attemptId) return;
    const text = responses[currentQuestion.id] || "";
    setSavingAnswer(true);
    try {
      await fetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          responseJson: { answer: text },
        }),
      });
    } catch {}
    setSavingAnswer(false);
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#25A995] animate-spin" />
        <p className="text-sm font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
          Initializing Official Testing Environment...
        </p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-rose-500">Exam configuration could not be loaded.</p>
        <Link
          href="/mock-centre"
          className="px-4 py-2 rounded-xl bg-[#25A995] text-white text-xs font-bold inline-block"
        >
          Return to Mock Centre
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-h-[calc(100vh-140px)] flex flex-col">
      {/* ========================================================================= */}
      {/* Exam Header: Title, Timer, Section Tabs, Submit Trigger */}
      {/* ========================================================================= */}
      <header className="p-4 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/mock-centre"
            className="p-1.5 rounded-lg border border-[#D4E8E3] dark:border-[#205653] text-[#67839A] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48]"
            title="Leave exam"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#123C3A] dark:text-[#F4FAF8] truncate max-w-xs sm:max-w-md">
              {exam.title}
            </h2>
            <div className="text-[10px] text-[#67839A] dark:text-[#A0C5C1] uppercase tracking-wider">
              Computer-Delivered Standard
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {exam.sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => {
                setCurrentSectionIndex(idx);
                setCurrentQuestionIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors flex items-center gap-1.5 ${
                currentSectionIndex === idx
                  ? "bg-[#25A995] text-white shadow-xs"
                  : "bg-[#F4FAF8] dark:bg-[#174A48] text-[#3D6462] dark:text-[#A0C5C1] hover:border-[#25A995]"
              }`}
            >
              {sec.skill === "reading" && <BookOpen className="w-3.5 h-3.5" />}
              {sec.skill === "listening" && <Headphones className="w-3.5 h-3.5" />}
              {sec.skill === "writing" && <Edit3 className="w-3.5 h-3.5" />}
              {sec.skill === "speaking" && <Mic className="w-3.5 h-3.5" />}
              <span>{sec.skill}</span>
            </button>
          ))}
        </div>

        {/* Timer & Submit */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              timeLeftSeconds < 300
                ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse"
                : "bg-[#E8F7F4] dark:bg-[#174A48] border-[#25A995]/30 text-[#123C3A] dark:text-[#F4FAF8]"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#25A995]" />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setConfirmSubmitOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-[#123C3A] dark:bg-[#25A995] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* Exam Main Working Area (Split Pane) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left Pane: Context / Reading Passage / Writing Prompt */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between overflow-y-auto max-h-[600px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4E8E3] dark:border-[#205653]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#25A995]">
                {currentSection?.skill} Section Information
              </span>
              <span className="text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
                {currentSection?.instructions}
              </span>
            </div>

            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] leading-relaxed">
              {currentQuestion?.contextText ? (
                <div className="p-4 rounded-2xl bg-[#F9FCFB] dark:bg-[#0E2F2D] border border-[#D4E8E3] dark:border-[#205653]">
                  {currentQuestion.contextText}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F9FCFB] dark:bg-[#0E2F2D] border border-[#D4E8E3] dark:border-[#205653] text-[#67839A] dark:text-[#A0C5C1]">
                  Official prompt context is presented in the question panel on the right.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: Question & Interactive Answering */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4E8E3] dark:border-[#205653]">
              <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                Question {(currentQuestionIndex + 1)} of {(currentSection?.questions.length || 1)}
              </span>
              {savingAnswer && (
                <span className="text-[10px] text-[#25A995] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Auto-saved
                </span>
              )}
            </div>

            {currentQuestion ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                  {currentQuestion.prompt}
                </p>

                {/* Multiple Choice / TFNG Options */}
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = responses[currentQuestion.id] === opt.optionText;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(opt.optionText)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs sm:text-sm font-medium flex items-center gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-[#E8F7F4] dark:bg-[#25A995]/20 border-[#25A995] text-[#123C3A] dark:text-white font-bold"
                              : "bg-[#F9FCFB] dark:bg-[#174A48] border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:border-[#25A995]/50"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-[#25A995] bg-[#25A995]" : "border-[#8AA4B7]"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>{opt.optionText}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Free Text / Essay Input */
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={10}
                      value={responses[currentQuestion.id] || ""}
                      onChange={(e) => handleTextChange(e.target.value)}
                      onBlur={handleTextBlur}
                      placeholder="Type your response here. Word count is calculated automatically..."
                      className="w-full p-4 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995] focus:ring-2 focus:ring-[#25A995]/20"
                    />
                    <div className="text-[11px] text-[#67839A] dark:text-[#A0C5C1] flex items-center justify-between">
                      <span>
                        Word count:{" "}
                        {(responses[currentQuestion.id] || "").trim().split(/\s+/).filter(Boolean).length}
                      </span>
                      <span>Target: 250+ words</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#67839A]">No questions in this section.</p>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-3.5 py-2 rounded-xl border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4FAF8] dark:hover:bg-[#174A48] flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min((currentSection?.questions.length || 1) - 1, prev + 1)
                )
              }
              disabled={
                currentQuestionIndex >= (currentSection?.questions.length || 1) - 1
              }
              className="px-4 py-2 rounded-xl bg-[#25A995] text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#123C3A] flex items-center gap-1 shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmSubmitOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                Ready to submit your exam?
              </h3>
              <p className="text-xs text-[#67839A] dark:text-[#A0C5C1] mt-1">
                Your responses will be evaluated against official IELTS scoring rubrics and your estimated band score will be calculated.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmSubmitOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]"
              >
                Continue Exam
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm & Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#25A995] animate-spin" />
        </div>
      }
    >
      <ExamSimulatorInner />
    </Suspense>
  );
}
