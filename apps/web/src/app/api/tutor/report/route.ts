import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import { reportTutorResponse } from "@/server/services/rag.service";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    const body = await request.json();
    const { requestId, userQuery, tutorResponse, reason, userComment, citedSources } = body;

    if (!requestId || !userQuery || !tutorResponse) {
      return NextResponse.json(
        { success: false, error: "Missing required report context." },
        { status: 400 }
      );
    }

    const reportId = await reportTutorResponse(userId, {
      requestId,
      userQuery,
      tutorResponse,
      reason: reason || "incorrect_facts",
      userComment,
      citedSources,
    });

    return NextResponse.json({
      success: true,
      reportId,
      message: "Your report has been submitted to reviewers for verification.",
    });
  } catch (error: any) {
    console.error("Tutor report error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit report." },
      { status: 500 }
    );
  }
}
