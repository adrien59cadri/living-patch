import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock Canvas API for jsdom environment (used by RelationshipBubbleTree text measurement)
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  contextType: string,
  ...args: unknown[]
) {
  if (contextType === '2d') {
    return {
      font: '',
      measureText: (text: string) => ({
        width: text.length * 7, // reasonable estimate for monospace-like measurement
      }),
    } as unknown as CanvasRenderingContext2D;
  }
  return originalGetContext.call(this, contextType, ...args);
} as typeof HTMLCanvasElement.prototype.getContext;

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
