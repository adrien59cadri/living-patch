import { test, expect } from '@playwright/test';

const HOME_URL = '/';

test.describe('Species list page', () => {
  test('loads and displays species list', async ({ page }) => {
    await page.goto(HOME_URL);
    // Verify search bar is present
    await expect(page.getByRole('searchbox', { name: /search species/i })).toBeVisible();
    // Verify species count text is visible
    await expect(page.getByText(/\d+ species/)).toBeVisible();
  });

  test('search bar has correct placeholder', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    await expect(searchInput).toHaveAttribute('placeholder', /search species/i);
  });

  test('filters button is visible', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await expect(filterBtn).toBeVisible();
  });

  test('filter panel can be opened', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();
    // Verify filter panel shows form and habitat options
    await expect(page.getByText(/form/i)).toBeVisible();
  });
});

test.describe('Species search and filtering', () => {
  test('empty search returns no results message', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    // Search for something that definitely won't exist
    await searchInput.fill('xyzabc123notarealspecies');
    // Wait for debounce
    await page.waitForTimeout(500);
    // Should show "no species found" message
    await expect(page.getByText(/no species found/i)).toBeVisible();
  });

  test('filter checkbox can be toggled', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    const checkbox = page.getByRole('checkbox').first();
    // Check the checkbox
    await checkbox.check();
    // Wait for update
    await page.waitForTimeout(300);
    // Verify it's checked
    await expect(checkbox).toBeChecked();
  });

  test('clear filters button appears when filter applied', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    const checkbox = page.getByRole('checkbox').first();
    await checkbox.check();
    await page.waitForTimeout(300);

    // Should see clear filters button
    await expect(page.getByText(/clear filters/i)).toBeVisible();
  });
});

test.describe('Species detail navigation', () => {
  test('navigates to species detail from list', async ({ page }) => {
    await page.goto(HOME_URL);
    // Find a link that leads to species detail (will have href with /species/)
    const speciesLink = page.locator('a').first();
    await speciesLink.click();
    // Should navigate to a species detail page
    await expect(page).toHaveURL(/#\/species\//);
  });
});

test.describe('Empty state', () => {
  test('displays empty state message when no results', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    await searchInput.fill('thisisnotarealspecies');
    await page.waitForTimeout(500);
    await expect(page.getByText(/no species found/i)).toBeVisible();
    await expect(page.getByText(/try a different search/i)).toBeVisible();
  });
});
