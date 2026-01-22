import fs from 'fs';

// Read URL files
const batch3Urls = fs.readFileSync('/home/ubuntu/fantasy-movie-league/batch3-clean-skin-urls.txt', 'utf8').trim().split('\n');
const batch4Urls = fs.readFileSync('/home/ubuntu/fantasy-movie-league/batch4-clean-skin-urls.txt', 'utf8').trim().split('\n');
const batch5Urls = fs.readFileSync('/home/ubuntu/fantasy-movie-league/batch5-clean-skin-urls.txt', 'utf8').trim().split('\n');
const batch6Urls = fs.readFileSync('/home/ubuntu/fantasy-movie-league/batch6-clean-skin-urls.txt', 'utf8').trim().split('\n');

// Batch 3 performers (41-60) - alphabetically sorted filenames
const batch3 = [
  { slug: 'haley-reed', url: batch3Urls.find(u => u.includes('haley-reed')) },
  { slug: 'ivy-lebelle', url: batch3Urls.find(u => u.includes('ivy-lebelle')) },
  { slug: 'jada-stevens', url: batch3Urls.find(u => u.includes('jada-stevens')) },
  { slug: 'jia-lissa', url: batch3Urls.find(u => u.includes('jia-lissa')) },
  { slug: 'joanna-angel', url: batch3Urls.find(u => u.includes('joanna-angel')) },
  { slug: 'kali-roses', url: batch3Urls.find(u => u.includes('kali-roses')) },
  { slug: 'karlee-grey', url: batch3Urls.find(u => u.includes('karlee-grey')) },
  { slug: 'katrina-jade', url: batch3Urls.find(u => u.includes('katrina-jade')) },
  { slug: 'kayley-gunner', url: batch3Urls.find(u => u.includes('kayley-gunner')) },
  { slug: 'kendra-lust', url: batch3Urls.find(u => u.includes('kendra-lust')) },
  { slug: 'kendra-sunderland', url: batch3Urls.find(u => u.includes('kendra-sunderland')) },
  { slug: 'kenzie-anne', url: batch3Urls.find(u => u.includes('kenzie-anne')) },
  { slug: 'kenzie-reeves', url: batch3Urls.find(u => u.includes('kenzie-reeves')) },
  { slug: 'kenzie-taylor', url: batch3Urls.find(u => u.includes('kenzie-taylor')) },
  { slug: 'kira-noir', url: batch3Urls.find(u => u.includes('kira-noir')) },
  { slug: 'kylie-rocket', url: batch3Urls.find(u => u.includes('kylie-rocket')) },
  { slug: 'lacy-lennon', url: batch3Urls.find(u => u.includes('lacy-lennon')) },
  { slug: 'lana-rhoades', url: batch3Urls.find(u => u.includes('lana-rhoades')) },
  { slug: 'lena-paul', url: batch3Urls.find(u => u.includes('lena-paul')) },
  { slug: 'lexi-luna', url: batch3Urls.find(u => u.includes('lexi-luna')) }
];

