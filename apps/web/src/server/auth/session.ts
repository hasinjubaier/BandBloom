import crypto from "crypto";
import bcrypt from "bcryptjs";
import { query } from "@/server/db";

export const SESSION_COOKIE_NAME = "bandbloom_session";
export const SESSION_EXPIRY_DAYS = 7;

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  status: string;
  fullName: string;
  testType: string;
  targetBand: number | null;
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function generateToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  req?: Request
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken(32);
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  let ipAddress: string | null = null;
  let userAgent: string | null = null;

  if (req) {
    ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    userAgent = req.headers.get("user-agent") || null;
  }

  await query(
    `INSERT INTO sessions (user_id, token_hash, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, tokenHash, expiresAt.toISOString(), ipAddress, userAgent]
  );

  return { token, expiresAt };
}

export async function invalidateSession(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await query(`DELETE FROM sessions WHERE token_hash = $1`, [tokenHash]);
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
}

export function extractSessionToken(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const c of cookies) {
    if (c.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      return decodeURIComponent(c.substring(SESSION_COOKIE_NAME.length + 1));
    }
  }

  // Also support Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  return null;
}

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const token = extractSessionToken(req);
  if (!token) return null;

  try {
    const tokenHash = hashToken(token);
    const now = new Date().toISOString();

    const res = await query<SessionUser>(
      `SELECT 
         u.id, 
         u.email, 
         u.role, 
         u.status,
         COALESCE(p.full_name, 'Learner') AS "fullName",
         COALESCE(p.test_type, 'academic') AS "testType",
         p.target_band AS "targetBand"
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE s.token_hash = $1
         AND s.expires_at > $2
         AND u.status = 'active'
       LIMIT 1`,
      [tokenHash, now]
    );

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  } catch (err: unknown) {
    const isDbOutage =
      err &&
      typeof err === "object" &&
      ("code" in err || (err instanceof Error && err.message.includes("ECONNREFUSED")));
    if (isDbOutage) {
      console.error("[Database Connection Failure in Auth]:", err instanceof Error ? err.message : String(err));
      throw new ServiceUnavailableError(
        "Service is temporarily unavailable due to a database outage. Please try again shortly.",
        503
      );
    }
    console.error("[Unexpected Session Lookup Error]:", err instanceof Error ? err.message : String(err));
    throw err;
  }
}

export class AuthError extends Error {
  status: number;
  constructor(message = "Authentication required to access this resource.", status = 401) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  status: number;
  constructor(message = "Access denied. Insufficient permissions.", status = 403) {
    super(message);
    this.status = status;
    this.name = "ForbiddenError";
  }
}

export class ServiceUnavailableError extends Error {
  status: number;
  constructor(
    message = "Service is temporarily unavailable due to a database outage. Please try again shortly.",
    status = 503
  ) {
    super(message);
    this.status = status;
    this.name = "ServiceUnavailableError";
  }
}

export async function requireAuth(req: Request): Promise<SessionUser> {
  const token = extractSessionToken(req);
  if (!token) {
    throw new AuthError("Authentication required to access this resource.", 401);
  }

  const user = await getSessionUser(req);
  if (!user) {
    throw new AuthError("Session expired or invalid. Please sign in again.", 401);
  }

  if (user.status !== "active") {
    throw new ForbiddenError("Your account is currently suspended or inactive.", 403);
  }

  return user;
}
