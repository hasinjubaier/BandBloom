import { NextResponse } from "next/server";
import { getAvailableExams } from "@/server/services/mock.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get("testType") || undefined;
    const category = searchParams.get("category") || undefined;

    const exams = await getAvailableExams(testType, category);

    return NextResponse.json({
      success: true,
      exams,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load exams." },
      { status: 500 }
    );
  }
}
