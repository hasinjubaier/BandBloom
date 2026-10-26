import { NextResponse } from "next/server";
import { getExamById } from "@/server/services/mock.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exam = await getExamById(id);

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      exam,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load exam details." },
      { status: 500 }
    );
  }
}
