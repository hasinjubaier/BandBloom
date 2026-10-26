import { cookies } from "next/headers";
import { query } from "@/server/db";
import {
  SESSION_COOKIE_NAME,
  hashToken,
  SessionUser,
} from "@/server/auth/session";

/**
 * Retrieves the currently authenticated user in a Next.js Server Component or Route Handler
 * using HTTP-only cookies. Returns null if unauthenticated or session expired.
 */
export async function getServerSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

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

    if (res.rows.length === 0) return null;
    return res.rows[0];
  } catch {
    // If DB is offline or unreachable, return null safely
    return null;
  }
}
