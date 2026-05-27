import { describe, it, expect } from 'vitest';
import {
  buildBubbleTreeHierarchy,
  categoryLabel,
  getRelationshipColor,
  getNodeRadius,
  getNodeOpacity,
  getLabelSize,
  getLabelWeight,
} from '../bubbleTreeUtils';
import type { Species, Symbiosis } from '../../types';

const createMockSpecies = (id: string, name: string): Species => ({
  id,
  common_name: name,
  form: 'animal',
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
  members: string[]
): Symbiosis => ({
  type,
  members,
  obligate: false,
  notes: 'Test relationship',
});

describe('bubbleTreeUtils', () => {
  describe('buildBubbleTreeHierarchy', () => {
    it('should build hierarchy with focal species and relationships', () => {
      const focal = createMockSpecies('focal-1', 'Focal Species');
      const partner = createMockSpecies('partner-1', 'Partner Species');

      const speciesById = new Map([
        ['focal-1', focal],
        ['partner-1', partner],
      ]);

      const symbiosisBySpeciesId = new Map([
        [
          'focal-1',
          [createMockSymbiosis('mutualism', ['focal-1', 'partner-1'])],
        ],
      ]);

      const hierarchy = buildBubbleTreeHierarchy(
        'focal-1',
        speciesById,
        symbiosisBySpeciesId,
        new Map()
      );

      expect(hierarchy.id).toBe('focal-1');
      expect(hierarchy.name).toBe('Focal Species');
      expect(hierarchy.type).toBe('focal');
      expect(hierarchy.children).toBeDefined();
      expect(hierarchy.children!.length).toBe(1); // One category (mutualism)
    });

    it('should organize relationships by category', () => {
      const focal = createMockSpecies('focal-1', 'Focal');
      const mutualism = createMockSpecies('mutualism-1', 'Mutualism Partner');
      const predation = createMockSpecies('predation-1', 'Predation Partner');

      const speciesById = new Map([
        ['focal-1', focal],
        ['mutualism-1', mutualism],
        ['predation-1', predation],
      ]);

      const symbiosisBySpeciesId = new Map([
        [
          'focal-1',
          [
            createMockSymbiosis('mutualism', ['focal-1', 'mutualism-1']),
            createMockSymbiosis('predation', ['focal-1', 'predation-1']),
          ],
        ],
      ]);

      const hierarchy = buildBubbleTreeHierarchy(
        'focal-1',
        speciesById,
        symbiosisBySpeciesId,
        new Map()
      );

      expect(hierarchy.children).toBeDefined();
      expect(hierarchy.children!.length).toBe(2); // Two categories
      
      const categories = hierarchy.children!.map(c => c.id);
      expect(categories).toContain('category-mutualism');
      expect(categories).toContain('category-predation');
    });

    it('should throw error for missing focal species', () => {
      const speciesById = new Map();
      const symbiosisBySpeciesId = new Map();

      expect(() => {
        buildBubbleTreeHierarchy(
          'nonexistent',
          speciesById,
          symbiosisBySpeciesId,
          new Map()
        );
      }).toThrow('Focal species not found');
    });

    it('should handle empty relationships', () => {
      const focal = createMockSpecies('focal-1', 'Focal');
      const speciesById = new Map([['focal-1', focal]]);
      const symbiosisBySpeciesId = new Map();

      const hierarchy = buildBubbleTreeHierarchy(
        'focal-1',
        speciesById,
        symbiosisBySpeciesId,
        new Map()
      );

      expect(hierarchy.id).toBe('focal-1');
      expect(hierarchy.children).toBeDefined();
      expect(hierarchy.children!.length).toBe(0); // No categories
    });
  });

  describe('categoryLabel', () => {
    it('should return correct labels for each category', () => {
      expect(categoryLabel('mutualism')).toBe('Mutualism');
      expect(categoryLabel('predation')).toBe('Predation');
      expect(categoryLabel('parasitism')).toBe('Parasitism');
      expect(categoryLabel('competition')).toBe('Competition');
      expect(categoryLabel('commensalism')).toBe('Commensalism');
    });
  });

  describe('getRelationshipColor', () => {
    it('should return correct colors for each relationship type', () => {
      expect(getRelationshipColor('mutualism')).toBe('#27ae60');
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

  describe('getNodeRadius', () => {
    it('should return correct radius for each node type', () => {
      expect(getNodeRadius('focal')).toBe(80);
      expect(getNodeRadius('category')).toBe(50);
      expect(getNodeRadius('species')).toBe(30);
    });
  });

  describe('getNodeOpacity', () => {
    it('should return correct opacity for each node type', () => {
      expect(getNodeOpacity('focal')).toBe(1.0);
      expect(getNodeOpacity('category')).toBe(1.0);
      expect(getNodeOpacity('species')).toBe(0.8);
    });
  });

  describe('getLabelSize', () => {
    it('should return correct font size for each node type', () => {
      expect(getLabelSize('focal')).toBe(1.1);
      expect(getLabelSize('category')).toBe(0.9);
      expect(getLabelSize('species')).toBe(0.7);
    });
  });

  describe('getLabelWeight', () => {
    it('should return correct font weight for each node type', () => {
      expect(getLabelWeight('focal')).toBe('bold');
      expect(getLabelWeight('category')).toBe('600');
      expect(getLabelWeight('species')).toBe('normal');
    });
  });
});
