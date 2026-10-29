import { NextResponse } from "next/server";
import { query, withTransaction } from "@/server/db";
import { createSession, SESSION_COOKIE_NAME } from "@/server/auth/session";
import { getSafeRedirectUrl } from "@/lib/redirect";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;

  const errorParam = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // 1. Handle error returned by Google authorization server
  if (errorParam) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", `oauth_${errorParam}`);
    return NextResponse.redirect(errorUrl);
  }

  // 2. Validate code and state existence
  if (!code || !state) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "invalid_oauth_request");
    return NextResponse.redirect(errorUrl);
  }

  // 3. Extract and verify state cookie to defeat CSRF attacks
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .filter(([k]) => Boolean(k))
  );

  const storedState = cookies["bb_oauth_state"];
  const rawNext = cookies["bb_oauth_next"] ? decodeURIComponent(cookies["bb_oauth_next"]) : "/dashboard";
  const safeNext = getSafeRedirectUrl(rawNext, "/dashboard");

  if (!storedState || storedState !== state) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "oauth_state_mismatch");
    return NextResponse.redirect(errorUrl);
  }

  // 4. Verify Google credentials configuration
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "google_oauth_unconfigured");
    return NextResponse.redirect(errorUrl);
  }

  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  try {
    // 5. Exchange authorization code for Google access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      console.error("[Google OAuth Callback]: Token exchange failed with status", tokenResponse.status);
      const errorUrl = new URL("/login", request.url);
      errorUrl.searchParams.set("error", "oauth_token_exchange_failed");
      return NextResponse.redirect(errorUrl);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 6. Fetch verified user info
    const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoResponse.ok) {
      console.error("[Google OAuth Callback]: Failed to fetch userinfo with status", userInfoResponse.status);
      const errorUrl = new URL("/login", request.url);
      errorUrl.searchParams.set("error", "oauth_userinfo_failed");
      return NextResponse.redirect(errorUrl);
    }

    const userInfo = await userInfoResponse.json();
    const { sub, email, name } = userInfo;

    if (!email || !sub) {
      const errorUrl = new URL("/login", request.url);
      errorUrl.searchParams.set("error", "oauth_missing_identity");
      return NextResponse.redirect(errorUrl);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const authSubject = `google:${sub}`;

    // 7. Resolve or link user in PostgreSQL database
    let userId: string;

    const existingUserRes = await query<{
      id: string;
      auth_subject: string | null;
      status: string;
    }>(
      `SELECT id, auth_subject, status FROM users WHERE auth_subject = $1 OR email = $2`,
      [authSubject, normalizedEmail]
    );

    if (existingUserRes.rows.length > 0) {
      const existingUser = existingUserRes.rows[0];

      if (existingUser.status !== "active") {
        const errorUrl = new URL("/login", request.url);
        errorUrl.searchParams.set("error", "account_suspended");
        return NextResponse.redirect(errorUrl);
      }

      userId = existingUser.id;

      // Link Google identity if account previously signed up via email/password
      if (!existingUser.auth_subject) {
        await query(`UPDATE users SET auth_subject = $1, updated_at = clock_timestamp() WHERE id = $2`, [
          authSubject,
          userId,
        ]);
      }
    } else {
      // Create new user account with profile and consent
      userId = await withTransaction(async (client) => {
        const userInsert = await client.query<{ id: string }>(
          `INSERT INTO users (email, auth_subject, role, status)
           VALUES ($1, $2, 'student', 'active')
           RETURNING id`,
          [normalizedEmail, authSubject]
        );
        const newId = userInsert.rows[0].id;

        await client.query(
          `INSERT INTO profiles (user_id, full_name, test_type, target_band, timezone)
           VALUES ($1, $2, 'academic', 7.5, 'UTC')`,
          [newId, name || "Student"]
        );

        await client.query(
          `INSERT INTO consents (user_id, type, policy_version)
           VALUES ($1, 'terms_and_privacy', 'v2.0')`,
          [newId]
        );

        return newId;
      });
    }

    // 8. Establish genuine server-side session
    const { token, expiresAt } = await createSession(userId, request);

    // 9. Redirect to requested destination with session cookie established
    const successResponse = NextResponse.redirect(new URL(safeNext, request.url));

    successResponse.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    // Clear temporary OAuth cookies
    successResponse.cookies.set("bb_oauth_state", "", { path: "/", maxAge: 0 });
    successResponse.cookies.set("bb_oauth_next", "", { path: "/", maxAge: 0 });

    return successResponse;
  } catch (err: unknown) {
    console.error("[Google OAuth Callback Exception]:", err instanceof Error ? err.message : "Internal error");
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "oauth_internal_error");
    return NextResponse.redirect(errorUrl);
  }
}

