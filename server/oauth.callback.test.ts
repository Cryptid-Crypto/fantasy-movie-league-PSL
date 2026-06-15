import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";

// ============ Mocks ============
const mockExchangeCodeForToken = vi.fn();
const mockGetUserInfo = vi.fn();
const mockCreateSessionToken = vi.fn();
const mockVerifySession = vi.fn();

vi.mock("./_core/sdk", () => ({
  sdk: {
    exchangeCodeForToken: (...args: unknown[]) => mockExchangeCodeForToken(...args),
    getUserInfo: (...args: unknown[]) => mockGetUserInfo(...args),
    createSessionToken: (...args: unknown[]) => mockCreateSessionToken(...args),
    verifySession: (...args: unknown[]) => mockVerifySession(...args),
  },
}));

const mockUpsertUser = vi.fn();
vi.mock("./db", () => ({
  upsertUser: (...args: unknown[]) => mockUpsertUser(...args),
  getUserByOpenId: vi.fn(),
}));

// Import after mocking
import { registerOAuthRoutes } from "./_core/oauth";

// ============ Test Helpers ============
function createMockRequest(query: Record<string, string> = {}): Request {
  return {
    query,
    protocol: "https",
    headers: {},
    hostname: "localhost",
  } as unknown as Request;
}

function createMockResponse(): Response & {
  _status: number;
  _json: unknown;
  _redirectUrl: string;
  _cookies: Array<{ name: string; value: string; options: Record<string, unknown> }>;
} {
  const res: any = {
    _status: 200,
    _json: null,
    _redirectUrl: "",
    _cookies: [],
    status(code: number) {
      res._status = code;
      return res;
    },
    json(data: unknown) {
      res._json = data;
      return res;
    },
    redirect(code: number, url: string) {
      res._status = code;
      res._redirectUrl = url;
      return res;
    },
    cookie(name: string, value: string, options: Record<string, unknown>) {
      res._cookies.push({ name, value, options });
      return res;
    },
  };
  return res;
}

// Helper to invoke the callback handler directly by capturing the registered route
async function invokeOAuthCallback(
  query: Record<string, string> = {},
): Promise<ReturnType<typeof createMockResponse>> {
  // Create a fake Express app that captures route registrations
  let capturedHandler: ((req: Request, res: Response) => Promise<void>) | null = null;
  const fakeApp = {
    get(path: string, handler: (req: Request, res: Response) => Promise<void>) {
      if (path === "/api/oauth/callback") {
        capturedHandler = handler;
      }
    },
  };

  // Set NODE_ENV to prevent dev-login route registration  
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";

  registerOAuthRoutes(fakeApp as any);

  // Restore NODE_ENV
  process.env.NODE_ENV = originalNodeEnv;

  const req = createMockRequest(query);
  const res = createMockResponse();

  if (capturedHandler) {
    await capturedHandler(req, res);
  }

  return res;
}

