
import { getStudentProfile } from "./profile.service";
import { getStudentStudyPlan } from "./study-plan.service";
import { getStudentAttempts } from "./mock.service";
import { getStudentMistakes } from "./notebook.service";
import { getStudentVocabulary } from "./vocabulary.service";

export interface StudentDashboardData {
  student: {
    id: string;
    fullName: string;
    email: string;
    testType: "academic" | "general_training";
    targetBand: number;
    targetDate: string;
    daysRemaining: number;
    dailyMinutes: number;
  };
  overview: {
    overallEstimatedBand: number | null;
    isOfficial: boolean;
    confidenceLabel: string;
    completedExamsCount: number;
    skills: {
      reading: { band: number | null; practiceCount: number; label: string };
      listening: { band: number | null; practiceCount: number; label: string };
      writing: { band: number | null; practiceCount: number; label: string };
      speaking: { band: number | null; practiceCount: number; label: string };
    };
    weeklyGoalMinutes: number;
    studyStreakDays: number;
  };
  todayPlan: {
    day: string;
    tasks: {
      id: string;
      title: string;
      skill: "reading" | "listening" | "writing" | "speaking" | "mock";
      durationMinutes: number;
      completed: boolean;
    }[];
  };
  continueLearning: {
    title: string;
    subtitle: string;
    skill: string;
    href: string;
    actionLabel: string;
  };
  recentActivities: {
    id: string;
    type: "exam" | "study" | "vocab" | "mistake";
    title: string;
    detail: string;
    timestamp: string;
  }[];
  stats: {
    totalMistakesLogged: number;
    unresolvedMistakesCount: number;
    vocabularySavedCount: number;
    vocabularyMasteredCount: number;
  };
}

export async function getStudentDashboardSummary(
  userId: string
): Promise<StudentDashboardData> {
  // 1. Fetch Profile
  const profile = await getStudentProfile(userId);
  const fullName = profile?.fullName || "Learner";
  const targetBand = profile?.targetBand || 7.5;
  const targetDate = profile?.targetDate || "2026-12-15";
  const testType = profile?.testType || "academic";
  const dailyMinutes = profile?.dailyMinutes || 60;

  // Calculate days remaining to exam
  const examDate = new Date(targetDate);
  const today = new Date();
  const timeDiff = examDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));

  // 2. Fetch Attempts for Score and Activity Data
  const attempts = await getStudentAttempts(userId);
  const completedAttempts = attempts.filter((a) => a.status === "submitted" || a.status === "evaluated");

  // Determine latest scores
  let latestOverall: number | null = null;
  let latestReading: number | null = null;
  let latestListening: number | null = null;
  let latestWriting: number | null = null;
  let latestSpeaking: number | null = null;

  if (completedAttempts.length > 0) {
    const latest = completedAttempts[0];
    latestOverall = latest.overallBand;
    latestReading = latest.readingScore;
    latestListening = latest.listeningScore;
    latestWriting = latest.writingScore;
    latestSpeaking = latest.speakingScore;
  }

  // 3. Fetch Study Plan
  const plan = await getStudentStudyPlan(userId);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = dayNames[today.getDay()];
  const todayTasks = plan.tasks.filter((t) => t.day.toLowerCase() === currentDayName.toLowerCase());
  const displayTasks = todayTasks.length > 0 ? todayTasks : plan.tasks.slice(0, 3);

  // 4. Fetch Mistakes & Vocabulary Stats
  const mistakes = await getStudentMistakes(userId);
  const unresolvedMistakes = mistakes.filter((m) => m.retryStatus !== "mastered");

  const vocabList = await getStudentVocabulary(userId);
  const masteredVocab = vocabList.filter((v) => v.mastery === "mastered");

  // 5. Construct Real Recent Activities
  const recentActivities: StudentDashboardData["recentActivities"] = [];

  for (const att of attempts.slice(0, 3)) {
    recentActivities.push({
      id: `att-${att.id}`,
      type: "exam",
      title: att.examTitle,
      detail: att.overallBand
        ? `Completed with Practice Band ${att.overallBand.toFixed(1)}`
        : "Attempt in progress",
      timestamp: att.submittedAt || att.startedAt,
    });
  }

  if (mistakes.length > 0) {
    const recentMistake = mistakes[0];
    recentActivities.push({
      id: `m-${recentMistake.id}`,
      type: "mistake",
      title: `Logged ${recentMistake.skill.toUpperCase()} Error`,
      detail: `${recentMistake.errorTag}: ${recentMistake.questionPrompt.slice(0, 45)}...`,
      timestamp: recentMistake.createdAt,
    });
  }

  // 6. Next Action / Continue Learning
  let continueLearning = {
    title: "Continue Your Study Plan",
    subtitle: displayTasks.find((t) => !t.completed)?.title || "Review your weekly IELTS targets",
    skill: displayTasks.find((t) => !t.completed)?.skill || "reading",
    href: "/study-plan",
    actionLabel: "Open Study Plan",
  };

  const inProgressAttempt = attempts.find((a) => a.status === "in_progress");
  if (inProgressAttempt) {
    continueLearning = {
      title: "Resume In-Progress Exam",
      subtitle: inProgressAttempt.examTitle,
      skill: "mock",
      href: `/mock-centre/exam?id=${inProgressAttempt.examId}&attempt=${inProgressAttempt.id}`,
      actionLabel: "Resume Exam",
    };
  }

  return {
    student: {
      id: userId,
      fullName,
      email: profile?.email || "",
      testType,
      targetBand,
      targetDate,
      daysRemaining,
      dailyMinutes,
    },
    overview: {
      overallEstimatedBand: latestOverall,
      isOfficial: false, // Standard practice estimation
      confidenceLabel: latestOverall ? "Diagnostic Estimate (Unofficial)" : "Pending First Practice Test",
      completedExamsCount: completedAttempts.length,
      skills: {
        reading: {
          band: latestReading,
          practiceCount: completedAttempts.length,
          label: latestReading ? `Band ${latestReading.toFixed(1)}` : "Not evaluated yet",
        },
        listening: {
          band: latestListening,
          practiceCount: completedAttempts.length,
          label: latestListening ? `Band ${latestListening.toFixed(1)}` : "Not evaluated yet",
        },
        writing: {
          band: latestWriting,
          practiceCount: completedAttempts.length,
          label: latestWriting ? `Band ${latestWriting.toFixed(1)}` : "Not evaluated yet",
        },
        speaking: {
          band: latestSpeaking,
          practiceCount: completedAttempts.length,
          label: latestSpeaking ? `Band ${latestSpeaking.toFixed(1)}` : "Not evaluated yet",
        },
      },
      weeklyGoalMinutes: dailyMinutes * 7,
      studyStreakDays: completedAttempts.length > 0 ? Math.min(completedAttempts.length * 2, 7) : 1,
    },
    todayPlan: {
      day: currentDayName,
      tasks: displayTasks,
    },
    continueLearning,
    recentActivities,
    stats: {
      totalMistakesLogged: mistakes.length,
      unresolvedMistakesCount: unresolvedMistakes.length,
      vocabularySavedCount: vocabList.length,
      vocabularyMasteredCount: masteredVocab.length,
    },
  };
}
