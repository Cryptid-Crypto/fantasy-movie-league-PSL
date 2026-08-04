/**
 * Wallet-based authentication — replaces the Manus OAuth SDK.
 * Uses JWT sessions keyed by Ethereum wallet address instead of Manus openId.
 */
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type WalletSessionPayload = {
  walletAddress: string;
  name: string;
};

class WalletAuthService {
  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a session token for a wallet-authenticated user.
   */
  async createSessionToken(
    walletAddress: string,
    options: { expiresInMs?: number; name?: string } = {},
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      walletAddress,
      name: options.name || "",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  /**
   * Verify a session cookie and return the wallet address if valid.
   */
  async verifySession(
    cookieValue: string | undefined | null,
  ): Promise<{ walletAddress: string; name: string } | null> {
    if (!cookieValue) {
      console.warn("[WalletAuth] Missing session cookie");
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { walletAddress, name } = payload as Record<string, unknown>;

      if (!isNonEmptyString(walletAddress)) {
        console.warn("[WalletAuth] Session payload missing walletAddress");
        return null;
      }

      return {
        walletAddress,
        name: isNonEmptyString(name) ? name : "",
      };
    } catch (error) {
      console.warn("[WalletAuth] Session verification failed", String(error));
      return null;
    }
  }

  /**
   * Authenticate an Express request — extract session, look up user.
   * Returns the User or throws ForbiddenError.
   */
  async authenticateRequest(req: Request): Promise<User> {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      throw ForbiddenError("No session cookie");
    }

    const cookies = parseCookieHeader(cookieHeader);
    const sessionCookie = cookies[COOKIE_NAME];
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const signedInAt = new Date();
    // For wallet users the session id is the wallet address; for email users
    // it is "email:<address>". Both are stored in openId for compatibility.
    let user = await db.getUserByOpenId(session.walletAddress);

    // Auto-create user if they have a valid session but aren't in the DB yet
    if (!user) {
      const isEmail = session.walletAddress.startsWith("email:");
      await db.upsertUser({
        openId: session.walletAddress,
        walletAddress: isEmail ? null : session.walletAddress,
        email: isEmail ? session.walletAddress.slice("email:".length) : null,
        name: session.name || null,
        loginMethod: isEmail ? "email" : "wallet",
        lastSignedIn: signedInAt,
      });
      user = await db.getUserByOpenId(session.walletAddress);
    }

    if (!user) {
      throw ForbiddenError("User not found");
    }

    // Update last signed in
    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }
}

export const walletSdk = new WalletAuthService();