import type { Symbiosis } from '../../types';

export interface SymbiosisDefinition {
  label: string;
  description: string;
  explanation: string;
}

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
  amensalism: {
    label: 'Amensalism',
    description: 'One species harms another without competing for the same resource.',
    explanation:
      'One species is suppressed or harmed while the other is unaffected or gains indirectly. Unlike competition, the two parties are not vying for the same resource — the harm is one-sided and often chemical or structural. Garlic mustard releases allelopathic compounds that destroy mycorrhizal fungal networks, starving native trees without competing with them directly. Invasive vines that smother native shrubs follow the same pattern.',
  },
};

export function getSymbiosisByType(
  type: 'mutualism' | 'parasitism' | 'predation' | 'competition' | 'commensalism' | 'amensalism',
  symbiosis: Symbiosis[],
): Symbiosis[] {
  return symbiosis.filter((s) => s.type === type);
}

export function getSymbiosisExample(
  type: 'mutualism' | 'parasitism' | 'predation' | 'competition' | 'commensalism' | 'amensalism',
  symbiosis: Symbiosis[],
): Symbiosis | undefined {
  const matches = getSymbiosisByType(type, symbiosis);
  return matches.length > 0 ? matches[0] : undefined;
}
