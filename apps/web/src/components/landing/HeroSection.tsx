"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  BookOpen,
  BrainCircuit,
  ArrowRight,
  Laptop,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { GoalBandSelector } from "./GoalBandSelector";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative pt-8 pb-16 overflow-hidden scroll-mt-20">
      {/* Glow background decorations */}
      <div
        className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[350px] bg-[#25A995]/8 dark:bg-[#25A995]/15 blur-[120px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Content Column (5 cols on lg) */}
          <div className="lg:col-span-5 text-left space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#25A995] text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#25A995]" aria-hidden="true" />
              <span>{t.hero.badge}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A65] animate-pulse" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.15]">
              <span className="block text-[#123C3A] dark:text-[#F4FAF8]">{t.hero.titlePre}</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#25A995] to-[#FF8A65]">
                {t.hero.titleHighlight}
              </span>
              {t.hero.titlePost ? <span className="text-[#123C3A] dark:text-[#F4FAF8]"> {t.hero.titlePost}</span> : null}
            </h1>

            {/* Subtitle */}
            <p className="text-[#3D6462] dark:text-[#A0C5C1] text-base sm:text-[17px] leading-relaxed max-w-xl">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#25A995]/20 border border-transparent transition-all flex items-center justify-center gap-2 group whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2"
              >
                <span>{t.hero.signInCta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>

              <Link
                href="/signup"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#F4FAF8] border border-[#D4E8E3] text-[#123C3A] hover:border-[#25A995] dark:bg-[#123C3A] dark:hover:bg-[#0A1C1B] dark:border-[#205653] dark:text-[#F4FAF8] font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2"
              >
                <Laptop className="w-4 h-4 text-[#FF8A65]" aria-hidden="true" />
                <span>{t.nav.signUp}</span>
              </Link>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-5 border-t border-[#D4E8E3] dark:border-[#205653] text-xs sm:text-[13px] text-[#3D6462] dark:text-[#A0C5C1]">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-[#25A995]" aria-hidden="true" />
                <span>{t.hero.trustFreePractice}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-4 h-4 text-[#FF8A65]" aria-hidden="true" />
                <span>{t.hero.trustAllSkills}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <BrainCircuit className="w-4 h-4 text-[#25A995]" aria-hidden="true" />
                <span>{t.hero.trustAiGuidance}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#FF8A65]" aria-hidden="true" />
                <span>{t.hero.trustUnofficialScores}</span>
              </span>
            </div>
          </div>

          {/* Right Visual Column with Optimized Next.js Image */}
          <div className="lg:col-span-7 relative w-full flex items-center justify-center">
            <div className="relative w-full max-w-2xl lg:max-w-none group flex justify-center">
              <Image
                src="/hero-ielts-v4.webp"
                alt="IELTS Preparation Books - Reading, Listening, Writing, Speaking with study materials and graduation cap"
                width={1024}
                height={630}
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="w-full h-auto object-contain transition-transform duration-500 hover:scale-[1.01] pointer-events-none select-none"
              />
            </div>
          </div>
        </div>

        {/* Goal Band Selector Row */}
        <div className="mt-8 lg:mt-12 w-full">
          <GoalBandSelector />
        </div>
      </div>
    </section>
  );
}
