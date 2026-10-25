"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Tag,
  Filter,
  Sparkles,
} from "lucide-react";
import { useExam } from "@/context/ExamContext";
import { useLanguage } from "@/context/LanguageContext";

export default function MistakeNotebookPage() {
  const { language } = useLanguage();
  const { mistakes, resolveMistake } = useExam();
  const [filterSkill, setFilterSkill] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = mistakes.filter((m) => {
    if (filterSkill !== "all" && m.skill !== filterSkill) return false;
    if (filterStatus !== "all" && m.retryStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF6F3] text-[#FF8A65] border border-[#FF8A65]/30 dark:bg-[#FF8A65]/20 dark:text-[#FF8A65] text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF8A65]" />
            <span>Personal Error Diagnostic</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            Personal Mistake Notebook
          </h1>
          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1]">
            Systematic error logging by trap type (keyword trap, paraphrase miss, quantifier trap, singular/plural) to prevent repeating mistakes during computer mocks.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[#3D6462] dark:text-[#A0C5C1] font-semibold uppercase text-[10px]">Skill:</span>
          {["all", "reading", "listening", "writing"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSkill(s)}
              className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-colors ${
                filterSkill === s
                  ? "bg-[#25A995] text-white shadow-sm"
                  : "bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#3D6462] dark:text-[#A0C5C1] font-semibold uppercase text-[10px]">Status:</span>
          {["all", "unresolved", "mastered"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-colors ${
                filterStatus === st
                  ? "bg-[#25A995] text-white shadow-sm"
                  : "bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Mistake Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#3D6462] dark:text-[#A0C5C1] text-xs">
            No mistakes recorded matching the selected filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-[#123C3A] p-6 rounded-2xl border transition-all space-y-4 shadow-sm ${
                item.retryStatus === "mastered"
                  ? "border-[#25A995]/40 bg-[#E8F7F4]/30 dark:bg-[#25A995]/10"
                  : "border-[#D4E8E3] dark:border-[#205653]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D4E8E3] dark:border-[#205653]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20 dark:text-[#25A995]">
                    {item.skill}
                  </span>
                  <span className="text-xs text-[#3D6462] dark:text-[#A0C5C1] font-medium">
                    {item.questionType}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FFF6F3] text-[#FF8A65] border border-[#FF8A65]/30 dark:bg-[#FF8A65]/20 dark:text-[#FF8A65]">
                    Trap: {item.errorTag}
                  </span>
                  <button
                    onClick={() => resolveMistake(item.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                      item.retryStatus === "mastered"
                        ? "bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20 dark:text-[#25A995]"
                        : "bg-[#F4FAF8] text-[#3D6462] border border-[#D4E8E3] hover:text-[#123C3A] dark:bg-[#0A1C1B] dark:text-[#A0C5C1] dark:hover:text-[#F4FAF8]"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.retryStatus === "mastered" ? "Mastered" : "Mark Mastered"}</span>
                  </button>
                </div>
              </div>

              {/* Prompt */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#3D6462] dark:text-[#A0C5C1] tracking-wider">
                  Question Prompt:
                </span>
                <p className="text-sm font-medium text-[#123C3A] dark:text-[#F4FAF8]">{item.questionPrompt}</p>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#FFF6F3] border border-[#FF8A65]/30 p-3.5 rounded-xl space-y-1 dark:bg-[#FF8A65]/15 dark:border-[#FF8A65]/30">
                  <span className="text-[#FF8A65] font-bold block text-[11px]">Your Recorded Answer:</span>
                  <p className="text-[#123C3A] dark:text-[#F4FAF8] font-medium">{item.studentAnswer}</p>
                </div>

                <div className="bg-[#E8F7F4] border border-[#25A995]/30 p-3.5 rounded-xl space-y-1 dark:bg-[#25A995]/15 dark:border-[#25A995]/30">
                  <span className="text-[#25A995] font-bold block text-[11px]">Correct Expected Answer:</span>
                  <p className="text-[#123C3A] dark:text-[#F4FAF8] font-medium">{item.correctAnswer}</p>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/90 border border-[#D4E8E3] dark:border-[#205653] p-4 rounded-xl text-xs space-y-1">
                <span className="text-[#25A995] font-semibold block text-[11px]">Explanation & Remedial Strategy:</span>
                <p className="text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">{item.reasoning}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
