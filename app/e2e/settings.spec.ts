import { test, expect } from '@playwright/test';

const SETTINGS_URL = '/#/settings';
const MONARCH_URL = '/#/species/insect_monarch-butterfly';
const LIFE_LIST_URL = '/#/life-list';

// Helper: log a sighting for the Monarch via the UI so the life list has data
async function logMonarchSighting(page: import('@playwright/test').Page) {
  await page.goto(MONARCH_URL);
  await page.getByRole('button', { name: /log sighting/i }).click();
  await page.getByRole('button', { name: /save sighting/i }).click();
  await page.getByRole('button', { name: /done/i }).click();
}

// Seed data structures for Import tests (used as file contents only — not seeded into localStorage directly)
const SEED_ENTRIES = [
  {
    speciesId: 'insect_monarch-butterfly',
    tier: 'familiar',
    sightingCount: 2,
    lastUpdated: 1748650000000,
  },
];

const SEED_SIGHTINGS = [
  {
    id: 'test-id-1',
    speciesId: 'insect_monarch-butterfly',
    date: '2026-05-01',
    createdAt: 1748650000000,
  },
  {
    id: 'test-id-2',
    speciesId: 'insect_monarch-butterfly',
    date: '2026-05-10',
    createdAt: 1748700000000,
  },
];

const VALID_BACKUP = {
  entries: SEED_ENTRIES,
  sightings: SEED_SIGHTINGS,
  exportedAt: '2026-05-31T12:00:00.000Z',
  version: 1,
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test.describe('Settings page', () => {
  test('Settings link in header navigates to /settings', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /settings/i }).click();
    await expect(page).toHaveURL(SETTINGS_URL);
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  });

  test('Life List Backup section is visible', async ({ page }) => {
    await page.goto(SETTINGS_URL);
    await expect(page.getByRole('heading', { name: /life list backup/i })).toBeVisible();
  });
});

test.describe('Export', () => {
  test('Export button is disabled when life list is empty', async ({ page }) => {
    await page.goto(SETTINGS_URL);
    await expect(page.getByRole('button', { name: /^export$/i })).toBeDisabled();
  });

  test('Export button is enabled after data is present', async ({ page }) => {
    await logMonarchSighting(page);
    await page.goto(SETTINGS_URL);
    await expect(page.getByRole('button', { name: /^export$/i })).toBeEnabled();
  });

  test('Export button shows species and sighting counts', async ({ page }) => {
    await logMonarchSighting(page);
    await page.goto(SETTINGS_URL);
    await expect(page.getByText(/1 species.*1 sighting/)).toBeVisible();
  });

  test('clicking Export triggers a file download', async ({ page }) => {
    await logMonarchSighting(page);
    await page.goto(SETTINGS_URL);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /^export$/i }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^living-patch-life-list-\d{4}-\d{2}-\d{2}\.json$/);
  });
});

test.describe('Import', () => {
  test('"Import from file" button is visible on the settings page', async ({ page }) => {
    await page.goto(SETTINGS_URL);
    await expect(page.getByRole('button', { name: /import from file/i })).toBeVisible();
  });

  test('selecting a valid backup file shows confirmation panel with counts', async ({ page }) => {
    await page.goto(SETTINGS_URL);

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /import from file/i }).click(),
    ]);
    await fileChooser.setFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(VALID_BACKUP)),
    });

    // Confirmation panel with entry/sighting counts
    await expect(page.getByText(/1 species entr/i)).toBeVisible();
    await expect(page.getByText(/2 sightings/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /confirm restore/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('cancelling import dismisses the confirmation panel', async ({ page }) => {
    await page.goto(SETTINGS_URL);

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /import from file/i }).click(),
    ]);
    await fileChooser.setFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(VALID_BACKUP)),
    });
    await expect(page.getByRole('button', { name: /confirm restore/i })).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('button', { name: /confirm restore/i })).not.toBeVisible();
  });

  test('confirming import shows success message', async ({ page }) => {
    await page.goto(SETTINGS_URL);

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /import from file/i }).click(),
    ]);
    await fileChooser.setFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(VALID_BACKUP)),
    });
    await page.getByRole('button', { name: /confirm restore/i }).click();
    await expect(page.getByText(/restored successfully/i)).toBeVisible();
  });

  test('confirming import restores data visible in life list', async ({ page }) => {
    await page.goto(SETTINGS_URL);

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /import from file/i }).click(),
    ]);
    await fileChooser.setFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(VALID_BACKUP)),
    });
    await page.getByRole('button', { name: /confirm restore/i }).click();

    // Navigate to life list and confirm the imported species is there
    await page.goto(LIFE_LIST_URL);
    await expect(page.getByText('Monarch Butterfly')).toBeVisible();
  });

  test('importing invalid JSON shows an error message', async ({ page }) => {
    await page.goto(SETTINGS_URL);

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /import from file/i }).click(),
    ]);
    await fileChooser.setFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer: Buffer.from('not valid json {{{'),
    });

    await expect(page.getByText(/could not parse the file/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /confirm restore/i })).not.toBeVisible();
  });

  test('importing a JSON file missing required fields shows an error', async ({ page }) => {
    await page.goto(SETTINGS_URL);

    const badBackup = { foo: 'bar' }; // valid JSON, but no entries/sightings

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /import from file/i }).click(),
    ]);
    await fileChooser.setFiles({
      name: 'bad-structure.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(badBackup)),
    });

    await expect(page.getByText(/invalid backup file/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /confirm restore/i })).not.toBeVisible();
  });
});
