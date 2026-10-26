import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth/session";
import { askIeltsTutor } from "@/server/services/tutor.service";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { prompt, skill } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt message is required." },
        { status: 400 }
      );
    }

    const tutorResult = await askIeltsTutor(user.id, prompt, skill);

    return NextResponse.json({
      success: true,
      ...tutorResult,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process tutor query." },
      { status: err.status || 500 }
    );
  }
}
