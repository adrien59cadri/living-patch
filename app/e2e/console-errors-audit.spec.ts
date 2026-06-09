import { test, expect } from '@playwright/test';

// External image hosts (Wikimedia Commons) may fail with SSL/network errors in
// the sandboxed test environment — those are not application bugs.
const IGNORABLE_PATTERNS = [
  /net::ERR_CERT_AUTHORITY_INVALID/,
  /net::ERR_FAILED/,
  /net::ERR_NAME_NOT_RESOLVED/,
];

function isIgnorable(msg: string) {
  return IGNORABLE_PATTERNS.some(p => p.test(msg));
}

test.describe('No application errors on any page', () => {
  async function assertNoAppErrors(page: Parameters<Parameters<typeof test>[1]>[0]['page'], url: string) {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', e => pageErrors.push(e.message));
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const appErrors = [...pageErrors, ...consoleErrors].filter(m => !isIgnorable(m));
    expect(appErrors, `App errors on ${url}:\n${appErrors.join('\n')}`).toHaveLength(0);
  }

  test('Home (NE PA)', async ({ page }) => assertNoAppErrors(page, '/#/'));
  test('Home filtered — france', async ({ page }) => assertNoAppErrors(page, '/#/?area=france'));
  test('Home filtered — northeast_pa', async ({ page }) => assertNoAppErrors(page, '/#/?area=northeast_pa'));
  test('Settings', async ({ page }) => assertNoAppErrors(page, '/#/settings'));
  test('Life List', async ({ page }) => assertNoAppErrors(page, '/#/life-list'));
  test('Monarch Butterfly detail', async ({ page }) => assertNoAppErrors(page, '/#/species/insect_monarch-butterfly'));
  test('Monarch neighbors — plants', async ({ page }) => assertNoAppErrors(page, '/#/species/insect_monarch-butterfly/neighbors/plants'));
  test('Monarch neighbors — invalid cat', async ({ page }) => assertNoAppErrors(page, '/#/species/insect_monarch-butterfly/neighbors/invalid-cat'));
  test('Pileated Woodpecker detail', async ({ page }) => assertNoAppErrors(page, '/#/species/bird_pileated-woodpecker'));
  test('Pileated neighbors — birds', async ({ page }) => assertNoAppErrors(page, '/#/species/bird_pileated-woodpecker/neighbors/birds'));
  test('Nonexistent species', async ({ page }) => assertNoAppErrors(page, '/#/species/nonexistent-species-xyz'));
});
