import { query } from "@/server/db";

export interface StudyPlanTask {
  id: string;
  day: string; // e.g. "Monday", "Tuesday", etc.
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

const DEFAULT_WEEKLY_TASKS: StudyPlanTask[] = [
  {
    id: "task-mon-1",
    day: "Monday",
    skill: "reading",
    title: "Skimming & Scanning: Academic Passage 1 (Matching Headings)",
    durationMinutes: 45,
    completed: true,
  },
  {
    id: "task-tue-1",
    day: "Tuesday",
    skill: "listening",
    title: "Note Completion & Section 2 Map Labelling",
    durationMinutes: 40,
    completed: true,
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

export async function getStudentStudyPlan(userId: string): Promise<StudyPlanData> {
  try {
    const res = await query<{
      id: string;
      user_id: string;
      week_start: string;
      is_active: boolean;
      plan_json: { tasks?: StudyPlanTask[] };
    }>(
      `SELECT id, user_id, week_start, is_active, plan_json
       FROM study_plans
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (res.rows.length > 0) {
      const row = res.rows[0];
      const tasks: StudyPlanTask[] = Array.isArray(row.plan_json?.tasks)
        ? row.plan_json.tasks
        : DEFAULT_WEEKLY_TASKS;

      return {
        id: row.id,
        userId: row.user_id,
        weekStart: row.week_start,
        isActive: row.is_active,
        tasks,
      };
    }

    // If no plan exists in DB yet, create one for the user
    const weekStart = new Date().toISOString().split("T")[0];
    const initialPlanJson = { tasks: DEFAULT_WEEKLY_TASKS };

    const insertRes = await query<{ id: string }>(
      `INSERT INTO study_plans (user_id, plan_version, week_start, plan_json, is_active)
       VALUES ($1, 1, $2, $3, true)
       RETURNING id`,
      [userId, weekStart, JSON.stringify(initialPlanJson)]
    );

    return {
      id: insertRes.rows[0].id,
      userId,
      weekStart,
      isActive: true,
      tasks: DEFAULT_WEEKLY_TASKS,
    };
  } catch (error) {
    console.warn("[Study Plan Service]: DB query fallback due to connectivity:", error);
    // Return structured default plan if DB is offline
    return {
      id: "local-plan-fallback",
      userId,
      weekStart: new Date().toISOString().split("T")[0],
      isActive: true,
      tasks: DEFAULT_WEEKLY_TASKS,
    };
  }
}

export async function toggleTaskCompletion(
  userId: string,
  taskId: string,
  completed?: boolean
): Promise<StudyPlanData> {
  const currentPlan = await getStudentStudyPlan(userId);

  const updatedTasks = currentPlan.tasks.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        completed: completed !== undefined ? completed : !task.completed,
      };
    }
    return task;
  });

  try {
    if (currentPlan.id !== "local-plan-fallback") {
      await query(
        `UPDATE study_plans
         SET plan_json = $1, updated_at = clock_timestamp()
         WHERE id = $2 AND user_id = $3`,
        [JSON.stringify({ tasks: updatedTasks }), currentPlan.id, userId]
      );
    }
  } catch (error) {
    console.warn("[Study Plan Service]: Failed to persist task toggle to DB:", error);
  }

  return {
    ...currentPlan,
    tasks: updatedTasks,
  };
}
