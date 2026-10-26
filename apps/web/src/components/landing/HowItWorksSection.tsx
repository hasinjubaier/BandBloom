"use client";

import React from "react";
import Link from "next/link";
import {
  UserRoundPlus,
  Target,
  ClipboardCheck,
  CalendarCheck,
  BookOpenCheck,
  ChartNoAxesCombined,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface StepItem {
  step: string;
  title: { en: string; bn: string };
  desc: { en: string; bn: string };
  icon: React.ElementType;
  note?: { en: string; bn: string };
  link?: {
    href: string;
    label: { en: string; bn: string };
  };
}

const STEPS: StepItem[] = [
  {
    step: "01",
    title: {
      en: "Create Your Account",
      bn: "অ্যাকাউন্ট তৈরি করুন",
    },
    desc: {
      en: "Create your account to access your learning space and begin your IELTS preparation.",
      bn: "আপনার লার্নিং স্পেস অ্যাক্সেস করতে এবং আপনার IELTS প্রস্তুতি শুরু করতে অ্যাকাউন্ট তৈরি করুন।",
    },
    icon: UserRoundPlus,
  },
  {
    step: "02",
    title: {
      en: "Set Your IELTS Goal",
      bn: "আপনার IELTS লক্ষ্য নির্ধারণ করুন",
    },
    desc: {
      en: "Choose Academic or General Training, set your target band and test date, and select your daily study time.",
      bn: "Academic বা General Training নির্বাচন করুন, আপনার টার্গেট ব্যান্ড ও পরীক্ষার তারিখ নির্ধারণ করুন এবং দৈনিক পড়ার সময় ঠিক করুন।",
    },
    icon: Target,
  },
  {
    step: "03",
    title: {
      en: "Discover Your Starting Level",
      bn: "আপনার বর্তমান স্তর যাচাই করুন",
    },
    desc: {
      en: "Complete a short diagnostic assessment to understand your starting point and identify areas to improve.",
      bn: "আপনার বর্তমান দক্ষতা ও উন্নতির ক্ষেত্রগুলো চিহ্নিত করতে একটি সংক্ষিপ্ত ডায়াগনস্টিক টেস্ট সম্পন্ন করুন।",
    },
    icon: ClipboardCheck,
    note: {
      en: "Practice baseline • Unofficial estimate",
      bn: "অনুশীলন বেসলাইন • অনানুষ্ঠানিক অনুমান",
    },
  },
  {
    step: "04",
    title: {
      en: "Follow Your Study Plan",
      bn: "স্টাডি প্ল্যান অনুসরণ করুন",
    },
    desc: {
      en: "Follow recommended daily learning tasks based on your chosen goals and available study time.",
      bn: "আপনার নির্বাচিত লক্ষ্য এবং পড়ার সময়ের ওপর ভিত্তি করে প্রতিদিনের নির্ধারিত টাস্ক সম্পন্ন করুন।",
    },
    icon: CalendarCheck,
  },
  {
    step: "05",
    title: {
      en: "Practise and Learn from Feedback",
      bn: "অনুশীলন ও ফিডব্যাক থেকে শিক্ষা",
    },
    desc: {
      en: "Practise Reading, Listening, Writing, and Speaking, review explanations, and learn from your mistakes.",
      bn: "রিডিং, লিসেনিং, রাইটিং ও স্পিকিং অনুশীলন করুন, ব্যাখ্যা দেখুন এবং ভুলগুলো থেকে শিক্ষা নিন।",
    },
    icon: BookOpenCheck,
    note: {
      en: "Writing & Speaking include unofficial AI feedback estimates",
      bn: "রাইটিং ও স্পিকিংয়ে অনানুষ্ঠানিক AI ফিডব্যাক অনুমান অন্তর্ভুক্ত",
    },
  },
  {
    step: "06",
    title: {
      en: "Take Mock Tests and Review",
      bn: "মক টেস্ট দিন ও পর্যালোচনা করুন",
    },
    desc: {
      en: "Complete timed mock tests, review your results and weak areas, and identify what to practise next.",
      bn: "টাইমারযুক্ত মক টেস্ট দিন, দুর্বলতা পর্যালোচনা করুন এবং পরবর্তী অনুশীলনের দিক নির্ধারণ করুন।",
    },
    icon: ChartNoAxesCombined,
    link: {
      href: "/test-day-guide",
      label: {
        en: "Prepare for test day",
        bn: "পরীক্ষার দিনের প্রস্তুতি দেখুন",
      },
    },
  },
];

export function HowItWorksSection() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <section
      id="how-it-works"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20"
      aria-labelledby="how-it-works-heading"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 text-[#25A995] text-xs font-semibold tracking-wider uppercase mb-3.5">
          <span>{isBn ? "আপনার পথচলা" : "YOUR JOURNEY"}</span>
        </div>

        <h2
          id="how-it-works-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight mb-4"
        >
          {isBn ? "কীভাবে কাজ করে" : "How It Works"}
        </h2>

        <p className="text-sm sm:text-base text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-2xl mx-auto">
          {isBn
            ? "IELTS লক্ষ্য নির্ধারণ থেকে শুরু করে অগ্রগতি মূল্যায়ন পর্যন্ত, BandBloom আপনাকে চারটি স্কিলের একটি কাঠামোগত রুটিন তৈরিতে সাহায্য করে।"
            : "From setting your IELTS goal to reviewing your progress, BandBloom helps you build a structured practice routine for all four skills."}
        </p>
      </div>

      {/* Six Learner Journey Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {STEPS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="bg-white dark:bg-[#123C3A] rounded-2xl sm:rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#25A995] dark:hover:border-[#25A995] transition-all duration-200 group motion-safe:hover:-translate-y-1 focus-within:ring-2 focus-within:ring-[#25A995]"
            >
              <div>
                {/* Top Row: Icon Container and Step Pill */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F7F4] dark:bg-[#0A1C1B] border border-[#25A995]/25 text-[#25A995] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#25A995] group-hover:text-white transition-all duration-200 shadow-xs">
                    <Icon className="w-6 h-6 transition-transform duration-200" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold tracking-wider font-mono px-3 py-1 rounded-full bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#25A995] border border-[#25A995]/20">
                    Step {item.step}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] mb-2.5 tracking-tight group-hover:text-[#25A995] transition-colors duration-150">
                  {isBn ? item.title.bn : item.title.en}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                  {isBn ? item.desc.bn : item.desc.en}
                </p>
              </div>

              {/* Optional Note or Route Link */}
              {item.note || item.link ? (
                <div className="pt-4 mt-5 border-t border-[#D4E8E3]/70 dark:border-[#205653]/70">
                  {item.note && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">
                      {item.step === "03" ? (
                        <Sparkles className="w-3.5 h-3.5 text-[#25A995] shrink-0" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#25A995] shrink-0" aria-hidden="true" />
                      )}
                      <span>{isBn ? item.note.bn : item.note.en}</span>
                    </div>
                  )}

                  {item.link && (
                    <Link
                      href={item.link.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25A995] hover:text-[#123C3A] dark:hover:text-white transition-colors group/link focus-visible:outline-none focus-visible:underline"
                    >
                      <span>{isBn ? item.link.label.bn : item.link.label.en}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Final Call-to-Action Area */}
      <div className="mt-12 sm:mt-16 bg-gradient-to-r from-[#E8F7F4]/80 via-white to-[#FFF6F3]/80 dark:from-[#123C3A] dark:via-[#123C3A] dark:to-[#174A48] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-8 sm:p-10 text-center shadow-xs">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            {isBn ? "আপনার IELTS প্রস্তুতি শুরু করতে প্রস্তুত?" : "Ready to Start Your IELTS Journey?"}
          </h3>

          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed max-w-xl mx-auto">
            {isBn
              ? "প্রথম পদক্ষেপটি নিন এবং একটি নিয়মতান্ত্রিক অনুশীলনের অভ্যাস গড়ে তুলুন।"
              : "Take the first step and start building a consistent practice routine."}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#25A995]/20 border border-transparent transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2"
            >
              <span>{isBn ? "প্রস্তুতি শুরু করুন" : "Create Account to Start"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>

            <Link
              href="/practice"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#0A1C1B] hover:bg-[#F4FAF8] dark:hover:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] font-semibold text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 shadow-2xs"
            >
              <span>{isBn ? "নমুনা অনুশীলন দেখুন" : "Explore Sample Practice"}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
