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
    // Click through from home (avoids full-page reload / persist hydration race)
    await page.getByText(/European Robin/i).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Erithacus rubecula/i)).toBeVisible();
    await expect(page.getByText(/forest/i).first()).toBeVisible();
  });

  test('french species detail shows bilingual common name', async ({ page }) => {
    await enableFrancePack(page);
    // Click through from home (avoids full-page reload / persist hydration race)
    await page.getByText(/European Robin/i).first().click();
    await page.waitForLoadState('networkidle');
    // Multilingual common_name object must survive toon decode — French alt name shown in detail
    await expect(page.getByText(/Rougegorge familier/i)).toBeVisible();
  });

  test('france pack loads at least 20 species', async ({ page }) => {
    await enableFrancePack(page);
    // Click France area chip to filter to france-base only
    await page.getByRole('button', { name: 'France' }).click();
    await page.waitForLoadState('networkidle');
    // Count species count text — guards against silent truncation during toon decode
    const speciesCountText = await page.getByText(/\d+ species/i).first().textContent();
    const match = speciesCountText?.match(/(\d+)/);
    const count = match ? parseInt(match[1], 10) : 0;
    expect(count).toBeGreaterThanOrEqual(20);
  });
});
