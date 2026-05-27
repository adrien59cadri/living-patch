import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock react-force-graph to avoid loading aframe-extras in tests
vi.mock('react-force-graph', () => ({
  ForceGraph2D: vi.fn(() => null),
}));

afterEach(() => {
  cleanup();
});
