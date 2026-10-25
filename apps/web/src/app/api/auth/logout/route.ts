import { NextResponse } from "next/server";
import {
  extractSessionToken,
  invalidateSession,
  SESSION_COOKIE_NAME,
} from "@/server/auth/session";

export async function POST(request: Request) {
  try {
    const token = extractSessionToken(request);
    if (token) {
      await invalidateSession(token);
    }

    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully.",
      redirectTo: "/login",
    });

    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign out cleanly." },
      { status: 500 }
    );
  }
}
