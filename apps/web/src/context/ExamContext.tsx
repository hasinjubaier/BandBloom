"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface StudentProfile {
  testType: "academic" | "general_training";
  targetBand: number;
  targetDate: string;
  dailyMinutes: number;
  onboarded: boolean;
  voiceConsent: boolean;
  aiConsent: boolean;
  modelTrainingOptIn: boolean;
  ageDeclared: boolean;
}

export interface MistakeNote {
  id: string;
  skill: "reading" | "listening" | "writing" | "speaking";
  questionType: string;
  errorTag: "paraphrase miss" | "inference trap" | "keyword trap" | "word limit" | "grammar" | "spelling" | "singular/plural";
  questionPrompt: string;
  studentAnswer: string;
  correctAnswer: string;
  reasoning: string;
  retryStatus: "unresolved" | "mastered";
}

export interface VocabularyItem {
  id: string;
  word: string;
  partOfSpeech: string;
  bandLevel: string;
  meaning: string;
  collocation: string;
  exampleSentence: string;
  nextReviewDays: number;
  mastery: "learning" | "reviewing" | "mastered";
}

export interface StudyTask {
  id: string;
  day: string;
  skill: "reading" | "listening" | "writing" | "speaking" | "mock";
  title: string;
  durationMinutes: number;
  completed: boolean;
}

interface ExamContextType {
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  skillScores: {
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
  };
  calculateOverallBand: (l: number, r: number, w: number, s: number) => number;
  mistakes: MistakeNote[];
  addMistake: (mistake: Omit<MistakeNote, "id">) => void;
  resolveMistake: (id: string) => void;
  vocabulary: VocabularyItem[];
  toggleVocabularyMastery: (id: string) => void;
  studyTasks: StudyTask[];
  toggleTask: (id: string) => void;
}

export const roundIELTSBand = (raw: number): number => {
  const whole = Math.floor(raw);
  const fraction = Math.round((raw - whole) * 100) / 100;
  if (fraction < 0.25) return whole;
  if (fraction < 0.75) return whole + 0.5;
  return whole + 1.0;
};

const initialProfile: StudentProfile = {
  testType: "academic",
  targetBand: 7.5,
  targetDate: "2026-12-15",
  dailyMinutes: 60,
  onboarded: true,
  voiceConsent: true,
  aiConsent: true,
  modelTrainingOptIn: false,
  ageDeclared: true,
};

const initialMistakes: MistakeNote[] = [
  {
    id: "m-1",
    skill: "reading",
    questionType: "True/False/Not Given",
    errorTag: "keyword trap",
    questionPrompt: "The passage asserts that all coastal cities installed automated flood barriers before 2024.",
    studentAnswer: "TRUE",
    correctAnswer: "FALSE",
    reasoning: "The text stated 'several major ports', not 'all coastal cities'. The universal quantifier 'all' makes the statement False.",
    retryStatus: "unresolved",
  },
  {
    id: "m-2",
    skill: "listening",
    questionType: "Form Completion",
    errorTag: "singular/plural",
    questionPrompt: "Visitors must reserve their _______ in advance.",
    studentAnswer: "ticket",
    correctAnswer: "tickets",
    reasoning: "The speaker clearly articulated plural 'tickets'. Omitting the 's' loses the full mark in official IELTS marking.",
    retryStatus: "unresolved",
  },
  {
    id: "m-3",
    skill: "writing",
    questionType: "Academic Task 1",
    errorTag: "word limit",
    questionPrompt: "Summarise the energy consumption chart by selecting main features.",
    studentAnswer: "138 words written",
    correctAnswer: "Minimum 150 words required",
    reasoning: "Writing under the required word count risks penalty under Task Achievement.",
    retryStatus: "mastered",
  },
];

const initialVocabulary: VocabularyItem[] = [
  {
    id: "v-1",
    word: "Exacerbate",
    partOfSpeech: "verb",
    bandLevel: "Band 8.0+",
    meaning: "To make a problem, bad situation, or negative feeling worse",
    collocation: "exacerbate the environmental crisis / housing shortage",
    exampleSentence: "Rapid industrialization without effluent treatment has exacerbated regional water contamination.",
    nextReviewDays: 1,
    mastery: "learning",
  },
  {
    id: "v-2",
    word: "Corroborate",
    partOfSpeech: "verb",
    bandLevel: "Band 7.5+",
    meaning: "To confirm or give support to a statement, theory, or finding",
    collocation: "corroborate empirical findings / testimony",
    exampleSentence: "Recent satellite telemetry corroborates the climatologists' initial hypothesis.",
    nextReviewDays: 3,
    mastery: "reviewing",
  },
  {
    id: "v-3",
    word: "Ubiquitous",
    partOfSpeech: "adjective",
    bandLevel: "Band 7.5+",
    meaning: "Present, appearing, or found everywhere",
    collocation: "ubiquitous influence / digital devices",
    exampleSentence: "Smartphone usage has become ubiquitous among secondary school learners across urban hubs.",
    nextReviewDays: 5,
    mastery: "mastered",
  },
];

