"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Headphones,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  Award,
  Search,
  ArrowRight,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  Send,
  Loader2,
  Info,
  ShieldCheck,
  FileText,
  FastForward,
  HelpCircle,
  Eye,
  EyeOff,
  Radio,
  Sliders,
} from "lucide-react";
import {
  LISTENING_RAW_SCORE_GUIDE,
  LISTENING_QUESTION_TYPES,
  LISTENING_PARTS,
  ListeningPartData,
  ListeningQuestionItem,
  ListeningQuestionTypeDefinition,
  validateListeningAnswer,
} from "@/lib/listening-module-data";
import { ListeningEvaluationResult } from "@/lib/practice-data";
import { ExamAttemptSummary } from "@/server/services/mock.service";

export type PracticeMode = "learning" | "timed" | "simulation";

export default function ListeningModuleView() {
  const searchParams = useSearchParams();
  const queryQuestion = searchParams.get("q");

  // Profile & Exam History State
  const [profile, setProfile] = useState<{
    targetBand: number;
    fullName: string;
    testType: string;
  }>({
    targetBand: 7.5,
    fullName: "Learner",
    testType: "academic",
  });
  const [attempts, setAttempts] = useState<ExamAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Practice Mode
  const [activeMode, setActiveMode] = useState<PracticeMode>("learning");

  // Question Type Library State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedTypeId, setExpandedTypeId] = useState<string | null>(() => {
    if (!queryQuestion) return null;
    const matched = LISTENING_QUESTION_TYPES.find(
      (qt) => qt.id.toLowerCase() === queryQuestion.toLowerCase()
    );
    return matched ? matched.id : null;
  });

  // Micro-drill state for Question Types Library
  const [drillAnswers, setDrillAnswers] = useState<Record<string, string>>({});
  const [drillEvaluations, setDrillEvaluations] = useState<
    Record<
      string,
      {
        isCorrect: boolean;
        statusMessage: string;
        wordCount: number;
        wordLimitExceeded: boolean;
      }
    >
  >({});
  const [drillRevealed, setDrillRevealed] = useState<Record<string, boolean>>({});

  // In-Page Interactive Practice Lab State
  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(0);
  const [labAnswers, setLabAnswers] = useState<Record<string, string>>({});
  const [labSubmitted, setLabSubmitted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<ListeningEvaluationResult | null>(null);
  const [savedMistakes, setSavedMistakes] = useState<Set<string>>(new Set());
  const [savingMistakeId, setSavingMistakeId] = useState<string | null>(null);

  // Audio Player State & Dual-Engine Architecture
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioProgressSeconds, setAudioProgressSeconds] = useState<number>(0);
  const [audioDurationSeconds, setAudioDurationSeconds] = useState<number>(180);
  const [isAudioCompleted, setIsAudioCompleted] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [simulationPlayCount, setSimulationPlayCount] = useState<number>(0);
  const [previewCountdown, setPreviewCountdown] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [playbackEngine, setPlaybackEngine] = useState<"html_audio" | "speech_synthesis">("html_audio");
  const [audioLoadError, setAudioLoadError] = useState<string | null>(null);
  const [showProvenanceDetails, setShowProvenanceDetails] = useState<boolean>(false);

  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active Part Data
  const activePart: ListeningPartData = useMemo(() => {
    return LISTENING_PARTS[selectedPartIndex] || LISTENING_PARTS[0];
  }, [selectedPartIndex]);

  // Fetch Profile & History
  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/attempts").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([profData, attData]) => {
        if (!mounted) return;
        if (profData?.profile) {
          setProfile({
            targetBand: profData.profile.targetBand || 7.5,
            fullName: profData.profile.fullName || "Learner",
            testType: profData.profile.testType || "academic",
          });
        }
        if (attData?.attempts) {
          setAttempts(attData.attempts);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Filter Question Types Library
  const filteredQuestionTypes = useMemo(() => {
    return LISTENING_QUESTION_TYPES.filter((qt) => {
      if (selectedCategory !== "all" && qt.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = qt.name.toLowerCase().includes(q);
        const matchesSkill = qt.skillAssessed.toLowerCase().includes(q);
        const matchesCategory = qt.category.toLowerCase().includes(q);
        if (!matchesName && !matchesSkill && !matchesCategory) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Listening-specific attempts
  const listeningAttempts = useMemo(() => {
    return attempts.filter((att) => {
      const titleLower = att.examTitle.toLowerCase();
      return (
        titleLower.includes("listening") ||
        (att.listeningScore !== null && att.status === "evaluated")
      );
    });
  }, [attempts]);

  // Cleanup speech synthesis and audio element on unmount or part change
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    stopAudio();
    setAudioProgressSeconds(0);
    setIsAudioCompleted(false);
    setSimulationPlayCount(0);
    setPreviewCountdown(null);
    setAudioLoadError(null);
    setAudioDurationSeconds(activePart.audioDurationSeconds);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [selectedPartIndex, activeMode, stopAudio, activePart]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = activeMode === "simulation" ? 1.0 : playbackSpeed;
      audioRef.current.muted = muted;
    }
  }, [playbackSpeed, muted, activeMode]);

  // Utility to parse time string ("0:10", "1:45") to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
    if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    return Number(timeStr) || 0;
  };

  // Seeking range controller (Learning Mode only)
  const handleSeek = (newSeconds: number) => {
    if (activeMode === "simulation") return;
    const bounded = Math.max(0, Math.min(newSeconds, audioDurationSeconds || activePart.audioDurationSeconds));
    setAudioProgressSeconds(bounded);
    if (playbackEngine === "html_audio" && audioRef.current) {
      audioRef.current.currentTime = bounded;
    }
  };

  // Jump playback to timestamp (Learning mode or review)
  const handleJumpToTimestamp = (timestampStr: string) => {
    if (activeMode === "simulation") return;
    const sec = parseTimeToSeconds(timestampStr);
    handleSeek(sec);
    if (!isPlaying && playbackEngine === "html_audio" && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Speech Synthesis Playback Fallback
  const startSpeechSynthesis = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Browser speech synthesis is not supported in this environment.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(activePart.fullTranscript);
    utterance.rate = activeMode === "simulation" ? 1.0 : playbackSpeed;
    utterance.pitch = 1.0;

    // Try finding English voices
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang.includes("en-GB") || v.lang.includes("en-AU")) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      if (activeMode === "simulation") {
        setSimulationPlayCount((c) => c + 1);
      }
      // Start progress ticker
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setAudioProgressSeconds((prev) => {
          if (prev >= activePart.audioDurationSeconds) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setIsPlaying(false);
            setIsAudioCompleted(true);
            return activePart.audioDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000 / (activeMode === "simulation" ? 1.0 : playbackSpeed));
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsAudioCompleted(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [activeMode, activePart, playbackSpeed]);

  // Primary Playback Initiator (HTML5 Audio with automatic SpeechSynthesis fallback)
  const startPlayback = useCallback(() => {
    // Exam Simulation one-play constraint
    if (activeMode === "simulation" && simulationPlayCount >= 1) {
      alert("Official IELTS Simulation Rule: In Exam Simulation mode, each part audio is played strictly ONCE.");
      return;
    }

    if (playbackEngine === "html_audio" && activePart.audioUrl && !audioLoadError) {
      if (audioRef.current) {
        audioRef.current.playbackRate = activeMode === "simulation" ? 1.0 : playbackSpeed;
        audioRef.current.muted = muted;
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            if (activeMode === "simulation") {
              setSimulationPlayCount((c) => c + 1);
            }
          })
          .catch((err) => {
            console.warn("HTML5 audio playback error, falling back to Web Speech:", err);
            setPlaybackEngine("speech_synthesis");
            startSpeechSynthesis();
          });
        return;
      }
    }

    startSpeechSynthesis();
  }, [activeMode, activePart, playbackEngine, playbackSpeed, muted, simulationPlayCount, audioLoadError, startSpeechSynthesis]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      if (activeMode === "simulation") {
        alert("Exam Simulation Notice: Pausing is discouraged during full exam condition, but audio will halt.");
      }
      if (playbackEngine === "html_audio" && audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      if (playbackEngine === "html_audio" && audioRef.current) {
        if ((activeMode === "timed" || activeMode === "simulation") && audioProgressSeconds === 0) {
          setPreviewCountdown(30);
          const countInterval = setInterval(() => {
            setPreviewCountdown((cd) => {
              if (cd !== null && cd <= 1) {
                clearInterval(countInterval);
                setPreviewCountdown(null);
                startPlayback();
                return null;
              }
              return cd !== null ? cd - 1 : null;
            });
          }, 1000);
        } else {
          startPlayback();
        }
      } else {
        if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
          timerIntervalRef.current = setInterval(() => {
            setAudioProgressSeconds((prev) => {
              if (prev >= activePart.audioDurationSeconds) {
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                setIsPlaying(false);
                setIsAudioCompleted(true);
                return activePart.audioDurationSeconds;
              }
              return prev + 1;
            });
          }, 1000 / (activeMode === "simulation" ? 1.0 : playbackSpeed));
        } else {
          // Pre-listening countdown in Timed/Simulation mode
          if ((activeMode === "timed" || activeMode === "simulation") && audioProgressSeconds === 0) {
            setPreviewCountdown(30);
            const countInterval = setInterval(() => {
              setPreviewCountdown((cd) => {
                if (cd !== null && cd <= 1) {
                  clearInterval(countInterval);
                  setPreviewCountdown(null);
                  startPlayback();
                  return null;
                }
                return cd !== null ? cd - 1 : null;
              });
            }, 1000);
          } else {
            startPlayback();
          }
        }
      }
    }
  };

  // Replay from start (Learning Mode only)
  const handleReplay = () => {
    if (activeMode === "simulation") {
      alert("Replay is disabled in Exam Simulation mode. Standard IELTS audio plays once.");
      return;
    }
    stopAudio();
    setAudioProgressSeconds(0);
    setIsAudioCompleted(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setTimeout(() => startPlayback(), 150);
  };

  // Play Micro-Drill Sample Speech
  const playSampleAudio = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.includes("en-GB")) || voices.find((v) => v.lang.startsWith("en"));
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  };

  // Check Micro-Drill Answer
  const handleCheckDrillAnswer = (qt: ListeningQuestionTypeDefinition) => {
    const student = drillAnswers[qt.id] || "";
    const result = validateListeningAnswer(student, {
      correctAnswer: qt.sampleQuestion.correctAnswer,
      acceptedVariants: qt.sampleQuestion.acceptedVariants,
      wordLimitRule: qt.wordLimitRule,
    });
    setDrillEvaluations((prev) => ({
      ...prev,
      [qt.id]: {
        isCorrect: result.isCorrect,
        statusMessage: result.statusMessage,
        wordCount: result.wordCount,
        wordLimitExceeded: result.wordLimitExceeded,
      },
    }));
    setDrillRevealed((prev) => ({ ...prev, [qt.id]: true }));
  };

  // Submit Practice Lab
  const handleSubmitLab = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_listening",
          answers: labAnswers,
          assessmentType: activeMode === "simulation" ? "full_listening_mock" : "sectional_practice",
          partNumber: (selectedPartIndex + 1) as 1 | 2 | 3 | 4,
          persist: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        setLabSubmitted(true);
        // Refresh attempts
        fetch("/api/attempts")
          .then((r) => r.json())
          .then((d) => d.success && setAttempts(d.attempts))
          .catch(() => {});
      }
    } catch {
      // Offline / fallback local evaluation
      let correctCount = 0;
      const questionResults = activePart.questions.map((q) => {
        const studentAns = labAnswers[q.id] || "";
        const val = validateListeningAnswer(studentAns, {
          correctAnswer: q.correctAnswer,
          acceptedVariants: q.acceptedVariants,
          wordLimitRule: q.wordLimitRule,
          maxWords: q.maxWords,
          allowNumber: q.allowNumber,
          maxNumbers: q.maxNumbers,
          typeId: q.typeId,
        });
        if (val.isCorrect) correctCount++;
        return {
          questionId: q.id,
          number: q.number,
          studentAnswer: studentAns || "No answer provided",
          correctAnswer: q.correctAnswer,
          isCorrect: val.isCorrect,
          explanation: q.explanation,
          transcriptTimestamp: q.transcriptTimestamp,
          wordCount: val.wordCount,
          wordLimitExceeded: val.wordLimitExceeded,
          statusMessage: val.statusMessage,
        };
      });

      const total = activePart.questions.length;
      const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      setEvaluation({
        score: correctCount,
        total,
        percentage: accuracy,
        estimatedBand: null,
        assessmentType: "sectional_practice",
        partNumber: selectedPartIndex + 1,
        maxScore: total,
        correctCount,
        unansweredCount: total - Object.keys(labAnswers).filter((k) => labAnswers[k]?.trim()).length,
        accuracy,
        confidenceLabel: "insufficient_evidence",
        statusMessage: `Sectional Result: ${correctCount} / ${total} correct (${accuracy}% accuracy). Official IELTS bands require 40 questions under full test conditions.`,
        isUnofficial: true,
        questionResults,
        mistakesToRecord: [],
      });
      setLabSubmitted(true);
    } finally {
      setEvaluating(false);
    }
  };

  // Save single mistake to Mistake Notebook
  const handleSaveMistake = async (q: ListeningQuestionItem, studentAnswer: string) => {
    setSavingMistakeId(q.id);
    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "listening",
          errorTag: q.typeLabel === "Form Completion" ? "Spelling & Numbers" : "Distractor Trap",
          questionPrompt: q.prompt,
          studentAnswer: studentAnswer || "Blank",
          reasoning: `${q.explanation} (Audio Timestamp: ${q.transcriptTimestamp})`,
        }),
      });
      if (res.ok) {
        setSavedMistakes((prev) => new Set(prev).add(q.id));
      }
    } catch {}
    setSavingMistakeId(null);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true">
        <div className="h-44 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
          <div className="h-96 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ==================================================================== */}
      {/* 1. MODULE HERO BANNER & SPECIFICATION SUMMARY                       */}
      {/* ==================================================================== */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-6 transition-colors">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
              <Headphones className="w-3.5 h-3.5" />
              <span>Standard 4-Part Structure</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995] text-xs font-semibold border border-[#D4E8E3] dark:border-[#205653]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic &amp; General Training Identical</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] text-xs font-semibold">
              <Target className="w-3.5 h-3.5 text-[#25A995]" />
              <span>Target Band: {profile.targetBand.toFixed(1)}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            IELTS Listening Module
          </h1>

          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] max-w-3xl leading-relaxed">
            Master the computer-delivered and paper IELTS Listening test. Unlike Reading and Writing, the
            Listening format, audio recordings, grading standards, and indicative band thresholds are{" "}
            <strong className="text-[#123C3A] dark:text-[#F4FAF8] font-semibold">
              identical for both Academic and General Training
            </strong>{" "}
            candidates.
          </p>

          {/* Quick Metrics Bar: 4 Information Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#F4FAF8] dark:bg-[#174A48] rounded-2xl p-3.5 border border-[#D4E8E3] dark:border-[#205653]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D6462] dark:text-[#A0C5C1]">
                <Clock className="w-3.5 h-3.5 text-[#25A995]" />
                Duration
              </div>
              <div className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] mt-1">30 + 2 mins</div>
              <div className="text-[11px] text-[#6B8E8C] dark:text-[#739B97]">Audio + Review Time</div>
            </div>

            <div className="bg-[#F4FAF8] dark:bg-[#174A48] rounded-2xl p-3.5 border border-[#D4E8E3] dark:border-[#205653]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D6462] dark:text-[#A0C5C1]">
                <FileText className="w-3.5 h-3.5 text-[#25A995]" />
                Structure
              </div>
              <div className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] mt-1">4 Recorded Parts</div>
              <div className="text-[11px] text-[#6B8E8C] dark:text-[#739B97]">Played ONCE only</div>
            </div>

            <div className="bg-[#F4FAF8] dark:bg-[#174A48] rounded-2xl p-3.5 border border-[#D4E8E3] dark:border-[#205653]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D6462] dark:text-[#A0C5C1]">
                <Target className="w-3.5 h-3.5 text-[#25A995]" />
                Total Questions
              </div>
              <div className="text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8] mt-1">40 Questions</div>
              <div className="text-[11px] text-[#6B8E8C] dark:text-[#739B97]">1 Mark Per Question</div>
            </div>

            <div className="bg-[#F4FAF8] dark:bg-[#174A48] rounded-2xl p-3.5 border border-[#D4E8E3] dark:border-[#205653]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D6462] dark:text-[#A0C5C1]">
                <Award className="w-3.5 h-3.5 text-[#25A995]" />
                Band 7.0 Target
              </div>
              <div className="text-lg font-bold text-[#25A995] mt-1">30 - 31 Correct</div>
              <div className="text-[11px] text-[#6B8E8C] dark:text-[#739B97]">Indicative benchmark</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. 3 PRACTICE MODES SELECTOR                                         */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#25A995]" />
              Select Practice Mode
            </h2>
            <p className="text-xs text-[#6B8E8C] dark:text-[#A0C5C1]">
              Choose your practice condition depending on your learning phase.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mode A: Learning Mode */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveMode("learning")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveMode("learning");
              }
            }}
            className={`cursor-pointer rounded-2xl p-5 border transition-all text-left ${
              activeMode === "learning"
                ? "bg-[#E8F7F4] dark:bg-[#174A48] border-[#25A995] dark:border-[#25A995] ring-2 ring-[#25A995]/20 shadow-xs"
                : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995]/60 hover:shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                activeMode === "learning"
                  ? "bg-[#25A995] text-white"
                  : "bg-[#25A995]/15 text-[#25A995]"
              }`}>
                Mode A
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Exploratory
              </span>
            </div>
            <h3 className="font-bold text-[#123C3A] dark:text-[#F4FAF8] text-base">
              Learning Mode
            </h3>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-1 leading-relaxed">
              Ideal for skill building. Pause, replay, adjust audio speed (0.75x to 1.25x), and view
              timestamped transcript evidence while answering.
            </p>
            <ul className="text-[11px] text-[#6B8E8C] dark:text-[#739B97] mt-3 space-y-1">
              <li>• Replay and seek timeline enabled</li>
              <li>• Speed control: 0.75x, 1x, 1.25x</li>
              <li>• Interactive transcript synchronization</li>
            </ul>
          </div>

          {/* Mode B: Timed Practice */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveMode("timed")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveMode("timed");
              }
            }}
            className={`cursor-pointer rounded-2xl p-5 border transition-all text-left ${
              activeMode === "timed"
                ? "bg-[#E8F7F4] dark:bg-[#174A48] border-[#25A995] dark:border-[#25A995] ring-2 ring-[#25A995]/20 shadow-xs"
                : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995]/60 hover:shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                activeMode === "timed"
                  ? "bg-[#25A995] text-white"
                  : "bg-[#25A995]/15 text-[#25A995]"
              }`}>
                Mode B
              </span>
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Timed Sections
              </span>
            </div>
            <h3 className="font-bold text-[#123C3A] dark:text-[#F4FAF8] text-base">
              Timed Practice
            </h3>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-1 leading-relaxed">
              Drill single sections under realistic time pressure. Includes 30-second reading time preview
              and a 2-minute review period before submission.
            </p>
            <ul className="text-[11px] text-[#6B8E8C] dark:text-[#739B97] mt-3 space-y-1">
              <li>• 30-second preview countdown</li>
              <li>• Single or optional 2nd educational play</li>
              <li>• Transcripts hidden until submission</li>
            </ul>
          </div>

          {/* Mode C: Full Simulation */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveMode("simulation")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveMode("simulation");
              }
            }}
            className={`cursor-pointer rounded-2xl p-5 border transition-all text-left ${
              activeMode === "simulation"
                ? "bg-[#E8F7F4] dark:bg-[#174A48] border-[#25A995] dark:border-[#25A995] ring-2 ring-[#25A995]/20 shadow-xs"
                : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995]/60 hover:shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                activeMode === "simulation"
                  ? "bg-[#25A995] text-white"
                  : "bg-[#25A995]/15 text-[#25A995]"
              }`}>
                Mode C
              </span>
              <span className="text-xs font-semibold text-[#FF8A65] dark:text-[#FFA285] bg-[#FFF1EC] dark:bg-[#FF8A65]/10 border border-[#FF8A65]/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF8A65]" />
                Exam Condition
              </span>
            </div>
            <h3 className="font-bold text-[#123C3A] dark:text-[#F4FAF8] text-base">
              Full Exam Simulation
            </h3>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-1 leading-relaxed">
              Strict exam simulation. 4 consecutive parts, 40 distinct questions, strict one-play audio
              policy. Seeking, pausing, and speed alterations are locked.
            </p>
            <ul className="text-[11px] text-[#6B8E8C] dark:text-[#739B97] mt-3 space-y-1">
              <li>• Strictly ONE play per audio part</li>
              <li>• Seeking and speed controls disabled</li>
              <li>• Full 40-question score calibration</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. INTERACTIVE PRACTICE LAB & CALIBRATED AUDIO PLAYER                 */}
      {/* ==================================================================== */}
      <section className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-6 md:p-8 shadow-xs space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4E8E3] dark:border-[#205653]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#25A995] text-white">
                Practice Lab
              </span>
              <span className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                Mode: <strong className="capitalize text-[#25A995]">{activeMode}</strong>
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8] mt-1">
              {activePart.title}
            </h3>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              {activePart.context} • Speakers: {activePart.speakers}
            </p>
          </div>

          {/* Part Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-[#F4FAF8] dark:bg-[#174A48] p-1.5 rounded-2xl border border-[#D4E8E3] dark:border-[#205653]">
            {LISTENING_PARTS.map((p, idx) => (
              <button
                key={p.partNumber}
                onClick={() => {
                  setSelectedPartIndex(idx);
                  setLabSubmitted(false);
                  setEvaluation(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedPartIndex === idx
                    ? "bg-[#25A995] text-white shadow-xs"
                    : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                }`}
              >
                Part {p.partNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Hidden HTML5 Audio Element */}
        <audio
          ref={audioRef}
          src={activePart.audioUrl}
          preload="metadata"
          onTimeUpdate={() => {
            if (audioRef.current) {
              setAudioProgressSeconds(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration) {
              setAudioDurationSeconds(audioRef.current.duration);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setIsAudioCompleted(true);
          }}
          onError={() => {
            console.warn("Direct HTML5 audio playback failed, falling back to Web Speech:", activePart.audioUrl);
            setAudioLoadError("Physical audio file unavailable. Falling back to browser SpeechSynthesis.");
            setPlaybackEngine("speech_synthesis");
          }}
        />

        {/* Audio Player Controller Card */}
        <div className="bg-[#F4FAF8] dark:bg-[#174A48] rounded-2xl p-5 border border-[#D4E8E3] dark:border-[#205653] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Headphones className="w-4 h-4 text-[#25A995]" />
                <span className="text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                  {activePart.audioTitle}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1]">
                  {activePart.accent}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                  playbackEngine === "html_audio" 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                }`}>
                  {playbackEngine === "html_audio" ? "HD Audio (.wav)" : "SpeechSynthesis (Fallback)"}
                </span>
              </div>
              <p className="text-[11px] text-[#6B8E8C] dark:text-[#739B97] mt-0.5">
                {activePart.syntheticNotice}
              </p>
            </div>

            {/* Playback Controls & Engine Selector */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Engine Switcher */}
              <div className="flex items-center bg-white dark:bg-[#123C3A] rounded-xl border border-[#D4E8E3] dark:border-[#205653] p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    stopAudio();
                    setPlaybackEngine("html_audio");
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    playbackEngine === "html_audio"
                      ? "bg-[#25A995] text-white shadow-xs"
                      : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                  }`}
                  title="Play recorded / high-definition .wav audio"
                >
                  HD Audio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopAudio();
                    setPlaybackEngine("speech_synthesis");
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    playbackEngine === "speech_synthesis"
                      ? "bg-[#25A995] text-white shadow-xs"
                      : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                  }`}
                  title="Use Web Speech API SpeechSynthesis fallback"
                >
                  TTS Fallback
                </button>
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={handleTogglePlay}
                disabled={activeMode === "simulation" && simulationPlayCount >= 1 && isAudioCompleted}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                  activeMode === "simulation" && simulationPlayCount >= 1 && isAudioCompleted
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#25A995] hover:bg-[#1D8B7A] active:scale-95 shadow-[#25A995]/20"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    Pause Audio
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    {previewCountdown !== null ? `Starting in ${previewCountdown}s...` : "Play Recording"}
                  </>
                )}
              </button>

              {/* Replay Button (Disabled in simulation) */}
              <button
                onClick={handleReplay}
                disabled={activeMode === "simulation"}
                title={
                  activeMode === "simulation"
                    ? "Replay is disabled in full exam simulation"
                    : "Replay audio from start"
                }
                className={`p-2 rounded-xl border text-xs transition-all ${
                  activeMode === "simulation"
                    ? "opacity-40 cursor-not-allowed border-gray-300 dark:border-gray-700 text-gray-400"
                    : "border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] hover:bg-[#E8F7F4] dark:hover:bg-[#174A48]"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed Controller (Locked to 1x in Simulation) */}
              {activeMode !== "simulation" ? (
                <div className="flex items-center gap-1 bg-white dark:bg-[#123C3A] px-2 py-1 rounded-xl border border-[#D4E8E3] dark:border-[#205653]">
                  <FastForward className="w-3.5 h-3.5 text-gray-400" />
                  {[0.75, 1.0, 1.25].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        playbackSpeed === speed
                          ? "bg-[#25A995] text-white"
                          : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] px-2 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono">
                  Speed: 1.0x (Exam locked)
                </span>
              )}

              {/* Mute Toggle */}
              <button
                onClick={() => setMuted(!muted)}
                className="p-2 rounded-xl border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:bg-[#E8F7F4] dark:hover:bg-[#174A48]"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Audio Timeline & Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#6B8E8C] dark:text-[#739B97]">
              <span>
                {Math.floor(audioProgressSeconds / 60)}:
                {String(Math.floor(audioProgressSeconds % 60)).padStart(2, "0")}
              </span>
              <span>
                {Math.floor((audioDurationSeconds || activePart.audioDurationSeconds) / 60)}:
                {String(Math.floor((audioDurationSeconds || activePart.audioDurationSeconds) % 60)).padStart(2, "0")}
              </span>
            </div>

            {playbackEngine === "html_audio" ? (
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={audioDurationSeconds || activePart.audioDurationSeconds}
                  step={0.5}
                  value={audioProgressSeconds}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  disabled={activeMode === "simulation"}
                  aria-label="Audio scrubber"
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#25A995] disabled:cursor-not-allowed"
                />
                <div className="flex items-center justify-between text-[10px] text-[#6B8E8C] dark:text-[#739B97]">
                  <span>
                    {activeMode === "simulation"
                      ? "Scrubbing is locked during authentic IELTS simulation."
                      : "Drag slider to scrub through audio in Learning Mode."}
                  </span>
                  <span>16-bit 22kHz PCM Audio</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="relative w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-amber-500 to-[#25A995] transition-all duration-300 rounded-full ${
                      isPlaying ? "animate-pulse" : ""
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (audioProgressSeconds / activePart.audioDurationSeconds) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>SpeechSynthesis streaming mode: Seeking is not supported by browser TTS. Progress is approximate.</span>
                </div>
              </div>
            )}
          </div>

          {/* Audio Provenance & Checksum Drawer Toggle */}
          <div className="pt-2 border-t border-[#D4E8E3] dark:border-[#205653] flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowProvenanceDetails(!showProvenanceDetails)}
              className="inline-flex items-center gap-1.5 text-xs text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#25A995]"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showProvenanceDetails ? "Hide" : "View"} Audio Provenance & Integrity Metadata</span>
            </button>

            {/* Transcript Drawer Toggle */}
            {(activeMode === "learning" || labSubmitted) && (
              <button
                type="button"
                onClick={() => setShowTranscript(!showTranscript)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25A995] hover:underline"
              >
                {showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showTranscript ? "Hide Transcript & Timestamps" : "View Synchronized Audio Transcript"}
              </button>
            )}
          </div>

          {/* Audio Provenance Details Box */}
          {showProvenanceDetails && (
            <div className="p-3 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[11px] space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2 text-[#3D6462] dark:text-[#A0C5C1]">
                <span><strong>Voice Profile:</strong> {activePart.voiceName} ({activePart.voiceLanguage})</span>
                <span><strong>Engine:</strong> {activePart.ttsProvider}</span>
                <span><strong>File Size:</strong> {(activePart.audioFileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div className="text-[#6B8E8C] dark:text-[#739B97] font-mono text-[10px] break-all">
                <strong>SHA-256 Checksum:</strong> {activePart.audioSha256}
              </div>
              <p className="text-[10px] text-[#6B8E8C] dark:text-[#739B97] italic pt-1">
                {activePart.voiceProvenance}. Calibrated for diagnostic practice.
              </p>
            </div>
          )}

          {/* Synchronized Transcript Drawer */}
          {(activeMode === "learning" || labSubmitted) && showTranscript && (
            <div className="mt-3 p-4 bg-white dark:bg-[#123C3A] rounded-xl border border-[#D4E8E3] dark:border-[#205653] max-h-64 overflow-y-auto space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-[#D4E8E3] dark:border-[#205653] text-[10px] text-[#6B8E8C] dark:text-[#739B97]">
                <span>{activeMode === "learning" && playbackEngine === "html_audio" ? "Click any segment to jump audio" : "Synchronized transcript"}</span>
                <span>Part {activePart.partNumber} Dialogue</span>
              </div>
              {activePart.transcriptSegments.map((seg, idx) => {
                const startSec = parseTimeToSeconds(seg.startTime);
                const endSec = parseTimeToSeconds(seg.endTime);
                const isCurrentSegment =
                  audioProgressSeconds >= startSec && audioProgressSeconds < endSec;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (activeMode === "learning" && playbackEngine === "html_audio") {
                        handleJumpToTimestamp(seg.startTime);
                      }
                    }}
                    className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                      activeMode === "learning" && playbackEngine === "html_audio"
                        ? "cursor-pointer hover:bg-[#E8F7F4] dark:hover:bg-[#174A48]"
                        : ""
                    } ${
                      isCurrentSegment
                        ? "bg-[#E8F7F4] dark:bg-[#174A48] border-l-4 border-[#25A995] shadow-xs"
                        : "hover:bg-[#F4FAF8] dark:hover:bg-[#174A48]/50"
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] shrink-0 mt-0.5 px-1.5 py-0.5 rounded ${
                        isCurrentSegment
                          ? "bg-[#25A995] text-white font-bold"
                          : "bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1]"
                      }`}
                    >
                      {seg.startTime}
                    </span>
                    <div className="flex-1">
                      <strong
                        className={`mr-1.5 ${
                          isCurrentSegment
                            ? "text-[#25A995] font-bold"
                            : "text-[#123C3A] dark:text-[#F4FAF8]"
                        }`}
                      >
                        {seg.speaker}:
                      </strong>
                      <span className="text-[#3D6462] dark:text-[#A0C5C1]">{seg.text}</span>
                      {seg.questionRef && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995]">
                          Target for {seg.questionRef.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Questions List for Active Part */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#123C3A] dark:text-[#F4FAF8] text-base">
              Questions {activePart.questions[0].number} –{" "}
              {activePart.questions[activePart.questions.length - 1].number}
            </h4>
            <span className="text-xs text-[#6B8E8C] dark:text-[#739B97]">
              {activePart.questions.length} questions • All fields mandatory
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePart.questions.map((q) => {
              const studentVal = labAnswers[q.id] || "";
              const qEval = evaluation?.questionResults.find((qr) => qr.questionId === q.id);
              const isSaved = savedMistakes.has(q.id);

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    labSubmitted && qEval
                      ? qEval.isCorrect
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                        : "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
                      : "bg-[#F4FAF8] dark:bg-[#174A48]/40 border-[#D4E8E3] dark:border-[#205653]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#25A995] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {q.number}
                      </span>
                      <span className="text-[11px] font-semibold text-[#6B8E8C] dark:text-[#739B97] uppercase tracking-wide">
                        {q.typeLabel}
                      </span>
                    </div>

                    {q.wordLimitRule && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] font-mono">
                        {q.wordLimitRule}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-[#123C3A] dark:text-[#F4FAF8] mb-3">
                    {q.prompt}
                  </p>

                  {/* Input or Options */}
                  {q.options && q.options.length > 0 ? (
                    <div className="space-y-1.5 mb-2">
                      {q.options.map((opt, oIdx) => {
                        const optLetter = opt.charAt(0);
                        const isSelected = studentVal === optLetter || studentVal === opt;
                        return (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                              isSelected
                                ? "bg-[#E8F7F4] dark:bg-[#174A48] border-[#25A995] text-[#123C3A] dark:text-[#F4FAF8] font-medium"
                                : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:bg-[#F4FAF8] dark:hover:bg-[#174A48]/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`radio-${q.id}`}
                              disabled={labSubmitted}
                              checked={isSelected}
                              onChange={() =>
                                setLabAnswers((prev) => ({ ...prev, [q.id]: optLetter }))
                              }
                              className="w-3.5 h-3.5 text-[#25A995] focus:ring-[#25A995]"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      disabled={labSubmitted}
                      placeholder="Type your answer here..."
                      value={studentVal}
                      onChange={(e) =>
                        setLabAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl text-xs border border-[#D4E8E3] dark:border-[#205653] bg-white dark:bg-[#123C3A] text-[#123C3A] dark:text-[#F4FAF8] placeholder:text-[#6B8E8C] focus:outline-none focus:ring-2 focus:ring-[#25A995]"
                    />
                  )}

                  {/* Post-Submission Feedback & Mistake Notebook */}
                  {labSubmitted && qEval && (
                    <div className="mt-3 pt-3 border-t border-[#D4E8E3] dark:border-[#205653] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            qEval.isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {qEval.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          {qEval.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleJumpToTimestamp(q.transcriptTimestamp)}
                          className="text-[11px] text-[#25A995] font-mono hover:underline inline-flex items-center gap-1 cursor-pointer"
                          title="Jump audio to this question cue"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          Timestamp: {q.transcriptTimestamp}
                        </button>
                      </div>

                      {!qEval.isCorrect && (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[11px] space-y-1">
                          <div>
                            <span className="text-[#6B8E8C] dark:text-[#739B97]">Correct Answer: </span>
                            <strong className="text-emerald-700 dark:text-emerald-400">
                              {q.correctAnswer}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#6B8E8C] dark:text-[#739B97]">Trap: </span>
                            <span className="text-rose-600 dark:text-rose-400">{q.distractorTrap}</span>
                          </div>
                          <p className="text-[#3D6462] dark:text-[#A0C5C1] text-[11px] pt-1">
                            {q.explanation}
                          </p>

                          {/* Save Mistake Notebook Button */}
                          <div className="pt-1.5 flex justify-end">
                            <button
                              onClick={() => handleSaveMistake(q, studentVal)}
                              disabled={isSaved || savingMistakeId === q.id}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                isSaved
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 cursor-default"
                                  : "bg-[#25A995] text-white hover:bg-[#1D8B7A]"
                              }`}
                            >
                              {savingMistakeId === q.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : isSaved ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Bookmark className="w-3 h-3" />
                              )}
                              {isSaved ? "Saved to Notebook" : "Save to Notebook"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#D4E8E3] dark:border-[#205653]">
            <div className="text-xs text-[#6B8E8C] dark:text-[#739B97]">
              Answered {Object.keys(labAnswers).filter((k) => labAnswers[k]?.trim()).length} of{" "}
              {activePart.questions.length} questions
            </div>

            <div className="flex items-center gap-3">
              {labSubmitted ? (
                <button
                  onClick={() => {
                    setLabAnswers({});
                    setLabSubmitted(false);
                    setEvaluation(null);
                    stopAudio();
                    setAudioProgressSeconds(0);
                    setIsAudioCompleted(false);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-[#25A995] text-[#25A995] hover:bg-[#E8F7F4] dark:hover:bg-[#174A48] transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Part {activePart.partNumber}
                </button>
              ) : (
                <button
                  onClick={handleSubmitLab}
                  disabled={evaluating}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#25A995] hover:bg-[#1D8B7A] active:scale-95 transition-all shadow-md shadow-[#25A995]/20 disabled:opacity-50"
                >
                  {evaluating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit & Score Part {activePart.partNumber}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. 13 OFFICIAL IELTS LISTENING QUESTION TYPES LIBRARY               */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#25A995]" />
              Official Question Types Library (13 Formats)
            </h2>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
              Interactive micro-drills, distractor analysis, and step-by-step strategies for every IELTS
              listening format.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search question types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-[#D4E8E3] dark:border-[#205653] bg-white dark:bg-[#123C3A] text-[#123C3A] dark:text-[#F4FAF8] placeholder:text-[#6B8E8C] focus:outline-none focus:ring-2 focus:ring-[#25A995]"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {["all", "Completion", "Multiple Choice", "Matching", "Labelling"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-[#25A995] text-white shadow-xs"
                  : "bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
              }`}
            >
              {cat === "all" ? "All Categories (13)" : cat}
            </button>
          ))}
        </div>

        {/* Question Type Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestionTypes.map((qt) => {
            const isExpanded = expandedTypeId === qt.id;
            const studentDrillAns = drillAnswers[qt.id] || "";
            const drillEval = drillEvaluations[qt.id];

            return (
              <div
                key={qt.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? "md:col-span-2 lg:col-span-3 bg-white dark:bg-[#123C3A] border-[#25A995] shadow-md p-6"
                    : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995]/60 p-5"
                }`}
              >
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995]">
                        {qt.category}
                      </span>
                      <span className="text-[11px] text-[#6B8E8C] dark:text-[#739B97]">
                        Typical Parts: {qt.typicalParts.map((p) => `Part ${p}`).join(", ")}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#123C3A] dark:text-[#F4FAF8] text-base">
                      {qt.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => setExpandedTypeId(isExpanded ? null : qt.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-2 leading-relaxed">
                  {qt.shortExplanation}
                </p>

                {/* Collapsed view summary */}
                {!isExpanded && (
                  <div className="mt-4 pt-3 border-t border-[#D4E8E3] dark:border-[#205653] flex items-center justify-between">
                    <span className="text-[11px] text-[#6B8E8C] dark:text-[#739B97]">
                      Skill: {qt.skillAssessed.slice(0, 32)}...
                    </span>
                    <button
                      onClick={() => setExpandedTypeId(qt.id)}
                      className="text-xs font-semibold text-[#25A995] hover:underline flex items-center gap-1"
                    >
                      Drill & Strategy <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Expanded Deep Strategy & Micro-Drill */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-[#D4E8E3] dark:border-[#205653] space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Strategy & Traps */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#25A995] mb-1.5">
                            Authoritative Strategy
                          </h4>
                          <div className="text-xs text-[#3D6462] dark:text-[#A0C5C1] whitespace-pre-line leading-relaxed bg-[#F4FAF8] dark:bg-[#174A48] p-3.5 rounded-xl border border-[#D4E8E3] dark:border-[#205653]">
                            {qt.strategy}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1.5">
                            Common Distractor Traps
                          </h4>
                          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 bg-rose-50/50 dark:bg-rose-950/20 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900">
                            {qt.commonMistakes.map((m, mIdx) => (
                              <li key={mIdx} className="flex items-start gap-1.5">
                                <span className="text-rose-500 font-bold">•</span>
                                <span>{m}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right: Interactive Micro-Drill */}
                      <div className="space-y-3 bg-[#F4FAF8] dark:bg-[#174A48] p-4 rounded-2xl border border-[#D4E8E3] dark:border-[#205653]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#25A995]">
                            Interactive Micro-Drill
                          </span>
                          <button
                            onClick={() => playSampleAudio(qt.sampleQuestion.audioTranscriptExcerpt)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#25A995] text-white hover:bg-[#1D8B7A] transition-all"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            Play Spoken Audio
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-xs">
                          <div className="text-[#6B8E8C] dark:text-[#739B97] text-[11px] mb-1">
                            Audio Excerpt (Timestamp: {qt.sampleQuestion.spokenCueTimestamp}):
                          </div>
                          <p className="italic text-[#123C3A] dark:text-[#F4FAF8]">
                            &quot;{qt.sampleQuestion.audioTranscriptExcerpt}&quot;
                          </p>
                        </div>

                        <div className="space-y-2 pt-1">
                          <p className="text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                            {qt.sampleQuestion.prompt}
                          </p>

                          {qt.sampleQuestion.options && qt.sampleQuestion.options.length > 0 ? (
                            <div className="space-y-1.5">
                              {qt.sampleQuestion.options.map((opt, oIdx) => (
                                <label
                                  key={oIdx}
                                  className="flex items-center gap-2 p-2 rounded-xl text-xs bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`drill-opt-${qt.id}`}
                                    checked={studentDrillAns === opt.charAt(0)}
                                    onChange={() =>
                                      setDrillAnswers((prev) => ({
                                        ...prev,
                                        [qt.id]: opt.charAt(0),
                                      }))
                                    }
                                    className="w-3.5 h-3.5 text-[#25A995] focus:ring-[#25A995]"
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <input
                              type="text"
                              placeholder="Type drill answer..."
                              value={studentDrillAns}
                              onChange={(e) =>
                                setDrillAnswers((prev) => ({
                                  ...prev,
                                  [qt.id]: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 rounded-xl text-xs border border-[#D4E8E3] dark:border-[#205653] bg-white dark:bg-[#123C3A] text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:ring-2 focus:ring-[#25A995]"
                            />
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[11px] text-[#6B8E8C] dark:text-[#739B97]">
                              {qt.wordLimitRule || "1 mark"}
                            </span>
                            <button
                              onClick={() => handleCheckDrillAnswer(qt)}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#25A995] hover:bg-[#1D8B7A] transition-all"
                            >
                              Check Answer
                            </button>
                          </div>

                          {/* Drill Feedback */}
                          {drillRevealed[qt.id] && drillEval && (
                            <div
                              className={`p-3 rounded-xl text-xs space-y-1 border ${
                                drillEval.isCorrect
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-300"
                                  : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 text-rose-800 dark:text-rose-300"
                              }`}
                            >
                              <div className="font-bold">
                                {drillEval.isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                              </div>
                              <p className="text-[11px]">{drillEval.statusMessage}</p>
                              <p className="text-[11px] text-gray-600 dark:text-gray-400 pt-1">
                                <strong>Explanation: </strong> {qt.sampleQuestion.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. INDICATIVE RAW SCORE GUIDE & OFFICIAL DISCLAIMER                  */}
      {/* ==================================================================== */}
      <section className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#25A995]" />
            <h3 className="text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              Listening Band Score Guide
            </h3>
          </div>
          <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-1">
            Authoritative conversion table showing raw marks (out of 40) mapped to IELTS band scores.
          </p>
        </div>

        {/* Disclaimer Alert */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Official Scoring Disclaimer: </strong>
            {LISTENING_RAW_SCORE_GUIDE.disclaimer}
          </p>
        </div>

        {/* Raw Score Conversion Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {LISTENING_RAW_SCORE_GUIDE.tiers.map((tier) => {
            const isTarget = tier.band === profile.targetBand;
            return (
              <div
                key={tier.band}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isTarget
                    ? "bg-[#E8F7F4] dark:bg-[#174A48] border-[#25A995] ring-2 ring-[#25A995]/20"
                    : "bg-[#F4FAF8] dark:bg-[#174A48]/40 border-[#D4E8E3] dark:border-[#205653]"
                }`}
              >
                <div className="text-xs font-semibold text-[#3D6462] dark:text-[#A0C5C1]">
                  Band {tier.band.toFixed(1)}
                  {isTarget && (
                    <span className="ml-1 text-[10px] text-[#25A995] font-bold">
                      ★ Target
                    </span>
                  )}
                </div>
                <div className="text-lg font-extrabold text-[#123C3A] dark:text-[#F4FAF8] mt-0.5">
                  {tier.rawScoreRange}
                </div>
                <div className="text-[10px] text-[#6B8E8C] dark:text-[#739B97] mt-0.5">out of 40</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. RECENT LISTENING ATTEMPTS HISTORY                                 */}
      {/* ==================================================================== */}
      {listeningAttempts.length > 0 && (
        <section className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#123C3A] dark:text-[#F4FAF8] text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#25A995]" />
              Your Recent Listening Practice Attempts
            </h3>
            <Link
              href="/results"
              className="text-xs font-semibold text-[#25A995] hover:underline flex items-center gap-1"
            >
              Full Results History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#D4E8E3] dark:divide-[#205653]">
            {listeningAttempts.slice(0, 3).map((att) => (
              <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                    {att.examTitle}
                  </div>
                  <div className="text-[#6B8E8C] dark:text-[#739B97] text-[11px]">
                    {new Date(att.startedAt).toLocaleDateString()} • Status: {att.status}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#25A995]">
                    {att.listeningScore !== null ? `Band ${att.listeningScore.toFixed(1)}` : "Diagnostic / Unofficial"}
                  </div>
                  <Link
                    href={`/results/${att.id}`}
                    className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#25A995] hover:underline"
                  >
                    View Breakdown →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

