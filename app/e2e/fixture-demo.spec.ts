import { test } from './fixtures';

test.describe('Error Capture Fixture Demo', () => {
  test('normal test - fails if console error occurs', async ({ page }) => {
    // This test would fail if a console.error() was called
    // The fixture automatically captures and reports it
    await page.goto('/');
    // Test passes if no console errors
  });

  test.allowErrors('intentional error test - errors allowed', async ({ page }) => {
    // Use test.allowErrors() for tests that intentionally create errors
    // The fixture will skip error checking for this test
    await page.goto('/');
    
    // This console.error would normally fail the test, but allowErrors() suppresses that
    await page.evaluate(() => {
      console.error('This intentional error is allowed');
    });
  });
});
