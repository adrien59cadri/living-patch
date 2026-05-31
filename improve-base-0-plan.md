# 0-base.json Improvement Plan

## Overview

Three categories of work, ordered by priority:

1. **Type/strength corrections** — existing symbiosis entries with wrong ecological type or incorrect strength label
2. **Wire orphan species** — 8 species with zero relationships; they appear in the species list but have no graph edges
3. **Missing cross-species links** — high-value relationships between existing non-orphan species that are absent

No new species are required to complete this plan, though candidate additions are noted at the end.

---

## Phase 1 — Type/Strength Corrections (6 fixes)

These are errors in existing entries. No notes need to change; only `type` or `strength`.

### 1a. Cavity-user symbioses: mutualism → commensalism (4 entries)

The Pileated Woodpecker excavates cavities as part of its own foraging — it gets nothing from the cavity users. All four of these should be `commensalism` (woodpecker neutral, cavity user benefits), not `mutualism` (which implies both parties benefit).

| Source | Target | Current type | Fix |
|---|---|---|---|
| `bird_pileated-woodpecker` | `bird_great-horned-owl` | mutualism | commensalism |
| `bird_pileated-woodpecker` | `bird_american-kestrel` | mutualism | commensalism |
| `bird_pileated-woodpecker` | `bird_wood-duck` | mutualism | commensalism |
| `bird_pileated-woodpecker` | `mammal_northern-flying-squirrel` | mutualism | commensalism |

### 1b. Great Blue Heron → Beaver: mutualism → commensalism (1 entry)

Beaver doesn't benefit from the heron foraging in its pond. The heron unilaterally benefits from beaver-created habitat.

| Source | Target | Current type | Fix |
|---|---|---|---|
| `bird_great-blue-heron` | `mammal_beaver` | mutualism | commensalism |

### 1c. Monarch → Goldenrod: incidental → important (1 entry)

The notes explicitly say "critical fat-building fuel before Mexico journey." Marking this `incidental` contradicts the note text. Goldenrod is the primary fall fueling plant for migrating Monarchs in NE PA.

| Source | Target | Current strength | Fix |
|---|---|---|---|
| `insect_monarch-butterfly` | `plant_goldenrod` | incidental | important |

---

## Phase 2 — Wire Orphan Species (8 species)

Each species needs at minimum one outgoing and one incoming relationship. All target IDs listed here are existing species already in the dataset.

---

### 2a. Northern Cardinal (`bird_northern-cardinal`)

**Current**: 0 out / 0 in

**Add 2 symbioses:**

```json
{
  "type": "predation-fruit_eating",
  "source": "bird_northern-cardinal",
  "targets": ["plant_black-cherry"],
  "strength": "incidental",
  "notes": "Northern Cardinal eats Black Cherry fruit in late summer. Males and females both take ripe cherries; less mobile than Cedar Waxwing flocks but a consistent consumer. Seeds pass through gut intact."
}
```

```json
{
  "type": "predation",
  "source": "bird_red-tailed-hawk",
  "targets": ["bird_northern-cardinal"],
  "strength": "incidental",
  "notes": "Red-tailed Hawk occasionally takes Northern Cardinal at forest edges and near brush piles. Cardinals are an opportunistic prey item rather than a dietary staple."
}
```

---

### 2b. White-breasted Nuthatch (`bird_white-breasted-nuthatch`)

**Current**: 0 out / 0 in

**Add 2 symbioses:**

```json
{
  "type": "mutualism",
  "source": "bird_white-breasted-nuthatch",
  "targets": ["plant_white-oak"],
  "strength": "important",
  "notes": "White-breasted Nuthatch caches White Oak acorns in bark crevices and ground soil for winter use. Cached acorns not retrieved germinate — nuthatch is a secondary acorn disperser alongside Blue Jay, operating at shorter range (within territory, ~5 acres) but consistently through the fall mast season."
}
```

```json
{
  "type": "commensalism",
  "source": "bird_pileated-woodpecker",
  "targets": ["bird_white-breasted-nuthatch"],
  "strength": "incidental",
  "notes": "White-breasted Nuthatch uses smaller abandoned cavities created by Pileated Woodpecker and Northern Flicker for roosting and winter insulation. Nuthatch also forages in bark furrows opened by woodpecker excavation."
}
```

