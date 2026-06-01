/**
 * Wikipedia language-name fetcher
 *
 * Queries the Wikipedia langlinks API to find the vernacular name of a species
 * in a target language (e.g. French), based on either the Latin name or the
 * English common name.
 */

import fetch from 'node-fetch';

const API_BASE = 'https://en.wikipedia.org/w/api.php';

/**
 * Resolves a candidate name (latin or common) to a canonical Wikipedia page title.
 * Follows redirects via `&redirects=1`. Returns null if the page does not exist
 * or resolves to a disambiguation page.
 */
export async function resolveWikipediaTitle(name: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: name,
    redirects: '1',
    format: 'json',
  });

  const url = `${API_BASE}?${params}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'LivingPatchBot/1.0 (https://github.com/livingpatch)' },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as WikiQueryResponse;
    const pages = json?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0];

    // Missing page or disambiguation
    if (!page || page.missing !== undefined) return null;
    if (page.categories?.some(c => c.title.includes('disambiguation'))) return null;

    return page.title ?? null;
  } catch {
    return null;
  }
}

/**
 * Given a resolved Wikipedia page title and a BCP-47 language code, returns
 * the title of the corresponding article in that language (the vernacular name),
 * or null if no interlanguage link exists.
 */
export async function fetchLangLink(pageTitle: string, lang: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: pageTitle,
    prop: 'langlinks',
    lllang: lang,
    format: 'json',
  });

  const url = `${API_BASE}?${params}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'LivingPatchBot/1.0 (https://github.com/livingpatch)' },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as WikiLangLinksResponse;
    const pages = json?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0];
    const langlinks = page?.langlinks;
    if (!langlinks || langlinks.length === 0) return null;

    const raw = langlinks[0]['*'];
    if (!raw) return null;

    return normaliseName(raw);
  } catch {
    return null;
  }
}

/**
 * High-level helper: tries latin name first, then English common name, to
 * resolve a Wikipedia page and fetch the target-language vernacular name.
 * Returns the name string or null if nothing was found.
 */
export async function fetchLangName(
  latinName: string | null | undefined,
  enName: string,
  lang: string,
): Promise<string | null> {
  const candidates = [latinName, enName].filter((c): c is string => Boolean(c));

  for (const candidate of candidates) {
    const pageTitle = await resolveWikipediaTitle(candidate);
    if (!pageTitle) continue;

    const name = await fetchLangLink(pageTitle, lang);
    if (name) return name;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normaliseName(raw: string): string {
  // Replace underscores with spaces
  let name = raw.replace(/_/g, ' ').trim();

  // If entirely uppercase (unlikely but possible), convert to title case
  if (name === name.toUpperCase()) {
    name = name
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  return name;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface WikiPage {
  title?: string;
  missing?: '';
  categories?: Array<{ title: string }>;
  langlinks?: Array<{ lang: string; '*': string }>;
}

interface WikiQueryResponse {
  query?: {
    pages?: Record<string, WikiPage>;
  };
}

interface WikiLangLinksResponse {
  query?: {
    pages?: Record<string, WikiPage>;
  };
}
