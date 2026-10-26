"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  Briefcase,
  Target,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { useExam } from "@/context/ExamContext";
import { useLanguage } from "@/context/LanguageContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { profile, updateProfile } = useExam();

  const [step, setStep] = useState<number>(1);
  const [testType, setTestType] = useState<"academic" | "general_training">(profile.testType);
  const [targetBand, setTargetBand] = useState<number>(profile.targetBand);
  const [targetDate, setTargetDate] = useState<string>(profile.targetDate);
  const [dailyMinutes, setDailyMinutes] = useState<number>(profile.dailyMinutes);

  // Consents & declarations (Section 2.3 & 14.3)
  const [voiceConsent, setVoiceConsent] = useState<boolean>(profile.voiceConsent);
  const [aiConsent, setAiConsent] = useState<boolean>(profile.aiConsent);
  const [modelOptIn, setModelOptIn] = useState<boolean>(profile.modelTrainingOptIn);
  const [ageDeclared, setAgeDeclared] = useState<boolean>(profile.ageDeclared);

  const handleFinish = () => {
    updateProfile({
      testType,
      targetBand,
      targetDate,
      dailyMinutes,
      voiceConsent,
      aiConsent,
      modelTrainingOptIn: modelOptIn,
      ageDeclared,
      onboarded: true,
    });
    router.push("/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 w-full">
      {/* Progress header */}
      <div className="mb-8 space-y-2 text-center">
        <span className="text-xs uppercase tracking-wider font-bold text-[#25A995]">
          Step {step} of 4
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
          {step === 1 && (language === "bn" ? "আপনার IELTS পরীক্ষার ধরন বেছে নিন" : "Select Your IELTS Test Track")}
          {step === 2 && (language === "bn" ? "টার্গেট ব্যান্ড ও পরীক্ষার তারিখ নির্ধারণ" : "Target Band & Examination Date")}
          {step === 3 && (language === "bn" ? "দৈনিক প্রস্তুতির সময় নির্ধারণ" : "Daily Study Commitment")}
          {step === 4 && (language === "bn" ? "প্রাইভেসি ও কনসেন্ট যাচাইকরণ" : "Privacy, AI & Voice Consent")}
        </h1>
        <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
          Personalize your curriculum according to official 2026 computer delivery standards.
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[#D4E8E3] dark:bg-[#205653] rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-[#25A995] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#123C3A] p-6 sm:p-8 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] space-y-6 shadow-sm">
        {/* Step 1: Test Track */}
        {step === 1 && (
          <div className="space-y-4">
            <div
              onClick={() => setTestType("academic")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${testType === "academic"
                  ? "bg-[#E8F7F4] border-[#25A995] text-[#123C3A] dark:bg-[#25A995]/20 dark:border-[#25A995] dark:text-[#F4FAF8] shadow-sm"
                  : "bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:border-[#25A995]/50"
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-[#25A995]" />
                <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">IELTS Academic</h3>
              </div>
              <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                For undergraduate/postgraduate university admissions and professional licensing. Features academic texts, data graphics, and discursive essays.
              </p>
            </div>

            <div
              onClick={() => setTestType("general_training")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${testType === "general_training"
                  ? "bg-[#E8F7F4] border-[#25A995] text-[#123C3A] dark:bg-[#25A995]/20 dark:border-[#25A995] dark:text-[#F4FAF8] shadow-sm"
                  : "bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:border-[#25A995]/50"
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-5 h-5 text-[#25A995]" />
                <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">IELTS General Training</h3>
              </div>
              <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                For migration to English-speaking countries and secondary education or vocational training. Emphasizes workplace letters, notices, and everyday reading.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Goal Band & Date */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#3D6462] dark:text-[#A0C5C1] mb-2">
                Target Overall Band Score: <strong className="text-[#25A995] text-sm">Band {targetBand.toFixed(1)}</strong>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                  <button
                    key={b}
                    onClick={() => setTargetBand(b)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${targetBand === b
                        ? "bg-[#25A995] text-white shadow-md shadow-[#25A995]/25"
                        : "bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                      }`}
                  >
                    Band {b.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D6462] dark:text-[#A0C5C1] mb-2">
                Intended Examination Date:
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-xl px-4 py-2.5 text-sm text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
              />
            </div>
          </div>
        )}

        {/* Step 3: Daily Minutes */}
        {step === 3 && (
          <div className="space-y-4">
            {[
              { mins: 30, title: "Light & Consistent", desc: "1 focused exercise per day. Ideal for busy working professionals." },
              { mins: 60, title: "Recommended Standard", desc: "Complete 1 full skill section + vocabulary spaced repetition." },
              { mins: 90, title: "Intensive Fast-Track", desc: "Dual skill drills + weekly full computer-delivered mock exam." },
            ].map((plan) => (
              <div
                key={plan.mins}
                onClick={() => setDailyMinutes(plan.mins)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${dailyMinutes === plan.mins
                    ? "bg-[#E8F7F4] border-[#25A995] text-[#123C3A] dark:bg-[#25A995]/20 dark:border-[#25A995] dark:text-[#F4FAF8] shadow-sm"
                    : "bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:border-[#25A995]/50"
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">{plan.title}</h4>
                  <span className="text-xs font-extrabold text-[#25A995]">{plan.mins} min/day</span>
                </div>
                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">{plan.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Legal & Consent */}
        {step === 4 && (
          <div className="space-y-4 text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            <div className="p-4 bg-[#F4FAF8] dark:bg-[#0A1C1B]/90 border border-[#D4E8E3] dark:border-[#205653] rounded-xl space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceConsent}
                  onChange={(e) => setVoiceConsent(e.target.checked)}
                  className="mt-0.5 accent-[#25A995] rounded"
                />
                <span>
                  <strong className="text-[#123C3A] dark:text-[#F4FAF8]">Voice Recording Consent (Section 2.3):</strong> I authorize BandBloom to capture temporary audio for simulated Speaking assessments and speech-to-text transcript processing.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiConsent}
                  onChange={(e) => setAiConsent(e.target.checked)}
                  className="mt-0.5 accent-[#25A995] rounded"
                />
                <span>
                  <strong className="text-[#123C3A] dark:text-[#F4FAF8]">AI Scoring Notice:</strong> I understand that BandBloom&apos;s rubric evaluations and estimated bands are practice diagnostics and do not guarantee official test outcomes.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageDeclared}
                  onChange={(e) => setAgeDeclared(e.target.checked)}
                  className="mt-0.5 accent-[#25A995] rounded"
                />
                <span>
                  <strong className="text-[#123C3A] dark:text-[#F4FAF8]">Age Declaration:</strong> I confirm that I am at least 16 years of age or possess parental authorization to utilize this study platform.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#D4E8E3] dark:border-[#205653]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] hover:bg-[#D4E8E3]/50 dark:hover:bg-[#205653] text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#25A995]/25 transition-all ml-auto"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-white text-xs font-semibold shadow-md shadow-[#25A995]/25 transition-all ml-auto"
            >
              Enter Dashboard →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
