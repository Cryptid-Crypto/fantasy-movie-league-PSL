import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { badges } from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const badgeData = [
  { name: 'Legend', iconUrl: '/badges/legend.png', description: 'Industry legend with iconic status' },
  { name: 'Anal Queen', iconUrl: '/badges/anal-queen.png', description: 'Specialist in anal performances' },
  { name: 'Super Slut', iconUrl: '/badges/super-slut.png', description: 'Versatile performer' },
  { name: 'Extreme', iconUrl: '/badges/extreme.png', description: 'Extreme and hardcore performances' },
  { name: 'Girl Next Door', iconUrl: '/badges/girl-next-door.png', description: 'Approachable and relatable' },
  { name: 'Rising Star', iconUrl: '/badges/rising-star.png', description: 'New talent on the rise' },
  { name: 'Hall of Fame', iconUrl: '/badges/hall-of-fame.png', description: 'Hall of Fame inductee' },
  { name: 'Specialist', iconUrl: '/badges/specialist.png', description: 'Specialized performer' },
  { name: 'MILF', iconUrl: '/badges/milf.png', description: 'Mature performer' },
];

console.log('Seeding badges...');

for (const badge of badgeData) {
  try {
    await db.insert(badges).values(badge).onDuplicateKeyUpdate({ set: { iconUrl: badge.iconUrl, description: badge.description } });
    console.log(`✓ ${badge.name}`);
  } catch (error) {
    console.error(`✗ ${badge.name}:`, error.message);
  }
}

console.log('Done!');
await connection.end();
