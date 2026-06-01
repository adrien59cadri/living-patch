import type { Species, Symbiosis } from '../types';
import { getCommonName } from './labels';

export interface FormDefinition {
  label: string;
  description: string;
}

export interface KeystoneDefinition {
  label: string;
  description: string;
}

export interface SymbiosisDefinition {
  label: string;
  description: string;
  explanation: string;
}

export const FORM_DEFINITIONS: Record<string, FormDefinition> = {
  bird: {
    label: 'Bird',
    description:
      'Feathered vertebrates with wings, beaks, and hollow bones. Birds fill diverse ecological roles from apex predators to seed dispersers, pollinators, and cavity creators.',
  },
  woodpecker: {
    label: 'Woodpecker',
    description:
      'Large, powerful-beaked birds that drum on wood to find insects and communicate. Important cavity creators that provide nesting sites for owls, kestrels, wood ducks, and flying squirrels.',
  },
  raptor: {
    label: 'Raptor',
    description:
      'Birds of prey with sharp talons and hooked beaks. Hunt from open perches and while soaring. Control populations of small mammals, rodents, and other birds.',
  },
  owl: {
    label: 'Owl',
    description:
      'Night-hunting raptors with forward-facing eyes and silent flight. Hunt small mammals, rodents, and insects under cover of darkness. Depend on cavities created by other species.',
  },
  songbird: {
    label: 'Songbird',
    description:
      'Small birds with complex vocalizations. Includes warblers, hummingbirds, and other common backyard birds. Important for insect control and seed dispersal.',
  },
  warbler: {
    label: 'Warbler',
    description:
      'Small songbirds with intricate songs and patterns. Most are spring and fall migrants passing through our region. Important insect controllers during breeding season.',
  },
  hummingbird: {
    label: 'Hummingbird',
    description:
      'Tiny birds with rapid wing beats and needle-like beaks. Feed on nectar and small insects. Important pollinators for wildflowers and gardens.',
  },
  wading_bird: {
    label: 'Wading Bird',
    description:
      'Long-legged birds that hunt in shallow water and wetlands. Feed on fish, amphibians, and invertebrates. Depend on healthy wetland ecosystems.',
  },
  mammal: {
    label: 'Mammal',
    description:
      'Warm-blooded vertebrates with fur or hair. Include herbivores, predators, and omnivores. Create habitats, control populations, and disperse seeds.',
  },
  tree: {
    label: 'Tree',
    description:
      'Woody plants that provide food, shelter, and structure for hundreds of other species. Root systems stabilize soil; canopies provide nesting and foraging sites.',
  },
  wildflower: {
    label: 'Wildflower',
    description:
      'Native flowering plants that attract pollinators and provide nectar and seeds. Color and diversity of the meadow; foundation of food webs.',
  },
  shrub: {
    label: 'Shrub',
    description:
      'Woody plants smaller than trees that provide dense cover, nesting sites, and food (berries, seeds). Create layered habitat structure.',
  },
  plant: {
    label: 'Plant',
    description:
      'Photosynthetic organisms that form the foundation of food webs, provide shelter and nesting sites, produce oxygen, stabilize soil, and cycle nutrients.',
  },
  insect: {
    label: 'Insect',
    description:
      'Six-legged arthropods with incredible diversity. Essential pollinators, decomposers, and food sources for birds and other animals. Indicators of ecosystem health.',
  },
  butterfly: {
    label: 'Butterfly',
    description:
      'Winged insects with complete life cycles (egg, caterpillar, chrysalis, adult). Adults pollinate flowers; caterpillars are food for birds. Indicators of ecosystem health.',
  },
  beetle: {
    label: 'Beetle',
    description:
      'Diverse insects that live in soil, wood, and vegetation. Include predators and herbivores. Food for birds and other animals; decompose dead wood.',
  },
  bug: {
    label: 'Bug',
    description:
      'Insects with piercing-sucking mouthparts (aphids, true bugs). Feed on plant sap and are prey for birds, spiders, and beneficial insects.',
  },
  bee: {
    label: 'Bee',
    description:
      'Flying insects vital for pollination. Transfer pollen between flowers, allowing fruits and seeds to develop. Support entire food webs through pollination.',
  },
  frog: {
    label: 'Frog',
    description:
      'Amphibians that live partly in water, partly on land. Tadpoles eat algae; adults eat insects. Indicators of water quality; vulnerable to habitat loss.',
  },
  bat: {
    label: 'Bat',
    description:
      'Flying mammals that hunt insects at night using echolocation. Essential pest controllers; eat thousands of insects per night. Important pollinators for some plants.',
  },
  duck: {
    label: 'Duck',
    description:
      'Waterfowl that dabble or dive for food in wetlands. Play important roles in aquatic food webs and nutrient cycling. Migrate seasonally.',
  },
  dragonfly: {
    label: 'Dragonfly',
    description:
      'Large predatory insects with two pairs of wings. Hunt flying insects over water and wetlands. Aquatic nymphs are indicators of water quality.',
  },
  grasshopper: {
    label: 'Grasshopper',
    description:
      'Jumping insects found in grasslands and meadows. Important herbivores; food for birds, spiders, and small mammals.',
  },
  moth: {
    label: 'Moth',
    description:
      'Winged insects closely related to butterflies. Many are nocturnal pollinators. Caterpillars are important food source for birds.',
  },
  salamander: {
    label: 'Salamander',
    description:
      'Small amphibians that live in moist habitats. Predators of insects and other invertebrates. Indicators of forest health and water quality.',
  },
  spider: {
    label: 'Spider',
    description:
      'Eight-legged arachnids that hunt insects. Essential predators that control insect populations. Build webs or actively hunt.',
  },
  turtle: {
    label: 'Turtle',
    description:
      'Reptiles with hard shells that live in water or on land. Play important roles in aquatic and terrestrial ecosystems. Long-lived and slow to reproduce.',
  },
  amphibian: {
    label: 'Amphibian',
    description:
      'Cold-blooded vertebrates that live both in water and on land. Include frogs, toads, and salamanders. Highly sensitive to environmental change; key indicators of ecosystem health.',
  },
  reptile: {
    label: 'Reptile',
    description:
      'Cold-blooded vertebrates with scales. Include turtles, snakes, and lizards. Important predators and prey in aquatic and terrestrial ecosystems.',
  },
};

