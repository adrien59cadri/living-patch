import { test, expect } from '@playwright/test';

const MONARCH_URL = '/#/species/insect_monarch-butterfly';
const LIFE_LIST_URL = '/#/life-list';

// Each test in this file needs a clean localStorage — clear before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test.describe('Sighting logging', () => {
  test('Log Sighting button opens the sighting modal', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Log sighting' })).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Monarch Butterfly')).toBeVisible();
  });

  test('modal pre-fills today as the date', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    const today = new Date().toISOString().slice(0, 10);
    await expect(page.locator('input[type="date"]')).toHaveValue(today);
  });

  test('saves sighting and shows "Saved!" confirmation', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await page.getByRole('button', { name: /save sighting/i }).click();
    await expect(page.getByRole('button', { name: /saved!/i })).toBeVisible();
  });

  test('modal stays open after save for batch logging', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await page.getByRole('button', { name: /save sighting/i }).click();
    // Dialog still visible after save
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('close button dismisses the modal', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await page.getByRole('button', { name: /done/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('logging a sighting shows Recent Sightings section', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await page.getByRole('button', { name: /save sighting/i }).click();
    await page.getByRole('button', { name: /done/i }).click();
    await expect(page.getByText('Recent sightings')).toBeVisible();
  });

  test('logging with location shows it in Recent Sightings', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await page.locator('input[placeholder*="backyard"]').fill('pond trail');
    await page.getByRole('button', { name: /save sighting/i }).click();
    await page.getByRole('button', { name: /done/i }).click();
    await expect(page.getByText(/pond trail/)).toBeVisible();
  });

  test('sighting data persists after page reload', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await page.getByRole('button', { name: /save sighting/i }).click();
    await page.getByRole('button', { name: /done/i }).click();
    // Reload
    await page.reload();
    await expect(page.getByText('Recent sightings')).toBeVisible();
  });
});

test.describe('Tier selector', () => {
  test('tier selector is visible on species detail page', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await expect(page.getByText('Familiarity')).toBeVisible();
    await expect(page.getByRole('button', { name: /noticed/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /familiar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /know it well/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /steward/i })).toBeVisible();
  });

  test('clicking a tier marks it as active', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /familiar/i }).click();
    await expect(page.getByRole('button', { name: /familiar/i })).toHaveAttribute('aria-pressed', 'true');
  });

  test('tier persists after page reload', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /steward/i }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: /steward/i })).toHaveAttribute('aria-pressed', 'true');
  });

  test('tier badge appears on species tile after setting tier', async ({ page }) => {
    // Set tier on detail page
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /familiar/i }).click();
    // Navigate home and verify badge appears in tile
    await page.goto('/');
    await expect(page.getByText('Familiar').first()).toBeVisible();
  });
});

test.describe('Life List page', () => {
  test('Life List link in header navigates to /life-list', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /life list/i }).click();
    await expect(page).toHaveURL(LIFE_LIST_URL);
    await expect(page.getByRole('heading', { name: /my life list/i })).toBeVisible();
  });

  test('empty state shows prompt to log first sighting', async ({ page }) => {
    await page.goto(LIFE_LIST_URL);
    await expect(page.getByText('No species logged yet.')).toBeVisible();
  });

  test('after logging, species appears in All tab', async ({ page }) => {
    // Log a sighting first
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await page.getByRole('button', { name: /save sighting/i }).click();
    await page.getByRole('button', { name: /done/i }).click();
    // Go to life list
    await page.goto(LIFE_LIST_URL);
    await expect(page.getByText('Monarch Butterfly')).toBeVisible();
  });

  test('By Tier tab shows species under their tier', async ({ page }) => {
    // Set tier on detail page
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /steward/i }).click();
    // Go to life list → By Tier tab
    await page.goto(LIFE_LIST_URL);
    await page.getByRole('tab', { name: /by tier/i }).click();
    await expect(page.getByText('Steward')).toBeVisible();
    await expect(page.getByText('Monarch Butterfly')).toBeVisible();
  });

  test('Calendar tab renders current month', async ({ page }) => {
    // Need at least one sighting so the calendar renders (otherwise shows empty state)
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await page.getByRole('button', { name: /save sighting/i }).click();
    await page.getByRole('button', { name: /done/i }).click();
    await page.goto(LIFE_LIST_URL);
    await page.getByRole('tab', { name: /calendar/i }).click();
    const month = new Date().toLocaleString('en-US', { month: 'long' });
    await expect(page.getByRole('heading', { name: new RegExp(month, 'i') })).toBeVisible();
  });

  test('Stats tab shows empty state before sightings', async ({ page }) => {
    await page.goto(LIFE_LIST_URL);
    await page.getByRole('tab', { name: /stats/i }).click();
    await expect(page.getByText('No data yet.')).toBeVisible();
  });

  test('Stats tab shows totals after sighting + tier set', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await page.getByRole('button', { name: /save sighting/i }).click();
    await page.getByRole('button', { name: /done/i }).click();
    await page.goto(LIFE_LIST_URL);
    await page.getByRole('tab', { name: /stats/i }).click();
    await expect(page.getByText('1').first()).toBeVisible(); // 1 species
  });
});

test.describe('LifeListStats bar on home page', () => {
  test('stats bar hidden when no sightings or tiers', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('observed')).not.toBeVisible();
  });

  test('stats bar appears after logging a sighting', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await page.getByRole('button', { name: /save sighting/i }).click();
    await page.getByRole('button', { name: /done/i }).click();
    await page.goto('/');
    await expect(page.getByText(/observed/)).toBeVisible();
  });

  test('stats bar links to /life-list', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('button', { name: /log sighting/i }).click();
    await page.getByRole('button', { name: /save sighting/i }).click();
    await page.getByRole('button', { name: /done/i }).click();
    await page.goto('/');
    // LifeListStats renders a link containing 'View life list'
    await page.getByRole('link', { name: /life list/i }).first().click();
    await expect(page).toHaveURL(LIFE_LIST_URL);
  });
});
