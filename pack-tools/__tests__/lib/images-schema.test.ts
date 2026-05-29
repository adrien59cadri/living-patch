import { describe, it, expect } from 'vitest';
import { validatePack, validatePackSafe } from '../../lib/schema.js';

describe('Species Images Validation', () => {
  const validPackWithImages = {
    metadata: {
      id: 'test-pack-with-images',
      createdDate: '2024-05-26T12:00:00Z',
      author: 'Test Author',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      status: 'published' as const,
      description: 'Test pack with species images',
    },
    data: {
      species: [
        {
          id: 'bird_pileated-woodpecker',
          common_name: 'Pileated Woodpecker',
          latin_name: 'Dryocopus pileatus',
          form: 'woodpecker',
          habitat: ['forest'],
          diet: ['insect_eater'],
          behavior: ['cavity_excavator'],
          season: ['year_round'],
          functional_description: 'Test description',
          life_stages: [],
          region: 'northeast_pa',
          image: {
            url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Bubo_virginianus_06.jpg',
            author: 'John Doe',
          },
        },
        {
          id: 'mammal_eastern-gray-squirrel',
          common_name: 'Eastern Gray Squirrel',
          latin_name: 'Sciurus carolinensis',
          form: 'mammal',
          habitat: ['forest'],
          diet: ['omnivore'],
          behavior: ['forager'],
          season: ['year_round'],
          functional_description: 'Test description',
          life_stages: [],
          region: 'northeast_pa',
          image: {
            url: 'https://upload.wikimedia.org/wikipedia/commons/test.jpg',
            author: 'Jane Smith',
          },
        },
        {
          id: 'bird_american-kestrel',
          common_name: 'American Kestrel',
          latin_name: 'Falco sparverius',
          form: 'raptor',
          habitat: ['forest_edge'],
          diet: ['predator'],
          behavior: ['perch_hunter'],
          season: ['year_round'],
          functional_description: 'Test description',
          life_stages: [],
          region: 'northeast_pa',
          // No image - testing species without images
        },
      ],
    },
  };

  describe('validatePack', () => {
    it('should validate a pack with species images', () => {
      const result = validatePack(validPackWithImages);
      expect(result).toBeDefined();
      expect(result.metadata.id).toBe('test-pack-with-images');
      expect(result.data.species?.length).toBe(3);
      expect(result.data.species?.[0].image?.url).toBeDefined();
    });

    it('should accept species without images', () => {
      const result = validatePack(validPackWithImages);
      expect(result).toBeDefined();
      expect(result.data.species?.[2].image).toBeUndefined();
    });

    it('should throw error for invalid image URL format', () => {
      const invalid = {
        metadata: validPackWithImages.metadata,
        data: {
          species: [
            {
              id: 'bird_test',
              common_name: 'Test Bird',
              form: 'bird',
              habitat: ['forest'],
              diet: ['insect_eater'],
              behavior: ['forager'],
              season: ['year_round'],
              functional_description: 'Test',
              life_stages: [],
              region: 'northeast_pa',
              image: {
                url: 'not-a-valid-url',
                author: 'Test',
              },
            },
          ],
        },
      };

      expect(() => validatePack(invalid)).toThrow();
    });
  });

  describe('validatePackSafe', () => {
    it('should return success result for valid pack with images', () => {
      const result = validatePackSafe(validPackWithImages);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata.id).toBe('test-pack-with-images');
        expect(result.data.data.species?.[0].image?.url).toBeDefined();
      }
    });

    it('should return error result without throwing for invalid URL', () => {
      const invalid = {
        metadata: validPackWithImages.metadata,
        data: {
          species: [
            {
              id: 'bird_test',
              common_name: 'Test Bird',
              form: 'bird',
              habitat: ['forest'],
              diet: ['insect_eater'],
              behavior: ['forager'],
              season: ['year_round'],
              functional_description: 'Test',
              life_stages: [],
              region: 'northeast_pa',
              image: {
                url: 'invalid-url',
                author: 'Test',
              },
            },
          ],
        },
      };

      const result = validatePackSafe(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
