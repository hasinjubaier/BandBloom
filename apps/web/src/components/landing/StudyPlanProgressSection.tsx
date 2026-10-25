"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ChartNoAxesCombined,
  NotebookPen,
  BookA,
  BookOpen,
  Headphones,
  FileText,
  Mic,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ListChecks,
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
      skillColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200/80",
    },
    {
      id: "task-2",
      skill: "listening",
      title: isBn ? "লিসেনিং: সেকশন ৩ মাল্টি-স্পিকার ডায়লগ" : "Listening: Section 3 Multi-Speaker Dialogue",
      duration: "25m",
      status: "in-progress",
      icon: Headphones,
      skillColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/80",
    },
    {
      id: "task-3",
      skill: "writing",
      title: isBn ? "রাইটিং টাস্ক ২: কোহেরেন্স ও ট্রানজিশন লিঙ্কার" : "Writing Task 2: Cohesion & Transition Linking",
      duration: "30m",
      status: "pending",
      icon: FileText,
      skillColor: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border-violet-200/80",
    },
  ];

  const skillIndicators = [
    {
      skill: isBn ? "রিডিং" : "Reading",
      icon: BookOpen,
      status: isBn ? "নিয়মিত অনুশীলন" : "Steady Practice",
      target: "Band 7.5+",
      progressPercent: 78,
      accent: "text-blue-600 dark:text-blue-400",
      barColor: "bg-blue-600 dark:bg-blue-500",
    },
    {
      skill: isBn ? "লিসেনিং" : "Listening",
      icon: Headphones,
      status: isBn ? "অ্যাক্টিভ রিভিউ" : "Active Review",
      target: "Band 7.5+",
      progressPercent: 82,
      accent: "text-amber-600 dark:text-amber-400",
      barColor: "bg-amber-600 dark:bg-amber-500",
    },
    {
      skill: isBn ? "রাইটিং" : "Writing",
      icon: FileText,
      status: isBn ? "রুব্রিক ফোকাস" : "Rubric Focus",
      target: "Band 7.0+",
      progressPercent: 68,
      accent: "text-violet-600 dark:text-violet-400",
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

  const features = [
    {
      id: "plan",
      title: isBn ? "আপনার দিন অনুযায়ী মানানসই পরিকল্পনা" : "A Plan That Fits Your Day",
      desc: isBn
        ? "প্রতিদিন আপনার পড়ার সময় অনুযায়ী IELTS প্রস্তুতি বিন্যস্ত করুন: ৩০ মিনিট, ৬০ মিনিট অথবা ৯০ মিনিটের নমনীয় রুটিন।"
        : "Organise your IELTS practice around the time you can study each day with flexible 30, 60, or 90-minute daily options.",
      icon: CalendarCheck,
      badge: isBn ? "৩০ / ৬০ / ৯০ মিনিট" : "30 / 60 / 90 Mins",
      link: {
        href: "/study-plan",
        label: isBn ? "স্টাডি প্ল্যান কাস্টমাইজ করুন" : "Customise Your Plan",
      },
      accent: "text-[#25A995] bg-[#E8F7F4] dark:bg-[#0A1C1B] border-[#25A995]/30",
    },
    {
      id: "progress",
      title: isBn ? "চারটি স্কিলের অগ্রগতি পর্যালোচনা" : "See How Your Skills Progress",
      desc: isBn
        ? "আপনার সাম্প্রতিক অনুশীলন পর্যালোচনা করুন, অগ্রগতির ধারা বুঝুন এবং কোন স্কিলে বাড়তি মনোযোগ প্রয়োজন তা শনাক্ত করুন।"
        : "Review your recent practice, understand your trends, and identify which IELTS skills need more attention.",
      icon: ChartNoAxesCombined,
      badge: isBn ? "৪-স্কিল ড্যাশবোর্ড" : "4-Skill Overview",
      link: {
        href: "/dashboard",
        label: isBn ? "কমান্ড সেন্টার খুলুন" : "Open Learning Dashboard",
      },
      accent: "text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/50 border-blue-200/80",
    },
    {
      id: "mistakes",
      title: isBn ? "ভুল থেকে শেখার সুযোগ তৈরি করুন" : "Turn Mistakes Into Learning Opportunities",
      desc: isBn
        ? "পুনরাবৃত্তি হওয়া ভুলগুলো ট্র্যাক করুন, সঠিক যুক্তি বিশ্লেষণ করুন এবং যেসব প্রশ্নে দুর্বলতা রয়েছে সেগুলোতে পুনরায় অনুশীলন করুন।"
        : "Review recurring errors, understand the correct reasoning, and return to questions that need more practice.",
      icon: NotebookPen,
      badge: isBn ? "ভুলের ক্যাটাগরি" : "Error Categorisation",
      link: {
        href: "/notebook",
        label: isBn ? "ভুলের নোটবুক দেখুন" : "Explore Mistake Notebook",
      },
      accent: "text-[#FF7043] dark:text-[#FFA285] bg-orange-50/90 dark:bg-orange-950/50 border-orange-200/80",
    },
    {
      id: "vocab",
      title: isBn ? "নিয়মিত শব্দভাণ্ডার সমৃদ্ধ করুন" : "Build Your Vocabulary Consistently",
      desc: isBn
        ? "প্রয়োজনীয় অ্যাকাডেমিক শব্দ ও কলকেশন সংরক্ষণ করুন, অর্থ ও ব্যবহারের উদাহরণ দেখুন এবং সময়মতো পুনরায় রিভিশন দিন।"
        : "Keep useful words, review their meanings and examples, and return to vocabulary when it is time to practise again.",
      icon: BookA,
      badge: isBn ? "অ্যাকাডেমিক লেক্সিকন" : "Academic Word Bank",
      link: {
        href: "/vocabulary",
        label: isBn ? "শব্দভাণ্ডার ব্যাংক দেখুন" : "Review Vocabulary Bank",
      },
      accent: "text-violet-600 dark:text-violet-400 bg-violet-50/90 dark:bg-violet-950/50 border-violet-200/80",
    },
  ];

  return (
    <section
      id="study-plan"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20"
      aria-labelledby="study-plan-heading"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 text-[#25A995] text-xs font-semibold tracking-wider uppercase mb-3.5">
          <ListChecks className="w-3.5 h-3.5 text-[#25A995]" aria-hidden="true" />
          <span>{isBn ? "আপনার অগ্রগতি, আপনার গতিতে" : "YOUR PROGRESS, YOUR PACE"}</span>
        </div>

        <h2
          id="study-plan-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight mb-4"
        >
          {isBn ? "একটি স্টাডি প্ল্যান যা আপনাকে এগিয়ে রাখে" : "A Study Plan That Keeps You Moving"}
        </h2>

        <p className="text-sm sm:text-base text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-2xl mx-auto mb-2">
          {isBn
            ? "একটি ধারাবাহিক IELTS স্টাডি রুটিন গড়ে তুলুন, চারটি স্কিলের অগ্রগতি ট্র্যাক করুন এবং পরবর্তী অনুশীলনের দিক নির্ধারণ করুন।"
            : "Build a consistent IELTS study routine, track your practice across all four skills, and discover what to focus on next."}
        </p>

        <p className="text-xs sm:text-sm text-[#25A995] font-medium max-w-xl mx-auto">
          {isBn
            ? "প্রতিদিনের ছোট কিন্তু নিয়মিত অনুশীলন আপনাকে সুসংগঠিত রাখতে এবং আপনার IELTS লক্ষ্যের দিকে এগিয়ে যেতে সাহায্য করে।"
            : "Small, consistent practice sessions can help you stay organised and work towards your IELTS goals."}
        </p>
      </div>

      {/* Main 2-Column Composition on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-14">
        {/* Left Column: Polished Study-Dashboard Preview */}
        <div className="lg:col-span-7 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#25A995] transition-colors relative overflow-hidden">
          <div className="space-y-6">
            {/* Header: Title and Illustrative Preview Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D4E8E3]/70 dark:border-[#205653]/70">
              <div>
                <span className="text-[11px] font-bold text-[#25A995] uppercase tracking-wider mb-1 block">
                  {isBn ? "আপনার শিখন সারসংক্ষেপ" : "Your Learning Overview"}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "প্রস্তুতির স্পষ্ট রূপরেখা" : "A Clearer View of Your Preparation"}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] font-mono self-start sm:self-center">
                <span>Illustrative Sample Preview</span>
              </span>
            </div>

            {/* A. Today's Suggested Learning Tasks */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8] uppercase tracking-wider text-[11px]">
                  {isBn ? "আজকের নির্ধারিত টাস্কসমূহ" : "Today's Suggested Learning Tasks"}
                </span>
                <span className="text-[11px] text-[#25A995] font-semibold">
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
                          <span className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#25A995]" aria-hidden="true" />
                            <span>{t.duration}</span>
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {t.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                            <span>Done</span>
                          </span>
                        ) : t.status === "in-progress" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>In Progress</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-[#123C3A] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653]">
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
              <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8] uppercase tracking-wider text-[11px] block">
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
                        <span className="text-[10px] font-bold text-[#3D6462] dark:text-[#A0C5C1]">
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
                      <div className="text-[10px] text-[#3D6462] dark:text-[#A0C5C1] truncate">
                        {s.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* C & D. Weekly Summary & Next Recommended Task */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Weekly Learning Summary */}
              <div className="p-3.5 rounded-2xl bg-[#E8F7F4]/70 dark:bg-[#0A1C1B] border border-[#25A995]/25 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#25A995] tracking-wider">
                  {isBn ? "সাপ্তাহিক রুটিন সারসংক্ষেপ" : "Weekly Routine Summary"}
                </div>
                <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "৫ / ৬ সেশন সম্পন্ন" : "5 of 6 Sessions Completed"}
                </div>
                <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] leading-snug">
                  {isBn
                    ? "ধারাবাহিক অনুশীলন বজায় রাখলে লক্ষ্যমাত্রা অর্জন সহজ হয়।"
                    : "Consistent study frequency helps reinforce exam-day retention."}
                </p>
              </div>

              {/* Next Recommended Task */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#FF7043] tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF7043]" aria-hidden="true" />
                  <span>{isBn ? "পরবর্তী প্রস্তাবিত টাস্ক" : "Next Recommended Task"}</span>
                </div>
                <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "সাম্প্রতিক রিডিং ভুলগুলো দেখুন" : "Review Recent Reading Mistakes"}
                </div>
                <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] leading-snug">
                  {isBn
                    ? "নোটবুকে চিহ্নিত প্রশ্নগুলো পুনরায় যাচাই করুন।"
                    : "Re-evaluate 2 unresolved trap questions in your Notebook."}
                </p>
              </div>
            </div>

            {/* Learning Continuity Preview */}
            <div className="p-3 rounded-2xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#3D6462] dark:text-[#A0C5C1]">
                <Layers className="w-4 h-4 text-[#25A995] shrink-0" aria-hidden="true" />
                <span className="text-[11px]">
                  {isBn
                    ? "যেখান থেকে থেমেছিলেন সেখান থেকেই শুরু করুন: যেকোনো সময় রুটিন চালু রাখুন।"
                    : "Pick up where you left off: resume an unfinished exercise or review your past attempts."}
                </span>
              </div>
              <Link
                href="/dashboard"
                className="text-[11px] font-bold text-[#25A995] hover:underline whitespace-nowrap shrink-0"
              >
                {isBn ? "ড্যাশবোর্ড দেখুন" : "View Dashboard"}
              </Link>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 mt-6 border-t border-[#D4E8E3]/70 dark:border-[#205653]/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Link
              href="/study-plan"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#25A995]/20 border border-transparent transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
            >
              <span>{isBn ? "আপনার স্টাডি প্ল্যান শুরু করুন" : "Start Your Study Plan"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-white transition-colors"
            >
              <span>{isBn ? "লার্নিং ড্যাশবোর্ড দেখুন" : "Open Full Dashboard"}</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Right Column: Four Feature Highlights */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-white dark:bg-[#123C3A] rounded-2xl sm:rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-[#25A995] hover:shadow-md transition-all duration-200 group motion-safe:hover:-translate-y-0.5 text-left"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${feat.accent} shadow-2xs group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider font-mono px-2.5 py-0.5 rounded-full bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653]">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1.5 group-hover:text-[#25A995] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed mb-3">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#D4E8E3]/60 dark:border-[#205653]/60">
                  <Link
                    href={feat.link.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25A995] hover:text-[#123C3A] dark:hover:text-white transition-colors group/link focus-visible:outline-none focus-visible:underline"
                  >
                    <span>{feat.link.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Section-Level Call to Action */}
      <div className="bg-gradient-to-r from-[#E8F7F4]/80 via-white to-[#FFF6F3]/80 dark:from-[#123C3A] dark:via-[#123C3A] dark:to-[#174A48] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-8 sm:p-10 text-center shadow-xs">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            {isBn ? "প্রতিটি পড়ার সেশন ফলপ্রসূ করুন" : "Make Every Study Session Count"}
          </h3>

          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-xl mx-auto">
            {isBn
              ? "একটি রুটিন তৈরি করুন, আপনার অগ্রগতি পর্যালোচনা করুন এবং আপনার IELTS লক্ষ্যের দিকে এগিয়ে যান।"
              : "Build a routine, review your progress, and keep moving towards your IELTS goal."}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/study-plan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#25A995]/20 border border-transparent transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2"
            >
              <span>{isBn ? "আপনার স্টাডি প্ল্যান শুরু করুন" : "Start Your Study Plan"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>

            <Link
              href="/lessons"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#0A1C1B] hover:bg-[#F4FAF8] dark:hover:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] font-semibold text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 shadow-2xs"
            >
              <span>{isBn ? "ফ্রি লেসন অন্বেষণ করুন" : "Explore Free Lessons"}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
