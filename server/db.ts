import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  packTypes,
  performers,
  InsertPerformer,
  movies,
  InsertMovie,
  moviePerformers,
  InsertMoviePerformer,
  scenes,
  InsertScene,
  actions,
  InsertAction,
  scenePerformerActions,
  InsertScenePerformerAction,
  tournaments,
  InsertTournament,
  tournamentRosterRequirements,
  InsertTournamentRosterRequirement,
  tournamentEntries,
  InsertTournamentEntry,
  tournamentEntryPerformers,
  InsertTournamentEntryPerformer,
  userNftInventory,
  InsertUserNftInventory,
  nftCards,
  InsertNftCard,
  NftCard,
  nftListings,
  InsertNftListing,
  creditLedger,
  nftTransferHistory,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "walletAddress"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserWallet(userId: number, walletAddress: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ walletAddress }).where(eq(users.id, userId));
}

// ============ PERFORMER FUNCTIONS ============

export async function createPerformer(performer: InsertPerformer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(performers).values(performer);
  
  // Extract insertId from the result array
  const insertId = result[0]?.insertId;
  
  if (!insertId) {
    throw new Error("Failed to get insert ID from database");
  }
  
  const id = typeof insertId === 'bigint' ? Number(insertId) : Number(insertId);
  return id;
}

export async function getPerformerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(performers).where(eq(performers.id, id)).limit(1);
  return result[0];
}

export async function getAllPerformers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(performers).orderBy(desc(performers.createdAt));
}

export async function updatePerformer(id: number, data: Partial<InsertPerformer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(performers).set(data).where(eq(performers.id, id));
}

export async function deletePerformer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(performers).where(eq(performers.id, id));
}

// ============ MOVIE FUNCTIONS ============

export async function createMovie(movie: InsertMovie) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(movies).values(movie);
  const insertId = result[0]?.insertId;
  if (!insertId) throw new Error("Failed to get insert ID from database");
  return typeof insertId === 'bigint' ? Number(insertId) : Number(insertId);
}

export async function getMovieById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(movies).where(eq(movies.id, id)).limit(1);
  return result[0];
}

export async function getAllMovies() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(movies).orderBy(desc(movies.releaseDate));
}

export async function updateMovie(id: number, data: Partial<InsertMovie>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(movies).set(data).where(eq(movies.id, id));
}

export async function deleteMovie(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(movies).where(eq(movies.id, id));
}

// ============ MOVIE-PERFORMER FUNCTIONS ============

export async function addPerformerToMovie(movieId: number, performerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(moviePerformers).values({ movieId, performerId });
  
  // Extract insertId from the result array
  const insertId = result[0]?.insertId;
  
  if (!insertId) {
    throw new Error("Failed to get insert ID from database");
  }
  
  const id = typeof insertId === 'bigint' ? Number(insertId) : Number(insertId);
  return id;
}

export async function removePerformerFromMovie(movieId: number, performerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(moviePerformers).where(
    and(
      eq(moviePerformers.movieId, movieId),
      eq(moviePerformers.performerId, performerId)
    )
  );
}

export async function getPerformersByMovieId(movieId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: performers.id,
      name: performers.name,
      bio: performers.bio,
      imageUrl: performers.imageUrl,
      nftContractAddress: performers.nftContractAddress,
      createdAt: performers.createdAt,
      updatedAt: performers.updatedAt,
    })
    .from(moviePerformers)
    .innerJoin(performers, eq(moviePerformers.performerId, performers.id))
    .where(eq(moviePerformers.movieId, movieId));
  
  return result;
}

export async function getMoviesByPerformerId(performerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: movies.id,
      title: movies.title,
      releaseDate: movies.releaseDate,
      coverImageUrl: movies.coverImageUrl,
      description: movies.description,
      createdAt: movies.createdAt,
      updatedAt: movies.updatedAt,
    })
    .from(moviePerformers)
    .innerJoin(movies, eq(moviePerformers.movieId, movies.id))
    .where(eq(moviePerformers.performerId, performerId))
    .orderBy(desc(movies.releaseDate));
  
  return result;
}

// ============ SCENE FUNCTIONS ============

export async function createScene(scene: InsertScene) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scenes).values(scene);
  const insertId = result[0]?.insertId;
  if (!insertId) throw new Error("Failed to get insert ID from database");
  return typeof insertId === 'bigint' ? Number(insertId) : Number(insertId);
}

export async function getScenesByMovieId(movieId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(scenes).where(eq(scenes.movieId, movieId)).orderBy(scenes.sceneNumber);
}

export async function updateScene(id: number, data: Partial<InsertScene>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(scenes).set(data).where(eq(scenes.id, id));
}

export async function deleteScene(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(scenes).where(eq(scenes.id, id));
}

// ============ ACTION FUNCTIONS ============

export async function createAction(action: InsertAction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(actions).values(action);
  const insertId = result[0]?.insertId;
  if (!insertId) throw new Error("Failed to get insert ID from database");
  return typeof insertId === 'bigint' ? Number(insertId) : Number(insertId);
}

