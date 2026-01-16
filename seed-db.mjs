import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('🌱 Starting database seeding...\n');

// Clear existing data (skip if tables don't exist yet)
console.log('Clearing existing data...');
try {
  await connection.query('DELETE FROM scene_performer_actions');
  await connection.query('DELETE FROM tournament_entries');
  await connection.query('DELETE FROM tournament_roster_requirements');
  await connection.query('DELETE FROM tournaments');
  await connection.query('DELETE FROM scenes');
  await connection.query('DELETE FROM movie_performers');
  await connection.query('DELETE FROM movies');
  await connection.query('DELETE FROM performers');
  await connection.query('DELETE FROM actions');
  await connection.query('DELETE FROM user_nfts');
} catch (error) {
  console.log('Note: Some tables may not exist yet, continuing...');
}

console.log('✅ Existing data cleared\n');

// Insert Action Types
console.log('Creating action types...');
const actionTypes = [
  { name: 'Solo Scene', points: 5 },
  { name: 'Boy/Girl', points: 10 },
  { name: 'Oral', points: 8 },
  { name: 'Facial', points: 12 },
  { name: 'Anal', points: 15 },
  { name: 'Double Penetration', points: 20 },
  { name: 'Gangbang', points: 25 },
  { name: 'Creampie', points: 15 },
  { name: 'Squirting', points: 18 },
  { name: 'BDSM', points: 14 },
];

const actionResults = [];
for (const action of actionTypes) {
  const result = await db.insert(schema.actions).values(action);
  actionResults.push({ ...action, id: Number(result[0].insertId) });
}
console.log(`✅ Created ${actionResults.length} action types\n`);

// Insert Performers
console.log('Creating performers...');
const performers = [
  {
    name: 'Mia Stellar',
    bio: 'Award-winning performer known for intense performances and versatility.',
    imageUrl: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=Mia+Stellar',
    nftContractAddress: '0x1234567890123456789012345678901234567890',
    performerType: 'Legend',
  },
  {
    name: 'Luna Rose',
    bio: 'Rising star with a passion for authentic performances.',
    imageUrl: 'https://via.placeholder.com/300x400/ef4444/ffffff?text=Luna+Rose',
    nftContractAddress: '0x2345678901234567890123456789012345678901',
    performerType: 'Rising Star',
  },
  {
    name: 'Scarlett Vixen',
    bio: 'Veteran performer with over 500 scenes to her credit.',
    imageUrl: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=Scarlett+Vixen',
    nftContractAddress: '0x3456789012345678901234567890123456789012',
    performerType: 'Hall of Fame',
  },
  {
    name: 'Jade Phoenix',
    bio: 'Exotic beauty specializing in high-energy performances.',
    performerType: 'Super Slut',
    imageUrl: 'https://via.placeholder.com/300x400/ef4444/ffffff?text=Jade+Phoenix',
    nftContractAddress: '0x4567890123456789012345678901234567890123',
  },
  {
    name: 'Amber Blaze',
    bio: 'Fiery redhead known for passionate scenes.',
    imageUrl: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=Amber+Blaze',
    nftContractAddress: '0x5678901234567890123456789012345678901234',
    performerType: 'Girl Next Door',
  },
  {
    name: 'Crystal Waters',
    bio: 'Blonde bombshell with a natural talent for performance.',
    imageUrl: 'https://via.placeholder.com/300x400/ef4444/ffffff?text=Crystal+Waters',
    nftContractAddress: '0x6789012345678901234567890123456789012345',
    performerType: 'Specialist',
  },
  {
    name: 'Raven Night',
    bio: 'Dark and mysterious performer with a cult following.',
    imageUrl: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=Raven+Night',
    nftContractAddress: '0x7890123456789012345678901234567890123456',
    performerType: 'Extreme',
  },
  {
    name: 'Diamond Luxe',
    bio: 'Glamorous performer known for high-production scenes.',
    imageUrl: 'https://via.placeholder.com/300x400/ef4444/ffffff?text=Diamond+Luxe',
    nftContractAddress: '0x8901234567890123456789012345678901234567',
    performerType: 'Legend',
  },
  {
    name: 'Ivy Valentine',
    bio: 'Petite performer with incredible flexibility and stamina.',
    imageUrl: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=Ivy+Valentine',
    nftContractAddress: '0x9012345678901234567890123456789012345678',
    performerType: 'Anal Queen',
  },
  {
    name: 'Ruby Passion',
    bio: 'Latina sensation bringing heat to every scene.',
    imageUrl: 'https://via.placeholder.com/300x400/ef4444/ffffff?text=Ruby+Passion',
    nftContractAddress: '0x0123456789012345678901234567890123456789',
    performerType: 'Rising Star',
  },
];

