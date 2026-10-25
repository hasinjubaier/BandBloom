"use client";

import React, { useState } from "react";
import {
  Settings,
  Shield,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import { useExam } from "@/context/ExamContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const { profile, updateProfile } = useExam();

  const [testType, setTestType] = useState(profile.testType);
  const [targetBand, setTargetBand] = useState(profile.targetBand);
  const [targetDate, setTargetDate] = useState(profile.targetDate);
  const [dailyMinutes, setDailyMinutes] = useState(profile.dailyMinutes);

  const [voiceConsent, setVoiceConsent] = useState(profile.voiceConsent);
  const [aiConsent, setAiConsent] = useState(profile.aiConsent);
  const [modelOptIn, setModelOptIn] = useState(profile.modelTrainingOptIn);

  const [savedNotice, setSavedNotice] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleSave = () => {
    updateProfile({
      testType,
      targetBand,
      targetDate,
      dailyMinutes,
      voiceConsent,
      aiConsent,
      modelTrainingOptIn: modelOptIn,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleExportData = () => {
    setExportNotice(true);
    setTimeout(() => {
      setExportNotice(false);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `bandbloom_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-[#D4E8E3] dark:border-[#205653]">
        <div>
          <h1 className="text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#25A995]" />
            <span>Account & Preparation Settings</span>
          </h1>
          <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
            Manage your study goals, privacy consents, and data rights.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white font-semibold text-xs shadow-md shadow-[#25A995]/20 flex items-center gap-1.5 transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{savedNotice ? "Saved Successfully!" : "Save Changes"}</span>
        </button>
      </div>

      {/* Target & Track */}
      <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] shadow-sm space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#25A995]">
          IELTS Examination Targets
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#123C3A] dark:text-[#F4FAF8] font-medium mb-1.5">Test Track:</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as any)}
              className="w-full bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-xl px-3 py-2 text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
            >
              <option value="academic">IELTS Academic</option>
              <option value="general_training">IELTS General Training</option>
            </select>
          </div>

          <div>
            <label className="block text-[#123C3A] dark:text-[#F4FAF8] font-medium mb-1.5">Target Band:</label>
            <select
              value={targetBand}
              onChange={(e) => setTargetBand(parseFloat(e.target.value))}
              className="w-full bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-xl px-3 py-2 text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
            >
              {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                <option key={b} value={b}>Band {b.toFixed(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#123C3A] dark:text-[#F4FAF8] font-medium mb-1.5">Intended Exam Date:</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-xl px-3 py-2 text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
            />
          </div>

          <div>
            <label className="block text-[#123C3A] dark:text-[#F4FAF8] font-medium mb-1.5">Daily Study Allocation:</label>
            <select
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(parseInt(e.target.value))}
              className="w-full bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-xl px-3 py-2 text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
            >
              <option value={30}>30 minutes / day</option>
              <option value={60}>60 minutes / day (Standard)</option>
              <option value={90}>90 minutes / day (Intensive)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Language & UI Preferences */}
      <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#25A995]">
          Language & Localization (Section 6.5)
        </h2>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-[#123C3A] dark:text-[#F4FAF8] block">Preferred UI Language:</span>
            <span className="text-[#3D6462] dark:text-[#A0C5C1]">IELTS core terminology always remains in English</span>
          </div>

          <div className="flex items-center bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-xl p-1">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                language === "en" ? "bg-[#25A995] text-white" : "text-[#3D6462] dark:text-[#A0C5C1]"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("bn")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                language === "bn" ? "bg-[#25A995] text-white" : "text-[#3D6462] dark:text-[#A0C5C1]"
              }`}
            >
              বাংলা (Bengali)
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Consents */}
      <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#25A995]">
          Privacy & AI Consent Governance (Section 2.3 & 14.3)
        </h2>

        <div className="space-y-3 text-xs text-[#3D6462] dark:text-[#A0C5C1]">
          <label className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] cursor-pointer">
            <div>
              <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8] block">Voice Recording Authorization</span>
              <span className="text-[#3D6462] dark:text-[#A0C5C1]">Store audio recordings for speaking cue card evaluations</span>
            </div>
            <input
              type="checkbox"
              checked={voiceConsent}
              onChange={(e) => setVoiceConsent(e.target.checked)}
              className="mt-1 accent-[#25A995]"
            />
          </label>

          <label className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] cursor-pointer">
            <div>
              <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8] block">AI Diagnostic Feedback Consent</span>
              <span className="text-[#3D6462] dark:text-[#A0C5C1]">Enable automated rubric grading across Writing & Speaking</span>
            </div>
            <input
              type="checkbox"
              checked={aiConsent}
              onChange={(e) => setAiConsent(e.target.checked)}
              className="mt-1 accent-[#25A995]"
            />
          </label>

          <label className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] cursor-pointer">
            <div>
              <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8] block">Model Training Opt-In (Default: OFF)</span>
              <span className="text-[#3D6462] dark:text-[#A0C5C1]">Explicit opt-in required to allow anonymized data in model improvements</span>
            </div>
            <input
              type="checkbox"
              checked={modelOptIn}
              onChange={(e) => setModelOptIn(e.target.checked)}
              className="mt-1 accent-[#25A995]"
            />
          </label>
        </div>
      </div>

      {/* Data Export & Deletion */}
      <div className="bg-[#FFF6F3] dark:bg-[#123C3A] p-6 rounded-2xl border border-[#FF8A65]/30 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#FF8A65]">
          Data Management & Account Rights (Section 8.3)
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={handleExportData}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#F4FAF8] transition-colors"
          >
            <Download className="w-4 h-4 text-[#25A995]" />
            <span>{exportNotice ? "Preparing JSON Export..." : "Export My Attempt Data (JSON)"}</span>
          </button>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FF8A65] hover:bg-[#FF8A65]/80 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Request Account & Audio Deletion</span>
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-xl">
            <AlertCircle className="w-10 h-10 text-[#FF8A65] mx-auto" />
            <h3 className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">Delete Profile & Recordings?</h3>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
              In accordance with Section 8.3 & 14.3, this action irreversibly purges your mock attempts, saved essays, speaking audio assets, and personal mistake notes.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  setDeleteModalOpen(false);
                  window.location.href = "/";
                }}
                className="flex-1 py-2 rounded-xl bg-[#FF8A65] hover:opacity-90 text-white text-xs font-semibold"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
