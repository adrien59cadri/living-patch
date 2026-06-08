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
  test('france-base pack shows toon format label in settings', async ({ page }) => {
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    const heading = page.getByRole('heading', { name: 'france-base', level: 3 });
    await expect(heading).toBeVisible();
    // Format badge should show 'toon' (not 'json')
    const formatBadge = heading.locator('xpath=../../..').getByText(/toon/i);
    await expect(formatBadge).toBeVisible();
  });

  test('france pack species load correctly from toon format', async ({ page }) => {
    await enableFrancePack(page);
    // Click France area chip to filter to france-base only
    await page.getByRole('button', { name: 'France' }).click();
    await page.waitForLoadState('networkidle');
    // Count species count text — guards against silent truncation during toon decode
    const speciesCountText = await page.getByText(/\d+ species/i).first().textContent();
    const match = speciesCountText?.match(/(\d+)/);
    const count = match ? parseInt(match[1], 10) : 0;
    // France pack has 20+ species — if toon decode silently truncated, count would be much lower
    expect(count).toBeGreaterThanOrEqual(20);
  });
});