export async function getAllActions() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(actions).orderBy(desc(actions.points));
}

export async function updateAction(id: number, data: Partial<InsertAction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(actions).set(data).where(eq(actions.id, id));
}

export async function deleteAction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(actions).where(eq(actions.id, id));
}

// ============ SCENE PERFORMER ACTION FUNCTIONS ============

export async function logScenePerformerAction(data: InsertScenePerformerAction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scenePerformerActions).values(data);
  const insertId = result[0]?.insertId;
  if (!insertId) throw new Error("Failed to get insert ID from database");
  return typeof insertId === 'bigint' ? Number(insertId) : Number(insertId);
}

export async function getScenePerformerActions(sceneId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      id: scenePerformerActions.id,
      sceneId: scenePerformerActions.sceneId,
      performerId: scenePerformerActions.performerId,
      performerName: performers.name,
      performerImage: performers.imageUrl,
      actionId: scenePerformerActions.actionId,
      actionName: actions.name,
      actionPoints: actions.points,
      createdAt: scenePerformerActions.createdAt,
    })
    .from(scenePerformerActions)
    .leftJoin(performers, eq(scenePerformerActions.performerId, performers.id))
    .leftJoin(actions, eq(scenePerformerActions.actionId, actions.id))
    .where(eq(scenePerformerActions.sceneId, sceneId));
}

export async function deleteScenePerformerAction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(scenePerformerActions).where(eq(scenePerformerActions.id, id));
}

// ============ TOURNAMENT FUNCTIONS ============

export async function createTournament(tournament: InsertTournament) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tournaments).values(tournament);
  const insertId = result[0]?.insertId;
  if (!insertId) throw new Error("Failed to get insert ID from database");
  return typeof insertId === 'bigint' ? Number(insertId) : Number(insertId);
}

export async function getTournamentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1);
  return result[0];
}

export async function getAllTournaments() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tournaments).orderBy(desc(tournaments.startDate));
}

export async function getActiveTournaments() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return db
    .select()
    .from(tournaments)
    .where(
      and(
        lte(tournaments.startDate, now),
        gte(tournaments.endDate, now)
      )
    )
    .orderBy(tournaments.startDate);
}

export async function updateTournament(id: number, data: Partial<InsertTournament>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tournaments).set(data).where(eq(tournaments.id, id));
}

/**
 * Atomically claims a tournament for payout by flipping payoutComplete
 * false→true. Returns true if this caller won the claim. The flag is the
 * mutex: concurrent calls (double-click, scheduler overlap) get false.
 */
export async function claimTournamentPayout(tournamentId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .update(tournaments)
    .set({ payoutComplete: true })
    .where(and(eq(tournaments.id, tournamentId), eq(tournaments.payoutComplete, false)));
  return (result?.affectedRows ?? 0) > 0;
}

/** Releases a payout claim after a failed distribution so it can be retried. */
export async function markTournamentPayoutFailed(tournamentId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(tournaments)
    .set({ payoutComplete: false })
    .where(eq(tournaments.id, tournamentId));
}

/**
 * Unlocks all platform NFT cards locked by entries of the given tournament.
 * entryPerformers.nftTokenId stores the platform card id as a string for
 * platform-native entries; legacy blockchain token ids are ignored.
 * Returns the number of cards unlocked.
 */
export async function unlockTournamentCards(tournamentId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const entries = await getTournamentEntries(tournamentId);
  if (entries.length === 0) return 0;

  const cardIds: number[] = [];
  for (const entry of entries) {
    const roster = await getEntryPerformers(entry.id);
    for (const slot of roster) {
      const id = Number(slot.nftTokenId);
      if (Number.isInteger(id) && id > 0) cardIds.push(id);
    }
  }
  if (cardIds.length === 0) return 0;

  const { inArray } = await import("drizzle-orm");
  await db.update(nftCards).set({ isLocked: false }).where(inArray(nftCards.id, cardIds));
  return cardIds.length;
}

// ============ TOURNAMENT ROSTER REQUIREMENTS FUNCTIONS ============

export async function createTournamentRosterRequirement(requirement: InsertTournamentRosterRequirement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tournamentRosterRequirements).values(requirement);
  const insertId = result[0]?.insertId;
  if (!insertId) throw new Error("Failed to get insert ID from database");
  return typeof insertId === 'bigint' ? Number(insertId) : Number(insertId);
}

export async function getTournamentRosterRequirements(tournamentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(tournamentRosterRequirements)
    .where(eq(tournamentRosterRequirements.tournamentId, tournamentId));
}

export async function deleteTournamentRosterRequirements(tournamentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(tournamentRosterRequirements).where(eq(tournamentRosterRequirements.tournamentId, tournamentId));
}

// ============ TOURNAMENT ENTRY FUNCTIONS ============