const performerResults = [];
for (const performer of performers) {
  const result = await db.insert(schema.performers).values(performer);
  performerResults.push({ ...performer, id: Number(result[0].insertId) });
}
console.log(`✅ Created ${performerResults.length} performers\n`);

// Insert Movies
console.log('Creating movies...');
const movies = [
  {
    title: 'Fantasy Island XXX',
    releaseDate: new Date('2024-01-15'),
    description: 'A tropical adventure with stunning performers.',
  },
  {
    title: 'Midnight Desires',
    releaseDate: new Date('2024-02-20'),
    description: 'Late-night encounters in the city.',
  },
  {
    title: 'Passion Protocol',
    releaseDate: new Date('2024-03-10'),
    description: 'High-tech meets high-heat in this futuristic feature.',
  },
  {
    title: 'Desert Heat',
    releaseDate: new Date('2024-04-05'),
    description: 'Scorching scenes under the desert sun.',
  },
  {
    title: 'Ocean of Pleasure',
    releaseDate: new Date('2024-05-12'),
    description: 'Beachside romance and passion.',
  },
  {
    title: 'Neon Nights',
    releaseDate: new Date('2024-06-18'),
    description: 'Urban nightlife and steamy encounters.',
  },
  {
    title: 'Mountain Escape',
    releaseDate: new Date('2024-07-22'),
    description: 'Cozy cabin scenes in the mountains.',
  },
];

const movieResults = [];
for (const movie of movies) {
  const result = await db.insert(schema.movies).values(movie);
  movieResults.push({ ...movie, id: Number(result[0].insertId) });
}
console.log(`✅ Created ${movieResults.length} movies\n`);

// Insert Movie-Performer Relationships
console.log('Creating movie-performer relationships...');
const moviePerformerData = [];
for (const movie of movieResults) {
  // Assign 3-5 random performers to each movie
  const numPerformers = Math.floor(Math.random() * 3) + 3;
  const selectedPerformers = performerResults
    .sort(() => 0.5 - Math.random())
    .slice(0, numPerformers);
  
  for (const performer of selectedPerformers) {
    moviePerformerData.push({
      movieId: movie.id,
      performerId: performer.id,
    });
  }
}

for (const mp of moviePerformerData) {
  await db.insert(schema.moviePerformers).values(mp);
}
console.log(`✅ Created ${moviePerformerData.length} movie-performer relationships\n`);

// Insert Scenes
console.log('Creating scenes...');
const sceneData = [];
for (let i = 0; i < movieResults.length; i++) {
  const movie = movieResults[i];
  const numScenes = Math.floor(Math.random() * 3) + 3; // 3-5 scenes per movie
  
  for (let j = 0; j < numScenes; j++) {
    sceneData.push({
      movieId: movie.id,
      sceneNumber: j + 1,
      title: `Scene ${j + 1}`,
      duration: Math.floor(Math.random() * 20) + 15, // 15-35 minutes
    });
  }
}

const sceneResults = [];
for (const scene of sceneData) {
  const result = await db.insert(schema.scenes).values(scene);
  sceneResults.push({ ...scene, id: Number(result[0].insertId) });
}
console.log(`✅ Created ${sceneResults.length} scenes\n`);

