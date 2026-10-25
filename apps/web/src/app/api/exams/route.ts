import { NextResponse } from "next/server";
import { listAvailableExams } from "@/server/services/exam.service";

export async function GET() {
  try {
    const exams = await listAvailableExams();
    return NextResponse.json({
      success: true,
      exams,
    });
  } catch (error: any) {
    console.error("List exams error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve available test forms." },
      { status: 500 }
    );
  }
}
