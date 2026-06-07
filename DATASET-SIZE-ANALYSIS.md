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

| Change | Tokens saved | Status |
|---|---|---|
| Minify (strip whitespace) | ~24 000 | applied at AI input time |
| Drop empty arrays (`life_stages`, `active_months`, `diet`) | ~430 | ✅ done in source pack |
| Drop null/false fields (keystone ×3, status, conservation, is_keystone) | ~2 686 | ✅ done in source pack |
| Fix synonym drift (diet, habitat, behavior consolidation) | ~134 | ✅ done in source pack |
| Drop `region` (redundant) | ~864 | applied at AI input time |
| Drop `image.url` + `image.source_url` | ~7 496 | applied at AI input time |
| **Total** | **~35 610 tokens** | |

**Before: ~94 000 tokens → After: ~58 400 tokens (~38 % reduction)**

Source pack is now clean (empty/null/synonym free). The remaining gains (`region`, image URLs) are applied by `stripDefaults()` at AI input time — the source pack keeps them for the browser app.

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

---

## Option F — Enum value renaming

**Token savings: ~134 tokens (~0.2 % of total).** Not meaningful on its own.

However, auditing enum values reveals a more useful finding: **synonym drift** — the same concept encoded as two different strings across species. This confuses filters, queries, and LLM reasoning regardless of token count.

### Confirmed synonym duplicates (both values present in the pack)

| Field | Value A | Count | Value B | Count | Canonical |
|---|---|---|---|---|---|
| `diet` | `insect_eater` | 27 | `insectivore` | 1 | `insectivore` |
| `diet` | `fruit_eater` | 4 | `frugivore` | 2 | `frugivore` |
| `diet` | `seed_eater` | 2 | `granivore` | 2 | `granivore` |
| `diet` | `nectar_feeder` | 7 | `nectivore` | 2 | `nectarivore` |
| `habitat` | `disturbed_site` | 9 | `disturbed_areas` | 5 | `disturbed` |
| `habitat` | `rocky_slope` | 2 | `rocky_slopes` | 1 | `rocky_slope` |
| `behavior` | `migratory` | 11 | `migratory_seasonal` | 1 | `migratory` |
| `behavior` | `colonial` | 6 | `colony_forming` | 2 | `colonial` |
| `behavior` | `mast_producer` | 4 | `mast_producing` | 1 | `mast_producer` |
| `behavior` | `frugivore` | 1 | `fruit_producer` | 15 | `fruit_producer` |

These duplicates cause silent filter failures today: a user filtering by `insectivore` misses 27 species tagged `insect_eater`.

### Recommended renames (readability-preserving, shorter or same length)

These are renames worth doing for correctness, with a minor token benefit as a side effect:

| Field | Old value | New value | Savings |
|---|---|---|---|
| `diet` | `insect_eater` | `insectivore` | 1ch ×27 |
| `diet` | `fruit_eater` | `frugivore` | 2ch ×4 |
| `diet` | `seed_eater` | `granivore` | 1ch ×2 |
| `diet` | `nectar_feeder` | `nectarivore` | 2ch ×7 |
| `diet` | `plant_sap_feeder` | `sap_feeder` | 6ch ×1 |
| `diet` | `invertebrate_eater` | `invertivore` | 7ch ×1 |
| `habitat` | `disturbed_areas` | `disturbed_site` | consolidate duplicate |
| `habitat` | `rocky_slopes` | `rocky_slope` | consolidate duplicate |
| `behavior` | `migratory_seasonal` | `migratory` | consolidate duplicate |
| `behavior` | `colony_forming` | `colonial` | consolidate duplicate |
| `behavior` | `mast_producing` | `mast_producer` | consolidate duplicate |
| `behavior` | `frugivore` | `fruit_producer` | consolidate duplicate |
| `season` | `year_round` | `resident` | 2ch ×67 = 134ch |
| `form` | `wading_bird` | `wader` | 6ch ×2 |
| `keystone_type` | `foundation_species` | `foundation` | 8ch ×5 |
| `keystone_type` | `ecosystem_engineer` | `engineer` | 10ch ×4 |

**Bottom line:** Do these renames to fix the synonym drift. The token savings (~134) are negligible, but the data consistency improvement is real and directly affects filter correctness.

---

## Option G — TOON as AI-input format

**TOON** (Token-Oriented Object Notation) is a format designed specifically for LLM token efficiency. Its core innovation is a tabular layout for arrays of uniform objects: field names are declared once in a header row, then each record is a plain CSV line. This is a direct fit for species records, which all share the same schema.

### How it works

```
# JSON — field names repeated on every record
[
  {"id":"bird_pileated-woodpecker","form":"woodpecker","ecological_role":"carnivore","conservation_status":"LC"},
  {"id":"bird_red-tailed-hawk","form":"raptor","ecological_role":"carnivore","conservation_status":"LC"}
]

# TOON — field names declared once as a header
species[2]{id,form,ecological_role,conservation_status}:
  bird_pileated-woodpecker,woodpecker,carnivore,LC
  bird_red-tailed-hawk,raptor,carnivore,LC
```

For 126 species, field name repetition alone costs ~17 500 chars in JSON. In TOON that becomes a single 227-char header.

### Estimated savings

Benchmarks report ~40% token reduction vs JSON on uniform object arrays. Applied to the cleaned pack:

| Format | Tokens (est.) |
|---|---|
| Pretty-printed JSON (current) | ~94 000 |
| Minified JSON after cleanup | ~58 400 |
| TOON (AI-input projection) | ~35 000 est. |

That is an additional **~23 000 tokens** on top of the JSON cleanup — roughly equivalent to the whitespace savings, but from structure rather than formatting.

### Tradeoffs

| | TOON | JSON |
|---|---|---|
| Token savings on uniform arrays | **~40 %** | baseline |
| Human readability | good (tabular, readable) | verbose |
| Prose fields (`functional_description`) | stays as a string value per row | same |
| Nested objects (`image`, `life_stages`) | awkward — needs flattening or a separate block | natural |
| Symbiosis records (variable fields, notes) | less suited | natural |
| Tooling | `toon-format` npm package (TypeScript SDK) | native |
| Source format | keep JSON — TOON is a derived AI-input artifact | — |

### Fit for this dataset

Species records are a strong fit: 126 rows, consistent fields, many short enum values. Symbiosis records are a weaker fit: each has a variable number of targets, optional `fulfillment`, and a long `notes` string — keeping those as JSON or a separate TOON block is reasonable.

### Verdict

Worth doing if the full pack is regularly passed as LLM context. The species table would convert cleanly; symbiosis records could stay as JSON or be a second TOON block. The `stripDefaults()` function could gain a `format: 'toon'` option. Source pack stays JSON — no change to the build pipeline.

Spec and TypeScript SDK: https://github.com/toon-format/toon
