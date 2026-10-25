"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <footer
      className="bg-white dark:bg-[#123C3A] border-t border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] text-sm transition-colors duration-200"
      role="contentinfo"
      aria-label={isBn ? "ফুটার তথ্য ও নেভিগেশন" : "Footer Information and Navigation"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-12 lg:mb-16">
          {/* Column 1: Brand Info & Status */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link
              href="/"
              onClick={(e) => {
                if (typeof window !== "undefined" && window.location.pathname === "/") {
                  e.preventDefault();
                  if (window.location.hash) {
                    window.history.replaceState(null, "", window.location.pathname + window.location.search);
                  }
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded-xl"
              aria-label={isBn ? "BandBloom মূলপাতা" : "BandBloom Home"}
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Image
                  src="/logo.webp"
                  alt="BandBloom IELTS Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#123C3A] dark:text-[#F4FAF8]">
                Band<span className="text-[#25A995]">Bloom</span>
              </span>
            </Link>

            {/* Platform Description */}
            <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-sm">
              {isBn
                ? "চারটি স্কিলের কাঠামোগত অনুশীলন, কার্যকর ফিডব্যাক এবং নির্ভরযোগ্য রিসোর্স সহ ফ্রি IELTS প্রস্তুতি।"
                : "Free IELTS preparation with structured practice, useful feedback, and learning resources for all four skills."}
            </p>

            {/* Independent Platform Disclaimer */}
            <p className="text-xs text-[#5A7F7D] dark:text-[#8AA8A4] leading-relaxed max-w-sm">
              {isBn
                ? "BandBloom একটি স্বাধীন IELTS প্রস্তুতি প্ল্যাটফর্ম এবং এটি কোনো অফিসিয়াল IELTS টেস্টিং বা স্কোর-রিপোর্টিং সার্ভিস নয়।"
                : "BandBloom is an independent IELTS preparation platform and is not an official IELTS testing or score-reporting service."}
            </p>

            {/* Trust and Architectural Badges */}
            <div className="space-y-1.5 pt-1 text-xs text-[#25A995] font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#25A995]" aria-hidden="true" />
                <span>{isBn ? "প্রাইভেসি-ফার্স্ট আর্কিটেকচার" : "Privacy-First Architecture"}</span>
              </div>
              <div className="flex items-center gap-2 text-[#3D6462] dark:text-[#A0C5C1]">
                <CheckCircle2 className="w-4 h-4 text-[#25A995] shrink-0" aria-hidden="true" />
                <span>{isBn ? "WCAG ২.২ AA অ্যাক্সেসিবিলিটি মান" : "WCAG 2.2 Level AA Standards"}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Explore Navigation */}
          <div className="sm:col-span-1 lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] uppercase tracking-wider">
              {isBn ? "অন্বেষণ করুন" : "Explore"}
            </h3>
            <nav aria-label={isBn ? "অন্বেষণ নেভিগেশন" : "Explore Navigation"}>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/how-it-works"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "কীভাবে কাজ করে" : "How It Works"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lessons"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "ফ্রি লেসন" : "Free Lessons"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/practice"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "নমুনা অনুশীলন" : "Sample Practice"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/test-types"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "পরীক্ষার ধরন" : "Test Types"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/test-day-guide"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "পরীক্ষার দিনের গাইড" : "Test-day Guide"}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 3: Learning Navigation */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] uppercase tracking-wider">
              {isBn ? "লার্নিং ও অনুশীলন" : "Learning"}
            </h3>
            <nav aria-label={isBn ? "লার্নিং নেভিগেশন" : "Learning Navigation"}>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/skills/reading"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "রিডিং প্র্যাকটিস" : "Reading Practice"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/skills/listening"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "লিসেনিং প্র্যাকটিস" : "Listening Practice"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/skills/writing"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "রাইটিং প্র্যাকটিস" : "Writing Practice"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/skills/speaking"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "স্পিকিং প্র্যাকটিস" : "Speaking Practice"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mock-centre"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "সাপ্তাহিক মক টেস্ট" : "Weekly Mock Tests"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tutor"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "AI গৃহশিক্ষক (AI Tutor)" : "AI Tutor"}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 4: Legal & Policies */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] uppercase tracking-wider">
              {isBn ? "আইনি ও পলিসি" : "Legal & Policies"}
            </h3>
            <nav aria-label={isBn ? "আইনি ও পলিসি নেভিগেশন" : "Legal & Policy Navigation"}>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "প্রাইভেসি পলিসি" : "Privacy Policy"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "ব্যবহারের শর্তাবলী" : "Terms of Service"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    title={
                      isBn
                        ? "কুকি ও ডেটা স্টোরেজ শর্তাবলী প্রাইভেসি পলিসিতে অন্তর্ভুক্ত"
                        : "Cookie and telemetry terms are governed in the Privacy Policy"
                    }
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "কুকি পলিসি" : "Cookie Policy"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "কপিরাইট ও ট্রেডমার্ক দাবিত্যাগ" : "Copyright & Trademark Disclaimer"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai-feedback-policy"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "AI ফিডব্যাক নীতি" : "AI Feedback Policy"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accessibility"
                    className="hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    {isBn ? "অ্যাক্সেসিবিলিটি নির্দেশিকা" : "Accessibility Statement"}
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.ielts.org"
                    target="_blank"
                    rel="noreferrer"
                    aria-label={
                      isBn
                        ? "অফিসিয়াল IELTS পোর্টাল (নতুন ট্যাবে খুলবে)"
                        : "Official IELTS Portal (opens in a new tab)"
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-[#5A7F7D] dark:text-[#8AA8A4] hover:text-[#25A995] dark:hover:text-[#25A995] transition-colors duration-150 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded"
                  >
                    <span>{isBn ? "অফিসিয়াল IELTS পোর্টাল" : "Official IELTS Portal"}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Independent Platform & Trademark Notice Box */}
        <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border border-[#D4E8E3] dark:border-[#205653] rounded-2xl p-4 sm:p-5 text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed space-y-2 mb-8">
          <div className="flex items-center gap-2 text-[#25A995] font-semibold uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#25A995] shrink-0" aria-hidden="true" />
            <span>
              {isBn ? "স্বাধীন প্ল্যাটফর্ম ও ট্রেডমার্ক সংক্রান্ত বিজ্ঞপ্তি" : "Independent Platform Notice"}
            </span>
          </div>
          <p>
            {isBn
              ? "BandBloom একটি স্বাধীন IELTS প্রস্তুতি প্ল্যাটফর্ম। এটি কোনো অফিসিয়াল IELTS পরীক্ষা বা স্কোর-রিপোর্টিং সার্ভিস হিসেবে পরিচালিত নয় এবং অফিসিয়াল পার্টনারদের সাথে কোনো প্রাতিষ্ঠানিক সম্পর্ক নেই।"
              : "BandBloom is an independent IELTS preparation platform. It is not affiliated with, endorsed by, or operated as an official IELTS testing or score-reporting service."}
          </p>
          <p className="text-[11px] text-[#5A7F7D] dark:text-[#8AA8A4]">
            {isBn
              ? "IELTS® হল University of Cambridge ESOL, British Council এবং IDP Education Australia-এর নিবন্ধিত ট্রেডমার্ক। BandBloom-এ প্রদত্ত সকল অনুশীলনী, ডায়াগনস্টিক স্কোর ও AI গৃহশিক্ষকের ফিডব্যাক ব্যক্তিগত স্ব-প্রস্তুতির সহায়ক এবং এগুলো অফিসিয়াল টেস্ট ফলাফলের নিশ্চয়তা দেয় না।"
              : "IELTS® is a registered trademark of University of Cambridge ESOL, the British Council, and IDP Education Australia. Practice materials, diagnostic band estimates, and AI feedback are educational diagnostic tools and do not guarantee official examination outcomes."}
          </p>
        </div>

        {/* Copyright & Technical Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5A7F7D] dark:text-[#8AA8A4] pt-6 border-t border-[#D4E8E3] dark:border-[#205653]">
          <p>
            {isBn
              ? "© ২০২৬ BandBloom। সর্বস্বত্ব সংরক্ষিত।"
              : "© 2026 BandBloom. All rights reserved."}
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              {isBn
                ? "স্বাধীন কম্পিউটার-ডেলিভার্ড প্রস্তুতি প্ল্যাটফর্ম"
                : "Independent Computer-Delivered Preparation Platform"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
