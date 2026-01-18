import * as db from "./db";

/**
 * Recalculates scores for all active tournaments that include the given movie's release date
 */
export async function recalculateScoresForMovie(movieId: number) {
  const movie = await db.getMovieById(movieId);
  if (!movie || !movie.releaseDate) return;
  
  // Find all tournaments that this movie falls within
  const allTournaments = await db.getAllTournaments();
  const affectedTournaments = allTournaments.filter(t => {
    if (!t.startDate || !t.endDate) return false;
    const releaseDate = new Date(movie.releaseDate!);
    return releaseDate >= new Date(t.startDate) && releaseDate <= new Date(t.endDate);
  });
  
  // Recalculate scores for each affected tournament
  for (const tournament of affectedTournaments) {
    console.log(`[Scoring] Recalculating scores for tournament ${tournament.id} (${tournament.name}) after movie update`);
    await db.calculateTournamentScores(tournament.id);
  }
  
  console.log(`[Scoring] Updated ${affectedTournaments.length} tournament(s) after movie ${movieId} change`);
}

/**
 * Recalculates scores for all active tournaments
 */
export async function recalculateAllActiveTournamentScores() {
  const tournaments = await db.getAllTournaments();
  const now = new Date();
  
  const activeTournaments = tournaments.filter(t => {
    if (!t.startDate || !t.endDate) return false;
    return new Date(t.startDate) <= now && new Date(t.endDate) >= now;
  });
  
  for (const tournament of activeTournaments) {
    console.log(`[Scoring] Recalculating scores for active tournament ${tournament.id} (${tournament.name})`);
    await db.calculateTournamentScores(tournament.id);
  }
  
  console.log(`[Scoring] Updated ${activeTournaments.length} active tournament(s)`);
}
