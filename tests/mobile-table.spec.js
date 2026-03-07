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

// ─── Mobile row-expand: detail row behaviour ───────────────────────────────
// Tests for mobile-table-expand.js: tapping a row on mobile shows a detail
// row containing the hidden column data; each field appears on its own line;
// links inside hidden cells are preserved; tapping again collapses the row.

test.describe('Athlete page — mobile row expansion', () => {
  test('tapping a row on mobile inserts a detail row below it', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    // Tap the first data row (2025–26 season) — not on a link/button.
    const firstDataRow = page.locator('table.table tbody tr').first();
    await firstDataRow.click({ position: { x: 10, y: 10 } });
    // A detail row should now follow the first data row.
    await expect(page.locator('tr.table-row-detail')).toHaveCount(1);
  });

  test('detail row shows Level and Location each on their own line', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    const firstDataRow = page.locator('table.table tbody tr').first();
    await firstDataRow.click({ position: { x: 10, y: 10 } });
    const detailTd = page.locator('tr.table-row-detail td');
    // Each field is wrapped in its own <div>, so there should be 2 divs
    // (one for Level, one for Location).
    await expect(detailTd.locator('div')).toHaveCount(2);
    // Both labels should be present.
    await expect(detailTd).toContainText('Level:');
    await expect(detailTd).toContainText('Location:');
  });

  test('tapping an expanded row collapses the detail row', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    const firstDataRow = page.locator('table.table tbody tr').first();
    await firstDataRow.click({ position: { x: 10, y: 10 } });
    await expect(page.locator('tr.table-row-detail')).toHaveCount(1);
    // Tap again to collapse.
    await firstDataRow.click({ position: { x: 10, y: 10 } });
    await expect(page.locator('tr.table-row-detail')).toHaveCount(0);
  });

  test('detail row is absent on desktop (columns all visible)', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    // On desktop all columns are visible so tapping a row should not produce a detail row.
    const firstDataRow = page.locator('table.table tbody tr').first();
    await firstDataRow.click({ position: { x: 10, y: 10 } });
    await expect(page.locator('tr.table-row-detail')).toHaveCount(0);
  });

  test('View Photos link is preserved as a working link when its cell is in the detail row', async ({ page }) => {
    // This test verifies the innerHTML fix: if a cell containing a link ends up
    // in the detail row the link is present and clickable (not stripped to plain text).
    // We achieve this by temporarily hiding the Photos column via JS and re-triggering.
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    // Hide the Photos column header so mobile-table-expand includes it in the detail row.
    await page.evaluate(() => {
      const th = document.querySelector('table.table thead tr th:last-child');
      th.style.display = 'none';
    });
    // Tap the 2023–24 row (last row, which has the "View Photos" link).
    const lastDataRow = page.locator('table.table tbody tr').last();
    await lastDataRow.click({ position: { x: 10, y: 10 } });
    const detailTd = page.locator('tr.table-row-detail td');
    // The detail row must contain an <a> element (not plain text) for "View Photos".
    await expect(detailTd.locator('a:has-text("View Photos")')).toHaveCount(1);
  });

  test('View Photos collapse link still works on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    // The gallery is initially hidden.
    await expect(page.locator('#gallery2024')).toBeHidden();
    // Click the "View Photos" link directly.
    await page.locator('a[href="#gallery2024"]').click();
    // Bootstrap collapse should make the gallery visible.
    await expect(page.locator('#gallery2024')).toBeVisible();
  });
});

test.describe('Academic page — mobile row expansion', () => {
  test('tapping a visible course row on mobile inserts a detail row', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/academic.html', { waitUntil: 'domcontentloaded' });
    // Expand the first course history section so its rows are in the DOM.
    await page.locator('[aria-controls="ucsdClasses"]').click();
    await page.locator('#ucsdClasses').waitFor({ state: 'visible' });
    const firstDataRow = page.locator('#ucsdClasses tbody tr').first();
    await firstDataRow.click({ position: { x: 10, y: 10 } });
    await expect(page.locator('tr.table-row-detail')).toHaveCount(1);
  });

  test('detail row shows Instructor on its own line', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/academic.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[aria-controls="ucsdClasses"]').click();
    await page.locator('#ucsdClasses').waitFor({ state: 'visible' });
    const firstDataRow = page.locator('#ucsdClasses tbody tr').first();
    await firstDataRow.click({ position: { x: 10, y: 10 } });
    const detailTd = page.locator('tr.table-row-detail td');
    // Only the Instructor column is hidden → exactly one <div> line.
    await expect(detailTd.locator('div')).toHaveCount(1);
    await expect(detailTd).toContainText('Instructor:');
  });
});
