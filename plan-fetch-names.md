# Plan: `fetch-names` CLI — Wikipedia Language Name Fetcher

Companion to `fetch-images`. Queries the Wikipedia language-links API to find the
vernacular name used by another language's Wikipedia edition (e.g. French), and
writes it into `common_name` as an additional language key.

---

## How it works

Wikipedia exposes a simple JSON API for cross-language article titles:

```
GET https://en.wikipedia.org/w/api.php
  ?action=query
  &titles=Erithacus_rubecula    ← resolved from latin name
  &prop=langlinks
  &lllang=fr                    ← target language
  &format=json
```

Response (condensed):
```json
{
  "query": {
    "pages": {
      "12345": {
        "langlinks": [{ "lang": "fr", "*": "Rougegorge familier" }]
      }
    }
  }
}
```

The `"*"` value is the **title of the French Wikipedia article** — which is the
vernacular name used in that language. No HTML scraping required.

---

## New files

### `pack-tools/cli/fetch-names.ts`

Mirrors `fetch-images.ts` in structure:

```
Usage: npm run fetch-names <pack-file> --lang <code> [options]
Example: npm run fetch-names packs/1-france.json --lang fr
Example: npm run fetch-names packs/0-base.json --lang fr --only-missing

Options:
  --lang <code>       BCP-47 language code to fetch (required, e.g. fr, de, es)
  --only-missing      Skip species that already have the target lang key
  --delay <ms>        Delay between API requests (default: 500)
  --max <count>       Limit number of species processed (for testing)
```

**Main loop** (per species):

1. Skip taxonomic groups (no `latin_name` and has `taxonomic_group`).
2. Skip if `--only-missing` and `common_name[lang]` already set.
3. Call `fetchLangName(latin_name, enName, lang)` from new lib.
4. If result found:
   - If `common_name` is a plain `string`: convert to `{ en: string, [lang]: result }`.
   - If `common_name` is already an object: add/overwrite `[lang]` key.
5. Log progress identical to `fetch-images` style.
6. After loop: validate pack with `validatePackSafe`, write back to file.

### `pack-tools/lib/wikipedia-names.ts`

```typescript
/**
 * Resolves the Wikipedia page title for a species (via latin name, then EN name)
 * and fetches the article title in the requested language via the langlinks API.
 */
export async function fetchLangName(
  latinName: string | null | undefined,
  enName: string,
  lang: string,
): Promise<string | null>
```

**Implementation steps inside `fetchLangName`**:

1. Build a candidate list: `[latinName, enName]` (skip empty/null).
2. For each candidate, call `resolveWikipediaTitle(candidate)` → `string | null`.
   - `GET /w/api.php?action=query&titles=<encoded>&redirects=1&format=json`
   - Extracts the canonical page title from the response; returns `null` on miss or
     disambiguation.
3. For the first resolved title, call `fetchLangLink(pageTitle, lang)`:
   - `GET /w/api.php?action=query&titles=<title>&prop=langlinks&lllang=<lang>&format=json`
   - Returns `langlinks[0]["*"]` or `null`.
4. Normalise the result: decode underscores → spaces, title-case if all-caps.
5. Return the name string, or `null` if nothing found.

---

## `package.json` addition

```json
"fetch-names": "node --loader ts-node/esm cli/fetch-names.ts"
```

---

## Output example

```
🔍 Fetching French names from Wikipedia...
Pack: france-base (v1.0.0)
Language: fr  |  Request delay: 500ms

[1/24] European Robin          → FR: Rougegorge familier  ✓
[2/24] Great Tit               → FR: Mésange charbonnière ✓
[3/24] Pedunculate Oak         → FR: Chêne pédonculé      ✓
[4/24] Common Earthworm        ✗ No French article found
...

Summary:
✓ Names fetched:   21/24
✗ Not found:        3/24
⊘ Skipped:          0/24

✓ Pack updated: packs/1-france.json
  21 French names written to common_name.fr
```

---

## Edge cases

| Case | Behaviour |
|------|-----------|
| No latin name + no EN name | Skip, log `⊘ Skipped (no names)` |
| Wikipedia article not found for any candidate | Log `✗ Not found`, leave unchanged |
| Langlinks entry exists but value is empty | Treat as not found |
| `common_name` is plain string | Promote to `{ en: <string>, <lang>: <fetched> }` |
| `common_name` object already has `lang` key + `--only-missing` | Skip |
| `common_name` object already has `lang` key (no flag) | Overwrite |
| API rate limit / network error | Catch per-species, log `✗ Error`, continue |

---

## Implementation order

1. `pack-tools/lib/wikipedia-names.ts` — `resolveWikipediaTitle` + `fetchLangLink` + `fetchLangName`
2. `pack-tools/cli/fetch-names.ts` — CLI wiring (arg parsing, main loop, file write)
3. `pack-tools/package.json` — add `fetch-names` script
4. Smoke-test: `npm run fetch-names packs/1-france.json --lang fr --max 3`

---

## What this does NOT do

- Does not translate `functional_description` or `notes` — those remain English-only
- Does not support multiple `--lang` flags in one run (run separately per language)
- Does not modify the app's `CommonName` type — already supports arbitrary lang keys

---

## Files to create / modify

| File | Action |
|------|--------|
| `pack-tools/lib/wikipedia-names.ts` | **Create** |
| `pack-tools/cli/fetch-names.ts` | **Create** |
| `pack-tools/package.json` | Add `fetch-names` script |
