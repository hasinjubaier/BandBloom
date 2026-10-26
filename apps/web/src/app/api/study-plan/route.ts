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
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load study plan." },
      { status: err.status || 401 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { taskId, completed } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "Task ID is required." },
        { status: 400 }
      );
    }

    const updatedPlan = await toggleTaskCompletion(user.id, taskId, completed);

    return NextResponse.json({
      success: true,
      message: "Study task updated successfully.",
      plan: updatedPlan,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update study task." },
      { status: err.status || 500 }
    );
  }
}
