# Refactoring Analysis: LivingPatch — LIVING DOCUMENT

**Last Updated**: May 27, 2026  
**Status**: MVP Phase 1 complete. Now tracking completed optimizations vs. remaining work.

---

## ✅ COMPLETED OPTIMIZATIONS (May 27, 2026)

### 1. ✅ DONE: Label Definition Consolidation
- **Date Completed**: May 27, 2026
- **Impact**: ~30 lines deduplicated
- **Changes**:
  - Moved all label maps to `designTokens.ts` (single source of truth)
  - `FORM_LABELS`, `SEASON_LABELS`, `HABITAT_LABELS`, `DIET_LABELS`, `SYMBIOSIS_LABELS`, `KEYSTONE_TYPE_LABELS`
  - `labels.ts` now imports from designTokens instead of duplicating
  - All 98 tests passing ✅
  - **Bundle savings**: ~0.5 KB (code cleanup, not size reduction)

### 2. ✅ DONE: Removed Outdated Documentation
- **Date Completed**: May 27, 2026
- **Files Deleted**:
  - PLAN.md (old project status)
  - TODO.md (all tasks completed)
  - context.md (reference superseded by instructions)
  - livingpatch-species-card-requirements.md (old spec)
  - livingpatch-product-definition.md (old definition)
- **Benefit**: Cleaner repo, no stale docs for agents to read

### 3. ✅ DONE: Build Artifact .gitignore
- **Status**: Already present in `app/.gitignore`
- **Entries**: `dist-single-file/`, `playwright-report/`, `test-results/`
- **Benefit**: Prevents build outputs from bloating repo

---

## 🔴 NEW: Unused Code Found (May 27, 2026)

### Unused Components (SAFE TO DELETE)
- `app/src/components/RelationshipsPanel.tsx` - Exported but never imported
- `app/src/components/NeighborsGrid.tsx` - Exported but never imported
- **Action**: Remove both files (~200 lines)
- **Bundle Savings**: ~2-3 KB

### Demo/Fixture Test (CAN BE ARCHIVED)
- `app/e2e/fixture-demo.spec.ts` - Tests Playwright fixture mechanism, not app functionality
- **Action**: Remove or move to archive/ folder
- **Status**: Not critical, but adds clutter

---

## 📋 REMAINING OPTIMIZATIONS (Priority Order)

### 1. Extract Generic Grouping Helper (30 min, ~2 KB)
**Location**: `app/src/lib/relationships.ts`  
**Problem**: `groupByRole()`, `groupKeyRolesByObligation()`, `groupTaxonomyRelations()` all use same loop-and-map pattern (~80 lines similar logic)  
**Solution**: Create generic `groupByKey()` helper function  
**Impact**: Code reduction + maintainability  

### 2. Split RelationshipBubbleTree Component (2-3 hrs, ~3 KB + maintainability)
**Location**: `app/src/components/RelationshipBubbleTree.tsx` (605 lines)  
**Problem**: Monolithic component mixes layout, rendering, legend, interactions  
**Solution**: Split into 3 sub-components:
  - `BubbleTreeCore.tsx` (~350 lines) - Core D3 layout + node/link rendering
  - `BubbleTreeLegend.tsx` (~100 lines) - Legend rendering
  - `BubbleTreeInteractions.tsx` (~155 lines) - Zoom, pan, click handlers
**Impact**: Better maintainability, easier testing  

### 3. **BIGGEST OPPORTUNITY**: Lazy-Load Dataset (4-6 hrs, ~450 KB deferral)
**Location**: `app/src/data/dataset.json` (~450-500 KB)  
**Problem**: Bundled into every build, loaded on app startup  
**Solution**: Lazy-load full dataset only when user navigates to RelationshipDiagramPage  
**Expected Impact**:
  - Initial load: 1.5 MB → 500-600 KB (67% reduction)
  - On diagram view: Deferred 450 KB loads on demand
  - Perceived UX: 3-5x faster initial page load
**Strategy**:
  - Keep core species list (~50 KB) in bundle
  - Fetch full symbiosis/relationships data only when opening full diagram
  - Cache in localStorage or React state to avoid re-fetching

---

## 📊 Bundle Size Summary

**Current State (May 27, 2026)**:
- Single-file bundle: ~1.5 MB
- Unit tests: 98 passing
- Code cleanliness: Good (no unused imports, consolidated labels)

