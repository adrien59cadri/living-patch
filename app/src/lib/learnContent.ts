import type { Species, Symbiosis } from '../types';

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
  return keystones.sort((a, b) => a.common_name.localeCompare(b.common_name));
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
