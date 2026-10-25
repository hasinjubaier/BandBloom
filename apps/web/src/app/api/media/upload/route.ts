import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import { authorizeRecordingUpload } from "@/server/services/media.service";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const body = await request.json();
    const { attemptId, questionId, mimeType, fileSizeBytes, durationSeconds } = body;

    if (!mimeType || !fileSizeBytes) {
      return NextResponse.json(
        { success: false, error: "mimeType and fileSizeBytes are required." },
        { status: 400 }
      );
    }

    const result = await authorizeRecordingUpload(userId, {
      attemptId,
      questionId,
      mimeType,
      fileSizeBytes: Number(fileSizeBytes),
      durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Authorize recording upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to authorize upload." },
      { status: 400 }
    );
  }
}
