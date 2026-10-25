import { NextResponse } from "next/server";
import { query } from "@/server/db";
import { generateToken, hashToken } from "@/server/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!trimmedEmail) {
      return NextResponse.json(
        { success: false, error: "Please enter your email address." },
        { status: 400 }
      );
    }

    const userRes = await query<{ id: string }>(
      `SELECT id FROM users WHERE email = $1 AND status = 'active'`,
      [trimmedEmail]
    );

    if (userRes.rows.length > 0) {
      const userId = userRes.rows[0].id;
      const rawToken = generateToken(32);
      const tokenHash = hashToken(rawToken);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1-hour expiry

      await query(
        `INSERT INTO auth_tokens (user_id, token_type, token_hash, expires_at)
         VALUES ($1, 'password_reset', $2, $3)`,
        [userId, tokenHash, expiresAt.toISOString()]
      );

      // In production, send via email provider. In local development/testing, token is registered in auth_tokens
    }

    // Generic response to mitigate account enumeration
    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this email address, password reset instructions have been generated.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process password reset request." },
      { status: 500 }
    );
  }
}
