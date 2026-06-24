// logic/pages/landing-page.js
// Page Object for https://test.netlify.app/
// Holds every locator and action for this page in one place.
// Tests interact with the page through these methods, never via raw selectors.

const fs = require('fs');
const path = require('path');
const { BasePage } = require('./base-page');
const { logger } = require('../../infra/logger');

// All manual screenshots land in one folder at the project root.
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');

class LandingPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // --- Locators -----------------------------------------------------
    // Prefer label-based locators over IDs: they track the form the way a
    // user sees it and survive markup/id refactors. (Labels carry a trailing
    // " *" on required fields; getByLabel matches by substring so "Name"
    // still resolves "Name *".)
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.phoneInput = page.getByLabel('Phone');
    this.companyInput = page.getByLabel('Company');
    this.websiteInput = page.getByLabel('Website');
    this.employeesSelect = page.getByLabel('Number of Employees');
    this.submitButton = page.getByRole('button', {
      name: /request a call back/i,
    });
    // Success state after submit: the thank-you page's <h1>. Scoping to the
    // heading avoids matching stray "thank you" text elsewhere on the page.
    this.thankYouMessage = page.getByRole('heading', { name: /thank you/i });

    // Map of field name -> locator, so data-driven tests can address a
    // single field by its string key (used by validation checks).
    this.fields = {
      name: this.nameInput,
      email: this.emailInput,
      phone: this.phoneInput,
      company: this.companyInput,
      website: this.websiteInput,
    };
  }

  // --- Actions --------------------------------------------------------

  // The wrapper calls navigateTo() after building the page object.
  // baseURL is set in playwright.config.js, so '/' resolves to the form.
  async navigateTo() {
    logger.step('Navigating to the landing page');
    await this.page.goto('/');
  }

  /**
   * Fill the whole contact form from a data object.
   * @param {{name,email,phone,company,website,employees}} data
   */
  async fillContactForm(data) {
    logger.step(
      `Filling contact form${data.name ? ` for "${data.name}"` : ''}`
    );
    // Only touch fields that are actually provided, so negative tests can
    // pass a partial object (e.g. leave a required field out entirely).
    if (data.name !== undefined) await this.nameInput.fill(data.name);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.phone !== undefined) await this.phoneInput.fill(data.phone);
    if (data.company !== undefined) await this.companyInput.fill(data.company);
    if (data.website !== undefined) await this.websiteInput.fill(data.website);

    // Use the same `!== undefined` guard as the fields above so a caller can
    // pass employees: '' to exercise the default without it being skipped.
    if (data.employees !== undefined && data.employees !== '') {
      await this.employeesSelect.selectOption(data.employees);
    }
  }

  async selectEmployees(value) {
    logger.step(`Selecting Number of Employees: ${value}`);
    await this.employeesSelect.selectOption(value);
  }

  /**
   * Read the HTML5 constraint-validation state of a single field.
   * @param {string} fieldName one of the keys in `this.fields`
   * @returns {Promise<{valid:boolean, valueMissing:boolean, typeMismatch:boolean, message:string}>}
   */
  async getFieldValidity(fieldName) {
    logger.step(`Checking validation state of "${fieldName}" field`);
    return this.fields[fieldName].evaluate((el) => ({
      valid: el.validity.valid,
      valueMissing: el.validity.valueMissing,
      typeMismatch: el.validity.typeMismatch,
      message: el.validationMessage,
    }));
  }

  async takeScreenshot(fileName) {
    logger.info(`Saving screenshot: ${fileName}`);
    // Create the folder if it doesn't exist yet, otherwise screenshot()
    // throws ENOENT and fails the test.
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    await this.page.screenshot({
      path: path.join(SCREENSHOTS_DIR, fileName),
      fullPage: true,
    });
  }

  async submit() {
    logger.step('Submitting the form');
    await this.submitButton.click();
  }
}

module.exports = { LandingPage };
