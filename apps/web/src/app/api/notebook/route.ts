import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import {
  getMistakeNotes,
  addMistakeNote,
} from "@/server/services/learning.service";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const mistakes = await getMistakeNotes(userId);
    return NextResponse.json({
      success: true,
      mistakes,
    });
  } catch (error: any) {
    console.error("Get mistake notes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load mistake notebook." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const body = await request.json();
    const { skill, errorTag, userNotes, originalAnswer, correctReasoning, questionId, attemptId } = body;

    if (!skill || !errorTag) {
      return NextResponse.json(
        { success: false, error: "Skill and errorTag are required." },
        { status: 400 }
      );
    }

    const newId = await addMistakeNote(userId, {
      skill,
      errorTag,
      userNotes,
      originalAnswer,
      correctReasoning,
      questionId,
      attemptId,
    });

    return NextResponse.json({
      success: true,
      id: newId,
      message: "Mistake recorded in personal notebook.",
    });
  } catch (error: any) {
    console.error("Add mistake note error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record mistake note." },
      { status: 500 }
    );
  }
}