> Note: The second entry adds `bird_white-breasted-nuthatch` to Pileated's commensalism targets. Consider whether to merge into existing cavity-user entries or keep separate entries per cavity user for clarity.

---

### 2c. Great Crested Flycatcher (`bird_great-crested-flycatcher`)

**Current**: 0 out / 0 in

**Add 2 symbioses:**

```json
{
  "type": "commensalism",
  "source": "bird_pileated-woodpecker",
  "targets": ["bird_great-crested-flycatcher"],
  "strength": "important",
  "notes": "Great Crested Flycatcher is an obligate cavity nester. In NE PA it preferentially uses large abandoned Pileated Woodpecker cavities and Northern Flicker holes — its most conspicuous ecological dependency. Famously lines nest with shed snakeskin."
}
```

```json
{
  "type": "predation",
  "source": "bird_great-crested-flycatcher",
  "targets": ["insect_eastern-tent-caterpillar"],
  "strength": "incidental",
  "notes": "Great Crested Flycatcher takes large caterpillars including Eastern Tent Caterpillar during spring outbreaks. Sallies from perch to grab crawling caterpillars from branches — an aerial insectivore that occasionally switches to caterpillar prey when densities are high."
}
```

---

### 2d. Field Grasshopper (`insect_grasshopper`)

**Current**: 0 out / 0 in

**Add 2 symbioses:**

```json
{
  "type": "predation",
  "source": "bird_american-kestrel",
  "targets": ["insect_grasshopper"],
  "strength": "critical",
  "notes": "Field Grasshopper is the primary summer prey for American Kestrel in NE PA open habitats — grasshoppers and other orthopterans can comprise 50%+ of summer diet. Kestrel hovers over meadows specifically hunting grasshoppers. This is the core open-field food-web link."
}
```

```json
{
  "type": "predation",
  "source": "bird_eastern-bluebird",
  "targets": ["insect_grasshopper"],
  "strength": "important",
  "notes": "Eastern Bluebird hunts grasshoppers and crickets in open fields, dropping from low perches onto prey. Grasshoppers are critical summer protein especially for nestlings. Bluebird competes with Kestrel for the same grasshopper prey base in open-field habitats."
}
```

---

### 2e. Engraver Bark Beetle (`insect_bark-beetle`)

**Current**: 0 out / 0 in

This is the most ecologically important orphan — woodpeckers exist in large part to eat bark beetles, yet the predation chain is entirely absent.

**Add 3 symbioses:**

```json
{
  "type": "parasitism",
  "source": "insect_bark-beetle",
  "targets": ["plant_black-cherry"],
  "strength": "important",
  "notes": "Engraver Bark Beetles (Ips spp., Scolytus spp.) colonize stressed, dying, or recently-dead Black Cherry trees. Larvae engrave characteristic gallery patterns under bark, girdling cambium and accelerating tree death. In NE PA Black Cherry is one of the most common host trees for bark beetle guilds. Mass outbreaks follow drought or ice damage."
}
```

```json
{
  "type": "predation",
  "source": "bird_pileated-woodpecker",
  "targets": ["insect_bark-beetle"],
  "strength": "critical",
  "notes": "Bark beetles and carpenter ants are the two primary prey driving Pileated Woodpecker foraging behavior. Pileated excavates large rectangular holes specifically to reach bark beetle larval galleries deep in dead and dying trees. A single large snag can supply weeks of beetle prey — this is the foundational predation link explaining why Pileated Woodpeckers are drawn to snags."
}
```

```json
{
  "type": "predation",
  "source": "bird_downy-woodpecker",
  "targets": ["insect_bark-beetle"],
  "strength": "important",
  "notes": "Downy Woodpecker forages on smaller bark beetle galleries accessible near the bark surface — especially on smaller-diameter branches and twigs where Pileated cannot reach. Downy and Pileated partition the bark beetle resource by tree diameter and depth, reducing competition."
}
```

---

### 2f. Common Orb-weaver Spider (`insect_orb-weaver-spider`)

**Current**: 0 out / 0 in

**Add 2 symbioses:**

