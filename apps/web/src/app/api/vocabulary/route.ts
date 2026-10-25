import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import { getVocabularyWithProgress } from "@/server/services/learning.service";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const vocabulary = await getVocabularyWithProgress(userId);
    return NextResponse.json({
      success: true,
      vocabulary,
    });
  } catch (error: any) {
    console.error("Get vocabulary error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load vocabulary list." },
      { status: 500 }
    );
  }
}
