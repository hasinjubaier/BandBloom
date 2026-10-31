"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  Award,
  Search,
  ArrowRight,
  AlertTriangle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  RotateCcw,
  Send,
  Loader2,
  Info,
} from "lucide-react";
import {
  ReadingStream,
  ACADEMIC_RAW_SCORE_GUIDE,
  GT_RAW_SCORE_GUIDE,
  READING_QUESTION_TYPES,
  validateReadingAnswer,
} from "@/lib/reading-module-data";
import {
  ACADEMIC_READING_PASSAGE,
  GT_READING_PASSAGE,
  ReadingEvaluationResult,
} from "@/lib/practice-data";
import { ExamAttemptSummary } from "@/server/services/mock.service";

export default function ReadingModuleView() {
  const searchParams = useSearchParams();
  const queryType = searchParams.get("type");
  const queryQuestion = searchParams.get("q");

  // State
  const [profile, setProfile] = useState<{
    testType: ReadingStream;
    targetBand: number;
    fullName: string;
  }>({
    testType: "academic",
    targetBand: 7.5,
    fullName: "Learner",
  });
  const [stream, setStream] = useState<ReadingStream>("academic");
  const [attempts, setAttempts] = useState<ExamAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Question Type Library State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedTypeId, setExpandedTypeId] = useState<string | null>(() => {
    if (!queryQuestion) return null;
    const matched = READING_QUESTION_TYPES.find(
      (qt) => qt.id.toLowerCase() === queryQuestion.toLowerCase()
    );
    return matched ? matched.id : null;
  });

  // Interactive 14 Question Types Micro-Drill State
  const [cardAnswers, setCardAnswers] = useState<Record<string, string>>({});
  const [cardEvaluations, setCardEvaluations] = useState<
    Record<
      string,
      {
        isCorrect: boolean;
        statusMessage: string;
        wordCount: number;
        wordLimitExceeded: boolean;
      }
    >
  >({});
  const [cardRevealed, setCardRevealed] = useState<Record<string, boolean>>({});

  // In-Page Interactive Practice State
  const [labOpen, setLabOpen] = useState(false);
  const [labAnswers, setLabAnswers] = useState<Record<string, string>>({});
  const [labSubmitted, setLabSubmitted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<ReadingEvaluationResult | null>(null);
  const [savingMistakeId, setSavingMistakeId] = useState<string | null>(null);
  const [savedMistakes, setSavedMistakes] = useState<Set<string>>(new Set());

  // Fetch Profile & Attempts
  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/attempts").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([profData, attData]) => {
        if (!mounted) return;
        if (profData?.profile) {
          const profStream: ReadingStream =
            profData.profile.testType === "general_training"
              ? "general_training"
              : "academic";
          setProfile({
            testType: profStream,
            targetBand: profData.profile.targetBand || 7.5,
            fullName: profData.profile.fullName || "Learner",
          });

          // Determine initial stream: query parameter overrides, else profile
          if (queryType === "general_training" || queryType === "general") {
            setStream("general_training");
          } else if (queryType === "academic") {
            setStream("academic");
          } else {
            setStream(profStream);
          }
        }
        if (attData?.attempts) {
          setAttempts(attData.attempts);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [queryType]);

  // Active Score Guide based on selected stream
  const activeGuide = useMemo(() => {
    return stream === "academic" ? ACADEMIC_RAW_SCORE_GUIDE : GT_RAW_SCORE_GUIDE;
  }, [stream]);

  // User Target Band details in the current score guide
  const targetBandTier = useMemo(() => {
    return activeGuide.tiers.find((t) => t.band === profile.targetBand) || activeGuide.tiers[3];
  }, [activeGuide, profile.targetBand]);

  // Filtered Question Types
  const filteredQuestionTypes = useMemo(() => {
    return READING_QUESTION_TYPES.filter((qt) => {
      // 1. Stream filter
      if (qt.stream !== "both" && qt.stream !== stream) return false;

      // 2. Category filter
      if (selectedCategory !== "all") {
        if (selectedCategory === "verification" && qt.category !== "Verification") return false;
        if (selectedCategory === "matching" && qt.category !== "Matching") return false;
        if (selectedCategory === "completion" && qt.category !== "Completion") return false;
        if (selectedCategory === "choice" && qt.category !== "Choice & Inquiry") return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = qt.name.toLowerCase().includes(query);
        const matchesSkill = qt.skillAssessed.toLowerCase().includes(query);
        const matchesStrategy = qt.strategy.toLowerCase().includes(query);
        const matchesId = qt.id.toLowerCase().includes(query);
        return matchesName || matchesSkill || matchesStrategy || matchesId;
      }

      return true;
    });
  }, [stream, selectedCategory, searchQuery]);

  // Reading-specific attempts from history
  const readingAttempts = useMemo(() => {
    return attempts.filter((att) => {
      const titleLower = att.examTitle.toLowerCase();
      return (
        titleLower.includes("reading") ||
        (att.readingScore !== null && att.status === "evaluated")
      );
    });
  }, [attempts]);

  // Active Passage for In-Page Lab
  const activePassage = useMemo(() => {
    return stream === "academic" ? ACADEMIC_READING_PASSAGE : GT_READING_PASSAGE;
  }, [stream]);

  // Handle Lab Submission
  const handleSubmitLab = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_reading",
          answers: labAnswers,
          stream,
          assessmentType: "diagnostic",
          persist: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        setLabSubmitted(true);
        // Refresh attempts in background
        fetch("/api/attempts")
          .then((r) => r.json())
          .then((d) => d.success && setAttempts(d.attempts))
          .catch(() => {});
      }
    } catch {
      // Fallback local evaluation if offline
      let score = 0;
      const questionResults = activePassage.questions.map((q) => {
        const studentAns = labAnswers[q.id] || "";
        const validation = validateReadingAnswer(studentAns, {
          correctAnswer: q.correctAnswer,
          typeId: q.type === "True/False/Not Given" ? "tfng" : "completion",
        });
        if (validation.isCorrect) score++;
        return {
          questionId: q.id,
          number: q.number,
          studentAnswer: studentAns || "No answer provided",
          correctAnswer: q.correctAnswer,
          isCorrect: validation.isCorrect,
          evidenceParagraph: q.evidenceParagraph,
          evidenceText: q.evidenceText,
          explanation: q.explanation,
          errorTrap: q.errorTrap,
        };
      });
      const total = activePassage.questions.length;
      const percentage = Math.round((score / total) * 100);
      setEvaluation({
        score,
        total,
        percentage,
        estimatedBand: null, // Diagnostic sets must never fabricate Band 9.0
        assessmentType: "diagnostic",
        stream,
        maxScore: total,
        correctCount: score,
        unansweredCount: total - Object.keys(labAnswers).filter((k) => labAnswers[k]?.trim()).length,
        accuracy: percentage,
        confidenceLabel: "insufficient_evidence",
        statusMessage: `Diagnostic Result: ${score} / ${total} correct (${percentage}% accuracy). Full official-equivalent band estimates require a complete 40-question mock test.`,
        isUnofficial: true,
        questionResults,
        mistakesToRecord: [],
      });
      setLabSubmitted(true);
    } finally {
      setEvaluating(false);
    }
  };

  // Save single mistake to Mistake Notebook
  const handleSaveMistake = async (q: (typeof activePassage.questions)[0], studentAnswer: string) => {
    setSavingMistakeId(q.id);
    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "reading",
          errorTag: q.type === "True/False/Not Given" ? "TFNG Traps" : "Paraphrase Detection",
          questionPrompt: q.prompt,
          studentAnswer: studentAnswer || "Blank",
          reasoning: `${q.explanation} (Evidence: Paragraph ${q.evidenceParagraph})`,
        }),
      });
      if (res.ok) {
        setSavedMistakes((prev) => new Set(prev).add(q.id));
      }
    } catch {}
    setSavingMistakeId(null);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true">
        <div className="h-44 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
          <div className="h-96 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
        </div>
      </div>
    );
  }

  const isAcademic = stream === "academic";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: Dynamic Academic vs General Training Stream */}
      {/* ========================================================================= */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isAcademic ? "Academic Reading Module" : "General Training Reading Module"}</span>
            </div>

            {/* Stream Toggle Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-[#F0F7F5] dark:bg-[#0D2D2C] border border-[#D4E8E3] dark:border-[#205653]">
              <button
                type="button"
                onClick={() => setStream("academic")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isAcademic
                    ? "bg-[#25A995] text-white shadow-xs"
                    : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                }`}
              >
                Academic
              </button>
              <button
                type="button"
                onClick={() => setStream("general_training")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isAcademic
                    ? "bg-[#25A995] text-white shadow-xs"
                    : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                }`}
              >
                General Training
              </button>
            </div>

            {/* Profile Stream Match Pill */}
            {profile.testType === stream ? (
              <span className="text-[10px] font-bold text-[#25A995] bg-[#E8F7F4] dark:bg-[#174A48] px-2 py-0.5 rounded-md">
                Your Primary Track
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span>Cross-Training Mode (Primary: {profile.testType === "academic" ? "Academic" : "General Training"})</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            {isAcademic ? "IELTS Academic Reading" : "IELTS General Training Reading"}
          </h2>

          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] max-w-2xl leading-relaxed">
            {isAcademic
              ? "Assesses reading comprehension across three extended academic texts taken from scholarly journals, books, and analytical publications. Covers descriptive, factual, discursive, and argumentative styles."
              : "Assesses practical reading in an English-speaking environment across three distinct sections: everyday social notices and timetables (Section 1), workplace employment guides and manuals (Section 2), and an extended general-interest text (Section 3)."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
              <Clock className="w-3.5 h-3.5 text-[#25A995]" />
              <span>60 minutes</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
              <Target className="w-3.5 h-3.5 text-[#25A995]" />
              <span>{isAcademic ? "40 questions · 3 passages" : "40 questions · 3 sections"}</span>
            </div>
          </div>
        </div>

        {/* Hero Actions: Direct Launch CTAs */}
        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setLabOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#25A995]/20 transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Starter Reading Diagnostic (4 Questions)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <a
            href="#types-heading"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] text-[#123C3A] dark:text-[#F4FAF8] text-xs sm:text-sm font-bold transition-all duration-200"
          >
            <BookOpen className="w-4 h-4 text-[#25A995]" />
            <span>Explore 14 Question Formats</span>
          </a>
        </div>
      </section>

      {/* Explicit Cross-Training Notification (Requirement 4) */}
      {profile.testType !== stream && (
        <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Cross-Training Session:</strong> You are currently viewing <strong>{isAcademic ? "Academic Reading" : "General Training Reading"}</strong>. Your primary profile track remains <strong>{profile.testType === "academic" ? "Academic" : "General Training"}</strong>. Any practice attempt submitted will be recorded under {isAcademic ? "Academic" : "General Training"}.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStream(profile.testType)}
            className="shrink-0 px-3 py-1 rounded-lg bg-white dark:bg-[#123C3A] border border-amber-300 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
          >
            Switch to Primary Track
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TWO-COLUMN GRID: Indicative Score Guide & Question Types Library */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Indicative Raw Score Guide (5 Columns on Desktop) */}
        <section
          aria-labelledby="score-guide-heading"
          className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#D4E8E3] dark:border-[#205653]">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#25A995]" />
              <div>
                <h3
                  id="score-guide-heading"
                  className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]"
                >
                  Indicative Raw Score Guide
                </h3>
                <p className="text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
                  {activeGuide.streamLabel} (Out of 40)
                </p>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995] font-extrabold text-xs">
              40 Marks Max
            </div>
          </div>

          {/* Student Target Band Highlight Card */}
          <div className="p-3.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#143E36] border border-[#BBF7D0] dark:border-[#1E5D51] flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-[#15803D] dark:text-[#5FE3D0] uppercase tracking-wider">
                Your Target Band
              </div>
              <div className="text-sm font-extrabold text-[#123C3A] dark:text-[#F4FAF8]">
                Band {profile.targetBand.toFixed(1)} Target Range:
              </div>
              <div className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">
                Typical target range: {targetBandTier.rawScoreRange} correct answers out of 40
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-[#25A995]">
                {targetBandTier.rawScoreRange}
              </div>
              <div className="text-[10px] text-[#3D6462] dark:text-[#A0C5C1]">
                correct answers out of 40
              </div>
            </div>
          </div>

          {/* Raw Score Conversion Table Ladder */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {activeGuide.tiers.map((tier) => {
              const isUserTarget = tier.band === profile.targetBand;
              return (
                <div
                  key={tier.band}
                  className={`p-2.5 rounded-xl border transition-colors flex items-center justify-between text-xs ${
                    isUserTarget
                      ? "bg-[#E8F7F4] dark:bg-[#174A48] border-[#25A995] font-bold"
                      : "bg-[#F9FCFB] dark:bg-[#174A48]/50 border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 py-0.5 text-center rounded-md bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] font-extrabold text-[#25A995]">
                      {tier.band.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] truncate max-w-[150px] sm:max-w-[180px]">
                      {tier.description.split(":")[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-extrabold text-[#123C3A] dark:text-[#F4FAF8]">
                      {tier.rawScoreRange}
                    </span>
                    <span className="text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                      / 40
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Test Pacing & Scoring Rules */}
          <div className="p-3.5 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48]/40 border border-[#D4E8E3] dark:border-[#205653] space-y-2 text-[11px]">
            <div className="font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#25A995]" />
              <span>Key Marking Principles</span>
            </div>
            <ul className="space-y-1 text-[#3D6462] dark:text-[#A0C5C1] list-disc list-inside">
              <li>1 mark awarded per correct answer; no negative marking.</li>
              <li>Spelling and grammatical word count rules are strictly enforced.</li>
              <li>{isAcademic ? "Recommended pacing: 20 minutes per passage." : "Recommended pacing: 15m (Sec 1), 20m (Sec 2), 25m (Sec 3)."}</li>
            </ul>
          </div>

          {/* Critical Scoring Disclosure */}
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{activeGuide.disclaimer}</span>
          </div>
        </section>

        {/* RIGHT COLUMN: 14 Essential Question Types & Strategy Library (7 Columns) */}
        <section
          aria-labelledby="types-heading"
          className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D4E8E3] dark:border-[#205653]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#25A995]" />
              <div>
                <h3
                  id="types-heading"
                  className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]"
                >
                  Essential Question Types & Strategies
                </h3>
                <p className="text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
                  14 Official IELTS Reading Formats with Verified Strategies
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#67839A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search types..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8] placeholder-[#67839A] focus:outline-none focus:border-[#25A995]"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: "All Formats (14)" },
              { id: "verification", label: "Verification" },
              { id: "matching", label: "Matching" },
              { id: "completion", label: "Completion" },
              { id: "choice", label: "Choice & Inquiry" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#123C3A] text-white dark:bg-[#F4FAF8] dark:text-[#123C3A] shadow-xs"
                    : "bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:border-[#25A995]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Question Type Cards Accordion */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredQuestionTypes.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] text-xs text-[#67839A]">
                No question types match your search query. Try another keyword.
              </div>
            ) : (
              filteredQuestionTypes.map((qt) => {
                const isExpanded = expandedTypeId === qt.id;
                return (
                  <div
                    key={qt.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? "bg-white dark:bg-[#123C3A] border-[#25A995] shadow-sm"
                        : "bg-[#F9FCFB] dark:bg-[#174A48]/50 border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995]/60"
                    }`}
                  >
                    {/* Header Summary Row */}
                    <button
                      type="button"
                      onClick={() => setExpandedTypeId(isExpanded ? null : qt.id)}
                      className="w-full p-4 flex items-center justify-between text-left gap-3 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              qt.category === "Verification"
                                ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                : qt.category === "Matching"
                                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                : qt.category === "Completion"
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            }`}
                          >
                            {qt.category}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F4FAF8] dark:bg-[#174A48] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653]">
                            {qt.statusTier === "passage_lab" ? "Passage Lab & Drill" : "Micro-Drill & Guide"}
                          </span>
                          <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                            {qt.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#67839A] dark:text-[#A0C5C1] leading-relaxed">
                          {qt.shortExplanation}
                        </p>
                      </div>

                      <div className="shrink-0 p-1 rounded-lg bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653]">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#25A995]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#67839A]" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-[#D4E8E3] dark:border-[#205653] space-y-3.5 text-xs animate-fadeIn">
                        {/* Format Honesty Disclosure */}
                        {qt.formatHonestyNotice && (
                          <div className="p-2.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50 flex items-start gap-2 text-[10px] text-sky-800 dark:text-sky-300 leading-relaxed">
                            <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                            <span><strong>Delivery Scope:</strong> {qt.formatHonestyNotice}</span>
                          </div>
                        )}

                        {/* Strategy Box */}
                        <div className="p-3.5 rounded-xl bg-[#E8F7F4]/60 dark:bg-[#174A48] border border-[#25A995]/30 space-y-1.5">
                          <div className="font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#25A995]" />
                            <span>Authoritative Strategy</span>
                          </div>
                          <p className="text-[11px] text-[#123C3A] dark:text-[#F4FAF8] whitespace-pre-line leading-relaxed">
                            {qt.strategy}
                          </p>
                        </div>

                        {/* Common Mistakes / Pitfalls */}
                        <div className="space-y-1.5">
                          <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Common Traps to Avoid</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-[#3D6462] dark:text-[#A0C5C1] list-disc list-inside">
                            {qt.commonMistakes.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Sample Question & Live Interactive Micro-Drill (Requirement 5) */}
                        <div className="p-4 rounded-xl bg-[#F4FAF8] dark:bg-[#0D2D2C] border border-[#D4E8E3] dark:border-[#205653] space-y-3">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#25A995]" />
                              <span>Interactive Sample Drill</span>
                            </span>
                            {qt.wordLimitRule && (
                              <span className="text-[10px] font-mono text-[#25A995] bg-[#E8F7F4] dark:bg-[#174A48] px-2 py-0.5 rounded-md">
                                {qt.wordLimitRule}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] italic text-[#67839A] dark:text-[#A0C5C1] border-l-2 border-[#25A995] pl-2.5">
                            &quot;{qt.sampleQuestion.passageExcerpt}&quot;
                          </div>

                          <div className="text-[11px] font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                            Q: {qt.sampleQuestion.prompt}
                          </div>

                          {/* Interactive Input: Options vs Text Field */}
                          {qt.sampleQuestion.options && qt.sampleQuestion.options.length > 0 ? (
                            <div className="space-y-1.5 pt-1">
                              {qt.sampleQuestion.options.map((opt) => {
                                const isSelected = (cardAnswers[qt.id] || "") === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() =>
                                      setCardAnswers((prev) => ({ ...prev, [qt.id]: opt }))
                                    }
                                    className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between border cursor-pointer ${
                                      isSelected
                                        ? "bg-[#E8F7F4] dark:bg-[#174A48] border-[#25A995] font-bold text-[#123C3A] dark:text-[#F4FAF8]"
                                        : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:border-[#25A995]/50"
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-[#25A995]" />}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="pt-1">
                              <input
                                type="text"
                                value={cardAnswers[qt.id] || ""}
                                onChange={(e) =>
                                  setCardAnswers((prev) => ({
                                    ...prev,
                                    [qt.id]: e.target.value,
                                  }))
                                }
                                placeholder={qt.wordLimitRule || "Type your extracted answer here..."}
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8] placeholder-[#67839A] focus:outline-none focus:border-[#25A995]"
                              />
                            </div>
                          )}

                          {/* Evaluation Result Banner */}
                          {cardEvaluations[qt.id] && (
                            <div
                              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 animate-fadeIn ${
                                cardEvaluations[qt.id].isCorrect
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                {cardEvaluations[qt.id].isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                                )}
                                <span>{cardEvaluations[qt.id].statusMessage}</span>
                              </div>
                              <span className="text-[10px] uppercase font-bold">
                                {cardEvaluations[qt.id].isCorrect ? "1/1 Mark" : "0/1 Mark"}
                              </span>
                            </div>
                          )}

                          {/* Revealed Explanation & Evidence */}
                          {cardRevealed[qt.id] && (
                            <div className="p-3 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] space-y-1.5 text-[11px] animate-fadeIn">
                              <div>
                                <strong className="text-[#25A995]">Passage Evidence: </strong>
                                <span className="text-[#3D6462] dark:text-[#A0C5C1]">
                                  {qt.sampleQuestion.evidenceText}
                                </span>
                              </div>
                              <div>
                                <strong className="text-[#123C3A] dark:text-[#F4FAF8]">
                                  Explanation:{" "}
                                </strong>
                                <span className="text-[#3D6462] dark:text-[#A0C5C1]">
                                  {qt.sampleQuestion.explanation}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#67839A] dark:text-[#A0C5C1] pt-0.5">
                                Official Answer:{" "}
                                <strong className="text-[#123C3A] dark:text-[#F4FAF8]">
                                  {qt.sampleQuestion.correctAnswer}
                                </strong>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const ans = cardAnswers[qt.id] || "";
                                  const val = validateReadingAnswer(ans, {
                                    correctAnswer: qt.sampleQuestion.correctAnswer,
                                    maxWords: qt.wordLimitRule?.includes("ONE WORD")
                                      ? 1
                                      : qt.wordLimitRule?.includes("TWO WORDS")
                                      ? 2
                                      : undefined,
                                    typeId: qt.id,
                                  });
                                  setCardEvaluations((prev) => ({ ...prev, [qt.id]: val }));
                                  setCardRevealed((prev) => ({ ...prev, [qt.id]: true }));
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25A995] text-white font-bold text-[11px] hover:bg-[#123C3A] transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Check Answer</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setCardRevealed((prev) => ({
                                    ...prev,
                                    [qt.id]: !prev[qt.id],
                                  }));
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-[#D4E8E3] dark:border-[#205653] text-[11px] font-semibold text-[#67839A] hover:bg-white dark:hover:bg-[#123C3A] transition-colors cursor-pointer"
                              >
                                {cardRevealed[qt.id] ? "Hide Details" : "Reveal Answer"}
                              </button>

                              {(cardAnswers[qt.id] || cardEvaluations[qt.id]) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCardAnswers((prev) => {
                                      const next = { ...prev };
                                      delete next[qt.id];
                                      return next;
                                    });
                                    setCardEvaluations((prev) => {
                                      const next = { ...prev };
                                      delete next[qt.id];
                                      return next;
                                    });
                                    setCardRevealed((prev) => ({
                                      ...prev,
                                      [qt.id]: false,
                                    }));
                                  }}
                                  className="text-[11px] text-[#67839A] hover:text-rose-600 transition-colors cursor-pointer"
                                >
                                  Reset
                                </button>
                              )}
                            </div>

                            <Link
                              href="/notebook"
                              className="text-[11px] font-semibold text-[#25A995] hover:underline"
                            >
                              Review in Notebook
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 3. THREE PRACTICE MODES CARDS */}
      {/* ========================================================================= */}
      <section className="space-y-4" aria-labelledby="modes-heading">
        <h3
          id="modes-heading"
          className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
        >
          Three Structured Practice Modes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mode 1: Guided Learning Mode */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#25A995]/60 transition-all">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995] text-[10px] font-extrabold uppercase">
                Untimed · Step-by-Step
              </div>
              <h4 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                Learning Mode
              </h4>
              <p className="text-xs text-[#67839A] dark:text-[#A0C5C1] leading-relaxed">
                Learn specific question formats with on-demand strategy hints, immediate feedback, and paragraph evidence highlighting.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLabOpen(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25A995] text-white text-xs font-bold hover:bg-[#123C3A] transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Learning Mode Drill</span>
            </button>
          </div>

          {/* Mode 2: Timed Practice Mode */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#25A995]/60 transition-all">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-extrabold uppercase">
                20-Minute Section Drill
              </div>
              <h4 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                Timed Practice Mode
              </h4>
              <p className="text-xs text-[#67839A] dark:text-[#A0C5C1] leading-relaxed">
                Build pacing and speed under realistic 20-minute countdown constraints. Test paragraph scanning and answer verification.
              </p>
            </div>
            <Link
              href={`/practice?lab=reading&type=${stream}&mode=timed`}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] text-[#123C3A] dark:text-[#F4FAF8] text-xs font-bold transition-colors"
            >
              <Clock className="w-4 h-4 text-[#25A995]" />
              <span>Launch 20m Timed Practice</span>
            </Link>
          </div>

          {/* Mode 3: Full Reading Simulation (Content Gated) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#25A995]/60 transition-all">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-extrabold uppercase">
                Content Gated · 40 Questions Required
              </div>
              <h4 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                Full Reading Simulation
              </h4>
              <p className="text-xs text-[#67839A] dark:text-[#A0C5C1] leading-relaxed">
                Full 60-minute simulation requires strictly 40 distinct scoreable questions (currently 4 diagnostic items available). Complete 40-question mock exams are currently being authored according to official Cambridge specifications.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLabOpen(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] text-[#123C3A] dark:text-[#F4FAF8] text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#25A995]" />
              <span>Launch 4-Question Starter Diagnostic</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. LEARNER PROGRESS & PREVIOUS ATTEMPTS TABLE (REAL DATA ONLY) */}
      {/* ========================================================================= */}
      <section className="space-y-4" aria-labelledby="history-heading">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3
              id="history-heading"
              className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]"
            >
              Your Reading Practice History
            </h3>
            <p className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
              Authoritative attempts recorded from Practice Hub and Mock Centre
            </p>
          </div>

          <Link
            href="/results"
            className="text-xs font-bold text-[#25A995] hover:underline flex items-center gap-1"
          >
            <span>All Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {readingAttempts.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] space-y-3">
            <BookOpen className="w-8 h-8 text-[#25A995] mx-auto opacity-80" />
            <h4 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              No Reading Practice Attempts Recorded Yet
            </h4>
            <p className="text-xs text-[#67839A] dark:text-[#A0C5C1] max-w-md mx-auto leading-relaxed">
              Diagnostic Starter Recommendation: Launch your first 20-minute {isAcademic ? "Academic" : "General Training"} Reading Lab drill to establish your baseline score and identify specific question type growth areas.
            </p>
            <button
              type="button"
              onClick={() => setLabOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25A995] text-white text-xs font-bold hover:bg-[#123C3A] transition-colors cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Take Starter Reading Diagnostic</span>
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] overflow-hidden shadow-xs divide-y divide-[#D4E8E3] dark:divide-[#205653]">
            {readingAttempts.map((att) => (
              <div
                key={att.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F4FAF8]/50 dark:hover:bg-[#174A48]/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    {att.examTitle}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#67839A] dark:text-[#A0C5C1]">
                    <span>Date: {new Date(att.startedAt).toLocaleDateString()}</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-[#F4FAF8] dark:bg-[#174A48] text-[#123C3A] dark:text-[#F4FAF8]">
                      Status: {att.status}
                    </span>
                    {att.assessmentType === "diagnostic" || (att.maxScore && att.maxScore < 40) ? (
                      <span className="font-semibold text-amber-700 dark:text-amber-300">
                        Diagnostic: {att.rawScore ?? att.readingScore ?? 0} / {att.maxScore ?? 4} ({att.accuracy ?? 100}%) · Band — (Diagnostic Only)
                      </span>
                    ) : att.readingScore !== null ? (
                      <span className="font-semibold text-[#25A995]">
                        Reading Band: {att.readingScore.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {att.assessmentType !== "diagnostic" && att.overallBand !== null && (
                    <div className="text-right">
                      <div className="text-base font-extrabold text-[#25A995]">
                        Band {att.overallBand.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                        Overall Test
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/results/${att.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#25A995] transition-colors"
                  >
                    View Diagnostics
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE TWO-PANE PRACTICE LAB MODAL */}
      {/* ========================================================================= */}
      {labOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between gap-4 bg-[#F9FCFB] dark:bg-[#0E2F2D]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#25A995] text-white">
                    {isAcademic ? "Academic Reading Lab" : "General Training Reading Lab"}
                  </span>
                  <span className="text-xs font-semibold text-[#67839A] dark:text-[#A0C5C1]">
                    Guided Learning Drill
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {activePassage.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLabOpen(false);
                  setLabSubmitted(false);
                  setEvaluation(null);
                }}
                className="p-2 rounded-xl text-[#67839A] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48] text-xs font-bold cursor-pointer"
              >
                Close Lab ✕
              </button>
            </div>

            {/* Split Screen 2-Pane Content */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#D4E8E3] dark:divide-[#205653] overflow-y-auto">
              {/* LEFT PANE: Passage Text with Paragraph Labels */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[60vh] md:max-h-none scrollbar-thin">
                <div className="flex items-center justify-between text-xs text-[#67839A] dark:text-[#A0C5C1] pb-2 border-b border-[#D4E8E3] dark:border-[#205653]">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-[#25A995]">
                    Reading Passage
                  </span>
                  <span>Estimated: {activePassage.estimatedMinutes} mins</span>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] leading-relaxed">
                  {activePassage.paragraphs.map((para) => (
                    <div
                      key={para.label}
                      id={`para-${para.label}`}
                      className="p-3.5 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48]/40 border border-[#D4E8E3] dark:border-[#205653] space-y-1.5"
                    >
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#25A995]/15 text-[#25A995] font-extrabold text-xs">
                        {para.label}
                      </span>
                      <p className="whitespace-pre-line">{para.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT PANE: Interactive Question Answering & Review */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 max-h-[60vh] md:max-h-none scrollbar-thin">
                <div className="flex items-center justify-between text-xs text-[#67839A] dark:text-[#A0C5C1] pb-2 border-b border-[#D4E8E3] dark:border-[#205653]">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-[#25A995]">
                    Question Set ({activePassage.questions.length} Items)
                  </span>
                  {labSubmitted && evaluation && (
                    <span className="font-extrabold text-[#25A995]">
                      Score: {evaluation.score} / {evaluation.total} ({evaluation.estimatedBand !== null ? `Band ${evaluation.estimatedBand.toFixed(1)}` : "Diagnostic —"})
                    </span>
                  )}
                </div>

                {/* Question List */}
                <div className="space-y-4">
                  {activePassage.questions.map((q) => {
                    const currentVal = labAnswers[q.id] || "";
                    const evalItem = evaluation?.questionResults.find((r) => r.questionId === q.id);
                    const isMistakeSaved = savedMistakes.has(q.id);

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border transition-colors space-y-3 ${
                          labSubmitted && evalItem
                            ? evalItem.isCorrect
                              ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                              : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
                            : "bg-[#F9FCFB] dark:bg-[#174A48]/40 border-[#D4E8E3] dark:border-[#205653]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#25A995] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {q.number}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase text-[#67839A] dark:text-[#A0C5C1]">
                              {q.type}
                            </span>
                          </div>

                          {labSubmitted && evalItem && (
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                evalItem.isCorrect
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                              }`}
                            >
                              {evalItem.isCorrect ? "Correct ✓" : "Incorrect ✗"}
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                          {q.prompt}
                        </p>

                        {/* Input Controls */}
                        {q.options && q.options.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {q.options.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                disabled={labSubmitted}
                                onClick={() => setLabAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  currentVal === opt
                                    ? "bg-[#25A995] text-white shadow-xs"
                                    : "bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#25A995]"
                                } disabled:cursor-not-allowed`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <input
                            type="text"
                            disabled={labSubmitted}
                            value={currentVal}
                            onChange={(e) =>
                              setLabAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                            placeholder="Type your answer..."
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995] disabled:cursor-not-allowed"
                          />
                        )}

                        {/* Submitted Evaluation Breakdown */}
                        {labSubmitted && evalItem && (
                          <div className="p-3 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] space-y-1.5 text-xs">
                            <div className="text-[11px] font-bold text-[#25A995]">
                              Correct Answer: {q.correctAnswer}
                            </div>
                            <div className="text-[11px] text-[#67839A] dark:text-[#A0C5C1]">
                              Evidence ({q.evidenceParagraph}): {q.evidenceText}
                            </div>
                            <div className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">
                              Explanation: {q.explanation}
                            </div>

                            {!evalItem.isCorrect && (
                              <div className="pt-2 flex items-center justify-between">
                                <button
                                  type="button"
                                  disabled={isMistakeSaved || savingMistakeId === q.id}
                                  onClick={() => handleSaveMistake(q, currentVal)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold hover:bg-amber-100 transition-colors disabled:opacity-60 cursor-pointer"
                                >
                                  <Bookmark className="w-3 h-3" />
                                  <span>
                                    {isMistakeSaved
                                      ? "Saved to Mistake Notebook ✓"
                                      : savingMistakeId === q.id
                                      ? "Saving..."
                                      : "Save to Mistake Notebook"}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between gap-3">
                  {labSubmitted ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLabSubmitted(false);
                        setLabAnswers({});
                        setEvaluation(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D4E8E3] dark:border-[#205653] text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] hover:bg-[#F4FAF8] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#25A995]" />
                      <span>Retake Drill</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={evaluating}
                      onClick={handleSubmitLab}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25A995] text-white text-xs font-bold hover:bg-[#123C3A] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {evaluating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Checking Answers...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit & Verify Answers</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