```json
{
  "type": "predation",
  "source": "insect_orb-weaver-spider",
  "targets": ["insect_monarch-butterfly", "insect_native-bumble-bees"],
  "fulfillment": "any",
  "strength": "incidental",
  "notes": "Common Orb-weaver Spider builds large orb webs (up to 60 cm diameter) in meadow and forest-edge vegetation — exactly where Monarchs and bumble bees forage. Spiders opportunistically capture both species. Monarchs' cardenolide load sometimes causes web-entangled spiders to reject and release them, but capture-and-kill events are well-documented."
}
```

```json
{
  "type": "predation",
  "source": "bird_common-yellowthroat",
  "targets": ["insect_orb-weaver-spider"],
  "strength": "incidental",
  "notes": "Common Yellowthroat actively gleans spiders from vegetation and low shrubs — spiders are a consistent dietary item. Orb-weaver spiders in meadow edge habitat are frequently taken during the Yellowthroat's low foraging passes through dense vegetation."
}
```

---

### 2g. Waved Sphinx Moth (`insect_waved-sphinx-moth`)

**Current**: 0 out / 0 in

**Add 2 symbioses:**

```json
{
  "type": "parasitism",
  "source": "insect_waved-sphinx-moth",
  "targets": ["plant_white-oak"],
  "strength": "important",
  "notes": "Ceratomia undulosa (Waved Sphinx Moth) is a White Oak specialist — White Oak is the primary larval host in NE PA. Caterpillars feed on oak foliage from June–August, defoliating individual branches during high-density years. Related Sphingidae also use Ash and Fringe Tree but White Oak is the dominant PA host."
}
```

```json
{
  "type": "predation",
  "source": "bird_eastern-kingbird",
  "targets": ["insect_waved-sphinx-moth"],
  "strength": "incidental",
  "notes": "Eastern Kingbird is a noted aerial predator of large moths and hawkmoths (Sphingidae). Waved Sphinx Moths fly at dusk along forest edges — exactly the habitat where Kingbirds make late-evening aerial sallies before nightfall. Large sphinx moths are conspicuous prey for this aggressive flycatcher."
}
```

---

### 2h. Eastern Kingbird (`bird_eastern-kingbird`)

**Current**: 0 out / 0 in

**Add 2 symbioses:**

```json
{
  "type": "predation",
  "source": "bird_eastern-kingbird",
  "targets": ["insect_native-bumble-bees"],
  "strength": "incidental",
  "notes": "Eastern Kingbird's original common name was 'Bee Martin' — it regularly captures large bees and wasps in aerial sallies. Bumble bees are taken along meadow edges and near beaver ponds. Despite the risk of stinging, Kingbirds remove bee stingers by rubbing the bee against a perch before swallowing."
}
```

```json
{
  "type": "predation",
  "source": "bird_eastern-kingbird",
  "targets": ["insect_eastern-pondhawk"],
  "strength": "incidental",
  "notes": "Eastern Kingbird forages over open water and beaver pond edges where dragonflies concentrate. Eastern Pondhawk is a conspicuous mid-sized dragonfly that hunts in the same open habitats — a regular prey item for aerial sallying kingbirds."
}
```

---

## Phase 3 — Missing Links Between Existing Non-Orphan Species (5 additions)

### 3a. Beaver creates frog habitat (commensalism)

Beaver ponds are the primary reason American Bullfrog and Green Frog are so abundant in NE PA. This foundational habitat-creation link is absent.

```json
{
  "type": "commensalism",
  "source": "mammal_beaver",
  "targets": ["amphibian_american-bullfrog", "amphibian_green-frog"],
  "fulfillment": "any",
  "strength": "critical",
  "notes": "Beaver pond creation transforms stream channels into the still, shallow, productive water habitat that American Bullfrog and Green Frog require for breeding and year-round residence. Without beaver-created impoundments, both species would be rare in upland NE PA watersheds. A single active beaver colony supports dozens of adult frogs and thousands of tadpoles annually."
}
```

### 3b. Bullfrog preys on Spotted Salamander

Bullfrogs eat salamander eggs and larvae in the shared vernal pool and wetland-edge habitat already modeled.

