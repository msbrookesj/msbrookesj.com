const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

const pages = [
  { name: 'Home',         path: '/index.html' },
  { name: 'About',        path: '/about.html' },
  { name: 'Professional', path: '/professional.html' },
  { name: 'Academic',     path: '/academic.html' },
  { name: 'Athlete',      path: '/athlete.html' },
  { name: 'Office',       path: '/office.html' },
];

for (const { name, path } of pages) {
  test(`${name} page has no WCAG 2.1 AA violations`, async ({ page }) => {
    // domcontentloaded avoids waiting on third-party iframes (e.g. YouTube on office.html)
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
