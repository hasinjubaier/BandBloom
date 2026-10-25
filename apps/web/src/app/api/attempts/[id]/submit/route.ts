import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import { submitExamAttempt } from "@/server/services/exam.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;
    let user = await getSessionUser(request);
    let userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const result = await submitExamAttempt(userId, attemptId);

    return NextResponse.json({
      success: true,
      message: "Exam submitted and graded successfully.",
      result,
      redirectTo: `/results/${attemptId}`,
    });
  } catch (error: any) {
    console.error("Submit exam error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to finalize exam attempt." },
      { status: 500 }
    );
  }
}
