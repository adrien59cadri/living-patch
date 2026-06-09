import { test, expect } from '@playwright/test';

const PILEATED_URL = '/#/species/bird_pileated-woodpecker';
const PILEATED_BIRDS_URL = '/#/species/bird_pileated-woodpecker/neighbors/birds';

test.describe('Species detail page — Pileated Woodpecker', () => {
  test('renders without JS errors (regression: missing life_stages crashed the page)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(PILEATED_URL);
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
    await expect(page.getByRole('heading', { name: 'Pileated Woodpecker' })).toBeVisible();
  });

  test('renders name block with ecosystem engineer keystone badge', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await expect(page.getByRole('heading', { name: 'Pileated Woodpecker' })).toBeVisible();
    await expect(page.getByText(/Ecosystem Engineer/)).toBeVisible();
  });

  test('latin name hidden by default, revealed on toggle', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await expect(page.getByText('Dryocopus pileatus')).not.toBeVisible();
    await page.getByText('+ Scientific name').click();
    await expect(page.getByText(/Dryocopus pileatus/)).toBeVisible();
  });

  test('tags row shows form and habitats', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await expect(page.getByText('Woodpecker', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Forest', { exact: true }).first()).toBeVisible();
  });

  test('functional description is visible', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await expect(page.getByText(/Largest woodpecker in PA/)).toBeVisible();
  });

  test('life stages section absent (species has no life_stages data)', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await page.waitForLoadState('networkidle');
    // Life stages heading should not appear because the species has no life_stages field
    await expect(page.getByText('Life Stages')).not.toBeVisible();
  });

  test('shows commensalism relationships (cavity dependents)', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await expect(page.getByText(/Commensalism/)).toBeVisible();
  });

  test('shows Wood Duck as a cavity dependent', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await expect(page.getByText(/Wood Duck/)).toBeVisible();
  });

  test('conservation status badge shows Least Concern', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await expect(page.getByText(/Least Concern/)).toBeVisible();
  });

  test('image credit line shows author and Wikipedia link', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Photo:/)).toBeVisible();
    const wikiLink = page.getByRole('link', { name: /Wikipedia/ });
    await expect(wikiLink).toBeVisible();
    await expect(wikiLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Dryocopus_pileatus');
    await expect(wikiLink).toHaveAttribute('target', '_blank');
  });

  test('Log Sighting button is present and enabled', async ({ page }) => {
    await page.goto(PILEATED_URL);
    const btn = page.getByRole('button', { name: /log sighting/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('habitat neighbors section shows birds category', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await expect(page.getByText('Birds')).toBeVisible();
  });
});

test.describe('Pileated Woodpecker — neighbor drill-down', () => {
  test('clicking Birds tile navigates to NeighborListView', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await page.getByRole('link', { name: /Birds/ }).first().click();
    await expect(
      page.getByRole('heading', { name: /birds connected to pileated woodpecker/i })
    ).toBeVisible();
  });

  test('back link returns to species card', async ({ page }) => {
    await page.goto(PILEATED_BIRDS_URL);
    await page.getByRole('link', { name: /← pileated woodpecker/i }).click();
    await expect(
      page.getByRole('heading', { name: 'Pileated Woodpecker' })
    ).toBeVisible();
  });
});

test.describe('Pileated Woodpecker — clickable tags', () => {
  test('form tag is a link filtered to woodpeckers', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await page.waitForLoadState('networkidle');
    const formLink = page.getByRole('link').filter({ hasText: 'Woodpecker' }).first();
    await expect(formLink).toBeVisible();
    await expect(formLink).toHaveAttribute('href', /form=woodpecker/);
  });

  test('clicking form tag navigates to filtered list showing pileated', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await page.waitForLoadState('networkidle');
    await page.getByRole('link').filter({ hasText: 'Woodpecker' }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).toBeVisible();
    await expect(page.getByText('Monarch Butterfly', { exact: true })).not.toBeVisible();
  });

  test('keystone badge is a link to filtered list', async ({ page }) => {
    await page.goto(PILEATED_URL);
    await page.waitForLoadState('networkidle');
    const keystoneLink = page.getByRole('link').filter({ hasText: /Ecosystem Engineer/ }).first();
    await expect(keystoneLink).toBeVisible();
    await expect(keystoneLink).toHaveAttribute('href', /keystone_type=/);
  });
});
