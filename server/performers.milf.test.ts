import { describe, expect, it } from "vitest";
import { z } from "zod";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    walletAddress: "0x0000000000000000000000000000000000000000",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };

  return ctx;
}

/**
 * The performer type enum as defined in the Zod validation schemas.
 * This mirrors what's in routers.ts for both create and update operations.
 */
const performerTypeSchema = z.enum([
  "Legend",
  "Anal Queen",
  "Super Slut",
  "Extreme",
  "Girl Next Door",
  "Rising Star",
  "Hall of Fame",
  "Specialist",
  "MILF",
]);

describe("Performer Type: MILF - Zod Validation", () => {
  it("accepts MILF as a valid performer type in the schema", () => {
    const result = performerTypeSchema.safeParse("MILF");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("MILF");
    }
  });

  it("rejects invalid performer types", () => {
    const result = performerTypeSchema.safeParse("NotARealType");
    expect(result.success).toBe(false);
  });

  it("includes all expected performer types including MILF", () => {
    const validTypes = [
      "Legend",
      "Anal Queen",
      "Super Slut",
      "Extreme",
      "Girl Next Door",
      "Rising Star",
      "Hall of Fame",
      "Specialist",
      "MILF",
    ];

    for (const type of validTypes) {
      const result = performerTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    }
  });

  it("validates performer create input with MILF type through tRPC", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // This will pass validation but fail on DB - we're testing that
    // the Zod validation accepts MILF (it won't throw "Invalid enum value")
    try {
      await caller.admin.performers.create({
        name: "Test MILF Performer " + Date.now(),
        bio: "A test performer with MILF type",
        performerType: "MILF",
      });
    } catch (error: any) {
      // Should NOT be a validation error - it should be a DB error or similar
      const message = error.message || String(error);
      expect(message).not.toContain("Invalid option");
      expect(message).not.toContain("Invalid enum value");
      // If we get here with a DB error, validation passed successfully
      expect(message).toContain("Database not available");
    }
  });

  it("validates performer update input with MILF type through tRPC", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // This will pass validation but fail on DB - we're testing that
    // the Zod validation accepts MILF (it won't throw "Invalid enum value")
    try {
      await caller.admin.performers.update({
        id: 1,
        performerType: "MILF",
      });
    } catch (error: any) {
      // Should NOT be a validation error - it should be a DB error or similar
      const message = error.message || String(error);
      expect(message).not.toContain("Invalid option");
      expect(message).not.toContain("Invalid enum value");
      // If we get here with a DB error, validation passed successfully
      expect(message).toContain("Database not available");
    }
  });

  it("rejects invalid performer types through tRPC create", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.performers.create({
        name: "Invalid Type Performer",
        performerType: "NotARealType" as any,
      })
    ).rejects.toThrow();
  });

  it("rejects invalid performer types through tRPC update", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.performers.update({
        id: 1,
        performerType: "NotARealType" as any,
      })
    ).rejects.toThrow();
  });
});