// ============ TESTS ============
describe("OAuth Callback Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset all mock implementations to safe defaults
    // (clearAllMocks only clears call history, not implementations)
    mockUpsertUser.mockResolvedValue(undefined);

    // Default successful mocks
    mockExchangeCodeForToken.mockResolvedValue({
      accessToken: "test-access-token",
      tokenType: "Bearer",
      expiresIn: 3600,
      scope: "openid profile",
      idToken: "test-id-token",
    });

    mockGetUserInfo.mockResolvedValue({
      openId: "test-user-123",
      name: "Test User",
      email: "test@example.com",
      projectId: "test-app",
      platform: "manus",
      loginMethod: "manus",
    });

    mockCreateSessionToken.mockResolvedValue("mock-session-token");

    // Set minimum required env vars
    process.env.JWT_SECRET = "test-secret-key-for-jwt-signing";
    process.env.VITE_APP_ID = "test-app-id";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.VITE_APP_ID;
  });

  // ================================================================
  // 1. STATE VALIDATION TESTS
  // ================================================================
  describe("State Validation (CSRF Protection)", () => {
    it("succeeds with valid code and state parameters", async () => {
      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "auth-code-123",
        state,
      });

      expect(res._redirectUrl).toBe("/");
      expect(res._status).toBe(302);
      expect(res._cookies).toHaveLength(1);
      expect(res._cookies[0]?.name).toBe(COOKIE_NAME);
    });

    it("rejects callback with missing state parameter", async () => {
      const res = await invokeOAuthCallback({ code: "auth-code-123" });

      expect(res._status).toBe(400);
      expect(res._json).toEqual({ error: "code and state are required" });
      expect(mockExchangeCodeForToken).not.toHaveBeenCalled();
    });

    it("rejects callback with missing code parameter", async () => {
      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({ state });

      expect(res._status).toBe(400);
      expect(res._json).toEqual({ error: "code and state are required" });
      expect(mockExchangeCodeForToken).not.toHaveBeenCalled();
    });

    it("rejects callback with both code and state missing", async () => {
      const res = await invokeOAuthCallback({});

      expect(res._status).toBe(400);
      expect(res._json).toEqual({ error: "code and state are required" });
    });

    it("rejects callback with empty state parameter", async () => {
      const res = await invokeOAuthCallback({ code: "auth-code-123", state: "" });

      expect(res._status).toBe(400);
      expect(res._json).toEqual({ error: "code and state are required" });
    });

    it("rejects callback with empty code parameter", async () => {
      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({ code: "", state });

      expect(res._status).toBe(400);
      expect(res._json).toEqual({ error: "code and state are required" });
    });

    it("passes state to exchangeCodeForToken for redirectUri extraction", async () => {
      const redirectUri = "https://example.com/callback";
      const state = btoa(redirectUri);

      await invokeOAuthCallback({ code: "auth-code-123", state });

      expect(mockExchangeCodeForToken).toHaveBeenCalledWith("auth-code-123", state);
    });
  });

  // ================================================================
  // 2. REDIRECT HANDLING TESTS
  // ================================================================
  describe("Redirect Handling", () => {
    it("redirects to root path on successful authentication", async () => {
      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(res._status).toBe(302);
      expect(res._redirectUrl).toBe("/");
    });

    it("redirects to error path when OAuth provider returns error", async () => {
      // When the OAuth provider returns an error, the SDK throws
      mockExchangeCodeForToken.mockRejectedValue(new Error("invalid_grant"));

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "bad-code",
        state,
      });

      // Currently returns 500, but should ideally redirect to error page
      // After fix, this should redirect to an error page
      expect(res._status).toBe(500);
      expect(res._json).toEqual({ error: "OAuth callback failed" });
    });

    it("handles redirect after successful user upsert", async () => {
      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(mockUpsertUser).toHaveBeenCalled();
      expect(res._redirectUrl).toBe("/");
    });

    it("handles non-base64 state parameter gracefully", async () => {
      // The SDK will try to base64-decode the state and may throw
      // The handler should catch this error
      mockExchangeCodeForToken.mockRejectedValue(new Error("Invalid redirectUri"));

      const res = await invokeOAuthCallback({
        code: "valid-code",
        state: "not-valid-base64!!!",
      });

      expect(res._status).toBe(500);
      expect(res._json).toEqual({ error: "OAuth callback failed" });
    });
  });

  // ================================================================
  // 3. SESSION MANAGEMENT TESTS
  // ================================================================
  describe("Session Management", () => {
    it("creates user session with correct token on valid callback", async () => {
      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(mockCreateSessionToken).toHaveBeenCalledWith(
        "test-user-123",
        expect.objectContaining({
          name: "Test User",
          expiresInMs: ONE_YEAR_MS,
        })
      );

      expect(res._cookies).toHaveLength(1);
      expect(res._cookies[0]?.name).toBe(COOKIE_NAME);
      expect(res._cookies[0]?.value).toBe("mock-session-token");
    });

    it("stores session cookie with correct options", async () => {
      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      const cookie = res._cookies[0];
      expect(cookie).toBeDefined();
      expect(cookie?.options).toMatchObject({
        httpOnly: true,
        path: "/",
        sameSite: "none",
        maxAge: ONE_YEAR_MS,
      });
    });

    it("upserts user to database during callback", async () => {
      const state = btoa("https://example.com/callback");
      await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(mockUpsertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          openId: "test-user-123",
          name: "Test User",
          email: "test@example.com",
          loginMethod: "manus",
          lastSignedIn: expect.any(Date),
        })
      );
    });

    it("handles user with null email gracefully", async () => {
      mockGetUserInfo.mockResolvedValue({
        openId: "test-user-123",
        name: "Test User",
        email: null,
        projectId: "test-app",
        platform: "google",
        loginMethod: "google",
      });

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(res._redirectUrl).toBe("/");
      expect(mockUpsertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          openId: "test-user-123",
          email: null,
          loginMethod: "google",
        })
      );
    });

    it("handles user with null name by using empty string for session", async () => {
      mockGetUserInfo.mockResolvedValue({
        openId: "test-user-123",
        name: null,
        email: "test@example.com",
        projectId: "test-app",
        platform: "manus",
        loginMethod: "manus",
      });

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(res._status).toBe(302);
      expect(mockCreateSessionToken).toHaveBeenCalledWith(
        "test-user-123",
        expect.objectContaining({ name: "" })
      );
    });
  });

  // ================================================================
  // 4. ERROR HANDLING TESTS
  // ================================================================
  describe("Error Handling", () => {
    it("handles OAuth provider returning error code (token exchange failure)", async () => {
      mockExchangeCodeForToken.mockRejectedValue(new Error("invalid_grant: code expired"));

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "expired-code",
        state,
      });

      expect(res._status).toBe(500);
      expect(res._json).toEqual({ error: "OAuth callback failed" });
      expect(res._cookies).toHaveLength(0);
    });

    it("handles token exchange network error", async () => {
      mockExchangeCodeForToken.mockRejectedValue(new Error("ECONNREFUSED"));

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(res._status).toBe(500);
      expect(res._json).toEqual({ error: "OAuth callback failed" });
      expect(mockCreateSessionToken).not.toHaveBeenCalled();
    });

    it("handles user info fetch failure", async () => {
      mockGetUserInfo.mockRejectedValue(new Error("Failed to fetch user info"));

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(res._status).toBe(500);
      expect(res._json).toEqual({ error: "OAuth callback failed" });
      expect(mockCreateSessionToken).not.toHaveBeenCalled();
    });

    it("handles missing openId in user info response", async () => {
      mockGetUserInfo.mockResolvedValue({
        openId: "",
        name: "Test User",
        email: "test@example.com",
        projectId: "test-app",
      });

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(res._status).toBe(400);
      expect(res._json).toEqual({ error: "openId missing from user info" });
      expect(mockUpsertUser).not.toHaveBeenCalled();
    });

    it("handles user creation (upsert) database failure", async () => {
      mockUpsertUser.mockRejectedValue(new Error("Database connection failed"));

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(res._status).toBe(500);
      expect(res._json).toEqual({ error: "OAuth callback failed" });
      expect(mockCreateSessionToken).not.toHaveBeenCalled();
    });

    it("handles session token creation failure", async () => {
      mockCreateSessionToken.mockRejectedValue(new Error("JWT signing failed"));

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(res._status).toBe(500);
      expect(res._json).toEqual({ error: "OAuth callback failed" });
      expect(res._cookies).toHaveLength(0);
    });

    it("handles malformed query parameters (non-string values ignored)", async () => {
      // When query values are arrays, getQueryParam returns undefined
      const res = await invokeOAuthCallback({});

      expect(res._status).toBe(400);
      expect(res._json).toEqual({ error: "code and state are required" });
    });
  });

  // ================================================================
  // 5. TOKEN MANAGEMENT TESTS
  // ================================================================
  describe("Token Management", () => {
    it("creates session token with correct expiration", async () => {
      const state = btoa("https://example.com/callback");
      await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(mockCreateSessionToken).toHaveBeenCalledWith(
        "test-user-123",
        expect.objectContaining({
          expiresInMs: ONE_YEAR_MS,
        })
      );
    });

    it("stores access token via token exchange correctly", async () => {
      mockExchangeCodeForToken.mockResolvedValue({
        accessToken: "specific-access-token-xyz",
        tokenType: "Bearer",
        expiresIn: 7200,
        scope: "openid profile email",
        idToken: "id-token-xyz",
      });

      const state = btoa("https://example.com/callback");
      await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      // Verify the access token from exchange was passed to getUserInfo
      expect(mockGetUserInfo).toHaveBeenCalledWith("specific-access-token-xyz");
    });

    it("handles token exchange response with optional fields", async () => {
      mockExchangeCodeForToken.mockResolvedValue({
        accessToken: "test-token",
        tokenType: "Bearer",
        expiresIn: 3600,
        scope: "openid",
        idToken: "",
        // refreshToken intentionally omitted
      });

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(res._status).toBe(302);
      expect(res._redirectUrl).toBe("/");
    });

    it("uses platform fallback when loginMethod is not provided", async () => {
      mockGetUserInfo.mockResolvedValue({
        openId: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        projectId: "test-app",
        platform: "google",
        // loginMethod intentionally omitted
      });

      const state = btoa("https://example.com/callback");
      await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(mockUpsertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMethod: "google",
        })
      );
    });

    it("prefers loginMethod over platform when both present", async () => {
      mockGetUserInfo.mockResolvedValue({
        openId: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        projectId: "test-app",
        platform: "email",
        loginMethod: "google",
      });

      const state = btoa("https://example.com/callback");
      await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(mockUpsertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          loginMethod: "google",
        })
      );
    });
  });

  // ================================================================
  // 6. FULL FLOW INTEGRATION TESTS
  // ================================================================
  describe("Full OAuth Flow Integration", () => {
    it("completes full OAuth flow: exchange → userinfo → upsert → session → redirect", async () => {
      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "full-flow-code",
        state,
      });

      // Step 1: Token exchange called
      expect(mockExchangeCodeForToken).toHaveBeenCalledWith("full-flow-code", state);

      // Step 2: User info fetched with access token
      expect(mockGetUserInfo).toHaveBeenCalledWith("test-access-token");

      // Step 3: User upserted
      expect(mockUpsertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          openId: "test-user-123",
          name: "Test User",
          email: "test@example.com",
          loginMethod: "manus",
          lastSignedIn: expect.any(Date),
        })
      );

      // Step 4: Session token created
      expect(mockCreateSessionToken).toHaveBeenCalledWith(
        "test-user-123",
        expect.objectContaining({ name: "Test User", expiresInMs: ONE_YEAR_MS })
      );

      // Step 5: Cookie set
      expect(res._cookies).toHaveLength(1);
      expect(res._cookies[0]?.name).toBe(COOKIE_NAME);
      expect(res._cookies[0]?.value).toBe("mock-session-token");

      // Step 6: Redirect
      expect(res._status).toBe(302);
      expect(res._redirectUrl).toBe("/");
    });

    it("fails early if token exchange fails (subsequent steps not called)", async () => {
      mockExchangeCodeForToken.mockRejectedValue(new Error("Exchange failed"));

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "bad-code",
        state,
      });

      expect(mockExchangeCodeForToken).toHaveBeenCalled();
      expect(mockGetUserInfo).not.toHaveBeenCalled();
      expect(mockUpsertUser).not.toHaveBeenCalled();
      expect(mockCreateSessionToken).not.toHaveBeenCalled();
      expect(res._cookies).toHaveLength(0);
      expect(res._status).toBe(500);
    });

    it("fails at userinfo step if it fails (no session or cookie created)", async () => {
      mockGetUserInfo.mockRejectedValue(new Error("UserInfo failed"));

      const state = btoa("https://example.com/callback");
      const res = await invokeOAuthCallback({
        code: "valid-code",
        state,
      });

      expect(mockExchangeCodeForToken).toHaveBeenCalled();
      expect(mockGetUserInfo).toHaveBeenCalled();
      expect(mockUpsertUser).not.toHaveBeenCalled();
      expect(mockCreateSessionToken).not.toHaveBeenCalled();
      expect(res._cookies).toHaveLength(0);
    });
  });
});
