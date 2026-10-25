"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { AlertCircle } from "lucide-react";

export const DisclaimerBanner: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="bg-[#FFF6F3] dark:bg-[#0A1C1B] border-b border-[#FF8A65]/30 text-[#3D6462] dark:text-[#A0C5C1] px-4 py-2 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#FF8A65] shrink-0" />
          <span>
            <span className="px-1.5 py-0.5 rounded bg-[#E8F7F4] dark:bg-[#174A48] border border-[#25A995]/30 text-[#25A995] text-[10px] font-bold uppercase tracking-wider mr-2 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25A995] animate-pulse" />
              {language === "bn" ? "স্বতন্ত্র প্রস্তুতি" : "Independent"}
            </span>
            {language === "bn" ? (
              <>
                <strong className="text-[#123C3A] dark:text-[#F4FAF8]">স্বাধীন প্রস্তুতি প্ল্যাটফর্ম:</strong> BandBloom একটি স্ব-প্রস্তুতি ও শিক্ষা-সহায়ক সেবা। এটি British Council, IDP, বা Cambridge University Press & Assessment-এর অনুমোদিত বা অংশীদারিত্বপ্রাপ্ত কোনো অফিসিয়াল স্কোরিং সার্ভিস নয়।
              </>
            ) : (
              <>
                <strong className="text-[#123C3A] dark:text-[#F4FAF8]">Independent Study Platform:</strong> BandBloom is an independent preparation service and is not affiliated with, approved by, or an official scoring partner of the British Council, IDP, or Cambridge English.
              </>
            )}
          </span>
        </div>
        <Link
          href="/disclaimer"
          className="text-[#25A995] dark:text-[#FF8A65] underline hover:text-[#123C3A] dark:hover:text-white font-medium whitespace-nowrap hidden sm:inline transition-colors"
        >
          {language === "bn" ? "নীতিমালা পড়ুন" : "Read Policy"}
        </Link>
      </div>
    </div>
  );
};
