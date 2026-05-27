import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock cytoscape to avoid loading heavy graph library in tests
vi.mock('cytoscape', () => {
  return {
    default: vi.fn(() => ({
      on: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});

afterEach(() => {
  cleanup();
});
