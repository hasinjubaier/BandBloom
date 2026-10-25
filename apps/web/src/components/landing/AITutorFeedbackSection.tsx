"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  CheckCircle2,
  ExternalLink,
  Flag,
  ArrowRight,
  FileText,
  Mic,
  Layers,
  Lightbulb,
  BookmarkCheck,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { MOCK_RAG_SOURCES } from "@/data/mockCurriculum";

export function AITutorFeedbackSection() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  // Quick prompt switching for the interactive illustrative preview
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [isReported, setIsReported] = useState(false);

  const tutorPrompts = [
    {
      label: isBn ? "টাস্ক ২ থিসিস" : "Task 2 Thesis",
      question: isBn
        ? "IELTS রাইটিং টাস্ক ২-এ থিসিস স্টেটমেন্ট কীভাবে উন্নত করব?"
        : "How can I improve my IELTS Writing Task 2 thesis statement?",
      answer: isBn
        ? "একটি স্পষ্ট থিসিস স্টেটমেন্ট সরাসরি প্রশ্নের উত্তর দেয় এবং আপনার মূল অবস্থান অগ্রিম প্রকাশ করে। এটিকে সুনির্দিষ্ট রাখুন, প্রশ্নের শব্দ হুবহু পুনরাবৃত্তি করবেন না এবং আপনার বডি প্যারাগ্রাফগুলো যেন এই অবস্থানকে সমর্থন করে তা নিশ্চিত করুন।"
        : "A clear thesis statement directly answers the question and previews your main position. Keep it focused, avoid repeating the prompt word for word, and make sure your body paragraphs support your position.",
      source: MOCK_RAG_SOURCES[0],
      evidenceLabel: isBn ? "অনুমোদিত রুব্রিক দ্বারা সমর্থিত" : "Supported by syllabus registry",
    },
    {
      label: isBn ? "TFNG কৌশল" : "TFNG Strategy",
      question: isBn
        ? "False এবং Not Given-এর মূল পার্থক্য কী?"
        : "What is the difference between False and Not Given?",
      answer: isBn
        ? "False মানে প্যাসেজে দেওয়া তথ্যের সাথে সরাসরি বিপরীত বা অসঙ্গত। Not Given মানে প্রশ্নে উল্লেখিত দাবিটি সম্পর্কে প্যাসেজ নীরব অথবা নিশ্চিতভাবে কিছু বলা হয়নি। অনুমানের ভিত্তিতে অতিরিক্ত সিদ্ধান্ত নেওয়া থেকে বিরত থাকুন।"
        : "False means the statement directly contradicts verified evidence in the text. Not Given means the passage makes no comment on the claim, or the fact cannot be confirmed. Avoid making outside assumptions beyond the text.",
      source: {
        title: "IELTS Academic Reading Candidate Guide 2026",
        section: "Section 3.2: Factual Verification & Contrasting Claims",
        sourceUrl: "https://www.ielts.org/take-a-test/preparation-resources/reading-test-resources",
      },
      evidenceLabel: isBn ? "অফিসিয়াল রিডিং গাইড দ্বারা সমর্থিত" : "Verified reading specification",
    },
    {
      label: isBn ? "স্কোর রাউন্ডিং" : "Score Rounding",
      question: isBn
        ? "চারটি স্কিলের গড় ৬.২৫ হলে সার্বিক ব্যান্ড কত হবে?"
        : "What is the overall band if my skill average is 6.25?",
      answer: isBn
        ? "অফিসিয়াল নিয়মানুযায়ী গড় ভগ্নাংশ ০.২৫ হলে তা পরবর্তী হাফ ব্যান্ডে (৬.৫)-এ উন্নীত হয়। ০.৭৫ হলে পরবর্তী পূর্ণ ব্যান্ডে (৭.০) উন্নীত হয়।"
        : "According to official IELTS scoring rules, an average ending in .25 rounds UP to the next half band (6.25 -> 6.5). An average ending in .75 rounds UP to the next whole band (6.75 -> 7.0).",
      source: MOCK_RAG_SOURCES[2],
      evidenceLabel: isBn ? "অফিসিয়াল স্কোরিং টেবিল দ্বারা সমর্থিত" : "Supported by Section 5.3 rounding rules",
    },
  ];

  const currentPrompt = tutorPrompts[activePromptIdx];

  const sharedBenefits = [
    {
      title: isBn ? "উত্তরের পেছনের কারণ বুঝুন" : "Understand the Why",
      desc: isBn
        ? "উত্তর মুখস্থ করার পরিবর্তে প্রতিটি ব্যাখ্যার অন্তর্নিহিত ব্যাকরণ ও যুক্তি শিখুন।"
        : "Learn the reasoning behind an explanation instead of memorising answers.",
      icon: Lightbulb,
      accent: "text-[#25A995] bg-[#E8F7F4] dark:bg-[#0A1C1B] border-[#25A995]/30",
    },
    {
      title: isBn ? "ফিডব্যাক থেকে শিক্ষা নিন" : "Learn from Feedback",
      desc: isBn
        ? "সুনির্দিষ্ট পর্যবেক্ষণগুলোকে আপনার পরবর্তী অনুশীলন সেশনের কার্যকরী পদক্ষেপে রূপান্তর করুন।"
        : "Turn specific observations into practical next steps for your next practice session.",
      icon: CheckCircle2,
      accent: "text-violet-600 dark:text-violet-400 bg-violet-50/90 dark:bg-violet-950/50 border-violet-200/80",
    },
    {
      title: isBn ? "প্রাসঙ্গিক প্রেক্ষাপট সহ প্রশ্ন করুন" : "Ask with Context",
      desc: isBn
        ? "আপনি যে স্কিল অনুশীলন করছেন তার সাথে সম্পর্কিত এবং BandBloom-এর বিশ্বস্ত রিসোর্সের ভিত্তিতে গাইডেন্স পান।"
        : "Get guidance related to the skill you are practising and the learning resources available on BandBloom.",
      icon: Layers,
      accent: "text-[#FF7043] dark:text-[#FFA285] bg-orange-50/90 dark:bg-orange-950/50 border-orange-200/80",
    },
  ];

  return (
    <section
      id="ai-tutor"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20"
      aria-labelledby="ai-tutor-heading"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 text-[#25A995] text-xs font-semibold tracking-wider uppercase mb-3.5">
          <BrainCircuit className="w-3.5 h-3.5 text-[#25A995]" aria-hidden="true" />
          <span>{isBn ? "ব্যক্তিগতকৃত শিখন সহায়তা" : "PERSONALISED LEARNING SUPPORT"}</span>
        </div>

        <h2
          id="ai-tutor-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight mb-4"
        >
          {isBn ? "AI টিউটর ও ফিডব্যাকের মাধ্যমে স্মার্টলি শিখুন" : "Learn Smarter with AI Tutor & Feedback"}
        </h2>

        <p className="text-sm sm:text-base text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-2xl mx-auto mb-2">
          {isBn
            ? "প্রশ্ন করুন, নির্ভরযোগ্য শিখন রিসোর্সগুলো অন্বেষণ করুন এবং আপনার IELTS স্কিল উন্নত করার ব্যবহারিক উপায় খুঁজুন।"
            : "Ask questions, explore reliable learning resources, and discover practical ways to improve your IELTS skills."}
        </p>

        <p className="text-xs sm:text-sm text-[#25A995] font-medium max-w-xl mx-auto">
          {isBn
            ? "এমন নির্দেশনা পান যা আপনাকে কেবল কী উন্নতি করতে হবে তা নয়, বরং কেন এবং কীভাবে তা বুঝতে সাহায্য করে।"
            : "Get guidance that helps you understand not only what to improve, but also why and how."}
        </p>
      </div>

      {/* Main 2-Column Composition on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-14">
        {/* Left Column: AI Tutor Chat Experience */}
        <div className="lg:col-span-7 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#25A995] transition-colors relative">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D4E8E3]/70 dark:border-[#205653]/70">
              <div>
                <span className="text-[11px] font-bold text-[#25A995] uppercase tracking-wider mb-1 block">
                  {isBn ? "আপনার AI গৃহশিক্ষক" : "Meet Your AI Tutor"}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {isBn ? "উৎস-ভিত্তিক নির্দেশিকা" : "Evidence-Based IELTS Answers"}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] font-mono self-start sm:self-center">
                <span>Illustrative Demonstration</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
              {isBn
                ? "IELTS পরীক্ষার ফরম্যাট, শিখন কৌশল এবং সাধারণ ভুলগুলো সম্পর্কে নির্ভরযোগ্য তথ্য পান।"
                : "Get guidance on IELTS formats, learning strategies, and common mistakes supported by verified curriculum documentation."}
            </p>

            {/* Quick Prompt Switching Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[#3D6462] dark:text-[#A0C5C1] mr-1">
                {isBn ? "নমুনা প্রশ্নসমূহ:" : "Sample Inquiries:"}
              </span>
              {tutorPrompts.map((p, idx) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setActivePromptIdx(idx);
                    setIsReported(false);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] ${
                    activePromptIdx === idx
                      ? "bg-[#25A995] text-white border-[#25A995] shadow-xs font-semibold"
                      : "bg-[#F4FAF8] dark:bg-[#0A1C1B] border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-white hover:border-[#25A995]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Chat Interaction Simulation */}
            <div className="space-y-4 text-left">
              {/* User Question Bubble */}
              <div className="p-4 rounded-2xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80">
                <div className="text-[10px] font-bold text-[#3D6462] dark:text-[#A0C5C1] uppercase tracking-wider mb-1">
                  {isBn ? "শিক্ষার্থীর প্রশ্ন" : "Learner Question"}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                  {`"${currentPrompt.question}"`}
                </p>
              </div>

              {/* AI Tutor Response Bubble */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1C1B] border-2 border-[#25A995]/25 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 flex items-center justify-center text-[#25A995]">
                      <BrainCircuit className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block leading-tight">
                        BandBloom AI Tutor
                      </span>
                      <span className="text-[10px] text-[#25A995] font-semibold">RAG Grounded</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F7F4] dark:bg-[#123C3A] text-[#25A995] border border-[#25A995]/30">
                    <CheckCircle2 className="w-3 h-3 text-[#25A995]" aria-hidden="true" />
                    <span>Evidence Supported</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] leading-relaxed">
                  {currentPrompt.answer}
                </p>

                {/* Source Reference Area */}
                <div className="pt-3 border-t border-[#D4E8E3]/70 dark:border-[#205653]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#3D6462] dark:text-[#A0C5C1] min-w-0">
                    <BookmarkCheck className="w-3.5 h-3.5 text-[#25A995] shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      Source:{" "}
                      <strong className="text-[#123C3A] dark:text-[#F4FAF8]">
                        {currentPrompt.source.title}
                      </strong>{" "}
                      ({currentPrompt.source.section})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {currentPrompt.source.sourceUrl && (
                      <a
                        href={currentPrompt.source.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#25A995] hover:underline font-semibold"
                        aria-label="View verified source document (opens in new tab)"
                      >
                        <span>View Source</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsReported(true)}
                      className="inline-flex items-center gap-1 text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#FF7043] transition-colors"
                      title="Report an inaccurate response"
                    >
                      <Flag className="w-3 h-3" aria-hidden="true" />
                      <span>{isReported ? "Reported" : "Report"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 mt-6 border-t border-[#D4E8E3]/70 dark:border-[#205653]/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Link
              href="/tutor"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#25A995]/20 border border-transparent transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995]"
            >
              <span>{isBn ? "সম্পূর্ণ AI টিউটর খুলুন" : "Explore Full AI Tutor"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>

            <span className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] self-center">
              {isBn ? "সিলেবাস নীতি দ্বারা সমর্থিত" : "Curriculum-grounded assistant"}
            </span>
          </div>
        </div>

        {/* Right Column: Writing & Speaking Feedback Previews */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          {/* Top Panel: Writing Feedback Preview */}
          <div className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-[#25A995] transition-colors text-left space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200/80 flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <FileText className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                      {isBn ? "রাইটিং দক্ষতা বৃদ্ধি করুন" : "Improve Your Writing"}
                    </h4>
                    <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">
                      4 Rubric Dimensions
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-full border border-violet-200/60 font-mono">
                  Unofficial practice estimate
                </span>
              </div>

              <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed mb-3">
                {isBn
                  ? "আপনার সবল দিকগুলো বুঝুন, দুর্বলতাগুলো চিহ্নিত করুন এবং রচনায় উন্নতির সুনির্দিষ্ট কৌশল খুঁজুন।"
                  : "Understand your strengths, identify weaknesses, and discover practical ways to improve your writing."}
              </p>

              {/* Rubric Preview Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                <div className="p-2 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80">
                  Task Response
                </div>
                <div className="p-2 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80">
                  Coherence & Cohesion
                </div>
                <div className="p-2 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80">
                  Lexical Resource
                </div>
                <div className="p-2 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80">
                  Grammatical Accuracy
                </div>
              </div>

              {/* Actionable Feedback Breakdown */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Strength
                  </span>
                  <p className="text-[11px] text-[#123C3A] dark:text-[#F4FAF8]">
                    &ldquo;Your main position is understandable.&rdquo;
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                    Area to Improve
                  </span>
                  <p className="text-[11px] text-[#123C3A] dark:text-[#F4FAF8]">
                    &ldquo;Develop your supporting argument with a more specific example.&rdquo;
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#25A995] uppercase tracking-wider block">
                    Next Step
                  </span>
                  <p className="text-[11px] text-[#123C3A] dark:text-[#F4FAF8]">
                    &ldquo;Rewrite one body paragraph and explain how the example supports your main point.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D4E8E3]/60 dark:border-[#205653]/60">
              <Link
                href="/skills/writing"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
              >
                <span>{isBn ? "রাইটিং ল্যাবে প্র্যাকটিস করুন" : "Open Writing Evaluator"}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Bottom Panel: Speaking Feedback Preview */}
          <div className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-[#25A995] transition-colors text-left space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 flex items-center justify-center text-[#FF7043] dark:text-[#FFA285]">
                    <Mic className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                      {isBn ? "স্পিকিং আত্মবিশ্বাস তৈরি করুন" : "Build Speaking Confidence"}
                    </h4>
                    <span className="text-[10px] text-[#FF7043] dark:text-[#FFA285] font-semibold">
                      Fluency & Pronunciation
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-[#FF7043] dark:text-[#FFA285] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-200/60 font-mono">
                  Unofficial practice estimate
                </span>
              </div>

              <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed mb-3">
                {isBn
                  ? "আপনার স্পিকিং অনুশীলন পর্যালোচনা করুন এবং স্বচ্ছতা, ফ্লুয়েন্সি, শব্দভাণ্ডার ও ব্যাকরণে উন্নতি করুন।"
                  : "Review your speaking practice and identify areas to improve in clarity, fluency, vocabulary, and grammar."}
              </p>

              {/* Sample Cue Card Snippet */}
              <div className="p-3.5 rounded-2xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3]/80 dark:border-[#205653]/80 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#3D6462] dark:text-[#A0C5C1] uppercase tracking-wider block">
                    Cue Card Prompt Excerpt
                  </span>
                  <p className="text-[11px] font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    &ldquo;Describe an environmental initiative in your locality that you admire.&rdquo;
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#25A995] uppercase tracking-wider block">
                    Transcript Observation
                  </span>
                  <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] italic">
                    &ldquo;...they planted wetland reeds along the embankments to naturally bio-filter the runoff.&rdquo;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D4E8E3]/60 dark:border-[#205653]/60 text-[11px]">
                  <div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[10px]">
                      Strength
                    </span>
                    <span className="text-[#123C3A] dark:text-[#F4FAF8]">
                      Natural topic vocabulary and clear chronological progression.
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-600 dark:text-amber-400 block text-[10px]">
                      Area to Improve
                    </span>
                    <span className="text-[#123C3A] dark:text-[#F4FAF8]">
                      Work on reducing mid-sentence hesitations between complex clauses.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D4E8E3]/60 dark:border-[#205653]/60">
              <Link
                href="/skills/speaking"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF7043] dark:text-[#FFA285] hover:underline"
              >
                <span>{isBn ? "স্পিকিং ল্যাবে প্র্যাকটিস করুন" : "Open Speaking Lab & Recorder"}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Shared Learning Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {sharedBenefits.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs text-left space-y-3"
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${b.accent} shadow-2xs`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <h4 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                {b.title}
              </h4>
              <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                {b.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Responsible AI & Privacy Trust Note */}
      <div className="p-4 rounded-2xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] flex items-center justify-center gap-2 text-xs text-[#3D6462] dark:text-[#A0C5C1] max-w-4xl mx-auto mb-14 text-center">
        <ShieldCheck className="w-4 h-4 text-[#25A995] shrink-0" aria-hidden="true" />
        <span className="text-[11px] sm:text-xs">
          {isBn
            ? "BandBloom অনুমোদিত IELTS সিলেবাস ও মার্কিং রুব্রিকের ভিত্তিতে RAG প্রযুক্তি ব্যবহার করে। AI ফিডব্যাক একটি অনানুষ্ঠানিক স্ব-প্রস্তুতি সহায়িকা, কোনো অফিসিয়াল IELTS স্কোর নয়।"
            : "BandBloom uses retrieval-augmented generation (RAG) referencing approved IELTS curricula and rubric documentation. AI feedback is provided as an unofficial self-study guide, not official IELTS scoring."}
        </span>
      </div>

      {/* Final Section Call-to-Action */}
      <div className="bg-gradient-to-r from-[#E8F7F4]/80 via-white to-[#FFF6F3]/80 dark:from-[#123C3A] dark:via-[#123C3A] dark:to-[#174A48] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-8 sm:p-10 text-center shadow-xs">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            {isBn ? "প্রতিটি অনুশীলন সেশন থেকে সেরা সুবিধা নিন" : "Get More from Every Practice Session"}
          </h3>

          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-xl mx-auto">
            {isBn
              ? "প্রশ্ন করুন, ফিডব্যাক থেকে শিখুন এবং একবারে একটি করে স্কিল উন্নত করুন।"
              : "Ask questions, learn from feedback, and keep improving one skill at a time."}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/tutor"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#25A995]/20 border border-transparent transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2"
            >
              <span>{isBn ? "AI টিউটর অন্বেষণ করুন" : "Explore AI Tutor"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>

            <Link
              href="/practice"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#0A1C1B] hover:bg-[#F4FAF8] dark:hover:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] font-semibold text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 shadow-2xs"
            >
              <span>{isBn ? "রাইটিং ও স্পিকিং অনুশীলন দেখুন" : "Explore Writing & Speaking Practice"}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
