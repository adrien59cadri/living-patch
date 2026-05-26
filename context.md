# LivingPatch — Quick Context Reference

**Purpose**: Minimal, fast reference for agents starting fresh. Read this first. See `.instructions.md` and `.copilot-instructions.md` for full guidance.

## Project Summary
Personal ecological literacy tool for nature hobbyists in NE Pennsylvania. MVP (Phase 1): read-only dataset explorer. Offline-first, no server, no external APIs.

**Status**: ✅ Phase 1 complete  
**Live**: `npm run dev` → http://localhost:5174  
**Tech**: React 18 + TypeScript + Vite + TailwindCSS v4  

---

## Essential Facts

### Root Workspace
```
/Users/acourdav/wc/LivingPatch/
├─ app/              (Vite React app)
├─ pack-tools/       (Dataset management utilities)
├─ .instructions.md  (Dev instructions)
├─ .copilot-instructions.md
├─ .claude.md        (Claude-specific guidance)
├─ context.md        (This file)
├─ MEMORY.md         (Project history & conventions)
├─ PLAN.md           (Architecture)
├─ TODO.md           (Completed tasks)
└─ README.md
```

### App Directory
```
app/src/
├─ types/index.ts         (Species, Symbiosis, Relation, LifeStage interfaces)
├─ data/dataset.json      (30 species + 8 groups, 50+ relationships)
├─ data/index.ts          (Load + index into Maps)
├─ hooks/useDataset.ts    (Data provider hook)
├─ lib/
│  ├─ filters.ts          (Search + multi-select filtering)
│  ├─ relationships.ts    (Symbiosis grouping logic)
│  └─ labels.ts           (Human-readable labels)
├─ components/            (8 components: SearchBar, FilterPanel, etc.)
├─ pages/                 (HomePage, DetailPage)
└─ App.tsx                (Router setup)
```

---

## Quick Commands
```bash
npm run dev      # Start Vite dev server (port 5174)
npm run build    # Production build
npm run test     # Unit tests (Vitest)
npm run e2e:local # E2E tests (Playwright)
npm run lint     # ESLint check
npm run preview  # Serve dist/ locally
```

---

## What Works (Phase 1)
✅ Full-text search (common name, latin name, description, tags)  
✅ Multi-select filters (form, season, habitat; combinable)  
✅ Species list with keystone badges  
✅ Detail page with relationships (grouped by symbiosis type)  
✅ Obligate relationships pinned to top  
✅ Mobile-responsive layout  
✅ Fully offline (zero network calls)  

---

## What's Out of Scope (Phase 2+)
❌ Sighting logging  
❌ Life list / personal tracking  
❌ Multiple locations  
❌ Photo identification  

---

## Key Conventions
| Category | Rule | Example |
|----------|------|---------|
| **Component** | PascalCase, one per file | `SpeciesCard.tsx` |
| **Hook** | `use` prefix | `useDataset` |
| **Utility** | camelCase | `filterSpecies()` |
| **Types** | All in `src/types/index.ts` | `Species`, `Symbiosis` |
| **ID format** | `{form}_{slug}` | `bird_pileated-woodpecker` |
| **Styling** | Tailwind classes | Colors: stone, emerald, amber |

---

## Critical Rules
1. **Relationships**: Always group by symbiosis type; pin obligates to top
2. **Groups** (`is_group: true`): Show in list with lighter styling, **NOT clickable**
3. **No APIs**: Zero external calls ever
4. **Data**: Static JSON, indexed into Maps (O(1) lookups)
5. **Router**: HashRouter (offline-first)

---

## Common Tasks

### Add a species to dataset
1. Edit `app/src/data/dataset.json`
2. Follow ID format: `form_slug` (e.g., `bird_cardinal`)
3. Rerun `npm run dev` (hot-reload)
4. Search/filter will find it immediately

### Add a relationship
1. Add entry to `symbiosis[]` in dataset JSON
2. Reference existing species IDs
3. Set `obligate: true` if required
4. Set `type` (mutualism, parasitism, predation, etc.)

### Debug
- DevTools → Console (should be empty)
- DevTools → Network (should have zero requests after load)
- Test offline mode: DevTools → Network → offline (app still works)

---

## Files to Reference by Task
| Task | File(s) |
|------|---------|
| Full dev guide | `.instructions.md` |
| Copilot context | `.copilot-instructions.md` |
| Claude guidance | `.claude.md` |
| Data packs | `pack-tools/.instructions.md` |
| Architecture | `PLAN.md` |
| Conventions | `MEMORY.md` |
| Product spec | `livingpatch-product-definition.md` |

---

## When Stuck
1. Check `.instructions.md` section "How To..."
2. Check `.copilot-instructions.md` section "When Adding Features"
3. Check `MEMORY.md` for conventions
4. Verify types in `app/src/types/index.ts`
5. Check dataset schema in `livingpatch-mvp-dataset.json`
