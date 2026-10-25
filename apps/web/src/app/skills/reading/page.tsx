"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookmarkPlus,
  ArrowRight,
  Eye,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { MOCK_READING_PASSAGE } from "@/data/mockCurriculum";
import { useExam } from "@/context/ExamContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ReadingLabPage() {
  const { language } = useLanguage();
  const { addMistake } = useExam();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [highlightEvidence, setHighlightEvidence] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState<Record<string, boolean>>({});

  const handleSelectAnswer = (qId: string, val: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const calculateScore = () => {
    let correct = 0;
    MOCK_READING_PASSAGE.questions.forEach((q) => {
      if (answers[q.id]?.trim().toUpperCase() === q.correctAnswer.toUpperCase()) {
        correct++;
      }
    });
    return correct;
  };

  const handleAddToNotebook = (q: (typeof MOCK_READING_PASSAGE.questions)[0]) => {
    addMistake({
      skill: "reading",
      questionType: q.type,
      errorTag: "keyword trap",
      questionPrompt: q.prompt,
      studentAnswer: answers[q.id] || "No Answer",
      correctAnswer: q.correctAnswer,
      reasoning: q.explanation,
      retryStatus: "unresolved",
    });
    setSavedNotes((prev) => ({ ...prev, [q.id]: true }));
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setHighlightEvidence(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4E8E3] dark:border-[#205653]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#25A995] mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Academic Reading Skill Lab</span>
            <span className="text-[#3D6462] dark:text-[#A0C5C1]">•</span>
            <span>Passage 1 Strategy: True, False, Not Given</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
            {MOCK_READING_PASSAGE.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {submitted ? (
            <div className="flex items-center gap-3">
              <div className="text-xs text-right">
                <span className="text-[#3D6462] dark:text-[#A0C5C1] block">Score:</span>
                <span className="text-base font-bold text-[#25A995]">
                  {calculateScore()} / {MOCK_READING_PASSAGE.questions.length} Correct
                </span>
              </div>
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] hover:bg-[#D4E8E3]/50 dark:hover:bg-[#205653] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="px-5 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-white font-semibold text-xs shadow-md shadow-[#25A995]/25 transition-all"
            >
              Submit & Check Answers
            </button>
          )}
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Reading Passage (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#123C3A] rounded-2xl border border-[#D4E8E3] dark:border-[#205653] p-6 sm:p-8 space-y-4 max-h-[75vh] overflow-y-auto shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#D4E8E3] dark:border-[#205653] text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            <span className="font-semibold uppercase tracking-wider text-[#123C3A] dark:text-[#F4FAF8]">
              Reading Passage Text
            </span>
            <span>You should spend about 20 minutes on Questions 1–4.</span>
          </div>

          <div className="max-w-none text-[#123C3A] dark:text-[#F4FAF8] text-sm leading-relaxed space-y-4">
            {MOCK_READING_PASSAGE.text
              .trim()
              .split("\n\n")
              .map((para, idx) => {
                const isHighlighted = highlightEvidence && para.includes(highlightEvidence);
                return (
                  <p
                    key={idx}
                    className={`p-2.5 rounded-xl transition-all ${
                      isHighlighted
                        ? "bg-[#FFF6F3] border border-[#FF8A65]/40 text-[#123C3A] dark:bg-[#FF8A65]/20 dark:text-[#F4FAF8] shadow-sm"
                        : ""
                    }`}
                  >
                    {para}
                  </p>
                );
              })}
          </div>
        </div>

        {/* Right: Question Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] p-4 rounded-xl text-xs text-[#3D6462] dark:text-[#A0C5C1] shadow-sm">
            <strong className="text-[#123C3A] dark:text-[#F4FAF8]">Questions 1–3:</strong> Do the following statements agree with the information in the text? Choose <strong>TRUE</strong>, <strong>FALSE</strong>, or <strong>NOT GIVEN</strong>.
          </div>

          {MOCK_READING_PASSAGE.questions.map((q) => {
            const studentAns = answers[q.id];
            const isCorrect = studentAns?.toUpperCase() === q.correctAnswer.toUpperCase();

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all shadow-sm ${
                  submitted
                    ? isCorrect
                      ? "border-[#25A995]/40 bg-[#E8F7F4]/30 dark:bg-[#25A995]/15"
                      : "border-[#FF8A65]/40 bg-[#FFF6F3]/30 dark:bg-[#FF8A65]/15"
                    : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#E8F7F4] text-[#25A995] dark:bg-[#25A995]/20 font-bold text-xs flex items-center justify-center shrink-0">
                      {q.number}
                    </span>
                    <span className="text-[11px] font-semibold text-[#3D6462] dark:text-[#A0C5C1] uppercase tracking-wider">
                      {q.type}
                    </span>
                  </div>

                  {submitted && (
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {isCorrect ? (
                        <span className="text-[#25A995] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-[#FF8A65] flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-sm text-[#123C3A] dark:text-[#F4FAF8] font-medium mb-4">
                  {q.prompt}
                </p>

                {/* Options list */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {q.options?.map((opt) => {
                    const isSelected = studentAns === opt;
                    const isCorrectOpt = q.correctAnswer === opt;

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectAnswer(q.id, opt)}
                        disabled={submitted}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
                          isSelected
                            ? "bg-[#25A995] text-white shadow-md shadow-[#25A995]/25"
                            : "bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                        } ${
                          submitted && isCorrectOpt
                            ? "ring-2 ring-[#25A995] bg-[#E8F7F4] text-[#25A995] dark:bg-[#25A995]/30"
                            : ""
                        } ${
                          submitted && isSelected && !isCorrect
                            ? "ring-2 ring-[#FF8A65] bg-[#FFF6F3] text-[#FF8A65] dark:bg-[#FF8A65]/30"
                            : ""
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Submitted Review Drawer */}
                {submitted && (
                  <div className="mt-4 pt-3 border-t border-[#D4E8E3] dark:border-[#205653] space-y-3 text-xs">
                    <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 p-3 rounded-xl border border-[#D4E8E3] dark:border-[#205653] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[#3D6462] dark:text-[#A0C5C1]">Correct Answer:</span>
                        <strong className="text-[#25A995] font-bold">{q.correctAnswer}</strong>
                      </div>
                      <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                        {q.explanation}
                      </p>
                      <div className="text-[10px] text-[#FF8A65] font-semibold pt-1">
                        Trap: {q.errorTrap}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      {q.evidence && (
                        <button
                          onClick={() => setHighlightEvidence(q.evidence.split("(")[0].trim())}
                          className="inline-flex items-center gap-1.5 text-xs text-[#25A995] hover:text-[#1D8B7A] font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show Evidence</span>
                        </button>
                      )}

                      {!isCorrect && (
                        <button
                          onClick={() => handleAddToNotebook(q)}
                          disabled={savedNotes[q.id]}
                          className="inline-flex items-center gap-1.5 text-xs text-[#FF8A65] hover:text-[#E87652] font-medium ml-auto"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>{savedNotes[q.id] ? "Saved to Notebook" : "Save to Mistake Notebook"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
