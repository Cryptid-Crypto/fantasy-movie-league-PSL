// seed-badges-and-example.mjs
// Seeds badges table and assigns multiple badges to Abella Danger as an example
import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ---- STEP 1: Create badges ----
const badgeData = [
  // Performer Type Badges
  { name: 'Legend',           category: 'performer_type', icon: '👑',  description: 'Industry legend with iconic status' },
  { name: 'Anal Queen',       category: 'performer_type', icon: '🍑',  description: 'Master of anal performances' },
  { name: 'Super Slut',       category: 'performer_type', icon: '🔥',  description: 'Versatile and prolific performer' },
  { name: 'Extreme',          category: 'performer_type', icon: '💀',  description: 'Pushes the limits of extreme content' },
  { name: 'Girl Next Door',   category: 'performer_type', icon: '🌸',  description: 'Natural, relatable girl-next-door vibe' },
  { name: 'Rising Star',      category: 'performer_type', icon: '⭐',  description: 'New talent on the rise' },
  { name: 'Hall of Fame',     category: 'performer_type', icon: '🏆',  description: 'Hall of Fame inductee' },
  { name: 'Specialist',       category: 'performer_type', icon: '🎯',  description: 'Specialized performer' },
  { name: 'MILF',             category: 'performer_type', icon: '💋',  description: 'Experienced, mature performer' },
  
  // Gameplay Trait Badges
  { name: 'Scene Stealer',    category: 'gameplay', icon: '🎬',  description: '2x points for scene-leading actions' },
  { name: 'Crowd Favorite',   category: 'gameplay', icon: '📣',  description: 'Bonus +10 when tournament has 10+ players' },
  { name: 'Clutch Performer', category: 'gameplay', icon: '🎪',  description: '3x points in final week of tournament' },
  { name: 'Iron Stamina',     category: 'gameplay', icon: '⚡',  description: 'No fatigue penalty across scenes' },
  { name: 'Fan Service',      category: 'gameplay', icon: '💝',  description: 'Bonus points for crowd-requested actions' },
  { name: 'Veteran',          category: 'gameplay', icon: '🎖️',  description: '+5 points per scene performed' },
  { name: 'Rookie',           category: 'gameplay', icon: '🌱',  description: 'Bonus points in first 3 tournaments' },
  { name: 'Bilingual',        category: 'gameplay', icon: '🗣️',  description: 'No region lock penalty' },
  { name: 'Versatile',        category: 'gameplay', icon: '🔄',  description: 'Extra roster slot in tournament' },
  { name: 'Showstopper',      category: 'gameplay', icon: '💥',  description: '1.5x points for finishing moves' },
  { name: 'Underdog',         category: 'gameplay', icon: '🐶',  description: '2x points when ranked below top 5' },
];

console.log('Creating badges...');
for (const b of badgeData) {
  await conn.query(
    'INSERT IGNORE INTO badges (name, category, icon, description) VALUES (?, ?, ?, ?)',
    [b.name, b.category, b.icon, b.description]
  );
}
const [count] = await conn.query('SELECT COUNT(*) as c FROM badges');
console.log(`Badges created: ${count[0].c}`);

// ---- STEP 2: Assign badges to Abella Danger ----
const [perf] = await conn.query(
  "SELECT id, name, performerType FROM performers WHERE name = 'Abella Danger' LIMIT 1"
);
if (perf.length === 0) {
  console.log('Abella Danger not found!');
  process.exit(1);
}

const p = perf[0];
console.log(`\nPerformer: ${p.name} (${p.performerType})`);

// Get her type badge
const [typeBadge] = await conn.query('SELECT id, name FROM badges WHERE name = ?', [p.performerType]);
const typeBadgeId = typeBadge[0]?.id;

// Get 3 random gameplay badges (TiDB-compatible: use LIMIT with random ordering)
const [gameBadges] = await conn.query(
  "SELECT id, name, icon FROM badges WHERE category = 'gameplay' ORDER BY id LIMIT 3"
);

const badgeIds = [];
if (typeBadgeId) badgeIds.push({ id: typeBadgeId, source: 'type' });
gameBadges.forEach(b => badgeIds.push({ id: b.id, source: 'random' }));

// Assign badges
for (let i = 0; i < badgeIds.length; i++) {
  await conn.query(
    'INSERT IGNORE INTO performerBadges (performerId, badgeId, `order`) VALUES (?, ?, ?)',
    [p.id, badgeIds[i].id, i]
  );
}

// ---- STEP 3: Show results ----
const [assigned] = await conn.query(
  `SELECT b.name, b.icon, b.category, b.description
   FROM performerBadges pb
   JOIN badges b ON pb.badgeId = b.id
   WHERE pb.performerId = ?
   ORDER BY pb.\`order\``,
  [p.id]
);

console.log('\n🎴 Abella Danger — NFT Card Traits:');
console.log('==================================');
assigned.forEach((b, i) => {
  console.log(`  ${b.icon}  ${b.name.padEnd(20)} [${b.category}] — ${b.description}`);
});
console.log(`\nTotal traits: ${assigned.length}`);

// Show trait breakdown by rarity
console.log('\n📊 Rarity Tier Mapping:');
console.log('  Common  (1 trait):  Any 1 badge from the pool');
console.log('  Rare    (2 traits): 2 badges, including performer type');
console.log('  Epic    (3 traits): type badge + 2 gameplay badges');
console.log('  Legendary (5 traits): type badge + 4 gameplay badges');

// This performer with 4 traits would be Legendary tier
console.log(`\n  → This card qualifies as: LEGENDARY (${assigned.length} traits)`);

await conn.end();