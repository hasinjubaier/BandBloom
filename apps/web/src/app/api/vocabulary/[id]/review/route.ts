import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import { advanceVocabularyMastery } from "@/server/services/learning.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vocabId } = await params;
    const user = await getSessionUser(request);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const result = await advanceVocabularyMastery(userId, vocabId);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("Advance vocabulary mastery error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update vocabulary progress." },
      { status: 500 }
    );
  }
}