// Insert Scene Performer Actions
console.log('Creating scene performer actions...');
const actionData = [];
for (const scene of sceneResults) {
  // Get the movie for this scene
  const movie = movieResults.find(m => m.id === scene.movieId);
  if (!movie) continue;
  
  // Get performers assigned to this movie
  const moviePerformersForScene = moviePerformerData
    .filter(mp => mp.movieId === movie.id)
    .map(mp => performerResults.find(p => p.id === mp.performerId))
    .filter(Boolean);
  
  if (moviePerformersForScene.length === 0) continue;
  
  const numPerformers = Math.min(
    Math.floor(Math.random() * 2) + 1,
    moviePerformersForScene.length
  ); // 1-2 performers per scene from movie's cast
  const selectedPerformers = moviePerformersForScene
    .sort(() => 0.5 - Math.random())
    .slice(0, numPerformers);
  
  for (const performer of selectedPerformers) {
    const numActions = Math.floor(Math.random() * 3) + 2; // 2-4 actions per performer
    const selectedActions = actionResults
      .sort(() => 0.5 - Math.random())
      .slice(0, numActions);
    
    for (const action of selectedActions) {
      actionData.push({
        sceneId: scene.id,
        performerId: performer.id,
        actionId: action.id,
      });
    }
  }
}

for (const action of actionData) {
  await db.insert(schema.scenePerformerActions).values(action);
}
console.log(`✅ Created ${actionData.length} scene performer actions\n`);

// Insert Tournaments
console.log('Creating tournaments...');
const now = new Date();
const tournaments = [
  {
    name: 'January Championship',
    description: 'Compete with your favorite performers from January releases!',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    status: 'completed',
    requiredNftContract: performerResults[0].nftContractAddress,
  },
  {
    name: 'Spring Showdown',
    description: 'The hottest tournament of the spring season.',
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    status: 'active',
    requiredNftContract: performerResults[1].nftContractAddress,
  },
  {
    name: 'Summer Heat Challenge',
    description: 'Coming soon! Get ready for the biggest tournament yet.',
    startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0),
    status: 'upcoming',
    requiredNftContract: performerResults[2].nftContractAddress,
  },
];

const tournamentResults = [];
for (const tournament of tournaments) {
  const result = await db.insert(schema.tournaments).values(tournament);
  tournamentResults.push({ ...tournament, id: Number(result[0].insertId) });
}
console.log(`✅ Created ${tournamentResults.length} tournaments\n`);

// Insert Tournament Roster Requirements
console.log('Creating tournament roster requirements...');
const rosterRequirements = [
  // January Championship: 2 Legends, 1 Anal Queen, 2 Any Type
  { tournamentId: tournamentResults[0].id, performerType: 'Legend', requiredCount: 2 },
  { tournamentId: tournamentResults[0].id, performerType: 'Anal Queen', requiredCount: 1 },
  { tournamentId: tournamentResults[0].id, performerType: null, requiredCount: 2 }, // Any Type
  
  // Spring Showdown: 1 Super Slut, 1 Extreme, 3 Any Type
  { tournamentId: tournamentResults[1].id, performerType: 'Super Slut', requiredCount: 1 },
  { tournamentId: tournamentResults[1].id, performerType: 'Extreme', requiredCount: 1 },
  { tournamentId: tournamentResults[1].id, performerType: null, requiredCount: 3 },
  
  // Summer Heat Challenge: 1 Hall of Fame, 2 Rising Star, 2 Any Type
  { tournamentId: tournamentResults[2].id, performerType: 'Hall of Fame', requiredCount: 1 },
  { tournamentId: tournamentResults[2].id, performerType: 'Rising Star', requiredCount: 2 },
  { tournamentId: tournamentResults[2].id, performerType: null, requiredCount: 2 },
];

for (const requirement of rosterRequirements) {
  await db.insert(schema.tournamentRosterRequirements).values(requirement);
}
console.log(`✅ Created ${rosterRequirements.length} roster requirements\n`);

await connection.end();

console.log('🎉 Database seeding completed successfully!\n');
console.log('Summary:');
console.log(`  - ${actionResults.length} action types`);
console.log(`  - ${performerResults.length} performers`);
console.log(`  - ${movieResults.length} movies`);
console.log(`  - ${moviePerformerData.length} movie-performer relationships`);
console.log(`  - ${sceneResults.length} scenes`);
console.log(`  - ${actionData.length} performer actions`);
console.log(`  - ${tournamentResults.length} tournaments`);
console.log('\n✨ Your platform is now populated with sample data!');
