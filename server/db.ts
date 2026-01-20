import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
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
      iconUrl: badges.iconUrl,
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
  
  // Build badge names array for Python script
  const badgeNames = badges.map(b => b.name);
  
  // Call Python script to regenerate card
  const scriptPath = "/home/ubuntu/fantasy-movie-league/generate_nft_card_v3.py";
  const portraitPath = `/home/ubuntu/nft-cards-backup/${performer.name.toLowerCase().replace(/ /g, '-')}-final-portrait.png`;
  const outputPath = `/home/ubuntu/fantasy-movie-league/${performer.name.toLowerCase().replace(/ /g, '-')}-FINAL-CARD.png`;
  
  const badgesArg = badgeNames.join(',');
  const command = `cd /home/ubuntu/fantasy-movie-league && python3.11 ${scriptPath} "${portraitPath}" "${performer.name}" "${outputPath}" "${badgesArg}"`;
  
  try {
    await execAsync(command);
    
    // Upload to S3
    const uploadCommand = `manus-upload-file "${outputPath}"`;
    const { stdout } = await execAsync(uploadCommand);
    const cardUrl = stdout.trim();
    
    // Update performer imageUrl
    await updatePerformer(performerId, { imageUrl: cardUrl });
    
    return { success: true, cardUrl };
  } catch (error: any) {
    console.error("Error regenerating card:", error);
    throw new Error(`Failed to regenerate card: ${error.message}`);
  }
}