const initialTasks: StudyTask[] = [
  { id: "t-1", day: "Today", skill: "reading", title: "TFNG Strategy & Passage 2 Diagnostic", durationMinutes: 25, completed: true },
  { id: "t-2", day: "Today", skill: "listening", title: "Section 3 Dialogue Audio & Note Taking", durationMinutes: 20, completed: false },
  { id: "t-3", day: "Tomorrow", skill: "writing", title: "Task 2 Thesis & Topic Sentence Drill", durationMinutes: 30, completed: false },
  { id: "t-4", day: "Saturday", skill: "speaking", title: "Part 2 Cue Card: Describe an innovation", durationMinutes: 15, completed: false },
  { id: "t-5", day: "Sunday", skill: "mock", title: "Full BandBloom Academic Computer Mock 1", durationMinutes: 165, completed: false },
];

const ExamContext = createContext<ExamContextType>({
  profile: initialProfile,
  updateProfile: () => {},
  skillScores: { reading: 7.5, listening: 7.0, writing: 6.5, speaking: 7.0 },
  calculateOverallBand: () => 7.0,
  mistakes: initialMistakes,
  addMistake: () => {},
  resolveMistake: () => {},
  vocabulary: initialVocabulary,
  toggleVocabularyMastery: () => {},
  studyTasks: initialTasks,
  toggleTask: () => {},
});

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [mistakes, setMistakes] = useState<MistakeNote[]>(initialMistakes);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(initialVocabulary);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>(initialTasks);

  const [skillScores] = useState({
    reading: 7.5,
    listening: 7.0,
    writing: 6.5,
    speaking: 7.0,
  });

  useEffect(() => {
    // 1. Fetch real student profile
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.profile) {
          const p = data.profile;
          setProfile({
            testType: p.testType || "academic",
            targetBand: p.targetBand || 7.5,
            targetDate: p.targetDate || "2026-12-15",
            dailyMinutes: p.dailyMinutes || 60,
            onboarded: true,
            voiceConsent: p.consents?.some((c: { type: string; granted: boolean }) => c.type === "recording" && c.granted) ?? true,
            aiConsent: p.consents?.some((c: { type: string; granted: boolean }) => c.type === "ai_processing" && c.granted) ?? true,
            modelTrainingOptIn: p.consents?.some((c: { type: string; granted: boolean }) => c.type === "model_improvement" && c.granted) ?? false,
            ageDeclared: true,
          });
        }
      })
      .catch(() => {});
  }, []);

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("bandbloom_profile", JSON.stringify(next));
      return next;
    });

    fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const calculateOverallBand = (l: number, r: number, w: number, s: number): number => {
    return roundIELTSBand((l + r + w + s) / 4.0);
  };

  const addMistake = (item: Omit<MistakeNote, "id">) => {
    const tempId = `m-${Date.now()}`;
    const newNote: MistakeNote = { ...item, id: tempId };
    setMistakes((prev) => [newNote, ...prev]);
  };

  const resolveMistake = (id: string) => {
    setMistakes((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus = m.retryStatus === "mastered" ? "unresolved" : "mastered";
          return { ...m, retryStatus: nextStatus };
        }
        return m;
      })
    );
  };

  const toggleVocabularyMastery = (id: string) => {
    setVocabulary((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const nextMastery: "learning" | "reviewing" | "mastered" =
            v.mastery === "learning" ? "reviewing" : v.mastery === "reviewing" ? "mastered" : "learning";
          return { ...v, mastery: nextMastery };
        }
        return v;
      })
    );
  };

  const toggleTask = (id: string) => {
    setStudyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <ExamContext.Provider
      value={{
        profile,
        updateProfile,
        skillScores,
        calculateOverallBand,
        mistakes,
        addMistake,
        resolveMistake,
        vocabulary,
        toggleVocabularyMastery,
        studyTasks,
        toggleTask,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => useContext(ExamContext);
