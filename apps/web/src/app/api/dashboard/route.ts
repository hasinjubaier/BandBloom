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
    // Distinguish 401 Unauthorized (from requireAuth) from 500 Internal Server Errors
    const status = err.status || 500;
    console.error("[Dashboard API Error]:", error);

    return NextResponse.json(
      {
        success: false,
        error: status === 401 ? "Unauthorized access." : "Unable to load student dashboard summary.",
      },
      { status }
    );
  }
}
