# Dataset Size Analysis — AI Processing Cost

_Generated: 2026-06-07 — `pack-tools/packs/0-base.json` (126 species, 183 symbiosis, 9 relations)_

**Goal:** Reduce token count and parsing cost when passing pack data to an LLM. Wire size / browser load is not the concern.

---

## Baseline token estimates

| Format | Chars | Tokens (≈chars/3.5) |
|---|---|---|
| Pretty-printed JSON | 329 K | **~94 000** |
| Minified JSON | 244 K | **~70 000** |

Minification alone saves ~24 000 tokens — it should always be used for AI input.

---

## Where the tokens live (minified)

| Field | Tokens | Notes |
|---|---|---|
| `symbiosis[].notes` | **~11 700** | Free-text per-relationship comments |
| `functional_description` | **~14 200** | Core prose, high semantic value |
| `image.url` + `image.source_url` | **~6 900** | Opaque hash paths, zero semantic value to LLM |
| `life_stages` | **~6 500** | Verbose objects, rarely queried |
| `keystone_description` | **~2 300** | Useful but long |
| `symbiosis` (structure, excl. notes) | **~6 700** | Relationship graph |
| `habitat[]` arrays | **~1 600** | Verbose enum strings |
| `behavior[]` arrays | **~1 400** | Very verbose enum strings (130+ unique values) |
| `region` | **~500** | Same value for all 126 species |
| `is_keystone` | **~170** | Redundant — derivable from `keystone_type` |
| All other fields | ~16 000 | ids, names, enums |

---

## Option A — Drop semantically empty fields

These fields add tokens but contribute no meaning to an LLM:

### A1 — `image.url` and `image.source_url`
Image URLs are long opaque hash paths (avg 141 chars each). An LLM cannot use them. `source_url` is derivable from `latin_name` anyway.

**Savings: ~6 900 tokens (10 % of total)**. No information loss for AI tasks.

### A2 — `region` field
Every single species in the pack has `"region": "northeast_pa"`. The pack itself declares its region at the top level.

**Savings: ~500 tokens**. Remove from species objects, keep at pack metadata level.

### A3 — `is_keystone` boolean
Redundant: `keystone_type` being non-null already implies keystone status.

**Savings: ~170 tokens**.

**Combined A1+A2+A3: ~7 600 tokens saved (~11 %)**. These are purely structural — zero readability or information cost.

---

## Option B — Defer `life_stages`

`life_stages` is 22 KB / ~6 500 tokens for 68 species, averaging ~330 chars per entry. It contains verbose timing and role descriptions rarely relevant to ecological queries.

**Savings: ~6 500 tokens (9 %)** if omitted from the AI-facing dataset slice.

If the LLM task needs life stage data, it can be passed selectively (one species at a time) rather than included in a full-pack context.

---

## Option C — Enum shorthands

Unlike browser serving (where gzip handles repeated tokens), LLMs count every token individually. Replacing long repeated enum strings with short codes directly reduces token count.

### High-value targets

| Field | Example value | Tokens/occurrence | Short code | Tokens saved each |
|---|---|---|---|---|
| `habitat[]` | `"woodland"` (54×) | 2 | `"wo"` | 1 each → **54 saved** |
| `habitat[]` | `"forest_edge"` (49×) | 3 | `"fe"` | 2 each → **98 saved** |
| `behavior[]` | `"nocturnal"` (26×) | 3 | `"nc"` | 2 each → **52 saved** |
| `behavior[]` | `"fruit_producer"` (15×) | 4 | `"fp"` | 3 each → **45 saved** |
| `season[]` | `"year_round"` (67×) | 3 | `"yr"` | 2 each → **134 saved** |
| `season[]` | `"summer"` (54×) | 2 | `"su"` | 1 each → **54 saved** |
| `ecological_role` | `"producer"` (44×) | 2 | `"prod"` | 1 each → **44 saved** |
| `region` | `"northeast_pa"` (126×) | 4 | eliminated by A2 | — |

All habitat, behavior, season, diet, form, and ecological_role fields together: **~3 000 → ~1 000 tokens**.

**Savings: ~2 000 tokens (3 %)** from enum shorthand alone.

### Readability tradeoff

The pack JSON becomes unreadable to humans without a legend. This is acceptable if:
- A separate human-readable source format is maintained (e.g., the pretty-printed pack is the "source of truth", the shorthand version is a derived AI-input artifact)
- The legend/expansion map is prepended to the LLM context (costs ~200 tokens but saves 2 000)

Net gain: ~1 800 tokens. Moderate value, medium complexity.

---

## Option D — `symbiosis[].notes` compression

The `notes` field on symbiosis entries is the second-largest field at **~11 700 tokens**. These are human-authored explanatory comments (e.g., "Kestrel uses abandoned pileated cavities for nesting").

Options:
1. **Drop notes entirely** — the `type`, `source`, `targets`, and `strength` fields already encode the relationship. Notes add nuance but are often redundant with `functional_description` on the species. **Saves ~11 700 tokens (17 %)**.
2. **Truncate to 60 chars** — keeps the gist, cuts ~60 % of note tokens. **Saves ~7 000 tokens**.
3. **Keep only notes that don't repeat species descriptions** — requires manual curation.

This is the single highest-leverage option if notes aren't essential to the query.

---

## Option E — Task-specific dataset slices

Rather than one monolithic pack, generate narrow projections for different AI tasks:

| Task | Fields needed | Est. tokens |
|---|---|---|
| "What eats what?" | `id`, `common_name`, `symbiosis` (no notes) | ~10 000 |
| "Which species are threatened?" | `id`, `common_name`, `conservation_status`, `status` | ~3 000 |
| "Describe this species" | `id`, `common_name`, `latin_name`, `functional_description`, `form` | ~20 000 |
| "Show ecological relationships" | `id`, `common_name`, `ecological_role`, `symbiosis` | ~15 000 |
| Full pack (current) | everything | ~70 000 |

A projection utility (a small JS function or CLI flag) that strips irrelevant fields before passing data to the LLM would be the highest-ROI improvement. No data loss in the source pack; the slimming happens at query time.

---

## Summary & Recommendations

| Option | Token savings | Readability | Complexity | Recommendation |
|---|---|---|---|---|
| Minify JSON | ~24 000 (34 %) | none | trivial | **Do immediately** |
| A — Drop image URLs + region + is_keystone | ~7 600 (11 %) | better | trivial | **Do immediately** |
| D — Drop symbiosis notes | ~11 700 (17 %) | minor loss | trivial | **Do if notes are redundant with descriptions** |
| B — Defer life_stages | ~6 500 (9 %) | none | low | **Do for most queries** |
| E — Task-specific slices | up to 85 % | none | medium | **Best long-term approach** |
| C — Enum shorthands | ~2 000 (3 %) | worse | medium | Worth it only with a legend prepended |

### Quick wins (trivial changes, no data loss)

1. **Always minify** before passing to an LLM → saves 24 000 tokens.
2. **Strip `image.url`, `image.source_url`, `region`, `is_keystone`** → saves another 7 600 tokens.
3. **Strip `life_stages`** unless the query specifically concerns life cycle → saves 6 500 tokens.

These three steps alone reduce the pack from **~70 000 to ~35 000 tokens** — a 50 % cut with zero semantic loss for the vast majority of ecological queries.

### Structural win (medium effort)

4. **Build a `packSlice(fields[])` utility** that projects the pack to only the fields needed for a given query type. The source pack stays complete; AI inputs are generated on demand. This is cleaner than maintaining a permanently stripped pack and scales naturally as the dataset grows.
