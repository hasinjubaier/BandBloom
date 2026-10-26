import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth/session";
import {
  getStudentAttempts,
  startExamAttempt,
} from "@/server/services/mock.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const attempts = await getStudentAttempts(user.id);

    return NextResponse.json({
      success: true,
      attempts,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load attempts." },
      { status: err.status || 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { examId } = body;

    if (!examId) {
      return NextResponse.json(
        { success: false, error: "Exam ID is required to start an attempt." },
        { status: 400 }
      );
    }

    const { attemptId, deadlineAt } = await startExamAttempt(user.id, examId);

    return NextResponse.json({
      success: true,
      message: "Exam attempt initialized.",
      attemptId,
      deadlineAt,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to start exam attempt." },
      { status: err.status || 500 }
    );
  }
}
