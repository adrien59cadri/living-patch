import type { Species } from '../../types';

export interface HabitatDefinition {
  label: string;
  description: string;
}

export interface HabitatHierarchyNode {
  key: string;
  children?: HabitatHierarchyNode[];
}

export const HABITAT_DEFINITIONS: Record<string, HabitatDefinition> = {
  wooded: {
    label: 'Forest & Woodland',
    description:
      'Canopy-covered habitats ranging from dense deciduous and mixed forests to more open woodlands and forest edges. Support species dependent on shade, leaf litter, cavities, and layered structure.',
  },
  forest: {
    label: 'Forest',
    description: 'Continuous canopy forest dominated by mature trees. High structural diversity with distinct canopy, understory, and ground layers.',
  },
  woodland: {
    label: 'Woodland',
    description: 'More open tree-covered habitat with grassy or shrubby understory. Transition zone between forest and open land.',
  },
  open_woodland: {
    label: 'Open woodland',
    description: 'Widely spaced trees with significant open ground between them. Used by species requiring both perch sites and open foraging areas.',
  },
  forest_edge: {
    label: 'Forest edge',
    description: 'Boundary between forest and open habitat. High biodiversity zone where forest and field species overlap.',
  },
  woodland_edge: {
    label: 'Woodland edge',
    description: 'Margin of woodland meeting open or shrubby habitat. Important for cavity-nesting birds and edge-adapted mammals.',
  },
  aquatic: {
    label: 'Wetland & Water',
    description:
      'Water-influenced habitats from open ponds and streams to marshes, beaver ponds, and vernal pools. Critical for waterfowl, amphibians, aquatic insects, and riparian species.',
  },
  wetland: {
    label: 'Wetland',
    description: 'Saturated soil habitat supporting water-adapted vegetation. Provides water filtration, flood control, and habitat for amphibians and waterfowl.',
  },
  wetland_edge: {
    label: 'Wetland edge',
    description: 'Transitional zone between wetland and upland. High use by wading birds, muskrats, and aquatic insects.',
  },
  marsh: {
    label: 'Marsh',
    description: 'Shallow wetland dominated by emergent vegetation like cattails and sedges. Productive breeding habitat for waterfowl and amphibians.',
  },
  pond: {
    label: 'Pond',
    description: 'Standing water body with littoral vegetation. Key habitat for amphibians, aquatic insects, and waterfowl.',
  },
  streamside: {
    label: 'Streamside',
    description: 'Immediate bank zone alongside streams. Used for drinking, bathing, and foraging by a wide range of species.',
  },
  stream_edge: {
    label: 'Stream edge',
    description: 'Vegetated margin along streams. Buffers water quality and provides cover for amphibians and invertebrates.',
  },
  riparian: {
    label: 'Riparian',
    description: 'Corridor along rivers and streams. Disproportionately high biodiversity; used by migrating birds and wide-ranging mammals.',
  },
  open: {
    label: 'Open Land',
    description:
      'Grasslands, fields, and meadows with little or no woody cover. Support grassland-nesting birds, pollinators, and large herbivores. Increasingly rare due to land use change.',
  },
  field: {
    label: 'Field',
    description: 'Open agricultural or fallow ground. Used by foraging raptors, seed-eating birds, and small mammals.',
  },
  field_edge: {
    label: 'Field edge',
    description: 'Shrubby or herbaceous border of fields. Dense nesting cover for sparrows, rabbits, and insects.',
  },
  meadow: {
    label: 'Meadow',
    description: 'Diverse grassland rich in wildflowers and grasses. Supports pollinators, grasshoppers, and meadow-nesting birds.',
  },
  dry_meadow: {
    label: 'Dry meadow',
    description: 'Well-drained grassland on sandy or rocky soil. Warm microclimate favored by reptiles, grasshoppers, and sun-loving plants.',
  },
  wet_meadow: {
    label: 'Wet meadow',
    description: 'Low-lying grassy area with seasonally high water table. Hosts sedges, rushes, and wetland-dependent birds.',
  },
  farmland: {
    label: 'Farmland',
    description: 'Agricultural fields and pastures. Important winter foraging habitat for many species adapted to open disturbed land.',
  },
  scrub: {
    label: 'Scrub & Rocky',
    description:
      'Shrubby thickets, rocky outcrops, slopes, and disturbed or transitional areas. Provide refugia for edge-adapted species, reptiles, and early-successional insects.',
  },
  shrubland: {
    label: 'Shrubland',
    description: 'Dense shrubby vegetation in early-successional or disturbed habitats. Nesting cover for thrashers, towhees, and cottontails.',
  },
  rocky_slope: {
    label: 'Rocky slope',
    description: 'Exposed rock faces and talus. Warm microhabitats used by reptiles, rock-dwelling invertebrates, and cliff-nesting raptors.',
  },
  urban: {
    label: 'Garden & Urban',
    description:
      'Human-managed green spaces including gardens, parks, and suburban greenways. Increasingly important refugia for urban-adapted wildlife and pollinator corridors.',
  },
  garden: {
    label: 'Garden',
    description: 'Cultivated domestic and community gardens. High use by pollinators, songbirds, and small mammals when planted with native species.',
  },
  park: {
    label: 'Park',
    description: 'Public green space with mixed vegetation. Urban refugia for migratory birds and generalist mammals.',
  },
  suburban: {
    label: 'Suburban',
    description: 'Low-density residential areas with gardens, lawns, and street trees. Corridor habitat for wide-ranging species tolerant of human activity.',
  },
};

export const HABITAT_HIERARCHY: HabitatHierarchyNode[] = [
  {
    key: 'wooded',
    children: [
      { key: 'forest' },
      { key: 'woodland' },
      { key: 'open_woodland' },
      { key: 'forest_edge' },
      { key: 'woodland_edge' },
    ],
  },
  {
    key: 'aquatic',
    children: [
      { key: 'wetland' },
      { key: 'wetland_edge' },
      { key: 'marsh' },
      { key: 'pond' },
      { key: 'streamside' },
      { key: 'stream_edge' },
      { key: 'riparian' },
    ],
  },
  {
    key: 'open',
    children: [
      { key: 'field' },
      { key: 'field_edge' },
      { key: 'meadow' },
      { key: 'dry_meadow' },
      { key: 'wet_meadow' },
      { key: 'farmland' },
    ],
  },
  {
    key: 'scrub',
    children: [
      { key: 'shrubland' },
      { key: 'rocky_slope' },
    ],
  },
  {
    key: 'urban',
    children: [
      { key: 'garden' },
      { key: 'park' },
      { key: 'suburban' },
    ],
  },
];

export function getTopLevelHabitats(): string[] {
  return HABITAT_HIERARCHY.map(node => node.key);
}

export function getChildHabitats(parentKey: string): string[] {
  const node = HABITAT_HIERARCHY.find(n => n.key === parentKey);
  return node?.children?.map(child => child.key) ?? [];
}

export function getAllDescendantHabitats(parentKey: string): string[] {
  const descendants: string[] = [];
  const node = HABITAT_HIERARCHY.find(n => n.key === parentKey);

  function collectDescendants(n: HabitatHierarchyNode) {
    if (n.children) {
      for (const child of n.children) {
        descendants.push(child.key);
        collectDescendants(child);
      }
    }
  }

  if (node) {
    collectDescendants(node);
  }

  return descendants;
}

export function getHabitatExamples(habitatKey: string, speciesById: Map<string, Species>): Species[] {
  return Array.from(speciesById.values())
    .filter(s => Array.isArray(s.habitat) && s.habitat.includes(habitatKey))
    .slice(0, 3);
}
