"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Play,
  Calendar,
  Clock,
  Target,
  BookOpen,
  Headphones,
  FileText,
  Mic,
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useExam } from "@/context/ExamContext";
import { useLanguage } from "@/context/LanguageContext";
import { ScoreCalculatorModal } from "@/components/ScoreCalculatorModal";

export default function DashboardPage() {
  const { language } = useLanguage();
  const { profile, skillScores, calculateOverallBand, mistakes, vocabulary, studyTasks } = useExam();
  const [calcOpen, setCalcOpen] = useState(false);

  const overallBand = calculateOverallBand(
    skillScores.listening,
    skillScores.reading,
    skillScores.writing,
    skillScores.speaking
  );

  const pendingTasks = studyTasks.filter((t) => !t.completed);
  const nextTask = pendingTasks[0] || studyTasks[0];

  const unresolvedMistakes = mistakes.filter((m) => m.retryStatus === "unresolved");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* 1. Header & Hierarchy Tier 1: Action bar, Upcoming Mock & Target Date */}
      <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F7F4] dark:bg-[#25A995]/20 border border-[#25A995]/30 text-[#25A995] text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-[#25A995]" />
              <span>
                {profile.testType === "academic" ? "IELTS Academic Track" : "IELTS General Training Track"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
              {language === "bn" ? "শিক্ষার্থী ড্যাশবোর্ড" : "Learner Command Center"}
            </h1>
            <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1]">
              {language === "bn"
                ? "আপনার বর্তমান প্রাক্কলিত ব্যান্ড স্কোর ও দৈনিক প্রস্তুতির অগ্রগতি ট্র্যাক করুন।"
                : "Authoritative progress tracking, weak-area analytics, and computer-test preparation."}
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border border-[#D4E8E3] dark:border-[#205653] px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-[#3D6462] dark:text-[#A0C5C1] block tracking-wider">
                {language === "bn" ? "টার্গেট ব্যান্ড" : "Target Band"}
              </span>
              <span className="text-lg font-extrabold text-[#FF8A65]">
                {profile.targetBand.toFixed(1)}
              </span>
            </div>

            <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border border-[#D4E8E3] dark:border-[#205653] px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-[#3D6462] dark:text-[#A0C5C1] block tracking-wider">
                {language === "bn" ? "বর্তমান প্রাক্কলিত" : "Current Est."}
              </span>
              <span className="text-lg font-extrabold text-[#25A995]">
                Band {overallBand.toFixed(1)}
              </span>
            </div>

            <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border border-[#D4E8E3] dark:border-[#205653] px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-[#3D6462] dark:text-[#A0C5C1] block tracking-wider">
                {language === "bn" ? "পরীক্ষার তারিখ" : "Exam Target"}
              </span>
              <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                {profile.targetDate}
              </span>
            </div>

            {/* Continue Learning CTA */}
            <Link
              href={
                nextTask?.skill === "reading"
                  ? "/skills/reading"
                  : nextTask?.skill === "listening"
                  ? "/skills/listening"
                  : nextTask?.skill === "writing"
                  ? "/skills/writing"
                  : nextTask?.skill === "speaking"
                  ? "/skills/speaking"
                  : "/mock-centre"
              }
              className="px-5 py-3 rounded-2xl bg-[#25A995] hover:bg-[#1D8B7A] text-white font-semibold text-xs shadow-md shadow-[#25A995]/25 border border-transparent flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {language === "bn" ? "পড়াশোনা চালিয়ে যান" : "Continue Learning"}
              </span>
            </Link>
          </div>
        </div>

        {/* Weekly Completion Progress */}
        <div className="mt-6 pt-5 border-t border-[#D4E8E3] dark:border-[#205653] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-[#3D6462] dark:text-[#A0C5C1] mb-1">
              <span>{language === "bn" ? "সাপ্তাহিক টাস্ক সম্পন্ন" : "Weekly Task Completion"}</span>
              <span className="text-[#25A995] font-bold">80%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#D4E8E3] dark:bg-[#0A1C1B] overflow-hidden">
              <div className="h-full bg-[#25A995] rounded-full w-4/5" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#3D6462] dark:text-[#A0C5C1]">
            <Calendar className="w-4 h-4 text-[#FF8A65]" />
            <span>
              {language === "bn" ? "আসন্ন মক টেস্ট:" : "Upcoming Mock:"}{" "}
              <strong className="text-[#123C3A] dark:text-[#F4FAF8]">This Sunday, 10:00 AM (UTC+6)</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#3D6462] dark:text-[#A0C5C1]">
            <Clock className="w-4 h-4 text-[#25A995]" />
            <span>
              {language === "bn" ? "দৈনিক লক্ষ্যমাত্রা:" : "Daily Goal:"}{" "}
              <strong className="text-[#123C3A] dark:text-[#F4FAF8]">{profile.dailyMinutes} min/day</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Hierarchy Tier 2: Four Skill Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#25A995]" />
            <span>{language === "bn" ? "চারটি স্কিল ল্যাব অগ্রগতি" : "Four Skill Labs Progress"}</span>
          </h2>
          <span className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            {language === "bn" ? "সর্বশেষ অনুশীলন ও পরবর্তী প্রস্তাবনা" : "Latest scores & recommended actions"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Reading Card */}
          <div className="bg-white dark:bg-[#123C3A] p-5 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-[#E8F7F4] dark:bg-[#25A995]/20 border border-[#25A995]/30 text-[#25A995] shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-[#25A995]">
                Band {skillScores.reading.toFixed(1)}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1">
              {language === "bn" ? "রিডিং ল্যাব" : "Academic Reading"}
            </h3>
            <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] mb-4 line-clamp-2">
              Recent: TFNG passage test. Trend: <span className="text-[#25A995] font-semibold">+0.5 Band</span>.
            </p>
            <div className="pt-3 border-t border-[#D4E8E3] dark:border-[#205653]">
              <Link
                href="/skills/reading"
                className="text-xs text-[#25A995] hover:text-[#1D8B7A] font-semibold flex items-center justify-between"
              >
                <span>{language === "bn" ? "প্যাসেজ ২ প্র্যাকটিস" : "Practice Passage 2"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Listening Card */}
          <div className="bg-white dark:bg-[#123C3A] p-5 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-[#E8F7F4] dark:bg-[#25A995]/20 border border-[#25A995]/30 text-[#25A995] shadow-sm">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-[#25A995]">
                Band {skillScores.listening.toFixed(1)}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1">
              {language === "bn" ? "লিসেনিং ল্যাব" : "Computer Listening"}
            </h3>
            <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] mb-4 line-clamp-2">
              Recent: Section 3 Tutorial audio. Trend: <span className="text-[#25A995] font-semibold">Steady</span>.
            </p>
            <div className="pt-3 border-t border-[#D4E8E3] dark:border-[#205653]">
              <Link
                href="/skills/listening"
                className="text-xs text-[#25A995] hover:text-[#1D8B7A] font-semibold flex items-center justify-between"
              >
                <span>{language === "bn" ? "অডিও প্র্যাকটিস" : "Start Audio Drill"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Writing Card */}
          <div className="bg-white dark:bg-[#123C3A] p-5 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] hover:border-[#FF8A65] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-[#FFF6F3] dark:bg-[#FF8A65]/20 border border-[#FF8A65]/30 text-[#FF8A65] shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-[#FF8A65]">
                Band {skillScores.writing.toFixed(1)}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1">
              {language === "bn" ? "রাইটিং ল্যাব" : "Writing Tasks 1 & 2"}
            </h3>
            <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] mb-4 line-clamp-2">
              Recent: Task 2 University Essay. Weakness: <span className="text-[#FF8A65] font-semibold">CC & Lexical</span>.
            </p>
            <div className="pt-3 border-t border-[#D4E8E3] dark:border-[#205653]">
              <Link
                href="/skills/writing"
                className="text-xs text-[#FF8A65] hover:text-[#E87652] font-semibold flex items-center justify-between"
              >
                <span>{language === "bn" ? "রচনা ও AI ফিডব্যাক" : "Write Task 2 Essay"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Speaking Card */}
          <div className="bg-white dark:bg-[#123C3A] p-5 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-[#E8F7F4] dark:bg-[#25A995]/20 border border-[#25A995]/30 text-[#25A995] shadow-sm">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-[#25A995]">
                Band {skillScores.speaking.toFixed(1)}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1">
              {language === "bn" ? "স্পিকিং ল্যাব" : "Speaking Cue Card"}
            </h3>
            <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] mb-4 line-clamp-2">
              Recent: Environmental Initiative cue card. Trend: <span className="text-[#25A995] font-semibold">+0.5 Band</span>.
            </p>
            <div className="pt-3 border-t border-[#D4E8E3] dark:border-[#205653]">
              <Link
                href="/skills/speaking"
                className="text-xs text-[#25A995] hover:text-[#1D8B7A] font-semibold flex items-center justify-between"
              >
                <span>{language === "bn" ? "রেকর্ডিং সিমুলেশন" : "Record Cue Card"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hierarchy Tier 3: Frequent Mistakes, Vocabulary Schedule & AI Feedback Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mistakes Box */}
        <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF8A65]" />
              <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                {language === "bn" ? "ভুলের পর্যালোচনা (Mistakes)" : "Repeat Error Alerts"}
              </h3>
            </div>
            <span className="text-xs bg-[#FFF6F3] text-[#FF8A65] border border-[#FF8A65]/30 dark:bg-[#FF8A65]/20 dark:text-[#FF8A65] px-2 py-0.5 rounded-full font-semibold">
              {unresolvedMistakes.length} unresolved
            </span>
          </div>

          <div className="space-y-3">
            {unresolvedMistakes.slice(0, 2).map((m) => (
              <div key={m.id} className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border border-[#D4E8E3] dark:border-[#205653] p-3 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#25A995] uppercase font-semibold">{m.skill} • {m.questionType}</span>
                  <span className="text-[#FF8A65] font-bold bg-[#FFF6F3] dark:bg-[#FF8A65]/20 px-1.5 py-0.5 rounded border border-[#FF8A65]/30">{m.errorTag}</span>
                </div>
                <p className="text-xs text-[#123C3A] dark:text-[#F4FAF8] line-clamp-1">{m.questionPrompt}</p>
                <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">{m.reasoning}</p>
              </div>
            ))}
          </div>

          <Link
            href="/notebook"
            className="block text-center text-xs text-[#FF8A65] hover:text-[#E87652] font-semibold pt-2 border-t border-[#D4E8E3] dark:border-[#205653]"
          >
            {language === "bn" ? "সম্পূর্ণ ভুলের নোটবুক দেখুন" : "View Complete Mistake Notebook"} →
          </Link>
        </div>

        {/* Vocabulary Spaced Repetition Box */}
        <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#25A995]" />
              <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                {language === "bn" ? "আজকের শব্দভাণ্ডার (Vocabulary)" : "Spaced Repetition Cards"}
              </h3>
            </div>
            <span className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              {vocabulary.length} tracked
            </span>
          </div>

          <div className="space-y-3">
            {vocabulary.slice(0, 2).map((v) => (
              <div key={v.id} className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border border-[#D4E8E3] dark:border-[#205653] p-3 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8]">{v.word}</span>
                  <span className="text-[10px] text-[#25A995] font-semibold px-2 py-0.5 rounded bg-[#E8F7F4] dark:bg-[#25A995]/20 border border-[#25A995]/30">
                    {v.bandLevel}
                  </span>
                </div>
                <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">{v.meaning}</p>
                <p className="text-[10px] text-[#3D6462] dark:text-[#A0C5C1] italic">"{v.collocation}"</p>
              </div>
            ))}
          </div>

          <Link
            href="/vocabulary"
            className="block text-center text-xs text-[#25A995] hover:text-[#1D8B7A] font-semibold pt-2 border-t border-[#D4E8E3] dark:border-[#205653]"
          >
            {language === "bn" ? "শব্দভাণ্ডার ফ্ল্যাশকার্ড অনুশীলন" : "Review All Flashcards"} →
          </Link>
        </div>

        {/* AI Tutor & Feedback Box */}
        <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#25A995]" />
              <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                {language === "bn" ? "AI গৃহশিক্ষক ও সহায়তা" : "Grounded AI Tutor"}
              </h3>
            </div>
            <span className="text-[11px] text-[#25A995] flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#25A995] animate-pulse" />
              Active
            </span>
          </div>

          <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border border-[#D4E8E3] dark:border-[#205653] p-4 rounded-xl text-xs space-y-2">
            <p className="text-[#3D6462] dark:text-[#A0C5C1]">
              {language === "bn"
                ? "সিলেবাস, রুব্রিক বা কোনো প্রশ্ন বুঝতে না পারলে অফিসিয়াল রেফারেন্স সহ ব্যাখ্যা চান।"
                : "Ask any question regarding official marking rubrics, task formats, or essay improvement."}
            </p>
            <div className="text-[11px] text-[#25A995] font-semibold">
              Daily quota: 25 / 25 remaining
            </div>
          </div>

          <Link
            href="/tutor"
            className="block text-center py-2 px-3 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-white text-xs font-semibold shadow-md shadow-[#25A995]/20 transition-all"
          >
            {language === "bn" ? "টিউটরের সাথে কথা বলুন" : "Chat with AI Tutor"}
          </Link>
        </div>
      </div>

      {/* 4. Hierarchy Tier 4: Recent Attempts Table & Official Test-Day Reference */}
      <div className="bg-white dark:bg-[#123C3A] rounded-2xl border border-[#D4E8E3] dark:border-[#205653] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              {language === "bn" ? "সাম্প্রতিক মক টেস্ট ও স্কোর হিস্ট্রি" : "Recent Mock Exam Records"}
            </h3>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              {language === "bn"
                ? "অফিসিয়াল রাউন্ডিং হিসাবযুক্ত প্র্যাকটিস রেজাল্ট"
                : "Officially rounded mock scores (Practice estimates only)"}
            </p>
          </div>

          <Link
            href="/mock-centre"
            className="px-3.5 py-1.5 rounded-xl bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 hover:bg-[#D4E8E3]/50 dark:bg-[#25A995]/20 dark:text-[#25A995] text-xs font-medium transition-all"
          >
            {language === "bn" ? "নতুন মক শুরু করুন" : "Take New Mock"}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            <thead className="bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] uppercase text-[10px] tracking-wider border-b border-[#D4E8E3] dark:border-[#205653]">
              <tr>
                <th className="py-3 px-6">Mock Title</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Listening</th>
                <th className="py-3 px-6">Reading</th>
                <th className="py-3 px-6">Writing</th>
                <th className="py-3 px-6">Speaking</th>
                <th className="py-3 px-6">Overall Band</th>
                <th className="py-3 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4E8E3] dark:divide-[#205653]/60">
              <tr className="hover:bg-[#F4FAF8] dark:hover:bg-[#0A1C1B]/40 transition-colors">
                <td className="py-4 px-6 font-medium text-[#123C3A] dark:text-[#F4FAF8]">
                  BandBloom Academic Diagnostic Mock 1
                </td>
                <td className="py-4 px-6 text-[#3D6462] dark:text-[#A0C5C1]">2026-10-18</td>
                <td className="py-4 px-6 text-[#25A995] font-semibold">7.0</td>
                <td className="py-4 px-6 text-[#25A995] font-semibold">7.5</td>
                <td className="py-4 px-6 text-[#FF8A65] font-semibold">6.5</td>
                <td className="py-4 px-6 text-[#25A995] font-semibold">7.0</td>
                <td className="py-4 px-6 font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  <span className="px-2 py-1 rounded bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20 dark:text-[#25A995]">
                    Band 7.0
                  </span>
                </td>
                <td className="py-4 px-6">
                  <Link
                    href="/results/mock-1"
                    className="text-[#25A995] hover:text-[#1D8B7A] font-medium"
                  >
                    View Report →
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ScoreCalculatorModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </div>
  );
}
