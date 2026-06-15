import { eq, and, gte, lte, sql } from "drizzle-orm";
import { 
  movies, 
  scenes, 
  actions, 
  scenePerformerActions,
  tournaments,
  tournamentEntries
} from "../drizzle/schema";

// Import the helper functions we need from db.ts
import { getEntryPerformers, updateTournamentEntryScore, getDb } from "./db";

/**
 * Calculates the score for a performer in a specific scene based on their actions
 * @param performerId The ID of the performer
 * @param sceneId The ID of the scene
 * @param sceneActions Array of action IDs the performer performed in the scene
 * @param allActions Array of all available actions with their point values
 * @returns Total points scored by the performer in the scene
 */
export function calculateScoreForPerformerInScene(
  performerId: number,
  sceneId: number,
  sceneActions: { actionId: number }[],
  allActions: { id: number; name: string; points: number }[]
): number {
  // Create a map for quick lookup of action points
  const actionPointsMap = new Map<number, number>();
  allActions.forEach(action => {
    actionPointsMap.set(action.id, action.points);
  });

  // Sum up points for all actions in the scene
  let totalPoints = 0;
  for (const sceneAction of sceneActions) {
    const points = actionPointsMap.get(sceneAction.actionId);
    if (points !== undefined) {
      totalPoints += points;
    }
    // Unknown action IDs are ignored (treated as 0 points)
  }

  return totalPoints;
}

/**
 * Recalculates tournament scores for all tournaments affected by a specific movie
 * This is called when a movie is added, updated, or has its release date changed
 * @param movieId The ID of the movie to recalculate scores for
 */
export async function recalculateScoresForMovie(movieId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the movie to check if it has a release date
  const movieRows = await db.select().from(movies).where(eq(movies.id, movieId)).limit(1);
  const movie = movieRows[0];

  if (!movie) {
    throw new Error(`Movie not found: ${movieId}`);
  }

  // If movie has no release date, it doesn't affect any tournaments
  if (!movie.releaseDate) {
    return;
  }

  // Get all tournaments where this movie's release date falls within the tournament date range
  // Note: Fixed the logic - we want tournaments WHERE startDate <= movie.releaseDate <= endDate
  const affectedTournaments = await db
    .select()
    .from(tournaments)
    .where(
      and(
        lte(tournaments.startDate, movie.releaseDate),
        gte(tournaments.endDate, movie.releaseDate)
      )
    );

  // For each affected tournament, recalculate scores
  // but only count actions from scenes in this specific movie
  for (const tournament of affectedTournaments) {
    // Get all entries for this tournament
    const entries = await db
      .select()
      .from(tournamentEntries)
      .where(eq(tournamentEntries.tournamentId, tournament.id));

    // For each entry, calculate their roster's total score from this movie only
    for (const entry of entries) {
      // Get all performers in this entry's roster
      const entryPerformers = await getEntryPerformers(entry.id);
      const performerIds = entryPerformers
        .map(ep => ep.performerId)
        .filter((id): id is number => id !== null);

      if (performerIds.length === 0) {
        // No performers in roster, score is 0
        await updateTournamentEntryScore(entry.id, 0);
        continue;
      }

      // Get all scenes for this specific movie
      const movieScenes = await db
        .select({ sceneId: scenes.id })
        .from(scenes)
        .where(eq(scenes.movieId, movieId));

      const sceneIds = movieScenes.map(s => s.sceneId);

      if (sceneIds.length === 0) {
        // No scenes for this movie, score is 0
        await updateTournamentEntryScore(entry.id, 0);
        continue;
      }

      // Calculate total points for all performers in the roster from this movie's scenes
      const scoreResult = await db
        .select({
          totalPoints: sql<number>`COALESCE(SUM(${actions.points}), 0)`,
        })
        .from(scenePerformerActions)
        .leftJoin(actions, eq(scenePerformerActions.actionId, actions.id))
        .where(
          and(
            sql`${scenePerformerActions.performerId} IN (${sql.join(
              performerIds.map(id => sql`${id}`),
              sql`, `
            )})`,
            sql`${scenePerformerActions.sceneId} IN (${sql.join(
              sceneIds.map(id => sql`${id}`),
              sql`, `
            )})`
          )
        );

      const totalScore = scoreResult[0]?.totalPoints || 0;
      await updateTournamentEntryScore(entry.id, totalScore);
    }
  }
}