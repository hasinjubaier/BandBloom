"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Laptop,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function MockCentrePage() {
  const { language } = useLanguage();

  const mockExams = [
    {
      id: "mock-1",
      title: "BandBloom Academic Diagnostic Full Mock 1",
      type: "Academic",
      sections: "Listening (30m) • Reading (60m) • Writing (60m) • Speaking (14m)",
      questionsCount: 40,
      status: "Available Now",
      difficulty: "Official Standard Form",
      version: "2026.1",
    },
    {
      id: "mock-2",
      title: "BandBloom Academic Mock 2 - Advanced Science & Urbanization",
      type: "Academic",
      sections: "Listening (30m) • Reading (60m) • Writing (60m)",
      questionsCount: 40,
      status: "Available Now",
      difficulty: "Target Band 7.5+",
      version: "2026.2",
    },
    {
      id: "mock-gt-1",
      title: "BandBloom General Training Diagnostic Mock 1",
      type: "General Training",
      sections: "Listening (30m) • GT Reading (60m) • GT Writing (60m)",
      questionsCount: 40,
      status: "Available Now",
      difficulty: "Workplace & Migration Standard",
      version: "2026.1",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Hero Header */}
      <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20 dark:text-[#25A995] text-xs font-semibold">
            <Laptop className="w-3.5 h-3.5" />
            <span>2026 Computer-Delivered Examination Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            Authentic Computer-Delivered Mock Tests
          </h1>
          <p className="text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
            Experience the identical ergonomics of the official computer exam: 40-question navigation matrices, split-pane passage reading, server-authoritative countdown timers, and debounced auto-saves.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-[#3D6462] dark:text-[#A0C5C1] pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#25A995]" />
              <span>Full Test-Form Coverage</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF8A65]" />
              <span>Official Band Rounding (Section 5.3)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#25A995]" />
              <span>Network Grace-Period Protection</span>
            </span>
          </div>
        </div>
      </div>

      {/* Available Exam Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#25A995]" />
            <span>Available Test Forms</span>
          </h2>
          <span className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">Version 2026.1 Released</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockExams.map((mock) => (
            <div
              key={mock.id}
              className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] transition-all flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                    mock.type === "Academic"
                      ? "bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20 dark:text-[#25A995]"
                      : "bg-[#FFF6F3] text-[#FF8A65] border border-[#FF8A65]/30 dark:bg-[#FF8A65]/20 dark:text-[#FF8A65]"
                  }`}>
                    {mock.type}
                  </span>
                  <span className="text-[#3D6462] dark:text-[#A0C5C1] text-[11px]">{mock.difficulty}</span>
                </div>

                <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8] group-hover:text-[#25A995] transition-colors">
                  {mock.title}
                </h3>

                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                  {mock.sections}
                </p>
              </div>

              <div className="pt-4 border-t border-[#D4E8E3] dark:border-[#205653] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#25A995]" />
                    <span>2 hrs 45 mins</span>
                  </span>
                  <span>Config: {mock.version}</span>
                </div>

                <Link
                  href="/mock-centre/exam"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-white font-semibold text-xs shadow-md shadow-[#25A995]/25 border border-transparent flex items-center justify-center gap-2 transition-all"
                >
                  <span>Launch Computer Exam</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Rule Box */}
      <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-[#25A995] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              One-Active-Attempt & Session Recovery Rules (Section 8.2 & 14.1)
            </h4>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              Only one live attempt can be in progress per learner. If your browser closes or network drops, your responses are safely cached and automatically restored upon reconnection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
