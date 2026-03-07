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

for (const page of ALL_PAGES) {
  for (const { name: device, viewport } of VIEWPORTS) {
    const slug = page.replace('.html', '');

    test(`screenshot ${slug} – ${device}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport });
      const tab = await context.newPage();
      await tab.goto(`/${page}`, { waitUntil: 'networkidle' });
      await tab.screenshot({
        path: `screenshots/${slug}-${device}.png`,
        fullPage: true,
      });
      await context.close();
    });
  }
}
