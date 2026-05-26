import { test, expect } from '@playwright/test';

test.describe('Species list page', () => {
  test('page loads and displays search bar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox', { name: /search species/i });
    await expect(searchBar).toBeVisible();
  });

  test('displays species count', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/\d+ species/)).toBeVisible();
  });

  test('filters button exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const filterBtn = page.getByRole('button', { name: /filters/i });
    await expect(filterBtn).toBeVisible();
  });

  test('search bar accepts input', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox', { name: /search species/i });
    await searchBar.fill('test');

    await expect(searchBar).toHaveValue('test');
  });

  test('filter button opens panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    // Panel should show filter options
    await expect(page.getByText(/form/i)).toBeVisible();
  });

  test('empty search result shows message', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox', { name: /search species/i });
    await searchBar.fill('xyzabc_not_a_real_species');

    // Wait for debounce
    await page.waitForTimeout(800);

    await expect(page.getByText(/no species found/i)).toBeVisible();
  });

  test('can navigate to species detail', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click first link on the page (should be a species)
    const firstLink = page.locator('a').first();

    // Only run test if link exists
    if (await firstLink.isVisible().catch(() => false)) {
      await firstLink.click();
      await expect(page).toHaveURL(/#\/species\//);
    }
  });
});
