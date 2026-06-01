import { test, expect } from '@playwright/test';

test.describe('Area filtering (Item 11)', () => {
  test('area filter chips appear when >1 region exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // With 2 regions (northeast_pa, france), area chips should be visible
    const areaChips = page.locator('button:has-text("Northeast PA"), button:has-text("France")');
    const count = await areaChips.count();
    expect(count).toBeGreaterThanOrEqual(2, 'Should have at least 2 area chips');
  });

  test('northeast PA and France area chips are both visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const northeastPaChip = page.getByRole('button', { name: 'Northeast PA' });
    const franceChip = page.getByRole('button', { name: 'France' });

    await expect(northeastPaChip).toBeVisible();
    await expect(franceChip).toBeVisible();
  });

  test('clicking area chip filters species list', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start with mixed regions
    const initialSpeciesText = await page.getByText(/species/).first().textContent();
    expect(initialSpeciesText).toContain('species');

    // Click France chip to filter
    const franceChip = page.getByRole('button', { name: 'France' });
    await franceChip.click();
    await page.waitForTimeout(400);

    // French species should be visible (e.g., Rougegorge familier)
    const frenchSpecies = page.getByText('Rougegorge familier');
    await expect(frenchSpecies).toBeVisible();

    // US species should not be visible (e.g., Pileated Woodpecker)
    const usSpecies = page.getByText('Pileated Woodpecker', { exact: true });
    await expect(usSpecies).not.toBeVisible();
  });

  test('?area=france URL param filters to French species on load', async ({ page }) => {
    await page.goto('/?area=france');
    await page.waitForLoadState('networkidle');

    // France chip should be active (highlighted)
    const franceChip = page.getByRole('button', { name: 'France' });
    const chipClass = await franceChip.getAttribute('class');
    expect(chipClass).toContain('bg-sky-600', 'Active chip should have sky-600 background');

    // French species should be visible
    const frenchSpecies = page.getByText('Rougegorge familier');
    await expect(frenchSpecies).toBeVisible();

    // US species should not be visible
    const usSpecies = page.getByText('Pileated Woodpecker');
    await expect(usSpecies).not.toBeVisible();
  });

  test('?area=northeast_pa URL param filters to NE PA species on load', async ({ page }) => {
    await page.goto('/?area=northeast_pa');
    await page.waitForLoadState('networkidle');

    // Northeast PA chip should be active
    const nepaChip = page.getByRole('button', { name: 'Northeast PA' });
    const chipClass = await nepaChip.getAttribute('class');
    expect(chipClass).toContain('bg-sky-600', 'Active chip should have sky-600 background');

    // US species should be visible
    const usSpecies = page.getByText('Pileated Woodpecker');
    await expect(usSpecies).toBeVisible();

    // French species should not be visible
    const frenchSpecies = page.getByText('Rougegorge familier');
    await expect(frenchSpecies).not.toBeVisible();
  });

  test('clicking area chip updates URL param', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click France chip
    const franceChip = page.getByRole('button', { name: 'France' });
    await franceChip.click();
    await page.waitForTimeout(400);

    // URL should contain ?area=france
    const url = page.url();
    expect(url).toContain('area=france');
  });

  test('area filter persists with other filters', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Apply area filter first
    const franceChip = page.getByRole('button', { name: 'France' });
    await franceChip.click();
    await page.waitForTimeout(400);

    // Search for bird
    const searchBar = page.getByRole('searchbox');
    await searchBar.fill('bird');
    await page.waitForTimeout(400);

    // URL should have both area and search params
    const url = page.url();
    expect(url).toContain('area=france');

    // Should show French birds (bird_rouge-gorge, etc.)
    // but not US birds that match "bird" form
    const speciesText = page.locator('text=species');
    await expect(speciesText.first()).toBeVisible();
  });

  test('area filter is shown in advanced filter panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open advanced filters by clicking Filters button
    const filtersButton = page.getByRole('button', { name: /Filters/ });
    await filtersButton.click();
    await page.waitForTimeout(200);

    // Look for "Area" section in filter panel
    const areaLabel = page.getByText('AREA', { exact: false });
    await expect(areaLabel).toBeVisible();

    // Should have checkboxes for Northeast PA and France
    const nepaCheckbox = page.getByLabel('Northeast PA');
    const franceCheckbox = page.getByLabel('France');
    await expect(nepaCheckbox).toBeVisible();
    await expect(franceCheckbox).toBeVisible();
  });

  test('area filter works from advanced filter panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open filters
    const filtersButton = page.getByRole('button', { name: /Filters/ });
    await filtersButton.click();
    await page.waitForTimeout(200);

    // Click France checkbox
    const franceCheckbox = page.getByLabel('France');
    await franceCheckbox.click();
    await page.waitForTimeout(400);

    // French species should appear
    const frenchSpecies = page.getByText('Rougegorge familier');
    await expect(frenchSpecies).toBeVisible();
  });

  test('clear filters button clears area selection', async ({ page }) => {
    await page.goto('/?area=france');
    await page.waitForLoadState('networkidle');

    // Open filters
    const filtersButton = page.getByRole('button', { name: /Filters/ });
    await filtersButton.click();
    await page.waitForTimeout(200);

    // Click "Clear filters"
    const clearButton = page.getByRole('button', { name: /Clear filters/ });
    await clearButton.click();
    await page.waitForTimeout(400);

    // Both regions should now be visible
    const speciesCountText = page.getByText(/104 species/);
    await expect(speciesCountText).toBeVisible();
  });
});

