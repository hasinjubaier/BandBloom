import { withTransaction } from "@/server/db";
import { sanitizeTimezone } from "@/lib/dashboard-utils";

export interface StudyPlanTask {
  id: string;
  day: string; // "Monday", "Tuesday", etc.
  skill: "reading" | "listening" | "writing" | "speaking" | "mock";
  title: string;
  durationMinutes: number;
  completed: boolean;
}

export interface StudyPlanData {
  id: string;
  userId: string;
  weekStart: string;
  isActive: boolean;
  tasks: StudyPlanTask[];
}

export const DEFAULT_WEEKLY_TASKS: StudyPlanTask[] = [
  {
    id: "task-mon-1",
    day: "Monday",
    skill: "reading",
    title: "Skimming & Scanning: Academic Passage 1 (Matching Headings)",
    durationMinutes: 45,
    completed: false,
  },
  {
    id: "task-tue-1",
    day: "Tuesday",
    skill: "listening",
    title: "Note Completion & Section 2 Map Labelling",
    durationMinutes: 40,
    completed: false,
  },
  {
    id: "task-wed-1",
    day: "Wednesday",
    skill: "writing",
    title: "Task 2 Discursive Essay Outline & Paragraph Cohesion",
    durationMinutes: 60,
    completed: false,
  },
  {
    id: "task-thu-1",
    day: "Thursday",
    skill: "speaking",
    title: "Part 2 Long Turn Cue Card (Fluency & Discourse Markers)",
    durationMinutes: 30,
    completed: false,
  },
  {
    id: "task-fri-1",
    day: "Friday",
    skill: "reading",
    title: "True / False / Not Given Strategy Review & Exercise",
    durationMinutes: 45,
    completed: false,
  },
  {
    id: "task-sat-1",
    day: "Saturday",
    skill: "mock",
    title: "Timed Diagnostic Reading & Listening Section Mock",
    durationMinutes: 75,
    completed: false,
  },
  {
    id: "task-sun-1",
    day: "Sunday",
    skill: "writing",
    title: "Task 1 Visual Data Synthesis & Mistake Notebook Review",
    durationMinutes: 45,
    completed: false,
  },
];

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

export async function getStudentStudyPlan(
  userId: string,
  timezone: string = "Asia/Dhaka"
): Promise<StudyPlanData> {
  const safeTimezone = sanitizeTimezone(timezone);
  const currentWeekStart = getMondayOfWeek(new Date(), safeTimezone);

  return withTransaction(async (client) => {
    // Acquire per-student advisory lock to prevent concurrent initialization/rollover races
    await client.query(
      `SELECT pg_advisory_xact_lock(hashtext('study_plan_' || $1::text))`,
      [userId]
    );

    // Check for currently active plan with row lock
    const res = await client.query<{
      id: string;
      user_id: string;
      week_start: string;
      is_active: boolean;
      plan_json: { tasks?: StudyPlanTask[] };
    }>(
      `SELECT id, user_id, week_start::text AS week_start, is_active, plan_json
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

      // If active plan matches the current week, return it
      if (planWeekStart === currentWeekStart) {
        const tasks: StudyPlanTask[] = Array.isArray(row.plan_json?.tasks)
          ? row.plan_json.tasks
          : DEFAULT_WEEKLY_TASKS.map((t) => ({ ...t, completed: false }));

        return {
          id: row.id,
          userId: row.user_id,
          weekStart: planWeekStart,
          isActive: row.is_active,
          tasks,
        };
      }

      // Otherwise, a new week has started: archive/deactivate the old plan
      await client.query(
        `UPDATE study_plans
         SET is_active = false, updated_at = clock_timestamp()
         WHERE user_id = $1 AND is_active = true`,
        [userId]
      );
    }

    // Create fresh weekly plan for the current week with clean completion states
    const initialTasks = DEFAULT_WEEKLY_TASKS.map((t) => ({ ...t, completed: false }));
    const initialPlanJson = { tasks: initialTasks };

    const insertRes = await client.query<{ id: string; week_start: string }>(
      `INSERT INTO study_plans (user_id, plan_version, week_start, plan_json, is_active)
       VALUES ($1, 1, $2, $3, true)
       RETURNING id, week_start::text AS week_start`,
      [userId, currentWeekStart, JSON.stringify(initialPlanJson)]
    );

    return {
      id: insertRes.rows[0].id,
      userId,
      weekStart: insertRes.rows[0].week_start.slice(0, 10),
      isActive: true,
      tasks: initialTasks,
    };
  });
}

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
    // Acquire per-student advisory lock to serialize concurrent task updates
    await client.query(
      `SELECT pg_advisory_xact_lock(hashtext('study_plan_' || $1::text))`,
      [userId]
    );

    // Fetch active plan with row lock FOR UPDATE
    const res = await client.query<{
      id: string;
      user_id: string;
      week_start: string;
      is_active: boolean;
      plan_json: { tasks?: StudyPlanTask[] };
    }>(
      `SELECT id, user_id, week_start::text AS week_start, is_active, plan_json
       FROM study_plans
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [userId]
    );

    let planRow = res.rows[0];
    const currentWeekStart = getMondayOfWeek(new Date(), safeTimezone);

    // If no active plan exists or current week rolled over, initialize fresh active plan
    if (!planRow || String(planRow.week_start).slice(0, 10) !== currentWeekStart) {
      if (planRow) {
        await client.query(
          `UPDATE study_plans
           SET is_active = false, updated_at = clock_timestamp()
           WHERE user_id = $1 AND is_active = true`,
          [userId]
        );
      }

      const initialTasks = DEFAULT_WEEKLY_TASKS.map((t) => ({ ...t, completed: false }));
      const insertRes = await client.query<{ id: string; week_start: string }>(
        `INSERT INTO study_plans (user_id, plan_version, week_start, plan_json, is_active)
         VALUES ($1, 1, $2, $3, true)
         RETURNING id, week_start::text AS week_start`,
        [userId, currentWeekStart, JSON.stringify({ tasks: initialTasks })]
      );
      planRow = {
        id: insertRes.rows[0].id,
        user_id: userId,
        week_start: insertRes.rows[0].week_start,
        is_active: true,
        plan_json: { tasks: initialTasks },
      };
    }

    const tasks: StudyPlanTask[] = Array.isArray(planRow.plan_json?.tasks)
      ? planRow.plan_json.tasks
      : DEFAULT_WEEKLY_TASKS.map((t) => ({ ...t, completed: false }));

    const taskIndex = tasks.findIndex((t) => t.id === cleanTaskId);
    if (taskIndex === -1) {
      throw new Error(`Task '${cleanTaskId}' not found in active study plan.`);
    }

    const targetCompleted = completed !== undefined ? Boolean(completed) : !tasks[taskIndex].completed;

    const updatedTasks = tasks.map((task, idx) => {
      if (idx === taskIndex) {
        return {
          ...task,
          completed: targetCompleted,
        };
      }
      return task;
    });

    const updateRes = await client.query(
      `UPDATE study_plans
       SET plan_json = $1, updated_at = clock_timestamp()
       WHERE id = $2 AND user_id = $3 AND is_active = true`,
      [JSON.stringify({ tasks: updatedTasks }), planRow.id, userId]
    );

    if (updateRes.rowCount === 0) {
      throw new Error("Failed to persist study plan update. Plan not found or user unauthorized.");
    }

    return {
      id: planRow.id,
      userId,
      weekStart: String(planRow.week_start).slice(0, 10),
      isActive: true,
      tasks: updatedTasks,
    };
  });
}
