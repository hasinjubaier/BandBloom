"use client";

import React from "react";
import { Award } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTargetBand } from "@/hooks/useTargetBand";

export function GoalBandSelector() {
  const { t } = useLanguage();
  const { selectedTargetBand, availableBands, selectBand } = useTargetBand();

  return (
    <div className="w-full">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#25A995]/10 dark:bg-[#25A995]/20 flex items-center justify-center text-[#25A995] shrink-0">
            <Award className="w-5 h-5 text-[#25A995]" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h2 className="text-sm sm:text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              {t.hero.targetHeading}
            </h2>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              {t.hero.targetDesc}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 flex-wrap justify-center sm:justify-end w-full md:w-auto"
          role="group"
          aria-label={t.hero.targetHeading}
        >
          {availableBands.map((band) => {
            const isSelected = selectedTargetBand === band;
            return (
              <button
                key={band}
                type="button"
                onClick={() => selectBand(band)}
                aria-pressed={isSelected}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#25A995] text-white shadow-md shadow-[#25A995]/30 scale-105"
                    : "text-[#3D6462] hover:text-[#123C3A] hover:bg-[#F4FAF8] dark:text-[#A0C5C1] dark:hover:text-[#F4FAF8] dark:hover:bg-[#0A1C1B]"
                }`}
              >
                Band {band.toFixed(1)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

