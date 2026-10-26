import { NextResponse } from "next/server";
import { requireAuth } from "@/server/auth/session";
import { getStudentDashboardSummary } from "@/server/services/dashboard.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const summary = await getStudentDashboardSummary(user.id);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    const status = err.status || 401;
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to load student dashboard summary.",
      },
      { status }
    );
  }
}
