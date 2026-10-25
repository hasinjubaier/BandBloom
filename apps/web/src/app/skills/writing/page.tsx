"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Award,
  ChevronDown,
  Layers,
  HelpCircle,
} from "lucide-react";
import { MOCK_WRITING_TASK2 } from "@/data/mockCurriculum";
import { useLanguage } from "@/context/LanguageContext";

export default function WritingLabPage() {
  const { language } = useLanguage();
  const [activeTask, setActiveTask] = useState<"task1" | "task2">("task2");
  const [essayText, setEssayText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"editor" | "model" | "diff">("editor");

  const minWords = activeTask === "task1" ? 150 : 250;

  useEffect(() => {
    const trimmed = essayText.trim();
    if (!trimmed) {
      setWordCount(0);
    } else {
      const words = trimmed.split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    }
  }, [essayText]);

  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluationResult({
        estimatedBand: 7.5,
        criteria: {
          taskResponse: {
            score: 7.5,
            title: "Task Achievement / Response",
            feedback: "Addresses both viewpoints with developed supporting ideas. Position is clear throughout.",
          },
          coherenceCohesion: {
            score: 7.5,
            title: "Coherence & Cohesion",
            feedback: "Information and arguments are logically sequenced with clear paragraph progression.",
          },
          lexicalResource: {
            score: 7.0,
            title: "Lexical Resource",
            feedback: "Demonstrates good range of academic vocabulary with some flexibility and precise word choice.",
          },
          grammaticalRange: {
            score: 7.5,
            title: "Grammatical Range & Accuracy",
            feedback: "Uses a mix of simple and complex sentence forms with frequent error-free sentences.",
          },
        },
      });
    }, 1500);
  };

  const handleLoadSampleDraft = () => {
    setEssayText(
      "In the modern era, the purpose of higher education is subject to intense debate. Some individuals assert that universities should solely equip graduates with specific skills required for their occupations, while others argue that the core objective should be broader intellectual enlightenment. In this essay, I will explore both perspectives and explain why a balanced curriculum is optimal.\n\nOn the one hand, specialized career training guarantees that students gain direct value from their academic investment. As university tuition rises globally, parents and students reasonably expect degrees to translate directly into high-paying employment. For instance, in technical professions such as civil engineering, immediate mastery of computational tools and building regulations is essential. Consequently, prioritizing employability prevents skills mismatches in competitive economies.\n\nOn the other hand, focusing entirely on narrow occupational tasks overlooks the rapid evolution of global industries. If a student is merely trained for one specific role, technological disruption can render their competencies obsolete within a decade. Conversely, cultivating intellectual adaptability, analytical reading, and philosophical reasoning ensures that graduates can pivot across multiple sectors throughout their professional journeys.\n\nIn conclusion, while practical vocational proficiencies are indispensable, higher education should not become a mere trade academy. The most effective tertiary institutions combine technical preparation with expansive intellectual inquiry."
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4E8E3] dark:border-[#205653]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF8A65] mb-1">
            <FileText className="w-4 h-4" />
            <span>IELTS Writing Evaluation Lab</span>
            <span className="text-[#3D6462] dark:text-[#A0C5C1]">•</span>
            <span>Criterion Rubric Analysis</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
            Computer-Delivered Essay Editor & AI Diagnostic
          </h1>
        </div>

        {/* Task toggle */}
        <div className="flex items-center bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] p-1 rounded-xl text-xs">
          <button
            onClick={() => {
              setActiveTask("task1");
              setEvaluationResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTask === "task1" ? "bg-[#25A995] text-white shadow-md shadow-[#25A995]/25" : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
            }`}
          >
            Task 1 (min 150w)
          </button>
          <button
            onClick={() => {
              setActiveTask("task2");
              setEvaluationResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTask === "task2" ? "bg-[#25A995] text-white shadow-md shadow-[#25A995]/25" : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
            }`}
          >
            Task 2 (min 250w)
          </button>
        </div>
      </div>

      {/* Main Grid: Prompt + Editor (Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Task Prompt & Instructions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#3D6462] dark:text-[#A0C5C1] pb-3 border-b border-[#D4E8E3] dark:border-[#205653]">
              <span className="font-bold uppercase tracking-wider text-[#FF8A65]">
                {activeTask === "task1" ? "Academic Task 1 Prompt" : "Task 2 Essay Prompt"}
              </span>
              <span className="flex items-center gap-1 text-[#3D6462] dark:text-[#A0C5C1]">
                <Clock className="w-3.5 h-3.5" />
                {activeTask === "task1" ? "20 minutes" : "40 minutes"}
              </span>
            </div>

            <div className="text-sm font-medium text-[#123C3A] dark:text-[#F4FAF8] leading-relaxed">
              {activeTask === "task2" ? (
                MOCK_WRITING_TASK2.prompt
              ) : (
                "The chart below illustrates global renewable energy production across solar, wind, and hydroelectric sources between 2010 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
              )}
            </div>

            <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border border-[#D4E8E3] dark:border-[#205653] p-3.5 rounded-xl space-y-2 text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              <div className="flex justify-between items-center text-[#123C3A] dark:text-[#F4FAF8]">
                <span>Minimum Word Requirement:</span>
                <strong className="text-[#FF8A65] font-bold">{minWords} words</strong>
              </div>
              <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">
                In official IELTS marking, essays below {minWords} words receive penalties in Task Achievement / Task Response.
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleLoadSampleDraft}
                className="w-full py-2 px-3 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] hover:bg-[#D4E8E3]/50 dark:hover:bg-[#205653] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Load Sample Candidate Draft</span>
              </button>
            </div>
          </div>

          {/* Model Band 8.5 Toggle Card */}
          <div className="bg-white dark:bg-[#123C3A] p-5 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#25A995]" />
                <h4 className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">Band 8.5+ Benchmark Model</h4>
              </div>
              <button
                onClick={() => setViewMode(viewMode === "model" ? "editor" : "model")}
                className="text-xs text-[#25A995] hover:text-[#1D8B7A] font-semibold"
              >
                {viewMode === "model" ? "Close Benchmark" : "View Benchmark"}
              </button>
            </div>

            {viewMode === "model" && (
              <div className="text-xs text-[#123C3A] dark:text-[#F4FAF8] bg-[#F4FAF8] dark:bg-[#0A1C1B]/90 p-4 rounded-xl border border-[#D4E8E3] dark:border-[#205653] space-y-3 leading-relaxed max-h-[300px] overflow-y-auto">
                <p className="font-semibold text-[#25A995] text-[11px]">
                  Teacher's Note: Notice the deliberate paragraph transitions and absence of generic template cliches.
                </p>
                <div className="whitespace-pre-line">{MOCK_WRITING_TASK2.modelEssay}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Writing Editor & Word Counter (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#123C3A] rounded-2xl border border-[#D4E8E3] dark:border-[#205653] overflow-hidden flex flex-col shadow-sm">
            {/* Editor Toolbar */}
            <div className="p-3 bg-[#F4FAF8] dark:bg-[#0A1C1B] border-b border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[#3D6462] dark:text-[#A0C5C1]">Status:</span>
                <span className="text-[#25A995] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25A995]" />
                  Auto-saved
                </span>
              </div>

              {/* Real-time word counter */}
              <div className="flex items-center gap-2">
                <span className="text-[#3D6462] dark:text-[#A0C5C1]">Word Count:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${
                    wordCount >= minWords
                      ? "bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20"
                      : "bg-[#FFF6F3] text-[#FF8A65] border border-[#FF8A65]/30 dark:bg-[#FF8A65]/20"
                  }`}
                >
                  {wordCount} / {minWords}
                </span>
              </div>
            </div>

            {/* Editor Area */}
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Write your response here. Keyboard shortcuts and plain text formatting match the authentic computer-delivered IELTS exam..."
              className="w-full h-80 p-5 bg-white dark:bg-[#0A1C1B]/80 text-[#123C3A] dark:text-[#F4FAF8] text-sm leading-relaxed resize-none focus:outline-none placeholder:text-[#3D6462]/50"
            />

            {/* Bottom Action Strip */}
            <div className="p-4 bg-[#F4FAF8] dark:bg-[#0A1C1B] border-t border-[#D4E8E3] dark:border-[#205653] flex flex-col sm:flex-row items-center justify-between gap-3">
              {wordCount < minWords && (
                <div className="flex items-center gap-1.5 text-xs text-[#FF8A65]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {minWords - wordCount} more words required to reach minimum length.
                  </span>
                </div>
              )}

              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || wordCount === 0}
                className="w-full sm:w-auto ml-auto px-6 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-[#25A995]/25 transition-all flex items-center justify-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing Rubrics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Generate AI Rubric Feedback</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Rubric Evaluation Output Card */}
          {evaluationResult && (
            <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#25A995]/40 space-y-5 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-[#D4E8E3] dark:border-[#205653]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#25A995] tracking-wider">
                    Diagnostic AI Assessment
                  </span>
                  <h3 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-2">
                    <span>Estimated Band {evaluationResult.estimatedBand.toFixed(1)}</span>
                  </h3>
                </div>
                <span className="text-[11px] bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] px-2.5 py-1 rounded-full">
                  Practice Estimate • Unofficial
                </span>
              </div>

              {/* 4 Criteria Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(evaluationResult.criteria).map(([key, val]: [string, any]) => (
                  <div key={key} className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border border-[#D4E8E3] dark:border-[#205653] p-4 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8]">{val.title}</span>
                      <span className="font-extrabold text-[#25A995]">Band {val.score.toFixed(1)}</span>
                    </div>
                    <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                      {val.feedback}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] bg-[#F4FAF8] dark:bg-[#0A1C1B]/60 p-3 rounded-xl border border-[#D4E8E3] dark:border-[#205653]">
                <strong className="text-[#123C3A] dark:text-[#F4FAF8]">Scoring Safeguard:</strong> This evaluation is grounded in official IELTS descriptor rules. Revision and comparison with the benchmark response are advised before your next mock attempt.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