```json
{
  "type": "predation",
  "source": "amphibian_american-bullfrog",
  "targets": ["amphibian_spotted-salamander"],
  "strength": "incidental",
  "notes": "American Bullfrog is an opportunistic predator in shared wetland and vernal pool habitat — it takes Spotted Salamander adults migrating to and from breeding pools, and consumes egg masses and larvae when they overlap with bullfrog foraging range. This is a documented predation pressure limiting salamander recruitment in bullfrog-occupied ponds."
}
```

### 3c. Eastern Tent Caterpillar is eaten by Blue Jay during outbreaks

Blue Jay preys on Eastern Tent Caterpillar during mass outbreak years — closing the link between these two already-modeled species.

```json
{
  "type": "predation",
  "source": "bird_blue-jay",
  "targets": ["insect_eastern-tent-caterpillar"],
  "strength": "incidental",
  "notes": "Blue Jay is one of several corvids and songbirds that take Eastern Tent Caterpillar larvae during mass outbreak years. Silk tent colonies on Black Cherry attract conspicuous predation. Blue Jays tear open tents and take caterpillars directly — a secondary trophic link binding the Black Cherry → tent caterpillar → jay chain."
}
```

### 3d. Red-tailed Hawk rarely takes deer fawn — remove or reclassify

The current entry `Red-tailed Hawk → White-tailed Deer` (predation/incidental, notes say "uncommon") is ecologically dubious — RTH physiology makes deer fawn predation essentially impossible. This entry should be **removed**. Red-tailed Hawk max prey weight is ~500g; even neonate deer fawns are 2–4 kg.

> **Action**: Delete this symbiosis entry entirely.

### 3e. White-tailed Deer → Spicebush Swallowtail (indirect via host plant)

Deer suppress Spicebush in the understory (already modeled). This reduces Spicebush Swallowtail habitat. Currently there is no link modeling this suppression chain's downstream effect. The existing `White-tailed Deer → Spicebush` entry already notes "reducing Spicebush Swallowtail habitat" — but there is no direct or indirect edge from deer to the swallowtail. This can be addressed with a note update to the existing entry rather than a new symbiosis, since adding a deer→swallowtail edge would be ecologically indirect.

> **Action**: Extend the notes of `mammal_white-tailed-deer → plant_spicebush` to explicitly mention the downstream effect on Spicebush Swallowtail obligate host availability. No new symbiosis entry needed.

---

## Phase 4 — Candidate New Species (stretch)

These are not required to fix current gaps but would meaningfully close open food-web threads introduced by the fixes above.

| Species | Form | Why add |
|---|---|---|
| **Sassafras** (`plant_sassafras`) | tree | Already cited as Spicebush Swallowtail's primary Lauraceae host alongside Spicebush — referenced in notes but not a species entry |
| **Eastern Cottontail** (`mammal_eastern-cottontail`) | mammal | Primary prey for Red-tailed Hawk and Great Horned Owl; heavy plant browser like deer; grounds the open-field predator web |
| **American Robin** (`bird_american-robin`) | songbird | Most abundant NE PA frugivore; major Black Cherry and Spicebush disperser; bridges fruit web gap |
| **Garter Snake** (`reptile_garter-snake`) | reptile | Eats Green Frog and Spotted Salamander; prey for Great Blue Heron and Mink; completes the wetland/forest-edge reptile tier |
| **Red Maple** (`plant_red-maple`) | tree | Most common tree by canopy cover in NE PA; hosts hundreds of insects; conspicuously absent from a NE PA dataset |
| **Eastern Chipmunk** (`mammal_eastern-chipmunk`) | mammal | Secondary acorn cacher; prey for Red-tailed Hawk and Great Horned Owl; differentiates from Gray Squirrel's role |

---

## Implementation Order

```
Phase 1 (corrections)     → 6 field-value changes, no new entries
Phase 2a–2h (orphans)     → 17 new symbiosis entries
Phase 3a–3c (new links)   → 3 new symbiosis entries
Phase 3d (remove RTH→deer)→ 1 entry deletion
Phase 3e (note update)    → 1 field text update
Phase 4 (new species)     → optional, separate PR per species
```

**Total after Phases 1–3**: +20 new symbioses, +1 deletion, 6 type/strength corrections, 1 note update.
