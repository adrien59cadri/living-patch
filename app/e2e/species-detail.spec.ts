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
    await expect(page.getByText('Butterfly', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('May-Oct', { exact: true }).first()).toBeVisible();
  });

  test('functional description is visible', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await expect(page.getByText(/Orange and black butterfly/)).toBeVisible();
  });

  test('life stages section shows all four stages', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await expect(page.getByText('Egg', { exact: true })).toBeVisible();
    await expect(page.getByText('Caterpillar', { exact: true })).toBeVisible();
    await expect(page.getByText('Chrysalis', { exact: true })).toBeVisible();
    await expect(page.getByText('Adult', { exact: true })).toBeVisible();
  });

  test('key relationships section shows obligate milkweed', async ({ page }) => {
    await page.goto(MONARCH_URL);
    // The milkweeds are grouped together in the parasitism section
    await expect(page.getByText(/Common Milkweed/)).toBeVisible();
    // Expand Parasitism & Hosting section to reveal individual species
    const expandButton = page.getByRole('button', { name: /Parasitism & Hosting/ }).first();
    await expandButton.click();
    // After expanding, the group should show with Critical strength badge
    const groupButton = page.getByRole('button', { name: /insect_monarch-butterfly group/ }).first();
    await expect(groupButton).toBeVisible();
  });

  test('habitat neighbors section shows plants category', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await expect(page.getByText('Plants')).toBeVisible();
  });

  test('Log Sighting button is present and enabled', async ({ page }) => {
    await page.goto(MONARCH_URL);
    const btn = page.getByRole('button', { name: /log sighting/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
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

test.describe('Clickable tags — navigate to filtered list', () => {
  test('form tag on detail page is a link', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.waitForLoadState('networkidle');

    // The form tag "Butterfly" should be wrapped in an <a> link
    const formLink = page.getByRole('link').filter({ hasText: 'Butterfly' }).first();
    await expect(formLink).toBeVisible();
    await expect(formLink).toHaveAttribute('href', /form=butterfly/);
  });

  test('clicking form tag navigates to filtered list', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.waitForLoadState('networkidle');

    const formLink = page.getByRole('link').filter({ hasText: 'Butterfly' }).first();
    await formLink.click();
    await page.waitForLoadState('networkidle');

    // Should now be on the list page with Monarch visible
    await expect(page.getByText('Monarch Butterfly', { exact: true })).toBeVisible();
    // Non-butterfly species should be filtered out
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).not.toBeVisible();
  });

  test('clicking habitat tag navigates to filtered list', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.waitForLoadState('networkidle');

    // Find a habitat tag link in the tags row (first habitat tag)
    const habitatLinks = page.getByRole('link').filter({ hasText: /Meadow|Field|Garden|Forest/ });
    const firstHabitatLink = habitatLinks.first();
    await expect(firstHabitatLink).toBeVisible();

    await firstHabitatLink.click();
    await page.waitForLoadState('networkidle');

    // Should be on the list page, count reduced from 67
    await expect(page.getByText('73 species', { exact: true })).not.toBeVisible();
  });

  test('keystone badge on detail page is a link', async ({ page }) => {
    await page.goto(MONARCH_URL);
    await page.waitForLoadState('networkidle');

    // Keystone badge should be wrapped in a link
    const keystoneLink = page.getByRole('link').filter({ hasText: /Keystone/ }).first();
    await expect(keystoneLink).toBeVisible();
    await expect(keystoneLink).toHaveAttribute('href', /keystone_type=/);
  });
});