test.describe('French species (Item 10)', () => {
  test('French species are loaded in dataset', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const speciesCountText = page.getByText('104 species');
    await expect(speciesCountText).toBeVisible();
  });

  test('French bird species are visible when all areas selected', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const frenchBirds = [
      'Rougegorge familier',
      'Mésange charbonnière',
      'Pic vert',
      'Geai des chênes',
    ];

    for (const bird of frenchBirds) {
      const birdLocator = page.getByText(bird, { exact: true });
      await expect(birdLocator).toBeVisible({ timeout: 5000 });
    }
  });

  test('French mammals are visible when all areas selected', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const frenchMammals = ['Renard roux', 'Sanglier', 'Chevreuil', 'Hérisson d\'Europe'];

    for (const mammal of frenchMammals) {
      const mammalLocator = page.getByText(mammal, { exact: true });
      await expect(mammalLocator).toBeVisible({ timeout: 5000 });
    }
  });

  test('French trees are visible when all areas selected', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const frenchTrees = ['Chêne pédonculé', 'Hêtre commun', 'Châtaignier'];

    for (const tree of frenchTrees) {
      const treeLocator = page.getByText(tree, { exact: true });
      await expect(treeLocator).toBeVisible({ timeout: 5000 });
    }
  });

  test('French butterflies are visible when all areas selected', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const frenchButterflies = ['Paon du jour', 'Vulcain', 'Citron', 'Machaon'];

    for (const butterfly of frenchButterflies) {
      const butterflyLocator = page.getByText(butterfly, { exact: true });
      await expect(butterflyLocator).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Pack management (Item 9)', () => {
  test('packs page displays both packs', async ({ page }) => {
    await page.goto('/packs');
    await page.waitForLoadState('networkidle');

    // Should show "The dataset is built from 2 packs."
    const packCountText = page.getByText(/2 pack/);
    await expect(packCountText).toBeVisible();

    // Both pack cards should be visible
    const basePackCard = page.getByText('0-base');
    const francePackCard = page.getByText('france-base');

    await expect(basePackCard).toBeVisible();
    await expect(francePackCard).toBeVisible();
  });

  test('pack cards show toggle switches', async ({ page }) => {
    await page.goto('/packs');
    await page.waitForLoadState('networkidle');

    // Should have 2 toggle switches (one per pack)
    const toggleSwitches = page.locator('button[aria-label*="Disable"], button[aria-label*="Enable"]');
    const count = await toggleSwitches.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('toggling France pack removes French species from list', async ({ page }) => {
    // Navigate to packs page
    await page.goto('/packs');
    await page.waitForLoadState('networkidle');

    // Find the France pack toggle and click it to disable
    const francePackCard = page.getByText('france-base').locator('..');
    const toggleButton = francePackCard.locator('button[aria-label*="Disable"], button[aria-label*="Enable"]');
    await toggleButton.click();
    await page.waitForTimeout(400);

    // Go back to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // French species should not be visible
    const frenchSpecies = page.getByText('Rougegorge familier');
    await expect(frenchSpecies).not.toBeVisible();

    // US species should still be visible
    const usSpecies = page.getByText('Pileated Woodpecker');
    await expect(usSpecies).toBeVisible();

    // Species count should be 80 (not 104)
    const speciesCountText = page.getByText('80 species');
    await expect(speciesCountText).toBeVisible();
  });

  test('toggling France pack back on restores French species', async ({ page }) => {
    // Navigate to packs page
    await page.goto('/packs');
    await page.waitForLoadState('networkidle');

    // Find and click France pack toggle to disable
    const francePackCard = page.getByText('france-base').locator('..');
    let toggleButton = francePackCard.locator('button[aria-label*="Disable"], button[aria-label*="Enable"]');
    await toggleButton.click();
    await page.waitForTimeout(200);

    // Click it again to enable
    toggleButton = francePackCard.locator('button[aria-label*="Disable"], button[aria-label*="Enable"]');
    await toggleButton.click();
    await page.waitForTimeout(200);

    // Go back to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // French species should be visible again
    const frenchSpecies = page.getByText('Rougegorge familier');
    await expect(frenchSpecies).toBeVisible();

    // Species count should be 104
    const speciesCountText = page.getByText('104 species');
    await expect(speciesCountText).toBeVisible();
  });

  test('disabled pack card shows grayed out state', async ({ page }) => {
    // Navigate to packs page
    await page.goto('/packs');
    await page.waitForLoadState('networkidle');

    // Find and click France pack toggle to disable
    const francePackCard = page.getByText('france-base').locator('..');
    const toggleButton = francePackCard.locator('button[aria-label*="Disable"], button[aria-label*="Enable"]');
    await toggleButton.click();
    await page.waitForTimeout(200);

    // Check that the card has reduced opacity
    const frameCard = francePackCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        opacity: style.opacity,
      };
    });

    const opacityValue = (await frameCard).opacity;
    // Disabled cards should have opacity: 0.5 or similar
    expect(parseFloat(opacityValue)).toBeLessThan(1);
  });

  test('pack toggle state persists after page reload', async ({ page }) => {
    // Navigate to packs page
    await page.goto('/packs');
    await page.waitForLoadState('networkidle');

    // Find and click France pack toggle to disable
    const francePackCard = page.getByText('france-base').locator('..');
    const toggleButton = francePackCard.locator('button[aria-label*="Disable"], button[aria-label*="Enable"]');
    await toggleButton.click();
    await page.waitForTimeout(200);

    // Go to home and verify French species are gone
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    let frenchSpecies = page.getByText('Rougegorge familier');
    await expect(frenchSpecies).not.toBeVisible();

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // French species should still be gone (toggle state persisted)
    frenchSpecies = page.getByText('Rougegorge familier');
    await expect(frenchSpecies).not.toBeVisible();
  });

  test('disabled base pack removes US species', async ({ page }) => {
    // Navigate to packs page
    await page.goto('/packs');
    await page.waitForLoadState('networkidle');

    // Find and click base pack toggle to disable
    const basePackCard = page.getByText('0-base').locator('..');
    const toggleButton = basePackCard.locator('button[aria-label*="Disable"], button[aria-label*="Enable"]');
    await toggleButton.click();
    await page.waitForTimeout(200);

    // Go to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // US species should not be visible
    const usSpecies = page.getByText('Pileated Woodpecker');
    await expect(usSpecies).not.toBeVisible();

    // French species should still be visible
    const frenchSpecies = page.getByText('Rougegorge familier');
    await expect(frenchSpecies).toBeVisible();

    // Species count should be 24 (just France)
    const speciesCountText = page.getByText('24 species');
    await expect(speciesCountText).toBeVisible();
  });

  test('packs page shows species count for active packs', async ({ page }) => {
    await page.goto('/packs');
    await page.waitForLoadState('networkidle');

    // Base pack should show 80 species
    const basePackCard = page.getByText('0-base').locator('..');
    const baseSpeciesCount = basePackCard.getByText('80 species');
    await expect(baseSpeciesCount).toBeVisible();

    // France pack should show 24 species
    const francePackCard = page.getByText('france-base').locator('..');
    const franceSpeciesCount = francePackCard.getByText('24 species');
    await expect(franceSpeciesCount).toBeVisible();
  });
});
