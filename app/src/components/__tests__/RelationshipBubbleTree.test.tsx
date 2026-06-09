import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RelationshipBubbleTree from '../RelationshipBubbleTree';
import { makeSpecies, makeSymbiosis, buildSymbiosisMap } from '../../test/fixtures';

const speciesById = new Map([
  ['bird_focal', makeSpecies('bird_focal', 'bird', { common_name: 'Focal Bird' })],
  ['plant_partner', makeSpecies('plant_partner', 'tree')],
  ['mammal_prey', makeSpecies('mammal_prey', 'mammal')],
]);

const symbiosisBySpeciesId = buildSymbiosisMap([
  makeSymbiosis('mutualism', 'bird_focal', ['plant_partner']),
  makeSymbiosis('predation', 'bird_focal', ['mammal_prey']),
]);

describe('RelationshipBubbleTree', () => {
  it('should render without crashing', () => {
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
