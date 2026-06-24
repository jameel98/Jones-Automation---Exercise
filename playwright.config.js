const { defineConfig } = require('@playwright/test');
const { urls } = require('./config/pages-urls.json');

module.exports = defineConfig({
  testDir: './test',
  reporter: 'html',
  use: {
    // Default browser is Chromium.
    browserName: 'chromium',
    // Page objects navigate with '/', resolved against this baseURL.
    baseURL: urls.landing_page,
    // Capture artifacts only when something goes wrong.
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    // Maximize the real browser window to fill the screen (headed runs).
    // viewport:null lets the page use the full maximized window instead of
    // a fixed size; --start-maximized opens the window maximized.
    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
    },
  },
});
