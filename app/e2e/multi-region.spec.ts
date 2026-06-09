import { test, expect, Page } from '@playwright/test';

// Helper to enable the France pack via the UI toggle (reliable: uses togglePack in-memory, no hydration race)
async function enableFrancePack(page: Page) {
  await page.goto('/#/settings');
  await page.waitForLoadState('networkidle');

  // Wait for packs page to fully render
  await page.getByRole('heading', { name: 'france-base', level: 3 }).waitFor({ timeout: 10000 });

  const disableButton = page.getByRole('button', { name: 'Disable france-base' });
  const isEnabled = await disableButton.isVisible().catch(() => false);

  if (!isEnabled) {
    const enableButton = page.getByRole('button', { name: 'Enable france-base' });
    await enableButton.click();
    // Wait for the button state to change to Disable — confirms togglePack completed
    await disableButton.waitFor({ timeout: 10000 });
  }

  // Use /#/ (explicit home hash) so this is a guaranteed hash-change navigation
  // (no page reload), preserving the Zustand store with france-base already loaded.
  await page.goto('/#/');
  await page.waitForLoadState('networkidle');
  
  // Wait for French species to actually render in the dataset before continuing
  // This ensures the index has been rebuilt and the UI has updated
  await page.getByText(/European Robin/i).first().waitFor({ timeout: 10000 });
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
    await expect(page.getByText(/European Robin/i).first()).toBeVisible();

    // US species should not be visible (e.g., Pileated Woodpecker)
    await expect(page.getByText(/Pileated Woodpecker/i).first()).not.toBeVisible();
  });

  test('?area=france URL param filters to French species on load', async ({ page }) => {
    // Set localStorage before page load so france-base is enabled from the start
    await page.context().addInitScript(() => {
      window.localStorage.setItem('living-patch-packs-v2', JSON.stringify({
        state: { enabledPackIds: ['0-base', 'france-base'] },
        version: 0,
      }));
    });

    // Navigate directly with URL param in correct HashRouter format (fresh page load)
    await page.goto('/#/?area=france');
    await page.waitForLoadState('networkidle');

    // Wait for area chips to be present
    await expect(page.getByRole('button', { name: 'Northeast PA' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'France' })).toBeVisible({ timeout: 10000 });

    // France chip should be active (highlighted)
    const franceChip = page.getByRole('button', { name: 'France' });
    const chipClass = await franceChip.getAttribute('class');
    expect(chipClass).toContain('bg-sky-600');

    // French species should be visible
    await expect(page.getByText(/European Robin/i).first()).toBeVisible();

    // US species should not be visible
    await expect(page.getByText(/Pileated Woodpecker/i).first()).not.toBeVisible();
  });

  test('?area=northeast_pa URL param filters to NE PA species on load', async ({ page }) => {
    // Set localStorage before page load so france-base is enabled from the start
    await page.context().addInitScript(() => {
      window.localStorage.setItem('living-patch-packs-v2', JSON.stringify({
        state: { enabledPackIds: ['0-base', 'france-base'] },
        version: 0,
      }));
    });

    // Navigate directly with URL param in correct HashRouter format (fresh page load)
    await page.goto('/#/?area=northeast_pa');
    await page.waitForLoadState('networkidle');

    // Wait for area chips to be present
    await expect(page.getByRole('button', { name: 'Northeast PA' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'France' })).toBeVisible({ timeout: 10000 });

    // Northeast PA chip should be active
    const nepaChip = page.getByRole('button', { name: 'Northeast PA' });
    const chipClass = await nepaChip.getAttribute('class');
    expect(chipClass).toContain('bg-sky-600');

    // US species should be visible
    await expect(page.getByText(/Pileated Woodpecker/i).first()).toBeVisible();

    // French species should not be visible
    await expect(page.getByText(/European Robin/i).first()).not.toBeVisible();
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
    // First enable France pack (using same logic as enableFrancePack helper)
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('heading', { name: 'france-base', level: 3 }).waitFor({ timeout: 10000 });
    
    const disableButton = page.getByRole('button', { name: 'Disable france-base' });
    const isEnabled = await disableButton.isVisible().catch(() => false);
    
    if (!isEnabled) {
      const enableButton = page.getByRole('button', { name: 'Enable france-base' });
      await enableButton.click();
      await disableButton.waitFor({ timeout: 10000 });
    }

    // Go to home via hash navigation to preserve in-memory store state
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const filtersButton = page.getByRole('button', { name: /Filters/ });
    await filtersButton.click();
    await page.waitForLoadState('networkidle');

    const franceCheckbox = page.getByLabel('France');
    await franceCheckbox.click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('European Robin', { exact: true })).toBeVisible();
  });

  test('clear filters button clears area selection', async ({ page }) => {
    // Set localStorage before page load so france-base is enabled from the start
    await page.context().addInitScript(() => {
      window.localStorage.setItem('living-patch-packs-v2', JSON.stringify({
        state: { enabledPackIds: ['0-base', 'france-base'] },
        version: 0,
      }));
    });

    // Navigate directly with area param in correct HashRouter format (fresh page load)
    await page.goto('/#/?area=france');
    await page.waitForLoadState('networkidle');

    // Ensure the advanced filter panel is open
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
  test('packs page displays all packs', async ({ page }) => {
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/\d+ pack/)).toBeVisible();
    await expect(page.getByRole('heading', { name: '0-base', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'france-base', level: 3 })).toBeVisible();
  });

  test('pack cards show toggle switches', async ({ page }) => {
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    const toggleSwitches = page.locator('button[aria-label*="Disable"], button[aria-label*="Enable"]');
    const count = await toggleSwitches.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('toggling France pack removes French species from list', async ({ page }) => {
    await enableFrancePack(page);

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Disable france-base' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('European Robin', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).toBeVisible();
    // Only 0-base pack enabled
    const count = await page.getByText(/\d+ species/).first().textContent();
    expect(count).toMatch(/\d+ species/);
  });

  test('toggling France pack back on restores French species', async ({ page }) => {
    await enableFrancePack(page);

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Disable france-base' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Enable france-base' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('European Robin', { exact: true })).toBeVisible();
    // Both packs enabled — total species
    const count = await page.getByText(/\d+ species/).first().textContent();
    expect(count).toMatch(/\d+ species/);
  });

  test('disabled pack card shows grayed out state', async ({ page }) => {
    await enableFrancePack(page);

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Disable france-base' }).click();
    await page.waitForLoadState('networkidle');

    // Card root is 3 levels above the <h3> heading
    const cardRoot = page.getByRole('heading', { name: 'france-base', level: 3 }).locator('xpath=../../..');
    // Check the card has the disabled opacity class (Tailwind v4 uses class-based opacity)
    await expect(cardRoot).toHaveClass(/opacity-60/);
  });

  test('pack toggle state persists after page reload', async ({ page }) => {
    await enableFrancePack(page);

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Disable france-base' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto('/#/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('European Robin', { exact: true })).not.toBeVisible();

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('European Robin', { exact: true })).not.toBeVisible();
  });

  test('disabled base pack removes US species', async ({ page }) => {
    await enableFrancePack(page);

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Disable 0-base' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Pileated Woodpecker', { exact: true })).not.toBeVisible();
    await expect(page.getByText('European Robin', { exact: true })).toBeVisible();
    // Only france-base pack enabled
    const count = await page.getByText(/\d+ species/).first().textContent();
    expect(count).toMatch(/\d+ species/);
  });

  test('packs page shows species count for active packs', async ({ page }) => {
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    // Each pack card shows its own species count in the manifest
    // Both packs should be visible with their counts
    const speciesCounts = await page.getByText(/\d+ species/).allTextContents();
    expect(speciesCounts.length).toBeGreaterThanOrEqual(2);
  });
});
