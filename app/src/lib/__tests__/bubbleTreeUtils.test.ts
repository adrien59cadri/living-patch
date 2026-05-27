import { describe, it, expect } from 'vitest';
import {
  getRelationshipColor,
  transformToNodesEdges,
  getNodeSizeByDepth,
  getNodeOpacityByDepth,
  getFormColor,
  getLinkStrokeWidth,
} from '../bubbleTreeUtils';
import type { Species, Symbiosis } from '../../types';

const createMockSpecies = (id: string, name: string, form: string = 'animal'): Species => ({
  id,
  common_name: name,
  form,
  habitat: ['forest'],
  diet: [],
  behavior: [],
  season: [],
  functional_description: 'Test species',
  life_stages: [],
  region: 'test',
});

const createMockSymbiosis = (
  type: 'mutualism' | 'predation' | 'parasitism' | 'competition' | 'commensalism',
  members: string[],
  impactedSpecies?: string
): Symbiosis => ({
  type,
  members,
  obligate: false,
  notes: 'Test relationship',
  impacted_species: impactedSpecies,
});

describe('bubbleTreeUtils - Nodes/Edges Model', () => {
  describe('transformToNodesEdges', () => {
    it('should create focal node at depth 0', () => {
      const focal = createMockSpecies('focal-1', 'Focal Species');
      const speciesById = new Map([['focal-1', focal]]);
      const symbiosisBySpeciesId = new Map();

      const { nodes } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 1);

      expect(nodes.length).toBe(1);
      expect(nodes[0].id).toBe('focal-1');
      expect(nodes[0].depth).toBe(0);
      expect(nodes[0].name).toBe('Focal Species');
    });

    it('should create depth-1 nodes for direct relationships', () => {
      const focal = createMockSpecies('focal-1', 'Focal Species');
      const partner = createMockSpecies('partner-1', 'Partner Species');

      const speciesById = new Map([
        ['focal-1', focal],
        ['partner-1', partner],
      ]);

      const symbiosisBySpeciesId = new Map([
        ['focal-1', [createMockSymbiosis('mutualism', ['focal-1', 'partner-1'])]],
      ]);

      const { nodes, links } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 1);

      expect(nodes.length).toBe(2);
      expect(nodes.find((c) => c.depth === 1)).toBeDefined();
      expect(links.length).toBeGreaterThan(0);
    });

    it('should filter links to only forward edges in BFS tree', () => {
      const focal = createMockSpecies('focal-1', 'Focal');
      const level1 = createMockSpecies('level1-1', 'Level 1');
      const level2 = createMockSpecies('level2-1', 'Level 2');

      const speciesById = new Map([
        ['focal-1', focal],
        ['level1-1', level1],
        ['level2-1', level2],
      ]);

      const symbiosisBySpeciesId = new Map([
        ['focal-1', [createMockSymbiosis('mutualism', ['focal-1', 'level1-1'])]],
        ['level1-1', [createMockSymbiosis('mutualism', ['level1-1', 'level2-1'])]],
      ]);

      const { links } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 2);

      // Should only have links where target depth > source depth
      links.forEach((link) => {
        expect(link.target).not.toBe('focal-1');
      });
    });

    it('should respect maxDepth parameter', () => {
      const focal = createMockSpecies('focal-1', 'Focal');
      const level1 = createMockSpecies('level1-1', 'Level 1');
      const level2 = createMockSpecies('level2-1', 'Level 2');

      const speciesById = new Map([
        ['focal-1', focal],
        ['level1-1', level1],
        ['level2-1', level2],
      ]);

      const symbiosisBySpeciesId = new Map([
        ['focal-1', [createMockSymbiosis('mutualism', ['focal-1', 'level1-1'])]],
        ['level1-1', [createMockSymbiosis('mutualism', ['level1-1', 'level2-1'])]],
      ]);

      const { nodes: nodes1 } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 1);
      const { nodes: nodes2 } = transformToNodesEdges('focal-1', speciesById, symbiosisBySpeciesId, 2);

      expect(nodes1.length).toBe(2); // focal + level1
      expect(nodes2.length).toBe(3); // focal + level1 + level2
    });
  });

  describe('getRelationshipColor', () => {
    it('should return correct colors for each relationship type', () => {
      expect(getRelationshipColor('mutualism')).toBe('#1e8449');
      expect(getRelationshipColor('predation')).toBe('#e74c3c');
      expect(getRelationshipColor('parasitism')).toBe('#f39c12');
      expect(getRelationshipColor('competition')).toBe('#95a5a6');
      expect(getRelationshipColor('commensalism')).toBe('#3b82f6');
    });

    it('should return gray for unknown category', () => {
      expect(getRelationshipColor('unknown')).toBe('#95a5a6');
      expect(getRelationshipColor()).toBe('#95a5a6');
    });
  });

  describe('getNodeSizeByDepth', () => {
    it('should return correct size for each depth', () => {
      expect(getNodeSizeByDepth(0)).toBe(40); // focal: 80px diameter
      expect(getNodeSizeByDepth(1)).toBe(17.5); // depth-1: 35px diameter
      expect(getNodeSizeByDepth(2)).toBe(12.5); // depth-2+: 25px diameter
      expect(getNodeSizeByDepth(3)).toBe(12.5); // depth-3: 25px diameter
    });
  });

  describe('getNodeOpacityByDepth', () => {
    it('should return full opacity for all depths', () => {
      expect(getNodeOpacityByDepth(0)).toBe(1.0);
      expect(getNodeOpacityByDepth(1)).toBe(1.0);
      expect(getNodeOpacityByDepth(2)).toBe(1.0);
      expect(getNodeOpacityByDepth(3)).toBe(1.0);
    });
  });

  describe('getFormColor', () => {
    it('should return correct color for base forms', () => {
      expect(getFormColor('bird')).toBe('#f39c12');
      expect(getFormColor('plant')).toBe('#1e8449');
      expect(getFormColor('insect')).toBe('#e74c3c');
      expect(getFormColor('mammal')).toBe('#3498db');
      expect(getFormColor('amphibian')).toBe('#2ecc71');
      expect(getFormColor('reptile')).toBe('#9b59b6');
    });

    it('should return correct color for derived forms', () => {
      expect(getFormColor('woodpecker')).toBe('#f39c12'); // bird form
      expect(getFormColor('tree')).toBe('#1e8449'); // plant form
      expect(getFormColor('frog')).toBe('#2ecc71'); // amphibian form
    });

    it('should return gray for unknown form', () => {
      expect(getFormColor('unknown')).toBe('#95a5a6');
    });
  });

  describe('getLinkStrokeWidth', () => {
    it('should return 3px for obligate relationships', () => {
      expect(getLinkStrokeWidth(true)).toBe(3);
    });

    it('should return 1.5px for non-obligate relationships', () => {
      expect(getLinkStrokeWidth(false)).toBe(1.5);
    });
  });
});
