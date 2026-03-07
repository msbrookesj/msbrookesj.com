const { test, expect } = require('@playwright/test');

// Bootstrap's md breakpoint is 768px; mobile is anything narrower.
const MOBILE_VIEWPORT  = { width: 375, height: 812 };
const DESKTOP_VIEWPORT = { width: 1024, height: 768 };

// Every page on the site — must be kept in sync with ALL_PAGES in perf-hints.sh.
const ALL_PAGES = [
  { name: 'Home',         path: '/index.html' },
  { name: 'About',        path: '/about.html' },
  { name: 'Professional', path: '/professional.html' },
  { name: 'Academic',     path: '/academic.html' },
  { name: 'Athlete',      path: '/athlete.html' },
  { name: '404',          path: '/404.html' },
  { name: 'License',      path: '/license.html' },
];

// ─── General: no horizontal overflow on any page ───────────────────────────
// A horizontal scrollbar means some element is wider than the viewport, which
// breaks mobile usability and fails Core Web Vitals layout checks.

test.describe('All pages — no horizontal overflow', () => {
  for (const { name, path } of ALL_PAGES) {
    test(`${name} page has no horizontal overflow on mobile (375 px)`, async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflow).toBe(false);
    });

    test(`${name} page has no horizontal overflow on desktop (1024 px)`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflow).toBe(false);
    });
  }
});

// ─── Athlete page: competition table ───────────────────────────────────────

test.describe('Athlete page — competition table mobile rendering', () => {
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
});

// ─── Academic page: course history tables ──────────────────────────────────

test.describe('Academic page — course history tables mobile rendering', () => {
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
});

// ─── License page: dependencies table ──────────────────────────────────────

test.describe('License page — dependencies table mobile rendering', () => {
  test('table is wrapped in .table-responsive', async ({ page }) => {
    await page.goto('/license.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.table-responsive table.table')).toHaveCount(1);
  });
});