export async function enterTournament(entry: InsertTournamentEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tournamentEntries).values(entry);
  const insertId = result[0]?.insertId;
  if (!insertId) throw new Error("Failed to get insert ID from database");
  return typeof insertId === 'bigint' ? Number(insertId) : Number(insertId);
}

export async function getTournamentEntries(tournamentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      id: tournamentEntries.id,
      tournamentId: tournamentEntries.tournamentId,
      userId: tournamentEntries.userId,
      userName: users.name,
      totalScore: tournamentEntries.totalScore,
      createdAt: tournamentEntries.createdAt,
    })
    .from(tournamentEntries)
    .leftJoin(users, eq(tournamentEntries.userId, users.id))
    .where(eq(tournamentEntries.tournamentId, tournamentId))
    .orderBy(desc(tournamentEntries.totalScore));
}

export async function getEntryPerformers(entryId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      id: tournamentEntryPerformers.id,
      entryId: tournamentEntryPerformers.entryId,
      performerId: tournamentEntryPerformers.performerId,
      performerName: performers.name,
      performerImage: performers.imageUrl,
      performerType: performers.performerType,
      nftTokenId: tournamentEntryPerformers.nftTokenId,
      createdAt: tournamentEntryPerformers.createdAt,
    })
    .from(tournamentEntryPerformers)
    .leftJoin(performers, eq(tournamentEntryPerformers.performerId, performers.id))
    .where(eq(tournamentEntryPerformers.entryId, entryId));
}

export async function addPerformerToEntry(entryPerformer: InsertTournamentEntryPerformer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tournamentEntryPerformers).values(entryPerformer);
  const insertId = result[0]?.insertId;
  if (!insertId) throw new Error("Failed to get insert ID from database");
  return typeof insertId === 'bigint' ? Number(insertId) : Number(insertId);
}

export async function getUserTournamentEntry(tournamentId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(tournamentEntries)
    .where(
      and(
        eq(tournamentEntries.tournamentId, tournamentId),
        eq(tournamentEntries.userId, userId)
      )
    )
    .limit(1);
  
  return result[0];
}

export async function updateTournamentEntryScore(entryId: number, score: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tournamentEntries).set({ totalScore: score }).where(eq(tournamentEntries.id, entryId));
}

export async function deleteEntryPerformers(entryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(tournamentEntryPerformers).where(eq(tournamentEntryPerformers.entryId, entryId));
}

// ============ NFT INVENTORY FUNCTIONS ============

export async function syncUserNft(nft: InsertUserNftInventory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(userNftInventory).values(nft).onDuplicateKeyUpdate({
    set: { lastSyncedAt: new Date() },
  });
}

export async function getUserNfts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      id: userNftInventory.id,
      userId: userNftInventory.userId,
      performerId: userNftInventory.performerId,
      performerName: performers.name,
      performerImage: performers.imageUrl,
      performerType: performers.performerType,
      contractAddress: userNftInventory.contractAddress,
      tokenId: userNftInventory.tokenId,
      lastSyncedAt: userNftInventory.lastSyncedAt,
    })
    .from(userNftInventory)
    .leftJoin(performers, eq(userNftInventory.performerId, performers.id))
    .where(eq(userNftInventory.userId, userId));
}

export async function clearUserNfts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(userNftInventory).where(eq(userNftInventory.userId, userId));
}

// ============ SCORING FUNCTIONS ============

export async function calculateTournamentScores(tournamentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get tournament details
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) return;
  
  // Get all entries for this tournament
  const entries = await db
    .select()
    .from(tournamentEntries)
    .where(eq(tournamentEntries.tournamentId, tournamentId));
  
  // For each entry, calculate their roster's total score
  for (const entry of entries) {
    // Get all performers in this entry's roster
    const entryPerformers = await getEntryPerformers(entry.id);
    const performerIds = entryPerformers.map(ep => ep.performerId).filter((id): id is number => id !== null);
    
    if (performerIds.length === 0) {
      await updateTournamentEntryScore(entry.id, 0);
      continue;
    }
    
    // Get all scenes within the tournament timeframe
    const scenesInTournament = await db
      .select({
        sceneId: scenes.id,
      })
      .from(scenes)
      .leftJoin(movies, eq(scenes.movieId, movies.id))
      .where(
        and(
          gte(movies.releaseDate, tournament.startDate),
          lte(movies.releaseDate, tournament.endDate)
        )
      );
    
    const sceneIds = scenesInTournament.map(s => s.sceneId);
    
    if (sceneIds.length === 0) {
      await updateTournamentEntryScore(entry.id, 0);
      continue;
    }
    
    // Calculate total points for all performers in the roster across these scenes
    const scoreResult = await db
      .select({
        totalPoints: sql<number>`COALESCE(SUM(${actions.points}), 0)`,
      })
      .from(scenePerformerActions)
      .leftJoin(actions, eq(scenePerformerActions.actionId, actions.id))
      .where(
        and(
          sql`${scenePerformerActions.performerId} IN (${sql.join(performerIds.map(id => sql`${id}`), sql`, `)})`,
          sql`${scenePerformerActions.sceneId} IN (${sql.join(sceneIds.map(id => sql`${id}`), sql`, `)})`
        )
      );
    
    const totalScore = scoreResult[0]?.totalPoints || 0;
    await updateTournamentEntryScore(entry.id, totalScore);
  }
}

