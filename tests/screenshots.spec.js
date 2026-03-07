const { test, devices } = require('@playwright/test');

const ALL_PAGES = [
  'index.html',
  'about.html',
  'professional.html',
  'academic.html',
  'athlete.html',
  '404.html',
  'license.html',
];

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 720 } },
  { name: 'mobile', viewport: devices['iPhone 12'].viewport },
];

// Pages with Bootstrap collapse sections that should also be captured expanded.
const PAGES_WITH_DISCLOSURES = [
  'academic.html',
  'athlete.html',
];

// Convert fixed-position elements (e.g. the navbar) to absolute so they
// anchor to the document top instead of the viewport during fullPage capture.
async function pinFixedElements(tab) {
  await tab.evaluate(() => {
    for (const el of document.querySelectorAll('.fixed-top, .fixed-bottom')) {
      el.style.position = 'absolute';
    }
  });
}

for (const page of ALL_PAGES) {
  for (const { name: device, viewport } of VIEWPORTS) {
    const slug = page.replace('.html', '');

    test(`screenshot ${slug} – ${device}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport });
      const tab = await context.newPage();
      await tab.goto(`/${page}`, { waitUntil: 'networkidle' });
      await pinFixedElements(tab);
      await tab.screenshot({
        path: `screenshots/${slug}-${device}.png`,
        fullPage: true,
      });
      await context.close();
    });
  }
}

// Expanded-state screenshots: open all collapse sections then capture.
for (const page of PAGES_WITH_DISCLOSURES) {
  for (const { name: device, viewport } of VIEWPORTS) {
    const slug = page.replace('.html', '');

    test(`screenshot ${slug} expanded – ${device}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport });
      const tab = await context.newPage();
      await tab.goto(`/${page}`, { waitUntil: 'networkidle' });

      // Click every visible collapse trigger (skip the navbar toggler and
      // any triggers hidden at this viewport, e.g. desktop-only buttons).
      const triggers = tab.locator(
        '[data-bs-toggle="collapse"]:not(.navbar-toggler)'
      );
      const count = await triggers.count();
      for (let i = 0; i < count; i++) {
        if (await triggers.nth(i).isVisible()) {
          await triggers.nth(i).click();
        }
      }

      // Wait for all collapse animations to finish.
      await tab.waitForTimeout(500);

      await pinFixedElements(tab);
      await tab.screenshot({
        path: `screenshots/${slug}-expanded-${device}.png`,
        fullPage: true,
      });
      await context.close();
    });
  }
}
