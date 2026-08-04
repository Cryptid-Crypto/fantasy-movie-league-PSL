import { describe, expect, it, beforeEach } from "vitest";
import {
  generateEmailCode,
  verifyEmailCode,
  sendEmailCode,
  _clearEmailCodesForTest,
} from "./_core/emailAuth";

describe("Email OTP auth", () => {
  beforeEach(() => {
    _clearEmailCodesForTest();
  });

  it("generates a 6-digit code and verifies it", () => {
    const code = generateEmailCode("User@Example.com");
    expect(code).toMatch(/^\d{6}$/);

    const result = verifyEmailCode("user@example.com", code);
    expect(result).toEqual({ ok: true, email: "user@example.com" });
  });

  it("normalizes email case and whitespace", () => {
    const code = generateEmailCode("  User@Example.COM ");
    const result = verifyEmailCode("user@example.com", code);
    expect(result.ok).toBe(true);
  });

  it("rejects a wrong code", () => {
    generateEmailCode("a@b.com");
    const result = verifyEmailCode("a@b.com", "000000");
    expect(result).toEqual({ ok: false, reason: "mismatch" });
  });

  it("consumes the code after successful verification (one-time use)", () => {
    const code = generateEmailCode("a@b.com");
    expect(verifyEmailCode("a@b.com", code).ok).toBe(true);
    expect(verifyEmailCode("a@b.com", code).ok).toBe(false);
  });

  it("blocks after too many failed attempts", () => {
    const code = generateEmailCode("a@b.com");
    for (let i = 0; i < 5; i++) {
      expect(verifyEmailCode("a@b.com", "999999").ok).toBe(false);
    }
    // 6th attempt — even with the right code — is rejected
    const result = verifyEmailCode("a@b.com", code);
    expect(result).toEqual({ ok: false, reason: "too_many_attempts" });
  });

  it("rejects unknown emails", () => {
    const result = verifyEmailCode("nobody@example.com", "123456");
    expect(result).toEqual({ ok: false, reason: "expired" });
  });

  it("falls back to console delivery when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;
    const { delivered } = await sendEmailCode("a@b.com", "123456");
    expect(delivered).toBe("console");
  });
});
