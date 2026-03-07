const { test, expect } = require('@playwright/test');

// Bootstrap's md breakpoint is 768px; mobile is anything narrower.
const MOBILE_VIEWPORT  = { width: 375, height: 812 };
const DESKTOP_VIEWPORT = { width: 1024, height: 768 };

test.describe('Athlete page – competition table mobile rendering', () => {
  test('table is wrapped in .table-responsive', async ({ page }) => {
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    // Without this wrapper the table causes horizontal scroll on narrow screens.
    await expect(page.locator('.table-responsive table.table')).toHaveCount(1);
  });

  test('Level and Location columns are hidden on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    // d-none d-md-table-cell sets display:none below the md breakpoint.
    await expect(page.locator('th:has-text("Level")')).toBeHidden();
    await expect(page.locator('th:has-text("Location")')).toBeHidden();
  });

  test('Level and Location columns are visible on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('th:has-text("Level")')).toBeVisible();
    await expect(page.locator('th:has-text("Location")')).toBeVisible();
  });

  test('page has no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });
});
