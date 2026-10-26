import { NextResponse } from "next/server";
import { query, withTransaction } from "@/server/db";
import { hashPassword, hashToken } from "@/server/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid password reset token." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);
    const now = new Date().toISOString();

    const tokenRes = await query<{ id: string; user_id: string }>(
      `SELECT id, user_id FROM auth_tokens 
       WHERE token_type = 'password_reset' 
         AND token_hash = $1 
         AND expires_at > $2 
         AND consumed_at IS NULL`,
      [tokenHash, now]
    );

    if (tokenRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid, expired, or already used reset token." },
        { status: 400 }
      );
    }

    const { id: tokenId, user_id: userId } = tokenRes.rows[0];
    const passwordHash = await hashPassword(newPassword);

    await withTransaction(async (client) => {
      // 1. Update user password
      await client.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [
        passwordHash,
        userId,
      ]);

      // 2. Consume token
      await client.query(`UPDATE auth_tokens SET consumed_at = clock_timestamp() WHERE id = $1`, [
        tokenId,
      ]);

      // 3. Invalidate all active sessions for this user
      await client.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully! Please sign in with your new password.",
      redirectTo: "/login",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password due to server error." },
      { status: 500 }
    );
  }
}
