import type { Species } from '../../types';

export interface FormDefinition {
  label: string;
  description: string;
}

export interface FormHierarchyNode {
  key: string;
  children?: FormHierarchyNode[];
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
  fungus: {
    label: 'Fungus',
    description:
      'Decomposers and mutualists that play essential roles in ecosystems. Break down dead organic matter, recycle nutrients, and form symbiotic relationships with plants. Include mushrooms, molds, and yeasts.',
  },
};

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
  {
    key: 'fungus',
    children: [],
  },
];

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
