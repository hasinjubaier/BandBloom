"use client";

import React, { useState } from "react";
import {
  Bookmark,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Award,
  Volume2,
  BookOpen,
} from "lucide-react";
import { useExam } from "@/context/ExamContext";
import { useLanguage } from "@/context/LanguageContext";

export default function VocabularyPage() {
  const { language } = useLanguage();
  const { vocabulary, toggleVocabularyMastery } = useExam();
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20 dark:text-[#25A995] text-xs font-semibold">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Spaced Repetition Academic Lexicon</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            IELTS Academic Word & Collocation Bank
          </h1>
          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1]">
            High-yield collocations and academic vocabulary categorized for Lexical Resource (Band 7.5 - 9.0). Flip cards to test your recall.
          </p>
        </div>
      </div>

      {/* Flashcard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vocabulary.map((v) => {
          const isFlipped = flippedCards[v.id];

          return (
            <div
              key={v.id}
              className="bg-white dark:bg-[#123C3A] p-6 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] transition-all flex flex-col justify-between min-h-[300px] cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => toggleFlip(v.id)}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#D4E8E3] dark:border-[#205653] text-xs mb-4">
                  <span className="px-2 py-0.5 rounded font-bold bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20 dark:text-[#25A995] text-[10px]">
                    {v.bandLevel}
                  </span>
                  <span className="text-[#3D6462] dark:text-[#A0C5C1] text-[11px] capitalize">
                    {v.mastery}
                  </span>
                </div>

                {!isFlipped ? (
                  <div className="text-center py-6 space-y-3">
                    <h3 className="text-2xl font-black text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
                      {v.word}
                    </h3>
                    <span className="text-xs text-[#25A995] italic block">
                      ({v.partOfSpeech})
                    </span>
                    <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] pt-2">
                      Click to reveal definition & official collocations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs text-[#123C3A] dark:text-[#F4FAF8] animate-in fade-in duration-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#3D6462] dark:text-[#A0C5C1] block tracking-wider">
                        Definition:
                      </span>
                      <p className="font-medium text-[#123C3A] dark:text-[#F4FAF8]">{v.meaning}</p>
                    </div>

                    <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/90 p-3 rounded-xl border border-[#D4E8E3] dark:border-[#205653] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#25A995] block tracking-wider">
                        Key Collocation:
                      </span>
                      <p className="text-[#123C3A] dark:text-[#F4FAF8] font-semibold">{v.collocation}</p>
                    </div>

                    <div className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] italic">
                      "{v.exampleSentence}"
                    </div>
                  </div>
                )}
              </div>

              <div
                className="pt-4 border-t border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => toggleFlip(v.id)}
                  className="text-[#3D6462] hover:text-[#123C3A] dark:text-[#A0C5C1] dark:hover:text-[#F4FAF8] flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isFlipped ? "Flip Back" : "Flip Card"}</span>
                </button>

                <button
                  onClick={() => toggleVocabularyMastery(v.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                    v.mastery === "mastered"
                      ? "bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30 dark:bg-[#25A995]/20 dark:text-[#25A995]"
                      : "bg-[#F4FAF8] text-[#3D6462] border border-[#D4E8E3] hover:text-[#123C3A] dark:bg-[#0A1C1B] dark:text-[#A0C5C1] dark:hover:text-[#F4FAF8]"
                  }`}
                >
                  {v.mastery === "mastered" ? "Mastered" : "Advance Level"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
