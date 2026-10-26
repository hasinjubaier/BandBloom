"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Laptop,
  ArrowRight,
  Award,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TestTypesPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#25A995] bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 px-3 py-1 rounded-full">
          Format & Structure Guide
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
          IELTS Academic vs. General Training
        </h1>
        <p className="text-sm text-[#3D6462] dark:text-[#A0C5C1]">
          Understand the distinct content requirements, task differences, and scoring conversions between the two test tracks.
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Academic Card */}
        <div className="bg-white dark:bg-[#123C3A] p-8 rounded-3xl border border-[#25A995]/30 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F7F4] dark:bg-[#0A1C1B] border border-[#25A995]/30 flex items-center justify-center text-[#25A995]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">IELTS Academic</h2>
              <span className="text-xs text-[#25A995] font-semibold">Higher Education & Professional Licensing</span>
            </div>
          </div>

          <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
            Evaluates whether you are prepared to begin studying or training in an English-speaking academic environment.
          </p>

          <ul className="space-y-3 text-xs text-[#3D6462] dark:text-[#A0C5C1] border-t border-[#D4E8E3] dark:border-[#205653] pt-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#25A995] shrink-0 mt-0.5" />
              <span><strong>Reading:</strong> 3 long academic texts drawn from scientific journals, books, and research magazines (40 questions, 60 mins).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#25A995] shrink-0 mt-0.5" />
              <span><strong>Writing Task 1:</strong> Describe, summarize, or explain information from a graph, chart, table, or diagram (min 150 words).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#25A995] shrink-0 mt-0.5" />
              <span><strong>Writing Task 2:</strong> Write an academic essay responding to a point of view, argument, or problem (min 250 words).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#25A995] shrink-0 mt-0.5" />
              <span><strong>Listening & Speaking:</strong> Identical format and grading across both modules.</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              href="/practice"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25A995] hover:opacity-80"
            >
              <span>Practice Academic Reading</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* General Training Card */}
        <div className="bg-white dark:bg-[#123C3A] p-8 rounded-3xl border border-[#FF8A65]/30 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF6F3] dark:bg-[#0A1C1B] border border-[#FF8A65]/30 flex items-center justify-center text-[#FF8A65]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">IELTS General Training</h2>
              <span className="text-xs text-[#FF8A65] font-semibold">Immigration & Workplace Certification</span>
            </div>
          </div>

          <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
            Measures English language proficiency in a practical, day-to-day context for migration to Australia, Canada, New Zealand, or the UK.
          </p>

          <ul className="space-y-3 text-xs text-[#3D6462] dark:text-[#A0C5C1] border-t border-[#D4E8E3] dark:border-[#205653] pt-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF8A65] shrink-0 mt-0.5" />
              <span><strong>Reading:</strong> Extracts from company handbooks, advertisements, notices, and everyday workplace materials (40 questions, 60 mins).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF8A65] shrink-0 mt-0.5" />
              <span><strong>Writing Task 1:</strong> Write a letter requesting information, explaining a situation, or solving a personal problem (min 150 words).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF8A65] shrink-0 mt-0.5" />
              <span><strong>Writing Task 2:</strong> Discursive essay on a general topic with slightly more personal style permitted (min 250 words).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF8A65] shrink-0 mt-0.5" />
              <span><strong>Scoring Notice:</strong> GT Reading requires higher raw marks (e.g. ~34/40 for Band 7) than Academic (~30/40 for Band 7).</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              href="/practice"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF8A65] hover:opacity-80"
            >
              <span>Practice GT Writing Letters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2026 Test Delivery Notice Box */}
      <div className="bg-[#F4FAF8] dark:bg-[#123C3A]/60 p-8 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] space-y-4">
        <div className="flex items-center gap-2 text-[#25A995] text-sm font-bold">
          <Laptop className="w-5 h-5" />
          <span>2026 Computer-Delivered IELTS Transition & One Skill Retake</span>
        </div>
        <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
          From mid-2026 onward, paper-based testing is being phased out internationally in favor of computer delivery. Candidates benefit from faster results (delivered within 1–5 days) and the option of <strong className="text-[#123C3A] dark:text-[#F4FAF8]">One Skill Retake</strong>: retaking any single component (Reading, Listening, Writing, or Speaking) within 60 days of the original test without retaking the entire exam.
        </p>
      </div>
    </div>
  );
}
