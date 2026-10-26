"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    testType: "academic",
    targetBand: 7.5,
    targetDate: "",
    dailyMinutes: 60,
    voiceConsent: true,
    aiConsent: true,
    modelTrainingOptIn: false,
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile) {
          const p = data.profile;
          setFormData({
            fullName: p.fullName || "",
            email: p.email || "",
            testType: p.testType || "academic",
            targetBand: p.targetBand || 7.5,
            targetDate: p.targetDate ? p.targetDate.split("T")[0] : "2026-12-15",
            dailyMinutes: p.dailyMinutes || 60,
            voiceConsent: p.consents?.some((c: { type: string; granted: boolean }) => c.type === "recording" && c.granted) ?? true,
            aiConsent: p.consents?.some((c: { type: string; granted: boolean }) => c.type === "ai_processing" && c.granted) ?? true,
            modelTrainingOptIn: p.consents?.some((c: { type: string; granted: boolean }) => c.type === "model_improvement" && c.granted) ?? false,
          });
        }
      })
      .catch(() => setErrorMessage("Could not load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMessage("Settings and IELTS preferences saved successfully!");
      } else {
        setErrorMessage(json.error || "Failed to update profile.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#25A995] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
      {/* Header Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
          <Settings className="w-3.5 h-3.5" />
          <span>Account & Target Settings</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
          Student Preferences
        </h2>
        <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1]">
          Update your target IELTS band, test date, and privacy preferences. Changes immediately recalibrate your study plan.
        </p>
      </section>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Details Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#67839A] dark:text-[#A0C5C1]">
            Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-[#D4E8E3] dark:border-[#205653] text-xs sm:text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* IELTS Test Track & Goals Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#67839A] dark:text-[#A0C5C1]">
            IELTS Target & Commitment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1.5">
                Test Track
              </label>
              <select
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
              >
                <option value="academic">IELTS Academic</option>
                <option value="general_training">IELTS General Training</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1.5">
                Target Band Score
              </label>
              <select
                value={formData.targetBand}
                onChange={(e) => setFormData({ ...formData, targetBand: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
              >
                <option value="6.0">Band 6.0</option>
                <option value="6.5">Band 6.5</option>
                <option value="7.0">Band 7.0</option>
                <option value="7.5">Band 7.5</option>
                <option value="8.0">Band 8.0</option>
                <option value="8.5">Band 8.5</option>
                <option value="9.0">Band 9.0 (Expert)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1.5">
                Target Exam Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1.5">
                Daily Study Minutes
              </label>
              <select
                value={formData.dailyMinutes}
                onChange={(e) => setFormData({ ...formData, dailyMinutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
              >
                <option value="30">30 minutes / day</option>
                <option value="45">45 minutes / day</option>
                <option value="60">60 minutes / day (Recommended)</option>
                <option value="90">90 minutes / day</option>
                <option value="120">120 minutes / day (Intensive)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Consents & Privacy Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#67839A] dark:text-[#A0C5C1]">
            Privacy & AI Evaluation Consents
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.voiceConsent}
                onChange={(e) => setFormData({ ...formData, voiceConsent: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-[#25A995] accent-[#25A995]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8] block">
                  Voice Recording Consent
                </span>
                <span className="text-[#67839A] dark:text-[#A0C5C1]">
                  Permits recording your audio responses during Speaking Section mock tests for AI transcription and fluency grading.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aiConsent}
                onChange={(e) => setFormData({ ...formData, aiConsent: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-[#25A995] accent-[#25A995]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8] block">
                  AI Rubric Processing
                </span>
                <span className="text-[#67839A] dark:text-[#A0C5C1]">
                  Permits processing your essay responses against official IELTS Task Response, CC, LR, and GRA criteria.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.modelTrainingOptIn}
                onChange={(e) => setFormData({ ...formData, modelTrainingOptIn: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-[#25A995] accent-[#25A995]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8] block">
                  Model Improvement Opt-In (Optional)
                </span>
                <span className="text-[#67839A] dark:text-[#A0C5C1]">
                  Anonymized essay patterns may be used to improve BandBloom IELTS scoring models.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-[#25A995] hover:bg-[#123C3A] disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#25A995]/20 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
