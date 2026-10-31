import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth/session";
import {
  getAttemptPlaybackStates,
  recordAttemptPlaybackAction,
} from "@/server/services/mock.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: attemptId } = await params;

    const states = await getAttemptPlaybackStates(attemptId, user.id);
    return NextResponse.json({ success: true, playbackStates: states });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load playback state." },
      { status: err.status || 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: attemptId } = await params;
    const body = await request.json();
    const { partNumber, action, failureReason } = body;
    const mode = body.mode || body.clientMode || "simulation";

    if (!partNumber || ![1, 2, 3, 4].includes(Number(partNumber))) {
      return NextResponse.json(
        { success: false, error: "Valid partNumber (1-4) is required." },
        { status: 400 }
      );
    }

    if (!action || !["start", "complete", "fail"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Valid action ('start', 'complete', 'fail') is required." },
        { status: 400 }
      );
    }

    const state = await recordAttemptPlaybackAction(
      attemptId,
      user.id,
      Number(partNumber),
      action,
      failureReason,
      mode || "simulation"
    );

    return NextResponse.json({ success: true, playbackState: state });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || "Playback operation failed." },
      { status: err.status || 500 }
    );
  }
}
