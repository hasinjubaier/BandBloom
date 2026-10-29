import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth/session";
import {
  getStudentProfile,
  updateStudentProfile,
  setConsent,
} from "@/server/services/profile.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const profile = await getStudentProfile(user.id);

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Unauthorized" },
      { status: error.status || 401 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const {
      fullName,
      testType,
      targetBand,
      targetDate,
      dailyMinutes,
      uiLanguage,
      voiceConsent,
      aiConsent,
      modelTrainingOptIn,
    } = body;

    const VALID_TARGET_BANDS = [6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
    if (targetBand !== undefined && targetBand !== null) {
      const numBand = Number(targetBand);
      if (!VALID_TARGET_BANDS.includes(numBand)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid target band. Supported bands are 6.5, 7.0, 7.5, 8.0, 8.5, and 9.0.",
          },
          { status: 400 }
        );
      }
    }

    // Handle profile updates
    const updated = await updateStudentProfile(user.id, {
      fullName,
      testType,
      targetBand: targetBand !== undefined ? Number(targetBand) : undefined,
      targetDate,
      dailyMinutes: dailyMinutes !== undefined ? Number(dailyMinutes) : undefined,
      uiLanguage,
    });

    // Handle consent updates
    if (voiceConsent !== undefined) {
      await setConsent(user.id, "recording", Boolean(voiceConsent));
    }
    if (aiConsent !== undefined) {
      await setConsent(user.id, "ai_processing", Boolean(aiConsent));
    }
    if (modelTrainingOptIn !== undefined) {
      await setConsent(user.id, "model_improvement", Boolean(modelTrainingOptIn));
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile: updated,
    });
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile." },
      { status: error.status || 500 }
    );
  }
}
