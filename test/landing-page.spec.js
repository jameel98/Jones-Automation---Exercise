// test/landing-page.spec.js
// The contact-form suite, written as separate, clearly-named tests grouped
// by scenario. `test`/`expect` come from the fixtures file, and the navigated
// `landingPage` page object is injected by the `landingPage` fixture.

const { test, expect } = require('../fixtures/test-fixtures');
const {
  validContact,
  employeeOptions,
  invalidData,
} = require('../config/form-data.json');
const { thankYouVisible } = require('../config/timeouts.json');

test.describe('Acme landing page - Request a call back', () => {
  // ================================================================
  // 1) Happy path - valid data + changing Number of Employees
  // ================================================================
  test.describe('Valid submission', () => {
    test('fills valid data, changes Number of Employees, and reaches the thank-you page', async ({
      landingPage,
    }) => {
      // The select defaults to 1-10 before we touch the form.
      await expect(landingPage.employeesSelect).toHaveValue('1-10');

      // Fill everything, including changing employees to 51-500.
      await landingPage.fillContactForm(validContact);

      // The values landed, including the changed employees value.
      await expect(landingPage.nameInput).toHaveValue(validContact.name);
      await expect(landingPage.emailInput).toHaveValue(validContact.email);
      await expect(landingPage.employeesSelect).toHaveValue(
        validContact.employees
      );

      await landingPage.takeScreenshot('valid-submit.png');

      await landingPage.submit();
      await expect(landingPage.thankYouMessage).toBeVisible({
        timeout: thankYouVisible,
      });
    });

    test('submits successfully when the optional fields (company, website) are left empty', async ({
      landingPage,
    }) => {
      await landingPage.fillContactForm({
        ...validContact,
        company: '',
        website: '',
      });

      await landingPage.submit();
      await expect(landingPage.thankYouMessage).toBeVisible({
        timeout: thankYouVisible,
      });
    });
  });

  // ================================================================
  // 2) Empty fields - required-field validation
  // ================================================================
  test.describe('Empty / required fields', () => {
    test('blocks submission and flags the Name field when the whole form is empty', async ({
      landingPage,
    }) => {
      // Submit without filling anything - the browser blocks on the first
      // invalid (required) field, which is Name.
      await landingPage.submit();

      const name = await landingPage.getFieldValidity('name');
      expect(name.valueMissing).toBe(true);
      expect(name.message).not.toBe('');

      await expect(landingPage.thankYouMessage).toBeHidden();
    });

    test('flags Name when only Name is left empty', async ({ landingPage }) => {
      await landingPage.fillContactForm({ ...validContact, name: '' });
      await landingPage.submit();

      const name = await landingPage.getFieldValidity('name');
      expect(name.valueMissing).toBe(true);
      await expect(landingPage.thankYouMessage).toBeHidden();
    });

    test('flags Email when only Email is left empty', async ({ landingPage }) => {
      await landingPage.fillContactForm({ ...validContact, email: '' });
      await landingPage.submit();

      const email = await landingPage.getFieldValidity('email');
      expect(email.valueMissing).toBe(true);
      await expect(landingPage.thankYouMessage).toBeHidden();
    });

    test('flags Phone when only Phone is left empty', async ({ landingPage }) => {
      await landingPage.fillContactForm({ ...validContact, phone: '' });
      await landingPage.submit();

      const phone = await landingPage.getFieldValidity('phone');
      expect(phone.valueMissing).toBe(true);
      await expect(landingPage.thankYouMessage).toBeHidden();
    });
  });

  // ================================================================
  // 3) Invalid data - format validation
  // ================================================================
  test.describe('Invalid data', () => {
    test('rejects an invalid email format', async ({ landingPage }) => {
      await landingPage.fillContactForm({
        ...validContact,
        email: invalidData.email,
      });
      await landingPage.submit();

      const email = await landingPage.getFieldValidity('email');
      expect(email.typeMismatch).toBe(true);
      expect(email.message).not.toBe('');

      await expect(landingPage.thankYouMessage).toBeHidden();
    });

    test('rejects an invalid website URL', async ({ landingPage }) => {
      await landingPage.fillContactForm({
        ...validContact,
        website: invalidData.website,
      });
      await landingPage.submit();

      const website = await landingPage.getFieldValidity('website');
      expect(website.typeMismatch).toBe(true);
      expect(website.message).not.toBe('');

      await expect(landingPage.thankYouMessage).toBeHidden();
    });
  });

  // ================================================================
  // 4) Number of Employees dropdown - option coverage
  // ================================================================
  test.describe('Number of Employees options', () => {
    test('allows selecting every option in the dropdown', async ({
      landingPage,
    }) => {
      for (const option of employeeOptions) {
        await landingPage.selectEmployees(option);
        await expect(landingPage.employeesSelect).toHaveValue(option);
      }
    });
  });
});
