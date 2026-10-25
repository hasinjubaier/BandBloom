import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import {
  getActiveStudyPlan,
  toggleStudyPlanTask,
} from "@/server/services/learning.service";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const tasks = await getActiveStudyPlan(userId);
    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error: any) {
    console.error("Get study plan error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load study plan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser(request);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "Task ID is required." },
        { status: 400 }
      );
    }

    const updatedTasks = await toggleStudyPlanTask(userId, taskId);
    return NextResponse.json({
      success: true,
      tasks: updatedTasks,
    });
  } catch (error: any) {
    console.error("Toggle study task error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update study task." },
      { status: 500 }
    );
  }
}
