import { describe, expect, it } from "vitest";
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
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("admin.performers.create", () => {
  it("creates a new performer with all fields", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.performers.create({
      name: "Test Performer " + Date.now(),
      bio: "Test bio for performer",
      imageUrl: "https://example.com/image.jpg",
      nftContractAddress: "0x1234567890123456789012345678901234567890",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.name).toContain("Test Performer");
    expect(result.bio).toBe("Test bio for performer");
    expect(result.imageUrl).toBe("https://example.com/image.jpg");
    expect(result.nftContractAddress).toBe("0x1234567890123456789012345678901234567890");
  });

  it("creates a performer with only required fields", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.performers.create({
      name: "Minimal Performer " + Date.now(),
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.name).toContain("Minimal Performer");
  });

  it("throws error when name is empty", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.performers.create({
        name: "",
      })
    ).rejects.toThrow();
  });
});
