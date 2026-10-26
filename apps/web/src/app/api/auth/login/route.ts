import { NextResponse } from "next/server";
import { query } from "@/server/db";
import {
  verifyPassword,
  createSession,
  SESSION_COOKIE_NAME,
} from "@/server/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!trimmedEmail || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both your email address and password." },
        { status: 400 }
      );
    }

    // 1. Fetch user by email
    const res = await query<{
      id: string;
      email: string;
      role: string;
      status: string;
      password_hash: string | null;
      full_name: string | null;
    }>(
      `SELECT u.id, u.email, u.role, u.status, u.password_hash, p.full_name
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.email = $1`,
      [trimmedEmail]
    );

    if (res.rows.length === 0) {
      // Generic error to prevent account enumeration
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please verify your credentials." },
        { status: 401 }
      );
    }

    const user = res.rows[0];

    // Check account status
    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, error: `Your account is currently ${user.status}. Please contact support.` },
        { status: 403 }
      );
    }

    if (!user.password_hash) {
      return NextResponse.json(
        { success: false, error: "Please sign in using your external authentication provider." },
        { status: 400 }
      );
    }

    // 2. Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please verify your credentials." },
        { status: 401 }
      );
    }

    // 3. Create session & set secure cookie
    const { token, expiresAt } = await createSession(user.id, request);

    const url = new URL(request.url);
    const customRedirect = url.searchParams.get("redirect") || "/dashboard";

    const response = NextResponse.json({
      success: true,
      message: "Sign in successful! Redirecting...",
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name || "Learner",
        role: user.role,
      },
      redirectTo: customRedirect,
    });

    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected server error occurred. Please try again." },
      { status: 500 }
    );
  }
}
