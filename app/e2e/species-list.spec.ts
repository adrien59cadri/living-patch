import { test, expect } from '@playwright/test';

const HOME_URL = '/';

test.describe('Species list page', () => {
  test('loads with list of species displayed', async ({ page }) => {
    await page.goto(HOME_URL);
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page.getByText(/species/i)).toBeVisible();
    await expect(page.locator('[class*="rounded-lg"][class*="border"]')).toHaveCount(5, { timeout: 5000 });
  });

  test('displays species count', async ({ page }) => {
    await page.goto(HOME_URL);
    const countText = page.locator('p:has-text("species")').first();
    await expect(countText).toBeVisible();
    await expect(countText).toContainText(/^\d+ species$/);
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
    const initialCount = await page.locator('p:has-text("species")').first().textContent();

    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    await searchInput.fill('Milkweed');
    await page.waitForTimeout(300);

    const filteredCount = await page.locator('p:has-text("species")').first().textContent();
    expect(filteredCount).not.toBe(initialCount);
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
    const countText = await page.locator('p:has-text("species")').first().textContent();
    expect(countText).toMatch(/of \d+/);
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
    const badge = page.locator('button:has-text("Filters") span:has-text("1")');
    await expect(badge).toBeVisible();
  });
});

test.describe('Species navigation', () => {
  test('clicking a species navigates to detail page', async ({ page }) => {
    await page.goto(HOME_URL);
    const firstSpeciesLink = page.locator('a').filter({ has: page.getByText(/butterfly|moth|bee|plant|flower/) }).first();
    const speciesName = await firstSpeciesLink.textContent();

    await firstSpeciesLink.click();
    await expect(page).toHaveURL(/#\/species\//);
    await expect(page.getByRole('heading')).toContainText(speciesName || '');
  });

  test('species row shows common name and form label', async ({ page }) => {
    await page.goto(HOME_URL);
    const firstRow = page.locator('[class*="rounded-lg"][class*="border"]').first();

    await expect(firstRow.locator('[class*="font-medium"]')).toBeVisible();
    await expect(firstRow.locator('[class*="bg-stone-100"]')).toBeVisible();
  });

  test('species rows show functional description', async ({ page }) => {
    await page.goto(HOME_URL);
    const firstRow = page.locator('[class*="rounded-lg"][class*="border"]').first();

    const description = firstRow.locator('[class*="text-sm"][class*="text-stone-500"]');
    await expect(description).toBeVisible();
    const text = await description.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });
});

test.describe('Species groups', () => {
  test('species groups section displays when groups exist', async ({ page }) => {
    await page.goto(HOME_URL);
    const groupsHeader = page.getByText(/species groups/i);

    if (await groupsHeader.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(groupsHeader).toBeVisible();
      const groupRows = page.locator('[class*="bg-stone-50"][class*="opacity-70"]');
      const count = await groupRows.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('group rows have different styling from species rows', async ({ page }) => {
    await page.goto(HOME_URL);
    const groupsHeader = page.getByText(/species groups/i);

    if (await groupsHeader.isVisible({ timeout: 1000 }).catch(() => false)) {
      const groupRow = page.locator('[class*="bg-stone-50"][class*="opacity-70"]').first();
      await expect(groupRow).toHaveAttribute('class', /opacity-70/);
    }
  });
});

test.describe('Keystone badges', () => {
  test('keystone badge displays for keystone species', async ({ page }) => {
    await page.goto(HOME_URL);
    const keystoneBadges = page.locator('text=/🤝|keystone/i');
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
  test('search bar and filter button are on same row', async ({ page }) => {
    await page.goto(HOME_URL);
    const searchInput = page.getByRole('searchbox', { name: /search species/i });
    const filterBtn = page.getByRole('button', { name: /filters/i });

    const searchBox = await searchInput.boundingBox();
    const filterBox = await filterBtn.boundingBox();

    expect(searchBox?.y).toBe(filterBox?.y);
  });
});
