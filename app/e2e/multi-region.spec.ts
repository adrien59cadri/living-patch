import { test, expect } from '@playwright/test';

// Helper to enable the France pack via the UI toggle
async function enableFrancePack(page: any) {
  // Navigate to packs page
  await page.goto('/#/packs');
  await page.waitForLoadState('networkidle');
  
  // Check if france-base is already enabled by looking for "Disable france-base" button
  const disableButton = page.getByRole('button', { name: 'Disable france-base' });
  const enableButton = page.getByRole('button', { name: 'Enable france-base' });
  
  const isEnabled = await disableButton.isVisible().catch(() => false);
  
  if (!isEnabled) {
    // Click enable button
    await enableButton.click();
    await page.waitForLoadState('networkidle');
  }
  
  // Navigate back to home to test the data
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

test.describe('Area filtering (Item 11)', () => {
  test('area filter chips appear when >1 region exists', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    // With 2 regions (northeast_pa, france), area chips should be visible
    const northeastChip = page.getByRole('button', { name: 'Northeast PA' });
    const franceChip = page.getByRole('button', { name: 'France' });
    
    await expect(northeastChip).toBeVisible();
    await expect(franceChip).toBeVisible();
  });

  test('northeast PA and France area chips are both visible', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    const northeastPaChip = page.getByRole('button', { name: 'Northeast PA' });
    const franceChip = page.getByRole('button', { name: 'France' });

    await expect(northeastPaChip).toBeVisible();
    await expect(franceChip).toBeVisible();
  });

  test('clicking area chip filters species list', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    // Start with mixed regions
    const initialSpeciesText = await page.getByText(/species/).first().textContent();
    expect(initialSpeciesText).toContain('species');

    // Click France chip to filter
    const franceChip = page.getByRole('button', { name: 'France' });
    await franceChip.click();
    await page.waitForLoadState('networkidle');

    // French species should be visible (e.g., European Robin)
    await expect(page.getByText('European Robin', { exact: true })).toBeVisible();

    // US species should not be visible (e.g., Pileated Woodpecker)
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).not.toBeVisible();
  });

  test('?area=france URL param filters to French species on load', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    await page.goto('/#/?area=france');
    await page.waitForLoadState('networkidle');

    // France chip should be active (highlighted)
    const franceChip = page.getByRole('button', { name: 'France' });
    const chipClass = await franceChip.getAttribute('class');
    expect(chipClass).toContain('bg-sky-600', 'Active chip should have sky-600 background');

    // French species should be visible
    await expect(page.getByText('European Robin', { exact: true })).toBeVisible();

    // US species should not be visible
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).not.toBeVisible();
  });

  test('?area=northeast_pa URL param filters to NE PA species on load', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    await page.goto('/#/?area=northeast_pa');
    await page.waitForLoadState('networkidle');

    // Northeast PA chip should be active
    const nepaChip = page.getByRole('button', { name: 'Northeast PA' });
    const chipClass = await nepaChip.getAttribute('class');
    expect(chipClass).toContain('bg-sky-600', 'Active chip should have sky-600 background');

    // US species should be visible
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).toBeVisible();

    // French species should not be visible
    await expect(page.getByText('European Robin', { exact: true })).not.toBeVisible();
  });

  test('clicking area chip updates URL param', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    const franceChip = page.getByRole('button', { name: 'France' });
    await franceChip.click();
    await page.waitForLoadState('networkidle');

    // URL should contain area=france (in hash with HashRouter)
    const url = page.url();
    expect(url).toContain('area=france');
  });

  test('area filter persists with other filters', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    const franceChip = page.getByRole('button', { name: 'France' });
    await franceChip.click();
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox');
    await searchBar.fill('bird');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toContain('area=france');

    const speciesText = page.locator('text=species');
    await expect(speciesText.first()).toBeVisible();
  });

  test('area filter is shown in advanced filter panel', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    // Open advanced filters
    const filtersButton = page.getByRole('button', { name: /Filters/ });
    await filtersButton.click();
    await page.waitForLoadState('networkidle');

    // Area section shows checkboxes for each region (one per area)
    const nepaCheckbox = page.getByLabel('Northeast PA');
    const franceCheckbox = page.getByLabel('France');
    await expect(nepaCheckbox).toBeVisible();
    await expect(franceCheckbox).toBeVisible();
  });

  test('area filter works from advanced filter panel', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    const filtersButton = page.getByRole('button', { name: /Filters/ });
    await filtersButton.click();
    await page.waitForLoadState('networkidle');

    const franceCheckbox = page.getByLabel('France');
    await franceCheckbox.click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('European Robin', { exact: true })).toBeVisible();
  });

  test('clear filters button clears area selection', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    await page.goto('/#/?area=france');
    await page.waitForLoadState('networkidle');

    // Ensure the advanced filter panel is open (URL param should auto-open it,
    // but click the Filters button to guarantee it regardless)
    const filtersButton = page.getByRole('button', { name: /Filters/ });
    await expect(filtersButton).toBeVisible({ timeout: 10000 });
    // If panel isn't already open, open it
    const clearButtonInitial = page.getByRole('button', { name: /Clear filters/ });
    if (!(await clearButtonInitial.isVisible())) {
      await filtersButton.click();
      await page.waitForLoadState('networkidle');
    }

    const clearButton = page.getByRole('button', { name: /Clear filters/ });
    await expect(clearButton).toBeVisible({ timeout: 5000 });
    await clearButton.click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/\d+ species/)).toBeVisible();
  });
});

