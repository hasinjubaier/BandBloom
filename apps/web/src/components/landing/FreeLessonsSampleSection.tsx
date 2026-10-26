"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  FileText,
  Mic,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  MOCK_READING_PASSAGE,
  MOCK_WRITING_TASK2,
  MOCK_SPEAKING_CUE_CARD,
} from "@/data/mockCurriculum";

type SkillKey = "reading" | "listening" | "writing" | "speaking";

interface SkillCardConfig {
  id: SkillKey;
  title: string;
  titleBn: string;
  desc: string;
  descBn: string;
  icon: React.ElementType;
  href: string;
  badge: string;
  badgeBn: string;
  accentColor: string;
  borderColor: string;
  hoverBorder: string;
  iconBg: string;
  topAccent: string;
  previewLabel: string;
  previewLabelBn: string;
  previewSnippet: string;
  previewSnippetBn: string;
  sampleMeta: string;
  sampleMetaBn: string;
}

const SKILL_CARDS: SkillCardConfig[] = [
  {
    id: "reading",
    title: "Reading",
    titleBn: "রিডিং",
    desc: "Practise reading comprehension and learn how to identify key information.",
    descBn: "প্যাসেজের মূল ভাব অনুধাবন করুন এবং গুরুত্বপূর্ণ তথ্য শনাক্ত করার কৌশল শিখুন।",
    icon: BookOpen,
    href: "/lessons",
    badge: "Sample Exercise",
    badgeBn: "নমুনা অনুশীলন",
    accentColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200/80 dark:border-blue-800/60",
    hoverBorder: "hover:border-blue-400 dark:hover:border-blue-500",
    iconBg: "bg-blue-50/90 dark:bg-blue-950/50 border-blue-200/80 text-blue-600 dark:text-blue-400",
    topAccent: "bg-gradient-to-r from-blue-600 to-sky-400",
    previewLabel: "Academic Reading • True/False/Not Given",
    previewLabelBn: "অ্যাকাডেমিক রিডিং • True/False/Not Given",
    previewSnippet: "Cities such as Rotterdam, Tokyo, and Singapore have developed subterranean flood storage reservoirs...",
    previewSnippetBn: "রোটারডাম, টোকিও ও সিঙ্গাপুরের মতো শহরগুলো ভূগর্ভস্থ পানি নিষ্কাশন ব্যবস্থা গড়ে তুলেছে...",
    sampleMeta: "Passage Evidence Highlighting",
    sampleMetaBn: "প্যাসেজ এভিডেন্স হাইলাইটিং",
  },
  {
    id: "listening",
    title: "Listening",
    titleBn: "লিসেনিং",
    desc: "Build listening accuracy through audio-based practice and answer review.",
    descBn: "নেটিভ অডিও অনুশীলন এবং নির্ভুল উত্তরের মাধ্যমে শোনার দক্ষতা বৃদ্ধি করুন।",
    icon: Headphones,
    href: "/lessons",
    badge: "Sample Exercise",
    badgeBn: "নমুনা অনুশীলন",
    accentColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200/80 dark:border-amber-800/60",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-500",
    iconBg: "bg-amber-50/90 dark:bg-amber-950/50 border-amber-200/80 text-amber-600 dark:text-amber-400",
    topAccent: "bg-gradient-to-r from-amber-500 to-yellow-400",
    previewLabel: "Part 3 • Academic Dialogue Preview",
    previewLabelBn: "পার্ট ৩ • অ্যাকাডেমিক সংলাপের নমুনা",
    previewSnippet: "Tutor: 'Notice how speaker agreement shifts in line 4 when evaluating the hydrological study.'",
    previewSnippetBn: "গৃহশিক্ষক: 'লক্ষ করুন কীভাবে চতুর্থ বাক্যে বক্তার সম্মতি পরিবর্তিত হয়েছে।'",
    sampleMeta: "Distractor Warning & Transcript Sync",
    sampleMetaBn: "ডিস্ট্রাক্টর সতর্কবার্তা ও ট্রান্সক্রিপ্ট",
  },
  {
    id: "writing",
    title: "Writing",
    titleBn: "রাইটিং",
    desc: "Explore writing prompts and learn how structured feedback can improve your writing.",
    descBn: "রচনার বিষয়বস্তু বিশ্লেষণ করুন এবং কাঠামোগত ফিডব্যাকের মাধ্যমে উন্নতি করুন।",
    icon: FileText,
    href: "/lessons",
    badge: "Sample Exercise",
    badgeBn: "নমুনা অনুশীলন",
    accentColor: "text-violet-600 dark:text-violet-400",
    borderColor: "border-violet-200/80 dark:border-violet-800/60",
    hoverBorder: "hover:border-violet-400 dark:hover:border-violet-500",
    iconBg: "bg-violet-50/90 dark:bg-violet-950/50 border-violet-200/80 text-violet-600 dark:text-violet-400",
    topAccent: "bg-gradient-to-r from-violet-600 to-purple-400",
    previewLabel: "Academic & GT Task 2 • Essay Prompt",
    previewLabelBn: "অ্যাকাডেমিক ও জিটি টাস্ক ২ • রচনার বিষয়",
    previewSnippet: "Should universities focus only on career skills or provide broad intellectual development?",
    previewSnippetBn: "বিশ্ববিদ্যালয়গুলোর কি কেবল ক্যারিয়ারমুখী দক্ষতায় গুরুত্ব দেওয়া উচিত নাকি সামগ্রিক বুদ্ধিবৃত্তিক বিকাশ নিশ্চিত করা উচিত?",
    sampleMeta: "4 Criteria Rubric • Unofficial AI Feedback",
    sampleMetaBn: "৪টি রুব্রিক ক্রাইটেরিয়া • অনানুষ্ঠানিক AI ফিডব্যাক",
  },
  {
    id: "speaking",
    title: "Speaking",
    titleBn: "স্পিকিং",
    desc: "Explore speaking prompts and practise expressing your ideas with confidence.",
    descBn: "স্পিকিংয়ের বিষয়গুলো পর্যবেক্ষণ করুন এবং আত্মবিশ্বাসের সাথে কথা বলার অভ্যাস করুন।",
    icon: Mic,
    href: "/lessons",
    badge: "Sample Exercise",
    badgeBn: "নমুনা অনুশীলন",
    accentColor: "text-[#FF7043] dark:text-[#FFA285]",
    borderColor: "border-orange-200/80 dark:border-orange-800/60",
    hoverBorder: "hover:border-[#FF7043] dark:hover:border-[#FF7043]",
    iconBg: "bg-orange-50/90 dark:bg-orange-950/50 border-orange-200/80 text-[#FF7043] dark:text-[#FFA285]",
    topAccent: "bg-gradient-to-r from-[#FF7043] to-amber-400",
    previewLabel: "Part 2 • Individual Cue Card",
    previewLabelBn: "পার্ট ২ • কিউ কার্ডের বিষয়",
    previewSnippet: "Describe an environmental initiative in your locality that you admire.",
    previewSnippetBn: "আপনার এলাকার প্রশংসনীয় একটি পরিবেশবান্ধব উদ্যোগ সম্পর্কে বলুন।",
    sampleMeta: "1m Prep / 2m Speak • Unofficial Feedback",
    sampleMetaBn: "১ মি. প্রস্তুতি / ২ মি. বক্তব্য • অনানুষ্ঠানিক ফিডব্যাক",
  },
];

