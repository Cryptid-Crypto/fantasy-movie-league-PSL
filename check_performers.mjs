import Database from 'better-sqlite3';
const db = new Database('./drizzle/db.sqlite');
const performers = db.prepare('SELECT name, performerType, country FROM performers WHERE name IN (?, ?, ?, ?, ?)').all('Violet Myers', 'Abella Danger', 'Riley Reid', 'Lana Rhoades', 'Cherie DeVille');
console.log(JSON.stringify(performers, null, 2));
db.close();
