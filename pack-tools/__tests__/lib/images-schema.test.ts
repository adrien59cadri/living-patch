import { describe, it, expect } from 'vitest';
import { validatePack, validatePackSafe } from '../../lib/schema.js';

describe('Images Pack Schema Validation', () => {
  const validImagesPack = {
    metadata: {
      id: 'images-test-pack',
      createdDate: '2024-05-26T12:00:00Z',
      author: 'Test Author',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      status: 'published' as const,
      description: 'Test images pack',
    },
    data: {
      images: [
        {
          speciesId: 'bird_pileated-woodpecker',
          url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Bubo_virginianus_06.jpg',
          author: 'John Doe',
        },
        {
          speciesId: 'mammal_eastern-gray-squirrel',
          url: 'https://upload.wikimedia.org/wikipedia/commons/test.jpg',
          author: 'Jane Smith',
        },
      ],
    },
  };

  describe('validatePack', () => {
    it('should validate a correct images pack', () => {
      const result = validatePack(validImagesPack);
      expect(result).toBeDefined();
      expect(result.metadata.id).toBe('images-test-pack');
      expect(result.data.images?.length).toBe(2);
    });

    it('should throw error for missing metadata', () => {
      const invalid = {
        data: validImagesPack.data,
      };

      expect(() => validatePack(invalid)).toThrow();
    });

    it('should throw error for invalid metadata fields', () => {
      const invalid = {
        metadata: {
          id: 'test',
          createdDate: 'not-a-date', // invalid
          author: 'Test',
          version: '1.0.0',
          schemaVersion: '1.0.0',
          description: 'Test',
        },
        data: validImagesPack.data,
      };

      expect(() => validatePack(invalid)).toThrow();
    });

    it('should throw error for missing required image fields', () => {
      const invalid = {
        metadata: validImagesPack.metadata,
        data: {
          images: [
            {
              speciesId: 'bird_test',
              // missing url and author
            },
          ],
        },
      };

      expect(() => validatePack(invalid)).toThrow();
    });

    it('should throw error for invalid URL format', () => {
      const invalid = {
        metadata: validImagesPack.metadata,
        data: {
          images: [
            {
              speciesId: 'bird_test',
              url: 'not-a-url',
              author: 'Test',
            },
          ],
        },
      };

      expect(() => validatePack(invalid)).toThrow();
    });
  });

  describe('validatePackSafe', () => {
    it('should return success result for valid pack', () => {
      const result = validatePackSafe(validImagesPack);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata.id).toBe('images-test-pack');
      }
    });

    it('should return error result without throwing', () => {
      const invalid = {
        metadata: {
          createdDate: 'invalid',
        },
        data: {},
      };

      const result = validatePackSafe(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should accept empty images array', () => {
      const packWithNoImages = {
        metadata: validImagesPack.metadata,
        data: { images: [] },
      };

      const result = validatePackSafe(packWithNoImages);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.images?.length).toBe(0);
      }
    });

    it('should reject invalid status values', () => {
      const invalid = {
        metadata: {
          id: 'test',
          createdDate: '2024-05-26T12:00:00Z',
          author: 'Test',
          version: '1.0.0',
          schemaVersion: '1.0.0',
          status: 'invalid-status',
          description: 'Test',
        },
        data: {},
      };

      const result = validatePackSafe(invalid);
      expect(result.success).toBe(false);
    });
  });
});