**After Removing Unused Components**:
- Savings: ~2-3 KB (negligible in bundle, but cleaner codebase)
- Tests: Still 98 passing (tests for unused components don't exist)

**After All Optimizations**:
- Initial load: ~500-600 KB (lazy-load dataset)
- Component refactoring: ~3 KB code reduction
- **Total potential savings**: ~450+ KB + 3 KB code = 450+ KB network + better maintainability

---

## 🔍 Code Quality Notes

### What's Already Good
✅ No disabled tests (`.skip()`, `.only()`)  
✅ No commented-out code  
✅ All 23 components are actually used (except 2 found unused)  
✅ All 7 pages are routed  
✅ No unused imports  
✅ Design tokens centralized  

### What Needs Attention
⚠️ RelationshipBubbleTree too large (605 lines) - should split  
⚠️ 80 lines of repetitive grouping logic in relationships.ts  
⚠️ Dataset size (450 KB) blocking initial load  

---

## Reference: Architecture Overview

See `MEMORY.md` for project status and tech stack.  
See `/memories/repo/livingpatch-codebase-architecture.md` for detailed diagram implementation.

## Executive Summary

D3 bubble tree visualization is functional and well-tested. Main areas for improvement:
1. Remove unused components (quick, ~2-3 KB)
2. Extract repetitive patterns (medium, ~2 KB code clarity)
3. Split large component (medium, ~3 KB + maintainability)
4. Lazy-load dataset (large effort, ~450 KB network impact) ⭐ HIGHEST PRIORITY

### Location: `app/src/components/RelationshipBubbleTree.tsx` (lines 101-135)

### Problem
Predation and parasitism arrows are nearly identical, only differing in ID and fill color:
```typescript
// 35 lines for two nearly identical marker definitions
defs.append('marker').attr('id', 'arrowPredation')...
defs.append('marker').attr('id', 'arrowParasitism')...
```

### Solution
Extract factory function:
```typescript
const createArrowMarker = (id: string, color: string) => {
  defs.append('marker')
    .attr('id', id)
    .attr('markerWidth', 10)
    .attr('markerHeight', 10)
    .attr('refX', 9)
    .attr('refY', 3)
    .attr('orient', 'auto')
    .attr('markerUnits', 'strokeWidth')
    .append('path')
    .attr('d', 'M0,0 L0,6 L9,3 z')
    .attr('fill', color);
};

createArrowMarker('arrowPredation', '#e74c3c');
createArrowMarker('arrowParasitism', '#f39c12');
```

### Impact
- **Code reduction**: ~35 lines → ~12 lines
- **Maintainability**: Easy to add more arrow types or adjust styling

---

## 4. REFACTOR: Legend Rendering Factory

### Location: `app/src/components/RelationshipBubbleTree.tsx` (lines 380-470)

### Problem
Forms legend and relationships legend sections (90+ lines) have nearly identical patterns:
1. Add label text
2. Loop through color map
3. Add circle/line + label
4. Calculate dynamic spacing

### Solution
Extract legend section factory:
```typescript
interface LegendConfig {
  items: Record<string, string>;
  label: string;
  renderItem: (color: string, x: number, y: number) => void;
  x: number;
  y: number;
}

const renderLegendSection = (config: LegendConfig) => {
  let currentX = config.x;
  legendGroup.append('text')
    .attr('x', currentX)
    .attr('y', config.y)
    .attr('font-size', '11px')
    .attr('font-weight', 'bold')
    .text(config.label);
  
  currentX += config.label.length * 6 + 5; // approximate spacing
  
  Object.entries(config.items).forEach(([name, color]) => {
    config.renderItem(color, currentX, config.y);
    currentX += 10 + name.length * 5.5 + 8;
  });
};

// Usage
renderLegendSection({
  items: formColors,
  label: 'form: ',
  renderItem: (color, x, y) => {
    legendGroup.append('circle')...
    legendGroup.append('text')...
  },
  x: 10,
  y: dimensions.height - 50
});
```

### Impact
- **Code reduction**: ~90 lines → ~40 lines (50% reduction)
- **Maintainability**: Single legend rendering logic
- **Flexibility**: Easy to add new legend sections

---

## 5. SIMPLIFY: Color Maps Duplication

### Location: `app/src/components/RelationshipBubbleTree.tsx` (lines 356-375)

### Problem
`formColors` and `relationshipColors` are defined inline in RelationshipBubbleTree.tsx but mostly duplicate colors defined in bubbleTreeUtils.ts functions.

### Solution
Import color functions and build maps from them:
```typescript
// In RelationshipBubbleTree.tsx
const formColors = Object.fromEntries(
  ['bird', 'plant', 'insect', 'mammal', 'amphibian', 'reptile']
    .map(form => [form, getFormColor(form)])
);

const relationshipColors = Object.fromEntries(
  ['mutualism', 'predation', 'parasitism', 'competition', 'commensalism']
    .map(rel => [rel, getRelationshipColor(rel)])
);
```

### Impact
- **Code reduction**: ~20 lines → ~8 lines
- **Maintainability**: Single source of truth for colors
- **Consistency**: Colors always match across components

---

## 6. CONSOLIDATE: Helper Functions in bubbleTreeUtils.ts

### Problem
Multiple functions doing similar tasks:
- `getNodeSizeByDepth()` and legacy `getNodeRadius()`
- `getNodeOpacityByDepth()` and legacy `getNodeOpacity()`

### Solution
Keep only the "ByDepth" versions (already used), remove legacy versions.

---

## 7. IMPROVE: Type Safety

### Location: Throughout `RelationshipBubbleTree.tsx`

### Problem
Many `any` types for D3 data binding:
```typescript
.data(links)
.join('line')
.attr('x1', (d: any) => ...)  // ← any type
```

### Solution
Create proper types:
```typescript
interface LinkDatum {
  source: string;
  target: string;
  type: 'mutualism' | 'predation' | 'parasitism' | 'competition' | 'commensalism';
  obligate: boolean;
  direction?: 'inward' | 'outward';
}

interface NodeDatum {
  id: string;
  name: string;
  form: string;
  depth: number;
}

// Then remove eslint-disable comment and use:
.attr('x1', (d: LinkDatum) => ...)
```

### Impact
- **Better IDE support**: Autocomplete for d properties
- **Compile-time checks**: Catch property access errors
- **Documentation**: Self-documenting data structures

---

## 8. OPTIMIZE: Single-Pass Node Depth Map

### Location: `app/src/lib/bubbleTreeUtils.ts` (lines 385-395)

### Problem
Two separate maps built sequentially:
```typescript
for (let d = 0; d <= maxDepth; d++) {
  nodes.push(...(nodesByDepth.get(d) || []));
  // Redundant map building
  (nodesByDepth.get(d) || []).forEach(node => {
    nodeDepthMap.set(node.id, node.depth);  // ← builds separate map
  });
}
```

### Solution
Build nodeDepthMap while constructing nodesByDepth:
```typescript
const nodeDepthMap = new Map<string, number>();

while (queue.length > 0) {
  // ... BFS logic ...
  // When adding to nodesByDepth, also add to nodeDepthMap
  nodeDepthMap.set(node.id, node.depth);
}
```

### Impact
- **Performance**: One loop instead of two passes
- **Memory**: One map construction instead of two

---

## Summary of Changes

| Issue | Type | Lines Saved | Effort | Priority |
|-------|------|------------|--------|----------|
| Remove dead hierarchy code | REMOVE | ~70 | Low | HIGH |
| Link endpoint calculation | REFACTOR | ~55 | Medium | MEDIUM |
| Arrow marker factory | REFACTOR | ~23 | Low | LOW |
| Legend rendering factory | REFACTOR | ~50 | Medium | MEDIUM |
| Color map duplication | SIMPLIFY | ~12 | Low | LOW |
| Type safety improvements | IMPROVE | 0 (quality) | Medium | MEDIUM |
| Node depth map optimization | OPTIMIZE | ~8 | Low | LOW |
| **TOTAL** | | **~218 lines** | | |

## Recommended Order of Implementation

1. **Remove dead code** (HIGH priority, LOW effort)
   - Delete unused functions from bubbleTreeUtils
   - Immediate code cleanup, no risk

2. **Type safety improvements** (MEDIUM priority)
   - Define LinkDatum and NodeDatum types
   - Remove `any` types and eslint-disable
   - Better IDE support and maintainability

3. **Link endpoint refactoring** (MEDIUM priority)
   - Extract calculateLinkEndpoints helper
   - Good performance and maintainability win

4. **Legend rendering factory** (MEDIUM priority)
   - Extract legend rendering logic
   - Enables future legend expansions

5. **Color map duplication** (LOW priority)
   - Import and derive color maps
   - Nice-to-have cleanup

6. **Arrow marker factory** (LOW priority)
   - Extract marker creation
   - Cosmetic improvement

---

## Potential Risks & Mitigations

| Change | Risk | Mitigation |
|--------|------|-----------|
| Remove dead code | Accidentally used elsewhere | Grep confirms no usage before deleting |
| Refactor link endpoints | Subtle positioning bugs | Visual testing of diagram before/after |
| Type safety improvements | Breaking existing tests | Run test suite after each change |
| Legend factory | Legend not rendering | Careful with closure captures (x, y positions) |

---

## Files Affected

- `app/src/components/RelationshipBubbleTree.tsx` - Main refactoring target
- `app/src/lib/bubbleTreeUtils.ts` - Dead code removal
- `app/src/components/SpeciesBubbleTree.tsx` - Possibly minor type improvements
- Tests - No test changes needed (all internal refactoring)

