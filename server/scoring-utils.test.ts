import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db");

import { calculateScoreForPerformerInScene } from "./scoring-utils";
import * as db from "./db";

describe("calculateScoreForPerformerInScene", () => {
  const mockDb = {
    select: vi.fn(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getDb to return our mock db
    (db.getDb as vi.Mock).mockResolvedValue(mockDb);
  });

  it("returns 0 for performer with no actions in scene", async () => {
    // Mock db response for no actions
    mockDb.select.mockReturnValue({
      from: mockDb.from,
      leftJoin: mockDb.leftJoin,
      where: mockDb.where,
      limit: mockDb.limit,
    });
    mockDb.where.mockReturnValue({
      limit: mockDb.limit,
    });
    mockDb.limit.mockResolvedValue([{ totalPoints: 0 }]);

    const sceneActions = []; // No actions
    const allActions = [
      { id: 1, name: "facial", points: 10 },
      { id: 2, name: "double penetration", points: 20 },
      { id: 3, name: "anal", points: 15 }
    ];

    const result = await calculateScoreForPerformerInScene(
      1, // performerId
      1, // sceneId
      sceneActions,
      allActions
    );

    expect(result).toBe(0);
  });

  it("sums points for performer with multiple actions", async () => {
    // Mock db response for actions
    mockDb.select.mockReturnValue({
      from: mockDb.from,
      leftJoin: mockDb.leftJoin,
      where: mockDb.where,
      limit: mockDb.limit,
    });
    mockDb.where.mockReturnValue({
      limit: mockDb.limit,
    });
    mockDb.limit.mockResolvedValue([{ totalPoints: 40 }]);

    const sceneActions = [
      { actionId: 1 }, // facial = 10 points
      { actionId: 2 }, // double penetration = 20 points
      { actionId: 1 }  // facial again = 10 points
    ];
    const allActions = [
      { id: 1, name: "facial", points: 10 },
      { id: 2, name: "double penetration", points: 20 },
      { id: 3, name: "anal", points: 15 }
    ];

    const result = await calculateScoreForPerformerInScene(
      1, // performerId
      1, // sceneId
      sceneActions,
      allActions
    );

    expect(result).toBe(40); // 10 + 20 + 10
  });

  it("handles unknown action IDs gracefully", async () => {
    // Mock db response
    mockDb.select.mockReturnValue({
      from: mockDb.from,
      leftJoin: mockDb.leftJoin,
      where: mockDb.where,
      limit: mockDb.limit,
    });
    mockDb.where.mockReturnValue({
      limit: mockDb.limit,
    });
    mockDb.limit.mockResolvedValue([{ totalPoints: 10 }]); // Only known action

    const sceneActions = [
      { actionId: 1 }, // facial = 10 points
      { actionId: 999 }, // unknown action
    ];
    const allActions = [
      { id: 1, name: "facial", points: 10 },
      { id: 2, name: "double penetration", points: 20 },
    ];

    const result = await calculateScoreForPerformerInScene(
      1, // performerId
      1, // sceneId
      sceneActions,
      allActions
    );

    expect(result).toBe(10); // Only counts known action
  });
});