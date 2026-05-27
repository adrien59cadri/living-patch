import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RelationshipBubbleTree from '../RelationshipBubbleTree';
import type { HierarchyInput } from '../../types';

const createMockHierarchy = (): HierarchyInput => ({
  id: 'focal-1',
  name: 'Focal Species',
  type: 'focal',
  children: [
    {
      id: 'category-mutualism',
      name: 'Mutualism',
      type: 'category',
      relationshipType: 'mutualism',
      children: [
        {
          id: 'species-1',
          name: 'Partner Species',
          type: 'species',
          relationshipType: 'mutualism',
        },
      ],
    },
    {
      id: 'category-predation',
      name: 'Predation',
      type: 'category',
      relationshipType: 'predation',
      children: [
        {
          id: 'species-2',
          name: 'Prey Species',
          type: 'species',
          relationshipType: 'predation',
        },
      ],
    },
  ],
});

describe('RelationshipBubbleTree', () => {
  it('should render without crashing', () => {
    const hierarchy = createMockHierarchy();
    const { container } = render(
      <RelationshipBubbleTree focalId="focal-1" data={hierarchy} />
    );

    expect(container).toBeTruthy();
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should render SVG with proper structure', () => {
    const hierarchy = createMockHierarchy();
    const { container } = render(
      <RelationshipBubbleTree focalId="focal-1" data={hierarchy} />
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
    const hierarchy = createMockHierarchy();
    const { container } = render(
      <RelationshipBubbleTree focalId="focal-1" data={hierarchy} />
    );

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('should render labels for nodes', () => {
    const hierarchy = createMockHierarchy();
    const { container } = render(
      <RelationshipBubbleTree focalId="focal-1" data={hierarchy} />
    );

    const textElements = container.querySelectorAll('text');
    expect(textElements.length).toBeGreaterThan(0);

    // Check if focal species name is rendered
    const textContent = Array.from(textElements)
      .map(el => el.textContent)
      .join(' ');
    expect(textContent).toContain('Focal Species');
  });

  it('should render links between nodes', () => {
    const hierarchy = createMockHierarchy();
    const { container } = render(
      <RelationshipBubbleTree focalId="focal-1" data={hierarchy} />
    );

    const paths = container.querySelectorAll('g.links path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('should call onNodeClick when species node is clicked', async () => {
    const hierarchy = createMockHierarchy();
    const mockClick = vi.fn();
    const { container } = render(
      <RelationshipBubbleTree
        focalId="focal-1"
        data={hierarchy}
        onNodeClick={mockClick}
      />
    );

    // Find species nodes (should have class node-species)
    const speciesNodes = container.querySelectorAll('g.node-species');
    expect(speciesNodes.length).toBe(2); // Two species in the hierarchy

    // Click the first species node
    if (speciesNodes.length > 0) {
      const firstSpeciesNode = speciesNodes[0] as SVGGElement;
      const clickEvent = new MouseEvent('click', { bubbles: true });
      firstSpeciesNode.dispatchEvent(clickEvent);

      // Callback should be called
      expect(mockClick).toHaveBeenCalled();
    }
  });

  it('should respect height prop', () => {
    const hierarchy = createMockHierarchy();
    const { container } = render(
      <RelationshipBubbleTree
        focalId="focal-1"
        data={hierarchy}
        height={500}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('height')).toBe('500');
  });

  it('should respect width prop', () => {
    const hierarchy = createMockHierarchy();
    const { container } = render(
      <RelationshipBubbleTree
        focalId="focal-1"
        data={hierarchy}
        width={800}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('800');
  });

  it('should render legend with relationship types', () => {
    const hierarchy = createMockHierarchy();
    const { container } = render(
      <RelationshipBubbleTree focalId="focal-1" data={hierarchy} />
    );

    const legendTexts = Array.from(container.querySelectorAll('text'))
      .map(el => el.textContent)
      .join(' ');

    expect(legendTexts).toContain('Mutualism');
    expect(legendTexts).toContain('Predation');
  });

  it('should handle maxDepth filtering', () => {
    const hierarchy: HierarchyInput = {
      id: 'focal-1',
      name: 'Focal',
      type: 'focal',
      children: [
        {
          id: 'category-1',
          name: 'Category',
          type: 'category',
          relationshipType: 'mutualism',
          children: [
            {
              id: 'species-1',
              name: 'Species 1',
              type: 'species',
              relationshipType: 'mutualism',
            },
          ],
        },
      ],
    };

    const { container: container1 } = render(
      <RelationshipBubbleTree
        focalId="focal-1"
        data={hierarchy}
        maxDepth={1}
      />
    );

    const { container: container2 } = render(
      <RelationshipBubbleTree
        focalId="focal-1"
        data={hierarchy}
        maxDepth={2}
      />
    );

    // Both should render, but with different depths
    expect(container1.querySelector('svg')).toBeTruthy();
    expect(container2.querySelector('svg')).toBeTruthy();
  });
});
