// logic/pages/landing-page.js
// Page Object for https://test.netlify.app/
// Holds every locator and action for this page in one place.
// Tests interact with the page through these methods, never via raw selectors.

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
    this.nameInput = page.locator('#name');
    this.emailInput = page.locator('#email');
    this.phoneInput = page.locator('#phone');
    this.companyInput = page.locator('#company');
    this.websiteInput = page.locator('#website');
    this.employeesSelect = page.locator('#employees');
    this.submitButton = page.getByRole('button', {
      name: /request a call back/i,
    });
    // Success state after submit.
    this.thankYouMessage = page.getByText(/thank you/i);

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

    if (data.employees) {
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
