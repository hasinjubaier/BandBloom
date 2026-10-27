"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { GoalBandSelector } from "./GoalBandSelector";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative pt-10 pb-16 overflow-hidden scroll-mt-20">
      {/* Glow background decorations */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#25A995]/8 dark:bg-[#25A995]/15 blur-[120px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Eyebrow Badge (1 of <=3 kept on page) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#167568] dark:text-[#25A995] text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#167568] dark:text-[#25A995]" aria-hidden="true" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Solid legible Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#123C3A] dark:text-[#F4FAF8] leading-[1.18]">
            <span>{t.hero.titlePre} </span>
            <span className="text-[#167568] dark:text-[#25A995]">{t.hero.titleHighlight}</span>
            {t.hero.titlePost ? <span> {t.hero.titlePost}</span> : null}
          </h1>

          {/* Subtitle with honest computer-based practice line */}
          <p className="text-[#3D6462] dark:text-[#A0C5C1] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#25A995]/20 border border-transparent transition-all flex items-center justify-center gap-2 group whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2"
            >
              <span>{t.hero.signInCta}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>

            <a
              href="#sample-exercise"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#F4FAF8] border border-[#D4E8E3] text-[#123C3A] hover:border-[#25A995] dark:bg-[#123C3A] dark:hover:bg-[#0A1C1B] dark:border-[#205653] dark:text-[#F4FAF8] font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2"
            >
              <span>{t.hero.secondaryCta}</span>
            </a>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-6 border-t border-[#D4E8E3] dark:border-[#205653] text-xs sm:text-[13px] text-[#3D6462] dark:text-[#A0C5C1]">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-[#167568] dark:text-[#25A995]" aria-hidden="true" />
              <span>{t.hero.trustFreePractice}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <BookOpen className="w-4 h-4 text-[#FF8A65]" aria-hidden="true" />
              <span>{t.hero.trustAllSkills}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <BrainCircuit className="w-4 h-4 text-[#167568] dark:text-[#25A995]" aria-hidden="true" />
              <span>{t.hero.trustAiGuidance}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#FF8A65]" aria-hidden="true" />
              <span>{t.hero.trustUnofficialScores}</span>
            </span>
          </div>
        </div>

        {/* Goal Band Selector */}
        <div className="mt-10 lg:mt-12 w-full">
          <GoalBandSelector />
        </div>
      </div>
    </section>
  );
}

