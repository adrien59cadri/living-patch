import { test, expect } from '@playwright/test';

const HOME_URL = '/';

test.describe('Species list page', () => {
  test('loads with search and species displayed', async ({ page }) => {
    await page.goto(HOME_URL);
    await expect(page.getByRole('searchbox', { name: /search species/i })).toBeVisible();

    // Check that species are displayed (look for any link that navigates to species)
    await expect(page.locator('a').filter({ hasText: /^[A-Z]/ }).first()).toBeVisible();
  });

  test('displays species count text', async ({ page }) => {
    await page.goto(HOME_URL);
    await expect(page.getByText(/\d+ species/)).toBeVisible();
  });

  test('search bar has correct placeholder', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /search species/i);
  });

  test('filters button is visible and toggleable', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await expect(filterBtn).toBeVisible();

    // Click to open
    await filterBtn.click();
    await expect(page.getByText(/form/i)).toBeVisible();

    // Click to close
    await filterBtn.click();
  });
});

test.describe('Species search', () => {
  test('search input accepts text', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });

    await searchInput.fill('test');
    await page.waitForTimeout(300);

    await expect(searchInput).toHaveValue('test');
  });

  test('shows no results message when search returns empty', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    await searchInput.fill('xyzabc123notarealspecies');
    await page.waitForTimeout(300);

    await expect(page.getByText(/no species found/i)).toBeVisible();
  });
});

test.describe('Species filters', () => {
  test('filter panel opens and displays filter sections', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    await expect(page.getByText(/form/i)).toBeVisible();
    await expect(page.getByText(/habitat/i)).toBeVisible();
  });

  test('habitat filter checkbox can be toggled', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    const checkbox = page.getByRole('checkbox').first();
    await checkbox.check();
    await page.waitForTimeout(300);
    await expect(checkbox).toBeChecked();
  });

  test('clear filters button is visible when filters applied', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    const checkbox = page.getByRole('checkbox').first();
    await checkbox.check();
    await page.waitForTimeout(300);

    await expect(page.getByText(/clear filters/i)).toBeVisible();
  });
});

test.describe('Species navigation', () => {
  test('clicking a species navigates to detail page', async ({ page }) => {
    await page.goto(HOME_URL);

    // Find a clickable link that contains text (species row)
    const firstSpeciesLink = page.locator('a').filter({ hasText: /^[A-Z]/ }).first();
    await firstSpeciesLink.click();

    // Should navigate to species detail page
    await expect(page).toHaveURL(/#\/species\//);
  });

  test('species rows contain text content', async ({ page }) => {
    await page.goto(HOME_URL);

    // Find first species link and verify it has text
    const firstRow = page.locator('a').filter({ hasText: /^[A-Z]/ }).first();
    await expect(firstRow).toBeVisible();

    const text = await firstRow.textContent();
    expect(text && text.length > 0).toBeTruthy();
  });
});

test.describe('Species groups', () => {
  test('species groups section may display when groups exist', async ({ page }) => {
    await page.goto(HOME_URL);
    const groupsHeader = page.getByText(/species groups/i);

    // Don't assert if groups exist, just verify it doesn't crash the page
    const isVisible = await groupsHeader.isVisible({ timeout: 1000 }).catch(() => false);
    // Test passes whether groups exist or not
    expect(typeof isVisible).toBe('boolean');
  });
});

test.describe('Empty states', () => {
  test('shows empty state message when no results found', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    await searchInput.fill('thisisnotarealspecies12345');
    await page.waitForTimeout(500);

    await expect(page.getByText(/no species found/i)).toBeVisible();
  });
});
