import fs from 'fs';

// Map slugs to proper performer names (title case)
const slugToName = (slug) => {
  return slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Read the SQL file
const sql = fs.readFileSync('/home/ubuntu/fantasy-movie-league/batch3-6-updates.sql', 'utf8');

// Replace slug with name in WHERE clauses
const updatedSql = sql.replace(/WHERE slug = '([^']+)'/g, (match, slug) => {
  const name = slugToName(slug);
  return `WHERE name = '${name}'`;
});

fs.writeFileSync('/home/ubuntu/fantasy-movie-league/batch3-6-updates-fixed.sql', updatedSql);
console.log('SQL file converted - slugs replaced with names');
