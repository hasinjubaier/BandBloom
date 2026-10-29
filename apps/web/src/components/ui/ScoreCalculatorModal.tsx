"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Calculator, CheckCircle2, AlertCircle } from "lucide-react";
import { roundIELTSBand, useExam } from "@/context/ExamContext";
import { useLanguage } from "@/context/LanguageContext";

export interface ScoreCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBand?: number | null;
  onTargetBandChange?: (band: number) => void;
}

const toBengaliNumber = (val: string | number): string => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(val).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)] || d);
};

const formatAverage = (num: number, isBn: boolean): string => {
  const rounded3 = parseFloat(num.toFixed(3));
  const str = rounded3.toString();
  return isBn ? toBengaliNumber(str) : str;
};

const formatBand = (band: number, isBn: boolean): string => {
  const str = band.toFixed(1);
  return isBn ? toBengaliNumber(str) : str;
};

const CalculatorContent: React.FC<Omit<ScoreCalculatorModalProps, "isOpen">> = ({
  onClose,
  initialBand,
  onTargetBandChange,
}) => {
  const { language, t } = useLanguage();
  const isBn = language === "bn";
  const { profile, updateProfile } = useExam();

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  const getInitialValue = (fallback: number): number => {
    const activeGoal = initialBand ?? profile?.targetBand;
    if (typeof activeGoal === "number" && activeGoal >= 4.0 && activeGoal <= 9.0) {
      return activeGoal;
    }
    return fallback;
  };

  const [listening, setListening] = useState<number>(() => getInitialValue(7.0));
  const [reading, setReading] = useState<number>(() => getInitialValue(7.5));
  const [writing, setWriting] = useState<number>(() => getInitialValue(6.5));
  const [speaking, setSpeaking] = useState<number>(() => getInitialValue(7.0));
  const [savedNotice, setSavedNotice] = useState(false);

  const rawAverage = (listening + reading + writing + speaking) / 4.0;
  const overallBand = roundIELTSBand(rawAverage);
  const isTargetEligible = overallBand >= 6.5;

  // Accessibility: manage focus on open/close and lock body scroll
  useEffect(() => {
    triggerElementRef.current = document.activeElement as HTMLElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 50);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === "function") {
        triggerElementRef.current.focus();
      }
    };
  }, []);

  // Accessibility: Escape closes dialog and Tab loops inside dialog
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose]
  );

  const handleSaveAsTarget = () => {
    if (!isTargetEligible) return;

    updateProfile({ targetBand: overallBand });
    if (typeof window !== "undefined") {
      localStorage.setItem("bandbloom_target_band", String(overallBand));
      localStorage.setItem("bandbloom_has_chosen_goal", "true");
      window.dispatchEvent(
        new CustomEvent("bandbloom:target_band_changed", { detail: { band: overallBand } })
      );
    }
    if (onTargetBandChange) {
      onTargetBandChange(overallBand);
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  const skills = [
    { key: "listening", label: t.calculator.listening, val: listening, set: setListening },
    { key: "reading", label: t.calculator.reading, val: reading, set: setReading },
    { key: "writing", label: t.calculator.writing, val: writing, set: setWriting },
    { key: "speaking", label: t.calculator.speaking, val: speaking, set: setSpeaking },
  ];

  const presets = [6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calculator-modal-title"
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#123C3A]/60 dark:bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-2xl max-w-lg w-full shadow-2xl relative flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[88dvh] overflow-hidden text-[#123C3A] dark:text-[#F4FAF8] transition-colors duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 pr-8">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#187A6C] text-white shadow-md shadow-[#187A6C]/20 shrink-0">
              <Calculator className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="calculator-modal-title" className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] leading-tight">
                {t.calculator.title}
              </h2>
              <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-0.5">
                {t.calculator.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t.calculator.closeButton}
            className="p-2 text-[#3D6462] hover:text-[#123C3A] rounded-lg hover:bg-[#F4FAF8] dark:text-[#A0C5C1] dark:hover:text-white dark:hover:bg-[#174A48] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187A6C]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 overscroll-contain">
          {/* Helper line above sliders */}
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#3D6462] dark:text-[#A0C5C1]">
            <span>{t.calculator.helperLine}</span>
          </div>

          {/* Quick Preset Chips - 3 columns x 2 rows grid */}
          <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/60 p-2.5 sm:p-3 rounded-xl border border-[#D4E8E3] dark:border-[#205653]">
            <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1] font-semibold mb-2">
              {t.calculator.presetLabel}
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {presets.map((preset) => {
                const isCurrentPreset =
                  listening === preset &&
                  reading === preset &&
                  writing === preset &&
                  speaking === preset;
                const chipBandText = formatBand(preset, isBn);
                const chipAriaLabel = isBn
                  ? `${t.calculator.chipAriaPrefix}${chipBandText}${t.calculator.chipAriaSuffix}`
                  : `${t.calculator.chipAriaPrefix}${chipBandText}`;

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setListening(preset);
                      setReading(preset);
                      setWriting(preset);
                      setSpeaking(preset);
                    }}
                    aria-pressed={isCurrentPreset}
                    aria-label={chipAriaLabel}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187A6C] ${
                      isCurrentPreset
                        ? "bg-[#187A6C] text-white shadow-xs"
                        : "bg-white dark:bg-[#123C3A] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] hover:text-[#123C3A] dark:hover:text-white hover:border-[#187A6C]"
                    }`}
                  >
                    {t.calculator.bandValuePrefix}{chipBandText}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact Sliders */}
          <div className="space-y-2.5">
            {skills.map((item) => {
              const displayScore = `${t.calculator.bandValuePrefix}${formatBand(item.val, isBn)}`;
              return (
                <div
                  key={item.key}
                  className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 p-2.5 sm:p-3 rounded-xl border border-[#D4E8E3] dark:border-[#205653]"
                >
                  <div className="flex justify-between items-center mb-1">
                    <label
                      htmlFor={`slider-${item.key}`}
                      className="text-xs sm:text-sm font-medium text-[#123C3A] dark:text-[#F4FAF8]"
                    >
                      {item.label}
                    </label>
                    <span className="text-xs sm:text-sm font-bold text-[#167568] dark:text-[#25A995]">
                      {displayScore}
                    </span>
                  </div>
                  <input
                    id={`slider-${item.key}`}
                    type="range"
                    min="4.0"
                    max="9.0"
                    step="0.5"
                    value={item.val}
                    aria-label={item.label}
                    aria-valuemin={4}
                    aria-valuemax={9}
                    aria-valuenow={item.val}
                    aria-valuetext={displayScore}
                    onChange={(e) => item.set(parseFloat(e.target.value))}
                    className="w-full accent-[#187A6C] dark:accent-[#25A995] cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          {/* Result Box (aria-live polite) */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className="bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-xl p-3 sm:p-3.5 text-center shadow-2xs"
          >
            <div className="text-xs uppercase tracking-wider text-[#3D6462] dark:text-[#A0C5C1] font-semibold mb-0.5">
              {t.calculator.resultLabel}
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
              {t.calculator.bandValuePrefix}{formatBand(overallBand, isBn)}
            </div>
            <div className="mt-1 text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              {t.calculator.averagePrefix}
              <span className="font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                {formatAverage(rawAverage, isBn)}
              </span>
              {t.calculator.averageArrow}
              <span className="font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                {formatBand(overallBand, isBn)}
              </span>
            </div>
          </div>

          {/* Rounding explanation */}
          <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1] bg-white dark:bg-[#174A48]/50 p-2.5 sm:p-3 rounded-lg border border-[#D4E8E3] dark:border-[#205653] leading-relaxed">
            <strong className="text-[#167568] dark:text-[#25A995] font-semibold block mb-0.5">
              {t.calculator.ruleTitle}
            </strong>
            {t.calculator.ruleBody}
          </div>
        </div>

        {/* Sticky Footer for Result Action */}
        <div className="p-3.5 sm:p-4 border-t border-[#D4E8E3] dark:border-[#205653] bg-white/95 dark:bg-[#123C3A]/95 backdrop-blur-sm shrink-0">
          {/* Below-range advisory message when overallBand < 6.5 */}
          {!isTargetEligible && (
            <div
              role="status"
              className="mb-2.5 p-2.5 rounded-lg bg-[#FFF8E1] dark:bg-[#2A2312] border border-[#FFE082] dark:border-[#5D4A1B] text-xs text-[#795548] dark:text-[#FFE082] flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-[#F57C00] shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.calculator.targetBelowRange}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleSaveAsTarget}
            disabled={!isTargetEligible}
            aria-disabled={!isTargetEligible}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187A6C] focus-visible:ring-offset-2 ${
              !isTargetEligible
                ? "bg-[#D4E8E3]/60 dark:bg-[#174A48]/50 text-[#3D6462]/60 dark:text-[#A0C5C1]/50 cursor-not-allowed border border-[#D4E8E3] dark:border-[#205653]"
                : "bg-[#187A6C] hover:bg-[#12584E] text-white shadow-md shadow-[#187A6C]/25 active:scale-[0.99] cursor-pointer"
            }`}
          >
            {savedNotice ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                <span>{t.calculator.savedConfirmation}</span>
              </>
            ) : (
              <span>
                {t.calculator.setTargetPrefix}
                {formatBand(overallBand, isBn)}
                {t.calculator.setTargetSuffix}
              </span>
            )}
          </button>

          {/* Footnote */}
          <p className="mt-2 text-xs text-center text-[#3D6462] dark:text-[#A0C5C1] leading-tight">
            {t.calculator.footnote}
          </p>
        </div>
      </div>
    </div>
  );
};

export const ScoreCalculatorModal: React.FC<ScoreCalculatorModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <CalculatorContent {...props} />;
};

