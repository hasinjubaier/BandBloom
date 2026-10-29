import { query, withTransaction } from "@/server/db";
import { sanitizeTimezone } from "@/lib/dashboard-utils";

export type StudyPlanSkill = "reading" | "listening" | "writing" | "speaking" | "mock";
export type TaskStatus = "planned" | "in_progress" | "completed" | "skipped";

export interface StudyPlanTask {
  id: string;
  day: string; // "Monday", "Tuesday", etc.
  date: string; // "YYYY-MM-DD"
  skill: StudyPlanSkill;
  title: string;
  objective: string;
  whyRecommended: string;
  durationMinutes: number;
  status: TaskStatus;
  completed: boolean; // Preserved for 100% backward compatibility
  completedAt?: string | null;
  actionHref: string;
  actionLabel: string;
  testType: "academic" | "general_training" | "both";
  difficulty?: "foundation" | "target" | "advanced";
  score?: {
    band?: number | null;
    raw?: string | null;
  } | null;
}

export interface StudyPlanReflection {
  submittedAt: string;
  weekStart?: string;
  whatImproved: string;
  difficultSkill: string;
  weakQuestionType: string;
  nextCycleGoal: string;
}

export interface StudyPlanStats {
  totalTasks: number;
  completedTasks: number;
  plannedMinutes: number;
  completedMinutes: number;
  progressPercent: number;
}

export interface StudyPlanData {
  id: string;
  userId: string;
  planVersion: number;
  weekStart: string; // "YYYY-MM-DD"
  weekEnd: string; // "YYYY-MM-DD"
  isActive: boolean;
  planType: "starter" | "adaptive_diagnostic" | "adaptive_performance";
  testType: "academic" | "general_training";
  targetBand: number;
  currentEstimatedBand: number | null;
  examDate: string | null;
  daysRemaining: number | null;
  dailyMinutes: number;
  weeklyGoal: string;
  tasks: StudyPlanTask[];
  reflection?: StudyPlanReflection | null;
  reflectionHistory?: StudyPlanReflection[];
  stats: StudyPlanStats;
}

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/**
 * Calculates the Monday date string (YYYY-MM-DD) for the current week in a given timezone.
 */
export function getMondayOfWeek(now: Date = new Date(), timezone: string = "Asia/Dhaka"): string {
  const safeTimezone = sanitizeTimezone(timezone);
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: safeTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const dateStr = formatter.format(now);
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = d.getUTCDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
    const diffDays = (dayOfWeek + 6) % 7;
    d.setUTCDate(d.getUTCDate() - diffDays);
    return d.toISOString().split("T")[0];
  } catch {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split("T")[0];
  }
}

/**
 * Derives a specific day date string given the Monday start date and offset (0-6).
 */
export function getDateForDayOffset(mondayStr: string, offset: number): string {
  try {
    const [y, m, d] = mondayStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + offset));
    return date.toISOString().split("T")[0];
  } catch {
    return mondayStr;
  }
}

/**
 * Calculates summary completion metrics for any task list.
 */
export function computePlanStats(tasks: StudyPlanTask[]): StudyPlanStats {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed || t.status === "completed").length;
  const plannedMinutes = tasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const completedMinutes = tasks
    .filter((t) => t.completed || t.status === "completed")
    .reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    plannedMinutes,
    completedMinutes,
    progressPercent,
  };
}

/**
 * Deterministic Adaptive Curriculum Generator:
 * Generates an evidence-grounded study plan based on:
 * - Student profile (Academic vs GT, target band, exam date, daily minutes)
 * - Diagnostic / Mock exam scores (identifies weak skills and band gap)
 * - Mistake Notebook (identifies unmastered error tags and question types)
 */
