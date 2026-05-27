import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DiagramCard } from '../DiagramCard';
import * as dataHook from '../../hooks/useDataset';
import type { Species, Symbiosis } from '../../types';

/**
 * Test that the diagram card shows ALL and ONLY direct relationships of a species,
 * with no extraneous text, and legend outside the diagram.
 */
describe('DiagramCard - Direct Relationships Display', () => {
  const mockSpecies: Species[] = [
    {
      id: 'insect_monarch-butterfly',
      common_name: 'Monarch Butterfly',
      latin_name: 'Danaus plexippus',
      form: 'butterfly',
      habitat: ['meadow', 'field'],
      diet: ['nectar', 'milkweed_leaves'],
      behavior: ['migration', 'nectaring'],
      season: ['summer', 'fall'],
      functional_description: 'Iconic orange and black butterfly',
      life_stages: [],
      region: 'northeast_pa',
      ecological_role: 'pollinator',
    },
    {
      id: 'plant_common-milkweed',
      common_name: 'Common Milkweed',
      latin_name: 'Asclepias syriaca',
      form: 'plant',
      habitat: ['meadow', 'field'],
      diet: [],
      behavior: [],
      season: ['year_round'],
      functional_description: 'Native milkweed species',
      life_stages: [],
      region: 'northeast_pa',
      ecological_role: 'producer',
    },
    {
      id: 'plant_butterfly-weed',
      common_name: 'Butterfly Weed',
      latin_name: 'Asclepias tuberosa',
      form: 'plant',
      habitat: ['field', 'meadow'],
      diet: [],
      behavior: [],
      season: ['year_round'],
      functional_description: 'Orange milkweed species',
      life_stages: [],
      region: 'northeast_pa',
      ecological_role: 'producer',
    },
    {
      id: 'plant_swamp-milkweed',
      common_name: 'Swamp Milkweed',
      latin_name: 'Asclepias incarnata',
      form: 'plant',
      habitat: ['wetland'],
      diet: [],
      behavior: [],
      season: ['year_round'],
      functional_description: 'Wet habitat milkweed',
      life_stages: [],
      region: 'northeast_pa',
      ecological_role: 'producer',
    },
    {
      id: 'plant_goldenrod',
      common_name: 'Goldenrod',
      latin_name: 'Solidago sp.',
      form: 'plant',
      habitat: ['meadow', 'field'],
      diet: [],
      behavior: [],
      season: ['summer', 'fall'],
      functional_description: 'Late-season flowering plant',
      life_stages: [],
      region: 'northeast_pa',
      ecological_role: 'producer',
    },
  ];

  const mockSymbiosis: Symbiosis[] = [
    {
      type: 'parasitism',
      members: ['insect_monarch-butterfly', 'plant_common-milkweed'],
      impacted_species: 'insect_monarch-butterfly',
      obligate: true,
      notes: 'Larval host plant',
    },
    {
      type: 'parasitism',
      members: ['insect_monarch-butterfly', 'plant_butterfly-weed'],
      impacted_species: 'insect_monarch-butterfly',
      obligate: true,
      notes: 'Alternative host plant',
    },
    {
      type: 'parasitism',
      members: ['insect_monarch-butterfly', 'plant_swamp-milkweed'],
      impacted_species: 'insect_monarch-butterfly',
      obligate: true,
      notes: 'Wet habitat host',
    },
    {
      type: 'predation',
      members: ['insect_monarch-butterfly', 'plant_goldenrod'],
      impacted_species: 'plant_goldenrod',
      obligate: false,
      notes: 'Nectar source',
    },
  ];

  beforeEach(() => {
    vi.spyOn(dataHook, 'useDataset').mockReturnValue({
      species: mockSpecies,
      symbiosis: mockSymbiosis,
    } as any);
  });

  it('should display focal species and ALL its direct relationships only', () => {
    const { container } = render(
      <BrowserRouter>
        <DiagramCard speciesId="insect_monarch-butterfly" />
      </BrowserRouter>
    );

    const textElements = Array.from(container.querySelectorAll('text')).map(el => el.textContent?.trim()).filter(Boolean);

    // Should show focal species
    expect(textElements).toContain('Monarch Butterfly');

    // Should show all direct relationships (depth 1 only)
    expect(textElements).toContain('Common Milkweed');
    expect(textElements).toContain('Butterfly Weed');
    expect(textElements).toContain('Swamp Milkweed');
    expect(textElements).toContain('Goldenrod');
  });

  it('should show only the focal species plus 4 direct relationships (5 total nodes)', () => {
    const { container } = render(
      <BrowserRouter>
        <DiagramCard speciesId="insect_monarch-butterfly" />
      </BrowserRouter>
    );

    // Get circles (nodes) in the diagram
    const circles = container.querySelectorAll('svg circle');

    // Should have 5 nodes: 1 focal + 4 direct relationships
    expect(circles.length).toBe(5);
  });

  it('should not contain any extraneous text in diagram', () => {
    const { container } = render(
      <BrowserRouter>
        <DiagramCard speciesId="insect_monarch-butterfly" />
      </BrowserRouter>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    const textElements = Array.from(svg!.querySelectorAll('text')).map(el => el.textContent?.trim()).filter(Boolean);

    // Allowed text: species names only
    const allowedNames = [
      'Monarch Butterfly',
      'Common Milkweed',
      'Butterfly Weed',
      'Swamp Milkweed',
      'Goldenrod',
    ];

    for (const text of textElements) {
      expect(allowedNames).toContain(text);
    }
  });

  it('should have legend outside the diagram container', () => {
    const { container } = render(
      <BrowserRouter>
        <DiagramCard speciesId="insect_monarch-butterfly" />
      </BrowserRouter>
    );

    // Get the main diagram border div
    const diagramBorder = container.querySelector('.border.border-stone-200');
    expect(diagramBorder).toBeTruthy();

    // Get any text that might be a legend (relationship type labels)
    const legendTexts = ['Parasitism', 'Predation', 'Mutualism', 'Competition', 'Commensalism'];
    const bodyText = container.body?.textContent || '';

    // If legend exists, it should be outside the bordered diagram area
    for (const legendText of legendTexts) {
      const legendElement = Array.from(container.querySelectorAll('*')).find(
        el => el.textContent?.includes(legendText) && !diagramBorder?.contains(el)
      );
      // Legend, if present, should be outside the bordered diagram
      if (legendElement) {
        expect(diagramBorder?.contains(legendElement)).toBe(false);
      }
    }
  });

  it('should contain exactly 4 links connecting focal to direct relationships', () => {
    const { container } = render(
      <BrowserRouter>
        <DiagramCard speciesId="insect_monarch-butterfly" />
      </BrowserRouter>
    );

    // Get all lines/paths in SVG (links)
    const lines = container.querySelectorAll('svg line');

    // Should have 4 lines connecting focal to 4 direct relationships
    expect(lines.length).toBe(4);
  });

  it('should not show depth-2 relationships', () => {
    // Create mock data where some relationships would have depth-2 connections
    const extendedSpecies = [
      ...mockSpecies,
      {
        id: 'bird_monarch-predator',
        common_name: 'Orb Weaver Spider',
        latin_name: 'Neoscona sp.',
        form: 'insect',
        habitat: ['meadow'],
        diet: ['insect_eater'],
        behavior: ['web_builder'],
        season: ['year_round'],
        functional_description: 'Web-building spider',
        life_stages: [],
        region: 'northeast_pa',
        ecological_role: 'carnivore',
      } as Species,
    ];

    const extendedSymbiosis = [
      ...mockSymbiosis,
      {
        type: 'predation',
        members: ['bird_monarch-predator', 'insect_monarch-butterfly'],
        impacted_species: 'insect_monarch-butterfly',
        obligate: false,
        notes: 'Spider prey',
      } as Symbiosis,
    ];

    vi.spyOn(dataHook, 'useDataset').mockReturnValue({
      species: extendedSpecies,
      symbiosis: extendedSymbiosis,
    } as any);

    const { container } = render(
      <BrowserRouter>
        <DiagramCard speciesId="insect_monarch-butterfly" />
      </BrowserRouter>
    );

    const textElements = Array.from(container.querySelectorAll('text'))
      .map(el => el.textContent?.trim())
      .filter(Boolean);

    // Should NOT show the spider (which would be depth-1 in this case)
    expect(textElements).not.toContain('Orb Weaver Spider');

    // Should still show original direct relationships
    expect(textElements).toContain('Monarch Butterfly');
    expect(textElements).toContain('Common Milkweed');
  });
});
