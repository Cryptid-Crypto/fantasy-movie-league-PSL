/**
 * Email one-time-code authentication.
 *
 * Generates 6-digit codes with a 10-minute expiry and attempt limiting.
 * Delivery: Resend API when RESEND_API_KEY is configured; otherwise the code
 * is logged to the server console (development fallback).
 */
import { randomInt } from "node:crypto";

const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const RESEND_FROM = process.env.EMAIL_FROM ?? "PSL Login <login@pornstarleague.com>";

type CodeEntry = {
  code: string;
  expires: number;
  attempts: number;
};

const codeStore = new Map<string, CodeEntry>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Generate a 6-digit code for the given email and store it. */
export function generateEmailCode(email: string): string {
  const key = normalizeEmail(email);
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  codeStore.set(key, { code, expires: Date.now() + CODE_EXPIRY_MS, attempts: 0 });
  return code;
}

export type VerifyCodeResult =
  | { ok: true; email: string }
  | { ok: false; reason: "expired" | "mismatch" | "too_many_attempts" };

/** Verify a code for an email. Consumes the code on success. */
export function verifyEmailCode(email: string, code: string): VerifyCodeResult {
  const key = normalizeEmail(email);
  const entry = codeStore.get(key);
  if (!entry) return { ok: false, reason: "expired" };

  if (Date.now() > entry.expires) {
    codeStore.delete(key);
    return { ok: false, reason: "expired" };
  }

  entry.attempts += 1;
  if (entry.attempts > MAX_ATTEMPTS) {
    codeStore.delete(key);
    return { ok: false, reason: "too_many_attempts" };
  }

  if (entry.code !== code.trim()) {
    return { ok: false, reason: "mismatch" };
  }

  codeStore.delete(key); // one-time use
  return { ok: true, email: key };
}

/** Periodically clean expired codes */
setInterval(() => {
  const now = Date.now();
  codeStore.forEach((entry, key) => {
    if (now > entry.expires) codeStore.delete(key);
  });
}, 60_000);

/** Test hook: reset rate-limit/codes between tests */
export function _clearEmailCodesForTest() {
  codeStore.clear();
}

/**
 * Send the login code to the user. Uses Resend when RESEND_API_KEY is set,
 * otherwise logs the code to the console (dev mode fallback).
 */
export async function sendEmailCode(email: string, code: string): Promise<{ delivered: "email" | "console" }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[EmailAuth] No RESEND_API_KEY configured — login code for ${email}: ${code}`);
    return { delivered: "console" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [email],
      subject: "Your Porn Star League login code",
      text: `Your login code is: ${code}\n\nIt expires in 10 minutes. If you didn't request this, you can ignore this email.`,
      html: `<p>Your login code is:</p><p style="font-size:32px;font-weight:bold;letter-spacing:6px;">${code}</p><p>It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[EmailAuth] Resend delivery failed (${res.status}): ${body}`);
    throw new Error("Failed to send login code email");
  }

  return { delivered: "email" };
}
