import { query } from "@/server/db";

export interface StudentProfileData {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  testType: "academic" | "general_training";
  targetBand: number;
  targetDate: string;
  dailyMinutes: number;
  timezone: string;
  uiLanguage: "en" | "bn";
  consents: {
    type: string;
    granted: boolean;
    policyVersion: string;
    grantedAt: string;
  }[];
}

export async function getStudentProfile(userId: string): Promise<StudentProfileData | null> {
  const userRes = await query<{
    user_id: string;
    email: string;
    profile_id: string;
    full_name: string | null;
    test_type: "academic" | "general_training";
    target_band: number | null;
    target_date: string | null;
    daily_minutes: number;
    timezone: string;
    ui_language: "en" | "bn";
  }>(
    `SELECT 
       u.id AS user_id,
       u.email,
       p.id AS profile_id,
       p.full_name,
       p.test_type,
       p.target_band,
       p.target_date,
       p.daily_minutes,
       p.timezone,
       p.ui_language
     FROM users u
     JOIN profiles p ON u.id = p.user_id
     WHERE u.id = $1`,
    [userId]
  );

  if (userRes.rows.length === 0) return null;
  const p = userRes.rows[0];

  const consentsRes = await query<{
    type: string;
    policy_version: string;
    granted_at: string;
    revoked_at: string | null;
  }>(
    `SELECT type, policy_version, granted_at, revoked_at 
     FROM consents 
     WHERE user_id = $1 
     ORDER BY granted_at DESC`,
    [userId]
  );

  const consents = consentsRes.rows.map((c) => ({
    type: c.type,
    granted: c.revoked_at === null,
    policyVersion: c.policy_version,
    grantedAt: c.granted_at,
  }));

  return {
    id: p.profile_id,
    userId: p.user_id,
    fullName: p.full_name || "Learner",
    email: p.email,
    testType: p.test_type,
    targetBand: p.target_band !== null ? Number(p.target_band) : 7.5,
    targetDate: p.target_date || new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
    dailyMinutes: p.daily_minutes,
    timezone: p.timezone,
    uiLanguage: p.ui_language,
    consents,
  };
}

export async function updateStudentProfile(
  userId: string,
  updates: {
    fullName?: string;
    testType?: "academic" | "general_training";
    targetBand?: number;
    targetDate?: string;
    dailyMinutes?: number;
    timezone?: string;
    uiLanguage?: "en" | "bn";
  }
): Promise<StudentProfileData | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (updates.fullName !== undefined) {
    fields.push(`full_name = $${paramIdx++}`);
    values.push(updates.fullName.trim());
  }
  if (updates.testType !== undefined) {
    fields.push(`test_type = $${paramIdx++}`);
    values.push(updates.testType);
  }
  if (updates.targetBand !== undefined) {
    fields.push(`target_band = $${paramIdx++}`);
    values.push(updates.targetBand);
  }
  if (updates.targetDate !== undefined) {
    fields.push(`target_date = $${paramIdx++}`);
    values.push(updates.targetDate);
  }
  if (updates.dailyMinutes !== undefined) {
    fields.push(`daily_minutes = $${paramIdx++}`);
    values.push(updates.dailyMinutes);
  }
  if (updates.timezone !== undefined) {
    fields.push(`timezone = $${paramIdx++}`);
    values.push(updates.timezone);
  }
  if (updates.uiLanguage !== undefined) {
    fields.push(`ui_language = $${paramIdx++}`);
    values.push(updates.uiLanguage);
  }

  if (fields.length > 0) {
    values.push(userId);
    await query(
      `UPDATE profiles SET ${fields.join(", ")} WHERE user_id = $${paramIdx}`,
      values
    );
  }

  return getStudentProfile(userId);
}

export async function setConsent(
  userId: string,
  consentType: "recording" | "ai_processing" | "model_improvement" | "terms_and_privacy",
  granted: boolean,
  policyVersion = "v2.0"
): Promise<void> {
  if (granted) {
    await query(
      `INSERT INTO consents (user_id, type, policy_version, granted_at)
       VALUES ($1, $2, $3, clock_timestamp())`,
      [userId, consentType, policyVersion]
    );
  } else {
    await query(
      `UPDATE consents SET revoked_at = clock_timestamp() 
       WHERE user_id = $1 AND type = $2 AND revoked_at IS NULL`,
      [userId, consentType]
    );
  }
}
