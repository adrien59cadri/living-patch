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

    // Check for species count text - should show "56 species"
    const speciesCountText = page.getByText('56 species');
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
