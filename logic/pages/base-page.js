// logic/pages/base-page.js
// Parent class for every page object.
// Holds the shared `page` reference and the contract that each page
// must define where it lives (used by BrowserWrapper.createNewPage).

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Each concrete page overrides this with its own URL/path.
   * Kept as a no-op default so pages that don't navigate still work.
   */
  async navigateTo() {
    // override in subclass, e.g. await this.page.goto('/');
  }
}

module.exports = { BasePage };
