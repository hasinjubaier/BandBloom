"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  FileText,
  BookmarkPlus,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useExam } from "@/context/ExamContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ListeningLabPage() {
  const { language } = useLanguage();
  const { addMistake } = useExam();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [transcriptUnlocked, setTranscriptUnlocked] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({
    lq1: "",
    lq2: "",
    lq3: "",
  });

  const [savedNotes, setSavedNotes] = useState<Record<string, boolean>>({});

  // Audio timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 300 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const questions = [
    {
      id: "lq1",
      number: 1,
      instruction: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER.",
      prompt: "The library orientation session commences at _______ in Room 402.",
      correctAnswer: "9:30 AM",
      distractor: "The speaker initially said 9:00 AM, but then corrected: 'Actually, the timetable was shifted by thirty minutes.'",
      reason: "Time shifts are common Section 1 distractors. Always listen for discourse markers like 'Actually' or 'In fact'.",
    },
    {
      id: "lq2",
      number: 2,
      instruction: "Write ONE WORD ONLY.",
      prompt: "Undergraduates must present their student _______ to collect course readers.",
      correctAnswer: "cards",
      distractor: "Student passport / voucher was mentioned for external visitors, but undergraduates require 'cards'.",
      reason: "Singular/Plural rule: The speaker specifically said 'student cards' with an audible plural 's'.",
    },
    {
      id: "lq3",
      number: 3,
      instruction: "Write NO MORE THAN TWO WORDS.",
      prompt: "The digital humanities seminar focuses on analyzing _______ from the 19th century.",
      correctAnswer: "historical newspapers",
      distractor: "Magazines and pamphlets were mentioned as secondary reading.",
      reason: "Historical newspapers are the primary corpus examined during practical labs.",
    },
  ];

  const handleSubmit = () => {
    setSubmitted(true);
    setTranscriptUnlocked(true);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      const student = answers[q.id]?.trim().toLowerCase();
      const expected = q.correctAnswer.toLowerCase();
      if (student === expected) score++;
    });
    return score;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4E8E3] dark:border-[#205653]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#25A995] mb-1">
            <Headphones className="w-4 h-4" />
            <span>Computer-Delivered Listening Lab</span>
            <span className="text-[#3D6462] dark:text-[#A0C5C1]">•</span>
            <span>Section 1 & 3 Audio Practice</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
            University Campus Registration & Course Orientation
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {submitted ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#25A995] font-bold">
                Score: {calculateScore()} / {questions.length} Correct
              </span>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setAnswers({ lq1: "", lq2: "", lq3: "" });
                  setAudioProgress(0);
                  setIsPlaying(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8] border border-[#D4E8E3] dark:border-[#205653] text-xs font-medium"
              >
                Reset
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-white font-semibold text-xs shadow-md shadow-[#25A995]/25 transition-all"
            >
              Submit & View Transcript
            </button>
          )}
        </div>
      </div>

      {/* Simulated Audio Player Bar */}
      <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-2xl bg-[#25A995] hover:bg-[#1D8B7A] text-white flex items-center justify-center shadow-md shadow-[#25A995]/25 hover:scale-105 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <div>
              <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Audio Track 104 - Official Dialogue (British Accent)</h3>
              <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">Duration: 04:15 • Audio plays once in exam mode</p>
            </div>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-2 bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] p-1 rounded-xl text-xs">
            <span className="text-[10px] text-[#3D6462] dark:text-[#A0C5C1] px-2 font-semibold uppercase">Speed:</span>
            {[0.8, 1.0, 1.2].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  playbackSpeed === s ? "bg-[#25A995] text-white" : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar & Waveform */}
        <div className="space-y-1.5">
          <div className="w-full h-2 rounded-full bg-[#D4E8E3] dark:bg-[#205653] overflow-hidden cursor-pointer">
            <div
              className="h-full bg-[#25A995] transition-all duration-200"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">
            <span>0{Math.floor((audioProgress * 2.5) / 60)}:{Math.floor((audioProgress * 2.5) % 60).toString().padStart(2, "0")}</span>
            <span>04:15</span>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] p-4 rounded-xl text-xs text-[#3D6462] dark:text-[#A0C5C1] shadow-sm">
            <strong className="text-[#123C3A] dark:text-[#F4FAF8]">Section 1: Registration Form</strong> • Complete the notes below according to the audio.
          </div>

          {questions.map((q) => {
            const studentAns = answers[q.id]?.trim().toLowerCase();
            const isCorrect = studentAns === q.correctAnswer.toLowerCase();

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all shadow-sm ${
                  submitted
                    ? isCorrect
                      ? "border-[#25A995]/40 bg-[#E8F7F4]/30 dark:bg-[#25A995]/15"
                      : "border-[#FF8A65]/40 bg-[#FFF6F3]/30 dark:bg-[#FF8A65]/15"
                    : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#E8F7F4] text-[#25A995] dark:bg-[#25A995]/20 font-bold text-xs flex items-center justify-center shrink-0">
                      {q.number}
                    </span>
                    <span className="text-[10px] text-[#3D6462] dark:text-[#A0C5C1] uppercase tracking-wider font-semibold">
                      {q.instruction}
                    </span>
                  </div>

                  {submitted && (
                    <div className="text-xs font-bold">
                      {isCorrect ? (
                        <span className="text-[#25A995] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-[#FF8A65] flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-sm text-[#123C3A] dark:text-[#F4FAF8] font-medium mb-3">
                  {q.prompt}
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={answers[q.id]}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    disabled={submitted}
                    placeholder="Type your answer..."
                    className="flex-1 bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-xl px-4 py-2 text-sm text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
                  />
                </div>

                {submitted && (
                  <div className="mt-3 pt-3 border-t border-[#D4E8E3] dark:border-[#205653] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#3D6462] dark:text-[#A0C5C1]">
                      <span>Correct Answer:</span>
                      <strong className="text-[#25A995]">{q.correctAnswer}</strong>
                    </div>
                    <p className="text-[11px] text-[#FF8A65] bg-[#FFF6F3] dark:bg-[#FF8A65]/20 p-2 rounded-lg border border-[#FF8A65]/30">
                      <strong>Distractor Notice:</strong> {q.distractor}
                    </p>
                    <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">{q.reason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Transcript Drawer (Unlocked upon submit) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#123C3A] rounded-2xl border border-[#D4E8E3] dark:border-[#205653] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#D4E8E3] dark:border-[#205653]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#25A995]" />
              <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">Audio Transcript & Distractor Analysis</h3>
            </div>
            {!transcriptUnlocked && (
              <span className="text-[10px] bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] px-2 py-0.5 rounded border border-[#D4E8E3] dark:border-[#205653]">
                Locked during test
              </span>
            )}
          </div>

          {transcriptUnlocked ? (
            <div className="text-xs text-[#123C3A] dark:text-[#F4FAF8] leading-relaxed space-y-3 max-h-[500px] overflow-y-auto">
              <p>
                <strong>Advisor:</strong> Welcome to the central administration building. Are you here for the university orientation session?
              </p>
              <p>
                <strong>Student:</strong> Yes, exactly. I thought it was scheduled for 9:00 AM in room 402, but there seemed to be a notice on the door.
              </p>
              <p className="bg-[#E8F7F4] dark:bg-[#25A995]/20 border-l-2 border-[#25A995] p-2 rounded">
                <strong>Advisor:</strong> Ah, correct. The orientation actually commences at <mark className="bg-[#25A995]/20 text-[#25A995] dark:text-[#F4FAF8] font-bold px-1 rounded">9:30 AM</mark> because the audio equipment was being calibrated.
              </p>
              <p>
                <strong>Student:</strong> That makes sense. And what documentation do we need to collect our course packages?
              </p>
              <p className="bg-[#E8F7F4] dark:bg-[#25A995]/20 border-l-2 border-[#25A995] p-2 rounded">
                <strong>Advisor:</strong> You just need your official student <mark className="bg-[#25A995]/20 text-[#25A995] dark:text-[#F4FAF8] font-bold px-1 rounded">cards</mark>. Don't worry about bringing library vouchers today.
              </p>
              <p>
                <strong>Student:</strong> Perfect. And regarding the digital humanities lab?
              </p>
              <p className="bg-[#E8F7F4] dark:bg-[#25A995]/20 border-l-2 border-[#25A995] p-2 rounded">
                <strong>Advisor:</strong> Yes, they will be examining archives of <mark className="bg-[#25A995]/20 text-[#25A995] dark:text-[#F4FAF8] font-bold px-1 rounded">historical newspapers</mark> dating back to the late Victorian era.
              </p>
            </div>
          ) : (
            <div className="text-center py-12 space-y-2 text-[#3D6462] dark:text-[#A0C5C1] text-xs">
              <p>The audio transcript is protected during the test attempt.</p>
              <p className="text-[11px] text-[#3D6462]/70 dark:text-[#A0C5C1]/70">
                Submit your answers to review the complete verbatim dialogue with annotated distractor explanations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
