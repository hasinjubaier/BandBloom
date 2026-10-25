"use client";

import React, { useState } from "react";
import { X, Calculator, HelpCircle, CheckCircle2 } from "lucide-react";
import { roundIELTSBand, useExam } from "@/context/ExamContext";
import { useLanguage } from "@/context/LanguageContext";

export interface ScoreCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreCalculatorModal: React.FC<ScoreCalculatorModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { updateProfile } = useExam();

  const [listening, setListening] = useState<number>(7.0);
  const [reading, setReading] = useState<number>(7.5);
  const [writing, setWriting] = useState<number>(6.5);
  const [speaking, setSpeaking] = useState<number>(7.0);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const rawAverage = (listening + reading + writing + speaking) / 4.0;
  const overallBand = roundIELTSBand(rawAverage);

  const handleSaveAsTarget = () => {
    updateProfile({ targetBand: overallBand });
    if (typeof window !== "undefined") {
      localStorage.setItem("bandbloom_target_band", String(overallBand));
      localStorage.setItem("bandbloom_has_chosen_goal", "true");
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calculator-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#123C3A]/60 dark:bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-[#123C3A] dark:text-[#F4FAF8] transition-colors duration-200">
        <button
          onClick={onClose}
          aria-label="Close calculator"
          className="absolute top-4 right-4 p-2 text-[#3D6462] hover:text-[#123C3A] rounded-lg hover:bg-[#F4FAF8] dark:text-[#A0C5C1] dark:hover:text-white dark:hover:bg-[#174A48] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-[#25A995] text-white shadow-md shadow-[#25A995]/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 id="calculator-modal-title" className="text-lg font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
              {language === "bn" ? "অফিসিয়াল IELTS ব্যান্ড ক্যালকুলেটর" : "Official IELTS Band Calculator"}
            </h3>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              {language === "bn"
                ? "অফিসিয়াল রাউন্ডিং নিয়ম (Section 5.3) অনুযায়ী হিসাবকৃত"
                : "Computed using official test rounding rules (Section 5.3)"}
            </p>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 mb-6">
          {[
            { label: language === "bn" ? "লিসেনিং (Listening)" : "Listening", val: listening, set: setListening, color: "text-[#25A995]" },
            { label: language === "bn" ? "রিডিং (Reading)" : "Reading", val: reading, set: setReading, color: "text-[#25A995]" },
            { label: language === "bn" ? "রাইটিং (Writing)" : "Writing", val: writing, set: setWriting, color: "text-[#FF8A65]" },
            { label: language === "bn" ? "স্পিকিং (Speaking)" : "Speaking", val: speaking, set: setSpeaking, color: "text-[#25A995]" },
          ].map((item) => (
            <div key={item.label} className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 p-3 rounded-xl border border-[#D4E8E3] dark:border-[#205653]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-[#123C3A] dark:text-[#F4FAF8]">{item.label}</span>
                <span className={`text-base font-bold ${item.color}`}>Band {item.val.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="9.0"
                step="0.5"
                value={item.val}
                aria-label={item.label}
                onChange={(e) => item.set(parseFloat(e.target.value))}
                className="w-full accent-[#25A995] cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Output Panel */}
        <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#25A995]/40 rounded-xl p-4 mb-5 text-center shadow-xs">
          <div className="text-xs uppercase tracking-wider text-[#3D6462] dark:text-[#25A995] font-semibold mb-1">
            {language === "bn" ? "হিসাবকৃত সার্বিক ব্যান্ড" : "Official Overall Band"}
          </div>
          <div className="text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight flex items-center justify-center gap-2">
            <span>
              Band {overallBand.toFixed(1)}
            </span>
          </div>
          <div className="mt-2 text-xs text-[#3D6462] dark:text-[#A0C5C1] flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#25A995]" />
            <span>
              {language === "bn"
                ? `গড় মান: ${rawAverage.toFixed(2)} → রাউন্ডিং নিয়ম অনুযায়ী ব্যান্ড ${overallBand.toFixed(1)}`
                : `Raw Average: ${rawAverage.toFixed(2)} → Rounded to Band ${overallBand.toFixed(1)}`}
            </span>
          </div>
        </div>

        {/* Rounding explanation */}
        <div className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] bg-white dark:bg-[#174A48]/60 p-3 rounded-lg border border-[#D4E8E3] dark:border-[#205653] mb-5">
          <strong className="text-[#25A995]">Official Rule:</strong> Averages ending in .25 round up to the next half band (6.25 → 6.5). Averages ending in .75 round up to the next whole band (6.75 → 7.0).
        </div>

        {/* Action Button - Teal Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveAsTarget}
            className="flex-1 py-2.5 px-4 bg-[#25A995] hover:bg-[#1D8B7A] text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#25A995]/25"
          >
            {savedNotice ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{language === "bn" ? "লক্ষ্য ব্যান্ড হিসেবে সংরক্ষিত!" : "Saved as Target Goal!"}</span>
              </>
            ) : (
              <span>{language === "bn" ? `ব্যান্ড ${overallBand.toFixed(1)} টার্গেট হিসেবে সেট করুন` : `Set Band ${overallBand.toFixed(1)} as Target`}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
