import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import {
  updateMistakeStatus,
  deleteMistakeNote,
} from "@/server/services/learning.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: noteId } = await params;
    const user = await getSessionUser(request);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const body = await request.json();
    const { status } = body;

    const validStatus = status === "mastered" ? "mastered" : "pending";
    const ok = await updateMistakeStatus(userId, noteId, validStatus);

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Note not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Mistake status marked as ${validStatus}.`,
    });
  } catch (error: any) {
    console.error("Update mistake error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update mistake status." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: noteId } = await params;
    const user = await getSessionUser(request);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const ok = await deleteMistakeNote(userId, noteId);

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Note not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mistake note deleted from notebook.",
    });
  } catch (error: any) {
    console.error("Delete mistake error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete mistake note." },
      { status: 500 }
    );
  }
}
