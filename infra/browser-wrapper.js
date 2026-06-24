// infra/browser-wrapper.js
// Centralizes the browser/context/page lifecycle so pages and tests
// don't repeat boilerplate.
//
// Two ways to use it:
//  1) Standalone  -> wrapper launches its own browser (Mocha / scripts).
//  2) With @playwright/test -> call adoptPage(page) so it reuses the
//     page the runner already created (keeps fixtures, isolation, traces).

const { chromium } = require('@playwright/test');

class BrowserWrapper {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Adopt a page created elsewhere (e.g. the @playwright/test `page` fixture).
   * Lets the wrapper layer on top of the runner instead of fighting it.
   * @param {import('@playwright/test').Page} page
   */
  adoptPage(page) {
    this.page = page;
    this.context = page.context();
    this.browser = this.context.browser();
  }

  /**
   * Create (or reuse) a page and return an instance of the given Page Object.
   * Mirrors the original createNewPage<T>() generic.
   * @param {new (page: import('@playwright/test').Page) => any} PageClass
   */
  async createNewPage(PageClass) {
    if (!this.browser) {
      this.browser = await chromium.launch();
    }
    if (!this.context) {
      this.context = await this.browser.newContext();
    }
    if (!this.page) {
      this.page = await this.context.newPage();
    }
    const pageInstance = new PageClass(this.page);
    await pageInstance.navigateTo();
    return pageInstance;
  }

  async goTo(url) {
    this._ensurePage();
    await this.page.goto(url);
  }

  async reloadPage() {
    this._ensurePage();
    await this.page.reload();
  }

  getPage() {
    this._ensurePage();
    return this.page;
  }

  setPage(page) {
    this.page = page;
  }

  getContext() {
    if (!this.context) {
      throw new Error('No context. Call createNewPage() or adoptPage() first.');
    }
    return this.context;
  }

  async setToFullScreen() {
    this._ensurePage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async closePage() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
  }

  async closeContext() {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }

  _ensurePage() {
    if (!this.page) {
      throw new Error('No page. Call createNewPage() or adoptPage() first.');
    }
  }
}

module.exports = { BrowserWrapper };