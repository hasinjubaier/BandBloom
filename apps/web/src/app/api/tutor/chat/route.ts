import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import { answerTutorQuestion } from "@/server/services/rag.service";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const body = await request.json();
    const { message, skill, language } = body;

    if (!message || typeof message !== "string" || message.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid question for the tutor." },
        { status: 400 }
      );
    }

    const response = await answerTutorQuestion(userId, message, {
      skill,
      language: language === "bn" ? "bn" : "en",
    });

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    console.error("Tutor chat error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process question." },
      { status: 400 }
    );
  }
}