export async function getPerformerRecentPerformances(performerId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      sceneId: scenes.id,
      sceneTitle: scenes.title,
      sceneNumber: scenes.sceneNumber,
      movieId: movies.id,
      movieTitle: movies.title,
      movieReleaseDate: movies.releaseDate,
      actionName: actions.name,
      actionPoints: actions.points,
      performedAt: scenePerformerActions.createdAt,
    })
    .from(scenePerformerActions)
    .leftJoin(scenes, eq(scenePerformerActions.sceneId, scenes.id))
    .leftJoin(movies, eq(scenes.movieId, movies.id))
    .leftJoin(actions, eq(scenePerformerActions.actionId, actions.id))
    .where(eq(scenePerformerActions.performerId, performerId))
    .orderBy(desc(scenePerformerActions.createdAt))
    .limit(limit);
}

export async function getPerformerStatistics(performerId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Get total points and action count
  const actionStats = await db
    .select({
      totalPoints: sql<number>`SUM(${actions.points})`,
      totalActions: sql<number>`COUNT(*)`,
    })
    .from(scenePerformerActions)
    .leftJoin(actions, eq(scenePerformerActions.actionId, actions.id))
    .where(eq(scenePerformerActions.performerId, performerId));
  
  // Get action breakdown
  const actionBreakdown = await db
    .select({
      actionName: actions.name,
      actionPoints: actions.points,
      count: sql<number>`COUNT(*)`,
      totalPoints: sql<number>`SUM(${actions.points})`,
    })
    .from(scenePerformerActions)
    .leftJoin(actions, eq(scenePerformerActions.actionId, actions.id))
    .where(eq(scenePerformerActions.performerId, performerId))
    .groupBy(actions.id, actions.name, actions.points);
  
  // Get scene count
  const sceneCount = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${scenePerformerActions.sceneId})`,
    })
    .from(scenePerformerActions)
    .where(eq(scenePerformerActions.performerId, performerId));
  
  // Get movie count
  const movieCount = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${moviePerformers.movieId})`,
    })
    .from(moviePerformers)
    .where(eq(moviePerformers.performerId, performerId));
  
  const totalPoints = Number(actionStats[0]?.totalPoints) || 0;
  const totalActions = Number(actionStats[0]?.totalActions) || 0;
  const totalScenes = Number(sceneCount[0]?.count) || 0;
  const totalMovies = Number(movieCount[0]?.count) || 0;
  
  return {
    totalPoints,
    totalActions,
    totalScenes,
    totalMovies,
    averagePointsPerScene: totalScenes > 0 ? totalPoints / totalScenes : 0,
    actionBreakdown: actionBreakdown.map(action => ({
      actionName: action.actionName,
      actionPoints: Number(action.actionPoints),
      count: Number(action.count),
      totalPoints: Number(action.totalPoints),
    })),
  };
}

// ============ SCENE PERFORMER MANAGEMENT ============

export async function getScenePerformers(sceneId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get unique performers in a scene from scenePerformerActions
  const result = await db
    .select({
      performerId: scenePerformerActions.performerId,
      performerName: performers.name,
      performerImage: performers.imageUrl,
      performerType: performers.performerType,
    })
    .from(scenePerformerActions)
    .leftJoin(performers, eq(scenePerformerActions.performerId, performers.id))
    .where(eq(scenePerformerActions.sceneId, sceneId))
    .groupBy(scenePerformerActions.performerId, performers.name, performers.imageUrl, performers.performerType);
  
  return result;
}

export async function addScenePerformer(sceneId: number, performerId: number) {
  // This is handled by adding actions - no separate table needed
  // Return success
  return { sceneId, performerId };
}

export async function removeScenePerformer(sceneId: number, performerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Remove all actions for this performer in this scene
  await db
    .delete(scenePerformerActions)
    .where(
      and(
        eq(scenePerformerActions.sceneId, sceneId),
        eq(scenePerformerActions.performerId, performerId)
      )
    );
}

export async function getScenePerformerActionsList(sceneId: number, performerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      id: scenePerformerActions.id,
      actionId: scenePerformerActions.actionId,
      actionName: actions.name,
      actionPoints: actions.points,
    })
    .from(scenePerformerActions)
    .leftJoin(actions, eq(scenePerformerActions.actionId, actions.id))
    .where(
      and(
        eq(scenePerformerActions.sceneId, sceneId),
        eq(scenePerformerActions.performerId, performerId)
      )
    );
}

export async function addScenePerformerAction(
  sceneId: number,
  performerId: number,
  actionId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scenePerformerActions).values({
    sceneId,
    performerId,
    actionId,
  });
  
  return { id: result[0]?.insertId };
}

