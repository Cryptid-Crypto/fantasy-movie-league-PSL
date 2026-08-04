// fix-badges.mjs — Fix badge enum + assign traits to Abella Danger
import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// 1. Fix the enum to allow 'gameplay' category
console.log('1. Updating schema...');
await conn.query(
  "ALTER TABLE badges MODIFY COLUMN category ENUM('performer_type', 'country', 'gameplay') NOT NULL DEFAULT 'performer_type'"
);
console.log('   Schema updated');

// 2. Fix gameplay badge categories
console.log('2. Fixing gameplay badge categories...');
const [result] = await conn.query("UPDATE badges SET category = 'gameplay' WHERE id >= 10");
console.log('   Updated', result.affectedRows, 'badges');

// 3. Re-assign badges to Abella Danger
console.log('3. Assigning traits to Abella Danger...');
const [perf] = await conn.query("SELECT id FROM performers WHERE name = 'Abella Danger' LIMIT 1");
const pid = perf[0].id;

// Clear existing
await conn.query('DELETE FROM performerBadges WHERE performerId = ?', [pid]);

// Get badges
const [typeBadge] = await conn.query("SELECT id FROM badges WHERE name = 'Anal Queen' LIMIT 1");
const [gameBadges] = await conn.query(
  "SELECT id, name, icon FROM badges WHERE category = 'gameplay' ORDER BY id LIMIT 3"
);

const badgeIds = [typeBadge[0].id, ...gameBadges.map(b => b.id)];
for (let i = 0; i < badgeIds.length; i++) {
  await conn.query(
    'INSERT INTO performerBadges (performerId, badgeId, `order`) VALUES (?, ?, ?)',
    [pid, badgeIds[i], i]
  );
}

// 4. Show result
const [traits] = await conn.query(
  `SELECT b.name, b.icon, b.category, b.description
   FROM performerBadges pb
   JOIN badges b ON pb.badgeId = b.id
   WHERE pb.performerId = ?
   ORDER BY pb.\`order\``,
  [pid]
);

console.log('\n🎴 Abella Danger — NFT Card Traits:');
console.log('====================================');
traits.forEach((t, i) => {
  console.log(`  ${i+1}. ${t.icon}  ${t.name.padEnd(20)} [${t.category}]`);
});
console.log(`\n  Total: ${traits.length} traits → LEGENDARY tier`);

await conn.end();