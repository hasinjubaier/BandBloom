"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  FileText,
  Mic,
  ArrowRight,
  Clock,
  Target,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause,
  Square,
  Award,
  Bookmark,
  X,
  Send,
  Loader2,
} from "lucide-react";
import {
  ACADEMIC_READING_PASSAGE,
  GT_READING_PASSAGE,
  LISTENING_ACTIVITY,
  WRITING_TASKS,
  SPEAKING_CUE_CARD,
  countWords,
  ReadingEvaluationResult,
  ListeningEvaluationResult,
  WritingEvaluationResult,
  SpeakingEvaluationResult,
  PracticeHubSummary,
} from "@/lib/practice-data";

interface SpeechRecognitionResultItem {
  transcript: string;
}
interface SpeechRecognitionResultList {
  [index: number]: { [index: number]: SpeechRecognitionResultItem };
  length: number;
}
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror?: ((event: unknown) => void) | null;
  start: () => void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type PracticeMode = "guided" | "timed" | "simulation";
type ActiveLab = "none" | "reading" | "listening" | "writing" | "speaking";

export default function PracticeHubPage() {
  // Summary & Discovery State
  const [hubSummary, setHubSummary] = useState<PracticeHubSummary | null>(null);
  const [stream, setStream] = useState<"academic" | "general_training">("academic");
  const [mode, setMode] = useState<PracticeMode>("guided");
  const [activeLab, setActiveLab] = useState<ActiveLab>("none");
  const [activeSkillFilter, setActiveSkillFilter] = useState<string>("all");

  // Load summary on mount
  useEffect(() => {
    let mounted = true;
    fetch("/api/practice")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data || !data.success) return;
        setHubSummary(data);
        if (data.profile?.testType) {
          setStream(data.profile.testType);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Inspect query params for deep-link navigation (e.g., from Study Plan)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const labParam = params.get("lab");
      const typeParam = params.get("type");
      if (labParam && ["reading", "listening", "writing", "speaking"].includes(labParam)) {
        setTimeout(() => setActiveLab(labParam as ActiveLab), 0);
      }
      if (typeParam === "academic" || typeParam === "general_training") {
        setTimeout(() => setStream(typeParam), 0);
      }
    }
  }, []);

  // ==========================================================================
  // READING LAB STATE & HANDLERS
  // ==========================================================================
  const activeReadingPassage = stream === "academic" ? ACADEMIC_READING_PASSAGE : GT_READING_PASSAGE;
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [readingResult, setReadingResult] = useState<ReadingEvaluationResult | null>(null);
  const [readingSubmitting, setReadingSubmitting] = useState(false);
  const [showReadingHints, setShowReadingHints] = useState(false);
  const [readingSavedMistake, setReadingSavedMistake] = useState<string | null>(null);

  const handleReadingSubmit = async () => {
    setReadingSubmitting(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_reading",
          answers: readingAnswers,
          stream,
          persist: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReadingResult(data.evaluation);
      }
    } catch {
      // Fallback local evaluation
    } finally {
      setReadingSubmitting(false);
    }
  };

  const handleSaveMistakeToNotebook = async (item: {
    skill: "reading" | "listening";
    errorTag: string;
    questionPrompt: string;
    studentAnswer: string;
    correctAnswer: string;
    reasoning: string;
  }) => {
    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: item.skill,
          errorTag: item.errorTag,
          questionPrompt: item.questionPrompt,
          studentAnswer: item.studentAnswer,
          correctAnswer: item.correctAnswer,
          reasoning: item.reasoning,
        }),
      });
      if (res.ok) {
        setReadingSavedMistake(item.questionPrompt);
      }
    } catch {
      // ignore
    }
  };

  // ==========================================================================
  // LISTENING LAB STATE & HANDLERS
  // ==========================================================================
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});
  const [listeningResult, setListeningResult] = useState<ListeningEvaluationResult | null>(null);
  const [listeningSubmitting, setListeningSubmitting] = useState(false);
  const [synthesisPlaying, setSynthesisPlaying] = useState(false);
  const [synthesisVoiceName, setSynthesisVoiceName] = useState<string>("Local Browser Engine");
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(false);

  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize available voice name when speech synthesis is ready
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find((v) => v.lang.startsWith("en-GB") || v.lang.startsWith("en-AU")) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
        if (preferred) {
          setSynthesisVoiceName(`${preferred.name} (${preferred.lang})`);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleToggleSynthesis = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (synthesisPlaying) {
      window.speechSynthesis.cancel();
      setSynthesisPlaying(false);
    } else {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(LISTENING_ACTIVITY.dialogueTranscript);
        utterance.rate = audioSpeed;

        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find((v) => v.lang.startsWith("en-GB") || v.lang.startsWith("en-AU")) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
        if (preferred) {
          utterance.voice = preferred;
          setSynthesisVoiceName(`${preferred.name} (${preferred.lang})`);
        }

        utterance.onstart = () => {
          setSynthesisPlaying(true);
        };
        utterance.onend = () => {
          setSynthesisPlaying(false);
        };
        utterance.onerror = () => {
          setSynthesisPlaying(false);
        };

        synthUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setSynthesisPlaying(true);
      } catch {
        setSynthesisPlaying(false);
      }
    }
  };

  const handleSynthesisSpeedChange = (spd: number) => {
    setAudioSpeed(spd);
    if (synthesisPlaying && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(LISTENING_ACTIVITY.dialogueTranscript);
      utterance.rate = spd;
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.lang.startsWith("en-GB") || v.lang.startsWith("en-AU")) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
      if (preferred) utterance.voice = preferred;
      utterance.onstart = () => setSynthesisPlaying(true);
      utterance.onend = () => setSynthesisPlaying(false);
      utterance.onerror = () => setSynthesisPlaying(false);
      synthUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleListeningSubmit = async () => {
    setListeningSubmitting(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_listening",
          answers: listeningAnswers,
          persist: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setListeningResult(data.evaluation);
        setShowTranscript(true); // reveal transcript upon submission
      }
    } catch {
      // ignore
    } finally {
      setListeningSubmitting(false);
    }
  };

  // ==========================================================================
  // WRITING EVALUATOR STATE & HANDLERS
  // ==========================================================================
  const [writingTaskTab, setWritingTaskTab] = useState<"task1" | "task2">("task1");
  const [task1Text, setTask1Text] = useState("");
  const [task2Text, setTask2Text] = useState("");
  const [writingResult, setWritingResult] = useState<WritingEvaluationResult | null>(null);
  const [writingSubmitting, setWritingSubmitting] = useState(false);

  const activeTask1 = stream === "academic" ? WRITING_TASKS[0] : WRITING_TASKS[1];
  const activeTask2 = WRITING_TASKS[2];

  const task1WordCount = countWords(task1Text);
  const task2WordCount = countWords(task2Text);

  const handleWritingSubmit = async () => {
    setWritingSubmitting(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_writing",
          task1Text,
          task2Text,
          isGT: stream === "general_training",
          persist: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWritingResult(data.evaluation);
      }
    } catch {
      // ignore
    } finally {
      setWritingSubmitting(false);
    }
  };

  // ==========================================================================
  // SPEAKING CUE CARD & RECORDER STATE & HANDLERS
  // ==========================================================================
  const [speakingStep, setSpeakingStep] = useState<"prep" | "speaking" | "review">("prep");
  const [prepTimeLeft, setPrepTimeLeft] = useState(SPEAKING_CUE_CARD.prepTimeSeconds);
  const [prepActive, setPrepActive] = useState(false);
  const [speakDuration, setSpeakDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioPermissionError, setAudioPermissionError] = useState<string | null>(null);
  const [recognizedTranscript, setRecognizedTranscript] = useState("");
  const [studentEditedTranscript, setStudentEditedTranscript] = useState("");
  const [speechRecognitionStatus, setSpeechRecognitionStatus] = useState<"idle" | "listening" | "captured" | "unsupported" | "error">("idle");
  const [speakingResult, setSpeakingResult] = useState<SpeakingEvaluationResult | null>(null);
  const [speakingSubmitting, setSpeakingSubmitting] = useState(false);

  const speakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Prep Countdown
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (prepActive && prepTimeLeft > 0) {
      t = setInterval(() => {
        setPrepTimeLeft((prev) => {
          if (prev <= 1) {
            setPrepActive(false);
            setSpeakingStep("speaking");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [prepActive, prepTimeLeft]);

  // Start real browser MediaRecorder
  const startRecording = async () => {
    setAudioPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(100);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setSpeakDuration(0);
      setRecognizedTranscript("");
      setStudentEditedTranscript("");
      setSpeechRecognitionStatus("idle");

      speakTimerRef.current = setInterval(() => {
        setSpeakDuration((prev) => {
          if (prev >= SPEAKING_CUE_CARD.speakTimeSeconds) {
            stopRecording();
            return SPEAKING_CUE_CARD.speakTimeSeconds;
          }
          return prev + 1;
        });
      }, 1000);

      // Attempt live SpeechRecognition for recognized transcript if available
      interface WindowWithSpeech {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }
      const win = window as unknown as WindowWithSpeech;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = false;
          recognition.lang = "en-US";
          recognition.onresult = (event: SpeechRecognitionEvent) => {
            let text = "";
            for (let i = 0; i < event.results.length; i++) {
              text += event.results[i][0].transcript + " ";
            }
            const cleanText = text.trim();
            if (cleanText) {
              setRecognizedTranscript(cleanText);
              setStudentEditedTranscript((prev) => prev || cleanText);
              setSpeechRecognitionStatus("captured");
            }
          };
          recognition.onerror = () => {
            setSpeechRecognitionStatus("error");
          };
          recognition.start();
          setSpeechRecognitionStatus("listening");
        } catch {
          setSpeechRecognitionStatus("unsupported");
        }
      } else {
        setSpeechRecognitionStatus("unsupported");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Microphone access was denied or unsupported.";
      setAudioPermissionError(
        `Microphone Error: ${message}. Recording cannot proceed. Ensure microphone permissions are enabled in your browser settings.`
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (speakTimerRef.current) {
      clearInterval(speakTimerRef.current);
    }
    setIsRecording(false);
    setSpeakingStep("review");
  };

  const handleSpeakingSubmit = async () => {
    setSpeakingSubmitting(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_speaking",
          recognizedTranscript,
          originalTranscript: recognizedTranscript,
          studentEditedTranscript,
          durationSeconds: speakDuration,
          persist: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSpeakingResult(data.evaluation);
      }
    } catch {
      // ignore
    } finally {
      setSpeakingSubmitting(false);
    }
  };

  // ==========================================================================
  // PRACTICE LABS DIRECTORY
  // ==========================================================================
  const practiceLabs = [
    {
      id: "reading",
      href: "/skills/reading",
      title: "Academic & GT Reading Lab",
      skill: "Reading",
      desc: "Practice True/False/Not Given, Headings Matching, and Summary Completion with paragraph evidence highlights.",
      color: "border-[#25A995]/30 text-[#25A995] bg-[#E8F7F4] dark:bg-[#0A1C1B]",
      icon: BookOpen,
      badge: "Passage Evidence Highlighting",
      duration: "20 mins",
      questionsCount: "4 calibrated questions",
      format: stream === "academic" ? "Academic Megacities Passage" : "General Training Workplace Notices",
    },
    {
      id: "listening",
      href: "/skills/listening",
      title: "Computer-Delivered Listening Lab",
      skill: "Listening",
      desc: "Practice with native British, Australian, and North American dialogues with speed controls and transcript unlocking.",
      color: "border-[#25A995]/30 text-[#25A995] bg-[#E8F7F4] dark:bg-[#0A1C1B]",
      icon: Headphones,
      badge: "Distractor Warning System",
      duration: "15 mins",
      questionsCount: "3 multi-type questions",
      format: "Standard Computer-Delivered Interface",
    },
    {
      id: "writing",
      href: "/skills/writing",
      title: "Writing Tasks 1 & 2 Evaluator",
      skill: "Writing",
      desc: "Draft essays with real-time word counting, length warnings (min 150w / 250w), and automated 4-criterion heuristic rubric diagnostics.",
      color: "border-[#FF8A65]/30 text-[#FF8A65] bg-[#FFF6F3] dark:bg-[#0A1C1B]",
      icon: FileText,
      badge: "Instant Rubric Diagnostic",
      duration: "40-60 mins",
      questionsCount: "Task 1 & Task 2 Rubrics",
      format: stream === "academic" ? "Academic Visual Chart & Task 2" : "GT Letter & Task 2 Essay",
    },
    {
      id: "speaking",
      href: "/skills/speaking",
      title: "Speaking Cue Card & Recorder",
      skill: "Speaking",
      desc: "Simulate Part 2 cue cards with 1-minute countdown prep and 2-minute recording with verbatim transcript editing.",
      color: "border-[#25A995]/30 text-[#25A995] bg-[#E8F7F4] dark:bg-[#0A1C1B]",
      icon: Mic,
      badge: "Transcript & Fluency Breakdown",
      duration: "11-14 mins",
      questionsCount: "Parts 1, 2, and 3",
      format: "Audio Recording & 4-Criteria Feedback",
    },
  ];

  const filteredLabs =
    activeSkillFilter === "all"
      ? practiceLabs
      : practiceLabs.filter((lab) => lab.id === activeSkillFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* 1. Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#25A995] bg-[#E8F7F4] dark:bg-[#123C3A] border border-[#25A995]/30 px-3 py-1 rounded-full">
          Targeted Skill Training
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
          BandBloom Practice Labs
        </h1>
        <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1]">
          Target specific component weaknesses with individual skill simulators before taking full mock exams.
        </p>
      </div>

      {/* 2. Stream & Practice Mode Filter Bar */}
      <div className="bg-white dark:bg-[#123C3A] p-4 sm:p-5 rounded-3xl border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Stream Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#25A995]" />
            Stream:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold">
            <button
              onClick={() => setStream("academic")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                stream === "academic"
                  ? "bg-[#25A995] text-white shadow-xs"
                  : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A]"
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setStream("general_training")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                stream === "general_training"
                  ? "bg-[#25A995] text-white shadow-xs"
                  : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A]"
              }`}
            >
              General Training
            </button>
          </div>
        </div>

        {/* Practice Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#25A995]" />
            Mode:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold">
            <button
              onClick={() => setMode("guided")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "guided"
                  ? "bg-[#25A995] text-white shadow-xs"
                  : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A]"
              }`}
              title="Includes explanations, evidence hints, and transcript controls"
            >
              Guided Practice
            </button>
            <button
              onClick={() => setMode("timed")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "timed"
                  ? "bg-[#25A995] text-white shadow-xs"
                  : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A]"
              }`}
              title="Practice with active stopwatch timers"
            >
              Timed Practice
            </button>
            <button
              onClick={() => setMode("simulation")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "simulation"
                  ? "bg-[#25A995] text-white shadow-xs"
                  : "text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A]"
              }`}
              title="Strict exam simulation without hints or premature transcripts"
            >
              Exam Simulation
            </button>
          </div>
        </div>

        {/* Skill Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {["all", "reading", "listening", "writing", "speaking"].map((sk) => (
            <button
              key={sk}
              onClick={() => setActiveSkillFilter(sk)}
              className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                activeSkillFilter === sk
                  ? "bg-[#123C3A] text-white dark:bg-[#25A995]"
                  : "bg-[#F4FAF8] dark:bg-[#174A48] text-[#3D6462] dark:text-[#A0C5C1] hover:bg-[#D4E8E3]"
              }`}
            >
              {sk}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Continuity & Recommendation Banner */}
      {hubSummary?.activeAttempt && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-[#1F332E] border border-amber-200 dark:border-amber-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Resumable In-Progress Attempt
              </span>
              <h3 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                {hubSummary.activeAttempt.examTitle}
              </h3>
              <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1]">
                Started on {new Date(hubSummary.activeAttempt.startedAt).toLocaleDateString()} — pick up where you left off.
              </p>
            </div>
          </div>
          <Link
            href={`/mock-centre/exam?attempt=${hubSummary.activeAttempt.id}`}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs"
          >
            <span>Resume Attempt</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {hubSummary?.recommendation && !hubSummary.activeAttempt && (
        <div className="p-5 rounded-3xl bg-linear-to-r from-[#E8F7F4] via-white to-[#F4FAF8] dark:from-[#123C3A] dark:to-[#174A48] border border-[#25A995]/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#25A995] bg-white dark:bg-[#0A1C1B] px-2.5 py-0.5 rounded-full border border-[#25A995]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hubSummary.recommendation.badge}</span>
            </div>
            <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              {hubSummary.recommendation.title}
            </h3>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] max-w-2xl leading-relaxed">
              {hubSummary.recommendation.description}
            </p>
          </div>
          <button
            onClick={() => {
              if (hubSummary.recommendation?.labKey) {
                setActiveLab(hubSummary.recommendation.labKey as ActiveLab);
              }
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#25A995] hover:bg-[#123C3A] text-white font-bold text-xs inline-flex items-center gap-2 shrink-0 shadow-md shadow-[#25A995]/20 transition-all"
          >
            <span>Start Recommended Drill</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Four Primary Lab Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredLabs.map((lab) => {
          const isCurrentActive = activeLab === lab.id;

          return (
            <div
              key={lab.title}
              className={`bg-white dark:bg-[#123C3A] p-7 rounded-3xl border transition-all flex flex-col justify-between space-y-6 shadow-sm group ${
                isCurrentActive
                  ? "border-[#25A995] ring-2 ring-[#25A995]/30 shadow-md"
                  : "border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl border ${lab.color}`}>
                    <lab.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D6462] dark:text-[#A0C5C1] bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] px-2.5 py-1 rounded-full">
                    {lab.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#123C3A] dark:text-[#F4FAF8] group-hover:text-[#25A995] transition-colors">
                    {lab.title}
                  </h2>
                  <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">
                    {lab.desc}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-[#67839A] dark:text-[#A0C5C1]">
                  <span className="px-2 py-0.5 rounded-lg bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653]">
                    ⏱️ {lab.duration}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653]">
                    🎯 {lab.questionsCount}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653]">
                    📄 {lab.format}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D4E8E3] dark:border-[#205653] flex items-center gap-3">
                <button
                  onClick={() => setActiveLab(activeLab === lab.id ? "none" : (lab.id as ActiveLab))}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isCurrentActive
                      ? "bg-[#123C3A] text-white hover:bg-black"
                      : "bg-[#25A995] hover:bg-[#123C3A] text-white"
                  }`}
                >
                  <span>{isCurrentActive ? "Close Lab Simulator" : `Launch ${lab.skill} Lab`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href={lab.href}
                  className="p-2.5 rounded-xl border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] text-[#3D6462] hover:text-[#25A995] transition-colors shrink-0"
                  title={`View ${lab.skill} curriculum and tips`}
                >
                  <BookOpen className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================================
          INTERACTIVE LAB 1: READING LAB
          ===================================================================== */}
      {activeLab === "reading" && (
        <section
          aria-label="Reading Lab Simulator"
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border-2 border-[#25A995] shadow-lg space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D4E8E3] dark:border-[#205653] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#25A995] bg-[#E8F7F4] dark:bg-[#174A48] px-2.5 py-0.5 rounded-md">
                  {stream === "academic" ? "IELTS Academic Reading" : "IELTS General Training Reading"}
                </span>
                <span className="text-xs font-semibold text-[#67839A] dark:text-[#A0C5C1]">
                  Mode: {mode.toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] pt-1">
                {activeReadingPassage.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {mode === "guided" && (
                <button
                  onClick={() => setShowReadingHints(!showReadingHints)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    showReadingHints
                      ? "bg-amber-100 dark:bg-amber-900 border-amber-300 text-amber-800 dark:text-amber-200"
                      : "bg-[#F4FAF8] dark:bg-[#174A48] border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1]"
                  }`}
                >
                  💡 {showReadingHints ? "Hide Learning Hints" : "Show Learning Hints"}
                </button>
              )}
              <button
                onClick={() => setActiveLab("none")}
                className="p-2 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] text-[#3D6462] hover:bg-rose-100 hover:text-rose-600 transition-colors"
                title="Close Reading Lab"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Split Screen: Passage Text on Left, Questions on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Passage Pane */}
            <div className="p-6 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] max-h-[600px] overflow-y-auto space-y-4 text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] leading-relaxed">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#25A995]">
                {stream === "academic" ? "Reading Passage 1" : "Section 1 Workplace Guidelines"}
              </h4>
              {activeReadingPassage.paragraphs.map((para) => {
                // Check if this paragraph is part of the evidence of the submitted result
                const isEvidenceForSubmittedQuestion = readingResult?.questionResults.some(
                  (qr) => qr.evidenceParagraph === para.label
                );

                return (
                  <div
                    key={para.label}
                    className={`p-3.5 rounded-xl transition-all ${
                      isEvidenceForSubmittedQuestion && readingResult
                        ? "bg-[#25A995]/15 border-l-4 border-[#25A995]"
                        : "bg-white dark:bg-[#123C3A] border border-[#D4E8E3]/60 dark:border-[#205653]"
                    }`}
                  >
                    <span className="font-bold text-[#25A995] mr-2">[{para.label}]</span>
                    <span>{para.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Questions Pane */}
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#E8F7F4] dark:bg-[#1F332E] border border-[#25A995]/20 text-xs text-[#123C3A] dark:text-[#F4FAF8]">
                <strong>Instructions:</strong> Questions 1–3 are True / False / Not Given. Question 4 is Sentence Completion. In True/False/Not Given, <em>False</em> means the passage directly contradicts the claim; <em>Not Given</em> means insufficient information exists.
              </div>

              <div className="space-y-4">
                {activeReadingPassage.questions.map((q) => {
                  const evalResult = readingResult?.questionResults.find((qr) => qr.questionId === q.id);

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 ${
                        evalResult
                          ? evalResult.isCorrect
                            ? "bg-emerald-50 dark:bg-[#16382D] border-emerald-300 dark:border-emerald-700"
                            : "bg-rose-50 dark:bg-[#3D1D1D] border-rose-300 dark:border-rose-700"
                          : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                          <span className="text-[#25A995] mr-1.5 font-extrabold">{q.number}.</span>
                          <span>{q.prompt}</span>
                        </div>
                        {evalResult && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              evalResult.isCorrect
                                ? "bg-emerald-200 text-emerald-900"
                                : "bg-rose-200 text-rose-900"
                            }`}
                          >
                            {evalResult.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        )}
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {q.options?.map((opt) => {
                          const isSelected = readingAnswers[q.id] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setReadingAnswers({ ...readingAnswers, [q.id]: opt })}
                              disabled={readingSubmitting || !!readingResult}
                              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                                isSelected
                                  ? "bg-[#25A995] text-white border-[#25A995] shadow-xs"
                                  : "bg-[#F9FCFB] dark:bg-[#174A48] border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] hover:border-[#25A995]"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Guided Hint */}
                      {showReadingHints && mode === "guided" && !evalResult && (
                        <div className="text-[11px] p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200">
                          <strong>Hint:</strong> {q.errorTrap} (Evidence in Paragraph {q.evidenceParagraph})
                        </div>
                      )}

                      {/* Post-Submission Evidence & Explanation */}
                      {evalResult && (
                        <div className="pt-2 border-t border-[#D4E8E3] dark:border-[#205653] space-y-1.5 text-xs">
                          <p className="text-[#123C3A] dark:text-[#F4FAF8]">
                            <strong>Correct Answer:</strong> {evalResult.correctAnswer}
                          </p>
                          <p className="text-emerald-700 dark:text-emerald-400">
                            <strong>Evidence [{evalResult.evidenceParagraph}]:</strong> &ldquo;{evalResult.evidenceText}&rdquo;
                          </p>
                          <p className="text-[#67839A] dark:text-[#A0C5C1] text-[11px]">
                            {evalResult.explanation}
                          </p>

                          {!evalResult.isCorrect && (
                            <button
                              onClick={() =>
                                handleSaveMistakeToNotebook({
                                  skill: "reading",
                                  errorTag: q.type === "True/False/Not Given" ? "keyword trap" : "paraphrase miss",
                                  questionPrompt: q.prompt,
                                  studentAnswer: evalResult.studentAnswer,
                                  correctAnswer: evalResult.correctAnswer,
                                  reasoning: `${evalResult.explanation} (Evidence: Paragraph ${evalResult.evidenceParagraph})`,
                                })
                              }
                              disabled={readingSavedMistake === q.prompt}
                              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>{readingSavedMistake === q.prompt ? "Saved in Notebook" : "Save to Mistake Notebook"}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submission Controls */}
              {!readingResult ? (
                <button
                  onClick={handleReadingSubmit}
                  disabled={readingSubmitting || Object.keys(readingAnswers).length === 0}
                  className="w-full py-3 px-6 rounded-2xl bg-[#25A995] hover:bg-[#123C3A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {readingSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Reading Drill</span>
                </button>
              ) : (
                <div className="p-5 rounded-2xl bg-[#E8F7F4] dark:bg-[#174A48] border border-[#25A995] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-[#25A995]">Drill Score</span>
                    <h3 className="text-xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8]">
                      {readingResult.score} / {readingResult.total} ({readingResult.percentage}%)
                      {readingResult.estimatedBand !== null
                        ? ` — Estimated Band ${readingResult.estimatedBand.toFixed(1)}`
                        : " — Diagnostic (No Full Band Awarded)"}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setReadingResult(null);
                      setReadingAnswers({});
                    }}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-[#123C3A] border border-[#25A995] text-[#25A995] font-bold text-xs"
                  >
                    Retake Drill
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          INTERACTIVE LAB 2: LISTENING LAB
          ===================================================================== */}
      {activeLab === "listening" && (
        <section
          aria-label="Listening Lab Simulator"
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border-2 border-[#25A995] shadow-lg space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D4E8E3] dark:border-[#205653] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#25A995] bg-[#E8F7F4] dark:bg-[#174A48] px-2.5 py-0.5 rounded-md">
                  Computer-Delivered Listening
                </span>
                <span className="text-xs font-semibold text-[#67839A] dark:text-[#A0C5C1]">
                  Accent: {LISTENING_ACTIVITY.accent}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] pt-1">
                {LISTENING_ACTIVITY.title}
              </h2>
            </div>
            <button
              onClick={() => setActiveLab("none")}
              className="p-2 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] text-[#3D6462] hover:bg-rose-100 hover:text-rose-600 transition-colors self-end sm:self-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Synthetic Audio Provenance & Voice Disclaimer Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[10px]">
                Synthetic Practice Audio (Speech Synthesis Fallback)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                Engine: {synthesisVoiceName}
              </span>
            </div>
            <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
              {LISTENING_ACTIVITY.syntheticNotice || "Audio is synthesized via your local browser speech engine. Dialect and accents are synthetic approximations and cannot guarantee authentic regional British or Australian phonetics."}
            </p>
          </div>

          {/* Truthful Audio Controls: Native Element for Real Audio, Synthesis Controls for Fallback */}
          {LISTENING_ACTIVITY.audioUrl ? (
            <div className="p-5 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#25A995]">
                Original Recorded Practice Audio
              </span>
              <audio controls src={LISTENING_ACTIVITY.audioUrl} className="w-full" />
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleSynthesis}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all ${
                      synthesisPlaying
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-[#25A995] hover:bg-[#123C3A] text-white"
                    }`}
                    aria-label={synthesisPlaying ? "Stop synthetic speech" : "Play synthetic dialogue"}
                  >
                    {synthesisPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5" />}
                    <span>{synthesisPlaying ? "Stop Speech" : "Play Synthetic Dialogue"}</span>
                  </button>

                  <div className="text-xs font-semibold">
                    {synthesisPlaying ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        Synthesizing dialogue audio...
                      </span>
                    ) : (
                      <span className="text-[#67839A] dark:text-[#A0C5C1]">Ready to play</span>
                    )}
                  </div>
                </div>

                {/* Guided Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#3D6462] dark:text-[#A0C5C1] font-semibold">Speed:</span>
                  {[0.75, 1.0, 1.25].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleSynthesisSpeedChange(spd)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        audioSpeed === spd
                          ? "bg-[#25A995] text-white border-[#25A995]"
                          : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] text-[#3D6462]"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                  {mode === "guided" && (
                    <button
                      type="button"
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="ml-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[#F4FAF8] dark:bg-[#123C3A] border border-[#D4E8E3] text-[#25A995]"
                    >
                      {showTranscript ? "Hide Transcript" : "View Transcript"}
                    </button>
                  )}
                </div>
              </div>

              {mode === "simulation" && (
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block pt-1">
                  ⚠️ Exam Simulation Mode: Speech is played once. Transcript locked until final submission.
                </span>
              )}
            </div>
          )}

          {/* Transcript Drawer */}
          {showTranscript && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs font-mono text-amber-900 dark:text-amber-200 whitespace-pre-line leading-relaxed">
              <div className="font-bold text-[10px] uppercase text-amber-700 tracking-wider mb-2">
                Original Dialogue Transcript (BandBloom Unofficial Practice Dialogue)
              </div>
              {LISTENING_ACTIVITY.dialogueTranscript}
            </div>
          )}

          {/* Listening Questions */}
          <div className="space-y-4">
            {LISTENING_ACTIVITY.questions.map((q) => {
              const evalRes = listeningResult?.questionResults.find((qr) => qr.questionId === q.id);

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border space-y-3 transition-all ${
                    evalRes
                      ? evalRes.isCorrect
                        ? "bg-emerald-50 dark:bg-[#16382D] border-emerald-300"
                        : "bg-rose-50 dark:bg-[#3D1D1D] border-rose-300"
                      : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                      <span className="text-[#25A995] mr-1.5 font-extrabold">{q.number}.</span>
                      <span>{q.prompt}</span>
                    </div>
                    {evalRes && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          evalRes.isCorrect ? "bg-emerald-200 text-emerald-900" : "bg-rose-200 text-rose-900"
                        }`}
                      >
                        {evalRes.isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {q.options?.map((opt) => {
                      const isSelected = listeningAnswers[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setListeningAnswers({ ...listeningAnswers, [q.id]: opt })}
                          disabled={listeningSubmitting || !!listeningResult}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-[#25A995] text-white border-[#25A995]"
                              : "bg-[#F9FCFB] dark:bg-[#174A48] border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8]"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {evalRes && (
                    <div className="pt-2 border-t border-[#D4E8E3] dark:border-[#205653] text-xs space-y-1">
                      <p className="text-[#123C3A] dark:text-[#F4FAF8]">
                        <strong>Correct Answer:</strong> {evalRes.correctAnswer} (Timestamp: {evalRes.transcriptTimestamp})
                      </p>
                      <p className="text-[#67839A] dark:text-[#A0C5C1] text-[11px]">{evalRes.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!listeningResult ? (
            <button
              onClick={handleListeningSubmit}
              disabled={listeningSubmitting || Object.keys(listeningAnswers).length === 0}
              className="w-full py-3 px-6 rounded-2xl bg-[#25A995] hover:bg-[#123C3A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {listeningSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit Listening Answers</span>
            </button>
          ) : (
            <div className="p-5 rounded-2xl bg-[#E8F7F4] dark:bg-[#174A48] border border-[#25A995] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-[#25A995]">Listening Band</span>
                <h3 className="text-xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8]">
                  {listeningResult.score} / {listeningResult.total} ({listeningResult.percentage}%) — Estimated Band {listeningResult.estimatedBand.toFixed(1)}
                </h3>
              </div>
              <button
                onClick={() => {
                  setListeningResult(null);
                  setListeningAnswers({});
                }}
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#123C3A] border border-[#25A995] text-[#25A995] font-bold text-xs"
              >
                Retake Listening
              </button>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          INTERACTIVE LAB 3: WRITING TASKS 1 & 2 EVALUATOR
          ===================================================================== */}
      {activeLab === "writing" && (
        <section
          aria-label="Writing Evaluator Simulator"
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border-2 border-[#FF8A65] shadow-lg space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D4E8E3] dark:border-[#205653] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF8A65] bg-[#FFF6F3] dark:bg-[#174A48] px-2.5 py-0.5 rounded-md">
                  Automated Rubric Diagnostic (Deterministic Heuristics)
                </span>
                <span className="text-xs font-semibold text-[#67839A] dark:text-[#A0C5C1]">
                  Official 2:1 Task 2 Weighting
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] pt-1">
                Writing Tasks 1 & 2 Evaluator
              </h2>
            </div>
            <button
              onClick={() => setActiveLab("none")}
              className="p-2 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] text-[#3D6462] hover:bg-rose-100 hover:text-rose-600 transition-colors self-end sm:self-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Task 1 vs Task 2 Tabs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWritingTaskTab("task1")}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                writingTaskTab === "task1"
                  ? "bg-[#FF8A65] text-white shadow-xs"
                  : "bg-[#F4FAF8] dark:bg-[#174A48] text-[#3D6462] dark:text-[#A0C5C1]"
              }`}
            >
              Task 1 ({stream === "academic" ? "Visual Data" : "Formal Letter"}) • {task1WordCount} words
            </button>
            <button
              onClick={() => setWritingTaskTab("task2")}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                writingTaskTab === "task2"
                  ? "bg-[#FF8A65] text-white shadow-xs"
                  : "bg-[#F4FAF8] dark:bg-[#174A48] text-[#3D6462] dark:text-[#A0C5C1]"
              }`}
            >
              Task 2 (Discursive Essay) • {task2WordCount} words
            </button>
          </div>

          {/* Active Task Prompt & Editor */}
          {writingTaskTab === "task1" ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#FFF6F3] dark:bg-[#201D1A] border border-[#FF8A65]/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A65]">
                  Task 1 Prompt (Min 150 Words • 20 Minutes • 33.3% Weight)
                </span>
                <h4 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">{activeTask1.title}</h4>
                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] whitespace-pre-line leading-relaxed">
                  {activeTask1.prompt}
                </p>
                {activeTask1.contextData && (
                  <pre className="p-3 rounded-xl bg-white dark:bg-[#123C3A] border border-[#FF8A65]/20 text-[11px] font-mono text-[#123C3A] dark:text-[#F4FAF8] overflow-x-auto">
                    {activeTask1.contextData}
                  </pre>
                )}
              </div>

              {/* Live Word Counter Warning */}
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-bold ${
                    task1WordCount >= 150 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  Word Count: {task1WordCount} / 150 words minimum
                </span>
                {task1WordCount < 150 && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Underlength Warning: Write at least 150 words to avoid Task Achievement penalties.
                  </span>
                )}
              </div>

              <textarea
                value={task1Text}
                onChange={(e) => setTask1Text(e.target.value)}
                rows={10}
                placeholder="Compose your Task 1 response here..."
                className="w-full p-4 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] focus:border-[#FF8A65] focus:outline-hidden leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#FFF6F3] dark:bg-[#201D1A] border border-[#FF8A65]/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A65]">
                  Task 2 Prompt (Min 250 Words • 40 Minutes • 66.7% Weight)
                </span>
                <h4 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">{activeTask2.title}</h4>
                <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] leading-relaxed">{activeTask2.prompt}</p>
              </div>

              {/* Live Word Counter Warning */}
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-bold ${
                    task2WordCount >= 250 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  Word Count: {task2WordCount} / 250 words minimum
                </span>
                {task2WordCount < 250 && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Underlength Warning: Write at least 250 words to avoid Task Response penalties.
                  </span>
                )}
              </div>

              <textarea
                value={task2Text}
                onChange={(e) => setTask2Text(e.target.value)}
                rows={12}
                placeholder="Compose your Task 2 discursive essay here with an Introduction, 2 Body Paragraphs, and a Conclusion..."
                className="w-full p-4 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs sm:text-sm text-[#123C3A] dark:text-[#F4FAF8] focus:border-[#FF8A65] focus:outline-hidden leading-relaxed"
              />
            </div>
          )}

          {/* Evaluation Action */}
          <button
            onClick={handleWritingSubmit}
            disabled={writingSubmitting || (!task1Text && !task2Text)}
            className="w-full py-3 px-6 rounded-2xl bg-[#FF8A65] hover:bg-[#E6704B] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {writingSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
            <span>Evaluate Writing Tasks via Official 4-Criterion Rubrics</span>
          </button>

          {/* Results Display */}
          {writingResult && (
            <div className="p-6 rounded-3xl bg-[#FFF6F3] dark:bg-[#1A2624] border border-[#FF8A65]/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#FF8A65]/20 gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF8A65]">
                    Composite Writing Diagnostic
                  </span>
                  <h3 className="text-2xl font-black text-[#123C3A] dark:text-[#F4FAF8]">
                    Overall Writing Band: {writingResult.compositeWritingBand.toFixed(1)}
                  </h3>
                  <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] pt-0.5">
                    {writingResult.weightingNotice}
                  </p>
                </div>
                <div className="text-right text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] space-y-1">
                  <div>Task 1 Band: {writingResult.task1.estimatedBand.toFixed(1)} ({writingResult.task1.wordCount} words)</div>
                  <div>Task 2 Band: {writingResult.task2.estimatedBand.toFixed(1)} ({writingResult.task2.wordCount} words)</div>
                </div>
              </div>

              {/* Rubric Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] space-y-2">
                  <h4 className="text-xs font-bold uppercase text-[#FF8A65]">Task 1 Criterion Breakdown</h4>
                  {writingResult.task1.rubric.map((r, i) => (
                    <div key={i} className="text-xs space-y-0.5 pt-1">
                      <div className="font-bold flex justify-between">
                        <span>{r.criterion}</span>
                        <span className="text-[#FF8A65]">Band {r.band.toFixed(1)}</span>
                      </div>
                      <p className="text-[11px] text-[#67839A] dark:text-[#A0C5C1]">{r.feedback}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] space-y-2">
                  <h4 className="text-xs font-bold uppercase text-[#FF8A65]">Task 2 Criterion Breakdown</h4>
                  {writingResult.task2.rubric.map((r, i) => (
                    <div key={i} className="text-xs space-y-0.5 pt-1">
                      <div className="font-bold flex justify-between">
                        <span>{r.criterion}</span>
                        <span className="text-[#FF8A65]">Band {r.band.toFixed(1)}</span>
                      </div>
                      <p className="text-[11px] text-[#67839A] dark:text-[#A0C5C1]">{r.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                <p>
                  ℹ️ <strong>Diagnostic Methodology:</strong> Evaluations use deterministic structural and lexical heuristics (word count thresholds, paragraph architecture, transition frequency, and topical collocations). This is an automated formative diagnostic, not an official AI model or certified human examiner grading.
                </p>
                <p className="text-[10px] text-amber-800 dark:text-amber-300">
                  {writingResult.indicativeDisclaimer}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          INTERACTIVE LAB 4: SPEAKING CUE CARD & RECORDER
          ===================================================================== */}
      {activeLab === "speaking" && (
        <section
          aria-label="Speaking Recorder Simulator"
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border-2 border-[#25A995] shadow-lg space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D4E8E3] dark:border-[#205653] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#25A995] bg-[#E8F7F4] dark:bg-[#174A48] px-2.5 py-0.5 rounded-md">
                  IELTS Speaking Part 2 Simulator
                </span>
                <span className="text-xs font-semibold text-[#67839A] dark:text-[#A0C5C1]">
                  1-Min Prep • 2-Min Recording
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] pt-1">
                Speaking Cue Card & Recorder
              </h2>
            </div>
            <button
              onClick={() => setActiveLab("none")}
              className="p-2 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] text-[#3D6462] hover:bg-rose-100 hover:text-rose-600 transition-colors self-end sm:self-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cue Card Prompt Box */}
          <div className="p-6 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#25A995]">
                Part 2 Candidate Task Card
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#25A995]/15 text-[#25A995]">
                Phase: {speakingStep}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              {SPEAKING_CUE_CARD.title}
            </h3>
            <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] font-semibold">You should say:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#123C3A] dark:text-[#F4FAF8]">
              {SPEAKING_CUE_CARD.bulletPoints.map((bp, i) => (
                <li key={i}>{bp}</li>
              ))}
            </ul>
          </div>

          {audioPermissionError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {audioPermissionError}
            </div>
          )}

          {/* Timer and Recording Workflow */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Step 1: Prep Timer */}
              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  Prep Timer: <span className="font-mono text-base text-[#25A995]">{prepTimeLeft}s</span>
                </div>
                {!prepActive && prepTimeLeft === SPEAKING_CUE_CARD.prepTimeSeconds && (
                  <button
                    onClick={() => setPrepActive(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#25A995] text-white text-xs font-bold"
                  >
                    Start 1-Min Prep
                  </button>
                )}
                {prepActive && (
                  <button
                    onClick={() => {
                      setPrepActive(false);
                      setSpeakingStep("speaking");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold"
                  >
                    Skip to Speaking
                  </button>
                )}
              </div>

              {/* Step 2: Speak & Record Controls */}
              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  Recording Elapsed:{" "}
                  <span className="font-mono text-base text-rose-600">
                    {Math.floor(speakDuration / 60)}:{(speakDuration % 60).toString().padStart(2, "0")} / 2:00
                  </span>
                </div>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start 2-Min Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>
            </div>

            {/* Audio Playback Player if Recorded */}
            {recordedAudioUrl && (
              <div className="p-4 rounded-xl bg-[#F4FAF8] dark:bg-[#174A48] border border-[#D4E8E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                  🎧 Your Recorded Turn ({speakDuration}s):
                </span>
                <audio controls src={recordedAudioUrl} className="h-8 max-w-xs" />
              </div>
            )}
          </div>

          {/* Transcript Integrity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Machine Recognized Transcript (Read-only, Unverified) */}
            <div className="p-5 rounded-2xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#25A995]">
                  Automated Speech Recognition (Recognized Transcript)
                </span>
                <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-sm text-zinc-600 dark:text-zinc-400">
                  Machine Output (May Contain Errors)
                </span>
              </div>
              <p className="text-xs text-[#123C3A] dark:text-[#F4FAF8] italic leading-relaxed min-h-[80px]">
                {recognizedTranscript ? (
                  recognizedTranscript
                ) : speechRecognitionStatus === "unsupported" ? (
                  <span className="text-amber-700 dark:text-amber-300 not-italic">
                    ⚠️ Browser Speech Recognition is unavailable or unsupported in this environment. Your raw audio has been recorded via MediaRecorder ({speakDuration}s). You can type or paste your spoken words in the Self-Corrected field on the right for educational diagnostic feedback.
                  </span>
                ) : speechRecognitionStatus === "error" ? (
                  <span className="text-rose-700 dark:text-rose-300 not-italic">
                    ⚠️ Speech recognition encountered an error. Your audio recording has been captured and preserved.
                  </span>
                ) : (
                  "Speak into your microphone. Recognized speech will appear here when speech is detected."
                )}
              </p>
              <p className="text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                Recognized output is generated by browser speech recognition and is not guaranteed to be verbatim.
              </p>
            </div>

            {/* Student Editable Transcript */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Student Self-Corrected Transcript (Separate Artifact)
                </span>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-sm">
                  Editable
                </span>
              </div>
              <textarea
                value={studentEditedTranscript}
                onChange={(e) => setStudentEditedTranscript(e.target.value)}
                rows={4}
                placeholder="Review and edit your spoken transcript here. Student corrections are stored separately and will never overwrite the speech recognition output or original audio recording."
                className="w-full p-2.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8] focus:outline-hidden"
              />
              <p className="text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                Student edits are tracked as a separate self-assessment artifact and do not alter recorded audio or machine transcripts.
              </p>
            </div>
          </div>

          <button
            onClick={handleSpeakingSubmit}
            disabled={speakingSubmitting || speakDuration === 0 || (!recognizedTranscript && !studentEditedTranscript && !recordedAudioUrl)}
            className="w-full py-3 px-6 rounded-2xl bg-[#25A995] hover:bg-[#123C3A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {speakingSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
            <span>Evaluate Speaking Turn (Partial Diagnostic)</span>
          </button>

          {speakingResult && (
            <div className="p-6 rounded-3xl bg-[#E8F7F4] dark:bg-[#174A48] border border-[#25A995] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#25A995]/20 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-md">
                      Partial Educational Diagnostic Only
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D6462] dark:text-[#A0C5C1]">
                      Overall Band Withheld
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] pt-1">
                    Speaking Partial Diagnostic Breakdown
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#67839A] dark:text-[#A0C5C1]">
                    Turn Duration: {speakingResult.durationSeconds}s
                  </span>
                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    No Overall Band Issued
                  </div>
                </div>
              </div>

              {/* Explanatory callout for withholding overall band */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>IELTS Speaking Scoring Methodology Disclosure</span>
                </div>
                <p>
                  Official IELTS Speaking requires four equally weighted criteria (Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation) evaluated by an accredited human examiner. Because this browser lab does not execute an acoustic phoneme model, Pronunciation is uncalibrated. To protect scoring integrity, BandBloom does not compute or issue a three-criterion overall band.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {speakingResult.rubric.map((r, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      r.band === null || r.status === "assessment_limited"
                        ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700"
                        : "bg-white dark:bg-[#123C3A] border-[#D4E8E3]"
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span className="text-[#123C3A] dark:text-[#F4FAF8]">{r.criterion}</span>
                      {r.band !== null && r.status !== "assessment_limited" ? (
                        <span className="text-[#25A995] font-black">Diagnostic Band {r.band.toFixed(1)}</span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                          Assessment Limited
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#67839A] dark:text-[#A0C5C1] leading-relaxed">{r.feedback}</p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                <p>
                  ℹ️ <strong>Assessment Notice:</strong> {speakingResult.pronunciationNotice}
                </p>
                <p className="text-[10px] text-amber-800 dark:text-amber-300">
                  {speakingResult.indicativeDisclaimer}
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
