import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import { saveAttemptAnswer } from "@/server/services/exam.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;
    let user = await getSessionUser(request);
    let userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const body = await request.json();
    const { questionId, answer, flagged } = body;

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: "Question ID is required." },
        { status: 400 }
      );
    }

    const res = await saveAttemptAnswer(userId, attemptId, questionId, {
      answer: String(answer || ""),
      flagged: Boolean(flagged),
    });

    return NextResponse.json(res);
  } catch (error: any) {
    console.error("Save answer error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to persist response." },
      { status: 400 }
    );
  }
}
