/**
 * Central label maps and helper functions for BandBloom Student Dashboard
 */

export const TEST_TYPE_LABELS: Record<string, string> = {
  general_training: "General Training",
  academic: "Academic",
};

export const SKILL_LABELS: Record<string, string> = {
  reading: "Reading",
  listening: "Listening",
  writing: "Writing",
  speaking: "Speaking",
  mock: "Mock Test",
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  exam: "Mock Test",
  study: "Study Session",
  vocab: "Vocabulary",
  mistake: "Mistake Notebook",
};

export function formatTestType(type: string | undefined | null, fallback: string = "Academic"): string {
  if (!type || !type.trim()) return fallback;
  return TEST_TYPE_LABELS[type.toLowerCase()] || type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatSkill(skill: string | undefined | null): string {
  if (!skill) return "";
  return SKILL_LABELS[skill.toLowerCase()] || skill.charAt(0).toUpperCase() + skill.slice(1);
}

export function formatActivityType(type: string | undefined | null): string {
  if (!type) return "Activity";
  return ACTIVITY_TYPE_LABELS[type.toLowerCase()] || "Activity";
}

/**
 * Shared pluralization helper with safe NaN / undefined handling
 * e.g. pluralize(1, "day") -> "1 day"
 * e.g. pluralize(3, "day") -> "3 days"
 * e.g. pluralize(0, "word") -> "0 words"
 */
export function pluralize(count: number | null | undefined, singular: string, plural?: string): string {
  const safeCount = typeof count === "number" && !isNaN(count) ? Math.max(0, Math.floor(count)) : 0;
  const word = safeCount === 1 ? singular : plural || `${singular}s`;
  return `${safeCount} ${word}`;
}

/**
 * Safely validates an IANA timezone identifier.
 * Falls back to 'Asia/Dhaka' if missing, empty, or invalid.
 */
export function sanitizeTimezone(tz?: string | null, fallback: string = "Asia/Dhaka"): string {
  if (!tz || typeof tz !== "string" || !tz.trim()) {
    return fallback;
  }
  const candidate = tz.trim();
  try {
    // Intl.DateTimeFormat throws RangeError on invalid timeZone identifiers
    new Intl.DateTimeFormat(undefined, { timeZone: candidate });
    return candidate;
  } catch {
    return fallback;
  }
}

/**
 * Compute greeting in the user's timezone (default Asia/Dhaka) SSR-safe and deterministic.
 */
export function getDhakaGreeting(date: Date = new Date(), timezone: string = "Asia/Dhaka"): string {
  const safeTimezone = sanitizeTimezone(timezone);
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: safeTimezone,
      hour: "numeric",
      hour12: false,
      hourCycle: "h23",
    });
    const hour = parseInt(formatter.format(date), 10);
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  } catch {
    const hour = date.getUTCHours() + 6; // Dhaka is UTC+6
    const normalizedHour = (hour % 24 + 24) % 24;
    if (normalizedHour < 12) return "Good morning";
    if (normalizedHour < 18) return "Good afternoon";
    return "Good evening";
  }
}

/**
 * Compute days remaining until test in user timezone (default Asia/Dhaka) SSR-safe.
 * Always returns a non-negative integer, safely handling invalid dates.
 */
export function getDhakaDaysRemaining(targetDateStr: string | null | undefined, now: Date = new Date(), timezone: string = "Asia/Dhaka"): number {
  if (!targetDateStr || typeof targetDateStr !== "string" || targetDateStr.trim().length < 8) {
    return 0;
  }
  const safeTimezone = sanitizeTimezone(timezone);
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: safeTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const todayDhakaStr = formatter.format(now);
    const todayDhaka = new Date(`${todayDhakaStr}T00:00:00Z`);
    const cleanTarget = targetDateStr.trim().slice(0, 10);
    const targetDhaka = new Date(`${cleanTarget}T00:00:00Z`);

    if (isNaN(targetDhaka.getTime())) return 0;

    const diffMs = targetDhaka.getTime() - todayDhaka.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return isNaN(days) ? 0 : Math.max(0, days);
  } catch {
    const examDate = new Date(targetDateStr);
    if (isNaN(examDate.getTime())) return 0;
    const timeDiff = examDate.getTime() - now.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return isNaN(days) ? 0 : Math.max(0, days);
  }
}
