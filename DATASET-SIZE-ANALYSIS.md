# Dataset Size Analysis & Reduction Options

_Generated: 2026-06-07 — based on `pack-tools/packs/0-base.json` (126 species, 183 symbiosis, 9 relations)_

---

## Current Baseline

| Format | Size |
|---|---|
| Raw JSON (pretty-printed) | **329 KB** |
| Minified JSON | **244 KB** |
| Minified + gzip | **62 KB** |
| Minified + brotli | **50 KB** |

**Key insight:** At serving time, HTTP compression (gzip/brotli) already cuts the payload to ~50–62 KB. That is well within normal static asset budgets. The "problem" is mostly at rest (repo size, dev tooling load) and at parse/hydration time, not wire size.

---

## Where the bytes live

| Field | Raw bytes | % of total |
|---|---|---|
| `functional_description` | 49 530 | **20.3 %** |
| `image` (url + author + source_url) | 30 516 | **12.5 %** |
| `life_stages` | 22 604 | **9.3 %** |
| `keystone_description` | 8 128 | **3.3 %** |
| `habitat` (arrays) | 5 685 | **2.3 %** |
| `behavior` (arrays) | 5 038 | **2.1 %** |
| All other enum fields combined | ~12 000 | **~5 %** |
| Symbiosis + relations JSON | ~100 000 | **~41 %** |

The prose fields (`functional_description`, `keystone_description`) and image URLs together dominate. Enum arrays are surprisingly small. Symbiosis records account for a large but already-dense share.

---

## Option A — Format change: TOML / YAML / MessagePack

### TOML or YAML (human-readable alternatives)

Both are more concise for multi-line text and avoid JSON's quote overhead — but the actual savings on a minified payload are negligible because whitespace is stripped anyway.

| Format | Minified equivalent | Notes |
|---|---|---|
| JSON (current) | 244 KB | Industry standard, zero parse overhead in browsers |
| TOML | ~230 KB est. | No native browser parser; needs a ~15 KB library |
| YAML | ~220 KB est. | No native browser parser; needs a ~40–60 KB library |
| MessagePack | ~170 KB est. | Binary; not human-readable; requires library |

**Verdict: not worth it.** The format overhead in JSON is small. Adding a parser library to the bundle partially or fully cancels the savings. TOML/YAML are better for source files edited by hand (readability) — but the pack JSON is machine-generated, so that benefit doesn't apply either.

---

## Option B — Keyword shorthands for enum fields

Many fields are repeated string literals across 126 species. Replacing them with short tokens reduces raw JSON size and — crucially — also helps compression dictionaries.

### Fields that are good candidates

| Field | Current values (sample) | Proposed shorthand |
|---|---|---|
| `form` | `"tree"`, `"songbird"`, `"wildflower"` | `"t"`, `"sb"`, `"wf"` |
| `habitat[]` | `"woodland"`, `"forest_edge"`, `"riparian"` | `"wo"`, `"fe"`, `"rp"` |
| `diet[]` | `"insect_eater"`, `"predator"`, `"herbivore"` | `"ie"`, `"pr"`, `"hb"` |
| `behavior[]` | `"nocturnal"`, `"migratory"`, `"fruit_producer"` | `"nc"`, `"mg"`, `"fp"` |
| `season[]` | `"year_round"`, `"summer"`, `"spring"` | `"yr"`, `"su"`, `"sp"` |
| `ecological_role` | `"producer"`, `"carnivore"`, `"herbivore"` | `"pr"`, `"cv"`, `"hb"` |
| `region` | `"northeast_pa"` (all 126) | `"nepa"` |
| `keystone_type` | `"foundation_species"`, `"ecosystem_engineer"` | `"fs"`, `"ee"` |
| `conservation_status` | `"LC"`, `"CR"`, `"VU"` | already short |

### Estimated savings

These fields together are ~25 KB raw. With 2–3 character shorthands replacing 8–20 character strings:

- **habitat**: avg 10 chars → 3 chars, 54+ occurrences of `"woodland"` alone → **~4 KB saved**
- **behavior**: 130+ unique values, avg 12 chars → 3–4 chars → **~3–4 KB saved**
- **region**: `"northeast_pa"` × 126 = 1.7 KB → `"nepa"` × 126 = **~0.9 KB saved**
- **season, diet, form, role**: combined **~4 KB saved**

Total raw savings: **~12–15 KB (~5–6 % of 244 KB minified).**
After gzip, savings shrink to **~2–4 KB** (gzip already compresses repeated tokens well).

### Readability tradeoff

