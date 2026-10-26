import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth/session";
import {
  getStudentVocabulary,
  toggleVocabularyMastery,
  addCustomVocabulary,
} from "@/server/services/vocabulary.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const mastery = searchParams.get("mastery") || undefined;
    const bandLevel = searchParams.get("bandLevel") || undefined;
    const q = searchParams.get("q") || undefined;

    const vocabulary = await getStudentVocabulary(user.id, {
      mastery,
      bandLevel,
      query: q,
    });

    return NextResponse.json({
      success: true,
      vocabulary,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load vocabulary." },
      { status: err.status || 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { word, partOfSpeech, bandLevel, meaning, collocation, exampleSentence } = body;

    if (!word || !partOfSpeech || !meaning) {
      return NextResponse.json(
        { success: false, error: "Word, part of speech, and meaning are required." },
        { status: 400 }
      );
    }

    const created = await addCustomVocabulary(user.id, {
      word,
      partOfSpeech,
      bandLevel: bandLevel || "Band 7.5+",
      meaning,
      collocation,
      exampleSentence,
    });

    return NextResponse.json({
      success: true,
      message: "Vocabulary word added to your personal bank.",
      item: created,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to add vocabulary item." },
      { status: err.status || 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { vocabId, mastery } = body;

    if (!vocabId) {
      return NextResponse.json(
        { success: false, error: "Vocabulary ID is required." },
        { status: 400 }
      );
    }

    const res = await toggleVocabularyMastery(user.id, vocabId, mastery);

    return NextResponse.json({
      success: true,
      message: "Vocabulary mastery status updated.",
      ...res,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update vocabulary progress." },
      { status: err.status || 500 }
    );
  }
}
