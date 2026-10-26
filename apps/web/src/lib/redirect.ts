/**
 * Safe redirect utility for BandBloom IELTS.
 * Strictly prevents open redirect vulnerabilities, protocol-relative URLs (//evil.com),
 * javascript:/data: scheme injections, and redirect loops.
 */

const DISALLOWED_REDIRECT_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
]);

export function getSafeRedirectUrl(
  target?: string | null,
  fallback = "/dashboard"
): string {
  if (!target || typeof target !== "string") {
    return fallback;
  }

  const trimmed = target.trim();

  // Must be a relative path starting with a single '/'
  // Rejects '//evil.com', '/\evil.com', or external URLs
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\")
  ) {
    return fallback;
  }

  // Reject URLs containing protocol prefixes before the first directory slash
  // e.g. /javascript:..., /http:...
  const firstSlashIdx = trimmed.indexOf("/", 1);
  const potentialScheme =
    firstSlashIdx === -1 ? trimmed : trimmed.substring(0, firstSlashIdx);
  if (potentialScheme.includes(":")) {
    return fallback;
  }

  // Strip query string for path-level allowlist validation
  const [pathname] = trimmed.split("?");

  // Prevent redirect loops back to login, signup, or root
  if (DISALLOWED_REDIRECT_PATHS.has(pathname)) {
    return fallback;
  }

  return trimmed;
}
