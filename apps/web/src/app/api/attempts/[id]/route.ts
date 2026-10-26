import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth/session";
import {
  getAttemptById,
  saveExamResponse,
  submitExamAttempt,
} from "@/server/services/mock.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const data = await getAttemptById(id, user.id);
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Exam attempt not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load attempt." },
      { status: err.status || 401 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const { questionId, responseJson } = body;

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: "Question ID is required to save answer." },
        { status: 400 }
      );
    }

    await saveExamResponse(user.id, id, questionId, responseJson);

    return NextResponse.json({
      success: true,
      message: "Response saved securely.",
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save response." },
      { status: err.status || 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const results = await submitExamAttempt(user.id, id);

    return NextResponse.json({
      success: true,
      message: "Exam submitted successfully.",
      results,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit exam." },
      { status: err.status || 500 }
    );
  }
}
