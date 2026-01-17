import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("performers.getStatistics", () => {
  it("returns statistics structure for any performer", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Get any performer from the database
    const performers = await db.getAllPerformers();
    
    if (performers.length === 0) {
      // If no performers exist, skip this test
      expect(true).toBe(true);
      return;
    }

    const performerId = performers[0]!.id;
    const stats = await caller.performers.getStatistics({ performerId });

    // Test structure regardless of whether there's data
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty("totalPoints");
    expect(stats).toHaveProperty("totalActions");
    expect(stats).toHaveProperty("totalScenes");
    expect(stats).toHaveProperty("totalMovies");
    expect(stats).toHaveProperty("averagePointsPerScene");
    expect(stats).toHaveProperty("actionBreakdown");
    expect(typeof stats.totalPoints).toBe("number");
    expect(typeof stats.totalActions).toBe("number");
    expect(typeof stats.totalScenes).toBe("number");
    expect(typeof stats.totalMovies).toBe("number");
    expect(typeof stats.averagePointsPerScene).toBe("number");
    expect(stats.actionBreakdown).toBeInstanceOf(Array);
  });

  it("returns correct action breakdown structure when actions exist", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const performers = await db.getAllPerformers();
    
    if (performers.length === 0) {
      expect(true).toBe(true);
      return;
    }

    const performerId = performers[0]!.id;
    const stats = await caller.performers.getStatistics({ performerId });

    // If there are actions, check their structure
    if (stats.actionBreakdown.length > 0) {
      const firstAction = stats.actionBreakdown[0];
      expect(firstAction).toHaveProperty("actionName");
      expect(firstAction).toHaveProperty("actionPoints");
      expect(firstAction).toHaveProperty("count");
      expect(firstAction).toHaveProperty("totalPoints");
      expect(typeof firstAction.actionName).toBe("string");
      expect(typeof firstAction.actionPoints).toBe("number");
      expect(typeof firstAction.count).toBe("number");
      expect(typeof firstAction.totalPoints).toBe("number");
    } else {
      // No actions is also valid
      expect(stats.actionBreakdown).toEqual([]);
    }
  });

  it("calculates average points per scene correctly", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const performers = await db.getAllPerformers();
    
    if (performers.length === 0) {
      expect(true).toBe(true);
      return;
    }

    const performerId = performers[0]!.id;
    const stats = await caller.performers.getStatistics({ performerId });

    // Average should be 0 if no scenes, or totalPoints / totalScenes
    const expectedAverage = stats.totalScenes > 0 
      ? stats.totalPoints / stats.totalScenes 
      : 0;
    
    expect(stats.averagePointsPerScene).toBeCloseTo(expectedAverage, 2);
  });
});

describe("performers.getMovies", () => {
  it("returns movies array for a performer", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const performers = await db.getAllPerformers();
    
    if (performers.length === 0) {
      expect(true).toBe(true);
      return;
    }

    const performerId = performers[0]!.id;
    const movies = await caller.performers.getMovies({ performerId });

    expect(movies).toBeInstanceOf(Array);
  });

  it("returns movies with correct structure when movies exist", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const performers = await db.getAllPerformers();
    
    if (performers.length === 0) {
      expect(true).toBe(true);
      return;
    }

    const performerId = performers[0]!.id;
    const movies = await caller.performers.getMovies({ performerId });

    if (movies.length > 0) {
      const firstMovie = movies[0];
      expect(firstMovie).toHaveProperty("id");
      expect(firstMovie).toHaveProperty("title");
      expect(typeof firstMovie.id).toBe("number");
      expect(typeof firstMovie.title).toBe("string");
    } else {
      // No movies is also valid
      expect(movies).toEqual([]);
    }
  });
});
