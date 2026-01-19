import { storagePut } from './server/storage.js';
import { readFileSync } from 'fs';

const performers = [
  { name: 'veronica-leal', displayName: 'Veronica Leal' },
  { name: 'jane-wilde', displayName: 'Jane Wilde' },
  { name: 'nicole-kitt', displayName: 'Nicole Kitt' },
  { name: 'millie-morgan', displayName: 'Millie Morgan' },
  { name: 'chanel-camryn', displayName: 'Chanel Camryn' },
  { name: 'gal-ritchie', displayName: 'Gal Ritchie' }
];

const results = [];

for (const performer of performers) {
  console.log(`\nUploading ${performer.displayName}...`);
  
  // Upload portrait
  const portraitPath = `nft-assets/portraits/${performer.name}-portrait.png`;
  const portraitBuffer = readFileSync(portraitPath);
  const portraitResult = await storagePut(
    `performers/${performer.name}-portrait.png`,
    portraitBuffer,
    'image/png'
  );
  console.log(`✓ Portrait uploaded: ${portraitResult.url}`);
  
  // Upload card
  const cardPath = `nft-assets/cards/${performer.name}-card.png`;
  const cardBuffer = readFileSync(cardPath);
  const cardResult = await storagePut(
    `performers/${performer.name}-card.png`,
    cardBuffer,
    'image/png'
  );
  console.log(`✓ Card uploaded: ${cardResult.url}`);
  
  results.push({
    name: performer.displayName,
    portraitUrl: portraitResult.url,
    cardUrl: cardResult.url
  });
}

// Save results
import { writeFileSync } from 'fs';
writeFileSync('performer-update-results.json', JSON.stringify(results, null, 2));
console.log('\n✅ All uploads complete! Results saved to performer-update-results.json');
