import { describe, it, expect } from 'vitest';
import {
  getRelationshipColor,
  transformToNodesEdges,
  getNodeSizeByDepth,
  getNodeOpacityByDepth,
  getFormColor,
  getLinkStrokeWidth,
} from '../bubbleTreeUtils';
import type { SymbiosisStrength } from '../../types';
import { makeSpecies, makeSymbiosis } from '../../test/fixtures';

describe('bubbleTreeUtils - Nodes/Edges Model', () => {
  describe('transformToNodesEdges', () => {
    it('should create focal node at depth 0', () => {
      const focal = makeSpecies('focal-1', 'animal', { common_name: 'Focal Species' });
      const speciesById = new Map([['focal-1', focal]]);
      const symbiosisBySpeciesId = new Map();

      const { nodes } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 1);

      expect(nodes.length).toBe(1);
      expect(nodes[0].id).toBe('focal-1');
      expect(nodes[0].depth).toBe(0);
      expect(nodes[0].name).toBe('Focal Species');
    });

    it('should create depth-1 nodes for direct relationships', () => {
      const focal = makeSpecies('focal-1', 'animal');
      const partner = makeSpecies('partner-1', 'animal');

      const speciesById = new Map([
        ['focal-1', focal],
        ['partner-1', partner],
      ]);

      const symbiosisBySpeciesId = new Map([
        ['focal-1', [makeSymbiosis('mutualism', 'focal-1', ['partner-1'])]],
      ]);

      const { nodes, links } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 1);

      expect(nodes.length).toBe(2);
      expect(nodes.find((c) => c.depth === 1)).toBeDefined();
      expect(links.length).toBeGreaterThan(0);
    });

    it('should filter links to only forward edges in BFS tree', () => {
      const focal = makeSpecies('focal-1', 'animal');
      const level1 = makeSpecies('level1-1', 'animal');
      const level2 = makeSpecies('level2-1', 'animal');

      const speciesById = new Map([
        ['focal-1', focal],
        ['level1-1', level1],
        ['level2-1', level2],
      ]);

      const symbiosisBySpeciesId = new Map([
        ['focal-1', [makeSymbiosis('mutualism', 'focal-1', ['level1-1'])]],
        ['level1-1', [makeSymbiosis('mutualism', 'level1-1', ['level2-1'])]],
      ]);

      const { links } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 2);

      // Should only have links where target depth > source depth
      links.forEach((link) => {
        expect(link.target).not.toBe('focal-1');
      });
    });

    it('should respect maxDepth parameter', () => {
      const focal = makeSpecies('focal-1', 'animal');
      const level1 = makeSpecies('level1-1', 'animal');
      const level2 = makeSpecies('level2-1', 'animal');

      const speciesById = new Map([
        ['focal-1', focal],
        ['level1-1', level1],
        ['level2-1', level2],
      ]);

      const symbiosisBySpeciesId = new Map([
        ['focal-1', [makeSymbiosis('mutualism', 'focal-1', ['level1-1'])]],
        ['level1-1', [makeSymbiosis('mutualism', 'level1-1', ['level2-1'])]],
      ]);

      const { nodes: nodes1 } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 1);
      const { nodes: nodes2 } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 2);

      expect(nodes1.length).toBe(2); // focal + level1
      expect(nodes2.length).toBe(3); // focal + level1 + level2
    });

    it('includes an edge when the symbiosis source is stage-qualified (species_id@stage_id)', () => {
      const focal = makeSpecies('focal-1', 'insect');
      const partner = makeSpecies('partner-1', 'insect');

      const speciesById = new Map([
        ['focal-1', focal],
        ['partner-1', partner],
      ]);

      const symbiosisBySpeciesId = new Map([
        ['focal-1', [makeSymbiosis('predation', 'focal-1@larva', ['partner-1'])]],
      ]);

      const { nodes, links } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 1);

      expect(nodes.map(n => n.id)).toContain('partner-1');
      expect(links).toHaveLength(1);
      expect(links[0].source).toBe('focal-1');
      expect(links[0].target).toBe('partner-1');
      expect(links[0].direction).toBe('outward');
    });

    it('includes an edge when the symbiosis target is stage-qualified', () => {
      const focal = makeSpecies('focal-1', 'insect');
      const partner = makeSpecies('partner-1', 'insect');

      const speciesById = new Map([
        ['focal-1', focal],
        ['partner-1', partner],
      ]);

      const symbiosisBySpeciesId = new Map([
        ['focal-1', [makeSymbiosis('predation', 'focal-1', ['partner-1@adult'])]],
      ]);

      const { nodes, links } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 1);

      expect(nodes.map(n => n.id)).toContain('partner-1');
      expect(links).toHaveLength(1);
      expect(links[0].target).toBe('partner-1');
    });
  });

  describe('getRelationshipColor', () => {
    it('should return correct colors for each relationship type', () => {
      expect(getRelationshipColor('mutualism')).toBe('#C8E6A0');
      expect(getRelationshipColor('predation')).toBe('#FF9999');
      expect(getRelationshipColor('parasitism')).toBe('#FFB366');
      expect(getRelationshipColor('competition')).toBe('#D3D3D3');
      expect(getRelationshipColor('commensalism')).toBe('#87CEEB');
    });

    it('should return gray for unknown category', () => {
      expect(getRelationshipColor('unknown')).toBe('#D3D3D3');
      expect(getRelationshipColor()).toBe('#D3D3D3');
    });
  });

  describe('getNodeSizeByDepth', () => {
    it.each([
      [0, 40],
      [1, 17.5],
      [2, 12.5],
      [3, 12.5],
    ])('depth %i → radius %s', (depth, expected) => {
      expect(getNodeSizeByDepth(depth)).toBe(expected);
    });
  });

  describe('getNodeOpacityByDepth', () => {
    it.each([
      [0, 1.0],
      [1, 1.0],
      [2, 0.5],
      [3, 0.5],
    ])('depth %i → opacity %s', (depth, expected) => {
      expect(getNodeOpacityByDepth(depth)).toBe(expected);
    });
  });

  describe('getFormColor', () => {
    it.each([
      ['bird', '#FFB366'],
      ['plant', '#C8E6A0'],
      ['insect', '#FF9999'],
      ['mammal', '#87CEEB'],
      ['amphibian', '#A0E7E5'],
      ['reptile', '#D8B8FF'],
      ['woodpecker', '#FFB366'],
      ['tree', '#C8E6A0'],
      ['frog', '#A0E7E5'],
    ])('%s → %s', (form, expected) => {
      expect(getFormColor(form)).toBe(expected);
    });

    it('returns gray for unknown form', () => {
      expect(getFormColor('unknown')).toBe('#D3D3D3');
    });
  });

  describe('getLinkStrokeWidth', () => {
    it.each<[SymbiosisStrength, number]>([
      ['critical', 3],
      ['important', 2],
      ['incidental', 1.5],
    ])('%s → %spx', (strength, expected) => {
      expect(getLinkStrokeWidth(strength)).toBe(expected);
    });
  });
});
