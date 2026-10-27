import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth/session";
import {
  getStudentStudyPlan,
  toggleTaskCompletion,
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
    let body: unknown;
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

    const { taskId, completed } = body as { taskId?: unknown; completed?: unknown };

    if (!taskId || typeof taskId !== "string" || !taskId.trim()) {
      return NextResponse.json(
        { success: false, error: "Task ID is required and must be a non-empty string." },
        { status: 400 }
      );
    }

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
    const isClientError = err.message?.includes("not found") || err.message?.includes("Invalid");
    const status = err.status || (isClientError ? 400 : 500);

    return NextResponse.json(
      { success: false, error: err.message || "Failed to update study task." },
      { status }
    );
  }
}
