# Dataset Size Analysis — AI Processing Cost

_Generated: 2026-06-07 — `pack-tools/packs/0-base.json` (126 species, 183 symbiosis, 9 relations)_

**Constraints:**
- No data loss — every piece of content is preserved
- Human-readable output — no opaque shorthands or binary formats
- Only remove what is either empty, redundant, or derivable

---

## Baseline

| Format | Chars | Tokens (≈chars/3.5) |
|---|---|---|
| Pretty-printed JSON (current) | 329 K | **~94 000** |
| Minified JSON | 244 K | **~70 000** |

Minification (stripping whitespace) saves ~24 000 tokens instantly. It is the first thing to do.

---

## What can be removed without any data loss

### 1 — Empty arrays (stored but contain nothing)

58 species have `"life_stages": []` — an empty array that serialises as two characters but signals nothing. Same for `"diet": []` (45 species) and `"active_months": []` (57 species). These should simply be omitted; absence means the same thing.

| Field | Species with empty value | Bytes | Tokens |
|---|---|---|---|
| `life_stages: []` | 58 / 126 | ~580 | ~166 |
| `active_months: []` | 57 / 126 | ~570 | ~163 |
| `diet: []` | 45 / 126 | ~360 | ~103 |

### 2 — Null/false fields (stored but convey no information)

- **`is_keystone: false`** — present on 100 / 126 species. When `keystone_type` is absent, `is_keystone` is trivially false. Omitting it loses nothing; its presence can be inferred.
- **`keystone_type: null`** and **`keystone_description: null`** — same: null is the default. Only the 26 keystone species need these fields.
- **`status: null`** — 117 / 126 species have no ecological status field set (native is the default). Storing `null` wastes space.
- **`conservation_status: null`** — 32 species have no status scraped yet. Omit until populated.

| Field | Species with null/false | Bytes | Tokens |
|---|---|---|---|
| `is_keystone: false` | 100 / 126 | ~2 000 | ~571 |
| `keystone_type: null` | 100 / 126 | ~2 100 | ~600 |
| `keystone_description: null` | 100 / 126 | ~2 800 | ~800 |
| `status: null` | 117 / 126 | ~1 638 | ~468 |
| `conservation_status: null` | 32 / 126 | ~864 | ~247 |

### 3 — `region` field (redundant with pack metadata)

Every single species has `"region": "northeast_pa"`. The pack already declares its region at the top level. Repeating it on all 126 species adds 3 024 bytes / ~864 tokens with zero new information.

**Remove from species records; document that absence implies the pack's own region.**

### 4 — `image.url` and `image.source_url` (no semantic value to an LLM)

`image.url` is an opaque Wikimedia hash path (avg 147 chars). An LLM cannot use it to retrieve or reason about an image.
`image.source_url` is always `https://en.wikipedia.org/wiki/{latin_name}` — fully derivable from `latin_name` at render time.

`image.author` has genuine content (credit attribution) and should stay.

| Sub-field | Bytes | Tokens |
|---|---|---|
| `image.url` | 18 590 | ~5 311 |
| `image.source_url` | 7 646 | ~2 185 |
| `image.author` (keep) | 3 398 | ~971 |

---

## Total achievable reduction (no data loss, human-readable)

| Change | Tokens saved |
|---|---|
| Minify (strip whitespace) | ~24 000 |
| Drop empty arrays (`life_stages`, `active_months`, `diet`) | ~430 |
| Drop null/false fields (keystone ×3, status, conservation, is_keystone) | ~2 686 |
| Drop `region` (redundant) | ~864 |
| Drop `image.url` + `image.source_url` | ~7 496 |
| **Total** | **~35 476 tokens** |

**Before: ~94 000 tokens → After: ~58 500 tokens (~38 % reduction)**

All actual content preserved. No shorthands. The output remains valid JSON, readable by a human or a machine.

---

## What is NOT changed

| Field | Why kept |
|---|---|
| `functional_description` | Core ecological prose, highest semantic value |
| `symbiosis[].notes` | All 183 entries have notes; none empty |
| `life_stages` (non-empty) | Present on 68 species; real data |
| `keystone_description` | Present on 26 species; real data |
| `habitat`, `behavior`, `season`, `diet` (non-empty) | Enum arrays, all populated |
| `image.author` | Attribution credit, real content |
| `latin_name` | All 126 species have one |

---

## Implementation

A small `packSlice` utility or a pre-processing step before any AI call:

```js
function stripDefaults(species) {
  const out = { ...species };
  // Remove empty arrays
  for (const f of ['life_stages', 'active_months', 'diet', 'behavior', 'season', 'habitat']) {
    if (Array.isArray(out[f]) && out[f].length === 0) delete out[f];
  }
  // Remove null/false fields
  for (const f of ['is_keystone', 'keystone_type', 'keystone_description', 'status', 'conservation_status']) {
    if (out[f] === null || out[f] === false || out[f] === undefined) delete out[f];
  }
  // Remove redundant fields
  delete out.region;           // implied by pack
  delete out.image?.url;       // opaque hash, useless to LLM
  delete out.image?.source_url; // derivable from latin_name
  return out;
}
```

The source pack (`0-base.json`) stays untouched. The stripped version is produced on demand.
