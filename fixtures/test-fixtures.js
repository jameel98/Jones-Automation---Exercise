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
    // Remember the browser the runner owns, so we never close it below.
    const runnerBrowser = wrapper.browser;
    await use(wrapper);
    // The runner owns the adopted page/browser, so normally we close nothing.
    // But if something caused the wrapper to launch its own browser, close
    // that one to avoid leaking a process.
    if (wrapper.browser && wrapper.browser !== runnerBrowser) {
      await wrapper.close();
    }
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