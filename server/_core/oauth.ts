import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Development-only auto-login endpoint (bypasses OAuth when server is unreachable)
  if (process.env.NODE_ENV === 'development') {
    app.get("/api/dev-login", async (req: Request, res: Response) => {
      try {
        console.log("[Dev Login] Auto-logging in as owner user");
        
        // Get owner user from environment
        const ownerOpenId = process.env.OWNER_OPEN_ID;
        const ownerName = process.env.OWNER_NAME || "Owner";
        
        if (!ownerOpenId) {
          res.status(500).json({ error: "OWNER_OPEN_ID not configured" });
          return;
        }
        
        // Skip database upsert in dev mode (may have connectivity issues)
        console.log("[Dev Login] Skipping database upsert, creating session directly");
        
        // Create session token
        const sessionToken = await sdk.createSessionToken(ownerOpenId, {
          name: ownerName,
          expiresInMs: ONE_YEAR_MS,
        });
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        console.log("[Dev Login] Session created, redirecting to /");
        res.redirect(302, "/");
      } catch (error) {
        console.error("[Dev Login] Failed:", error);
        console.error("[Dev Login] Error details:", error instanceof Error ? error.message : String(error));
        console.error("[Dev Login] Error stack:", error instanceof Error ? error.stack : "No stack trace");
        res.status(500).json({ 
          error: "Dev login failed",
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      console.log("[OAuth] Starting token exchange with code:", code.substring(0, 10) + "...");
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      console.log("[OAuth] Token exchange successful");
      
      console.log("[OAuth] Fetching user info");
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      console.log("[OAuth] User info received:", { openId: userInfo.openId, name: userInfo.name });

      if (!userInfo.openId) {
        console.error("[OAuth] Missing openId in user info");
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      console.log("[OAuth] Upserting user to database");
      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });
      console.log("[OAuth] User upserted successfully");

      console.log("[OAuth] Creating session token");
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      console.log("[OAuth] Session token created");

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      console.log("[OAuth] Cookie set, redirecting to /");

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed with error:", error);
      console.error("[OAuth] Error details:", error instanceof Error ? error.message : String(error));
      console.error("[OAuth] Error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
