"use client";

import React, { useState } from "react";
import { Laptop, CheckCircle2, Award } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { ScoreCalculatorModal } from "@/components/ui/ScoreCalculatorModal";

export function ComputerDeliveredSection() {
  const { language } = useLanguage();
  const [calcOpen, setCalcOpen] = useState(false);
  const isBn = language === "bn";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-sm dark:shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FFF6F3] dark:bg-[#0A1C1B] text-[#FF8A65] border border-[#FF8A65]/30 text-xs font-semibold">
              <Laptop className="w-3.5 h-3.5" />
              <span>March 2026 Test Delivery Standard</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
              {isBn
                ? "মধ্য-২০২৬ থেকে সম্পূর্ণ কম্পিউটার-ডেলিভার্ড পরীক্ষা"
                : "Fully Aligned with Global Computer-Delivered IELTS"}
            </h3>
            <p className="text-sm text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
              {isBn
                ? "অফিসিয়াল IELTS ঘোষণা অনুযায়ী পেপার-বেসড পরীক্ষা ক্রমান্বয়ে বন্ধ হচ্ছে। BandBloom পরীক্ষার্থীদের আসল কম্পিউটার সফটওয়্যারের মতো স্প্লিট-স্ক্রিন প্যাসেজ ভিউ, ড্র্যাগ-এন্ড-ড্রপ এবং নির্ভরযোগ্য অন-স্ক্রিন টাইমার অভ্যস্ত করে তোলে।"
                : "IELTS test centers worldwide are transitioning primarily to computer delivery. BandBloom trains you on the exact UX: responsive split-screen reading, on-the-fly text highlighting, authoritative server timers, and One Skill Retake strategy."}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                <CheckCircle2 className="w-4 h-4 text-[#25A995]" />
                <span>One Skill Retake Strategy</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                <CheckCircle2 className="w-4 h-4 text-[#25A995]" />
                <span>Split-Screen Reading & Auto-Save</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#3D6462] dark:text-[#FF8A65]" >
                <CheckCircle2 className="w-4 h-4 text-[#FF8A65]" />
                <span>Network Grace-Window Protection</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-2xl p-6 text-center space-y-4 shadow-xs">
            <Award className="w-10 h-10 text-[#25A995] mx-auto" />
            <h4 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              {isBn ? "অফিসিয়াল রাউন্ডিং হিসাব" : "Official Score Rounding"}
            </h4>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              {isBn
                ? "আপনার কাঙ্ক্ষিত ব্যান্ডের গাণিতিক মান যাচাই করুন"
                : "Check how fractional scores round up officially"}
            </p>
            <button
              onClick={() => setCalcOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs font-semibold shadow-md shadow-[#25A995]/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2"
            >
              {isBn ? "ক্যালকুলেটর খুলুন" : "Open Score Simulator"}
            </button>
          </div>
        </div>
      </div>

      <ScoreCalculatorModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </section>
  );
}
