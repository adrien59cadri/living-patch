# LivingPatch — Spec: Relationship Strength & Grouping

## Overview

Two related changes to the Symbiosis data model and Relationships Panel UI:

1. **Replace `obligate` with `strength`** — a 3-tier scale that communicates ecological importance more expressively.
2. **Add `relation_group`** — an optional slug that links multiple pair-wise symbiosis entries into one logical relationship, collapsible in the UI.

These changes are purely additive to the JSON schema and backwards-compatible. No changes to Species or Relations models.

---

## 1. Data Model Changes

### 1.1 Symbiosis Schema

Remove `obligate: boolean`. Add `strength` (required) and `relation_group` (optional).

**Before:**
```json
{
  "members": ["plant_common-milkweed", "insect_monarch-butterfly"],
  "type": "mutualism",
  "impacted_species": null,
  "obligate": true,
  "notes": "Sole larval host plant for monarch caterpillars."
}
```

**After:**
```json
{
  "members": ["plant_common-milkweed", "insect_monarch-butterfly"],
  "type": "mutualism",
  "strength": "critical",
  "impacted_species": null,
  "relation_group": "monarch-milkweed",
  "notes": "Sole larval host plant for monarch caterpillars."
}
```

### 1.2 Strength Values

| Value | Meaning | Replaces |
|---|---|---|
| `"critical"` | Species depends on this relationship for survival or reproduction. Cannot substitute. | `obligate: true` |
| `"important"` | Strong interaction; shapes behavior or abundance, but alternatives exist. | `obligate: false` (meaningful) |
| `"incidental"` | Minor, opportunistic, or infrequent interaction. | `obligate: false` (weak) |

`strength` is **required** on every symbiosis entry. No default. The curator must make a deliberate choice for every record.

### 1.3 relation_group

- **Type:** `string | null` — freeform slug, curator-defined (e.g. `"monarch-milkweed"`, `"oak-gall-wasps"`)
- **Optional.** Omit or set to `null` for ungrouped pairs.
- **No registry.** The UI groups entries at render time by matching string value.
- **Naming convention:** `subject-relationship` in kebab-case, e.g. `monarch-milkweed`, `spicebush-swallowtail-hosts`

Multiple symbiosis entries sharing a `relation_group` value are displayed as a single collapsed tile in the Relationships Panel.

**Example — two entries, one group:**
```json
[
  {
    "members": ["insect_monarch-butterfly", "plant_common-milkweed"],
    "type": "mutualism",
    "strength": "critical",
    "relation_group": "monarch-milkweed",
    "notes": "Primary larval host plant."
  },
  {
    "members": ["insect_monarch-butterfly", "plant_swamp-milkweed"],
    "type": "mutualism",
    "strength": "critical",
    "relation_group": "monarch-milkweed",
    "notes": "Secondary larval host plant."
  }
]
```

---

## 2. Display & Sort Logic

### 2.1 Sort Order Within Each Section

Within each symbiosis type section (Mutualism, Predation, etc.), entries are sorted:

1. `strength: "critical"` — always pinned at top
2. `strength: "important"`
3. `strength: "incidental"`
4. Within each tier, grouped entries appear together (see 2.2)

### 2.2 Grouped Entry Display

When two or more entries share a `relation_group` and the same symbiosis `type`, they are collapsed into a **single group tile** in the panel.

**Group tile shows:**
- The species name that is common across all entries (the "anchor" — the non-current-card species)
- If multiple species: list the first two names, then `(+N more)` for the rest
- A `relation_group` icon or subtle indicator (e.g. small stacked-cards icon) to signal it's a group
- Strength badge matching the group's strength (all members of a group must share the same `strength` — flag a data error if they differ)

**Example tile label** on Monarch's card: *"Common milkweed, Swamp milkweed (+1)"*

**Tap behavior:**
- Tapping a group tile expands it inline, revealing individual species tiles for each member
- Each individual tile is then tappable to navigate to that species card
- Expanded state can be collapsed again

**Ungrouped entries** display as individual tiles exactly as before.

### 2.3 Overflow Rule

The existing max-6-tiles-per-section rule applies to **tiles as rendered** (groups count as 1 tile until expanded). Overflow collapse happens after grouped entries are resolved.

---

## 3. Migration of Existing Data

All existing symbiosis entries with `obligate: true` → set `strength: "critical"`.  
All existing symbiosis entries with `obligate: false` → curator must assign `"important"` or `"incidental"` based on ecological judgment. Do not auto-assign.

Remove the `obligate` field from all entries after migration.

---

## 4. Validation Rules

Enforce these at data load time (console warnings in dev, silent in prod):

| Rule | Message |
|---|---|
| `strength` is missing | `[symbiosis] missing strength on entry between {A} and {B}` |
| `relation_group` entries have mixed `strength` values | `[symbiosis] relation_group "{group}" has mixed strength values — using lowest` |
| `relation_group` entries have mixed symbiosis `type` | `[symbiosis] relation_group "{group}" spans multiple types — grouping disabled for this group` |
| Either `members` ID not found in species dataset | `[symbiosis] unknown species id "{id}"` |

---

## 5. What Does NOT Change

- Symbiosis types (mutualism, commensalism, parasitism, predation, competition) — unchanged
- `impacted_species` field — unchanged
- `notes` field — unchanged
- Relations model (non-directional groupings) — unchanged
- Species model — unchanged
- All Phase 2 / Phase 3 logic built on symbiosis (confirmed relationships, etc.) — `strength: "critical"` replaces `obligate: true` wherever that flag was referenced