export function FreeLessonsSampleSection() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  // Featured sample interactive state (Reading question)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  // Active tab for the featured sample experience
  const [activeTab, setActiveTab] = useState<SkillKey>("reading");

  const readingQuestion = MOCK_READING_PASSAGE.questions[0];

  const handleSelectOption = (opt: string) => {
    setSelectedAnswer(opt);
    setIsAnswerSubmitted(false);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer) {
      setIsAnswerSubmitted(true);
    }
  };

  const handleResetAnswer = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
  };

  return (
    <section
      id="free-lessons"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20"
      aria-labelledby="free-lessons-heading"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 text-[#25A995] text-xs font-semibold tracking-wider uppercase mb-3.5">
          <Sparkles className="w-3.5 h-3.5 text-[#25A995]" aria-hidden="true" />
          <span>{isBn ? "কাজের মাধ্যমে শিখুন" : "LEARN BY DOING"}</span>
        </div>

        <h2
          id="free-lessons-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight mb-4"
        >
          {isBn ? "ফ্রি লেসন ও নমুনা অনুশীলন" : "Free Lessons & Sample Practice"}
        </h2>

        <p className="text-sm sm:text-base text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-2xl mx-auto">
          {isBn
            ? "নমুনা অনুশীলনগুলো পরীক্ষা করুন, অপরিহার্য IELTS স্কিল চর্চা করুন এবং দেখুন কীভাবে BandBloom-এর সাথে উন্নতি করা যায়।"
            : "Explore sample exercises, practise essential IELTS skills, and discover how to improve with BandBloom."}
        </p>

        <div className="mt-3">
          <span className="inline-block text-xs font-semibold text-[#25A995] bg-[#E8F7F4]/60 dark:bg-[#123C3A]/60 px-2.5 py-0.5 rounded-full border border-[#25A995]/20">
            {isBn ? "সব ৪টি স্কিল অন্বেষণ করুন" : "Explore all four skills"}
          </span>
        </div>
      </div>

      {/* 4 Skill-Based Sample Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SKILL_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`bg-white dark:bg-[#123C3A] rounded-2xl sm:rounded-3xl border border-[#D4E8E3] dark:border-[#205653] ${card.hoverBorder} p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group motion-safe:hover:-translate-y-1 relative overflow-hidden`}
            >
              {/* Top Accent Bar */}
              <div
                className={`absolute top-0 inset-x-0 h-1 rounded-t-3xl ${card.topAccent}`}
                aria-hidden="true"
              />

              <div>
                {/* Header: Icon & Skill Badge */}
                <div className="flex items-center justify-between gap-3 mb-4 pt-1">
                  <div
                    className={`w-11 h-11 rounded-xl ${card.iconBg} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-xs`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653]">
                    {isBn ? card.badgeBn : card.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-1.5 group-hover:text-[#25A995] transition-colors duration-150">
                  {isBn ? card.titleBn : card.title}
                </h3>
                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed mb-4">
                  {isBn ? card.descBn : card.desc}
                </p>

                {/* Realistic Activity Preview Box */}
                <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B] rounded-xl p-3 border border-[#D4E8E3]/80 dark:border-[#205653]/80 mb-4 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#25A995] mb-1">
                    {isBn ? card.previewLabelBn : card.previewLabel}
                  </div>
                  <p className="text-xs text-[#123C3A] dark:text-[#F4FAF8] font-medium line-clamp-3 leading-snug italic">
                    {`"${isBn ? card.previewSnippetBn : card.previewSnippet}"`}
                  </p>
                </div>
              </div>

              {/* Bottom Meta & CTA */}
              <div className="pt-3 border-t border-[#D4E8E3]/60 dark:border-[#205653]/60">
                <div className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#25A995] shrink-0" aria-hidden="true" />
                  <span className="truncate">{isBn ? card.sampleMetaBn : card.sampleMeta}</span>
                </div>

                <Link
                  href={card.href}
                  className={`inline-flex items-center justify-between w-full text-xs font-bold ${card.accentColor} hover:opacity-85 transition-opacity group/link focus-visible:outline-none focus-visible:underline`}
                >
                  <span>{isBn ? "নমুনা শুরু করুন" : "Try Sample"}</span>
                  <ArrowRight
                    className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Interactive Sample Playground */}
      <div className="mt-12 bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#D4E8E3]/70 dark:border-[#205653]/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#25A995] animate-pulse" aria-hidden="true" />
              <h3 className="text-lg sm:text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                {isBn ? "একটি নমুনা অনুশীলন করে দেখুন" : "Try a Sample Exercise"}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1]">
              {isBn
                ? "প্রস্তুতি শুরু করার আগে বাস্তব শিখন অভিজ্ঞতার স্বাদ নিন।"
                : "Get a feel for the learning experience before starting your preparation."}
            </p>
          </div>

          {/* Interactive Skill Selector Tabs */}
          <div
            className="flex items-center gap-1.5 p-1 bg-[#F4FAF8] dark:bg-[#0A1C1B] rounded-xl border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold overflow-x-auto max-w-full"
            role="tablist"
            aria-label={isBn ? "নমুনা অনুশীলনের ধরন" : "Sample exercise type"}
          >
            {(["reading", "listening", "writing", "speaking"] as SkillKey[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  handleResetAnswer();
                }}
                role="tab"
                aria-selected={activeTab === tab}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] ${
                  activeTab === tab
                    ? "bg-white dark:bg-[#123C3A] text-[#25A995] shadow-xs font-bold"
                    : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Reading Interactive Sample */}
        {activeTab === "reading" && (
          <div className="pt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Passage Excerpt */}
              <div className="lg:col-span-7 bg-[#F4FAF8] dark:bg-[#0A1C1B] rounded-2xl p-5 border border-[#D4E8E3]/80 dark:border-[#205653]/80 text-left space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#25A995] uppercase tracking-wider">
                  <span>{isBn ? "প্যাসেজ অনুচ্ছেদ (Excerpt)" : "Passage Excerpt: Paragraph A"}</span>
                  <span className="text-[#3D6462] dark:text-[#A0C5C1] font-normal">IELTS Academic</span>
                </div>
                <p className="text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] leading-relaxed">
                  As global temperatures rise and severe weather incidents escalate, coastal metropolitan regions are
                  pioneering radical civil engineering initiatives. Urban planners can no longer rely on conventional
                  stormwater drainage constructed during the 20th century.{" "}
                  <span
                    className={
                      isAnswerSubmitted
                        ? "bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 px-1 py-0.5 rounded font-semibold transition-colors"
                        : ""
                    }
                  >
                    Instead, cities such as Rotterdam, Tokyo, and Singapore have developed subterranean flood storage
                    reservoirs and permeable pavement infrastructure.
                  </span>
                </p>
                {isAnswerSubmitted && (
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold pt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isBn ? "প্যাসেজ প্রমাণ চিহ্নিত করা হয়েছে" : "Evidence sentence highlighted in passage"}</span>
                  </div>
                )}
              </div>

              {/* Question & Options */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4 text-left">
                <div>
                  <div className="text-[11px] font-bold text-[#3D6462] dark:text-[#A0C5C1] uppercase tracking-wider mb-1">
                    {isBn ? "প্রশ্ন ১ (True / False / Not Given)" : "Question 1 • True / False / Not Given"}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#123C3A] dark:text-[#F4FAF8] mb-3 leading-snug">
                    {`"${readingQuestion.prompt}"`}
                  </p>

                  {/* Options */}
                  <div className="space-y-2" role="group" aria-label="True False Not Given options">
                    {readingQuestion.options.map((opt) => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrect = isAnswerSubmitted && opt === readingQuestion.correctAnswer;
                      const isWrong = isAnswerSubmitted && isSelected && opt !== readingQuestion.correctAnswer;

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(opt)}
                          className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] ${
                            isCorrect
                              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-800 dark:text-emerald-200"
                              : isWrong
                              ? "bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-800 dark:text-rose-200"
                              : isSelected
                              ? "bg-[#E8F7F4] dark:bg-[#123C3A] border-[#25A995] text-[#25A995]"
                              : "bg-white dark:bg-[#0A1C1B] border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#25A995]"
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />}
                          {isWrong && <XCircle className="w-4 h-4 text-rose-600" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback or Action */}
                <div>
                  {isAnswerSubmitted ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                        <div className="font-bold text-emerald-800 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                          <span>{isBn ? "ব্যাখ্যা" : "Official Explanation"}</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                          {readingQuestion.explanation}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleResetAnswer}
                          className="inline-flex items-center gap-1.5 text-xs text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-white"
                        >
                          <RotateCcw className="w-3 h-3" aria-hidden="true" />
                          <span>{isBn ? "পুনরায় চেষ্টা করুন" : "Try Again"}</span>
                        </button>
                        <Link
                          href="/lessons"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25A995] hover:underline"
                        >
                          <span>{isBn ? "সম্পূর্ণ রিডিং লেসন খুলুন" : "Explore Reading Lessons"}</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!selectedAnswer}
                      onClick={handleCheckAnswer}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        selectedAnswer
                          ? "bg-[#25A995] hover:bg-[#123C3A] text-white cursor-pointer"
                          : "bg-gray-100 dark:bg-[#1a3836] text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {isBn ? "উত্তর যাচাই করুন" : "Check Answer"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Listening Preview */}
        {activeTab === "listening" && (
          <div className="pt-6 space-y-4 text-left">
            <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B] rounded-2xl p-5 border border-[#D4E8E3]/80 dark:border-[#205653]/80 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <span>{isBn ? "লিসেনিং সংলাপের অংশ" : "Listening Part 3 Audio Dialogue"}</span>
                <span className="text-[#3D6462] dark:text-[#A0C5C1] font-normal">Australian & British Accents</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] space-y-2 text-xs">
                <p>
                  <strong className="text-[#123C3A] dark:text-[#F4FAF8]">Prof. Harrison:</strong> &ldquo;We expected the
                  underground cisterns to face community pushback because of construction noise, but the primary
                  impediment was actually municipal zoning regulations.&rdquo;
                </p>
                <p>
                  <strong className="text-[#123C3A] dark:text-[#F4FAF8]">Elena:</strong> &ldquo;Exactly. The survey data
                  showed zoning delays cost more than the engineering modifications themselves.&rdquo;
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                  <span className="text-[11px]">
                    {isBn
                      ? "পূর্ণাঙ্গ ল্যাবে অডিও প্লেয়ার, স্পিড কন্ট্রোল এবং ট্রান্সক্রিপ্ট আনলক অন্তর্ভুক্ত।"
                      : "Native audio player with speed controls, distractor tags, and transcript sync available in the Listening Lab."}
                  </span>
                </div>
                <Link
                  href="/lessons"
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap transition-colors"
                >
                  {isBn ? "লিসেনিং লেসন দেখুন" : "Explore Listening Lessons"}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Writing Task 2 Rubric Sample */}
        {activeTab === "writing" && (
          <div className="pt-6 space-y-4 text-left">
            <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B] rounded-2xl p-5 border border-[#D4E8E3]/80 dark:border-[#205653]/80 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                <span>{isBn ? "টাস্ক ২ প্রবন্ধের বিষয়" : "Writing Task 2 Prompt & Rubric"}</span>
                <span className="text-[#3D6462] dark:text-[#A0C5C1] font-normal">250 words • 40 minutes</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                {`"${MOCK_WRITING_TASK2.prompt}"`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {Object.entries(MOCK_WRITING_TASK2.rubricBreakdown).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653]"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 capitalize mb-1">
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="text-base font-extrabold text-[#123C3A] dark:text-[#F4FAF8] mb-1">
                      Band {val.band}
                    </div>
                    <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] line-clamp-2 leading-relaxed">
                      {val.notes}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs">
                <span className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">
                  * {isBn ? "মূল্যায়নগুলো অনানুষ্ঠানিক অনুশীলন নির্দেশিকা হিসেবে প্রদত্ত।" : "Evaluation rubrics provided as unofficial practice guidelines."}
                </span>
                <Link
                  href="/lessons"
                  className="inline-flex items-center gap-1.5 font-bold text-violet-600 dark:text-violet-400 hover:underline"
                >
                  <span>{isBn ? "রাইটিং লেসন ও মডেল রচনা দেখুন" : "Explore Writing Lessons & Models"}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Speaking Part 2 Cue Card Sample */}
        {activeTab === "speaking" && (
          <div className="pt-6 space-y-4 text-left">
            <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B] rounded-2xl p-5 border border-[#D4E8E3]/80 dark:border-[#205653]/80 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#FF7043] dark:text-[#FFA285] uppercase tracking-wider">
                <span>{isBn ? "স্পিকিং পার্ট ২ কিউ কার্ড" : "Speaking Part 2 Cue Card Exercise"}</span>
                <span className="text-[#3D6462] dark:text-[#A0C5C1] font-normal">1m Prep • 2m Speaking</span>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] space-y-2.5">
                <h4 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {`"${MOCK_SPEAKING_CUE_CARD.title}"`}
                </h4>
                <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1] space-y-1 pl-1">
                  <div className="text-[11px] font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    {isBn ? "আপনাকে বলতে হবে:" : "You should say:"}
                  </div>
                  {MOCK_SPEAKING_CUE_CARD.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF7043]" aria-hidden="true" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs">
                <span className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">
                  * {isBn ? "স্পিকিং অডিও রেকর্ডার ও স্বয়ংক্রিয় ট্রান্সক্রিপশন স্পিকিং ল্যাবে সংরক্ষিত।" : "Microphone audio recording and unofficial AI fluency breakdown are available in the Speaking Lab."}
                </span>
                <Link
                  href="/lessons"
                  className="px-4 py-2 rounded-xl bg-[#FF7043] hover:bg-[#e85a2f] text-white font-bold text-xs transition-colors shadow-xs"
                >
                  {isBn ? "স্পিকিং লেসন দেখুন" : "Explore Speaking Lessons"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section-Level Call-to-Action Area */}
      <div className="mt-12 sm:mt-16 bg-gradient-to-r from-[#E8F7F4]/80 via-white to-[#FFF6F3]/80 dark:from-[#123C3A] dark:via-[#123C3A] dark:to-[#174A48] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-8 sm:p-10 text-center shadow-xs">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            {isBn ? "আরও অন্বেষণ করতে প্রস্তুত?" : "Ready to Explore More?"}
          </h3>

          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-xl mx-auto">
            {isBn
              ? "আরও ফ্রি লেসন আবিষ্কার করুন এবং আপনার IELTS স্কিল ধারাবাহিকভাবে গড়ে তুলুন।"
              : "Discover more free lessons and keep building your IELTS skills."}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/lessons"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#25A995]/20 border border-transparent transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2"
            >
              <span>{isBn ? "সব ফ্রি লেসন দেখুন" : "Explore All Free Lessons"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>

            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#0A1C1B] hover:bg-[#F4FAF8] dark:hover:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] font-semibold text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 shadow-2xs"
            >
              <span>{isBn ? "আপনার প্রস্তুতি শুরু করুন" : "Start Your Preparation"}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