export async function removeScenePerformerAction(
  sceneId: number,
  performerId: number,
  actionId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(scenePerformerActions)
    .where(
      and(
        eq(scenePerformerActions.sceneId, sceneId),
        eq(scenePerformerActions.performerId, performerId),
        eq(scenePerformerActions.actionId, actionId)
      )
    );
}



// ============ BADGE FUNCTIONS ============

export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];
  
  const { badges } = await import("../drizzle/schema");
  return db.select().from(badges).orderBy(badges.name);
}

export async function getPerformerBadges(performerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { performerBadges, badges } = await import("../drizzle/schema");
  
  return db
    .select({
      id: badges.id,
      name: badges.name,
      icon: badges.icon,
      description: badges.description,
      order: performerBadges.order,
    })
    .from(performerBadges)
    .innerJoin(badges, eq(performerBadges.badgeId, badges.id))
    .where(eq(performerBadges.performerId, performerId))
    .orderBy(performerBadges.order);
}

export async function updatePerformerBadges(performerId: number, badgeIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { performerBadges } = await import("../drizzle/schema");
  
  // Delete existing badges
  await db.delete(performerBadges).where(eq(performerBadges.performerId, performerId));
  
  // Insert new badges with order
  if (badgeIds.length > 0) {
    const values = badgeIds.map((badgeId, index) => ({
      performerId,
      badgeId,
      order: index,
    }));
    
    await db.insert(performerBadges).values(values);
  }
}

export async function regeneratePerformerCard(performerId: number) {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);
  
  // Get performer details
  const performer = await getPerformerById(performerId);
  if (!performer) {
    throw new Error("Performer not found");
  }
  
  // Get performer badges
  const badges = await getPerformerBadges(performerId);
  
  // Download portrait from CDN to use as base
  // Use portraitUrl if available, otherwise fall back to imageUrl (which might be a card)
  const portraitSource = performer.portraitUrl || performer.imageUrl;
  if (!portraitSource) {
    throw new Error("Performer has no portrait or card image");
  }
  
  const portraitPath = `/tmp/${performer.name.toLowerCase().replace(/ /g, '-')}-portrait.png`;
  const downloadCommand = `curl -s -o "${portraitPath}" "${portraitSource}"`;
  await execAsync(downloadCommand);
  
  // Download badge images to temp directory
  const badgePaths: string[] = [];
  for (let i = 0; i < badges.length; i++) {
    const badge = badges[i];
    const badgePath = `/tmp/badge-${i}-${badge.name.toLowerCase().replace(/ /g, '-')}.png`;
    try {
      const badgeDownloadCmd = `curl -s -o "${badgePath}" "${badge.icon}"`;
      await execAsync(badgeDownloadCmd);
      badgePaths.push(badgePath);
    } catch (error) {
      console.error(`Failed to download badge ${badge.name}:`, error);
    }
  }
  
  // Call Python script to regenerate card
  const scriptPath = "/home/ubuntu/fantasy-movie-league/generate_nft_card_v3.py";
  const outputPath = `/home/ubuntu/fantasy-movie-league/${performer.name.toLowerCase().replace(/ /g, '-')}-FINAL-CARD.png`;
  
  // Pass badge file paths as separate arguments
  const badgeArgs = badgePaths.map(p => `"${p}"`).join(' ');
  const command = `cd /home/ubuntu/fantasy-movie-league && env -i PATH=/usr/bin:/bin HOME=/home/ubuntu python3.11 ${scriptPath} "${portraitPath}" "${performer.name}" "${outputPath}" ${badgeArgs}`;
  
  try {
    await execAsync(command);
    
    // Upload to S3
    const uploadCommand = `manus-upload-file "${outputPath}"`;
    const { stdout } = await execAsync(uploadCommand);
    // Extract only the CDN URL from the output (last line starting with https://)
    const cdnUrlMatch = stdout.match(/CDN URL: (https:\/\/[^\s]+)/);
    const cardUrl = cdnUrlMatch ? cdnUrlMatch[1] : stdout.trim();
    
    // Update performer imageUrl
    await updatePerformer(performerId, { imageUrl: cardUrl });
    
    return { success: true, cardUrl };
  } catch (error: any) {
    console.error("Error regenerating card:", error);
    throw new Error(`Failed to regenerate card: ${error.message}`);
  }
}

// ============ PLATFORM NFT CARD FUNCTIONS ============

