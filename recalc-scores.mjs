import { calculateTournamentScores } from './server/db.ts';

const tournamentId = 1; // Spring Showdown
console.log(`Recalculating scores for tournament ${tournamentId}...`);
await calculateTournamentScores(tournamentId);
console.log('Done!');
process.exit(0);
