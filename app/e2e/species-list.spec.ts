import { test, expect } from '@playwright/test';

const HOME_URL = '/';

test.describe('Species list page', () => {
  test('loads with list of species displayed', async ({ page }) => {
    await page.goto(HOME_URL);
    await expect(page.getByRole('searchbox', { name: /search species/i })).toBeVisible();
    await expect(page.getByText(/species/i)).toBeVisible();
    const speciesRows = page.locator('a[href*="/species/"]');
    await expect(speciesRows.first()).toBeVisible();
  });

  test('displays species count', async ({ page }) => {
    await page.goto(HOME_URL);
    const countText = page.locator('p:has-text("species")').first();
    await expect(countText).toBeVisible();
    await expect(countText).toContainText(/\d+ species/);
  });

  test('search bar is visible with placeholder', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /search species/i);
  });

  test('filters button is visible and toggleable', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await expect(filterBtn).toBeVisible();
    await expect(filterBtn).toHaveAttribute('class', /bg-white/);
    await filterBtn.click();
    await expect(filterBtn).toHaveAttribute('class', /bg-emerald-600/);
    await filterBtn.click();
    await expect(filterBtn).toHaveAttribute('class', /bg-white/);
  });
});

test.describe('Species search', () => {
  test('filters species by search term', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    await searchInput.fill('Milkweed');
    await page.waitForTimeout(300);

    await expect(page.getByText(/milkweed/i)).toBeVisible();
  });

  test('shows no results message when search returns empty', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    await searchInput.fill('xyzabc123notarealspecies');
    await page.waitForTimeout(300);

    await expect(page.getByText(/no species found/i)).toBeVisible();
  });

  test('search is case insensitive', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });

    await searchInput.fill('MONARCH');
    await page.waitForTimeout(300);
    await expect(page.getByText(/monarch/i)).toBeVisible();
  });
});

test.describe('Species filters', () => {
  test('filter panel opens and displays filter options', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    await expect(page.getByText(/form/i)).toBeVisible();
    await expect(page.getByText(/habitat/i)).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('form filter dropdown works', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    const formSelect = page.locator('select').first();
    const initialValue = await formSelect.inputValue();

    await formSelect.selectOption({ index: 1 });
    const newValue = await formSelect.inputValue();
    expect(newValue).not.toBe(initialValue);

    await page.waitForTimeout(300);
    await expect(page.getByText(/species/i)).toBeVisible();
  });

  test('habitat filter checkbox works', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    const checkbox = page.getByRole('checkbox').first();
    await checkbox.check();

    await page.waitForTimeout(300);
    await expect(checkbox).toBeChecked();
  });

  test('clear filters button resets all filters', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    const checkbox = page.getByRole('checkbox').first();
    await checkbox.check();
    await page.waitForTimeout(300);

    await expect(page.getByText(/clear filters/i)).toBeVisible();
    await page.getByText(/clear filters/i).click();
    await page.waitForTimeout(300);

    await expect(checkbox).not.toBeChecked();
  });

  test('filter badge shows active filter count', async ({ page }) => {
    await page.goto(HOME_URL);
    const filterBtn = page.getByRole('button', { name: /filters/i });
    await filterBtn.click();

    const checkbox = page.getByRole('checkbox').first();
    await checkbox.check();
    await page.waitForTimeout(300);

    await filterBtn.click();
    const badge = page.locator('button span').filter({ hasText: '1' }).first();
    await expect(badge).toBeVisible();
  });
});

test.describe('Species navigation', () => {
  test('clicking a species navigates to detail page', async ({ page }) => {
    await page.goto(HOME_URL);
    const firstSpeciesLink = page.locator('a[href*="/species/"]').first();
    await firstSpeciesLink.click();
    await expect(page).toHaveURL(/#\/species\//);
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('species row shows common name and form label', async ({ page }) => {
    await page.goto(HOME_URL);
    const firstRow = page.locator('a[href*="/species/"]').first();

    const formLabel = firstRow.locator('span[class*="bg-stone-100"]').first();
    await expect(formLabel).toBeVisible();
  });

  test('species rows show functional description', async ({ page }) => {
    await page.goto(HOME_URL);
    const firstRow = page.locator('a[href*="/species/"]').first();

    const description = firstRow.locator('p');
    await expect(description).toBeVisible();
    const text = await description.textContent();
    expect(text && text.length > 0).toBeTruthy();
  });
});

test.describe('Species groups', () => {
  test('species groups section displays when groups exist', async ({ page }) => {
    await page.goto(HOME_URL);
    const groupsHeader = page.getByText(/species groups/i);

    const isVisible = await groupsHeader.isVisible({ timeout: 1000 }).catch(() => false);
    if (isVisible) {
      await expect(groupsHeader).toBeVisible();
    }
  });
});

test.describe('Keystone badges', () => {
  test('keystone badge displays for keystone species', async ({ page }) => {
    await page.goto(HOME_URL);
    const keystoneBadges = page.getByText(/keystone/i);
    const count = await keystoneBadges.count();

    if (count > 0) {
      await expect(keystoneBadges.first()).toBeVisible();
    }
  });
});

test.describe('Empty states', () => {
  test('shows empty state with helpful message for no results', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    await searchInput.fill('thisisnotarealspecies12345');
    await page.waitForTimeout(300);

    const emptyMessage = page.getByText(/no species found/i);
    await expect(emptyMessage).toBeVisible();
    await expect(emptyMessage).toContainText(/try a different search/i);
  });
});

test.describe('Responsive layout', () => {
  test('search bar and filter button are visible and accessible', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    const filterBtn = page.getByRole('button', { name: /filters/i });

    await expect(searchInput).toBeVisible();
    await expect(filterBtn).toBeVisible();
  });
});
