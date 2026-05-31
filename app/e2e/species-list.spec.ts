import { test, expect } from '@playwright/test';

test.describe('Species list page basic functionality', () => {
  test('app mounts and renders without errors', async ({ page }) => {
    const errors: string[] = [];

    // Capture console errors and uncaught exceptions
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(`Uncaught exception: ${error.message}`);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that the root element exists in DOM (React mounted)
    const root = page.locator('#root');
    const rootCount = await root.count();
    expect(rootCount).toBe(1, 'React root element should exist in DOM');
    
    // Check if root has content (children elements)
    const rootContent = await root.locator('> *').count();
    expect(rootContent).toBeGreaterThan(0, 'React root should have rendered children');
    
    // Verify no errors occurred during app mounting
    expect(errors).toEqual([], `Expected no console errors, but got: ${errors.join(', ')}`);
    
    // Check for visibility/CSS issues with root element
    const computedStyle = await root.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        width: style.width,
        height: style.height,
      };
    });
    
    // Log the computed style for debugging
    console.log('Root element computed style:', computedStyle);
  });

  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page title or heading is present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for search bar which should be on the page (most reliable indicator of page load)
    const searchBar = page.getByRole('searchbox');
    await expect(searchBar).toBeVisible();
  });

  test('search bar is on the page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox');
    await expect(searchBar).toBeVisible();
  });

  test('species list text is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for species in the list (try common name or "species" text)
    const speciesText = page.getByText('Pileated Woodpecker').or(page.getByText(/species/, { exact: false }));
    await expect(speciesText.first()).toBeVisible();
  });

  test('pack loads with correct species count', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for species count text - should show "64 species"
    const speciesCountText = page.getByText('64 species');
    await expect(speciesCountText).toBeVisible();
  });

  test('pack contains expected keystone species', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify key species from the dataset are present
    const keystoneSpecies = [
      'Pileated Woodpecker',
      'Monarch Butterfly',
      'White Oak',
      'Common Milkweed',
      'Beaver',
    ];

    for (const species of keystoneSpecies) {
      const speciesLocator = page.getByText(species, { exact: true });
      await expect(speciesLocator).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('taxonomic groups are loaded', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Groups section is below species list, so scroll down to view it
    const groupsHeading = page.getByText('Species Groups');
    await groupsHeading.scrollIntoViewIfNeeded();
    
    // Verify groups section is present and visible
    await expect(groupsHeading).toBeVisible();
  });
});

test.describe('Search bar', () => {
  test('typing in search box does not crash the app', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox');
    await searchBar.fill('oak');

    // Wait for debounce + re-render
    await page.waitForTimeout(400);

    // App should still be rendering (no crash)
    await expect(page.locator('#root > *')).toBeVisible();
    expect(errors, `Console/page errors after search: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('single-char "o" finds Common Orb-weaver Spider without crashing', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox');
    await searchBar.fill('o');
    await page.waitForTimeout(400);

    // App should still be rendering (no crash)
    await expect(page.locator('#root > *')).toBeVisible();
    expect(errors, `Console/page errors after search: ${errors.join(', ')}`).toHaveLength(0);

    // "o" matches "Common Orb-weaver Spider" via common_name
    await expect(page.getByText('Common Orb-weaver Spider', { exact: true })).toBeVisible();
  });

  test('"orb" finds Common Orb-weaver Spider', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox');
    await searchBar.fill('orb');
    await page.waitForTimeout(400);

    await expect(page.getByText('Common Orb-weaver Spider', { exact: true })).toBeVisible();
  });

  test('"ORB WEAVER" (uppercase) finds Common Orb-weaver Spider', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox');
    await searchBar.fill('ORB WEAVER');
    await page.waitForTimeout(400);

    await expect(page.getByText('Common Orb-weaver Spider', { exact: true })).toBeVisible();
  });

  test('search filters species list correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox');
    await searchBar.fill('oak');
    await page.waitForTimeout(400);

    // White Oak and Northern Red Oak should appear
    await expect(page.getByText('White Oak', { exact: true })).toBeVisible();
    await expect(page.getByText('Northern Red Oak', { exact: true })).toBeVisible();

    // Unrelated species should not appear
    await expect(page.getByText('Monarch Butterfly', { exact: true })).not.toBeVisible();
  });

  test('search with no matches shows empty state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox');
    await searchBar.fill('zzznomatchxxx');
    await page.waitForTimeout(400);

    await expect(page.getByText(/No species found/)).toBeVisible();
  });

  test('clearing search restores full species list', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox');
    await searchBar.fill('oak');
    await page.waitForTimeout(400);
    // When filtered, count shows "N of 64 species" — "64 species" exact is not present
    await expect(page.getByText('64 species', { exact: true })).not.toBeVisible();

    await searchBar.clear();
    await page.waitForTimeout(400);
    await expect(page.getByText('64 species', { exact: true })).toBeVisible();
  });

  test('search works across latin names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchBar = page.getByRole('searchbox');
    // "plexippus" is part of Monarch Butterfly's latin name
    await searchBar.fill('plexippus');
    await page.waitForTimeout(400);

    await expect(page.getByText('Monarch Butterfly', { exact: true })).toBeVisible();
  });
});

test.describe('Quick filter bar', () => {
  test('form chips are visible on the list page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The QuickFilterBar renders form chips as buttons matching form labels
    await expect(page.getByRole('button', { name: 'Butterfly', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tree', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Woodpecker', exact: true })).toBeVisible();
  });

  test('clicking form chip filters species list', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Butterfly', exact: true }).click();

    // Monarch Butterfly (a butterfly) should remain visible
    await expect(page.getByText('Monarch Butterfly', { exact: true })).toBeVisible();
    // Pileated Woodpecker (a woodpecker) should be hidden
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).not.toBeVisible();
  });

  test('clicking active form chip again deselects it and restores full list', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const chip = page.getByRole('button', { name: 'Butterfly', exact: true });
    await chip.click();
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).not.toBeVisible();

    // Click again to deselect
    await chip.click();
    await expect(page.getByText('64 species', { exact: true })).toBeVisible();
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).toBeVisible();
  });

  test('habitat chip filters species list', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const forestChip = page.getByRole('button', { name: 'Forest', exact: true });
    await expect(forestChip).toBeVisible();
    await forestChip.click();

    // Count should no longer be "64 species" (some species filtered out)
    await expect(page.getByText('64 species', { exact: true })).not.toBeVisible();
    // Pileated Woodpecker lives in forest
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).toBeVisible();
  });

  test('URL param ?form= pre-applies form chip and shows filtered results', async ({ page }) => {
    await page.goto('/#/?form=butterfly');
    await page.waitForLoadState('networkidle');

    // Monarch Butterfly should be visible
    await expect(page.getByText('Monarch Butterfly', { exact: true })).toBeVisible();
    // Pileated Woodpecker should be hidden
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).not.toBeVisible();
  });

  test('URL param ?habitat= pre-applies habitat chip', async ({ page }) => {
    await page.goto('/#/?habitat=forest');
    await page.waitForLoadState('networkidle');

    // Species count should be less than 56 (forest filtered)
    await expect(page.getByText('64 species', { exact: true })).not.toBeVisible();
    // Pileated Woodpecker lives in forest and should be visible
    await expect(page.getByText('Pileated Woodpecker', { exact: true })).toBeVisible();
  });
});
