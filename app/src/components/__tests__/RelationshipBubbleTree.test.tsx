import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RelationshipBubbleTree from '../RelationshipBubbleTree';
import type { Species, Symbiosis } from '../../types';

const createMockSpecies = (): Map<string, Species> => {
  const species: Species[] = [
    {
      id: 'bird_focal',
      common_name: 'Focal Bird',
      latin_name: 'Avem focalis',
      form: 'bird',
      habitat: ['forest'],
      diet: ['insect_eater'],
      behavior: ['soaring'],
      season: ['year_round'],
      functional_description: 'A focal bird',
      life_stages: [],
      region: 'northeast_pa',
      ecological_role: 'carnivore',
    },
    {
      id: 'plant_partner',
      common_name: 'Partner Plant',
      latin_name: 'Planta mutualis',
      form: 'tree',
      habitat: ['forest'],
      diet: [],
      behavior: ['mast_producer'],
      season: ['year_round'],
      functional_description: 'A mutualist plant',
      life_stages: [],
      region: 'northeast_pa',
      ecological_role: 'producer',
    },
    {
      id: 'mammal_prey',
      common_name: 'Prey Mammal',
      latin_name: 'Mus praedatus',
      form: 'mammal',
      habitat: ['field'],
      diet: ['herbivore'],
      behavior: ['grazer'],
      season: ['year_round'],
      functional_description: 'A prey mammal',
      life_stages: [],
      region: 'northeast_pa',
      ecological_role: 'herbivore',
    },
  ];

  return new Map(species.map(s => [s.id, s]));
};

const createMockSymbioses = (): Map<string, Symbiosis[]> => {
  const symbioses: Symbiosis[] = [
    {
      type: 'mutualism',
      members: ['bird_focal', 'plant_partner'],
      strength: 'incidental',
      notes: 'Mock mutualism',
    },
    {
      type: 'predation',
      members: ['bird_focal', 'mammal_prey'],
      impacted_species: 'mammal_prey',
      strength: 'incidental',
      notes: 'Mock predation',
    },
  ];

  const map = new Map<string, Symbiosis[]>();
  for (const symbiosis of symbioses) {
    for (const memberId of symbiosis.members) {
      if (!map.has(memberId)) {
        map.set(memberId, []);
      }
      map.get(memberId)!.push(symbiosis);
    }
  }

  return map;
};

describe('RelationshipBubbleTree', () => {
  it('should render without crashing', () => {
    const speciesById = createMockSpecies();
    const symbiosisBySpeciesId = createMockSymbioses();

    const { container } = render(
      <RelationshipBubbleTree
        focalId="bird_focal"
        speciesById={speciesById}
        symbiosisBySpeciesId={symbiosisBySpeciesId}
      />
    );

    expect(container).toBeTruthy();
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should render SVG with proper structure', () => {
    const speciesById = createMockSpecies();
    const symbiosisBySpeciesId = createMockSymbioses();

    const { container } = render(
      <RelationshipBubbleTree
        focalId="bird_focal"
        speciesById={speciesById}
        symbiosisBySpeciesId={symbiosisBySpeciesId}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    // Should have groups for links and nodes
    const linkGroup = container.querySelector('g.links');
    const nodeGroup = container.querySelector('g.nodes');
    expect(linkGroup).toBeTruthy();
    expect(nodeGroup).toBeTruthy();
  });

  it('should render nodes as circles', () => {
    const speciesById = createMockSpecies();
    const symbiosisBySpeciesId = createMockSymbioses();

    const { container } = render(
      <RelationshipBubbleTree
        focalId="bird_focal"
        speciesById={speciesById}
        symbiosisBySpeciesId={symbiosisBySpeciesId}
      />
    );

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('should render labels for nodes', () => {
    const speciesById = createMockSpecies();
    const symbiosisBySpeciesId = createMockSymbioses();

    const { container } = render(
      <RelationshipBubbleTree
        focalId="bird_focal"
        speciesById={speciesById}
        symbiosisBySpeciesId={symbiosisBySpeciesId}
      />
    );

    const textElements = container.querySelectorAll('text');
    expect(textElements.length).toBeGreaterThan(0);

    // Check if focal species name is rendered
    const textContent = Array.from(textElements)
      .map(el => el.textContent)
      .join(' ');
    expect(textContent).toContain('Focal Bird');
  });

  it('should render links between nodes', () => {
    const speciesById = createMockSpecies();
    const symbiosisBySpeciesId = createMockSymbioses();

    const { container } = render(
      <RelationshipBubbleTree
        focalId="bird_focal"
        speciesById={speciesById}
        symbiosisBySpeciesId={symbiosisBySpeciesId}
      />
    );

    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('should call onNodeClick when species node is clicked', async () => {
    const speciesById = createMockSpecies();
    const symbiosisBySpeciesId = createMockSymbioses();
    const mockClick = vi.fn();

    const { container } = render(
      <RelationshipBubbleTree
        focalId="bird_focal"
        speciesById={speciesById}
        symbiosisBySpeciesId={symbiosisBySpeciesId}
        onNodeClick={mockClick}
      />
    );

    // Find all node groups
    const nodeGroups = container.querySelectorAll('g.nodes g');
    expect(nodeGroups.length).toBeGreaterThan(1); // Focal + at least one neighbor

    // Click on a non-focal node (e.g., the first neighbor)
    if (nodeGroups.length > 1) {
      const nonFocalNode = nodeGroups[1] as SVGGElement;
      const clickEvent = new MouseEvent('click', { bubbles: true });
      nonFocalNode.dispatchEvent(clickEvent);

      // Callback should be called
      expect(mockClick).toHaveBeenCalled();
    }
  });

  it('should respect height prop', () => {
    const speciesById = createMockSpecies();
    const symbiosisBySpeciesId = createMockSymbioses();

    const { container } = render(
      <RelationshipBubbleTree
        focalId="bird_focal"
        speciesById={speciesById}
        symbiosisBySpeciesId={symbiosisBySpeciesId}
        height={500}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('height')).toBe('500');
  });

  it('should respect width prop', () => {
    const speciesById = createMockSpecies();
    const symbiosisBySpeciesId = createMockSymbioses();

    const { container } = render(
      <RelationshipBubbleTree
        focalId="bird_focal"
        speciesById={speciesById}
        symbiosisBySpeciesId={symbiosisBySpeciesId}
        width={800}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('800');
  });

  it('should respect maxDepth prop', () => {
    const speciesById = createMockSpecies();
    const symbiosisBySpeciesId = createMockSymbioses();

    const { container: container1 } = render(
      <RelationshipBubbleTree
        focalId="bird_focal"
        speciesById={speciesById}
        symbiosisBySpeciesId={symbiosisBySpeciesId}
        maxDepth={1}
      />
    );

    const { container: container3 } = render(
      <RelationshipBubbleTree
        focalId="bird_focal"
        speciesById={speciesById}
        symbiosisBySpeciesId={symbiosisBySpeciesId}
        maxDepth={3}
      />
    );

    // Both should render without error
    expect(container1.querySelector('svg')).toBeTruthy();
    expect(container3.querySelector('svg')).toBeTruthy();
  });
});
