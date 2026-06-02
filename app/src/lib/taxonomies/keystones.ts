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
  resource_provider: {
    label: 'Resource Provider',
    description:
      'Species whose primary keystone role is producing food, shelter, or other resources consumed by many other species. Mast crops, host plants, and abundant prey species anchor food webs.',
  },
  // Subtypes: ecosystem_engineer
  foundation_species: {
    label: 'Foundation Species',
    description:
      'Trees and plants whose physical structure defines habitat. Pines, hemlocks, and oaks create the canopy, understory, and root networks that entire communities depend on.',
  },
  // Subtypes: predator
  aerial_insect_suppression: {
    label: 'Aerial Insect Suppression',
    description:
      'Species that catch flying insects in mid-air, providing natural control of mosquitoes, gnats, and other pest insects. Swallows, bats, and dragonflies fill this role.',
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
  // Subtypes: resource_provider
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
  prey_base: {
    label: 'Prey Base',
    description:
      'Abundant prey species that support entire predator guilds. Cottontails, voles, and similar species are consumed by hawks, owls, foxes, and snakes — their population cycles ripple up the food web.',
  },
};

export const KEYSTONE_HIERARCHY: KeystoneHierarchyNode[] = [
  {
    key: 'ecosystem_engineer',
    children: [
      { key: 'foundation_species' },
    ],
  },
  {
    key: 'predator',
    children: [
      { key: 'aerial_insect_suppression' },
    ],
  },
  {
    key: 'mutualist',
    children: [
      { key: 'pollinator' },
      { key: 'seed_disperser' },
    ],
  },
  {
    key: 'resource_provider',
    children: [
      { key: 'host_plant' },
      { key: 'mast_producer' },
      { key: 'prey_base' },
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
