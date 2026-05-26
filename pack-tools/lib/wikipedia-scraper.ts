/**
 * Wikipedia image scraper
 * 
 * Scrapes Wikipedia pages to extract species images and metadata
 * from the infobox and associated file pages on Wikimedia Commons
 */

import fetch from 'node-fetch';
import { load } from 'cheerio';

interface ScrapedImage {
  url: string;
  author: string;
}

/**
 * Converts a species name to a Wikipedia page title
 * Handles URL encoding and spaces
 * For scientific names (e.g., "Quercus alba"), preserves original casing
 * For common names (e.g., "White Oak"), applies title case
 */
function speciesNameToWikiTitle(name: string): string {
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

/**
 * Fetches a Wikipedia page for a given species name
 * @param speciesName Common name or latin name
 * @returns HTML content or null if page not found
 */
export async function fetchWikipediaPage(speciesName: string): Promise<string | null> {
  try {
    const title = speciesNameToWikiTitle(speciesName);
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LivingPatchBot/1.0)',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching Wikipedia page for "${speciesName}":`, error);
    return null;
  }
}

/**
 * Extracts the file page link from a Wikipedia infobox
 * Looks for image links with /wiki/File: pattern
 * @param html Wikipedia page HTML
 * @returns File page link (e.g., "/wiki/File:Bubo_virginianus.jpg") or null
 */
export function extractImageLink(html: string): string | null {
  try {
    const $ = load(html);
    
    // Look for infobox biota table
    const infobox = $('table.infobox.biota');
    
    if (infobox.length === 0) {
      return null;
    }

    // Find all image links within the infobox
    const imageLinks = infobox.find('a[href*="/wiki/File:"]');
    
    if (imageLinks.length === 0) {
      return null;
    }

    // Get the href of the first image link
    const link = imageLinks.first().attr('href');
    
    return link || null;
  } catch (error) {
    console.error('Error extracting image link from HTML:', error);
    return null;
  }
}

/**
 * Fetches a Wikimedia file page and extracts image URL and author
 * @param fileLink File page link (e.g., "/wiki/File:Bubo_virginianus.jpg")
 * @returns Object with url and author, or null if unable to extract
 */
export async function fetchFilePageAndExtractData(fileLink: string): Promise<ScrapedImage | null> {
  try {
    const fileUrl = `https://en.wikipedia.org${fileLink}`;
    
    const response = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LivingPatchBot/1.0)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const $ = load(html);

    // Extract image URL from the file page
    // Look for the actual image in the file description page
    let imageUrl: string | null = null;
    
    // Primary approach: Look for the actual image on the page (the file itself)
    // This should be an img tag with src containing upload.wikimedia.org/wikipedia/commons
    const fileImages = $('img[src*="upload.wikimedia.org/wikipedia/commons"]');
    if (fileImages.length > 0) {
      const src = fileImages.first().attr('src');
      if (src) {
        imageUrl = src.startsWith('http') ? src : 'https:' + src;
      }
    }
    
    // Fallback: Try to find the original file link (some pages have this)
    if (!imageUrl) {
      const originalLink = $('a:contains("Original file")').first().attr('href');
      if (originalLink) {
        imageUrl = originalLink.startsWith('http') ? originalLink : `https:${originalLink}`;
      }
    }

    // Fallback: look for any link to upload.wikimedia.org
    if (!imageUrl) {
      const wikimediaLink = $('a[href*="upload.wikimedia.org"]').first().attr('href');
      if (wikimediaLink) {
        imageUrl = wikimediaLink.startsWith('http') ? wikimediaLink : `https:${wikimediaLink}`;
      }
    }

    // Extract author from file info template
    let author = 'Wikimedia Commons';
    
    // The file information is in a table with class fileinfotpl-type-information or similar
    // Structure: <td>Author</td><td>Name</td>
    
    // Approach 1: Look for "Author" text directly and get the next cells
    const allTables = $('table.fileinfotpl-type-information, table[class*="fileinfo"]');
    let found = false;
    
    allTables.find('tr').each((i, row) => {
      if (found) return false;
      const cells = $(row).find('th, td');
      let authorText = '';
      
      // Look for a cell containing "Author"
      cells.each((j, cell) => {
        const text = $(cell).text().trim();
        if (text === 'Author' || text === 'Creator') {
          // Get the next cell(s) for the actual author name
          if (j + 1 < cells.length) {
            authorText = $(cells[j + 1]).text().trim();
            // Clean up the text (remove "Picasa", links, etc)
            authorText = authorText
              .split('\n')[0] // Take first line
              .replace(/^\.mw-parser.*$/gm, '') // Remove CSS classes
              .replace(/Picasa.*$/, '') // Remove Picasa reference
              .replace(/based on copyright claims.*$/i, '') // Remove template text
              .replace(/\(based\s+on.*?\)/gi, '') // Remove parenthetical claims
              .replace(/\s+\(.*?(assumed|assumed.*based).*?\)/i, '') // Remove "assumed" text
              .replace(/assumed.*$/i, '') // Remove "assumed" suffix
              .replace(/\s+$/, '') // Remove trailing whitespace
              .trim();
            // Only keep first 100 chars to avoid truncation issues
            if (authorText.length > 100) {
              authorText = authorText.substring(0, 100).trim();
            }
          }
        }
      });
      
      if (authorText && authorText.length > 0 && authorText !== 'Author' && authorText !== 'Creator') {
        author = authorText;
        found = true;
        return false;
      }
    });
    
    // Approach 2: If still not found, try looking in the old-style fileinfotpl structure
    if (!found) {
      const aut = $('#fileinfotpl_aut').first();
      if (aut.length > 0) {
        const authorText = aut.text().trim();
        if (authorText && authorText !== 'Author' && authorText.length > 0) {
          author = authorText;
        }
      }
    }

    if (!imageUrl) {
      return null;
    }

    return {
      url: imageUrl,
      author,
    };
  } catch (error) {
    console.error(`Error fetching file page "${fileLink}":`, error);
    return null;
  }
}

/**
 * Main scraping function: orchestrates fetching Wikipedia page and extracting image data
 * Attempts latin name first, then falls back to common name
 * @param latinName Latin/scientific name of species
 * @param commonName Common name of species
 * @returns Object with url and author, or null if unable to extract
 */
export async function scrapeSpeciesImage(
  latinName: string | null | undefined,
  commonName: string,
): Promise<ScrapedImage | null> {
  // Build list of names to try, prioritizing scientific names
  const namesToTry: string[] = [];
  
  if (latinName && latinName.trim()) {
    namesToTry.push(latinName);
    
    // For "spp." (plural species) names, also try just the genus
    // e.g., "Solidago spp." → also try "Solidago"
    const sppMatch = latinName.match(/^(\w+)\s+spp\.?$/i);
    if (sppMatch) {
      namesToTry.push(sppMatch[1]); // Add genus name
    }
  }
  
  // Always try common name as fallback
  namesToTry.push(commonName);

  for (const name of namesToTry) {
    try {
      const pageHtml = await fetchWikipediaPage(name);
      
      if (!pageHtml) {
        continue;
      }

      const fileLink = extractImageLink(pageHtml);
      
      if (!fileLink) {
        continue;
      }

      const imageData = await fetchFilePageAndExtractData(fileLink);
      
      if (imageData) {
        return imageData;
      }
    } catch (error) {
      console.error(`Error scraping image for "${name}":`, error);
      continue;
    }
  }

  return null;
}
