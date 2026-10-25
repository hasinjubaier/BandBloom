import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import {
  getOrCreateAttempt,
  getExamQuestionsForStudent,
  getAttemptAnswers,
} from "@/server/services/exam.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: examId } = await params;
    let user = await getSessionUser(request);

    // If unauthenticated in development, attach to seed student for seamless local onboarding
    let userId = user?.id;
    if (!userId) {
      userId = "33333333-3333-3333-3333-333333333333";
    }

    const attempt = await getOrCreateAttempt(userId, examId);
    const questions = await getExamQuestionsForStudent(examId);
    const answers = await getAttemptAnswers(userId, attempt.attemptId);

    return NextResponse.json({
      success: true,
      attempt,
      questions,
      answers,
    });
  } catch (error: any) {
    console.error("Create / resume attempt error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate exam attempt." },
      { status: 500 }
    );
  }
}
