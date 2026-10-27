"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  ChartNoAxesCombined,
  Target,
  BookOpen,
  Headphones,
  FileText,
  Mic,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function WeeklyMockTestsSection() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const benefits = [
    {
      step: "01",
      title: isBn ? "সময়ভিত্তিক অনুশীলন" : "Timed Practice",
      desc: isBn
        ? "সেকশন-ভিত্তিক বা পূর্ণাঙ্গ টেস্টের সময়সীমা মেনে অনুশীলন করুন যা আপনার পরীক্ষার প্রস্তুতি দৃঢ় করবে।"
        : "Practise with section-based or full-test timing to improve your exam readiness.",
      icon: Clock,
      badge: isBn ? "অফিসিয়াল সময়সীমা" : "Official Time Limits",
      accent: "text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/50 border-blue-200/80",
    },
    {
      step: "02",
      title: isBn ? "নির্ভরযোগ্য উত্তর সংরক্ষণ" : "Reliable Answer Saving",
      desc: isBn
        ? "অনুশীলন চলাকালীন আপনার নিশ্চিত উত্তরগুলো সিস্টেমে সংরক্ষিত হয়, যাতে অপ্রত্যাশিত বিরতির পর আপনি পুনরায় কাজ শুরু করতে পারেন।"
        : "Your acknowledged answers are saved during an attempt, helping you recover your progress after interruptions.",
      icon: ShieldCheck,
      badge: isBn ? "প্রগ্রেস রিকভারি" : "Progress Recovery",
      accent: "text-[#25A995] bg-[#E8F7F4] dark:bg-[#0A1C1B] border-[#25A995]/30",
    },
    {
      step: "03",
      title: isBn ? "ফলাফল ও পুঙ্খানুপুঙ্খ ফিডব্যাক" : "Results and Feedback",
      desc: isBn
        ? "আপনার অনুশীলন ফলাফল পর্যালোচনা করুন, ভুলগুলো চিহ্নিত করুন এবং উন্নতির ক্ষেত্রগুলো খুঁজে বের করুন।"
        : "Review your practice performance, understand your mistakes, and identify areas for improvement.",
      icon: ChartNoAxesCombined,
      badge: isBn ? "অনানুষ্ঠানিক AI অনুমান" : "Unofficial AI Estimates",
      accent: "text-violet-600 dark:text-violet-400 bg-violet-50/90 dark:bg-violet-950/50 border-violet-200/80",
    },
    {
      step: "04",
      title: isBn ? "সুস্পষ্ট পরবর্তী পদক্ষেপ" : "Clear Next Steps",
      desc: isBn
        ? "আপনার টেস্টের ফলাফল এবং বারবার হওয়া ভুলগুলো বিশ্লেষণ করে পরবর্তী অনুশীলনের সুনির্দিষ্ট পরিকল্পনা নির্ধারণ করুন।"
        : "Use your results and recurring mistakes to decide what to practise next.",
      icon: Target,
      badge: isBn ? "টার্গেটেড প্ল্যানিং" : "Targeted Action",
      accent: "text-[#FF7043] dark:text-[#FFA285] bg-orange-50/90 dark:bg-orange-950/50 border-orange-200/80",
    },
  ];

  return (
    <section
      id="weekly-mock-tests"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20"
      aria-labelledby="mock-tests-heading"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <h2
          id="mock-tests-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight mb-4"
        >
          {isBn ? "সাপ্তাহিক মক টেস্ট" : "Weekly Mock Tests"}
        </h2>

        <p className="text-sm sm:text-base text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-2xl mx-auto mb-2">
          {isBn
            ? "সময় নির্ধারিত পরিবেশে অনুশীলন করুন, আপনার ফলাফল পর্যালোচনা করুন এবং কোন বিষয়ে আরও মনোযোগ দিতে হবে তা নির্ধারণ করুন।"
            : "Practise under timed conditions, review your performance, and discover what to focus on next."}
        </p>

        <p className="text-xs sm:text-sm text-[#167568] dark:text-[#25A995] font-medium max-w-xl mx-auto">
          {isBn
            ? "সেকশন-ভিত্তিক অনুশীলন এবং পূর্ণাঙ্গ মক টেস্টের মাধ্যমে একটি ধারাবাহিক IELTS প্রস্তুতি রুটিন গড়ে তুলুন।"
            : "Build a more consistent IELTS preparation routine with section-wise practice and full mock tests."}
        </p>
      </div>

      {/* Featured Mock Test Preview (2-Column Composition on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
        {/* Left Column: Example Mock Test Overview Card */}
        <div className="lg:col-span-7 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#25A995] transition-colors relative overflow-hidden">
          <div className="space-y-6">
            {/* Header: Title and Test Type */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D4E8E3]/70 dark:border-[#205653]/70">
              <div>
                <span className="text-xs font-bold text-[#167568] dark:text-[#25A995] uppercase tracking-wider mb-1 block">
                  {isBn ? "নমুনা মক টেস্ট" : "Example Mock Test"}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "ফুল ডায়াগনস্টিক মক টেস্ট ১" : "Full Diagnostic Mock Test 1"}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F7F4] dark:bg-[#0A1C1B] text-[#167568] dark:text-[#25A995] border border-[#25A995]/30 self-start sm:self-center">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Academic & GT</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
              {isBn
                ? "কম্পিউটার-ডেলিভার্ড টেস্ট ফরম্যাটের সাথে পরিচিত হতে চার-স্কিলের পূর্ণাঙ্গ মক টেস্ট। আপনার নিজস্ব গতি অনুযায়ী অনুশীলন করুন।"
                : "A structured practice experience designed to help you prepare across all four IELTS sections at your own pace."}
            </p>

            {/* Four-Skill Mock Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Reading */}
              <div className="p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80 space-y-1">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold">{isBn ? "রিডিং সেকশন" : "Reading Section"}</span>
                </div>
                <div className="text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "৪০টি প্রশ্ন • ৬০ মিনিট" : "40 Questions • 60 Minutes"}
                </div>
                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-snug">
                  {isBn
                    ? "প্রশ্নের ধরন ও উত্তরের ব্যাখ্যা সহ রিডিং অনুশীলন।"
                    : "Timed reading practice with question navigation and answer review."}
                </p>
              </div>

              {/* Listening */}
              <div className="p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80 space-y-1">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Headphones className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold">{isBn ? "লিসেনিং সেকশন" : "Listening Section"}</span>
                </div>
                <div className="text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "৪০টি প্রশ্ন • ৩০ মিনিট" : "40 Questions • 30 Minutes"}
                </div>
                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-snug">
                  {isBn
                    ? "অডিও-ভিত্তিক অনুশীলন ও অনুশীলন শেষে ট্রান্সক্রিপ্ট পর্যালোচনা।"
                    : "Audio-based practice with answer review and transcripts."}
                </p>
              </div>

              {/* Writing */}
              <div className="p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80 space-y-1">
                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
                  <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold">{isBn ? "রাইটিং সেকশন" : "Writing Section"}</span>
                </div>
                <div className="text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "টাস্ক ১ ও ২ • ৬০ মিনিট" : "Task 1 & 2 • 60 Minutes"}
                </div>
                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-snug">
                  {isBn
                    ? "টাস্ক-ভিত্তিক অনুশীলন এবং ৪টি ক্রাইটেরিয়ায় অনানুষ্ঠানিক AI ফিডব্যাক।"
                    : "Task-based editor with unofficial AI band estimates."}
                </p>
              </div>

              {/* Speaking */}
              <div className="p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80 space-y-1">
                <div className="flex items-center gap-2 text-[#FF7043] dark:text-[#FFA285]">
                  <Mic className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold">{isBn ? "স্পিকিং সেকশন" : "Speaking Section"}</span>
                </div>
                <div className="text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "পার্ট ১, ২ ও ৩ • ১১-১৪ মিনিট" : "Parts 1, 2 & 3 • 11–14 Minutes"}
                </div>
                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-snug">
                  {isBn
                    ? "কাঠামোগত স্পিকিং প্রম্পট, রেকর্ডিং এবং অনানুষ্ঠানিক AI স্কোরিং।"
                    : "Structured speaking prompts with recording and unofficial AI scoring."}
                </p>
              </div>
            </div>

            {/* Schedule Availability Notice */}
            <div className="flex items-center gap-2 text-xs text-[#3D6462] dark:text-[#A0C5C1] pt-1">
              <span className="w-2 h-2 rounded-full bg-[#25A995]" aria-hidden="true" />
              <span>
                {isBn
                  ? "যেকোনো সময় অনুশীলন করুন: আপনার নিজস্ব গতি অনুযায়ী মক টেস্ট দিন।"
                  : "Explore mock-test practice and prepare at your own pace."}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 mt-6 border-t border-[#D4E8E3]/70 dark:border-[#205653]/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#25A995]/20 border border-transparent transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
            >
              <span>{isBn ? "প্রস্তুতি শুরু করুন" : "Start Preparation"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>

            <Link
              href="/practice"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-white transition-colors"
            >
              <span>{isBn ? "অনুশীলন হাব দেখুন" : "Explore Practice Hub"}</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Right Column: Illustrative Results & Performance Review Preview Panel */}
        <div className="lg:col-span-5 bg-[#F4FAF8] dark:bg-[#0A1C1B] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-6 sm:p-7 flex flex-col justify-between shadow-xs text-left relative">
          <div>
            {/* Badge & Title */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-[#167568] dark:text-[#25A995] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white dark:bg-[#123C3A] border border-[#25A995]/20">
                {isBn ? "নমুনা রিপোর্ট প্রিভিউ" : "Sample Report Preview"}
              </span>
              <span className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">Band Score Preview</span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1">
              {isBn ? "পারফরম্যান্স ও স্কোর বিশ্লেষণ" : "Performance & Score Breakdown"}
            </h4>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mb-5">
              {isBn
                ? "টেস্ট শেষে চারটি স্কিলের পুঙ্খানুপুঙ্খ বিশ্লেষণ এবং সঠিক উত্তর নিশ্চিতকরণ।"
                : "A clear post-attempt review showing your section-wise results and areas for improvement."}
            </p>

            {/* Illustrative Section Scores */}
            <div className="space-y-2.5 mb-5">
              {/* Reading Score */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3]/80 dark:border-[#205653]/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" aria-hidden="true" />
                  <span className="font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    {isBn ? "রিডিং (৩৫/৪০)" : "Reading (35/40)"}
                  </span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400">Band 8.0</span>
              </div>

              {/* Listening Score */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3]/80 dark:border-[#205653]/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Headphones className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                  <span className="font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    {isBn ? "লিসেনিং (৩৩/৪০)" : "Listening (33/40)"}
                  </span>
                </div>
                <span className="font-bold text-amber-700 dark:text-amber-400">Band 7.5</span>
              </div>

              {/* Writing Score */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3]/80 dark:border-[#205653]/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-violet-700 dark:text-violet-400" aria-hidden="true" />
                  <span className="font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    {isBn ? "রাইটিং (টাস্ক ১ ও ২)" : "Writing (Task 1 & 2)"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded font-semibold">
                    {isBn ? "অনানুষ্ঠানিক AI অনুমান" : "Unofficial AI estimate"}
                  </span>
                  <span className="font-bold text-violet-700 dark:text-violet-400">Band 6.5</span>
                </div>
              </div>

              {/* Speaking Score */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3]/80 dark:border-[#205653]/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-[#FF7043] dark:text-[#FFA285]" aria-hidden="true" />
                  <span className="font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    {isBn ? "স্পিকিং (পার্ট ১, ২ ও ৩)" : "Speaking (Parts 1–3)"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#FF7043] dark:text-[#FFA285] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded font-semibold">
                    {isBn ? "অনানুষ্ঠানিক AI অনুমান" : "Unofficial AI estimate"}
                  </span>
                  <span className="font-bold text-[#FF7043] dark:text-[#FFA285]">Band 7.0</span>
                </div>
              </div>
            </div>

            {/* Estimated Overall Result */}
            <div className="p-3.5 rounded-2xl bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-bold text-[#167568] dark:text-[#25A995] tracking-wider">
                  {isBn ? "ব্যান্ড ক্যালকুলেটর: স্কোর রাউন্ডিং" : "Band Calculator: Score Rounding"}
                </div>
                <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                  7.25 average → rounds up to
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-[#167568] dark:text-[#25A995]">Band 7.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Benefit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.step}
              className="bg-white dark:bg-[#123C3A] rounded-2xl sm:rounded-3xl border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group motion-safe:hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${b.accent} shadow-2xs group-hover:scale-105 transition-transform duration-200`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653]">
                    {b.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-2 group-hover:text-[#167568] dark:group-hover:text-[#25A995] transition-colors">
                  {b.title}
                </h3>

                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                  {b.desc}
                </p>
              </div>

              {b.step === "04" ? (
                <div className="pt-3 mt-4 border-t border-[#D4E8E3]/60 dark:border-[#205653]/60">
                  <Link
                    href="/practice"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#167568] dark:text-[#25A995] hover:underline"
                  >
                    <span>{isBn ? "টার্গেটেড প্র্যাকটিস দেখুন" : "Explore Targeted Practice"}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
