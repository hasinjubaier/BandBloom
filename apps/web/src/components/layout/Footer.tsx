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
      className="bg-[#F6FCF9] dark:bg-[#0C1F1E] border-t border-[#D4E8E3] dark:border-[#1E4D4A] text-[#3D6462] dark:text-[#A0C5C1] text-sm transition-colors duration-200"
      role="contentinfo"
      aria-label={isBn ? "ফুটার তথ্য ও নেভিগেশন" : "Footer Information and Navigation"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
        {/* Main Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 mb-12 lg:mb-16">
          {/* Column 1: Brand Info & Trust Signals (5 columns on desktop) */}
          <div className="md:col-span-2 lg:col-span-5 space-y-5 pr-0 lg:pr-4">
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
              className="inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] rounded-xl"
              aria-label={isBn ? "BandBloom মূলপাতা" : "BandBloom Home"}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-[#25A995] transition-all duration-200 shrink-0">
                <Image
                  src="/logo.webp"
                  alt="BandBloom IELTS Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-[#123C3A] dark:text-[#F4FAF8] leading-tight">
                  Band<span className="text-[#25A995]">Bloom</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#3D6462] dark:text-[#A0C5C1] flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25A995]" aria-hidden="true" />
                  {isBn ? "IELTS প্রস্তুতি প্ল্যাটফর্ম" : "IELTS Preparation Platform"}
                </span>
              </div>
            </Link>

            {/* Platform Description */}
            <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-sm sm:max-w-md">
              {isBn
                ? "চারটি স্কিলের কাঠামোগত অনুশীলন, কার্যকর ফিডব্যাক এবং নির্ভরযোগ্য রিসোর্স সহ ফ্রি IELTS প্রস্তুতি।"
                : "Free IELTS preparation with structured practice, useful feedback, and learning resources for all four skills."}
            </p>

            {/* Independent Platform Disclaimer */}
            <p className="text-xs text-[#527774] dark:text-[#7EA09D] leading-relaxed max-w-sm sm:max-w-md">
              {isBn
                ? "BandBloom একটি স্বাধীন IELTS প্রস্তুতি প্ল্যাটফর্ম এবং এটি কোনো অফিসিয়াল IELTS টেস্টিং বা স্কোর-রিপোর্টিং সার্ভিস নয়।"
                : "BandBloom is an independent IELTS preparation platform and is not an official IELTS testing or score-reporting service."}
            </p>

            {/* Trust Badges */}
            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#25A995] shrink-0" aria-hidden="true" />
                <span>{isBn ? "প্রাইভেসি-ফার্স্ট আর্কিটেকচার" : "Privacy-First Architecture"}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#25A995] shrink-0" aria-hidden="true" />
                <span>{isBn ? "WCAG ২.২ AA মান" : "WCAG 2.2 Level AA Standards"}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Explore Navigation (2 columns on desktop) */}
          <div className="md:col-span-1 lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25A995]" aria-hidden="true" />
              <span>{isBn ? "অন্বেষণ করুন" : "Explore"}</span>
            </h3>
            <nav aria-label={isBn ? "অন্বেষণ নেভিগেশন" : "Explore Navigation"}>
              <ul className="space-y-1.5 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/how-it-works"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "কীভাবে কাজ করে" : "How It Works"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lessons"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "ফ্রি লেসন" : "Free Lessons"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/practice"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "নমুনা অনুশীলন" : "Sample Practice"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/test-types"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "পরীক্ষার ধরন" : "Test Types"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/test-day-guide"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "পরীক্ষার দিনের গাইড" : "Test-day Guide"}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 3: Preparation & Account (2 columns on desktop) */}
          <div className="md:col-span-1 lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25A995]" aria-hidden="true" />
              <span>{isBn ? "প্রস্তুতি ও অ্যাকাউন্ট" : "Get Started"}</span>
            </h3>
            <nav aria-label={isBn ? "প্রস্তুতি ও অ্যাকাউন্ট নেভিগেশন" : "Preparation and Account Navigation"}>
              <ul className="space-y-1.5 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/onboarding"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md font-semibold text-[#123C3A] dark:text-[#F4FAF8]"
                  >
                    {isBn ? "প্রস্তুতি শুরু করুন" : "Start Preparation"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/practice"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "অনুশীলন হাব" : "Practice Hub"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lessons"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "লেসন কারিকুলাম" : "Lessons Curriculum"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "অ্যাকাউন্টে সাইন ইন" : "Sign In"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "নতুন অ্যাকাউন্ট তৈরি" : "Create Account"}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 4: Legal & Policies (3 columns on desktop) */}
          <div className="md:col-span-2 lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25A995]" aria-hidden="true" />
              <span>{isBn ? "আইনি ও পলিসি" : "Legal & Policies"}</span>
            </h3>
            <nav aria-label={isBn ? "আইনি ও পলিসি নেভিগেশন" : "Legal & Policy Navigation"}>
              <ul className="space-y-1.5 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "প্রাইভেসি পলিসি" : "Privacy Policy"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
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
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "কুকি পলিসি" : "Cookie Policy"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "কপিরাইট ও ট্রেডমার্ক দাবিত্যাগ" : "Copyright & Trademark Disclaimer"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai-feedback-policy"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "AI ফিডব্যাক নীতি" : "AI Feedback Policy"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accessibility"
                    className="hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 inline-flex items-center py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md"
                  >
                    {isBn ? "অ্যাক্সেসিবিলিটি নির্দেশিকা" : "Accessibility Statement"}
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.ielts.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                      isBn
                        ? "অফিসিয়াল IELTS পোর্টাল (নতুন ট্যাবে খুলবে)"
                        : "Official IELTS Portal (opens in a new tab)"
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-[#527774] dark:text-[#7EA09D] hover:text-[#198777] dark:hover:text-[#38D4BD] transition-colors duration-150 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#123C3A] rounded-md group"
                  >
                    <span>{isBn ? "অফিসিয়াল IELTS পোর্টাল" : "Official IELTS Portal"}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-[#25A995] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Oversized Outlined BandBloom Brand Signature (Reference Inspired) */}
        <div
          className="w-full overflow-hidden select-none pointer-events-none py-6 sm:py-10 lg:py-14 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="footer-brand-signature block text-center font-black uppercase text-[15vw] sm:text-[14vw] lg:text-[13vw] xl:text-[160px] leading-none whitespace-nowrap">
            BandBloom
          </span>
        </div>

        {/* Copyright & Technical Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#527774] dark:text-[#7EA09D] pt-6 border-t border-[#D4E8E3] dark:border-[#1E4D4A]">
          <p className="text-center sm:text-left">
            {isBn
              ? "© ২০২৬ BandBloom। সর্বস্বত্ব সংরক্ষিত।"
              : "© 2026 BandBloom. All rights reserved."}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#3D6462] dark:text-[#A0C5C1] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25A995]" aria-hidden="true" />
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

