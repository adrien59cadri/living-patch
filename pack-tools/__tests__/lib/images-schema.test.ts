/**
 * Unit tests for images schema validation
 */

import { describe, it, expect } from 'vitest';
import { validateImagesPack, validateImagesPackSafe } from '../../lib/schema.js';

describe('Images Schema Validation', () => {
  const validImagesPack = {
    metadata: {
      id: 'images-test-pack',
      createdDate: '2024-05-26T12:00:00Z',
      status: 'published' as const,
      packId: 'test-pack',
      description: 'Test images pack',
    },
    data: [
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
  };

  describe('validateImagesPack', () => {
    it('should validate a correct images pack', () => {
      const result = validateImagesPack(validImagesPack);
      expect(result).toBeDefined();
      expect(result.metadata.id).toBe('images-test-pack');
      expect(result.data.length).toBe(2);
    });

    it('should throw error for missing metadata', () => {
      const invalid = {
        data: validImagesPack.data,
      };

      expect(() => validateImagesPack(invalid)).toThrow();
    });

    it('should throw error for invalid metadata fields', () => {
      const invalid = {
        metadata: {
          id: 'test', // valid
          createdDate: 'not-a-date', // invalid
          status: 'published',
          packId: 'test-pack',
        },
        data: validImagesPack.data,
      };

      expect(() => validateImagesPack(invalid)).toThrow();
    });

    it('should throw error for missing required image data fields', () => {
      const invalid = {
        metadata: validImagesPack.metadata,
        data: [
          {
            speciesId: 'bird_test',
            // missing url and author
          },
        ],
      };

      expect(() => validateImagesPack(invalid)).toThrow();
    });

    it('should throw error for invalid URL format', () => {
      const invalid = {
        metadata: validImagesPack.metadata,
        data: [
          {
            speciesId: 'bird_test',
            url: 'not-a-url',
            author: 'Test',
          },
        ],
      };

      expect(() => validateImagesPack(invalid)).toThrow();
    });
  });

  describe('validateImagesPackSafe', () => {
    it('should return success result for valid pack', () => {
      const result = validateImagesPackSafe(validImagesPack);
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
        data: [],
      };

      const result = validateImagesPackSafe(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should accept empty data array', () => {
      const packWithNoImages = {
        metadata: validImagesPack.metadata,
        data: [],
      };

      const result = validateImagesPackSafe(packWithNoImages);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.length).toBe(0);
      }
    });

    it('should reject invalid status values', () => {
      const invalid = {
        metadata: {
          id: 'test',
          createdDate: '2024-05-26T12:00:00Z',
          status: 'invalid-status',
          packId: 'test-pack',
        },
        data: [],
      };

      const result = validateImagesPackSafe(invalid);
      expect(result.success).toBe(false);
    });
  });
});
