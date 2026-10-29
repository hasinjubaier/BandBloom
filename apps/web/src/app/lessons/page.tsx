"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  FileText,
  Mic,
  Clock,
  ArrowRight,
} from "lucide-react";
import { MOCK_LESSONS } from "@/data/mockCurriculum";
import { useLanguage } from "@/context/LanguageContext";

export default function LessonsPage() {
  const { language } = useLanguage();
  const [selectedSkill, setSelectedSkill] = useState<string>("all");

  const filtered =
    selectedSkill === "all"
      ? MOCK_LESSONS
      : MOCK_LESSONS.filter((l) => l.skill === selectedSkill);

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case "reading":
        return <BookOpen className="w-5 h-5 text-[#25A995]" />;
      case "listening":
        return <Headphones className="w-5 h-5 text-[#25A995]" />;
      case "writing":
        return <FileText className="w-5 h-5 text-[#FF8A65]" />;
      case "speaking":
        return <Mic className="w-5 h-5 text-[#25A995]" />;
      default:
        return <BookOpen className="w-5 h-5 text-[#25A995]" />;
    }
  };


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#25A995] bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 px-3 py-1 rounded-full">
          Curriculum Bank
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
          Structured IELTS Strategy Lessons
        </h1>
        <p className="text-sm text-[#3D6462] dark:text-[#A0C5C1]">
          Targeted micro-lessons focusing on high-frequency question types, distractor recognition, and marking rubrics.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto text-xs">
        {["all", "reading", "listening", "writing", "speaking"].map((sk) => (
          <button
            key={sk}
            onClick={() => setSelectedSkill(sk)}
            className={`px-4 py-2 rounded-xl font-semibold capitalize transition-colors ${
              selectedSkill === sk
                ? "bg-[#25A995] text-white shadow-md shadow-[#25A995]/20"
                : "bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
            }`}
          >
            {sk === "all" ? "All Lessons" : `${sk} Lessons`}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((l) => (
          <div
            key={l.id}
            className="bg-white dark:bg-[#123C3A] p-6 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] dark:hover:border-[#25A995] transition-all flex flex-col justify-between space-y-4 group shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="p-2 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653]">
                  {getSkillIcon(l.skill)}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7F4] dark:bg-[#0A1C1B] text-[#25A995] border border-[#25A995]/30">
                  {l.level}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8] group-hover:text-[#25A995] transition-colors">
                {language === "bn" ? l.titleBn : l.title}
              </h3>

              <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                {language === "bn" ? l.summaryBn : l.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {l.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between text-xs">
              <span className="text-[#3D6462] dark:text-[#A0C5C1] flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                {l.estimatedMinutes} mins
              </span>

              <Link
                href={`/skills/${l.skill}`}
                className="font-semibold text-[#25A995] hover:opacity-80 flex items-center gap-1"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
