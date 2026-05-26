import { test, expect } from '@playwright/test';

test.describe('Species list page basic functionality', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title or heading is present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Look for any heading on the page
    const heading = page.getByRole('heading').first();
    const isHeadingVisible = await heading.isVisible().catch(() => false);

    // Or look for search bar which should be on the page
    const searchBar = page.getByRole('searchbox').first();
    const isSearchVisible = await searchBar.isVisible().catch(() => false);

    // At least one of these should exist
    expect(isHeadingVisible || isSearchVisible).toBeTruthy();
  });

  test('search bar is on the page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const searchBar = page.getByRole('searchbox').first();
    const exists = await searchBar.isVisible().catch(() => false);
    expect(exists).toBeTruthy();
  });

  test('species list text is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const speciesText = page.getByText(/species/, { exact: false }).first();
    const exists = await speciesText.isVisible().catch(() => false);
    expect(exists).toBeTruthy();
  });
});
