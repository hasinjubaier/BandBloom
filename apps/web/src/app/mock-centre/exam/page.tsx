"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Flag,
  HelpCircle,
  Type,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Laptop,
} from "lucide-react";
import { MOCK_READING_PASSAGE } from "@/data/mockCurriculum";

export default function ComputerExamSimulatorPage() {
  const router = useRouter();

  // Test state
  const [secondsRemaining, setSecondsRemaining] = useState(3600); // 60 mins
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [autoSavedNotice, setAutoSavedNotice] = useState(true);

  const totalQuestions = 40; // Full 40 questions representation
  const sampleQuestions = MOCK_READING_PASSAGE.questions;

  // Authoritative server timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (val: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIdx + 1]: val }));
    // Simulate auto-save
    setAutoSavedNotice(true);
  };

  const toggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQuestionIdx + 1]: !prev[currentQuestionIdx + 1],
    }));
  };

  const handleSubmitExam = () => {
    router.push("/results/mock-1");
  };

  const currentQ =
    sampleQuestions[currentQuestionIdx % sampleQuestions.length];

  return (
    <div className="min-h-screen bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#123C3A] dark:text-[#F4FAF8] flex flex-col font-sans select-none">
      {/* 1. Official CD-IELTS Top Authoritative Bar */}
      <header className="bg-white dark:bg-[#123C3A] border-b border-[#D4E8E3] dark:border-[#205653] px-4 sm:px-6 py-3 flex items-center justify-between text-xs sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            <Laptop className="w-4 h-4 text-[#25A995]" />
            <span className="hidden sm:inline">BandBloom Academic Mock 1 —</span>
            <span className="text-[#25A995]">Reading Section</span>
          </div>
          <span className="text-[11px] bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20 px-2 py-0.5 rounded font-semibold hidden md:inline">
            40 Questions • 60 Mins
          </span>
        </div>

        {/* Center: Authoritative Timer */}
        <div className="flex items-center gap-2 bg-[#F4FAF8] dark:bg-[#0A1C1B] px-3.5 py-1.5 rounded-xl border border-[#D4E8E3] dark:border-[#205653]">
          <Clock className="w-4 h-4 text-[#FF8A65]" />
          <span className="text-sm font-extrabold text-[#123C3A] dark:text-[#F4FAF8] font-mono tracking-wider">
            {formatTime(secondsRemaining)}
          </span>
          <span className="text-[10px] text-[#3D6462] dark:text-[#A0C5C1]">left</span>
        </div>

        {/* Right: Accessibility Controls */}
        <div className="flex items-center gap-3">
          {/* Font Size Adjuster */}
          <div className="flex items-center bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-lg p-0.5">
            <button
              onClick={() => setFontSize("sm")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                fontSize === "sm" ? "bg-[#25A995] text-white" : "text-[#3D6462] dark:text-[#A0C5C1]"
              }`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize("base")}
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                fontSize === "base" ? "bg-[#25A995] text-white" : "text-[#3D6462] dark:text-[#A0C5C1]"
              }`}
              title="Medium Font Size"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize("lg")}
              className={`px-2 py-0.5 rounded text-sm font-bold ${
                fontSize === "lg" ? "bg-[#25A995] text-white" : "text-[#3D6462] dark:text-[#A0C5C1]"
              }`}
              title="Large Font Size"
            >
              A++
            </button>
          </div>

          {/* Flag For Review Button */}
          <button
            onClick={toggleFlag}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              flagged[currentQuestionIdx + 1]
                ? "bg-[#FFF6F3] border-[#FF8A65] text-[#FF8A65]"
                : "bg-[#F4FAF8] dark:bg-[#0A1C1B] border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Review</span>
          </button>
        </div>
      </header>

      {/* 2. Split Screen Working Area */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Passage Pane */}
        <div className="lg:col-span-7 border-r border-[#D4E8E3] dark:border-[#205653] p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-140px)] bg-white/60 dark:bg-[#123C3A]/30">
          <div className="mb-4 pb-2 border-b border-[#D4E8E3] dark:border-[#205653] text-xs text-[#3D6462] dark:text-[#A0C5C1] font-semibold uppercase tracking-wider flex justify-between">
            <span>Passage 1 Text</span>
            <span>Questions 1–13</span>
          </div>
          <h2 className="text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-4">
            {MOCK_READING_PASSAGE.title}
          </h2>

          <div
            className={`space-y-4 text-[#123C3A] dark:text-[#F4FAF8] leading-relaxed ${
              fontSize === "sm"
                ? "text-xs"
                : fontSize === "lg"
                ? "text-base"
                : "text-sm"
            }`}
          >
            {MOCK_READING_PASSAGE.text
              .trim()
              .split("\n\n")
              .map((para, i) => (
                <p key={i} className="hover:bg-[#E8F7F4]/40 dark:hover:bg-[#25A995]/10 p-2 rounded-lg transition-colors">
                  {para}
                </p>
              ))}
          </div>
        </div>

        {/* Right Questions Pane */}
        <div className="lg:col-span-5 p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-140px)] space-y-6">
          <div className="bg-white dark:bg-[#123C3A] p-4 rounded-xl border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#3D6462] dark:text-[#A0C5C1] shadow-sm">
            <strong className="text-[#123C3A] dark:text-[#F4FAF8]">Question {currentQuestionIdx + 1} of 40:</strong>
            <p className="mt-1 text-[#3D6462] dark:text-[#A0C5C1]">
              Do the following statements agree with the information in the text? Choose the correct option below.
            </p>
          </div>

          <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-[#25A995] text-white font-extrabold text-sm flex items-center justify-center">
                {currentQuestionIdx + 1}
              </span>
              <span className="text-xs text-[#25A995] uppercase font-bold tracking-wider">
                True / False / Not Given
              </span>
            </div>

            <p className="text-base text-[#123C3A] dark:text-[#F4FAF8] font-medium leading-snug">
              {currentQ.prompt}
            </p>

            {/* Answer Options */}
            <div className="space-y-2 pt-2">
              {["TRUE", "FALSE", "NOT GIVEN"].map((opt) => {
                const isSelected = answers[currentQuestionIdx + 1] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full p-3.5 rounded-xl border text-sm font-medium text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-[#E8F7F4] border-[#25A995] text-[#123C3A] dark:bg-[#25A995]/20 dark:text-[#F4FAF8] shadow-sm"
                        : "bg-[#F4FAF8] dark:bg-[#0A1C1B] border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-[#25A995] bg-[#25A995]"
                          : "border-[#D4E8E3] dark:border-[#205653]"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official CD-IELTS Bottom Strip: 40 Question Matrix & Actions */}
      <footer className="bg-white dark:bg-[#123C3A] border-t border-[#D4E8E3] dark:border-[#205653] px-4 py-3 sticky bottom-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Previous / Next buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIdx === 0}
              className="p-2 rounded-lg bg-[#F4FAF8] dark:bg-[#0A1C1B] hover:bg-[#D4E8E3]/50 disabled:opacity-40 text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              onClick={() =>
                setCurrentQuestionIdx((prev) =>
                  Math.min(totalQuestions - 1, prev + 1)
                )
              }
              disabled={currentQuestionIdx === totalQuestions - 1}
              className="p-2 rounded-lg bg-[#F4FAF8] dark:bg-[#0A1C1B] hover:bg-[#D4E8E3]/50 disabled:opacity-40 text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold flex items-center gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 40-Question Navigation Grid */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1 px-2">
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const qNum = i + 1;
              const isAnswered = !!answers[qNum];
              const isFlagged = !!flagged[qNum];
              const isActive = currentQuestionIdx === i;

              return (
                <button
                  key={qNum}
                  onClick={() => setCurrentQuestionIdx(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 relative ${
                    isActive
                      ? "ring-2 ring-[#25A995] bg-[#25A995] text-white"
                      : isAnswered
                      ? "bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/40 dark:bg-[#25A995]/20"
                      : "bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                  }`}
                >
                  <span>{qNum}</span>
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF8A65] rounded-full ring-2 ring-white dark:ring-[#123C3A]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] hidden lg:inline">
              Answered: {Object.keys(answers).length} / {totalQuestions}
            </span>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-white text-xs font-semibold shadow-md shadow-[#25A995]/25 transition-all"
            >
              Finish Section
            </button>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-xl">
            <AlertTriangle className="w-10 h-10 text-[#FF8A65] mx-auto" />
            <h3 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">Submit Reading Section?</h3>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
              You have answered {Object.keys(answers).length} of {totalQuestions} questions. Once finalized, your attempt will be graded and official band scores computed.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] hover:bg-[#D4E8E3]/50 text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] text-xs font-medium"
              >
                Return to Test
              </button>
              <button
                onClick={handleSubmitExam}
                className="flex-1 py-2 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-white text-xs font-semibold shadow-md shadow-[#25A995]/25"
              >
                Confirm & Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
