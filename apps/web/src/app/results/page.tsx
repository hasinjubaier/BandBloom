"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  PlayCircle,
} from "lucide-react";
import { ExamAttemptSummary } from "@/server/services/mock.service";

export default function ResultsPage() {
  const [attempts, setAttempts] = useState<ExamAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/attempts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAttempts(data.attempts);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedAttempts = attempts.filter(
    (a) => a.status === "submitted" || a.status === "evaluated"
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Diagnostic Performance Analytics</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            IELTS Results & Score Progression
          </h2>
          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] max-w-xl">
            Track your mock test results over time. All band scores are evaluated strictly according to official IELTS half-band rounding standards.
          </p>
        </div>

        <div className="shrink-0 p-4 rounded-2xl bg-[#E8F7F4] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-center min-w-[150px]">
          <div className="text-2xl font-black text-[#25A995]">
            {completedAttempts.length}
          </div>
          <div className="text-[10px] font-bold text-[#67839A] dark:text-[#A0C5C1] uppercase tracking-wider">
            Completed Exams
          </div>
        </div>
      </section>

      {/* Attempts List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]"
            />
          ))}
        </div>
      ) : completedAttempts.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#E8F7F4] text-[#25A995] flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              No Evaluated Mock Tests Yet
            </h3>
            <p className="text-xs text-[#67839A] dark:text-[#A0C5C1] mt-1">
              Complete your first computer-delivered practice exam to populate your diagnostic report and skill breakdown.
            </p>
          </div>
          <Link
            href="/mock-centre"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25A995] text-white text-xs font-bold shadow-xs hover:bg-[#123C3A] transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Take Diagnostic Mock Test</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {completedAttempts.map((att) => (
            <div
              key={att.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995]">
                    {att.testType}
                  </span>
                  <span className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
                    Submitted: {new Date(att.submittedAt || att.startedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {att.examTitle}
                </h3>

                {/* 4 Skill Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    Reading: {att.readingScore ? `Band ${att.readingScore.toFixed(1)}` : "N/A"}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    Listening: {att.listeningScore ? `Band ${att.listeningScore.toFixed(1)}` : "N/A"}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    Writing: {att.writingScore ? `Band ${att.writingScore.toFixed(1)}` : "N/A"}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    Speaking: {att.speakingScore ? `Band ${att.speakingScore.toFixed(1)}` : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-black text-[#25A995]">
                    Band {att.overallBand?.toFixed(1) || "7.0"}
                  </div>
                  <div className="text-[10px] text-[#67839A] dark:text-[#A0C5C1] uppercase tracking-wider font-semibold">
                    Practice Overall
                  </div>
                </div>

                <Link
                  href={`/results/${att.id}`}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#25A995] transition-colors"
                >
                  Full Report
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