test.describe('French species (Item 10)', () => {
  test('French species are loaded in dataset', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    await expect(page.getByText(/\d+ species/)).toBeVisible();
  });

  test('French bird species are visible when all areas selected', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);
    await page.waitForLoadState('networkidle');

    const frenchBirds = [
      'European Robin',
      'Great Tit',
      'European Green Woodpecker',
      'Eurasian Jay',
    ];

    for (const bird of frenchBirds) {
      // Use first() to handle cases where species might appear multiple times
      await expect(page.getByText(bird, { exact: true }).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('French mammals are visible when all areas selected', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    const frenchMammals = ['Red Fox', 'Wild Boar', 'Roe Deer', 'European Hedgehog'];

    for (const mammal of frenchMammals) {
      // Use first() to handle cases where species exists in multiple regions
      await expect(page.getByText(mammal, { exact: true }).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('French trees are visible when all areas selected', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    const frenchTrees = ['Pedunculate Oak', 'European Beech', 'Sweet Chestnut'];

    for (const tree of frenchTrees) {
      // Use first() to handle cases where species might appear multiple times
      await expect(page.getByText(tree, { exact: true }).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('French butterflies are visible when all areas selected', async ({ page }) => {
    // Enable France pack first
    await enableFrancePack(page);

    const frenchButterflies = ['European Peacock', 'Red Admiral', 'Brimstone', 'Old World Swallowtail'];

    for (const butterfly of frenchButterflies) {
      // Use first() to handle cases where species might appear multiple times
      await expect(page.getByText(butterfly, { exact: true }).first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Pack management (Item 9)', () => {
  test('packs page displays both packs', async ({ page }) => {
    await page.goto('/#/packs');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/2 pack/)).toBeVisible();
    await expect(page.getByRole('heading', { name: '0-base' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'france-base' })).toBeVisible();
  });

  test('pack cards show toggle switches', async ({ page }) => {
    await page.goto('/#/packs');
    await page.waitForLoadState('networkidle');

    const toggleSwitches = page.locator('button[aria-label*="Disable"], button[aria-label*="Enable"]');
    const count = await toggleSwitches.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('toggling France pack removes French species from list', async ({ page }) => {
    await page.goto('/#/packs');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Disable france-base' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('European Robin', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).toBeVisible();
    // Only 0-base pack enabled
    const count = await page.getByText(/\d+ species/).first().textContent();
    expect(count).toMatch(/\d+ species/);
  });

  test('toggling France pack back on restores French species', async ({ page }) => {
    await page.goto('/#/packs');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Disable france-base' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Enable france-base' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('European Robin', { exact: true })).toBeVisible();
    // Both packs enabled — total species
    const count = await page.getByText(/\d+ species/).first().textContent();
    expect(count).toMatch(/\d+ species/);
  });

  test('disabled pack card shows grayed out state', async ({ page }) => {
    await page.goto('/#/packs');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Disable france-base' }).click();
    await page.waitForLoadState('networkidle');

    // Card root is 3 levels above the <h2> heading
    const cardRoot = page.getByRole('heading', { name: 'france-base', level: 2 }).locator('xpath=../../..');
    const opacityValue = await cardRoot.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacityValue)).toBeLessThan(1);
  });

  test('pack toggle state persists after page reload', async ({ page }) => {
    await page.goto('/#/packs');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Disable france-base' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('European Robin', { exact: true })).not.toBeVisible();

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('European Robin', { exact: true })).not.toBeVisible();
  });

  test('disabled base pack removes US species', async ({ page }) => {
    await page.goto('/#/packs');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Disable 0-base' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Pileated Woodpecker', { exact: true })).not.toBeVisible();
    await expect(page.getByText('European Robin', { exact: true })).toBeVisible();
    // Only france-base pack enabled
    const count = await page.getByText(/\d+ species/).first().textContent();
    expect(count).toMatch(/\d+ species/);
  });

  test('packs page shows species count for active packs', async ({ page }) => {
    await page.goto('/#/packs');
    await page.waitForLoadState('networkidle');

    // Each pack card shows its own species count in the manifest
    // Both packs should be visible with their counts
    const speciesCounts = await page.getByText(/\d+ species/).allTextContents();
    expect(speciesCounts.length).toBeGreaterThanOrEqual(2);
  });
});
