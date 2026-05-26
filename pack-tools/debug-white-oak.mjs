import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const species = {
  latinName: 'Quercus alba',
  commonName: 'White Oak'
};

async function fetchAndAnalyze(name) {
  const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(name)}`;
  console.log(`\n📖 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LivingPatchBot/1.0)' }
    });
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}`);
      return;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Check page title
    const pageTitle = $('h1').first().text();
    console.log(`Title: ${pageTitle}`);
    
    // Check for disambiguation
    const isDisambig = html.includes('disambiguation') || $('.mw-parser-output > p').first().text().includes('may refer to');
    console.log(`Disambiguation page: ${isDisambig}`);
    
    // Look for infobox
    const infobox = $('table.infobox').first();
    console.log(`\nInfobox found: ${infobox.length > 0 ? 'YES' : 'NO'}`);
    
    if (infobox.length > 0) {
      console.log('Infobox classes:', infobox.attr('class'));
      
      // Try to find image
      const img = infobox.find('img').first();
      if (img.length > 0) {
        console.log(`\nImage src: ${img.attr('src')}`);
        console.log(`Image alt: ${img.attr('alt')}`);
      } else {
        console.log('\n❌ No image in infobox');
      }
      
      // Look for any images in the infobox
      console.log(`\nAll images in infobox: ${infobox.find('img').length}`);
      infobox.find('img').each((i, el) => {
        const src = $(el).attr('src');
        const alt = $(el).attr('alt');
        console.log(`  [${i}] src: ${src?.substring(0, 80)}`);
      });
    }
    
    // Look for File: links
    const fileLinks = [];
    $('a[href*="/wiki/File:"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) fileLinks.push(href);
    });
    console.log(`\nFile: links found: ${fileLinks.length}`);
    fileLinks.slice(0, 3).forEach(link => console.log(`  - ${link}`));
    
    // Check for any tables with "biota" class
    const biotaTables = $('table.biota');
    console.log(`\nTables with 'biota' class: ${biotaTables.length}`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

console.log('🔍 Debugging White Oak Wikipedia page');
await fetchAndAnalyze(species.latinName);
await fetchAndAnalyze(species.commonName);
