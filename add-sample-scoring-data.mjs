import { getDb } from './server/db.ts';
import { movies, scenes, scenePerformerActions, actions, performers } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = await getDb();

console.log('Adding sample scoring data...');

// Get some performers from your roster
const allPerformers = await db.select().from(performers).limit(5);
console.log(`Found ${allPerformers.length} performers`);

// Create a test movie within the tournament date range (March-May 2025)
const movieResult = await db.insert(movies).values({
  title: 'Spring Championship Scene Collection',
  releaseDate: new Date('2025-04-15'),
  description: 'Sample movie for testing scoring system',
  coverImageUrl: null,
});

const movieId = Number(movieResult[0].insertId);
console.log(`Created movie ID: ${movieId}`);

// Create 3 scenes in this movie
const sceneIds = [];
for (let i = 1; i <= 3; i++) {
  const sceneResult = await db.insert(scenes).values({
    movieId,
    title: `Scene ${i}`,
    description: `Test scene ${i} for scoring`,
  });
  sceneIds.push(Number(sceneResult[0].insertId));
  console.log(`Created scene ID: ${sceneIds[sceneIds.length - 1]}`);
}

// Get available actions
const allActions = await db.select().from(actions);
console.log(`Found ${allActions.length} actions`);

// Add performer actions to scenes
let totalActions = 0;
for (const scene of sceneIds) {
  // Add 2-3 performers per scene
  const performersInScene = allPerformers.slice(0, 3);
  
  for (const performer of performersInScene) {
    // Add 2-4 random actions per performer
    const actionCount = 2 + Math.floor(Math.random() * 3);
    const selectedActions = allActions
      .sort(() => Math.random() - 0.5)
      .slice(0, actionCount);
    
    for (const action of selectedActions) {
      await db.insert(scenePerformerActions).values({
        sceneId: scene,
        performerId: performer.id,
        actionId: action.id,
      });
      totalActions++;
    }
  }
}

console.log(`Added ${totalActions} performer actions across ${sceneIds.length} scenes`);

// Now recalculate tournament scores
const { calculateTournamentScores } = await import('./server/db.ts');
await calculateTournamentScores(1); // Spring Showdown

console.log('✅ Sample scoring data added and scores recalculated!');
console.log('Check the tournament leaderboard to see updated scores.');

process.exit(0);
