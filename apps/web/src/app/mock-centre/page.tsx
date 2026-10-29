"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Clock,
  PlayCircle,
} from "lucide-react";
import { ExamSummary, ExamAttemptSummary } from "@/server/services/mock.service";

export default function MockCentrePage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [attempts, setAttempts] = useState<ExamAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [examsRes, attemptsRes] = await Promise.all([
        fetch("/api/exams"),
        fetch("/api/attempts"),
      ]);

      const examsJson = await examsRes.json();
      const attemptsJson = await attemptsRes.json();

      if (examsJson.success) setExams(examsJson.exams);
      if (attemptsJson.success) setAttempts(attemptsJson.attempts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load mock tests.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetch("/api/exams"), fetch("/api/attempts")])
      .then(async ([examsRes, attemptsRes]) => {
        const examsJson = await examsRes.json();
        const attemptsJson = await attemptsRes.json();
        if (!isMounted) return;
        setNow(Date.now());
        if (examsJson.success) setExams(examsJson.exams);
        if (attemptsJson.success) setAttempts(attemptsJson.attempts);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load mock tests.";
        setError(msg);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 bg-white dark:bg-[#123C3A] rounded-2xl border border-[#D4E8E3] dark:border-[#205653]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Computer-Delivered Testing Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            IELTS Mock Test Centre
          </h2>
          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] max-w-xl">
            Simulate the exact timing, navigation, and interface of official computer-delivered IELTS tests. Responses are graded against official IELTS band descriptors.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-[#E8F7F4] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-center">
            <div className="text-lg font-black text-[#25A995]">
              {attempts.filter((a) => a.status === "submitted" || a.status === "evaluated").length}
            </div>
            <div className="text-[10px] font-bold text-[#67839A] dark:text-[#A0C5C1] uppercase">
              Completed
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchData}
            className="px-3 py-1 font-semibold rounded-lg bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Available Exam Catalog */}
      <section className="space-y-4" aria-labelledby="available-exams-heading">
        <h3
          id="available-exams-heading"
          className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
        >
          Available Mock Tests
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#25A995]/60 transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995]">
                    {exam.testType}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#67839A] dark:text-[#A0C5C1]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exam.durationMinutes} min</span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8] leading-snug">
                  {exam.title}
                </h4>

                <p className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
                  Includes {exam.sectionsCount} core test sections (Listening, Reading, Writing, Speaking) with timed question sequences.
                </p>
              </div>

              <div className="pt-2 border-t border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#25A995]">
                  Full Diagnostics
                </span>
                <Link
                  href={`/mock-centre/exam?id=${exam.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Start Mock Exam</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Completed Attempts History */}
      {attempts.length > 0 && (
        <section className="space-y-4" aria-labelledby="history-heading">
          <h3
            id="history-heading"
            className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
          >
            Your Previous Attempts
          </h3>

          <div className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] overflow-hidden shadow-xs divide-y divide-[#D4E8E3] dark:divide-[#205653]">
            {attempts.map((att) => {
              const isEvaluated =
                att.status === "evaluated" && att.overallBand !== null;
              const isSubmitted =
                att.status === "submitted" ||
                (att.status === "evaluated" && att.overallBand === null);
              const isExpired =
                att.status === "in_progress" &&
                !!att.deadlineAt &&
                now !== null &&
                new Date(att.deadlineAt).getTime() < now;

              return (
                <div
                  key={att.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                      {att.examTitle}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#67839A] dark:text-[#A0C5C1]">
                      <span>
                        Started: {new Date(att.startedAt).toLocaleDateString()}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded bg-[#F4FAF8] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]">
                        Status: {att.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isEvaluated ? (
                      <div className="text-right">
                        <div className="text-base font-extrabold text-[#25A995]">
                          Band {att.overallBand?.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                          Overall Practice
                        </div>
                      </div>
                    ) : isSubmitted ? (
                      <span className="text-xs text-[#8AA4B7]">Submitted</span>
                    ) : (
                      <span className="text-xs text-[#8AA4B7]">
                        {isExpired ? "Time Expired" : "In Progress"}
                      </span>
                    )}

                    {isEvaluated ? (
                      <Link
                        href={`/results/${att.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#25A995] transition-colors"
                      >
                        View Report
                      </Link>
                    ) : isSubmitted ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#67839A] dark:text-[#A0C5C1]">
                        Awaiting Evaluation
                      </span>
                    ) : isExpired ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-[#FFF1F0] dark:bg-[#3D1E1E] border border-[#FFA39E] dark:border-[#5C2223] text-xs font-semibold text-[#CF1322] dark:text-[#FF7875]">
                        Time Expired
                      </span>
                    ) : (
                      <Link
                        href={`/mock-centre/exam?id=${att.examId}&attempt=${att.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-[#25A995] text-white text-xs font-semibold hover:bg-[#1E8A7A] transition-colors"
                      >
                        Resume Exam
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
