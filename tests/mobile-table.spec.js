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

  test('Instructor, Academic Period, and Course Description columns are hidden on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/academic.html', { waitUntil: 'domcontentloaded' });
    // All three columns are hidden via CSS nth-child(4), nth-child(5), nth-child(6) in theme.css.
    // getComputedStyle reads the element's own cascaded display value
    // regardless of whether the parent collapse div is open or closed.
    const [instructorDisplay, periodDisplay, catalogDisplay] = await page.evaluate(() => [
      window.getComputedStyle(document.querySelector('#ucsdClasses th:nth-child(4)')).display,
      window.getComputedStyle(document.querySelector('#ucsdClasses th:nth-child(5)')).display,
      window.getComputedStyle(document.querySelector('#ucsdClasses th:nth-child(6)')).display,
    ]);
    expect(instructorDisplay).toBe('none');
    expect(periodDisplay).toBe('none');
    expect(catalogDisplay).toBe('none');
  });

  test('Instructor, Academic Period, and Course Description columns are visible on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/academic.html', { waitUntil: 'domcontentloaded' });
    const [instructorDisplay, periodDisplay, catalogDisplay] = await page.evaluate(() => [
      window.getComputedStyle(document.querySelector('#ucsdClasses th:nth-child(4)')).display,
      window.getComputedStyle(document.querySelector('#ucsdClasses th:nth-child(5)')).display,
      window.getComputedStyle(document.querySelector('#ucsdClasses th:nth-child(6)')).display,
    ]);
    expect(instructorDisplay).not.toBe('none');
    expect(periodDisplay).not.toBe('none');
    expect(catalogDisplay).not.toBe('none');
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

  test('tapping the 2023–24 row on mobile auto-expands the photo gallery', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    // Gallery starts collapsed on mobile.
    await expect(page.locator('#gallery2024')).toBeHidden();
    // Tap the 2023–24 row — not on a link.
    const row2024 = page.locator('table.table tbody tr[data-bs-gallery="gallery2024"]');
    await row2024.click({ position: { x: 10, y: 10 } });
    // Gallery should now be visible.
    await expect(page.locator('#gallery2024')).toBeVisible();
  });

  test('tapping the expanded 2023–24 row on mobile collapses the gallery again', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    // Use the stable attribute selector — avoids re-resolving to the inserted detail row.
    const row2024 = page.locator('table.table tbody tr[data-bs-gallery="gallery2024"]');
    await row2024.click({ position: { x: 10, y: 10 } });
    // Wait for Bootstrap's show animation to fully complete before tapping again.
    // Bootstrap's Collapse.hide() is a no-op while _isTransitioning is true, so
    // clicking a second time mid-animation would silently do nothing. The animation
    // is done once the element has class="collapse show" with no "collapsing" class.
    await page.waitForFunction(() => {
      const el = document.getElementById('gallery2024');
      return el && el.classList.contains('show') && !el.classList.contains('collapsing');
    });
    // Tap again to collapse.
    await row2024.click({ position: { x: 10, y: 10 } });
    await expect(page.locator('#gallery2024')).toBeHidden();
  });

  test('View Photos button toggles gallery on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/athlete.html', { waitUntil: 'domcontentloaded' });
    // Gallery starts hidden on desktop; the "View Photos" button discloses it.
    await expect(page.locator('#gallery2024')).toBeHidden();
    const viewPhotosBtn = page.locator('button', { hasText: 'View Photos' });
    await viewPhotosBtn.click();
    await expect(page.locator('#gallery2024')).toBeVisible();
    // Row gets aria-expanded when gallery is open.
    const row2024 = page.locator('tr[data-bs-gallery="gallery2024"]');
    await expect(row2024).toHaveAttribute('aria-expanded', 'true');
    // Clicking again hides the gallery.
    await viewPhotosBtn.click();
    await expect(page.locator('#gallery2024')).toBeHidden();
    await expect(row2024).not.toHaveAttribute('aria-expanded');
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

  test('detail row shows Instructor, Academic Period, and Course Description each on their own line', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/academic.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[aria-controls="ucsdClasses"]').click();
    await page.locator('#ucsdClasses').waitFor({ state: 'visible' });
    const firstDataRow = page.locator('#ucsdClasses tbody tr').first();
    await firstDataRow.click({ position: { x: 10, y: 10 } });
    const detailTd = page.locator('tr.table-row-detail td');
    // Instructor, Academic Period, and Course Description (catalog link) are all hidden →
    // three <div> lines (the first row, PHIL 164, has a catalog link so all three show).
    await expect(detailTd.locator('div')).toHaveCount(3);
    await expect(detailTd).toContainText('Instructor:');
    await expect(detailTd).toContainText('Academic Period:');
    await expect(detailTd).toContainText('Course Description:');
  });
});
