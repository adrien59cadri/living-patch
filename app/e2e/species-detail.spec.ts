import { test, expect } from '@playwright/test';

const MONARCH_URL = '/#/species/insect_monarch-butterfly';
const MONARCH_PLANTS_URL = '/#/species/insect_monarch-butterfly/neighbors/plants';

test.describe('Species detail page — Monarch Butterfly', () => {
  test('renders name block and keystone badge', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await expect(page.getByRole('heading', { name: 'Monarch Butterfly' })).toBeVisible();
    await expect(page.getByText('🤝 Keystone Mutualist')).toBeVisible();
  });

  test('latin name hidden by default, revealed on toggle', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await expect(page.getByText('Danaus plexippus')).not.toBeVisible();
    await page.getByText('+ Scientific name').click();
    await expect(page.getByText(/Danaus plexippus/)).toBeVisible();
  });

  test('tags row shows form and active_months chip', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await expect(page.getByText('Butterfly', { exact: true })).toBeVisible();
    await expect(page.getByText('May-Oct', { exact: true }).first()).toBeVisible();
  });

  test('functional description is visible', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await expect(page.getByText(/Orange and black butterfly/)).toBeVisible();
  });

  test('LIFE STAGES section shows all four stages', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await expect(page.getByText('LIFE STAGES')).toBeVisible();
    await expect(page.getByText('Egg', { exact: true })).toBeVisible();
    await expect(page.getByText('Caterpillar', { exact: true })).toBeVisible();
    await expect(page.getByText('Chrysalis', { exact: true })).toBeVisible();
    await expect(page.getByText('Adult', { exact: true })).toBeVisible();
  });

  test('KEY RELATIONSHIPS section shows obligate milkweed', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await expect(page.getByText('Key Relationships')).toBeVisible();
    await expect(page.getByText('Common Milkweed', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Obligate', { exact: true })).toBeVisible();
  });

  test('RELATED BY HABITAT section shows Plants category tile', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await expect(page.getByText('Related by Habitat')).toBeVisible();
    await expect(page.getByText('Plants')).toBeVisible();
  });

  test('Log Sighting button is present and disabled', async ({ page }) => {
    await page.goto(MONARCH_URL);
    const btn = page.getByRole('button', { name: /log sighting/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
  });
});

test.describe('Neighbor drill-down', () => {
  test('clicking Plants tile navigates to NeighborListView', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.getByRole('link', { name: /Plants/ }).first().click();
    await expect(
      page.getByRole('heading', { name: /plants connected to monarch butterfly/i })
    ).toBeVisible();
    await expect(page.getByText('Common Milkweed')).toBeVisible();
  });

  test('back link returns to species card', async ({ page }) => {
    await page.goto(MONARCH_PLANTS_URL);
    await page.getByRole('link', { name: /monarch butterfly/i }).click();
    await expect(
      page.getByRole('heading', { name: 'Monarch Butterfly' })
    ).toBeVisible();
  });

  test('symbiosis type badge visible in neighbor list', async ({ page }) => {
    await page.goto(MONARCH_PLANTS_URL);
    await expect(page.getByText('Parasitism & Hosting').first()).toBeVisible();
  });
});

test.describe('Edge cases', () => {
  test('shows Species not found for invalid species id', async ({ page }) => {
    await page.goto('/#/species/nonexistent-species-xyz');
    await expect(page.getByText('Species not found.')).toBeVisible();
  });

  test('shows Category not found for invalid neighbor category', async ({ page }) => {
    await page.goto('/#/species/insect_monarch-butterfly/neighbors/invalid-cat');
    await expect(page.getByText('Category not found.')).toBeVisible();
  });
});
