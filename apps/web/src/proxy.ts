import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSafeRedirectUrl } from "@/lib/redirect";

const SESSION_COOKIE_NAME = "bandbloom_session";

// Public pages that remain freely accessible without an active session
const PUBLIC_PAGES = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
  "/accessibility",
  "/ai-feedback-policy",
  "/disclaimer",
  "/test-day-guide",
  "/test-types",
  "/how-it-works",
]);

// Public API endpoints that do not require authentication
const PUBLIC_API_PREFIXES = [
  "/api/health",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/logout",
  "/api/auth/google",
  "/api/auth/callback/google",
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  // A valid session token is a 64-character hex string
  const hasSessionToken = Boolean(
    sessionCookie && /^[0-9a-f]{64}$/i.test(sessionCookie)
  );

  const isPublicPage = PUBLIC_PAGES.has(pathname);
  const isPublicApi = PUBLIC_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isApiRoute = pathname.startsWith("/api/");

  // 1. UNLOADED / ANONYMOUS VISITOR
  if (!hasSessionToken) {
    // Public pages (including root '/') & public APIs are allowed
    if (isPublicPage || isPublicApi) {
      return NextResponse.next();
    }

    // Protected API routes: return 401 Unauthorized directly (never redirect to HTML login page)
    if (isApiRoute) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to access this resource.",
        },
        { status: 401 }
      );
    }

    // Protected application pages (/dashboard, /study-plan, /mock-centre, etc.)
    // Redirect to login and preserve safe return destination
    const destination = pathname + search;
    const safeNext = getSafeRedirectUrl(destination, "/dashboard");
    const loginUrl = new URL("/login", request.url);
    if (safeNext !== "/dashboard") {
      loginUrl.searchParams.set("next", safeNext);
    }

    return NextResponse.redirect(loginUrl);
  }

  // 2. AUTHENTICATED VISITOR
  // If user opens login or signup while authenticated, redirect to destination or dashboard
  if (pathname === "/login" || pathname === "/signup") {
    const rawNext =
      request.nextUrl.searchParams.get("next") ||
      request.nextUrl.searchParams.get("returnTo") ||
      request.nextUrl.searchParams.get("redirect");

    const safeDestination = getSafeRedirectUrl(rawNext, "/dashboard");
    return NextResponse.redirect(new URL(safeDestination, request.url));
  }

  // All other routes allowed through
  return NextResponse.next();
}

// Backwards-compatibility aliases
export default proxy;
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets with extensions (.svg, .png, .jpg, .jpeg, .webp, .ico, .css, .js)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|css|js)$).*)",
  ],
};