export const KEYSTONE_DEFINITIONS: Record<string, KeystoneDefinition> = {
  ecosystem_engineer: {
    label: 'Ecosystem Engineer',
    description:
      'Species that create, modify, or maintain habitat structure. Woodpeckers excavate cavities; beavers build dams; trees provide framework for entire communities.',
  },
  predator: {
    label: 'Predator',
    description:
      'Hunters that control prey populations and prevent any one species from dominating. Hawks and owls control rodents; spiders control insects.',
  },
  mutualist: {
    label: 'Mutualist',
    description:
      'Species that exchange resources with partners, both benefiting from the relationship. Bees and flowers pollinate each other; some plants fix nitrogen for soil.',
  },
  pollinator: {
    label: 'Pollinator',
    description:
      'Species that transfer pollen between flowers while feeding on nectar or pollen. Include bees, butterflies, hummingbirds, and beetles.',
  },
  host_plant: {
    label: 'Host Plant',
    description:
      'Plants that provide food for specialist herbivores. Monarch caterpillars feed only on milkweed; some insects depend on a single tree species.',
  },
  prey: {
    label: 'Prey',
    description:
      'Species that serve as food for predators. Small mammals, insects, and other animals form the base of food chains and support higher predators.',
  },
  structural: {
    label: 'Structural Species',
    description:
      'Species whose physical presence creates habitat or modifies the environment. Trees form canopy layers; shrubs create cover; logs provide micro-habitats.',
  },
};

export const SYMBIOSIS_DEFINITIONS: Record<string, SymbiosisDefinition> = {
  mutualism: {
    label: 'Mutualism',
    description: 'Both species benefit from the relationship.',
    explanation:
      'In mutualism, both partners gain advantages. Bees pollinate flowers while gathering nectar. Hummingbirds feed on flower nectar while pollinating wildflowers. These relationships strengthen when both partners thrive.',
  },
  parasitism: {
    label: 'Parasitism & Hosting',
    description: 'One species benefits, the other is harmed.',
    explanation:
      'The parasite benefits at the host\'s expense. Monarch caterpillars feed on milkweed leaves, which harms the plant but feeds the caterpillar. The plant may survive with reduced growth, but the relationship is one-sided.',
  },
  predation: {
    label: 'Predation',
    description: 'A predator hunts and eats prey.',
    explanation:
      'The predator benefits by obtaining food; the prey is harmed or killed. Hawks hunt voles; voles eat seeds. Predation controls prey populations, preventing overgrazing or overconsumption of resources.',
  },
  competition: {
    label: 'Competition',
    description: 'Species compete for the same resources.',
    explanation:
      'Both species are harmed when competing for limited food, water, or space. Dense plants compete for sunlight. When resources are scarce, one species may exclude another.',
  },
  commensalism: {
    label: 'Commensalism',
    description: 'One species benefits, the other is unaffected.',
    explanation:
      'One partner gains while the other neither benefits nor is harmed. Epiphytes (plants growing on trees) use trees for support without damaging them. Remora fish attach to sharks for transport without harming the shark.',
  },
};

