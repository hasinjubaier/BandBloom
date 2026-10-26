"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Target,
  Layers,
  Sparkles,
  Laptop,
  CheckCircle2,
  Award,
  BrainCircuit,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HowItWorksPage() {
  const { language } = useLanguage();

  const steps = [
    {
      num: "01",
      title: "Diagnostic Assessment & Goal Setting",
      titleBn: "ডায়াগনস্টিক পরীক্ষা ও লক্ষ্য নির্ধারণ",
      desc: "Begin with a short, 20-minute diagnostic across reading and listening to calibrate your baseline score. Choose between IELTS Academic or General Training, set your goal band (e.g. 7.5), and specify your test date.",
      descBn: "রিডিং ও লিসেনিংয়ের ওপর সংক্ষিপ্ত ২০ মিনিটের টেস্টের মাধ্যমে আপনার প্রাথমিক স্তর নির্ণয় করুন। আপনার কাঙ্ক্ষিত ব্যান্ড ও পরীক্ষার তারিখ নির্বাচন করুন।",
      icon: Target,
    },
    {
      num: "02",
      title: "Guided Daily Study Plan",
      titleBn: "দৈনিক সময়ভিত্তিক স্টাডি প্ল্যান",
      desc: "Receive an automated daily schedule calibrated to 30, 60, or 90 minutes. Tasks automatically adapt if you miss a session, preventing backlog stress while keeping you on pace.",
      descBn: "আপনার সময় অনুযায়ী ৩০, ৬০ বা ৯০ মিনিটের দৈনিক রুটিন। কোনো কারণে একদিন মিস হলেও স্বয়ংক্রিয়ভাবে পরবর্তী দিনগুলোতে বিন্যস্ত হয়ে যাবে।",
      icon: Compass,
    },
    {
      num: "03",
      title: "Four Skill Labs with Instant AI Diagnostics",
      titleBn: "চারটি স্কিল ল্যাব ও তাৎক্ষণিক AI মূল্যায়ন",
      desc: "Practice with split-screen reading, native listening audio, distraction-free essay editor, and cue card speaking recorder. Get criterion-by-criterion rubric feedback grounded in official descriptors.",
      descBn: "কম্পিউটার ফরম্যাটে রিডিং, নেটিভ অডিও লিসেনিং, রচনা লেখার এডিটর এবং স্পিকিং রেকর্ডারে অনুশীলন করুন এবং অফিসিয়াল রুব্রিকের ভিত্তিতে বিস্তারিত ফিডব্যাক পান।",
      icon: Layers,
    },
    {
      num: "04",
      title: "Computer-Delivered Mocks & Rounding Analytics",
      titleBn: "কম্পিউটার মক টেস্ট ও নির্ভুল স্কোরিং",
      desc: "Take full 40-question mock tests under authentic computer software conditions with authoritative server timers. Scores are calculated using the exact official rounding table rules (Section 5.3).",
      descBn: "প্রকৃত কম্পিউটার পরীক্ষার পরিবেশে পূর্ণাঙ্গ মক পরীক্ষা দিন। পরীক্ষার ফলাফল হিসাব করা হয় অফিশিয়াল IELTS রাউন্ডিং নিয়ম অনুসরণ করে।",
      icon: Laptop,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#25A995] bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 px-3 py-1 rounded-full">
          The BandBloom Methodology
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
          How BandBloom Prepares You for Band 7.5+
        </h1>
        <p className="text-sm text-[#3D6462] dark:text-[#A0C5C1]">
          A systematic 4-stage pipeline built specifically around the 2026 computer-delivered IELTS exam format.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {steps.map((st, idx) => (
          <div
            key={st.num}
            className="bg-white dark:bg-[#123C3A] p-6 sm:p-8 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] dark:hover:border-[#25A995] transition-all flex flex-col sm:flex-row items-start gap-6 shadow-sm"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 ${
              idx % 2 === 0
                ? "bg-[#E8F7F4] dark:bg-[#0A1C1B] border border-[#25A995]/30 text-[#25A995]"
                : "bg-[#FFF6F3] dark:bg-[#0A1C1B] border border-[#FF8A65]/30 text-[#FF8A65]"
            }`}>
              {st.num}
            </div>

            <div className="space-y-2 flex-1">
              <h2 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                {language === "bn" ? st.titleBn : st.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                {language === "bn" ? st.descBn : st.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-white dark:bg-[#123C3A] p-8 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] text-center space-y-4 shadow-sm">
        <h3 className="text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
          Begin with a 20-Minute Baseline Diagnostic
        </h3>
        <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] max-w-xl mx-auto">
          Identify your current reading and listening strengths today without subscription barriers or commercial commitments.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-xs shadow-lg shadow-[#25A995]/20 transition-all"
          >
            <span>Sign In to Begin Diagnostic</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] font-semibold text-xs transition-all"
          >
            <span>Create Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