- Pack JSON becomes unreadable without a legend (`"wo"` — what is that?)
- Every new contributor, scraper, or validator needs the mapping table
- Tooling (validators, filters, labels) must reference the expansion map
- **High maintenance cost for small gain**

**Verdict: marginal value.** Worth considering only if the pack grows to 1 000+ species and is shipped as a bare HTTP resource without compression. At 126 species with brotli, the numbers don't justify the complexity.

---

## Option C — Prose field compression (highest leverage)

`functional_description` alone is **20 % of the dataset**. This is the best target.

### C1 — Truncate to a character limit

Average `functional_description` is ~390 chars. A hard cap of 200 chars (two sentences) would cut this field roughly in half: **~25 KB saved** (~10 % of total).

- Tradeoff: ecological context is the core value proposition of the app. Truncation degrades quality.
- **Only viable if descriptions are rewritten for density, not just cut.**

### C2 — Move verbose text to a separate "details" pack

Split the pack into a lean "index" pack (id, names, form, image, status, enums) and a "details" pack (descriptions, life stages, keystone notes). Load the details pack lazily on species detail page open.

- Index pack estimated at ~80–100 KB minified
- Details pack loaded on demand (~150 KB), cached after first load
- **Best architectural option** if initial load time is the actual problem

### C3 — life_stages restructuring

`life_stages` is 22 KB for 68 species. Each entry is a verbose object with `stage`, `timing`, `description`, `role` strings. Example entry is ~330 chars. This data is rarely shown and could be:
- Deferred (lazy-loaded in details pack, see C2)
- Compressed to a flat string per stage with a separator

---

## Option D — Image URL deduplication

All 126 image URLs are Wikimedia Commons URLs matching the pattern:
```
https://upload.wikimedia.org/wikipedia/commons/thumb/{hash}/{filename}/{size}-{filename}
```

Average URL length: **141 characters**. Total image URL bytes: **~17 760 bytes** just for URLs.

### D1 — Store only the Wikimedia filename + size

```json
{ "wm": "1/12/PileatedWoodpeckerFeedingonTree.jpg", "size": "960px" }
```

Reconstruct the full URL at render time with a helper. Savings: ~60 chars × 126 = **~7.5 KB** (~3 %).

### D2 — Store only the hash + basename

The thumbnail URL is always `prefix + hash + filename + size + filename`. The `source_url` is always `https://en.wikipedia.org/wiki/{latin_name_underscored}` — it can be derived from `latin_name` entirely.

Removing `source_url` from image objects: `latin_name` encodes this for free → **~5 KB saved**.

**Verdict: D2 is a clean win** — derive `source_url` from `latin_name` at runtime, no data loss, removes 5 KB and a maintenance surface.

---

## Summary & Recommendations

| Option | Savings (raw) | Savings (gzip) | Readability | Complexity |
|---|---|---|---|---|
| A — Format change (TOML/YAML/msgpack) | 15–30 % | ~0–2 % | neutral/worse | high |
| B — Enum shorthands | 5–6 % | 1–2 % | worse | medium |
| C1 — Truncate descriptions | ~10 % | ~8 % | neutral | low |
| C2 — Lazy details pack | ~35 % initial | ~30 % initial | no change | medium |
| C3 — Defer life_stages | ~9 % | ~7 % | no change | low |
| D1 — Wikimedia URL shorthand | ~3 % | ~1 % | worse | low |
| D2 — Derive source_url from latin_name | ~2 % | ~1 % | better | low |

### Recommended path (priority order)

1. **Do nothing for now** — with brotli, the wire payload is already 50 KB. This is not a performance problem.
2. **D2 (derive source_url)** — free cleanup, no tradeoff. Remove `source_url` from pack JSON, generate it from `latin_name` in the scraper and render layer.
3. **C2 (lazy details pack)** — pursue when the dataset grows past ~500 species or if TTI on mobile becomes a measured issue. The split is clean given the existing pack architecture.
4. **C3 (defer life_stages)** — easy win paired with C2.
5. **Avoid B (enum shorthands)** — the complexity cost outweighs 1–2 KB gzip savings. If a machine-readable shorthand scheme is ever needed, use the existing `id` field prefixes as canonical keys instead of inventing a new mapping.
6. **Avoid A (format change)** — JSON is the right format for browser-consumed static data.

---

## If the dataset grows significantly (500+ species)

At that scale the calculus changes:
- C2 becomes near-mandatory (lazy pack splitting)
- Consider a binary columnar format (e.g., Arrow IPC) for the index with a thin JS reader
- Prose fields should be stored in a separate content-addressed store (even a simple `descriptions.json` keyed by species ID)
- Enum arrays become worth normalizing into integer bitmasks for the index pack
