import { fetchWikipediaPage, extractImageLink, fetchFilePageAndExtractData } from './lib/wikipedia-scraper.ts';

console.log('🔍 Testing White Oak image extraction step by step\n');

console.log('Step 1: Fetch Quercus alba Wikipedia page');
const html = await fetchWikipediaPage('Quercus alba');
if (!html) {
  console.log('❌ Failed to fetch page');
  process.exit(1);
}
console.log(`✓ Fetched ${html.length} bytes\n`);

console.log('Step 2: Extract image link from infobox');
const imageLink = extractImageLink(html);
console.log(`Result: ${imageLink}\n`);

if (!imageLink) {
  console.log('❌ No image link found!');
  process.exit(1);
}

console.log('Step 3: Fetch file page and extract metadata');
const metadata = await fetchFilePageAndExtractData(imageLink);
console.log(`Result:`, metadata);

if (!metadata) {
  console.log('❌ Failed to extract metadata from file page');
} else {
  console.log('\n✓ Success!');
  console.log(`  URL: ${metadata.url}`);
  console.log(`  Author: ${metadata.author}`);
}
