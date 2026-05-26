# LivingPatch — Species Card View Requirements

## Purpose
This document defines what must appear on every Species Card view. It serves as the implementation brief for the React component. All data is sourced from the static JSON dataset (no server calls).

---

## Visual Reference

The card is a single scrollable view with these sections top to bottom:
1. Hero photo area
2. Name block
3. Tags row
4. Functional description
5. Life Stages row
6. Key Relationship (pinned obligate, if any)
7. Neighbors grid (grouped by type)
8. Log Sighting button (Phase 2 — greyed out / hidden in Phase 1)

---

## Section Specifications

### 1. Hero Photo Area
- Full-width image placeholder (ratio 16:9 or 4:3)
- Background: dark muted tone when no photo available
- Species emoji or icon centered in placeholder if no photo
- Phase 2+: tappable to view logged sighting photos (not in MVP)

### 2. Name Block
- **Common name** — large, prominent
- **Latin name** — smaller, italic, muted color, shown by default
- **Keystone badge** — if `is_keystone: true`, show small labeled badge (e.g. "Host Plant", "Engineer", "Pollinator") using `keystone_type`

### 3. Tags Row
- Horizontal scrollable chip row
- Chips pulled from: `form`, `habitat[]`, `diet[]`, `behavior[]`
- `active_months` rendered as a single season chip (e.g. "Jun–Oct" or "Year-round")
- Chips are display-only, not filterable from this view

### 4. Functional Description
- Plain text paragraph
- Source: `functional_description` field
- No truncation — show full text

### 5. Life Stages Row
**Section header:** LIFE STAGES

- Horizontal row of stage tiles, one per entry in `life_stages[]`
- Each tile shows:
  - Stage icon (emoji from `icon` field)
  - Stage name (e.g. Egg, Larva, Pupa, Adult)
  - Active months below name (e.g. "Jun–Aug") from `months` field
- **Phase 1 (MVP):** all tiles shown in neutral/grey style
- **Phase 2+:** tiles turn green when user has logged that stage
- If species has no life stages defined, omit section entirely

### 6. Key Relationship (Pinned)
**Section header:** KEY RELATIONSHIP

- Show **at most one** tile — the single most ecologically significant relationship
- Priority: obligate symbiosis (`obligate: true`) — pick the first one found
- Tile shows:
  - Species icon or emoji (left)
  - Species common name (bold)
  - Short relationship description (e.g. "Obligate host plant — eggs & larvae only")
  - Logged indicator checkbox (right) — greyed in Phase 1, active in Phase 2
- Tile has distinct visual treatment (green tint if both species logged in Phase 2)
- If no obligate relationship exists, omit section

### 7. Neighbors Grid
**Section header:** NEIGHBORS

- 2-column grid of group tiles
- Each tile represents a **category** of related species, not an individual (drill-down pattern)
- Tile shows:
  - Category icon (emoji, one per category type)
  - Category label (e.g. "Birds", "Plants", "Insects", "Habitat")
  - Species count (e.g. "4 species")
  - Logged indicator checkbox (right) — greyed in Phase 1
- **Category groupings** (derive from symbiosis + relations data):
  - **Birds** — all bird species connected via any symbiosis
  - **Plants** — all plant species connected
  - **Insects** — all insect/bee/butterfly species connected
  - **Habitat** — habitat associates (from relations), shown as habitat type label not species count
  - **Related species** — taxonomic group if present
- Tapping a tile navigates to a **Neighbor List view** (see below)
- Show max 4 tiles (2×2 grid); if more categories exist, show "More" tile

### 8. Log Sighting Button
- Full-width button at bottom of card: "☐ Log sighting"
- **Phase 1 (MVP):** button is visible but disabled, or hidden entirely — designer's choice
- **Phase 2+:** opens Log Sighting modal (date, optional note, no photo)

---

## Neighbor List View (drill-down from tile)
When user taps a Neighbor tile, show a list of individual species in that category:

- Back navigation to parent species card
- Section header: e.g. "Plants connected to Monarch"
- List of species tiles, each showing:
  - Species name
  - One-line relationship description (from symbiosis `notes` field, shortened)
  - Symbiosis type badge (Mutualism / Parasitism / Predation)
  - Logged indicator (Phase 2)
- **Group placeholders** (`is_group: true`) shown with lighter style, italicized name, not tappable to a full card
- Tapping a real species navigates to its Species Card

---

## State Rules (Phase 1 vs Phase 2)

| Element | Phase 1 (MVP) | Phase 2 (Logging) |
|---|---|---|
| Life stage tiles | Neutral grey | Green when logged |
| Key Relationship tile | No logged indicator | Green border if both logged |
| Neighbor tile checkboxes | Greyed out / hidden | Active, fills on log |
| Log Sighting button | Disabled or hidden | Active |

---

## Data Mapping

| UI Element | Dataset Field |
|---|---|
| Common name | `species.common_name` |
| Latin name | `species.latin_name` |
| Keystone badge | `species.is_keystone`, `species.keystone_type` |
| Tags | `species.form`, `.habitat[]`, `.diet[]`, `.behavior[]` |
| Season chip | `species.active_months` (from phenology) |
| Functional description | `species.functional_description` |
| Life stages | `species.life_stages[]` → `icon`, `name`, `months` |
| Key relationship | `symbiosis[]` where `members` includes this species AND `obligate: true` |
| Neighbors | All `symbiosis[]` and `relations[]` entries where `members` includes this species |
| Related species group | `relations[]` where `type: "taxonomic_group"` |

---

## Design Tokens

- **Background:** dark (#2a2a2a or equivalent)
- **Card surface:** slightly lighter (#333 or equivalent)
- **Accent / logged state:** muted green (e.g. #8aad6e or equivalent)
- **Keystone badge:** warm amber
- **Tags:** pill shape, outlined, muted
- **Obligate relationship tile:** green-tinted background
- **Group placeholders in neighbor list:** reduced opacity, italic name, no tap affordance
- **Typography:** large bold common name, smaller italic latin name, small caps section headers

---

## Out of Scope for Species Card
- Photo upload or recognition
- Social sharing or public visibility
- Comments or community notes
- Map view (Phase 3+)
- Edit species data
