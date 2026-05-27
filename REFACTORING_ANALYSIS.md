# Refactoring Analysis: D3 Bubble Tree Visualization

## Executive Summary
The D3 bubble tree visualization is functional but has several opportunities for simplification and code reduction without losing functionality. Main areas: eliminate code duplication, remove dead code from legacy hierarchy model, improve type safety, and extract common patterns.

---

## 1. REDUCE: Dead Code from Legacy Hierarchy Model

### Location: `app/src/lib/bubbleTreeUtils.ts` (lines 1-150)
### Impact: ~120 lines of unused code

Functions **no longer used** after switching from 3-tier hierarchy to flat nodes-edges model:
- `buildBubbleTreeHierarchy()` - entire function unused
- `categoryLabel()` - only used by buildBubbleTreeHierarchy
- `getNodeRadius()` - duplicate of getNodeSizeByDepth
- `getNodeOpacity()` - duplicate of getNodeOpacityByDepth  
- `getLabelSize()` - unused
- `getLabelWeight()` - unused

### Action
Delete these 6 functions (~70 lines of code). They're not imported anywhere else:
```bash
grep -r "buildBubbleTreeHierarchy\|categoryLabel\|getNodeRadius\|getNodeOpacity\|getLabelSize\|getLabelWeight" app/src --include="*.tsx" --include="*.ts"
# Result: No matches (except in bubbleTreeUtils.ts itself)
```

### Before/After
- **Before**: ~420 lines in bubbleTreeUtils.ts
- **After**: ~350 lines (-17% reduction)
- **Bundle impact**: ~1-2 KB savings in final build

---

## 2. REFACTOR: Eliminate Link Endpoint Calculation Duplication

### Location: `app/src/components/RelationshipBubbleTree.tsx` (lines 176-245)

### Problem
x1, y1, x2, y2 attributes each repeat the direction vector calculation:
```typescript
// This pattern is repeated 4 times with minor variations
const dx = targetPos.x - sourcePos.x;
const dy = targetPos.y - sourcePos.y;
const distance = Math.sqrt(dx * dx + dy * dy);
// ... then derive x1, y1, x2, y2 separately
```

### Solution
Extract into helper function before rendering:
```typescript
interface LinkEndpoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const calculateLinkEndpoints = (link: any, nodePositions: Map<string, {x: number; y: number}>): LinkEndpoints => {
  const sourcePos = nodePositions.get(link.source);
  const targetPos = nodePositions.get(link.target);
  if (!sourcePos || !targetPos) return { x1: 0, y1: 0, x2: 0, y2: 0 };

  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance === 0) return { x1: sourcePos.x, y1: sourcePos.y, x2: targetPos.x, y2: targetPos.y };

  const sourceRadius = getNodeSizeByDepth(nodes.find(n => n.id === link.source)?.depth ?? 0);
  const targetRadius = getNodeSizeByDepth(nodes.find(n => n.id === link.target)?.depth ?? 0);

  return {
    x1: sourcePos.x + (dx / distance) * sourceRadius,
    y1: sourcePos.y + (dy / distance) * sourceRadius,
    x2: targetPos.x - (dx / distance) * targetRadius,
    y2: targetPos.y - (dy / distance) * targetRadius,
  };
};

// Pre-calculate all endpoints
const linkEndpoints = new Map(links.map(link => [link, calculateLinkEndpoints(link, nodePositions)]));

// Then in link rendering:
linkGroup.selectAll('line').data(links).join('line')
  .attr('x1', (d: any) => linkEndpoints.get(d)?.x1 ?? 0)
  .attr('y1', (d: any) => linkEndpoints.get(d)?.y1 ?? 0)
  .attr('x2', (d: any) => linkEndpoints.get(d)?.x2 ?? 0)
  .attr('y2', (d: any) => linkEndpoints.get(d)?.y2 ?? 0)
  // ... rest of attributes
```

### Impact
- **Code reduction**: ~70 lines → ~15 lines
- **Performance**: Calculations done once per render instead of 4x during SVG attribute setting
- **Maintainability**: Single source of truth for endpoint calculation

---

## 3. REFACTOR: Arrow Marker Factory

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

