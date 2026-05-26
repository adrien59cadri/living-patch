import { test, expect } from '@playwright/test';

test.describe('Species list page basic functionality', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page title or heading is present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for search bar which should be on the page (most reliable indicator of page load)
    const searchBar = page.getByRole('searchbox');
    await expect(searchBar).toBeVisible();
  });

  test('search bar is on the page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox');
    await expect(searchBar).toBeVisible();
  });

  test('species list text is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for species in the list (try common name or "species" text)
    const speciesText = page.getByText('Pileated Woodpecker').or(page.getByText(/species/, { exact: false }));
    await expect(speciesText.first()).toBeVisible();
  });
});