/** Mint a new NFT card for a performer. Returns the new card. */
export async function mintNftCard(data: {
  performerId: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  cardImageUrl?: string;
  mintedBy: number;
  count?: number; // how many copies to mint (default 1)
}): Promise<NftCard[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find the current max serial number for this performer
  const existing = await db
    .select({ serialNumber: nftCards.serialNumber })
    .from(nftCards)
    .where(eq(nftCards.performerId, data.performerId))
    .orderBy(desc(nftCards.serialNumber))
    .limit(1);

  const startSerial = existing.length > 0 ? existing[0].serialNumber + 1 : 1;
  const count = data.count ?? 1;
  const minted: NftCard[] = [];

  for (let i = 0; i < count; i++) {
    const [result] = await db.insert(nftCards).values({
      performerId: data.performerId,
      serialNumber: startSerial + i,
      rarity: data.rarity,
      cardImageUrl: data.cardImageUrl,
      mintedBy: data.mintedBy,
      ownerId: null, // unowned — in treasury
    });
    const newCard = await db
      .select()
      .from(nftCards)
      .where(eq(nftCards.id, (result as any).insertId))
      .limit(1);
    if (newCard[0]) {
      // Record mint transfer
      await db.insert(nftTransferHistory).values({
        nftCardId: newCard[0].id,
        fromUserId: null,
        toUserId: null,
        transferType: "mint",
      });
      minted.push(newCard[0]);
    }
  }
  return minted;
}

/** Get all NFT cards for a performer (with owner info) */
export async function getNftCardsByPerformer(performerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: nftCards.id,
      performerId: nftCards.performerId,
      performerName: performers.name,
      performerImageUrl: performers.imageUrl,
      ownerId: nftCards.ownerId,
      ownerName: users.name,
      serialNumber: nftCards.serialNumber,
      rarity: nftCards.rarity,
      cardImageUrl: nftCards.cardImageUrl,
      isLocked: nftCards.isLocked,
      mintedAt: nftCards.mintedAt,
    })
    .from(nftCards)
    .leftJoin(performers, eq(nftCards.performerId, performers.id))
    .leftJoin(users, eq(nftCards.ownerId, users.id))
    .where(eq(nftCards.performerId, performerId))
    .orderBy(nftCards.serialNumber);
}

/** Get all NFT cards owned by a user */
export async function getUserOwnedNftCards(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: nftCards.id,
      performerId: nftCards.performerId,
      performerName: performers.name,
      performerType: performers.performerType,
      performerImageUrl: performers.imageUrl,
      serialNumber: nftCards.serialNumber,
      rarity: nftCards.rarity,
      cardImageUrl: nftCards.cardImageUrl,
      isLocked: nftCards.isLocked,
      mintedAt: nftCards.mintedAt,
    })
    .from(nftCards)
    .leftJoin(performers, eq(nftCards.performerId, performers.id))
    .where(eq(nftCards.ownerId, userId))
    .orderBy(desc(nftCards.mintedAt));
}

/** Get a single NFT card by ID */
export async function getNftCardById(cardId: number) {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select({
      id: nftCards.id,
      performerId: nftCards.performerId,
      performerName: performers.name,
      performerImageUrl: performers.imageUrl,
      ownerId: nftCards.ownerId,
      ownerName: users.name,
      serialNumber: nftCards.serialNumber,
      rarity: nftCards.rarity,
      cardImageUrl: nftCards.cardImageUrl,
      isLocked: nftCards.isLocked,
      mintedAt: nftCards.mintedAt,
      onChainTokenId: nftCards.onChainTokenId,
      onChainContractAddress: nftCards.onChainContractAddress,
    })
    .from(nftCards)
    .leftJoin(performers, eq(nftCards.performerId, performers.id))
    .leftJoin(users, eq(nftCards.ownerId, users.id))
    .where(eq(nftCards.id, cardId))
    .limit(1);

  return rows[0] ?? null;
}

/** Admin: assign an NFT card to a user (transfer from treasury or another user) */
export async function assignNftCardToUser(cardId: number, toUserId: number, adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const card = await getNftCardById(cardId);
  if (!card) throw new Error("Card not found");

  const fromUserId = card.ownerId;
  await db.update(nftCards).set({ ownerId: toUserId }).where(eq(nftCards.id, cardId));

  await db.insert(nftTransferHistory).values({
    nftCardId: cardId,
    fromUserId: fromUserId ?? null,
    toUserId,
    transferType: "admin_transfer",
  });
}

// ============ CREDIT LEDGER FUNCTIONS ============

/** Get a user's current PSL credit balance */
export async function getUserCreditBalance(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const rows = await db
    .select({ total: sql<number>`COALESCE(SUM(${creditLedger.amount}), 0)` })
    .from(creditLedger)
    .where(eq(creditLedger.userId, userId));

  return Number(rows[0]?.total ?? 0);
}

/** Add or deduct credits for a user */
export async function adjustUserCredits(data: {
  userId: number;
  amount: number;
  type: "admin_grant" | "tournament_prize" | "nft_sale" | "nft_purchase" | "tournament_entry" | "refund";
  description?: string;
  relatedNftCardId?: number;
  relatedListingId?: number;
  relatedTournamentId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(creditLedger).values({
    userId: data.userId,
    amount: data.amount,
    type: data.type,
    description: data.description,
    relatedNftCardId: data.relatedNftCardId,
    relatedListingId: data.relatedListingId,
    relatedTournamentId: data.relatedTournamentId,
  });
}

/** Get credit transaction history for a user */
export async function getUserCreditHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(creditLedger)
    .where(eq(creditLedger.userId, userId))
    .orderBy(desc(creditLedger.createdAt))
    .limit(50);
}

