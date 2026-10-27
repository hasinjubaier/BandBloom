"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  NotebookPen,
  BookOpen,
  Headphones,
  FileText,
  Mic,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function StudyPlanProgressSection() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const dailyTasks = [
    {
      id: "task-1",
      skill: "reading",
      title: isBn ? "রিডিং: TFNG কোয়েন্টিফায়ার ট্র্যাপ বিশ্লেষণ" : "Reading: True/False/Not Given Trap Analysis",
      duration: "20m",
      status: "completed",
      icon: BookOpen,
      skillColor: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200/80",
    },
    {
      id: "task-2",
      skill: "listening",
      title: isBn ? "লিসেনিং: সেকশন ৩ মাল্টি-স্পিকার ডায়লগ" : "Listening: Section 3 Multi-Speaker Dialogue",
      duration: "25m",
      status: "in-progress",
      icon: Headphones,
      skillColor: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/80",
    },
    {
      id: "task-3",
      skill: "writing",
      title: isBn ? "রাইটিং টাস্ক ২: কোহেরেন্স ও ট্রানজিশন লিঙ্কার" : "Writing Task 2: Cohesion & Transition Linking",
      duration: "30m",
      status: "pending",
      icon: FileText,
      skillColor: "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border-violet-200/80",
    },
  ];

  const skillIndicators = [
    {
      skill: isBn ? "রিডিং" : "Reading",
      icon: BookOpen,
      status: isBn ? "নিয়মিত অনুশীলন" : "Steady Practice",
      target: "Band 7.5+",
      progressPercent: 78,
      accent: "text-blue-700 dark:text-blue-400",
      barColor: "bg-blue-600 dark:bg-blue-500",
    },
    {
      skill: isBn ? "লিসেনিং" : "Listening",
      icon: Headphones,
      status: isBn ? "অ্যাক্টিভ রিভিউ" : "Active Review",
      target: "Band 7.5+",
      progressPercent: 82,
      accent: "text-amber-700 dark:text-amber-400",
      barColor: "bg-amber-600 dark:bg-amber-500",
    },
    {
      skill: isBn ? "রাইটিং" : "Writing",
      icon: FileText,
      status: isBn ? "রুব্রিক ফোকাস" : "Rubric Focus",
      target: "Band 7.0+",
      progressPercent: 68,
      accent: "text-violet-700 dark:text-violet-400",
      barColor: "bg-violet-600 dark:bg-violet-500",
    },
    {
      skill: isBn ? "স্পিকিং" : "Speaking",
      icon: Mic,
      status: isBn ? "কিউ কার্ড প্র্যাকটিস" : "Cue Card Prep",
      target: "Band 7.0+",
      progressPercent: 72,
      accent: "text-[#FF7043] dark:text-[#FFA285]",
      barColor: "bg-[#FF7043]",
    },
  ];

  return (
    <section
      id="study-plan"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20"
      aria-labelledby="study-plan-heading"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <h2
          id="study-plan-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight mb-4"
        >
          {isBn ? "সব চারটি স্কিলের একটি ধারাবাহিক স্টাডি রুটিন" : "A Study Routine for All Four Skills"}
        </h2>

        <p className="text-sm sm:text-base text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-2xl mx-auto mb-2">
          {isBn
            ? "একটি ধারাবাহিক IELTS স্টাডি রুটিন গড়ে তুলুন, চারটি স্কিলের অগ্রগতি ট্র্যাক করুন এবং পরবর্তী অনুশীলনের দিক নির্ধারণ করুন।"
            : "Build a consistent IELTS study routine, track your practice across all four skills, and discover what to focus on next."}
        </p>

        <p className="text-xs sm:text-sm text-[#167568] dark:text-[#25A995] font-medium max-w-xl mx-auto">
          {isBn
            ? "প্রতিদিনের ছোট কিন্তু নিয়মিত অনুশীলন আপনাকে সুসংগঠিত রাখতে এবং আপনার IELTS লক্ষ্যের দিকে এগিয়ে যেতে সাহায্য করে।"
            : "Small, consistent practice sessions can help you stay organised and work towards your IELTS goals."}
        </p>
      </div>

      {/* Main 2-Column Composition on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Polished Study-Dashboard Preview */}
        <div className="lg:col-span-7 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#25A995] transition-colors relative overflow-hidden">
          <div className="space-y-6">
            {/* Header: Title and Illustrative Preview Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D4E8E3]/70 dark:border-[#205653]/70">
              <div>
                <span className="text-xs font-bold text-[#167568] dark:text-[#25A995] uppercase tracking-wider mb-1 block">
                  {isBn ? "আপনার শিখন সারসংক্ষেপ" : "Your Learning Overview"}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "প্রস্তুতির স্পষ্ট রূপরেখা" : "A Clearer View of Your Preparation"}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] self-start sm:self-center">
                <span>{isBn ? "নমুনা প্রিভিউ" : "Example Preview"}</span>
              </span>
            </div>

            {/* A. Example Daily Study Tasks */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8] uppercase tracking-wider text-xs">
                  {isBn ? "নমুনা দৈনিক স্টাডি টাস্ক" : "Example Daily Study Tasks"}
                </span>
                <span className="text-xs text-[#167568] dark:text-[#25A995] font-semibold">
                  {isBn ? "১ সম্পন্ন • ২ বাকি" : "1 Completed • 2 Pending"}
                </span>
              </div>

              <div className="space-y-2">
                {dailyTasks.map((t) => {
                  const Icon = t.icon;
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${t.skillColor}`}
                        >
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#123C3A] dark:text-[#F4FAF8] truncate">
                            {t.title}
                          </p>
                          <span className="text-xs text-[#3D6462] dark:text-[#A0C5C1] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#167568] dark:text-[#25A995]" aria-hidden="true" />
                            <span>{t.duration}</span>
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {t.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                            <span>Done</span>
                          </span>
                        ) : t.status === "in-progress" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>In Progress</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#123C3A] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653]">
                            Up Next
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* B. Four-Skill Progress Indicators */}
            <div className="space-y-2.5 pt-2">
              <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8] uppercase tracking-wider text-xs block">
                {isBn ? "চারটি স্কিলের অগ্রগতি ট্র্যাকিং" : "Four-Skill Practice Progress"}
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {skillIndicators.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.skill}
                      className="p-3 rounded-2xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80 text-left space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-3.5 h-3.5 ${s.accent}`} aria-hidden="true" />
                        <span className="text-xs font-semibold text-[#3D6462] dark:text-[#A0C5C1]">
                          {s.target}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] truncate">
                        {s.skill}
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-[#174A48] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.barColor}`}
                          style={{ width: `${s.progressPercent}%` }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1] truncate">
                        {s.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* C & D. Weekly Summary & Learning Continuity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Weekly Learning Summary */}
              <div className="p-3.5 rounded-2xl bg-[#E8F7F4]/70 dark:bg-[#0A1C1B] border border-[#25A995]/25 space-y-1">
                <div className="text-xs uppercase font-bold text-[#167568] dark:text-[#25A995] tracking-wider">
                  {isBn ? "সাপ্তাহিক রুটিন সারসংক্ষেপ" : "Weekly Routine Summary"}
                </div>
                <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "৫ / ৬ সেশন সম্পন্ন" : "5 of 6 Sessions Completed"}
                </div>
                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-snug">
                  {isBn
                    ? "ধারাবাহিক অনুশীলন বজায় রাখলে লক্ষ্যমাত্রা অর্জন সহজ হয়।"
                    : "Consistent practice frequency helps build test familiarity."}
                </p>
              </div>

              {/* Next Recommended Task */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] space-y-1">
                <div className="text-xs uppercase font-bold text-[#FF7043] tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF7043]" aria-hidden="true" />
                  <span>{isBn ? "পরবর্তী প্রস্তাবিত টাস্ক" : "Next Recommended Task"}</span>
                </div>
                <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "সাম্প্রতিক রিডিং ভুলগুলো দেখুন" : "Review Recent Reading Mistakes"}
                </div>
                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-snug">
                  {isBn
                    ? "নোটবুকে চিহ্নিত প্রশ্নগুলো পুনরায় যাচাই করুন।"
                    : "Re-evaluate question explanations in your Mistake Notebook."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 mt-6 border-t border-[#D4E8E3]/70 dark:border-[#205653]/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#25A995]/20 border border-transparent transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
            >
              <span>{isBn ? "আপনার প্রস্তুতি শুরু করুন" : "Start Your Preparation"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>

            <Link
              href="/practice"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-white transition-colors"
            >
              <span>{isBn ? "অনুশীলন হাব খুলুন" : "Open Practice Hub"}</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Right Column: Two Focused Feature Highlights */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          {/* Card 1: Flexible Daily Study Time */}
          <div className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-[#25A995] hover:shadow-md transition-all duration-200 group text-left h-full">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 text-[#167568] dark:text-[#25A995] bg-[#E8F7F4] dark:bg-[#0A1C1B] border-[#25A995]/30 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  <CalendarCheck className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653]">
                  {isBn ? "৩০ / ৬০ / ৯০ মিনিট" : "30 / 60 / 90 Mins"}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-2 group-hover:text-[#167568] dark:group-hover:text-[#25A995] transition-colors">
                {isBn ? "দৈনিক পড়ার সময় নির্ধারণ" : "Flexible Daily Study Time"}
              </h3>

              <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed mb-4">
                {isBn
                  ? "প্রতিদিন আপনার পড়ার সময় অনুযায়ী IELTS প্রস্তুতি বিন্যস্ত করুন: ৩০ মিনিট, ৬০ মিনিট অথবা ৯০ মিনিটের নমনীয় রুটিন।"
                  : "Organise your IELTS practice around the time you can study each day with flexible 30, 60, or 90-minute daily options."}
              </p>
            </div>

            <div className="pt-3 border-t border-[#D4E8E3]/60 dark:border-[#205653]/60">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#167568] dark:text-[#25A995] hover:text-[#123C3A] dark:hover:text-white transition-colors group/link focus-visible:outline-none focus-visible:underline"
              >
                <span>{isBn ? "প্রস্তুতির পরিকল্পনা শুরু করুন" : "Set Preparation Goal"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Card 2: Turn Mistakes Into Learning Opportunities */}
          <div className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-[#25A995] hover:shadow-md transition-all duration-200 group text-left h-full">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 text-[#FF7043] dark:text-[#FFA285] bg-orange-50/90 dark:bg-orange-950/50 border-orange-200/80 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  <NotebookPen className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653]">
                  {isBn ? "ভুলের পর্যালোচনা" : "Error Review"}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-2 group-hover:text-[#167568] dark:group-hover:text-[#25A995] transition-colors">
                {isBn ? "ভুল থেকে শেখার সুযোগ তৈরি করুন" : "Turn Mistakes Into Learning Opportunities"}
              </h3>

              <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed mb-4">
                {isBn
                  ? "পুনরাবৃত্তি হওয়া ভুলগুলো ট্র্যাক করুন, সঠিক যুক্তি বিশ্লেষণ করুন এবং যেসব প্রশ্নে দুর্বলতা রয়েছে সেগুলোতে পুনরায় অনুশীলন করুন।"
                  : "Review recurring errors, understand the correct reasoning, and return to questions that need more practice."}
              </p>
            </div>

            <div className="pt-3 border-t border-[#D4E8E3]/60 dark:border-[#205653]/60">
              <Link
                href="/practice"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#167568] dark:text-[#25A995] hover:text-[#123C3A] dark:hover:text-white transition-colors group/link focus-visible:outline-none focus-visible:underline"
              >
                <span>{isBn ? "টার্গেটেড প্র্যাকটিস দেখুন" : "Explore Targeted Practice"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
