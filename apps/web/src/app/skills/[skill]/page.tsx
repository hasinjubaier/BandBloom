"use client";

import React, { use, Suspense } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  ArrowRight,
  Target,
  Clock,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  Award,
} from "lucide-react";

interface SkillInfo {
  name: string;
  badge: string;
  duration: string;
  questionsCount: string;
  description: string;
  criteria: string[];
  questionTypes: { type: string; tip: string }[];
  practiceExamId: string;
}

const SKILL_DATA: Record<string, SkillInfo> = {
  reading: {
    name: "IELTS Reading",
    badge: "Academic & General",
    duration: "60 minutes",
    questionsCount: "40 questions (3 passages)",
    description:
      "Assesses skimming, scanning, reading for detail, understanding logical argument, and recognizing writers' opinions and purpose.",
    criteria: [
      "Band 7.0 requires 30-32 correct answers out of 40",
      "Band 8.0 requires 35-36 correct answers out of 40",
      "Band 9.0 requires 39-40 correct answers out of 40",
    ],
    questionTypes: [
      {
        type: "True / False / Not Given",
        tip: "False means the passage directly contradicts the claim; Not Given means insufficient information exists.",
      },
      {
        type: "Matching Headings",
        tip: "Skim the first and last sentences of each paragraph to identify central themes before matching.",
      },
      {
        type: "Summary Completion",
        tip: "Adhere strictly to the word count limit specified (e.g., 'NO MORE THAN TWO WORDS').",
      },
      {
        type: "Multiple Choice",
        tip: "Eliminate distractor options containing universal quantifiers like 'all' or 'never' unless verified.",
      },
    ],
    practiceExamId: "99999999-9999-9999-9999-999999999991",
  },
  listening: {
    name: "IELTS Listening",
    badge: "Computer-Delivered Standard",
    duration: "30 minutes (+2 min review)",
    questionsCount: "40 questions (4 parts)",
    description:
      "Evaluates your ability to understand main ideas and detailed factual information, recognize the opinions and attitudes of speakers, and follow the development of an argument.",
    criteria: [
      "Audio is played ONCE only as per standard test design",
      "Band 7.0: 30-31 correct answers",
      "Band 8.0: 35-36 correct answers",
    ],
    questionTypes: [
      {
        type: "Form / Note Completion",
        tip: "Check spelling and numerical values carefully (e.g. postal codes, telephone numbers).",
      },
      {
        type: "Plan / Map / Diagram Labelling",
        tip: "Orient yourself to the compass directions (North, South) or starting landmark before listening.",
      },
      {
        type: "Multiple Choice",
        tip: "Read questions during the 30-second silence preview to predict incoming information.",
      },
      {
        type: "Short Answer Questions",
        tip: "Keep answers grammatically coherent with the question stem.",
      },
    ],
    practiceExamId: "99999999-9999-9999-9999-999999999991",
  },
  writing: {
    name: "IELTS Writing",
    badge: "Task 1 & Task 2",
    duration: "60 minutes",
    questionsCount: "2 tasks (min 150 & 250 words)",
    description:
      "Task 1 describes visual data (graph, table, chart, diagram) or a letter. Task 2 requires a discursive essay in response to a point of view, argument, or problem.",
    criteria: [
      "Task Response (25%): Fully addressing all parts of the prompt",
      "Coherence & Cohesion (25%): Logical paragraphing and cohesive transitions",
      "Lexical Resource (25%): Academic vocabulary with appropriate collocations",
      "Grammatical Range & Accuracy (25%): Complex sentences with error-free control",
    ],
    questionTypes: [
      {
        type: "Task 1 Visual Data Synthesis",
        tip: "Select key features, make comparisons, and always write a clear overview paragraph without giving opinions.",
      },
      {
        type: "Task 2 Discuss Both Views",
        tip: "Give balanced weight to both perspectives before clearly asserting your personal stance.",
      },
      {
        type: "Task 2 Agree or Disagree",
        tip: "Formulate a strong thesis statement in the introduction and support each body paragraph with distinct examples.",
      },
      {
        type: "Task 2 Problem and Solution",
        tip: "Ensure proposed solutions directly resolve the specific causes identified in the problem paragraph.",
      },
    ],
    practiceExamId: "99999999-9999-9999-9999-999999999991",
  },
  speaking: {
    name: "IELTS Speaking",
    badge: "Parts 1, 2, and 3",
    duration: "11-14 minutes",
    questionsCount: "3 interactive parts",
    description:
      "Measures candidate fluency, lexical resource, grammatical accuracy, and pronunciation through an interactive speaking interview.",
    criteria: [
      "Fluency and Coherence (25%): Continuous speech without unnatural pauses",
      "Lexical Resource (25%): Varied vocabulary, idioms, and natural paraphrasing",
      "Grammatical Range and Accuracy (25%): Complex clause structures with accurate tenses",
      "Pronunciation (25%): Intonation, rhythm, word stress, and individual phoneme clarity",
    ],
    questionTypes: [
      {
        type: "Part 1 Introduction & Familiar Topics",
        tip: "Provide 2-3 sentence answers with an explanation or reason rather than simple 'yes' or 'no'.",
      },
      {
        type: "Part 2 The Long Turn (Cue Card)",
        tip: "Utilize your 1 minute of preparation to write keywords covering all 4 bullet points.",
      },
      {
        type: "Part 3 Two-Way Discussion",
        tip: "Expand answers into abstract societal considerations rather than personal anecdotes.",
      },
    ],
    practiceExamId: "99999999-9999-9999-9999-999999999991",
  },
};

