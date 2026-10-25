import { NextResponse } from "next/server";
import { getExamDetail, getExamQuestionsForStudent } from "@/server/services/exam.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exam = await getExamDetail(id);

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found or inactive." },
        { status: 404 }
      );
    }

    const questions = await getExamQuestionsForStudent(id);

    return NextResponse.json({
      success: true,
      exam,
      questions,
    });
  } catch (error: any) {
    console.error("Get exam detail error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve exam configuration." },
      { status: 500 }
    );
  }
}
