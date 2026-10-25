"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Trash2,
  Award,
  Volume2,
} from "lucide-react";
import { MOCK_SPEAKING_CUE_CARD } from "@/data/mockCurriculum";
import { useLanguage } from "@/context/LanguageContext";

export default function SpeakingLabPage() {
  const { language } = useLanguage();
  const [activePart, setActivePart] = useState<1 | 2 | 3>(2);

  // Timers for Cue Card Part 2
  const [prepSeconds, setPrepSeconds] = useState(60);
  const [isPrepping, setIsPrepping] = useState(false);
  const [speakSeconds, setSpeakSeconds] = useState(120);
  const [isRecording, setIsRecording] = useState(false);

  const [hasRecorded, setHasRecorded] = useState(false);
  const [transcript, setTranscript] = useState(
    "Well, I would like to talk about an admirable local environmental program called the Clean Dhaka Canal Revival Project. It was initiated two years ago by a coalition of graduate researchers and local community leaders who were deeply concerned about suburban waterway pollution. They implemented automated floating waste barriers along the canal and organized weekend silt-clearing drives involving high school volunteers. In addition, they planted wetland reeds along the embankments to naturally bio-filter the runoff. Because of their continuous dedication, the odor has diminished remarkably, and native bird species have begun nesting along the banks again. I personally admire this effort because it proved that grassroots civil engagement can rehabilitate urban ecosystems without relying entirely on government bureaucracy."
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);

  // Prep countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPrepping && prepSeconds > 0) {
      timer = setInterval(() => setPrepSeconds((s) => s - 1), 1000);
    } else if (prepSeconds === 0 && isPrepping) {
      setIsPrepping(false);
    }
    return () => clearInterval(timer);
  }, [isPrepping, prepSeconds]);

  // Speaking countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && speakSeconds > 0) {
      timer = setInterval(() => setSpeakSeconds((s) => s - 1), 1000);
    } else if (speakSeconds === 0 && isRecording) {
      setIsRecording(false);
      setHasRecorded(true);
    }
    return () => clearInterval(timer);
  }, [isRecording, speakSeconds]);

  const handleStartRecording = () => {
    setIsPrepping(false);
    setIsRecording(true);
    setSpeakSeconds(120);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
  };

  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setFeedback({
        overallBand: 7.5,
        criteria: {
          fluency: {
            title: "Fluency and Coherence",
            score: 7.5,
            notes: "Speaks at length effortlessly with minimal hesitation or repetition. Ideas are logically linked using varied connectives.",
          },
          lexical: {
            title: "Lexical Resource",
            score: 8.0,
            notes: "Flexible and precise vocabulary (bio-filter, grass-roots civil engagement, rehabilitate urban ecosystems, bureaucracy).",
          },
          grammar: {
            title: "Grammatical Range and Accuracy",
            score: 7.5,
            notes: "Produces frequent error-free complex sentences and uses relative clauses naturally.",
          },
          pronunciation: {
            title: "Pronunciation",
            score: 7.0,
            notes: "Clear articulation, natural intonation rhythm with slight vowel reduction variation.",
          },
        },
      });
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4E8E3] dark:border-[#205653]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF8A65] mb-1">
            <Mic className="w-4 h-4" />
            <span>Speaking Skill Lab</span>
            <span className="text-[#3D6462] dark:text-[#A0C5C1]">•</span>
            <span>Microphone Recording & Fluency Rubric</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
            IELTS Speaking Part 2 Cue Card & Analysis
          </h1>
        </div>

        {/* Part selector */}
        <div className="flex items-center bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] p-1 rounded-xl text-xs">
          <button
            onClick={() => setActivePart(1)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activePart === 1 ? "bg-[#25A995] text-white shadow-md shadow-[#25A995]/25" : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
            }`}
          >
            Part 1 (Intro)
          </button>
          <button
            onClick={() => setActivePart(2)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activePart === 2 ? "bg-[#25A995] text-white shadow-md shadow-[#25A995]/25" : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
            }`}
          >
            Part 2 (Cue Card)
          </button>
          <button
            onClick={() => setActivePart(3)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activePart === 3 ? "bg-[#25A995] text-white shadow-md shadow-[#25A995]/25" : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
            }`}
          >
            Part 3 (Discussion)
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cue Card & Prep Timers (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-4 shadow-sm">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[#D4E8E3] dark:border-[#205653]">
              <span className="font-bold text-[#FF8A65] uppercase tracking-wider">
                Part 2 Candidate Task Card
              </span>
              <span className="text-[#3D6462] dark:text-[#A0C5C1]">1 min prep • 2 min speak</span>
            </div>

            <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              {MOCK_SPEAKING_CUE_CARD.title}
            </h3>

            <div className="space-y-2 text-xs text-[#123C3A] dark:text-[#F4FAF8] bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 p-4 rounded-xl border border-[#D4E8E3] dark:border-[#205653]">
              <p className="font-semibold text-[#3D6462] dark:text-[#A0C5C1] mb-1">You should say:</p>
              {MOCK_SPEAKING_CUE_CARD.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#25A995] font-bold">•</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {/* Preparation Timer Widget */}
            <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border border-[#D4E8E3] dark:border-[#205653] p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#3D6462] dark:text-[#A0C5C1]">
                  Preparation Time (1 minute):
                </span>
                <span className="text-sm font-extrabold text-[#25A995]">
                  {prepSeconds}s remaining
                </span>
              </div>
              <div className="flex gap-2">
                {!isPrepping && prepSeconds === 60 ? (
                  <button
                    onClick={() => setIsPrepping(true)}
                    className="w-full py-2 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-xs font-medium text-white transition-colors"
                  >
                    Start 60s Preparation Timer
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsPrepping(false);
                      setPrepSeconds(60);
                    }}
                    className="w-full py-2 rounded-xl bg-white dark:bg-[#123C3A] hover:bg-[#D4E8E3]/50 text-xs font-medium text-[#3D6462] dark:text-[#A0C5C1] border border-[#D4E8E3] dark:border-[#205653] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Prep
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recorder, Audio Visualizer, Transcript & Rubrics (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Recorder Controls */}
          <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    isRecording
                      ? "bg-[#FF8A65] text-white animate-pulse shadow-md shadow-[#FF8A65]/30"
                      : "bg-[#E8F7F4] dark:bg-[#25A995]/20 border border-[#25A995]/30 text-[#25A995]"
                  }`}
                >
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    {isRecording ? "Recording in progress..." : "Microphone Ready"}
                  </h4>
                  <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                    {isRecording
                      ? `Time Remaining: ${speakSeconds}s (Target: 110-120s)`
                      : "Speak continuously for 2 minutes to fulfill official criteria."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full sm:w-auto">
                {isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF8A65] hover:bg-[#E87652] text-white font-semibold text-xs shadow-md shadow-[#FF8A65]/25 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-white font-semibold text-xs shadow-md shadow-[#25A995]/25 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Speaking (2 min)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Audio Waveform simulation */}
            <div className="h-10 bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-xl p-2 flex items-center justify-between gap-1 overflow-hidden">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    isRecording
                      ? "bg-[#25A995]"
                      : "bg-[#D4E8E3] dark:bg-[#205653]"
                  }`}
                  style={{
                    height: isRecording
                      ? `${20 + Math.sin(i * 0.5 + Date.now() / 200) * 70}%`
                      : "25%",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Transcript Review & Edit (Section 4.4 requirement) */}
          <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#D4E8E3] dark:border-[#205653]">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-[#25A995]" />
                <h4 className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">Speech-to-Text Verbatim Transcript</h4>
              </div>
              <span className="text-[10px] text-[#3D6462] dark:text-[#A0C5C1]">
                You can edit transcription typos before grading
              </span>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-32 p-3 bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-xl text-xs text-[#123C3A] dark:text-[#F4FAF8] leading-relaxed resize-none focus:outline-none focus:border-[#25A995]"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">
                Original student audio is securely isolated with retention control.
              </span>

              <button
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] text-white font-semibold text-xs shadow-md shadow-[#25A995]/25 flex items-center justify-center gap-2 transition-all"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Evaluating Speech...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Speaking Rubric</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rubric Feedback Output */}
          {feedback && (
            <div className="bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#25A995]/40 space-y-4 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-[#D4E8E3] dark:border-[#205653]">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#25A995]" />
                  <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                    Estimated Speaking Score: Band {feedback.overallBand.toFixed(1)}
                  </h3>
                </div>
                <span className="text-[10px] bg-[#F4FAF8] dark:bg-[#0A1C1B] text-[#3D6462] dark:text-[#A0C5C1] px-2 py-0.5 rounded border border-[#D4E8E3] dark:border-[#205653]">
                  Unofficial Practice Estimate
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(feedback.criteria).map(([key, val]: [string, any]) => (
                  <div key={key} className="bg-[#F4FAF8] dark:bg-[#0A1C1B]/80 border border-[#D4E8E3] dark:border-[#205653] p-3 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#123C3A] dark:text-[#F4FAF8]">{val.title}</span>
                      <span className="font-extrabold text-[#25A995]">Band {val.score.toFixed(1)}</span>
                    </div>
                    <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">{val.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
