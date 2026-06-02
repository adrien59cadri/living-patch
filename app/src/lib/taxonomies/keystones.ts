import type { Species } from '../../types';
import { getCommonName } from '../labels';

export interface KeystoneDefinition {
  label: string;
  description: string;
}

export interface KeystoneHierarchyNode {
  key: string;
  children?: KeystoneHierarchyNode[];
}

export const KEYSTONE_DEFINITIONS: Record<string, KeystoneDefinition> = {
  // Top-level categories
  predator: {
    label: 'Predator',
    description:
      'Hunters that exert top-down control on prey populations, preventing any one species from dominating. Removing a keystone predator triggers trophic cascades that reshape entire ecosystems.',
  },
  ecosystem_engineer: {
    label: 'Ecosystem Engineer',
    description:
      'Species that physically create, modify, or maintain habitat structure through their behavior. Beavers build dams; boars root the soil; badgers and earthworms reshape the ground layer.',
  },
  foundation_species: {
    label: 'Foundation Species',
    description:
      'Dominant plants whose abundance and physical structure define the habitat. Oaks, beeches, and hemlocks create the canopy, understory shade, and root networks that entire communities depend on.',
  },
  mutualist: {
    label: 'Mutualist',
    description:
      'Species locked in partnerships where both parties benefit. Pollinators and the plants they service, and seed dispersers and the trees they regenerate, are classic keystone mutualisms.',
  },
  trophic_anchor: {
    label: 'Trophic Anchor',
    description:
      'Species whose productivity or abundance provides the energetic foundation of food webs. Host plants for specialists, mast-producing trees, and abundant prey species all anchor trophic networks.',
  },
  // Subtypes: predator
  apex_predator: {
    label: 'Apex Predator',
    description:
      'Top-of-food-chain hunters with no natural predators. Hawks, owls, otters, and falcons regulate populations of rodents, fish, and other prey, keeping ecosystems in balance.',
  },
  insectivore: {
    label: 'Insectivore',
    description:
      'Specialist predators of insects that provide natural regulation of pest populations. Swallows, bats, and dragonflies intercept flying insects; others glean prey from bark and foliage.',
  },
  // Subtypes: ecosystem_engineer
  cavity_creator: {
    label: 'Cavity Creator',
    description:
      'Woodpeckers and other species that excavate holes in dead or living wood. Their abandoned cavities become nest sites for owls, ducks, small mammals, and dozens of other species.',
  },
  habitat_modifier: {
    label: 'Habitat Modifier',
    description:
      'Species that reshape the physical landscape through digging, rooting, or burrowing. Beavers flood meadows into wetlands; boars till the forest floor; badgers and earthworms rework the soil.',
  },
  // Subtypes: mutualist
  pollinator: {
    label: 'Pollinator',
    description:
      'Species that transfer pollen between flowers while feeding on nectar or pollen. Include bees, butterflies, hummingbirds, and beetles.',
  },
  seed_disperser: {
    label: 'Seed Disperser',
    description:
      'Species that move seeds away from parent plants by caching, eating, or carrying them. Jays, squirrels, and bears are major dispersers of tree seeds across landscapes.',
  },
  // Subtypes: trophic_anchor
  host_plant: {
    label: 'Host Plant',
    description:
      'Plants that provide food for specialist herbivores. Monarch caterpillars feed only on milkweed; some insects depend on a single tree species to complete their lifecycle.',
  },
  mast_producer: {
    label: 'Mast Producer',
    description:
      'Trees that produce massive periodic seed crops (mast years) triggering population booms in squirrels, deer, turkeys, bears, and the predators that follow them.',
  },
  forage_species: {
    label: 'Forage Species',
    description:
      'Abundant prey animals that support entire predator guilds. Voles and similar small mammals are consumed by hawks, owls, foxes, and snakes — their population cycles ripple up the food web.',
  },
};

export const KEYSTONE_HIERARCHY: KeystoneHierarchyNode[] = [
  {
    key: 'predator',
    children: [
      { key: 'apex_predator' },
      { key: 'insectivore' },
    ],
  },
  {
    key: 'ecosystem_engineer',
    children: [
      { key: 'cavity_creator' },
      { key: 'habitat_modifier' },
    ],
  },
  {
    key: 'foundation_species',
  },
  {
    key: 'mutualist',
    children: [
      { key: 'pollinator' },
      { key: 'seed_disperser' },
    ],
  },
  {
    key: 'trophic_anchor',
    children: [
      { key: 'host_plant' },
      { key: 'mast_producer' },
      { key: 'forage_species' },
    ],
  },
];

export function getTopLevelKeystoneTypes(): string[] {
  return KEYSTONE_HIERARCHY.map(node => node.key);
}

export function getChildKeystoneTypes(parentKey: string): string[] {
  const node = KEYSTONE_HIERARCHY.find(n => n.key === parentKey);
  return node?.children?.map(child => child.key) ?? [];
}

export function getAllDescendantKeystoneTypes(parentKey: string): string[] {
  const node = KEYSTONE_HIERARCHY.find(n => n.key === parentKey);
  return node?.children?.map(child => child.key) ?? [];
}

export function getKeystonesByType(
  type: string,
  speciesById: Map<string, Species>,
): Species[] {
  const subtypes = getChildKeystoneTypes(type);
  const matchingTypes = new Set([type, ...subtypes]);
  const keystones: Species[] = [];
  speciesById.forEach((species) => {
    if (species.keystone_type != null && matchingTypes.has(species.keystone_type) && species.is_keystone) {
      keystones.push(species);
    }
  });
  return keystones.sort((a, b) => getCommonName(a.common_name).localeCompare(getCommonName(b.common_name)));
}
