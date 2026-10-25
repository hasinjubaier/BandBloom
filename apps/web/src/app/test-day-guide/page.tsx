"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Laptop,
  Clock,
  FileCheck,
  Headphones,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TestDayGuidePage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#25A995] bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 px-3 py-1 rounded-full">
          Candidate Readiness Guide
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
          Computer-Delivered IELTS Test-Day Checklist
        </h1>
        <p className="text-sm text-[#3D6462] dark:text-[#A0C5C1]">
          Essential protocols, physical document requirements, and test center guidelines according to official 2026 delivery standards.
        </p>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* What to Bring */}
        <div className="bg-white dark:bg-[#123C3A] p-8 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E8F7F4] text-[#25A995] border border-[#25A995]/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">Required Documents & Items</h2>
          </div>

          <ul className="space-y-3 text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#25A995] shrink-0 mt-0.5" />
              <span><strong className="text-[#123C3A] dark:text-[#F4FAF8]">Original Valid Passport / National ID:</strong> Must match the exact document details used during test booking. Photocopies or digital photos are strictly rejected.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#25A995] shrink-0 mt-0.5" />
              <span><strong className="text-[#123C3A] dark:text-[#F4FAF8]">Clear Transparent Water Bottle:</strong> Labels removed. No colored bottles or insulated metal containers allowed.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#25A995] shrink-0 mt-0.5" />
              <span><strong className="text-[#123C3A] dark:text-[#F4FAF8]">No Electronics or Watches:</strong> Smartwatches, wristwatches, phones, and wireless earbuds must be deposited in test center lockers.</span>
            </li>
          </ul>
        </div>

        {/* Test Center Environment */}
        <div className="bg-white dark:bg-[#123C3A] p-8 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFF6F3] text-[#FF8A65] border border-[#FF8A65]/30">
              <Laptop className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">Hardware & Workstation Setup</h2>
          </div>

          <ul className="space-y-3 text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF8A65] shrink-0 mt-0.5" />
              <span><strong className="text-[#123C3A] dark:text-[#F4FAF8]">Dedicated Headset with Volume Control:</strong> You can test audio levels before the listening test commences.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF8A65] shrink-0 mt-0.5" />
              <span><strong className="text-[#123C3A] dark:text-[#F4FAF8]">High-Resolution Display & Physical Keyboard:</strong> QWERTY layout with on-screen font zoom controls (standard, large, extra large).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF8A65] shrink-0 mt-0.5" />
              <span><strong className="text-[#123C3A] dark:text-[#F4FAF8]">Rough Paper & Pencils:</strong> Provided by invigilators for jotting notes during Listening and Writing tasks.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Arrival Schedule Box */}
      <div className="bg-[#FFF6F3] dark:bg-[#123C3A]/60 p-8 rounded-3xl border border-[#FF8A65]/30 space-y-4">
        <div className="flex items-center gap-2 text-[#FF8A65] font-bold text-sm">
          <Clock className="w-4 h-4" />
          <span>Timing and Arrival Recommendations</span>
        </div>
        <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
          Plan to arrive at the test center at least <strong className="text-[#123C3A] dark:text-[#F4FAF8]">45 minutes</strong> before your scheduled start time. Test centers enforce strict biometric identification (fingerprint scanning and test-day photograph) prior to room admission. Candidates arriving after doors close are disqualified without refund.
        </p>
      </div>

      {/* Official Booking Verification Links */}
      <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
            Ready to book your official computer test?
          </h3>
          <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            Verify official test centers, booking dates, and registration fees directly on official portals.
          </p>
        </div>

        <a
          href="https://www.ielts.org/book-a-test"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
        >
          <span>Official IELTS Booking</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
