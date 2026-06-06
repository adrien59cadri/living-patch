/**
 * Wikipedia image scraper
 * 
 * Scrapes Wikipedia pages to extract species images and metadata
 * from the infobox and associated file pages on Wikimedia Commons
 */

import { load } from 'cheerio';

interface ScrapedImage {
  url: string;
  author: string;
  source_url?: string;
}

type ConservationStatus = 'EX' | 'EW' | 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD';

const IUCN_TEXT_MAP: Record<string, ConservationStatus> = {
  'extinct': 'EX',
  'ex': 'EX',
  'extinct in the wild': 'EW',
  'ew': 'EW',
  'critically endangered': 'CR',
  'cr': 'CR',
  'endangered': 'EN',
  'en': 'EN',
  'vulnerable': 'VU',
  'vu': 'VU',
  'near threatened': 'NT',
  'nt': 'NT',
  'least concern': 'LC',
  'lc': 'LC',
  'data deficient': 'DD',
  'dd': 'DD',
};

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

    // Wikimedia placeholder strings that mean "no author recorded"
    const AUTHOR_PLACEHOLDERS = [
      'this file is lacking author information',
      'unknown',
      'unbekannt',
      'inconnu',
      'desconocido',
      'photographer',
    ];
    const isPlaceholder = (text: string) =>
      AUTHOR_PLACEHOLDERS.some(p => text.toLowerCase().startsWith(p));

    // Extracts and cleans raw cell text into a usable attribution string
    const cleanCellText = (raw: string): string => {
      let t = raw
        .split('\n')[0]
        // Strip Wikimedia's "no machine-readable author" prefix, keeping the username after it
        .replace(/^No machine-readable author provided\.\s*/i, '')
        .replace(/^\.mw-parser.*$/gm, '')
        .replace(/Picasa.*$/, '')
        .replace(/based on copyright claims.*$/i, '')
        .replace(/\(based\s+on.*?\)/gi, '')
        .replace(/\s+\(.*?(assumed|assumed.*based).*?\)/i, '')
        .replace(/assumed.*$/i, '')
        .trim();
      if (t.length > 100) t = t.substring(0, 100).trim();
      return t;
    };

    // The file information is in a table with class fileinfotpl-type-information or similar
    // Structure: <td>Author</td><td>Name</td>

    // Approach 1: Look for "Author" / "Source" rows in the file info table.
    // We collect both so we can fall back to Source when Author is a placeholder.
    const allTables = $('table.fileinfotpl-type-information, table[class*="fileinfo"]');
    let found = false;
    let sourceText = '';

    allTables.find('tr').each((i, row) => {
      const cells = $(row).find('th, td');

      cells.each((j, cell) => {
        const label = $(cell).text().trim();
        if (j + 1 >= cells.length) return;
        const value = cleanCellText($(cells[j + 1]).text().trim());

        if ((label === 'Author' || label === 'Creator') && !found) {
          if (value && value !== 'Author' && value !== 'Creator' && !isPlaceholder(value)) {
            author = value;
            found = true;
          }
        } else if (label === 'Source' && !sourceText) {
          if (value && !isPlaceholder(value)) {
            sourceText = value;
          }
        }
      });
    });

    // Fall back to Source field when Author was missing or a placeholder
    if (!found && sourceText) {
      author = sourceText;
    }

    // Approach 2: If still not found, try looking in the old-style fileinfotpl structure
    if (!found && author === 'Wikimedia Commons') {
      const aut = $('#fileinfotpl_aut').first();
      if (aut.length > 0) {
        const authorText = aut.text().trim();
        if (authorText && authorText !== 'Author' && authorText.length > 0 && !isPlaceholder(authorText)) {
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
 * Extracts IUCN conservation status code from a Wikipedia species page.
 * Returns the shorthand code (e.g. 'LC', 'CR') or null if not found.
 * Idempotent: passing an already-valid code returns it unchanged.
 */
export function extractConservationStatus(html: string): ConservationStatus | null {
  try {
    const $ = load(html);
    const infobox = $('table.infobox.biota, table.infobox-biota, table.infobox');

    // Approach 1 (primary): IUCN status SVG badge image in the infobox.
    // Wikipedia renders status as <img alt="Least Concern" src="...Status_iucn3.1_LC.svg...">
    // Extract the 2-letter code from the SVG filename — most reliable signal.
    const iucnImg = infobox.find('img[src*="Status_iucn3.1_"]').first();
    if (iucnImg.length > 0) {
      const src = iucnImg.attr('src') ?? '';
      const srcMatch = src.match(/Status_iucn3\.1_([A-Z]+)\.svg/i);
      if (srcMatch) {
        const code = srcMatch[1].toUpperCase();
        if (code in IUCN_TEXT_MAP) return IUCN_TEXT_MAP[code.toLowerCase()];
      }
      // Fallback within approach 1: map full alt text (e.g., "Least Concern" → LC)
      const alt = iucnImg.attr('alt') ?? '';
      if (IUCN_TEXT_MAP[alt.toLowerCase()]) return IUCN_TEXT_MAP[alt.toLowerCase()];
    }

    // Approach 2: any infobox img whose alt is a full IUCN status label
    const altImg = infobox.find('img[alt]').filter((_: number, el: any) => {
      return Boolean(IUCN_TEXT_MAP[($(el).attr('alt') ?? '').toLowerCase()]);
    });
    if (altImg.length > 0) {
      const alt = altImg.first().attr('alt') ?? '';
      return IUCN_TEXT_MAP[alt.toLowerCase()] ?? null;
    }

    // Approach 3: find "Conservation status" header row then read the NEXT row's text.
    // Wikipedia puts the label and the badge in separate <tr> elements.
    const rows = infobox.find('tr').toArray();
    for (let i = 0; i < rows.length - 1; i++) {
      if (!$(rows[i]).text().toLowerCase().includes('conservation status')) continue;
      // Check the next 1-2 rows for a recognisable status string
      for (let j = i + 1; j < Math.min(i + 3, rows.length); j++) {
        const text = $(rows[j]).text().trim();
        // Exact match first
        if (IUCN_TEXT_MAP[text.toLowerCase()]) return IUCN_TEXT_MAP[text.toLowerCase()];
        // Prefix match for "Least Concern (IUCN 3.1)..." style text
        for (const [key, code] of Object.entries(IUCN_TEXT_MAP)) {
          if (text.toLowerCase().startsWith(key)) return code;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting conservation status:', error);
    return null;
  }
}

/**
 * Fetches and returns the IUCN conservation status for a species.
 * Tries latin name first, then common name, same as scrapeSpeciesImage.
 */
export async function scrapeConservationStatus(
  latinName: string | null | undefined,
  commonName: string,
): Promise<ConservationStatus | null> {
  const namesToTry: string[] = [];
  if (latinName?.trim()) {
    namesToTry.push(latinName);
    const sppMatch = latinName.match(/^(\w+)\s+spp\.?$/i);
    if (sppMatch) namesToTry.push(sppMatch[1]);
  }
  namesToTry.push(commonName);

  for (const name of namesToTry) {
    try {
      const pageHtml = await fetchWikipediaPage(name);
      if (!pageHtml) continue;
      const status = extractConservationStatus(pageHtml);
      if (status) return status;
    } catch (error) {
      console.error(`Error scraping conservation status for "${name}":`, error);
    }
  }
  return null;
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
        const title = speciesNameToWikiTitle(name);
        imageData.source_url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
        return imageData;
      }
    } catch (error) {
      console.error(`Error scraping image for "${name}":`, error);
      continue;
    }
  }

  return null;
}