// ============ NFT MARKETPLACE FUNCTIONS ============

/** List an NFT card for sale */
export async function createNftListing(data: {
  nftCardId: number;
  sellerId: number;
  priceCredits: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify ownership
  const card = await getNftCardById(data.nftCardId);
  if (!card) throw new Error("Card not found");
  if (card.ownerId !== data.sellerId) throw new Error("You do not own this card");
  if (card.isLocked) throw new Error("This card is locked in an active tournament");

  // Check no active listing exists
  const existing = await db
    .select()
    .from(nftListings)
    .where(and(eq(nftListings.nftCardId, data.nftCardId), eq(nftListings.status, "active")))
    .limit(1);
  if (existing.length > 0) throw new Error("This card is already listed for sale");

  const [result] = await db.insert(nftListings).values({
    nftCardId: data.nftCardId,
    sellerId: data.sellerId,
    priceCredits: data.priceCredits,
    status: "active",
  });

  return (result as any).insertId as number;
}

/** Cancel an active listing */
export async function cancelNftListing(listingId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const listing = await db
    .select()
    .from(nftListings)
    .where(eq(nftListings.id, listingId))
    .limit(1);
  if (!listing[0]) throw new Error("Listing not found");
  if (listing[0].sellerId !== userId) throw new Error("You do not own this listing");
  if (listing[0].status !== "active") throw new Error("Listing is not active");

  await db.update(nftListings).set({ status: "cancelled" }).where(eq(nftListings.id, listingId));
}

/** Buy an NFT from the marketplace.
 *
 * Runs as a single DB transaction so a crash mid-way can't lose credits or
 * strand a half-transferred card. The active→sold claim is an atomic
 * conditional UPDATE (WHERE status='active'): of two concurrent buyers, only
 * one can flip the row, the other sees affectedRows=0 and the whole
 * transaction rolls back — no double-sale.
 */
export async function buyNftListing(listingId: number, buyerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.transaction(async (tx) => {
    const listing = await tx
      .select()
      .from(nftListings)
      .where(eq(nftListings.id, listingId))
      .limit(1);
    if (!listing[0]) throw new Error("Listing not found");
    if (listing[0].sellerId === buyerId)
      throw new Error("You cannot buy your own listing");

    const price = listing[0].priceCredits;
    const sellerId = listing[0].sellerId;
    const cardId = listing[0].nftCardId;

    // ATOMIC CLAIM — WHERE status='active' is the mutex; only one
    // concurrent buyer can flip active→sold.
    const [claim] = await tx
      .update(nftListings)
      .set({ status: "sold", buyerId, soldAt: new Date() })
      .where(and(eq(nftListings.id, listingId), eq(nftListings.status, "active")));
    if (!claim || claim.affectedRows === 0)
      throw new Error("Listing is no longer available");

    // Balance check INSIDE the transaction.
    const balRows = await tx
      .select({ total: sql<number>`COALESCE(SUM(${creditLedger.amount}), 0)` })
      .from(creditLedger)
      .where(eq(creditLedger.userId, buyerId));
    const buyerBalance = Number(balRows[0]?.total ?? 0);
    if (buyerBalance < price) throw new Error("Insufficient PSL credits");

    // Deduct from buyer
    await tx.insert(creditLedger).values({
      userId: buyerId,
      amount: -price,
      type: "nft_purchase",
      description: `Purchased NFT card #${cardId}`,
      relatedNftCardId: cardId,
      relatedListingId: listingId,
    });

    // Credit seller (platform takes 5% fee)
    const sellerAmount = Math.floor(price * 0.95);
    await tx.insert(creditLedger).values({
      userId: sellerId,
      amount: sellerAmount,
      type: "nft_sale",
      description: `Sold NFT card #${cardId} (5% platform fee deducted)`,
      relatedNftCardId: cardId,
      relatedListingId: listingId,
    });

    // Transfer ownership
    await tx.update(nftCards).set({ ownerId: buyerId }).where(eq(nftCards.id, cardId));

    // Record transfer history
    await tx.insert(nftTransferHistory).values({
      nftCardId: cardId,
      fromUserId: sellerId,
      toUserId: buyerId,
      transferType: "marketplace_sale",
      priceCredits: price,
      listingId,
    });
  });
}

/** Get all active marketplace listings with card and performer info */
export async function getActiveNftListings(filters?: {
  performerType?: string;
  rarity?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      listingId: nftListings.id,
      priceCredits: nftListings.priceCredits,
      listedAt: nftListings.createdAt,
      cardId: nftCards.id,
      serialNumber: nftCards.serialNumber,
      rarity: nftCards.rarity,
      cardImageUrl: nftCards.cardImageUrl,
      performerId: performers.id,
      performerName: performers.name,
      performerType: performers.performerType,
      performerImageUrl: performers.imageUrl,
      sellerName: users.name,
      sellerId: nftListings.sellerId,
    })
    .from(nftListings)
    .leftJoin(nftCards, eq(nftListings.nftCardId, nftCards.id))
    .leftJoin(performers, eq(nftCards.performerId, performers.id))
    .leftJoin(users, eq(nftListings.sellerId, users.id))
    .where(eq(nftListings.status, "active"))
    .orderBy(desc(nftListings.createdAt));

  return rows;
}

