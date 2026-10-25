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
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { success: false, authenticated: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
