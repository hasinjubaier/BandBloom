import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth/session";
import {
  getStudentStudyPlan,
  toggleTaskCompletion,
  reschedulePlanTask,
  regenerateStudentPlan,
  saveWeeklyReflection,
} from "@/server/services/study-plan.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const plan = await getStudentStudyPlan(user.id);

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    const status = err.status || 500;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load study plan." },
      { status }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth(request);
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Request payload must be a JSON object." },
        { status: 400 }
      );
    }

    const { taskId, completed, newDay } = body;

    if (!taskId || typeof taskId !== "string" || !taskId.trim()) {
      return NextResponse.json(
        { success: false, error: "Task ID is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    // Handle rescheduling action if newDay is provided
    if (newDay && typeof newDay === "string") {
      const updatedPlan = await reschedulePlanTask(user.id, taskId.trim(), newDay.trim());
      return NextResponse.json({
        success: true,
        message: "Task rescheduled successfully.",
        plan: updatedPlan,
      });
    }

    // Handle completion toggle
    if (completed !== undefined && typeof completed !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Task completion status must be a boolean." },
        { status: 400 }
      );
    }

    const updatedPlan = await toggleTaskCompletion(user.id, taskId.trim(), completed);

    return NextResponse.json({
      success: true,
      message: "Study task updated successfully.",
      plan: updatedPlan,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    const isClientError =
      err.message?.includes("not found") ||
      err.message?.includes("Invalid") ||
      err.message?.includes("required") ||
      err.message?.includes("cannot be rescheduled") ||
      err.message?.includes("capacity reached") ||
      err.message?.includes("exceed your daily preference");
    const status = err.status || (isClientError ? 400 : 500);

    return NextResponse.json(
      { success: false, error: err.message || "Failed to update study task." },
      { status }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const action = body?.action;

    // Action 1: Regenerate adaptive plan based on latest scores and profile updates
    if (action === "regenerate") {
      const regeneratedPlan = await regenerateStudentPlan(user.id);
      return NextResponse.json({
        success: true,
        message: "Study plan updated based on your latest performance evidence.",
        plan: regeneratedPlan,
      });
    }

    // Action 2: Save weekly reflection and strategy
    if (action === "reflection") {
      const reflection = body.reflection as {
        whatImproved?: string;
        difficultSkill?: string;
        weakQuestionType?: string;
        nextCycleGoal?: string;
      };

      if (!reflection || typeof reflection !== "object") {
        return NextResponse.json(
          { success: false, error: "Reflection data is required." },
          { status: 400 }
        );
      }

      if (!reflection.whatImproved?.trim() || !reflection.nextCycleGoal?.trim()) {
        return NextResponse.json(
          { success: false, error: "Please answer what improved and your next cycle goal." },
          { status: 400 }
        );
      }

      const updatedPlan = await saveWeeklyReflection(user.id, {
        whatImproved: reflection.whatImproved,
        difficultSkill: reflection.difficultSkill || "general",
        weakQuestionType: reflection.weakQuestionType || "none",
        nextCycleGoal: reflection.nextCycleGoal,
      });

      return NextResponse.json({
        success: true,
        message: "Weekly reflection saved successfully.",
        plan: updatedPlan,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid study plan action. Allowed: 'regenerate', 'reflection'." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    const status = err.status || 500;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process study plan action." },
      { status }
    );
  }
}
