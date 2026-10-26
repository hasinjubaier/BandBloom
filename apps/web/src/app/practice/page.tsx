"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  FileText,
  Mic,
  Laptop,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PracticeHubPage() {
  const { language } = useLanguage();

  const practiceLabs = [
    {
      title: "Academic & GT Reading Lab",
      skill: "Reading",
      desc: "Practice True/False/Not Given, Headings Matching, and Summary Completion with paragraph evidence highlights.",
      href: "/lessons",
      color: "border-[#25A995]/30 text-[#25A995] bg-[#E8F7F4] dark:bg-[#0A1C1B]",
      icon: BookOpen,
      badge: "Passage Evidence Highlighting",
    },
    {
      title: "Computer-Delivered Listening Lab",
      skill: "Listening",
      desc: "Practice with native British, Australian, and North American dialogues with speed controls and transcript unlocking.",
      href: "/lessons",
      color: "border-[#25A995]/30 text-[#25A995] bg-[#E8F7F4] dark:bg-[#0A1C1B]",
      icon: Headphones,
      badge: "Distractor Warning System",
    },
    {
      title: "Writing Tasks 1 & 2 Evaluator",
      skill: "Writing",
      desc: "Draft essays with real-time word counting, length warnings (min 150w / 250w), and 4-criterion AI rubric assessments.",
      href: "/lessons",
      color: "border-[#FF8A65]/30 text-[#FF8A65] bg-[#FFF6F3] dark:bg-[#0A1C1B]",
      icon: FileText,
      badge: "Instant Rubric Diagnostic",
    },
    {
      title: "Speaking Cue Card & Recorder",
      skill: "Speaking",
      desc: "Simulate Part 2 cue cards with 1-minute countdown prep and 2-minute recording with verbatim transcript editing.",
      href: "/lessons",
      color: "border-[#25A995]/30 text-[#25A995] bg-[#E8F7F4] dark:bg-[#0A1C1B]",
      icon: Mic,
      badge: "Transcript & Fluency Breakdown",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#25A995] bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 px-3 py-1 rounded-full">
          Targeted Skill Training
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
          BandBloom Practice Labs
        </h1>
        <p className="text-sm text-[#3D6462] dark:text-[#A0C5C1]">
          Target specific component weaknesses with individual skill simulators before taking full mock exams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {practiceLabs.map((lab) => (
          <div
            key={lab.title}
            className="bg-white dark:bg-[#123C3A] p-8 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] dark:hover:border-[#25A995] transition-all flex flex-col justify-between space-y-6 group shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl border ${lab.color}`}>
                  <lab.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D6462] dark:text-[#A0C5C1] bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] px-2.5 py-1 rounded-full">
                  {lab.badge}
                </span>
              </div>

              <h2 className="text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8] group-hover:text-[#25A995] transition-colors">
                {lab.title}
              </h2>

              <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                {lab.desc}
              </p>
            </div>

            <div className="pt-4 border-t border-[#D4E8E3] dark:border-[#205653]">
              <Link
                href={lab.href}
                className="w-full py-2.5 px-4 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Explore {lab.skill} Lessons</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
