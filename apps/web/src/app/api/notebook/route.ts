import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth/session";
import {
  getStudentMistakes,
  createMistakeNote,
  updateMistakeRetryStatus,
} from "@/server/services/notebook.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill") || undefined;
    const retryStatus = searchParams.get("retryStatus") || undefined;

    const mistakes = await getStudentMistakes(user.id, {
      skill,
      retryStatus,
    });

    return NextResponse.json({
      success: true,
      mistakes,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load mistake notes." },
      { status: err.status || 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const {
      skill,
      errorTag,
      questionPrompt,
      studentAnswer,
      reasoning,
      sourceAttemptId,
      questionId,
    } = body;

    if (!skill || !errorTag || !questionPrompt || !studentAnswer || !reasoning) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Skill, error tag, question prompt, student answer, and reasoning are required.",
        },
        { status: 400 }
      );
    }

    const note = await createMistakeNote(user.id, {
      skill,
      errorTag,
      questionPrompt,
      studentAnswer,
      reasoning,
      sourceAttemptId: sourceAttemptId || null,
      questionId: questionId || null,
    });

    return NextResponse.json({
      success: true,
      message: "Mistake logged to notebook successfully.",
      note,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create mistake note." },
      { status: err.status || 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { noteId, retryStatus } = body;

    if (!noteId) {
      return NextResponse.json(
        { success: false, error: "Note ID is required." },
        { status: 400 }
      );
    }

    const res = await updateMistakeRetryStatus(user.id, noteId, retryStatus);

    return NextResponse.json({
      success: true,
      message: "Mistake retry status updated.",
      ...res,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update mistake status." },
      { status: err.status || 500 }
    );
  }
}
