"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function FinalCTASection() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <section
      id="final-cta"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20"
      aria-labelledby="final-cta-heading"
    >
      <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl p-8 sm:p-12 lg:p-16 border border-[#D4E8E3] dark:border-[#205653] bg-gradient-to-br from-[#E8F7F4]/90 via-white to-[#FFF6F3]/90 dark:from-[#123C3A] dark:via-[#123C3A] dark:to-[#174A48] shadow-sm text-center">
        {/* Subtle Decorative Ambient Glows */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 bg-[#25A995]/10 dark:bg-[#25A995]/20 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#FF8A65]/10 dark:bg-[#FF8A65]/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0A1C1B] border border-[#25A995]/30 text-[#25A995] text-xs font-semibold tracking-wider uppercase mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#25A995]" aria-hidden="true" />
            <span>{isBn ? "আপনার IELTS প্রস্তুতি শুরু করুন" : "YOUR IELTS JOURNEY STARTS HERE"}</span>
          </div>

          {/* Main Heading */}
          <h2
            id="final-cta-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight leading-tight mb-4"
          >
            {isBn ? "পরবর্তী পদক্ষেপ নিতে প্রস্তুত তো?" : "Ready to Take the Next Step?"}
          </h2>

          {/* Supporting Description */}
          <p className="text-base sm:text-lg text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-2xl mx-auto mb-8">
            {isBn
              ? "একটি ধারাবাহিক স্টাডি রুটিন গড়ে তুলুন, চারটি IELTS স্কিল অনুশীলন করুন এবং ধাপে ধাপে উন্নতির ক্ষেত্রগুলো আবিষ্কার করুন।"
              : "Build a consistent study routine, practise all four IELTS skills, and discover where you can improve — one step at a time."}
          </p>

          {/* Two CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-base shadow-lg shadow-[#25A995]/25 border border-transparent transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 motion-safe:hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{isBn ? "ফ্রি প্রস্তুতি শুরু করুন" : "Start Free Preparation"}</span>
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/lessons"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white dark:bg-[#0A1C1B] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] font-semibold text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 shadow-2xs motion-safe:hover:-translate-y-0.5"
            >
              <span>{isBn ? "ফ্রি লেসনগুলো দেখুন" : "Explore Free Lessons"}</span>
            </Link>
          </div>

          {/* Supporting Trust Note */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] pt-1">
            <ShieldCheck className="w-4 h-4 text-[#25A995] shrink-0" aria-hidden="true" />
            <span>
              {isBn
                ? "ফ্রি IELTS প্রস্তুতি · স্বাধীন প্ল্যাটফর্ম, কোনো অফিসিয়াল IELTS সার্ভিস নয়।"
                : "Free IELTS preparation · Independent platform, not an official IELTS service."}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