function SkillModuleContent({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = use(params);
  const normalizedSkill = skill.toLowerCase();
  const info = SKILL_DATA[normalizedSkill] || SKILL_DATA["reading"];

  const getSkillIcon = () => {
    switch (normalizedSkill) {
      case "listening":
        return <Headphones className="w-6 h-6 text-sky-600" />;
      case "writing":
        return <Edit3 className="w-6 h-6 text-amber-600" />;
      case "speaking":
        return <Mic className="w-6 h-6 text-indigo-600" />;
      default:
        return <BookOpen className="w-6 h-6 text-[#25A995]" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Skill Hero Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
            {getSkillIcon()}
            <span>{info.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            {info.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] max-w-xl leading-relaxed">
            {info.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
              <Clock className="w-3.5 h-3.5 text-[#25A995]" />
              <span>{info.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
              <Target className="w-3.5 h-3.5 text-[#25A995]" />
              <span>{info.questionsCount}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <Link
            href={`/mock-centre/exam?id=${info.practiceExamId}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#25A995]/20 transition-all duration-200"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Launch Practice Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Two-Column Grid: Scoring Criteria & Question Type Strategies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scoring Criteria Card */}
        <section
          aria-labelledby="criteria-heading"
          className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#25A995]" />
            <h3
              id="criteria-heading"
              className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]"
            >
              Assessment Rubric & Band Standards
            </h3>
          </div>

          <div className="space-y-2.5">
            {info.criteria.map((c, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8] flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#25A995] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Question Type Strategies Card */}
        <section
          aria-labelledby="types-heading"
          className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#25A995]" />
            <h3
              id="types-heading"
              className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]"
            >
              Essential Question Types & Strategies
            </h3>
          </div>

          <div className="space-y-3">
            {info.questionTypes.map((qt, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] space-y-1"
              >
                <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  {qt.type}
                </div>
                <div className="text-[11px] text-[#67839A] dark:text-[#A0C5C1] leading-relaxed">
                  {qt.tip}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SkillModulePage(props: {
  params: Promise<{ skill: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#25A995] border-t-transparent animate-spin" />
        </div>
      }
    >
      <SkillModuleContent {...props} />
    </Suspense>
  );
}
