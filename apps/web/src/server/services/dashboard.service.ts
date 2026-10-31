import { getStudentProfile } from "./profile.service";
import { getStudentStudyPlan } from "./study-plan.service";
import { getStudentAttempts } from "./mock.service";
import { getStudentMistakes, MistakeNoteData } from "./notebook.service";
import { getStudentVocabularyStats, getStudentSavedVocabulary, VocabularyWord } from "./vocabulary.service";
import { getDhakaDaysRemaining, formatSkill, sanitizeTimezone } from "@/lib/dashboard-utils";

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
    timezone: string;
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
  inProgressAttempt: {
    id: string;
    examId: string;
    examTitle: string;
    testType: string;
  } | null;
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

/**
 * Calculates genuine consecutive-day study streak from real activity dates in the user's timezone.
 * Returns 0 if there is no activity today or yesterday.
 */
export function calculateStudyStreak(activityDates: string[], now: Date = new Date(), timezone: string = "Asia/Dhaka"): number {
  if (!activityDates || activityDates.length === 0) return 0;

  const safeTimezone = sanitizeTimezone(timezone);
  const dateSet = new Set(activityDates);

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const todayStr = formatter.format(now);
  const [year, month, day] = todayStr.split("-").map(Number);

  // Check today and yesterday
  const todayUtc = new Date(Date.UTC(year, month - 1, day));
  const yesterdayUtc = new Date(todayUtc);
  yesterdayUtc.setUTCDate(yesterdayUtc.getUTCDate() - 1);
  const yesterdayStr = yesterdayUtc.toISOString().split("T")[0];

  const hasActivityToday = dateSet.has(todayStr);
  const hasActivityYesterday = dateSet.has(yesterdayStr);

  // If neither today nor yesterday had activity, streak is broken / zero
  if (!hasActivityToday && !hasActivityYesterday) {
    return 0;
  }

  let streak = 0;
  const cursor = hasActivityToday ? new Date(todayUtc) : new Date(yesterdayUtc);

  while (true) {
    const curStr = cursor.toISOString().split("T")[0];
    if (dateSet.has(curStr)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function getStudentDashboardSummary(
  userId: string
): Promise<StudentDashboardData> {
  // 1. Fetch Profile
  const profile = await getStudentProfile(userId);
  const fullName = profile?.fullName || "IELTS Candidate";
  const targetBand = Number(profile?.targetBand || 7.0);
  const targetDate = profile?.targetDate || new Date(Date.now() + 30 * 86400000).toISOString();
  const testType: "academic" | "general_training" =
    profile?.testType?.toLowerCase() === "general_training" ? "general_training" : "academic";
  const dailyMinutes = Number(profile?.dailyMinutes || 60);
  const timezone = sanitizeTimezone(profile?.timezone);

  // Calculate days remaining in user's timezone
  const daysRemaining = getDhakaDaysRemaining(targetDate, new Date(), timezone);

  // 2. Fetch Attempts, strictly filtered by candidate's test module
  const rawAttempts = await getStudentAttempts(userId);
  // Module filtering: exclude null, undefined, or cross-module exams
  const moduleAttempts = rawAttempts.filter(
    (a) => a.testType && a.testType.toLowerCase() === testType.toLowerCase()
  );

  const completedAttempts = moduleAttempts.filter(
    (a) => a.status === "submitted" || a.status === "evaluated"
  );
  const inProgressAttempt = moduleAttempts.find((a) => a.status === "in_progress") || null;

  // 3. Compute independent skill-specific practice counts and latest evaluated scores
  // Only count an activity for a skill when that skill was actually scored/evaluated.
  // Diagnostic sets (which have insufficient questions for calibrated bands) must NEVER fabricate official band scores.
  const readingAttempts = completedAttempts.filter(
    (a) => a.readingScore !== null && a.assessmentType !== "diagnostic"
  );
  const diagnosticReadingAttempts = completedAttempts.filter(
    (a) => a.assessmentType === "diagnostic" && a.rawScore !== null
  );
  const listeningAttempts = completedAttempts.filter((a) => a.listeningScore !== null);
  const writingAttempts = completedAttempts.filter((a) => a.writingScore !== null);
  const speakingAttempts = completedAttempts.filter((a) => a.speakingScore !== null);

  const latestReading = readingAttempts[0]?.readingScore ?? null;
  const latestListening = listeningAttempts[0]?.listeningScore ?? null;
  const latestWriting = writingAttempts[0]?.writingScore ?? null;
  const latestSpeaking = speakingAttempts[0]?.speakingScore ?? null;
  const latestOverall =
    completedAttempts.find(
      (a) => a.overallBand !== null && a.assessmentType !== "diagnostic"
    )?.overallBand ?? null;

  // 4. Fetch Study Plan in User Timezone
  const plan = await getStudentStudyPlan(userId, timezone);
  const dayFormatter = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long" });
  const currentDayName = dayFormatter.format(new Date());

  // Never substitute tasks from other weekdays when today's schedule is empty
  const todayTasks = plan.tasks.filter(
    (t) => t.day.toLowerCase() === currentDayName.toLowerCase()
  );

  // 5. Fetch Personal Mistakes and Vocabulary Stats
  let mistakes: MistakeNoteData[] = [];
  try {
    mistakes = await getStudentMistakes(userId);
  } catch (error) {
    console.error("[Dashboard Service]: Error fetching mistakes:", error);
    mistakes = [];
  }
  const unresolvedMistakes = mistakes.filter((m) => m.retryStatus !== "mastered");

  let vocabStats = {
    totalSaved: 0,
    learningCount: 0,
    reviewingCount: 0,
    masteredCount: 0,
    catalogAvailableCount: 0,
  };
  let savedVocab: VocabularyWord[] = [];
  try {
    [vocabStats, savedVocab] = await Promise.all([
      getStudentVocabularyStats(userId),
      getStudentSavedVocabulary(userId),
    ]);
  } catch (error) {
    console.error("[Dashboard Service]: Error fetching vocabulary stats:", error);
  }

  // 6. Calculate genuine study streak from real activity dates in user timezone
  const activityDateStrings: string[] = [];
  const dateToYmd = (iso: string | null | undefined): string | null => {
    if (!iso) return null;
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(new Date(iso));
    } catch {
      return null;
    }
  };

  for (const att of moduleAttempts) {
    const d = dateToYmd(att.submittedAt || att.startedAt);
    if (d) activityDateStrings.push(d);
  }
  for (const m of mistakes) {
    const d = dateToYmd(m.createdAt);
    if (d) activityDateStrings.push(d);
  }
  for (const v of savedVocab) {
    // Only count genuine activity timestamp: when reviewed or originally saved
    const activityTs = v.lastReviewedAt || v.createdAt;
    if (activityTs) {
      const d = dateToYmd(activityTs);
      if (d) activityDateStrings.push(d);
    }
  }
  for (const t of todayTasks) {
    if (t.completed) {
      const todayDateStr = dateToYmd(new Date().toISOString());
      if (todayDateStr) activityDateStrings.push(todayDateStr);
    }
  }

  const studyStreakDays = calculateStudyStreak(activityDateStrings, new Date(), timezone);

  // 7. Combine Recent Activities, sort chronologically descending, and slice top 5
  type ActivityItem = StudentDashboardData["recentActivities"][number];
  const combinedActivities: ActivityItem[] = [];

  for (const att of moduleAttempts) {
    const ts = att.submittedAt || att.startedAt;
    if (!ts) continue;

    let detail = "Mock test in progress";
    if (att.status === "evaluated" && att.overallBand !== null) {
      detail = `Completed with Practice Band ${att.overallBand.toFixed(1)}`;
    } else if (att.status === "submitted") {
      detail = "Completed — evaluation pending";
    } else if (att.status === "abandoned") {
      detail = "Mock test abandoned";
    }

    combinedActivities.push({
      id: `att-${att.id}`,
      type: "exam",
      title: att.examTitle,
      detail,
      timestamp: ts,
    });
  }

  for (const m of mistakes) {
    if (!m.createdAt) continue;
    combinedActivities.push({
      id: `m-${m.id}`,
      type: "mistake",
      title: `Logged ${formatSkill(m.skill)} Error`,
      detail: `${m.errorTag}: ${m.questionPrompt.slice(0, 45)}...`,
      timestamp: m.createdAt,
    });
  }

  for (const v of savedVocab) {
    const ts = v.lastReviewedAt || v.createdAt;
    if (!ts) continue;
    combinedActivities.push({
      id: `vocab-${v.id}`,
      type: "vocab",
      title: `Saved Word: ${v.word}`,
      detail: `Mastery: ${v.mastery.charAt(0).toUpperCase() + v.mastery.slice(1)} • ${v.meaning.slice(0, 45)}...`,
      timestamp: ts,
    });
  }

  const safeTimestampMs = (iso?: string | null): number => {
    if (!iso) return 0;
    const ms = new Date(iso).getTime();
    return isNaN(ms) ? 0 : ms;
  };

  // Filter valid dates and sort strictly chronologically descending (newest first)
  const validActivities = combinedActivities.filter((a) => safeTimestampMs(a.timestamp) > 0);
  validActivities.sort((a, b) => safeTimestampMs(b.timestamp) - safeTimestampMs(a.timestamp));
  const recentActivities = validActivities.slice(0, 5);

  // 8. Next Priority Action / Continue Learning
  let continueLearning = {
    title: "Review Weekly Study Plan",
    subtitle: "All scheduled tasks for today are complete",
    skill: "reading",
    href: "/study-plan",
    actionLabel: "Open Study Plan",
  };

  if (inProgressAttempt) {
    continueLearning = {
      title: "Resume In-Progress Mock Test",
      subtitle: inProgressAttempt.examTitle,
      skill: "mock",
      href: `/mock-centre/exam?id=${inProgressAttempt.examId}&attempt=${inProgressAttempt.id}`,
      actionLabel: "Resume Mock Test",
    };
  } else {
    const nextIncompleteToday = todayTasks.find((t) => !t.completed);
    if (nextIncompleteToday) {
      continueLearning = {
        title: nextIncompleteToday.title,
        subtitle: `Scheduled for today (${nextIncompleteToday.durationMinutes} min)`,
        skill: nextIncompleteToday.skill,
        href: `/skills/${nextIncompleteToday.skill === "mock" ? "reading" : nextIncompleteToday.skill}`,
        actionLabel: "Start Today's Task",
      };
    }
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
      timezone,
    },
    overview: {
      overallEstimatedBand: latestOverall,
      isOfficial: false, // Standard practice estimation
      confidenceLabel: latestOverall
        ? "Diagnostic Estimate (Unofficial)"
        : "Pending First Practice Test",
      completedExamsCount: completedAttempts.filter((a) => a.assessmentType !== "diagnostic").length,
      skills: {
        reading: {
          band: latestReading,
          practiceCount: readingAttempts.length + diagnosticReadingAttempts.length,
          label:
            latestReading !== null
              ? `Band ${latestReading.toFixed(1)}`
              : diagnosticReadingAttempts.length > 0
              ? `Diagnostic (${diagnosticReadingAttempts[0].rawScore}/${diagnosticReadingAttempts[0].maxScore || 4})`
              : "Not evaluated yet",
        },
        listening: {
          band: latestListening,
          practiceCount: listeningAttempts.length,
          label: latestListening !== null ? `Band ${latestListening.toFixed(1)}` : "Not evaluated yet",
        },
        writing: {
          band: latestWriting,
          practiceCount: writingAttempts.length,
          label: latestWriting !== null ? `Band ${latestWriting.toFixed(1)}` : "Not evaluated yet",
        },
        speaking: {
          band: latestSpeaking,
          practiceCount: speakingAttempts.length,
          label: latestSpeaking !== null ? `Band ${latestSpeaking.toFixed(1)}` : "Not evaluated yet",
        },
      },
      weeklyGoalMinutes: dailyMinutes * 7,
      studyStreakDays,
    },
    todayPlan: {
      day: currentDayName,
      tasks: todayTasks,
    },
    continueLearning,
    inProgressAttempt: inProgressAttempt
      ? {
          id: inProgressAttempt.id,
          examId: inProgressAttempt.examId,
          examTitle: inProgressAttempt.examTitle,
          testType: inProgressAttempt.testType,
        }
      : null,
    recentActivities,
    stats: {
      totalMistakesLogged: mistakes.length,
      unresolvedMistakesCount: unresolvedMistakes.length,
      vocabularySavedCount: vocabStats.totalSaved,
      vocabularyMasteredCount: vocabStats.masteredCount,
    },
  };
}
