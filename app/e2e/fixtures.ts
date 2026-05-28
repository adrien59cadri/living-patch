import { test as base, expect } from '@playwright/test';

interface CapturedError {
  type: string;
  message: string;
}

// Store errors per test using a WeakMap to avoid memory leaks
const testErrorsMap = new WeakMap<{ id: string }, CapturedError[]>();
const skipErrorCheckMap = new WeakMap<{ id: string }, boolean>();

/**
 * Custom test fixture that automatically captures and fails tests on console errors
 */
export const test = base.extend({});

/**
 * Helper to allow specific tests to have errors without failing
 */
function allowErrors(title: string, fn: (args: { page: unknown; context?: unknown }) => Promise<void>) {
  return test(title, async ({ page }, testInfo) => {
    skipErrorCheckMap.set(testInfo, true);
    return fn({ page });
  });
}

// Assign helper to test object
(test as { allowErrors: (title: string, fn: (args: { page: unknown; context?: unknown }) => Promise<void>) => void }).allowErrors = allowErrors;

// Hook into each test to capture console errors
test.beforeEach(async ({ page }, testInfo) => {
  const capturedErrors: Array<{ type: string; message: string }> = [];
  testErrorsMap.set(testInfo, capturedErrors);

  // Capture console error messages
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      capturedErrors.push({
        type: 'console.error',
        message: msg.text(),
      });
    }
  });

  // Capture uncaught page exceptions
  page.on('pageerror', (error) => {
    capturedErrors.push({
      type: 'uncaught exception',
      message: error.message || String(error),
    });
  });
});

test.afterEach(async (_, testInfo) => {
  const skipErrorCheck = skipErrorCheckMap.get(testInfo) || false;
  const capturedErrors = testErrorsMap.get(testInfo) || [];

  // Skip error check if explicitly allowed
  if (skipErrorCheck) {
    return;
  }

  // Fail test if any errors were captured
  if (capturedErrors.length > 0) {
    const errorMessages = capturedErrors
      .map((err) => `[${err.type}] ${err.message}`)
      .join('\n');

    throw new Error(
      `Expected no console errors during test, but found:\n${errorMessages}`
    );
  }
});

export { expect };
