import { NextResponse } from "next/server";
import { query, withTransaction } from "@/server/db";
import {
  hashPassword,
  createSession,
  SESSION_COOKIE_NAME,
} from "@/server/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, confirmPassword, agreedToTerms } = body;

    // 1. Full name validation
    const trimmedName = typeof fullName === "string" ? fullName.trim() : "";
    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (minimum 2 characters)." },
        { status: 400 }
      );
    }
    if (trimmedName.length > 80) {
      return NextResponse.json(
        { success: false, error: "Full name must be 80 characters or fewer." },
        { status: 400 }
      );
    }

    // 2. Email validation
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 3. Password policy
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return NextResponse.json(
        { success: false, error: "Password must contain both letters and numbers." },
        { status: 400 }
      );
    }

    // 4. Confirm password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // 5. Terms agreement
    if (agreedToTerms !== true) {
      return NextResponse.json(
        { success: false, error: "You must accept the Terms of Service and Privacy Policy to register." },
        { status: 400 }
      );
    }

    // 6. Check duplicate email in database
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [trimmedEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 7. Transactional user, profile & consent creation
    const passwordHash = await hashPassword(password);

    const newUser = await withTransaction(async (client) => {
      const userRes = await client.query<{ id: string }>(
        `INSERT INTO users (email, role, status, password_hash)
         VALUES ($1, 'student', 'active', $2)
         RETURNING id`,
        [trimmedEmail, passwordHash]
      );
      const userId = userRes.rows[0].id;

      // Profile record
      await client.query(
        `INSERT INTO profiles (user_id, full_name, test_type, target_band, target_date, daily_minutes, timezone, ui_language)
         VALUES ($1, $2, 'academic', 7.5, CURRENT_DATE + INTERVAL '60 days', 60, 'UTC', 'en')`,
        [userId, trimmedName]
      );

      // Legal terms & privacy consent
      await client.query(
        `INSERT INTO consents (user_id, type, policy_version, metadata)
         VALUES ($1, 'terms_and_privacy', 'v2.0', $2)`,
        [userId, JSON.stringify({ agreedVia: "registration_form", ip: request.headers.get("x-forwarded-for") || "127.0.0.1" })]
      );

      return { id: userId, email: trimmedEmail, name: trimmedName };
    });

    // 8. Establish session and set HTTP-only cookie
    const { token, expiresAt } = await createSession(newUser.id, request);

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully! Preparing your IELTS onboarding journey...",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      redirectTo: "/onboarding",
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
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account due to server error. Please try again." },
      { status: 500 }
    );
  }
}
