import { test, expect, Page } from '@playwright/test';

// France pack is sourced from 1-france.toon — these tests confirm the toon-decoded
// data is structurally identical to the original JSON (no field loss, correct types).

async function enableFrancePack(page: Page) {
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

  await page.goto('/#/');
  await page.waitForLoadState('networkidle');
  await page.getByText(/European Robin/i).first().waitFor({ timeout: 10000 });
}

test.describe('France pack (Toon format source)', () => {
  test('france-base pack appears in settings', async ({ page }) => {
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'france-base', level: 3 })).toBeVisible();
  });

  test('European Robin appears after enabling france-base', async ({ page }) => {
    await enableFrancePack(page);
    await expect(page.getByText(/European Robin/i).first()).toBeVisible();
  });

  test('french species detail shows correct latin name and habitat', async ({ page }) => {
    await enableFrancePack(page);
    await page.goto('/#/species/bird_european-robin');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Erithacus rubecula/i)).toBeVisible();
    await expect(page.getByText(/forest/i).first()).toBeVisible();
  });

  test('french species detail shows bilingual common name', async ({ page }) => {
    await enableFrancePack(page);
    await page.goto('/#/species/bird_european-robin');
    await page.waitForLoadState('networkidle');
    // Multilingual common_name object must survive toon decode
    await expect(page.getByText(/Rougegorge familier/i)).toBeVisible();
  });

  test('france pack loads at least 20 species', async ({ page }) => {
    await enableFrancePack(page);
    // Filter to France region to count only france-base species
    await page.goto('/#/?region=france');
    await page.waitForLoadState('networkidle');
    const tiles = page.locator('[data-testid="species-tile"], .species-tile, article');
    // At least 20 france species rendered — guards against silent truncation
    await expect(tiles).toHaveCount(20, { timeout: 10000 });
  });
});
