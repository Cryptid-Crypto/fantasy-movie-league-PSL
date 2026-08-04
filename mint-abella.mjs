// mint-abella.mjs — Mint 1 Legendary NFT card for Abella Danger with traits
import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Get Abella Danger
const [perf] = await conn.query(
  "SELECT id, name, performerType, imageUrl FROM performers WHERE name = 'Abella Danger' LIMIT 1"
);
if (!perf[0]) { console.log('Abella not found'); process.exit(1); }
const p = perf[0];
console.log(`Performer: ${p.name} (${p.performerType})\n`);

// Get her badges
const [badges] = await conn.query(
  `SELECT b.name, b.icon, b.category, b.description
   FROM performerBadges pb JOIN badges b ON pb.badgeId = b.id
   WHERE pb.performerId = ? ORDER BY pb.\`order\``,
  [p.id]
);

console.log(`Traits (${badges.length}):`);
badges.forEach(b => console.log(`  ${b.icon} ${b.name} [${b.category}]`));

// Count existing cards for serial number
const [existing] = await conn.query(
  'SELECT MAX(serialNumber) as maxSerial FROM nftCards WHERE performerId = ?', [p.id]
);
const nextSerial = (existing[0].maxSerial || 0) + 1;

// Mint the card — Legendary rarity
const [result] = await conn.query(
  `INSERT INTO nftCards (performerId, ownerId, serialNumber, rarity, cardImageUrl, mintedAt, isLocked)
   VALUES (?, NULL, ?, 'Legendary', ?, NOW(), false)`,
  [p.id, nextSerial, p.imageUrl]
);

const cardId = result.insertId;

// Save traits as card metadata (store badge IDs as JSON-like concept)
// We'll use the performerBadges as the source of truth for now
console.log(`\n✅ Card minted!`);
console.log(`   Card ID: ${cardId}`);
console.log(`   Serial: #${String(nextSerial).padStart(3, '0')}`);
console.log(`   Rarity: LEGENDARY`);
console.log(`   Traits: ${badges.length} badges`);
console.log(`   Status: In treasury (unowned)`);
console.log(`   Image: ${p.imageUrl || 'None (needs generation)'}`);

// Show the card visually
console.log(`\n🎴 ╔══════════════════════════╗`);
console.log(`   ║  ABELLA DANGER          ║`);
console.log(`   ║  ${p.imageUrl ? '🖼️ Has image' : '📸 No image yet'}               ║`);
console.log(`   ║  #${String(nextSerial).padStart(3, '0')}  •  LEGENDARY      ║`);
console.log(`   ║  ═══════════════════════ ║`);
console.log(`   ║  TRAITS:                 ║`);
badges.forEach(b => {
  const line = `   ║  ${b.icon} ${b.name}`;
  console.log(line + ' '.repeat(Math.max(0, 28 - line.length)) + '║');
});
console.log(`   ╚══════════════════════════╝`);

await conn.end();