// Batch 4 performers (61-80)
const batch4 = [
  { slug: 'little-caprice', url: batch4Urls.find(u => u.includes('little-caprice')) },
  { slug: 'luna-star', url: batch4Urls.find(u => u.includes('luna-star')) },
  { slug: 'lulu-chu', url: batch4Urls.find(u => u.includes('lulu-chu')) },
  { slug: 'maitland-ward', url: batch4Urls.find(u => u.includes('maitland-ward')) },
  { slug: 'mia-malkova', url: batch4Urls.find(u => u.includes('mia-malkova')) },
  { slug: 'mia-melano', url: batch4Urls.find(u => u.includes('mia-melano')) },
  { slug: 'molly-little', url: batch4Urls.find(u => u.includes('molly-little')) },
  { slug: 'nicole-aniston', url: batch4Urls.find(u => u.includes('nicole-aniston')) },
  { slug: 'payton-preslee', url: batch4Urls.find(u => u.includes('payton-preslee')) },
  { slug: 'phoenix-marie', url: batch4Urls.find(u => u.includes('phoenix-marie')) },
  { slug: 'piper-perri', url: batch4Urls.find(u => u.includes('piper-perri')) },
  { slug: 'rachel-starr', url: batch4Urls.find(u => u.includes('rachel-starr')) },
  { slug: 'riley-reid', url: batch4Urls.find(u => u.includes('riley-reid')) },
  { slug: 'riley-steele', url: batch4Urls.find(u => u.includes('riley-steele')) },
  { slug: 'ryan-reid', url: batch4Urls.find(u => u.includes('ryan-reid')) },
  { slug: 'savannah-bond', url: batch4Urls.find(u => u.includes('savannah-bond')) },
  { slug: 'scarlett-alexis', url: batch4Urls.find(u => u.includes('scarlett-alexis')) },
  { slug: 'scarlit-scandal', url: batch4Urls.find(u => u.includes('scarlit-scandal')) },
  { slug: 'skye-blue', url: batch4Urls.find(u => u.includes('skye-blue')) },
  { slug: 'sophia-leone', url: batch4Urls.find(u => u.includes('sophia-leone')) }
];

// Batch 5 performers (81-100)
const batch5 = [
  { slug: 'stella-cox', url: batch5Urls.find(u => u.includes('stella-cox')) },
  { slug: 'sweetie-fox', url: batch5Urls.find(u => u.includes('sweetie-fox')) },
  { slug: 'syren-de-mer', url: batch5Urls.find(u => u.includes('syren-de-mer')) },
  { slug: 'teanna-trump', url: batch5Urls.find(u => u.includes('teanna-trump')) },
  { slug: 'tori-black', url: batch5Urls.find(u => u.includes('tori-black')) },
  { slug: 'valentina-nappi', url: batch5Urls.find(u => u.includes('valentina-nappi')) },
  { slug: 'valerica-steele', url: batch5Urls.find(u => u.includes('valerica-steele')) },
  { slug: 'vanessa-sky', url: batch5Urls.find(u => u.includes('vanessa-sky')) },
  { slug: 'vanna-bardot', url: batch5Urls.find(u => u.includes('vanna-bardot')) },
  { slug: 'veronica-leal', url: batch5Urls.find(u => u.includes('veronica-leal')) },
  { slug: 'violet-myers', url: batch5Urls.find(u => u.includes('violet-myers')) },
  { slug: 'violet-starr', url: batch5Urls.find(u => u.includes('violet-starr')) },
  { slug: 'vixen-vogel', url: batch5Urls.find(u => u.includes('vixen-vogel')) },
  { slug: 'willow-ryder', url: batch5Urls.find(u => u.includes('willow-ryder')) },
  { slug: 'xxlayna-marie', url: batch5Urls.find(u => u.includes('xxlayna-marie')) },
  { slug: 'zoey-monroe', url: batch5Urls.find(u => u.includes('zoey-monroe')) },
  { slug: 'alexis-fawx', url: batch5Urls.find(u => u.includes('alexis-fawx')) },
  { slug: 'asa-akira', url: batch5Urls.find(u => u.includes('asa-akira')) },
  { slug: 'brandi-love', url: batch5Urls.find(u => u.includes('brandi-love')) },
  { slug: 'jessa-rhodes', url: batch5Urls.find(u => u.includes('jessa-rhodes')) }
];

// Batch 6 performers (101-102)
const batch6 = [
  { slug: 'kelsi-monroe', url: batch6Urls.find(u => u.includes('kelsi-monroe')) },
  { slug: 'romi-rain', url: batch6Urls.find(u => u.includes('romi-rain')) }
];

// Generate SQL
const allPerformers = [...batch3, ...batch4, ...batch5, ...batch6];
const sqlStatements = allPerformers.map(p => 
  `UPDATE performers SET imageUrl = '${p.url}' WHERE slug = '${p.slug}';`
).join('\n');

fs.writeFileSync('/home/ubuntu/fantasy-movie-league/update-batch3-6.sql', sqlStatements);
console.log('SQL file generated with', allPerformers.length, 'updates');
