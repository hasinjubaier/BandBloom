"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function MidpointCTASection() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      aria-label={isBn ? "প্রস্তুতি শুরু করুন" : "Get started with mock practice"}
    >
      <div className="rounded-3xl p-8 sm:p-10 border border-[#D4E8E3] dark:border-[#205653] bg-[#E8F7F4]/60 dark:bg-[#123C3A]/60 text-center flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight mb-3">
          {/* needs human review */}
          {isBn ? "টাইমড মক টেস্ট শুরু করতে প্রস্তুত?" : "Ready for Timed Mock Tests?"}
        </h2>
        <p className="text-sm sm:text-base text-[#3D6462] dark:text-[#A0C5C1] max-w-xl mx-auto mb-6">
          {/* needs human review */}
          {isBn
            ? "আপনার অগ্রগতি সংরক্ষণ করতে এবং সম্পূর্ণ মক টেস্ট অনুশীলন করতে একটি ফ্রি অ্যাকাউন্ট তৈরি করুন।"
            : "Create an account to track your progress across all four skills and practise with full-length mock exams."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-sm sm:text-base shadow-sm transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 motion-safe:hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{isBn ? "অ্যাকাউন্ট তৈরি করে শুরু করুন" : "Create Account to Start"}</span>
            <ArrowRight
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
              aria-hidden="true"
            />
          </Link>
          <a
            href="#sample-exercise"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white dark:bg-[#0A1C1B] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] font-semibold text-sm sm:text-base transition-colors duration-200 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2"
          >
            {/* needs human review */}
            <span>{isBn ? "নমুনা প্রশ্ন দেখুন" : "Try a Sample Exercise"}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
