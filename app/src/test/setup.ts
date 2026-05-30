import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ── localStorage mock ─────────────────────────────────────────────────────────
// jsdom's --localstorage-file flag can leave window.localStorage in a broken
// state (setItem missing). Override it with a reliable in-memory implementation.
let _store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string) => _store[key] ?? null,
  setItem: (key: string, value: string) => { _store[key] = String(value); },
  removeItem: (key: string) => { delete _store[key]; },
  clear: () => { _store = {}; },
  get length() { return Object.keys(_store).length; },
  key: (i: number) => Object.keys(_store)[i] ?? null,
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

beforeEach(() => {
  _store = {};
});

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
