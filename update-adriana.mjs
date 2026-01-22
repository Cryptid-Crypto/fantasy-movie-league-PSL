import Database from 'better-sqlite3';

const db = new Database('./drizzle/db.sqlite');

const newImageUrl = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/nlFklsggNePiWxXV.png';

const result = db.prepare(`
  UPDATE performers 
  SET imageUrl = ? 
  WHERE name = 'Adriana Chechik'
`).run(newImageUrl);

console.log('Updated Adriana Chechik image URL:', result.changes, 'row(s) affected');

// Verify the update
const performer = db.prepare('SELECT name, imageUrl FROM performers WHERE name = ?').get('Adriana Chechik');
console.log('Verified:', performer);

db.close();
