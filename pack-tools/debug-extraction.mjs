import fetch from 'node-fetch';
import { load } from 'cheerio';

function speciesNameToWikiTitle(name) {
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/);
  
  // Check if it looks like a scientific name (two words, first capitalized, second lowercase)
  if (words.length === 2 && /^[A-Z]/.test(words[0]) && /^[a-z]/.test(words[1])) {
    // Preserve original casing for scientific names
    return words.join('_');
  }
  
  // Apply title case for common names
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('_');
}

async function fetchWikipediaPage(speciesName) {
  try {
    const title = speciesNameToWikiTitle(speciesName);
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LivingPatchBot/1.0)',
      },
    });

    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      console.log(`Response not OK: ${response.status}`);
      return null;
    }

    const text = await response.text();
    console.log(`Got text: ${text.length} bytes`);
    return text;
  } catch (error) {
    console.error(`Error fetching Wikipedia page:`, error);
    return null;
  }
}

function extractImageLink(html) {
  try {
    const $ = load(html);
    
    // Look for infobox biota table
    const infobox = $('table.infobox.biota');
    
    console.log(`Infobox found: ${infobox.length > 0}`);
    
    if (infobox.length === 0) {
      return null;
    }

    // Find all image links within the infobox
    const imageLinks = infobox.find('a[href*="/wiki/File:"]');
    
    console.log(`Image links found: ${imageLinks.length}`);
    imageLinks.each((i, el) => {
      const href = $(el).attr('href');
      console.log(`  [${i}] ${href}`);
    });
    
    if (imageLinks.length === 0) {
      return null;
    }

    // Get the href of the first image link
    const link = imageLinks.first().attr('href');
    
    return link || null;
  } catch (error) {
    console.error('Error extracting image link:', error.message);
    return null;
  }
}

async function fetchFilePageAndExtractData(fileLink) {
  try {
    const fileUrl = `https://en.wikipedia.org${fileLink}`;
    console.log(`Fetching file page: ${fileUrl}`);
    
    const response = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LivingPatchBot/1.0)',
      },
    });

    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = load(html);

    // Try multiple approaches for finding image URL
    // Approach 1: Look for the actual image in the file page
    let imageUrl = $('img.mw-file-element').attr('src');
    
    if (!imageUrl) {
      // Approach 2: Look for any img tag
      imageUrl = $('img').first().attr('src');
    }
    
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = 'https:' + imageUrl;
    }
    
    console.log(`Image URL found: ${imageUrl}`);

    // Try multiple approaches for finding author
    let author = 'Wikimedia Commons'; // default

    // Approach 1: Look for table.fileinfotpl-type-information
    const infoTable = $('table.fileinfotpl-type-information');
    if (infoTable.length > 0) {
      const rows = infoTable.find('tr');
      for (let i = 0; i < rows.length; i++) {
        const cells = $(rows[i]).find('td');
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim();
          if (label.match(/Author|Creator/i)) {
            author = $(cells[1]).text().trim();
            console.log(`Author from table: ${author}`);
            break;
          }
        }
      }
    }

    // Approach 2: Try ID-based lookups
    if (author === 'Wikimedia Commons') {
      const authorEl = $('#fileinfotpl_aut, #fileinfotpl_creator');
      if (authorEl.length > 0) {
        author = authorEl.text().trim();
        console.log(`Author from ID: ${author}`);
      }
    }

    // Clean up author text
    author = author
      .replace(/^\.mw-parser.*$/gm, '')
      .replace(/Picasa.*$/, '')
      .replace(/\(based\s+on.*?\)/gi, '')
      .replace(/assumed.*$/i, '')
      .trim()
      .substring(0, 100);

    return { url: imageUrl, author };
  } catch (error) {
    console.error(`Error fetching file page:`, error.message);
    return null;
  }
}

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

console.log('\nStep 3: Fetch file page and extract metadata');
const metadata = await fetchFilePageAndExtractData(imageLink);
console.log(`\nFinal result:`, metadata);

if (!metadata) {
  console.log('❌ Failed to extract metadata from file page');
} else {
  console.log('\n✓ Success!');
}
