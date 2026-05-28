import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock removed: cytoscape no longer used (replaced with D3)
/*
vi.mock('cytoscape', () => {
  return {
    default: vi.fn(() => ({
      on: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});
*/

afterEach(() => {
  cleanup();
});