/** Get all NFT cards in the platform treasury (unowned) */
export async function getTreasuryNftCards() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: nftCards.id,
      performerId: nftCards.performerId,
      performerName: performers.name,
      performerImageUrl: performers.imageUrl,
      serialNumber: nftCards.serialNumber,
      rarity: nftCards.rarity,
      cardImageUrl: nftCards.cardImageUrl,
      mintedAt: nftCards.mintedAt,
    })
    .from(nftCards)
    .leftJoin(performers, eq(nftCards.performerId, performers.id))
    .where(sql`${nftCards.ownerId} IS NULL`)
    .orderBy(desc(nftCards.mintedAt));
}

/** Get NFT transfer history for a card */
export async function getNftTransferHistory(cardId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(nftTransferHistory)
    .where(eq(nftTransferHistory.nftCardId, cardId))
    .orderBy(desc(nftTransferHistory.createdAt));
}

/** Get all minted NFT cards (admin view) */
export async function getAllNftCards() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: nftCards.id,
      performerId: nftCards.performerId,
      performerName: performers.name,
      performerImageUrl: performers.imageUrl,
      ownerId: nftCards.ownerId,
      ownerName: users.name,
      serialNumber: nftCards.serialNumber,
      rarity: nftCards.rarity,
      cardImageUrl: nftCards.cardImageUrl,
      isLocked: nftCards.isLocked,
      mintedAt: nftCards.mintedAt,
    })
    .from(nftCards)
    .leftJoin(performers, eq(nftCards.performerId, performers.id))
    .leftJoin(users, eq(nftCards.ownerId, users.id))
    .orderBy(desc(nftCards.mintedAt));
}

// ============ PACK PURCHASE FUNCTIONS ===========

import type { PackType } from "../drizzle/schema";

/** Get all available pack types */
export async function getPackTypes(): Promise<PackType[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(packTypes).where(eq(packTypes.isActive, true));
}

/** Get available treasury cards by rarity for pack generation */
export async function getTreasuryCardsByRarity(rarity: "Common" | "Rare" | "Epic" | "Legendary", limit: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Get random cards from treasury (unowned cards)
  const cards = await db
    .select({
      id: nftCards.id,
      performerId: nftCards.performerId,
      performerName: performers.name,
      performerImageUrl: performers.imageUrl,
      serialNumber: nftCards.serialNumber,
      rarity: nftCards.rarity,
      cardImageUrl: nftCards.cardImageUrl,
      isLocked: nftCards.isLocked,
      mintedAt: nftCards.mintedAt,
    })
    .from(nftCards)
    .leftJoin(performers, eq(nftCards.performerId, performers.id))
    .where(and(eq(nftCards.rarity, rarity), sql`${nftCards.ownerId} IS NULL`))
    .orderBy(sql`RAND()`)
    .limit(limit);
  
  return cards;
}

/** Purchase pack: select random cards based on pack configuration and assign to user */
export async function purchasePack(
  packTypeId: number,
  userId: number,
  txHash: string
): Promise<{ cardIds: number[]; totalCostCents: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get pack configuration
  const packType = await db.select().from(packTypes).where(eq(packTypes.id, packTypeId)).limit(1);
  if (!packType[0]) throw new Error("Pack type not found");
  
  const pack = packType[0];
  const cardIds: number[] = [];
  
  // Get random cards for each rarity tier
  // Note: "uncommonCount" maps to "Epic" rarity tier in the schema
  const rareCards = await getTreasuryCardsByRarity("Rare", pack.rareCount);
  const uncommonCards = await getTreasuryCardsByRarity("Epic", pack.uncommonCount);
  const commonCards = await getTreasuryCardsByRarity("Common", pack.commonCount);
  
  // Check if we have enough cards in treasury
  if (rareCards.length < pack.rareCount || uncommonCards.length < pack.uncommonCount || commonCards.length < pack.commonCount) {
    throw new Error("Not enough cards in treasury to fulfill pack");
  }
  
  // Assign cards to user and lock them
  for (const card of [...rareCards, ...uncommonCards, ...commonCards]) {
    await db.update(nftCards).set({ ownerId: userId }).where(eq(nftCards.id, card.id));
    cardIds.push(card.id);
    
    // Record transfer
    await db.insert(nftTransferHistory).values({
      nftCardId: card.id,
      fromUserId: null,
      toUserId: userId,
      transferType: "admin_transfer",
      priceCredits: 0, // Will be updated via transaction record
    });
  }
  
  return { cardIds, totalCostCents: pack.priceUsdCents };
}
