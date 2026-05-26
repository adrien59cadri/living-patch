import { scrapeSpeciesImage } from './lib/wikipedia-scraper.ts';

console.log('🔍 Testing scraper on White Oak');
const result = await scrapeSpeciesImage('Quercus alba', 'White Oak');
console.log('\nResult:', result);
