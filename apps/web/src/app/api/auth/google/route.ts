import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSafeRedirectUrl } from "@/lib/redirect";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const nextParam = requestUrl.searchParams.get("next");
  const targetDestination = getSafeRedirectUrl(nextParam, "/dashboard");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "google_oauth_unconfigured");
    return NextResponse.redirect(errorUrl);
  }

  // 1. Generate cryptographic state parameter to prevent CSRF
  const state = crypto.randomBytes(32).toString("hex");

  // 2. Build redirect URI
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  // 3. Construct Google OAuth 2.0 authorization URL
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("access_type", "online");
  googleAuthUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(googleAuthUrl);

  // 4. Store state and destination in secure, short-lived HttpOnly cookies
  const isSecure = process.env.NODE_ENV === "production";
  response.cookies.set("bb_oauth_state", state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  response.cookies.set("bb_oauth_next", targetDestination, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}

