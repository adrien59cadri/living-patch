# LivingPatch — Spec: One-to-Many Relationship Model

## Overview

Redesign the `Symbiosis` data model to support first-class **one-to-many directional relationships** — replacing two workaround fields (`impacted_species`, `grp`) with an explicit `source`/`targets` structure and a `fulfillment` semantic.

The core limitation in the current model:
- Direction is inferred from `impacted_species` (names the victim, not the actor)
- Multiple species that can alternatively fulfil a need must be stored as N separate pairwise entries sharing a `grp` slug
- The `grp` slug is display-only — it carries no information about whether *any one* target suffices or *all* are required simultaneously

This redesign keeps relationships as top-level dataset objects. Species and Relations models are unchanged.

---

## 1. Data Model Changes

### 1.1 New `Symbiosis` Schema

**Before:**
```json
{
  "type": "parasitism",
  "members": ["insect_monarch-butterfly", "plant_common-milkweed"],
  "impacted_species": "plant_common-milkweed",
  "strength": "critical",
  "grp": "monarch-milkweed",
  "notes": "Monarch caterpillars obligate on genus Asclepias."
}
```

**After (single-target, directional):**
```json
{
  "type": "parasitism",
  "source": "insect_monarch-butterfly",
  "targets": ["plant_common-milkweed"],
  "strength": "critical",
  "notes": "Monarch caterpillars obligate on genus Asclepias."
}
```

**After (one-to-many, any-fulfillment):**
```json
{
  "type": "parasitism",
  "source": "insect_monarch-butterfly",
  "targets": [
    "plant_common-milkweed",
    "plant_butterfly-weed",
    "plant_swamp-milkweed"
  ],
  "fulfillment": "any",
  "strength": "critical",
  "notes": "Monarch larvae use any Asclepias species as host; A. syriaca preferred in NE PA."
}
```

### 1.2 Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `'mutualism' \| 'parasitism' \| 'predation' \| 'competition' \| 'commensalism'` | yes | Symbiosis type (unchanged) |
| `source` | `string` | yes | The actor or needing party: predator, parasite, or species whose requirement this relationship describes |
| `targets` | `string[]` | yes | One or more partner species. Single entry for standard pairwise; multiple for one-to-many |
| `fulfillment` | `'any' \| 'all'` | no | Only meaningful when `targets.length > 1`. `'any'` = any single target satisfies the need (alternatives). `'all'` = all targets participate simultaneously. Omit for single-target relationships. |
| `strength` | `'critical' \| 'important' \| 'incidental'` | yes | Ecological importance (unchanged) |
| `notes` | `string` | yes | Explanatory notes (unchanged) |

### 1.3 Field Mapping from Old Model

| Removed field | Replacement |
|---------------|-------------|
| `members: [A, B]` | `source: A` + `targets: [B]` |
| `impacted_species` | Removed — `source` is always the actor/aggressor. For predation/parasitism `source` = predator/parasite, `targets` = prey/host. |
| `grp` | Removed — superseded by `targets: [B, C, D]` + `fulfillment: 'any'` |

### 1.4 Direction Rules

| Type | Direction | Arrow in UI |
|------|-----------|-------------|
| `predation` | `source` → `targets` (predator hunts prey) | Yes |
| `parasitism` | `source` → `targets` (parasite uses host) | Yes |
| `mutualism` | Bidirectional — no arrow | No |
| `commensalism` | Bidirectional — no arrow | No |
| `competition` | Bidirectional — no arrow | No |

For bidirectional types, `source` is still required (recorded as the focal species the entry was authored from). It does not imply asymmetry.

---

## 2. Fulfillment Semantics

`fulfillment` applies only when `targets.length > 1`.

| Value | Meaning | Ecological example |
|-------|---------|-------------------|
| `'any'` | Any single target from the list satisfies the relationship | A generalist pollinator plant that can be serviced by any one of several bee species |
| `'all'` | All listed targets must be present simultaneously | A multi-species mutualism where each partner plays a distinct role |

**Omit `fulfillment` for single-target relationships.** Curators should never set it on a 1-target entry.

---

## 3. Display & UI Changes

### 3.1 Relationships Panel

One-to-many entries with `fulfillment: 'any'` render as a **group tile** (same visual as the old `grp` groups), but now driven by the relationship object itself rather than a matching slug across entries.

Group tile shows:
- List of target species names; first two visible, rest as `(+N more)`
- A `fulfillment` indicator: `'any'` displays as *"any of:"*, `'all'` displays as *"all of:"*
- Strength badge from the single relationship entry

Tap behavior: expand inline to show individual species tiles, each navigable.

### 3.2 Graph / Visualization

- `getLinkDirection` updated: direction is always `source → target` for predation/parasitism. The old `inward`/`outward` disambiguation is removed.
- Multi-target entries expand into one edge per `(source, target)` pair in the graph.

---

## 4. Code Changes

### Type definitions
- `pack-tools/types.ts` — replace `Symbiosis` interface (remove `members`, `impacted_species`, `grp`; add `source`, `targets`, `fulfillment`)
- `app/src/types/index.ts` — mirror the same change

### Validation schemas
- `pack-tools/schema/pack-schema.json` — update symbiosis object schema
- `pack-tools/lib/schema.ts` — update Zod schema; validate `fulfillment` only present when `targets.length > 1`

### Data indexing
- `app/src/data/index.ts` — update `symbiosisBySpeciesId` builder to index by `source` AND each entry in `targets`

### Relationship processing (`app/src/lib/relationships.ts`)
- `RelatedEntry`: replace `grp?: string | null` with `fulfillment?: 'any' | 'all'`
- `getRelatedEntries`: expand multi-target symbioses → one `RelatedEntry` per target; attach the parent `Symbiosis` object reference for grouping
- `resolveRelationGroups`: group by shared `Symbiosis` object reference instead of `grp` slug; surface `fulfillment` on `RelationGroupEntry`
- `RelationGroupEntry`: add `fulfillment?: 'any' | 'all'`

### Visualization (`app/src/lib/bubbleTreeUtils.ts`)
- `getLinkDirection`: replace `impactedSpeciesId` param with `sourceId`; direction is always source → target for predation/parasitism

### Pack data migration (`pack-tools/packs/0-base.json`)
- 44 entries with `impacted_species` → identify aggressor, set `source`, move victim to `targets`, drop `impacted_species`
- 3 entries sharing `grp: "monarch-milkweed"` → collapse into 1 entry: `source: "insect_monarch-butterfly"`, `targets: [all three milkweeds]`, `fulfillment: "any"`, drop `grp`
- All remaining entries: `source = members[0]`, `targets = [members[1]]`, drop `members`

---

## 5. Validation Rules

| Rule | Message |
|------|---------|
| `source` not found in species dataset | `[symbiosis] unknown source id "{id}"` |
| Any `targets` entry not found in species dataset | `[symbiosis] unknown target id "{id}"` |
| `fulfillment` present on single-target entry | `[symbiosis] fulfillment set on single-target entry — ignored` |
| `targets` is empty | `[symbiosis] targets must contain at least one species id` |

---

## 6. What Does NOT Change

- Symbiosis types (mutualism, commensalism, parasitism, predation, competition)
- `strength` field and its three values
- `notes` field
- `Relation` model (non-ecological associations)
- Species model
- Pack structure and top-level layout (relationships remain top-level objects)