export async function buildAdaptiveCurriculum({
  userId,
  weekStart,
  preserveCompletedTasks = [],
}: {
  userId: string;
  weekStart: string;
  preserveCompletedTasks?: StudyPlanTask[];
}): Promise<Omit<StudyPlanData, "id" | "userId" | "planVersion" | "isActive">> {
  // 1. Fetch student profile (authoritative source)
  const profileRes = await query<{
    test_type: "academic" | "general_training";
    target_band: string | number | null;
    target_date: string | null;
    daily_minutes: number | null;
  }>(
    `SELECT test_type, target_band, target_date::text AS target_date, daily_minutes
     FROM profiles
     WHERE user_id = $1`,
    [userId]
  );

  const profile = profileRes.rows[0] || {
    test_type: "academic",
    target_band: 7.5,
    target_date: null,
    daily_minutes: 60,
  };

  const testType = profile.test_type === "general_training" ? "general_training" : "academic";
  const targetBand = Number(profile.target_band) || 7.5;
  const dailyMinutes = Math.max(30, Math.min(180, Number(profile.daily_minutes) || 60));

  // Exam days remaining
  let daysRemaining: number | null = null;
  if (profile.target_date) {
    const examDateObj = new Date(profile.target_date);
    const now = new Date();
    daysRemaining = Math.max(0, Math.ceil((examDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // 2. Query student diagnostic and mock exam scores
  const scoreRes = await query<{
    attempt_id: string;
    submitted_at: string;
    overall_band: string | number | null;
    reading_band: string | number | null;
    listening_band: string | number | null;
    writing_band: string | number | null;
    speaking_band: string | number | null;
  }>(
    `SELECT a.id AS attempt_id, a.submitted_at::text,
            s_ov.estimated_band AS overall_band,
            s_rd.estimated_band AS reading_band,
            s_ls.estimated_band AS listening_band,
            s_wr.estimated_band AS writing_band,
            s_sp.estimated_band AS speaking_band
     FROM attempts a
     LEFT JOIN scores s_ov ON s_ov.attempt_id = a.id AND s_ov.skill = 'overall'
     LEFT JOIN scores s_rd ON s_rd.attempt_id = a.id AND s_rd.skill = 'reading'
     LEFT JOIN scores s_ls ON s_ls.attempt_id = a.id AND s_ls.skill = 'listening'
     LEFT JOIN scores s_wr ON s_wr.attempt_id = a.id AND s_wr.skill = 'writing'
     LEFT JOIN scores s_sp ON s_sp.attempt_id = a.id AND s_sp.skill = 'speaking'
     WHERE a.user_id = $1 AND a.status IN ('submitted', 'evaluated')
     ORDER BY a.submitted_at DESC
     LIMIT 1`,
    [userId]
  );

  const latestScore = scoreRes.rows[0];
  const hasAssessment = Boolean(latestScore && latestScore.overall_band !== null);
  const currentEstimatedBand = hasAssessment ? Number(latestScore.overall_band) : null;

  // 3. Query Mistake Notebook for open unmastered mistakes
  const mistakeRes = await query<{ skill: string; error_tag: string; err_count: number }>(
    `SELECT skill, error_tag, COUNT(*)::int AS err_count
     FROM mistake_notes
     WHERE user_id = $1 AND retry_status != 'mastered'
     GROUP BY skill, error_tag
     ORDER BY err_count DESC
     LIMIT 3`,
    [userId]
  );
  const topMistakes = mistakeRes.rows;

  // 4. Determine plan type and skill priorities
  const isStarter = !hasAssessment;
  const planType: StudyPlanData["planType"] = isStarter
    ? "starter"
    : topMistakes.length > 0
    ? "adaptive_performance"
    : "adaptive_diagnostic";

  // Calculate skill gaps if assessment exists
  const skillScores: Record<string, number | null> = {
    reading: latestScore?.reading_band ? Number(latestScore.reading_band) : null,
    listening: latestScore?.listening_band ? Number(latestScore.listening_band) : null,
    writing: latestScore?.writing_band ? Number(latestScore.writing_band) : null,
    speaking: latestScore?.speaking_band ? Number(latestScore.speaking_band) : null,
  };

  const skillGaps: { skill: string; gap: number }[] = Object.entries(skillScores).map(
    ([sk, score]) => ({
      skill: sk,
      gap: score !== null ? Math.max(0, targetBand - score) : 1.0,
    })
  );
  skillGaps.sort((a, b) => b.gap - a.gap);
  const weakestSkill = skillGaps[0]?.skill || "reading";
  const secondWeakestSkill = skillGaps[1]?.skill || "writing";

  // 5. Generate Weekly Goal Rationale
  let weeklyGoal = "";
  if (isStarter) {
    weeklyGoal = "Diagnostic Assessment & Core Strategy Orientation";
  } else if (daysRemaining !== null && daysRemaining <= 14) {
    weeklyGoal = `Exam Sprint: High-Yield Correction & Timed Sectional Pacing (${daysRemaining} days left)`;
  } else {
    weeklyGoal = `Target Band ${targetBand.toFixed(1)} Focus: Closing Gaps in ${weakestSkill.toUpperCase()} & ${secondWeakestSkill.toUpperCase()}`;
  }

  // 6. Generate 7 Structured Tasks (Monday through Sunday)
  const isGT = testType === "general_training";
  const standardDuration = Math.max(15, Math.min(dailyMinutes, Math.round(dailyMinutes * 0.75)));
  const intensiveDuration = dailyMinutes;

  const weekEnd = getDateForDayOffset(weekStart, 6);

  // Template generators for each day
  const candidateTasks: Omit<StudyPlanTask, "id" | "day" | "date" | "completed" | "status">[] = [
    // MONDAY: Primary Focus / Diagnostic
    isStarter
      ? {
          skill: "mock",
          title: "Diagnostic Mock Assessment",
          objective: "Full 4-skill diagnostic to establish baseline score",
          whyRecommended: "Essential: complete your diagnostic to unlock personalized weakness targeting.",
          durationMinutes: Math.min(dailyMinutes, 120),
          actionHref: "/mock-centre",
          actionLabel: "Take Diagnostic",
          testType: "both",
          difficulty: "foundation",
        }
      : {
          skill: weakestSkill as StudyPlanSkill,
          title:
            weakestSkill === "reading"
              ? isGT
                ? "GT Reading Section 1 & 2: Notices & Workplace Documents"
                : "Academic Reading Passage 1: Matching Headings & Fast Skim"
              : weakestSkill === "writing"
              ? isGT
                ? "GT Writing Task 1: Formal & Semi-Formal Letter Structure"
                : "Academic Writing Task 1: Visual Data Synthesis & Overview"
              : weakestSkill === "listening"
              ? "Listening Section 2: Map Labelling & Spatial Signposting"
              : "Speaking Part 2: Long Turn Cue Card 1-Minute Prep Drill",
          objective: `Intensive drill targeting lowest assessed band score (${skillScores[weakestSkill] ?? "unrated"})`,
          whyRecommended: `Your assessed ${weakestSkill.toUpperCase()} Band (${skillScores[weakestSkill] ?? "unrated"}) is your primary growth area to achieve Band ${targetBand.toFixed(1)}.`,
          durationMinutes: intensiveDuration,
          actionHref:
            weakestSkill === "mock"
              ? "/mock-centre"
              : weakestSkill === "writing"
              ? `/skills/writing?type=${testType}&task=${isGT ? "letter" : "task1"}`
              : weakestSkill === "reading"
              ? `/skills/reading?type=${testType}`
              : `/skills/${weakestSkill}`,
          actionLabel: "Practise Now",
          testType,
          difficulty: "target",
        },

    // TUESDAY: Secondary Weakness / Strategy
    {
      skill: secondWeakestSkill as StudyPlanSkill,
      title:
        secondWeakestSkill === "writing"
          ? "Writing Task 2: Thesis Formulation & Cohesive Paragraphing"
          : secondWeakestSkill === "listening"
          ? "Listening Section 3: Academic Discussion & Distractor Traps"
          : secondWeakestSkill === "speaking"
          ? "Speaking Part 3: Abstract Reasoning & Discourse Markers"
          : isGT
          ? "GT Reading Section 3: Extended Passage Fact Verification"
          : "Academic Reading: True / False / Not Given Quantifier Traps",
      objective: `Targeted secondary priority skill (${secondWeakestSkill})`,
      whyRecommended: `Essential secondary component to raise overall band average to ${targetBand.toFixed(1)}.`,
      durationMinutes: standardDuration,
      actionHref:
        secondWeakestSkill === "writing"
          ? `/skills/writing?type=${testType}&task=task2`
          : secondWeakestSkill === "reading"
          ? `/skills/reading?type=${testType}&q=tfng`
          : `/skills/${secondWeakestSkill}`,
      actionLabel: "Practise Now",
      testType,
      difficulty: "target",
    },

    // WEDNESDAY: Academic/GT Productive Writing
    {
      skill: "writing",
      title: isGT
        ? "GT Task 1 Letter Tone Mastery (Formal vs Informal Conventions)"
        : "Academic Task 1: Dynamic Trends vs Static Comparisons",
      objective: "Master IELTS task response and grammatical accuracy",
      whyRecommended: isGT
        ? "General Training Task 1 demands strict adherence to formal letter conventions."
        : "Academic Task 1 requires clear overview paragraph and accurate data trend synthesis.",
      durationMinutes: standardDuration,
      actionHref: `/skills/writing?type=${testType}&task=${isGT ? "letter" : "task1"}`,
      actionLabel: "Draft Writing Task",
      testType,
      difficulty: "target",
    },

    // THURSDAY: Interactive Speaking & Fluency Simulator
    {
      skill: "speaking",
      title: "Speaking Part 2 & 3: Fluency, Coherence & Lexical Range",
      objective: "Continuous timed speech without unnatural hesitation pauses",
      whyRecommended: "Speaking descriptors require natural discourse markers and sustained coherence.",
      durationMinutes: Math.min(45, standardDuration),
      actionHref: "/skills/speaking",
      actionLabel: "Launch Recorder",
      testType: "both",
      difficulty: "target",
    },

    // FRIDAY: Error Correction & Mistake Notebook Review
    {
      skill: topMistakes[0] ? (topMistakes[0].skill as StudyPlanSkill) : "writing",
      title: topMistakes[0]
        ? `Mistake Notebook: Resolving ${topMistakes[0].error_tag.replace(/_/g, " ").toUpperCase()}`
        : "Mistake Notebook & Question Strategy Review",
      objective: topMistakes[0]
        ? `Targeted drill on ${topMistakes[0].error_tag}: analyze root causes and execute re-test`
        : "Analyze root cause of past errors and execute re-test",
      whyRecommended: topMistakes[0]
        ? `Directly addresses ${topMistakes[0].err_count} unmastered mistake(s) logged for ${topMistakes[0].error_tag} in your notebook.`
        : "Reviewing error patterns prevents recurring point loss on test day.",
      durationMinutes: Math.min(45, standardDuration),
      actionHref: `/notebook?skill=${topMistakes[0]?.skill || "all"}`,
      actionLabel: "Review Notebook",
      testType: "both",
      difficulty: "target",
    },

    // SATURDAY: Timed Sectional Mock Checkpoint
    {
      skill: "mock",
      title: "Timed Sectional Practice: Reading & Listening Checkpoint",
      objective: "Simulate test-condition time pressure and verify progress",
      whyRecommended: "Weekly timed checkpoints measure pacing and stamina under authentic exam conditions.",
      durationMinutes: Math.min(dailyMinutes, 75),
      actionHref: "/mock-centre",
      actionLabel: "Start Checkpoint",
      testType,
      difficulty: "target",
    },

    // SUNDAY: High-Yield Academic Vocabulary & Spaced Repetition
    {
      skill: "reading",
      title: "Band 7.5+ High-Yield Vocabulary & Collocation Bank",
      objective: "Review Leitner spaced repetition box and active collocations",
      whyRecommended: "Lexical Resource accounts for 25% of both Writing and Speaking band criteria.",
      durationMinutes: Math.min(40, standardDuration),
      actionHref: "/vocabulary",
      actionLabel: "Review Vocabulary",
      testType: "both",
      difficulty: "foundation",
    },
  ];

  // 7. Assemble full 7-day task list with stable IDs and date stamps
  const finalTasks: StudyPlanTask[] = DAYS_OF_WEEK.map((dayName, index) => {
    const dayDate = getDateForDayOffset(weekStart, index);
    const candidate = candidateTasks[index];
    const taskId = `task-${dayName.toLowerCase().slice(0, 3)}-1`;

    // Check if a completed task already exists for this slot (e.g. during regeneration)
    const existingCompleted = preserveCompletedTasks.find(
      (t) => t.id === taskId || (t.day === dayName && t.completed)
    );

    if (existingCompleted) {
      return {
        ...existingCompleted,
        date: dayDate,
      };
    }

    return {
      id: taskId,
      day: dayName,
      date: dayDate,
      skill: candidate.skill,
      title: candidate.title,
      objective: candidate.objective,
      whyRecommended: candidate.whyRecommended,
      durationMinutes: candidate.durationMinutes,
      status: "planned",
      completed: false,
      completedAt: null,
      actionHref: candidate.actionHref,
      actionLabel: candidate.actionLabel,
      testType: candidate.testType,
      difficulty: candidate.difficulty || "target",
      score: null,
    };
  });

  const stats = computePlanStats(finalTasks);

  return {
    weekStart,
    weekEnd,
    planType,
    testType,
    targetBand,
    currentEstimatedBand,
    examDate: profile.target_date,
    daysRemaining,
    dailyMinutes,
    weeklyGoal,
    tasks: finalTasks,
    stats,
  };
}

/**
 * Retrieves or initializes the active adaptive study plan for a student.
 */
export async function getStudentStudyPlan(
  userId: string,
  timezone: string = "Asia/Dhaka"
): Promise<StudyPlanData> {
  const safeTimezone = sanitizeTimezone(timezone);
  const currentWeekStart = getMondayOfWeek(new Date(), safeTimezone);

  return withTransaction(async (client) => {
    // Acquire per-student advisory lock to prevent concurrent initialization races
    await client.query(
      `SELECT pg_advisory_xact_lock(hashtext('study_plan_' || $1::text))`,
      [userId]
    );

    // Fetch active plan with row lock FOR UPDATE
    const res = await client.query<{
      id: string;
      user_id: string;
      plan_version: number;
      week_start: string;
      is_active: boolean;
      plan_json: Partial<StudyPlanData>;
    }>(
      `SELECT id, user_id, plan_version, week_start::text AS week_start, is_active, plan_json
       FROM study_plans
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [userId]
    );

    if (res.rows.length > 0) {
      const row = res.rows[0];
      const planWeekStart = String(row.week_start).slice(0, 10);

      // If active plan matches current week, return it with re-calculated stats
      if (planWeekStart === currentWeekStart) {
        const storedJson = row.plan_json || {};
        const rawTasks = Array.isArray(storedJson.tasks) ? storedJson.tasks : [];

        // Ensure tasks conform to rich task model
        const tasks: StudyPlanTask[] = rawTasks.map((t, idx) => ({
          id: t.id || `task-${row.user_id.slice(0, 8)}-${planWeekStart}-${idx}`,
          day: t.day || DAYS_OF_WEEK[idx % 7],
          date: t.date || getDateForDayOffset(planWeekStart, idx % 7),
          skill: t.skill || "reading",
          title: t.title || "Study Activity",
          objective: t.objective || "Targeted skill practice",
          whyRecommended: t.whyRecommended || "Core weekly curriculum milestone.",
          durationMinutes: t.durationMinutes || 45,
          status: t.status || (t.completed ? "completed" : "planned"),
          completed: Boolean(t.completed || t.status === "completed"),
          completedAt: t.completedAt || (t.completed ? new Date().toISOString() : null),
          actionHref: t.actionHref || (t.skill === "mock" ? "/mock-centre" : `/skills/${t.skill || "reading"}`),
          actionLabel: t.actionLabel || "Practise Now",
          testType: t.testType || "both",
          difficulty: t.difficulty || "target",
          score: t.score || null,
        }));

        const stats = computePlanStats(tasks);

        return {
          id: row.id,
          userId: row.user_id,
          planVersion: row.plan_version || 1,
          weekStart: planWeekStart,
          weekEnd: storedJson.weekEnd || getDateForDayOffset(planWeekStart, 6),
          isActive: row.is_active,
          planType: storedJson.planType || "starter",
          testType: storedJson.testType || "academic",
          targetBand: Number(storedJson.targetBand) || 7.5,
          currentEstimatedBand: storedJson.currentEstimatedBand ?? null,
          examDate: storedJson.examDate || null,
          daysRemaining: storedJson.daysRemaining ?? null,
          dailyMinutes: storedJson.dailyMinutes || 60,
          weeklyGoal: storedJson.weeklyGoal || "Weekly IELTS Curriculum",
          tasks,
          reflection: storedJson.reflection || null,
          reflectionHistory: storedJson.reflectionHistory || (storedJson.reflection ? [storedJson.reflection] : []),
          stats,
        };
      }

      // If week rolled over: archive old plan
      await client.query(
        `UPDATE study_plans
         SET is_active = false, updated_at = clock_timestamp()
         WHERE user_id = $1 AND is_active = true`,
        [userId]
      );
    }

    // Build fresh adaptive curriculum
    const generated = await buildAdaptiveCurriculum({
      userId,
      weekStart: currentWeekStart,
    });

    const insertRes = await client.query<{ id: string; week_start: string }>(
      `INSERT INTO study_plans (user_id, plan_version, week_start, plan_json, is_active)
       VALUES ($1, 1, $2, $3, true)
       RETURNING id, week_start::text AS week_start`,
      [userId, currentWeekStart, JSON.stringify(generated)]
    );

    return {
      id: insertRes.rows[0].id,
      userId,
      planVersion: 1,
      isActive: true,
      ...generated,
    };
  });
}

/**
 * Toggles or updates task completion status.
 */
export async function toggleTaskCompletion(
  userId: string,
  taskId: string,
  completed?: boolean,
  timezone: string = "Asia/Dhaka"
): Promise<StudyPlanData> {
  if (!taskId || typeof taskId !== "string" || !taskId.trim()) {
    throw new Error("Valid task ID is required.");
  }
  const cleanTaskId = taskId.trim();
  const safeTimezone = sanitizeTimezone(timezone);

  return withTransaction(async (client) => {
    // Acquire per-student advisory lock to serialize updates
    await client.query(
      `SELECT pg_advisory_xact_lock(hashtext('study_plan_' || $1::text))`,
      [userId]
    );

    // Fetch active plan
    const res = await client.query<{
      id: string;
      user_id: string;
      plan_version: number;
      week_start: string;
      is_active: boolean;
      plan_json: Partial<StudyPlanData>;
    }>(
      `SELECT id, user_id, plan_version, week_start::text AS week_start, is_active, plan_json
       FROM study_plans
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [userId]
    );

    let planRow = res.rows[0];
    const currentWeekStart = getMondayOfWeek(new Date(), safeTimezone);

    // If no plan exists or rolled over, initialize fresh plan first
    if (!planRow || String(planRow.week_start).slice(0, 10) !== currentWeekStart) {
      if (planRow) {
        await client.query(
          `UPDATE study_plans
           SET is_active = false, updated_at = clock_timestamp()
           WHERE user_id = $1 AND is_active = true`,
          [userId]
        );
      }

      const generated = await buildAdaptiveCurriculum({
        userId,
        weekStart: currentWeekStart,
      });

      const insertRes = await client.query<{ id: string; week_start: string }>(
        `INSERT INTO study_plans (user_id, plan_version, week_start, plan_json, is_active)
         VALUES ($1, 1, $2, $3, true)
         RETURNING id, week_start::text AS week_start`,
        [userId, currentWeekStart, JSON.stringify(generated)]
      );

      planRow = {
        id: insertRes.rows[0].id,
        user_id: userId,
        plan_version: 1,
        week_start: insertRes.rows[0].week_start,
        is_active: true,
        plan_json: generated,
      };
    }

    const storedJson = planRow.plan_json || {};
    const tasks: StudyPlanTask[] = Array.isArray(storedJson.tasks) ? [...storedJson.tasks] : [];

    const taskIndex = tasks.findIndex((t) => t.id === cleanTaskId);
    if (taskIndex === -1) {
      throw new Error(`Task '${cleanTaskId}' not found in active study plan.`);
    }

    const existingTask = tasks[taskIndex];
    const targetCompleted = completed !== undefined ? Boolean(completed) : !existingTask.completed;

    const updatedTask: StudyPlanTask = {
      ...existingTask,
      completed: targetCompleted,
      status: targetCompleted ? "completed" : "planned",
      completedAt: targetCompleted ? new Date().toISOString() : null,
    };

    tasks[taskIndex] = updatedTask;
    const stats = computePlanStats(tasks);

    const updatedPlanJson: Partial<StudyPlanData> = {
      ...storedJson,
      tasks,
      stats,
    };

    await client.query(
      `UPDATE study_plans
       SET plan_json = $1, updated_at = clock_timestamp()
       WHERE id = $2 AND user_id = $3 AND is_active = true`,
      [JSON.stringify(updatedPlanJson), planRow.id, userId]
    );

    return {
      id: planRow.id,
      userId,
      planVersion: planRow.plan_version || 1,
      weekStart: String(planRow.week_start).slice(0, 10),
      weekEnd: storedJson.weekEnd || getDateForDayOffset(String(planRow.week_start).slice(0, 10), 6),
      isActive: true,
      planType: storedJson.planType || "starter",
      testType: storedJson.testType || "academic",
      targetBand: Number(storedJson.targetBand) || 7.5,
      currentEstimatedBand: storedJson.currentEstimatedBand ?? null,
      examDate: storedJson.examDate || null,
      daysRemaining: storedJson.daysRemaining ?? null,
      dailyMinutes: storedJson.dailyMinutes || 60,
      weeklyGoal: storedJson.weeklyGoal || "Weekly IELTS Curriculum",
      tasks,
      reflection: storedJson.reflection || null,
      reflectionHistory: storedJson.reflectionHistory || (storedJson.reflection ? [storedJson.reflection] : []),
      stats,
    };
  });
}

/**
 * Reschedules an uncompleted task to a different day of the week.
 */
export async function reschedulePlanTask(
  userId: string,
  taskId: string,
  newDay: string
): Promise<StudyPlanData> {
  const cleanTaskId = taskId?.trim();
  const cleanDay = newDay?.trim();

  if (!cleanTaskId || !cleanDay) {
    throw new Error("Task ID and new day are required for rescheduling.");
  }

  const dayIndex = DAYS_OF_WEEK.findIndex((d) => d.toLowerCase() === cleanDay.toLowerCase());
  if (dayIndex === -1) {
    throw new Error(`Invalid target day '${newDay}'. Allowed: ${DAYS_OF_WEEK.join(", ")}`);
  }

  const targetDay = DAYS_OF_WEEK[dayIndex];

  return withTransaction(async (client) => {
    await client.query(
      `SELECT pg_advisory_xact_lock(hashtext('study_plan_' || $1::text))`,
      [userId]
    );

    const res = await client.query<{
      id: string;
      user_id: string;
      plan_version: number;
      week_start: string;
      plan_json: Partial<StudyPlanData>;
    }>(
      `SELECT id, user_id, plan_version, week_start::text AS week_start, plan_json
       FROM study_plans
       WHERE user_id = $1 AND is_active = true
       FOR UPDATE`,
      [userId]
    );

    if (res.rows.length === 0) {
      throw new Error("Active study plan not found.");
    }

    const planRow = res.rows[0];
    const storedJson = planRow.plan_json || {};
    const tasks: StudyPlanTask[] = Array.isArray(storedJson.tasks) ? [...storedJson.tasks] : [];

    const taskIndex = tasks.findIndex((t) => t.id === cleanTaskId);
    if (taskIndex === -1) {
      throw new Error(`Task '${cleanTaskId}' not found in active study plan.`);
    }

    // 1. Guard: Completed tasks cannot be rescheduled
    if (tasks[taskIndex].completed || tasks[taskIndex].status === "completed") {
      throw new Error("Completed tasks cannot be rescheduled.");
    }

    const weekStart = String(planRow.week_start).slice(0, 10);

    // 2. Guard: Duplicate rescheduling requests (idempotent no-op)
    if (tasks[taskIndex].day === targetDay) {
      return {
        id: planRow.id,
        userId,
        planVersion: planRow.plan_version,
        weekStart,
        weekEnd: storedJson.weekEnd || getDateForDayOffset(weekStart, 6),
        isActive: true,
        planType: storedJson.planType || "starter",
        testType: storedJson.testType || "academic",
        targetBand: Number(storedJson.targetBand) || 7.5,
        currentEstimatedBand: storedJson.currentEstimatedBand ?? null,
        examDate: storedJson.examDate || null,
        daysRemaining: storedJson.daysRemaining ?? null,
        dailyMinutes: storedJson.dailyMinutes || 60,
        weeklyGoal: storedJson.weeklyGoal || "Weekly IELTS Curriculum",
        tasks,
        reflection: storedJson.reflection || null,
        reflectionHistory: storedJson.reflectionHistory || (storedJson.reflection ? [storedJson.reflection] : []),
        stats: computePlanStats(tasks),
      };
    }

    // 3. Guard: Day capacity limit (maximum 3 activities per day)
    const existingTargetDayTasks = tasks.filter((t) => t.day === targetDay && t.id !== cleanTaskId);
    if (existingTargetDayTasks.length >= 3) {
      throw new Error(
        `Cannot reschedule to ${targetDay}: day capacity reached (maximum 3 activities per day). Please select another day.`
      );
    }

    // 4. Guard: Aggregate daily study-time constraint
    const targetDayExistingMinutes = existingTargetDayTasks.reduce(
      (sum, t) => sum + (t.durationMinutes || 0),
      0
    );
    const taskToMove = tasks[taskIndex];
    const newDayAggregateMinutes = targetDayExistingMinutes + (taskToMove.durationMinutes || 0);
    const dailyMinutesLimit = storedJson.dailyMinutes || 60;

    if (newDayAggregateMinutes > dailyMinutesLimit) {
      throw new Error(
        `Cannot reschedule to ${targetDay}: total study time (${newDayAggregateMinutes} mins) would exceed your daily preference of ${dailyMinutesLimit} mins. Please choose another day or adjust your daily study minutes in profile settings.`
      );
    }
    const newDate = getDateForDayOffset(weekStart, dayIndex);

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      day: targetDay,
      date: newDate,
    };

    const stats = computePlanStats(tasks);
    const updatedPlanJson = { ...storedJson, tasks, stats };

    await client.query(
      `UPDATE study_plans
       SET plan_json = $1, updated_at = clock_timestamp()
       WHERE id = $2 AND user_id = $3`,
      [JSON.stringify(updatedPlanJson), planRow.id, userId]
    );

    return {
      id: planRow.id,
      userId,
      planVersion: planRow.plan_version,
      weekStart,
      weekEnd: storedJson.weekEnd || getDateForDayOffset(weekStart, 6),
      isActive: true,
      planType: storedJson.planType || "starter",
      testType: storedJson.testType || "academic",
      targetBand: Number(storedJson.targetBand) || 7.5,
      currentEstimatedBand: storedJson.currentEstimatedBand ?? null,
      examDate: storedJson.examDate || null,
      daysRemaining: storedJson.daysRemaining ?? null,
      dailyMinutes: storedJson.dailyMinutes || 60,
      weeklyGoal: storedJson.weeklyGoal || "Weekly IELTS Curriculum",
      tasks,
      reflection: storedJson.reflection || null,
      reflectionHistory: storedJson.reflectionHistory || (storedJson.reflection ? [storedJson.reflection] : []),
      stats,
    };
  });
}

/**
 * Regenerates the active plan adaptively based on latest scores and profile updates,
 * strictly PRESERVING completed tasks from the existing plan.
 */
export async function regenerateStudentPlan(
  userId: string,
  timezone: string = "Asia/Dhaka"
): Promise<StudyPlanData> {
  const safeTimezone = sanitizeTimezone(timezone);
  const currentWeekStart = getMondayOfWeek(new Date(), safeTimezone);

  return withTransaction(async (client) => {
    await client.query(
      `SELECT pg_advisory_xact_lock(hashtext('study_plan_' || $1::text))`,
      [userId]
    );

    const activeRes = await client.query<{
      id: string;
      plan_version: number;
      week_start: string;
      plan_json: Partial<StudyPlanData>;
    }>(
      `SELECT id, plan_version, week_start::text AS week_start, plan_json
       FROM study_plans
       WHERE user_id = $1 AND is_active = true
       FOR UPDATE`,
      [userId]
    );

    let completedTasks: StudyPlanTask[] = [];
    let nextVersion = 1;
    let preservedReflection: StudyPlanReflection | null = null;
    let preservedReflectionHistory: StudyPlanReflection[] = [];

    if (activeRes.rows.length > 0) {
      const active = activeRes.rows[0];
      nextVersion = (active.plan_version || 1) + 1;
      const tasks = Array.isArray(active.plan_json?.tasks) ? active.plan_json.tasks : [];
      completedTasks = tasks.filter((t) => t.completed || t.status === "completed");
      preservedReflection = active.plan_json?.reflection || null;
      preservedReflectionHistory = Array.isArray(active.plan_json?.reflectionHistory)
        ? active.plan_json.reflectionHistory
        : preservedReflection
        ? [preservedReflection]
        : [];

      // Archive previous version
      await client.query(
        `UPDATE study_plans
         SET is_active = false, updated_at = clock_timestamp()
         WHERE id = $1`,
        [active.id]
      );
    }

    // Build adaptive curriculum with completed tasks preserved
    const generated = await buildAdaptiveCurriculum({
      userId,
      weekStart: currentWeekStart,
      preserveCompletedTasks: completedTasks,
    });

    const fullPlanJson = {
      ...generated,
      reflection: preservedReflection,
      reflectionHistory: preservedReflectionHistory,
    };

    const insertRes = await client.query<{ id: string }>(
      `INSERT INTO study_plans (user_id, plan_version, week_start, plan_json, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id`,
      [userId, nextVersion, currentWeekStart, JSON.stringify(fullPlanJson)]
    );

    return {
      id: insertRes.rows[0].id,
      userId,
      planVersion: nextVersion,
      isActive: true,
      ...fullPlanJson,
    };
  });
}

/**
 * Saves a student's weekly reflection and strategy for the active study plan.
 */
export async function saveWeeklyReflection(
  userId: string,
  reflection: {
    whatImproved: string;
    difficultSkill: string;
    weakQuestionType: string;
    nextCycleGoal: string;
  }
): Promise<StudyPlanData> {
  const { whatImproved, difficultSkill, weakQuestionType, nextCycleGoal } = reflection;

  if (!whatImproved?.trim() || !nextCycleGoal?.trim()) {
    throw new Error("Please complete the required reflection fields.");
  }

  return withTransaction(async (client) => {
    await client.query(
      `SELECT pg_advisory_xact_lock(hashtext('study_plan_' || $1::text))`,
      [userId]
    );

    const res = await client.query<{
      id: string;
      plan_version: number;
      week_start: string;
      plan_json: Partial<StudyPlanData>;
    }>(
      `SELECT id, plan_version, week_start::text AS week_start, plan_json
       FROM study_plans
       WHERE user_id = $1 AND is_active = true
       FOR UPDATE`,
      [userId]
    );

    if (res.rows.length === 0) {
      throw new Error("Active study plan not found.");
    }

    const row = res.rows[0];
    const planWeekStart = String(row.week_start).slice(0, 10);
    const storedJson = row.plan_json || {};

    const reflectionRecord: StudyPlanReflection = {
      submittedAt: new Date().toISOString(),
      weekStart: planWeekStart,
      whatImproved: whatImproved.trim(),
      difficultSkill: (difficultSkill || "general").trim(),
      weakQuestionType: (weakQuestionType || "none").trim(),
      nextCycleGoal: nextCycleGoal.trim(),
    };

    const priorHistory: StudyPlanReflection[] = Array.isArray(storedJson.reflectionHistory)
      ? storedJson.reflectionHistory
      : storedJson.reflection
      ? [storedJson.reflection]
      : [];

    const updatedHistory = [...priorHistory, reflectionRecord];

    const updatedJson = {
      ...storedJson,
      reflection: reflectionRecord,
      reflectionHistory: updatedHistory,
    };

    await client.query(
      `UPDATE study_plans
       SET plan_json = $1, updated_at = clock_timestamp()
       WHERE id = $2 AND user_id = $3`,
      [JSON.stringify(updatedJson), row.id, userId]
    );

    const tasks = Array.isArray(storedJson.tasks) ? storedJson.tasks : [];
    const stats = computePlanStats(tasks);

    return {
      id: row.id,
      userId,
      planVersion: row.plan_version,
      weekStart: planWeekStart,
      weekEnd: storedJson.weekEnd || getDateForDayOffset(planWeekStart, 6),
      isActive: true,
      planType: storedJson.planType || "starter",
      testType: storedJson.testType || "academic",
      targetBand: Number(storedJson.targetBand) || 7.5,
      currentEstimatedBand: storedJson.currentEstimatedBand ?? null,
      examDate: storedJson.examDate || null,
      daysRemaining: storedJson.daysRemaining ?? null,
      dailyMinutes: storedJson.dailyMinutes || 60,
      weeklyGoal: storedJson.weeklyGoal || "Weekly IELTS Curriculum",
      tasks,
      reflection: reflectionRecord,
      reflectionHistory: updatedHistory,
      stats,
    };
  });
}
