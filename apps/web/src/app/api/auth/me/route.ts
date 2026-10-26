import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false, user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    const status = err.status || 500;
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: status === 503 ? (err.message || "Database service unavailable") : "Internal server error",
      },
      { status }
    );
  }
}
