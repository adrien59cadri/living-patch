import fetch from 'node-fetch';
import { load } from 'cheerio';

(async () => {
  try {
    const fileUrl = 'https://en.wikipedia.org/wiki/File:Bubo_virginianus_06.jpg';
    const resp = await fetch(fileUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await resp.text();
    const $ = load(html);
    
    console.log('Testing file page:', fileUrl);
    console.log('');
    
    // Find all tables
    console.log('Tables on page:');
    $('table').each((i, table) => {
      const classes = $(table).attr('class');
      const id = $(table).attr('id');
      console.log(`  [${i}] class="${classes}" id="${id}"`);
    });
    
    console.log('\nSearching for author info in full page:');
    // Look for any content with "author" or "creator" (case insensitive)
    const textContent = $.text();
    if (textContent.includes('Author') || textContent.includes('author')) {
      console.log('Found "Author" in page');
      // Get sections with author
      $('*').each((i, el) => {
        const text = $(el).text();
        if (text.includes('Author') && text.length < 200) {
          console.log(`  Element: ${el.name} - ${text.substring(0, 100)}`);
        }
      });
    }
    
    // Look for original upload info
    console.log('\nLooking for original file section:');
    const originalLink = $('a:contains("Original file")').first();
    if (originalLink.length) {
      console.log('Found "Original file" link');
    } else {
      console.log('No "Original file" link found');
    }
    
    // Look for permission text  
    console.log('\nSearching for image link patterns:');
    const links = $('a[href*="upload.wikimedia.org"]').slice(0, 5);
    links.each((i, link) => {
      console.log(`  ${i}: ${$(link).attr('href')?.substring(0, 100)}`);
    });
  } catch(e) {
    console.error('Error:', e.message);
  }
})();