export function getFormExamples(form: string, speciesById: Map<string, Species>, taxonomicGroupIds?: Set<string>): Species[] {
  const groupIds = taxonomicGroupIds || new Set<string>();
  const examples: Species[] = [];
  speciesById.forEach((species) => {
    if (species.form === form && !groupIds.has(species.id) && examples.length < 3) {
      examples.push(species);
    }
  });
  return examples;
}

export function getKeystonesByType(
  type: string,
  speciesById: Map<string, Species>,
): Species[] {
  const keystones: Species[] = [];
  speciesById.forEach((species) => {
    if (species.keystone_type === type && species.is_keystone) {
      keystones.push(species);
    }
  });
  return keystones.sort((a, b) => getCommonName(a.common_name).localeCompare(getCommonName(b.common_name)));
}

export function getSymbiosisByType(
  type: 'mutualism' | 'parasitism' | 'predation' | 'competition' | 'commensalism',
  symbiosis: Symbiosis[],
): Symbiosis[] {
  return symbiosis.filter((s) => s.type === type);
}

export function getSymbiosisExample(
  type: 'mutualism' | 'parasitism' | 'predation' | 'competition' | 'commensalism',
  symbiosis: Symbiosis[],
): Symbiosis | undefined {
  const matches = getSymbiosisByType(type, symbiosis);
  return matches.length > 0 ? matches[0] : undefined;
}

export interface FormHierarchyNode {
  key: string;
  children?: FormHierarchyNode[];
}

export const FORM_HIERARCHY: FormHierarchyNode[] = [
  {
    key: 'bird',
    children: [
      { key: 'woodpecker' },
      { key: 'raptor' },
      { key: 'owl' },
      { key: 'duck' },
      {
        key: 'songbird',
        children: [
          { key: 'warbler' },
          { key: 'hummingbird' },
        ],
      },
      { key: 'wading_bird' },
    ],
  },
  {
    key: 'mammal',
    children: [
      { key: 'bat' },
    ],
  },
  {
    key: 'plant',
    children: [
      { key: 'tree' },
      { key: 'wildflower' },
      { key: 'shrub' },
    ],
  },
  {
    key: 'insect',
    children: [
      { key: 'butterfly' },
      { key: 'beetle' },
      { key: 'bug' },
      { key: 'bee' },
      { key: 'dragonfly' },
      { key: 'grasshopper' },
      { key: 'moth' },
      { key: 'spider' },
    ],
  },
  {
    key: 'amphibian',
    children: [
      { key: 'frog' },
      { key: 'salamander' },
    ],
  },
  {
    key: 'reptile',
    children: [
      { key: 'turtle' },
    ],
  },
];

// Utility functions for working with form hierarchy
export function getTopLevelForms(): string[] {
  return FORM_HIERARCHY.map(node => node.key);
}

export function getChildForms(parentKey: string): string[] {
  const node = FORM_HIERARCHY.find(n => n.key === parentKey);
  return node?.children?.map(child => child.key) ?? [];
}

export function getAllDescendantForms(parentKey: string): string[] {
  const descendants: string[] = [];
  const node = FORM_HIERARCHY.find(n => n.key === parentKey);
  
  function collectDescendants(node: FormHierarchyNode) {
    if (node.children) {
      for (const child of node.children) {
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

// ============================================================================
// HABITAT HIERARCHY
// ============================================================================

export interface HabitatHierarchyNode {
  key: string;
  children?: HabitatHierarchyNode[];
}

export interface HabitatDefinition {
  label: string;
  description: string;
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
