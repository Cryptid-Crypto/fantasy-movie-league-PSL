import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { performers } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const performersData = [
  {
    name: 'Violet Myers',
    performerType: 'Rising Star',
    imageUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/LOhYCrgFQllbhbLW.png',
    bio: 'Curvy Latina performer known for her natural beauty and captivating performances.'
  },
  {
    name: 'Abella Danger',
    performerType: 'Legend',
    imageUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/JaOcaTTgCDfiOyGH.png',
    bio: 'Athletic powerhouse and industry legend with striking features and incredible energy.'
  },
  {
    name: 'Riley Reid',
    performerType: 'Legend',
    imageUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/ofHBETVBHZDeMhSS.png',
    bio: 'Petite performer and industry icon known for her girl-next-door charm and versatility.'
  },
  {
    name: 'Lana Rhoades',
    performerType: 'Legend',
    imageUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/oPHaypuKCvkojzun.png',
    bio: 'Stunning performer with piercing blue-green eyes and captivating presence.'
  },
  {
    name: 'Cherie DeVille',
    performerType: 'MILF',
    imageUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/ITpmlXgfjMrGPbKa.png',
    bio: 'Sophisticated blonde performer known for her elegance and experience.'
  }
];

console.log('Adding/updating performers...\n');

for (const performer of performersData) {
  try {
    // Check if performer exists
    const existing = await db.select().from(performers).where(eq(performers.name, performer.name));
    
    if (existing.length > 0) {
      // Update existing
      await db.update(performers)
        .set({ 
          imageUrl: performer.imageUrl,
          performerType: performer.performerType,
          bio: performer.bio
        })
        .where(eq(performers.name, performer.name));
      console.log(`✅ Updated: ${performer.name}`);
    } else {
      // Insert new
      await db.insert(performers).values(performer);
      console.log(`✅ Added: ${performer.name}`);
    }
  } catch (error) {
    console.error(`❌ Error with ${performer.name}:`, error.message);
  }
}

console.log('\n✅ All performers processed!');
await connection.end();
