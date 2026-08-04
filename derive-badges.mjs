// derive-badges.mjs — Assign badges based on real scene history
import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Get scene action history for a performer
async function getPerformerHistory(name) {
  const [rows] = await conn.query(
    `SELECT a.name as action_name, a.points, COUNT(*) as action_count,
            s.id as scene_id, m.title as movie_title, s.sceneNumber
     FROM performers p
     JOIN scenePerformerActions spa ON p.id = spa.performerId
     JOIN actions a ON spa.actionId = a.id
     JOIN scenes s ON spa.sceneId = s.id
     JOIN movies m ON s.movieId = m.id
     WHERE p.name = ?
     GROUP BY a.id, s.id
     ORDER BY s.id, a.points DESC`, [name]);
  return rows;
}

async function getPerformerStats(name) {
  const [stats] = await conn.query(
    `SELECT 
       COUNT(DISTINCT s.id) as total_scenes,
       COUNT(DISTINCT m.id) as total_movies,
       COUNT(*) as total_actions,
       COALESCE(SUM(a.points), 0) as total_points
     FROM performers p
     JOIN scenePerformerActions spa ON p.id = spa.performerId
     JOIN actions a ON spa.actionId = a.id
     JOIN scenes s ON spa.sceneId = s.id
     JOIN movies m ON s.movieId = m.id
     WHERE p.name = ?`, [name]);
  return stats[0];
}

// Derive badges from scene data (capped at rarity max)
function deriveBadges(history, stats, performerType, maxTraits = 5) {
  const badges = [];
  
  // 1. Performer type badge is always first
  badges.push(performerType);
  
  // Count action types
  const actionCounts = {};
  for (const row of history) {
    actionCounts[row.action_name] = (actionCounts[row.action_name] || 0) + row.action_count;
  }
  
  // Score each gameplay badge by relevance (higher = more relevant)
  const candidates = [];
  
  // Veteran: lots of total actions
  if (stats.total_actions >= 8) candidates.push({ name: 'Veteran', score: stats.total_actions });
  
  // Iron Stamina: many scenes
  if (stats.total_scenes >= 3) candidates.push({ name: 'Iron Stamina', score: stats.total_scenes * 10 });
  
  // Scene Stealer: appears in multiple scenes
  if (stats.total_scenes >= 2) candidates.push({ name: 'Scene Stealer', score: stats.total_scenes * 8 });
  
  // Fan Service: does high-point/fan-favorite actions
  const fanActions = ['Facial', 'Creampie', 'Squirting'];
  const fanCount = fanActions.reduce((s, a) => s + (actionCounts[a] || 0), 0);
  if (fanCount >= 1) candidates.push({ name: 'Fan Service', score: fanCount * 15 });
  
  // Clutch Performer: does high-point hard actions
  const hardActions = ['Double Penetration', 'Gangbang', 'Anal'];
  const hardCount = hardActions.reduce((s, a) => s + (actionCounts[a] || 0), 0);
  if (hardCount >= 1) candidates.push({ name: 'Clutch Performer', score: hardCount * 12 });
  
  // Showstopper: does the most extreme actions
  if (actionCounts['Gangbang'] >= 1 || actionCounts['Double Penetration'] >= 1)
    candidates.push({ name: 'Showstopper', score: (actionCounts['Gangbang'] || 0) * 20 + (actionCounts['Double Penetration'] || 0) * 15 });
  
  // Underdog: high efficiency (points per scene)
  if (stats.total_scenes >= 1 && stats.total_points > 0) {
    const efficiency = stats.total_points / stats.total_scenes;
    if (efficiency > 50) candidates.push({ name: 'Underdog', score: Math.floor(efficiency) });
  }
  
  // Crowd Favorite: many total points
  if (stats.total_points >= 150) candidates.push({ name: 'Crowd Favorite', score: stats.total_points });
  
  // Rookie: few scenes but recent (newcomer bonus)
  if (stats.total_scenes <= 2) candidates.push({ name: 'Rookie', score: 100 - stats.total_scenes * 10 });
  
  // Sort by score descending, take top N to fill remaining slots
  candidates.sort((a, b) => b.score - a.score);
  const slotsLeft = maxTraits - 1; // minus type badge
  for (const c of candidates.slice(0, slotsLeft)) {
    badges.push(c.name);
  }
  
  return badges;
}

// ---- MAIN ----
const perfName = 'Abella Danger';
const [perf] = await conn.query(
  "SELECT id, name, performerType FROM performers WHERE name = ? LIMIT 1", [perfName]);
if (!perf[0]) { console.log('Performer not found'); process.exit(1); }

const p = perf[0];
console.log(`Analyzing ${p.name} (${p.performerType})...\n`);

const history = await getPerformerHistory(p.name);
const stats = await getPerformerStats(p.name);

if (!stats || stats.total_scenes === 0) {
  console.log('No scene data found! Assigning only type badge.');
  const badges = [p.performerType];
  // assign and exit
  await assignBadges(p.id, badges);
  process.exit(0);
}

console.log(`Scene data: ${stats.total_scenes} scenes, ${stats.total_movies} movies, ${stats.total_actions} actions, ${stats.total_points} pts`);
console.log('Action breakdown:');
const actionCounts = {};
for (const row of history) actionCounts[row.action_name] = (actionCounts[row.action_name] || 0) + row.action_count;
for (const [action, count] of Object.entries(actionCounts).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${action}: ${count}x`);
}

const derivedBadges = deriveBadges(history, stats, p.performerType, 5);
console.log(`\nDerived badges (${derivedBadges.length}):`, derivedBadges);

// Assign to DB
await assignBadges(p.id, derivedBadges);

console.log('\nAssigned!');

async function assignBadges(performerId, badgeNames) {
  await conn.query('DELETE FROM performerBadges WHERE performerId = ?', [performerId]);
  
  const [badgeRows] = await conn.query('SELECT id, name FROM badges');
  const badgeMap = Object.fromEntries(badgeRows.map(b => [b.name, b.id]));
  
  let order = 0;
  for (const name of badgeNames) {
    const bid = badgeMap[name];
    if (!bid) { console.log(`  ⚠ Badge '${name}' not found, skipping`); continue; }
    await conn.query(
      'INSERT INTO performerBadges (performerId, badgeId, `order`) VALUES (?, ?, ?)',
      [performerId, bid, order++]
    );
  }
  
  // Show result
  const [final] = await conn.query(
    `SELECT b.name, b.icon, b.category, b.description
     FROM performerBadges pb JOIN badges b ON pb.badgeId = b.id
     WHERE pb.performerId = ? ORDER BY pb.\`order\``,
    [performerId]
  );
  console.log('\nFinal traits:');
  final.forEach(t => console.log(`  ${t.icon} ${t.name.padEnd(20)} [${t.category}]`));
  console.log(`\nRarity: ${final.length === 1 ? 'COMMON' : final.length === 2 ? 'RARE' : final.length === 3 ? 'EPIC' : final.length >= 5 ? 'LEGENDARY' : 'RARE'}`);
}

await conn.end();