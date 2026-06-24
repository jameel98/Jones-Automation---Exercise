// fixtures/test-fixtures.js
// Extends the base @playwright/test with our own fixtures so specs can
// request a ready-to-use `wrapper` or `landingPage` directly.
//
// The wrapper ADOPTS the runner's `page` (it doesn't launch its own browser),
// so we keep test isolation, parallelism, traces and screenshots for free.

const base = require('@playwright/test');
const { BrowserWrapper } = require('../infra/browser-wrapper');
const { LandingPage } = require('../logic/pages/landing-page');

const test = base.test.extend({
  // A BrowserWrapper bound to the test's own page.
  wrapper: async ({ page }, use) => {
    const wrapper = new BrowserWrapper();
    wrapper.adoptPage(page);
    await use(wrapper);
    // No close() here — the runner owns the page lifecycle.
  },

  // A LandingPage already navigated, built via the wrapper.
  // The window is maximized via launch args in playwright.config.js.
  landingPage: async ({ wrapper }, use) => {
    const landingPage = await wrapper.createNewPage(LandingPage);
    await use(landingPage);
  },
});

const expect = base.expect;

module.exports = { test, expect };