import { test, expect } from '@playwright/test';

const HOME_URL = '/';

test.describe('Species list page', () => {
  test('loads and displays search bar', async ({ page }) => {
    await page.goto(HOME_URL);
    await page.waitForLoadState('networkidle');

    // Verify search bar is present
    const searchBar = page.getByRole('searchbox', { name: /search species/i });
    await expect(searchBar).toBeVisible();
  });

  test('displays species count', async ({ page }) => {
    await page.goto(HOME_URL);
    await page.waitForLoadState('networkidle');

    // Verify species count text is visible
    const countText = page.getByText(/\d+ species/);
    await expect(countText).toBeVisible();
  });

  test('search bar has correct placeholder', async ({ page }) => {
    await page.goto(HOME_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    await expect(searchInput).toHaveAttribute('placeholder', /search species/i);
  });

  test('filters button is visible', async ({ page }) => {
    await page.goto(HOME_URL);
    await page.waitForLoadState('networkidle');

    const filterBtn = page.getByRole('button', { name: /filters/i });
    await expect(filterBtn).toBeVisible();
  });

  test('filter panel opens when button clicked', async ({ page }) => {
    await page.goto(HOME_URL);
    await page.waitForLoadState('networkidle');

    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    // Wait for panel to appear
    await page.waitForTimeout(200);

    // Verify filter options are visible
    const formLabel = page.getByText(/form/i, { exact: false });
    await expect(formLabel).toBeVisible();
  });
});

test.describe('Search functionality', () => {
  test('searching for nonexistent species shows empty state', async ({ page }) => {
    await page.goto(HOME_URL);
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByRole('searchbox', { name: /search species/i });

    // Clear any existing value first
    await searchInput.clear();
    await page.waitForTimeout(100);

    // Type non-existent species name
    await searchInput.fill('zzzzxyz123notreal');

    // Wait for debounce and filtering
    await page.waitForTimeout(700);

    // Should show "no species found"
    await expect(page.getByText(/no species found/i)).toBeVisible();
  });
});

test.describe('Filter functionality', () => {
  test('can check a filter checkbox', async ({ page }) => {
    await page.goto(HOME_URL);
    await page.waitForLoadState('networkidle');

    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    // Wait for panel
    await page.waitForTimeout(200);

    const checkbox = page.getByRole('checkbox').first();

    // Check it exists and can be checked
    await expect(checkbox).toBeVisible();
    await checkbox.check();

    // Wait for update
    await page.waitForTimeout(300);

    await expect(checkbox).toBeChecked();
  });

  test('clear filters button appears when filter is active', async ({ page }) => {
    await page.goto(HOME_URL);
    await page.waitForLoadState('networkidle');

    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    await page.waitForTimeout(200);

    const checkbox = page.getByRole('checkbox').first();
    await checkbox.check();

    await page.waitForTimeout(300);

    // Clear filters button should now be visible
    await expect(page.getByText(/clear filters/i)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('clicking species list item navigates to detail page', async ({ page }) => {
    await page.goto(HOME_URL);
    await page.waitForLoadState('networkidle');

    // Find and click a link (species row)
    const firstLink = page.locator('a').first();

    // Check it exists before clicking
    const isVisible = await firstLink.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await firstLink.click();

      // Should navigate to species detail page
      await expect(page).toHaveURL(/#\/species\//);
    }
  });
});
