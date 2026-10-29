/**
 * BandBloom IELTS SaaS - Transactional Email Delivery Service
 * Version: 2.0
 * 
 * Strict Security Invariants:
 * 1. NEVER log raw password reset tokens, secret URLs, credentials, or session cookies.
 * 2. If provider is unconfigured, fail safely and honestly report delivery status internally.
 * 3. Never leak provider errors or account existence to callers/API consumers.
 */

export interface SendResetEmailParams {
  to: string;
  rawToken: string;
  baseUrl?: string;
}

export interface EmailDeliveryResult {
  delivered: boolean;
  provider: "smtp" | "resend" | "none";
  error?: string;
}

export async function sendPasswordResetEmail({
  to,
  rawToken,
  baseUrl = process.env.APP_URL || "http://localhost:3000",
}: SendResetEmailParams): Promise<EmailDeliveryResult> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. Check if an external provider is configured
  const hasSmtp = Boolean(smtpHost && smtpPort && smtpUser && smtpPass);
  const hasResend = Boolean(resendApiKey);

  if (!hasSmtp && !hasResend) {
    // Unconfigured environment: Log safe diagnostic without exposing the token
    const isDebug = process.env.APP_DEBUG === "True" || process.env.DEBUG === "True";
    if (isDebug || process.env.NODE_ENV !== "production") {
      console.info(
        `[Email Service]: Outbound email delivery is unconfigured. Password reset token hash recorded in 'auth_tokens' table for recipient domain @${to.split("@")[1] || "unknown"}.`
      );
    }
    return {
      delivered: false,
      provider: "none",
      error: "EMAIL_PROVIDER_UNCONFIGURED",
    };
  }

  // 2. Build secure reset URL
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const resetUrl = `${cleanBase}/reset-password?token=${encodeURIComponent(rawToken)}`;

  // 3. Attempt Resend REST API if configured
  if (hasResend) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || "BandBloom Security <security@bandbloom.com>",
          to: [to],
          subject: "Reset your BandBloom IELTS password",
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #123A5B;">BandBloom IELTS Password Reset</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.5;">
                We received a request to reset your password. Click the secure link below to set a new password. This link is valid for 1 hour and can only be used once.
              </p>
              <div style="margin: 28px 0;">
                <a href="${resetUrl}" style="background-color: #159E98; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #94A3B8; font-size: 13px;">
                If you did not request this reset, you can safely ignore this email. Your existing password remains secure.
              </p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("[Email Service]: Resend provider dispatch failed:", errorData?.message || res.statusText);
        return {
          delivered: false,
          provider: "resend",
          error: "PROVIDER_DISPATCH_REJECTED",
        };
      }

      return { delivered: true, provider: "resend" };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      console.error("[Email Service]: Resend transport error:", errorMsg);
      return {
        delivered: false,
        provider: "resend",
        error: "NETWORK_TRANSPORT_FAILURE",
      };
    }
  }

  // 4. Default SMTP provider check
  return {
    delivered: false,
    provider: "smtp",
    error: "SMTP_DIRECT_SOCKET_NOT_INITIALIZED",
  };
}

