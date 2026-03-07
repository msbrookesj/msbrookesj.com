const { test, expect } = require('@playwright/test');

// Bootstrap's md breakpoint is 768px; mobile is anything narrower.
const MOBILE_VIEWPORT  = { width: 375, height: 812 };
const DESKTOP_VIEWPORT = { width: 1024, height: 768 };

// Helper: check the page has no horizontal scrollbar.
async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflow).toBe(false);
}

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
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('Academic page – course history tables mobile rendering', () => {
  test('all four tables are wrapped in .table-responsive', async ({ page }) => {
    await page.goto('/academic.html', { waitUntil: 'domcontentloaded' });
    // UCSD, Grossmont, TLCA-Grossmont, TLCA-Glendale.
    await expect(page.locator('.table-responsive table.table')).toHaveCount(4);
  });

  test('Instructor column is hidden on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/academic.html', { waitUntil: 'domcontentloaded' });
    // The column is hidden via CSS nth-child(4) in theme.css.
    // getComputedStyle reads the element's own cascaded display value
    // regardless of whether the parent collapse div is open or closed.
    const display = await page.evaluate(
      () => window.getComputedStyle(document.querySelector('#ucsdClasses th:nth-child(4)')).display
    );
    expect(display).toBe('none');
  });

  test('Instructor column is visible on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/academic.html', { waitUntil: 'domcontentloaded' });
    const display = await page.evaluate(
      () => window.getComputedStyle(document.querySelector('#ucsdClasses th:nth-child(4)')).display
    );
    expect(display).not.toBe('none');
  });

  test('page has no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/academic.html', { waitUntil: 'domcontentloaded' });
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('License page – dependencies table mobile rendering', () => {
  test('table is wrapped in .table-responsive', async ({ page }) => {
    await page.goto('/license.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.table-responsive table.table')).toHaveCount(1);
  });

  test('page has no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/license.html', { waitUntil: 'domcontentloaded' });
    await expectNoHorizontalOverflow(page);
  });
});
