// test/landing-page.spec.js
// The contact-form suite, written as separate, clearly-named tests grouped
// by scenario. `test`/`expect` come from the fixtures file, and the navigated
// `landingPage` page object is injected by the `landingPage` fixture.
//
// Isolation: every test receives its own freshly navigated `landingPage` (the
// fixture builds on @playwright/test's per-test `page`), so no test shares
// state with another and order never matters.
//
// Structure: each test follows Arrange - Act - Assert, with a single Act so the
// behaviour under test is unambiguous.

const { test, expect } = require('../fixtures/test-fixtures');
const {
  validContact,
  employeeOptions,
  invalidData,
} = require('../config/form-data.json');
const { thankYouVisible } = require('../config/timeouts.json');
const { logger } = require('../infra/logger');

// `getFieldValidity` reads the field's constraint-validation state with a
// one-shot evaluate(), which does not auto-retry. Poll it through expect.poll
// until the given property is true, so these checks aren't racy against the
// browser applying validation after submit, then return the settled object.
async function readValidityWhen(landingPage, field, property) {
  await expect
    .poll(async () => (await landingPage.getFieldValidity(field))[property])
    .toBe(true);
  return landingPage.getFieldValidity(field);
}

// A blocked or invalid submit must NOT reach the thank-you page. Assert both
// that the success heading stays absent AND that the form never navigated away
// to thank-you.html — toBeHidden() alone passes vacuously on a page where the
// heading never existed, so the URL check is what proves submission was blocked.
async function expectNotSubmitted(landingPage) {
  await expect(landingPage.thankYouMessage).toBeHidden();
  await expect(landingPage.page).not.toHaveURL(/thank-you/);
}

test.describe('Acme landing page - Request a call back', () => {
  // ================================================================
  // 1) Happy path - valid data + changing Number of Employees
  // ================================================================
  test.describe('Valid submission', () => {
    test('fills valid data, changes Number of Employees, and reaches the thank-you page', async ({
      landingPage,
    }) => {
      // Arrange: the select defaults to 1-10 before we touch the form.
      await expect(landingPage.employeesSelect).toHaveValue('1-10');

      // Act:
      // 1) Fill valid data (employees left at its default for this step).
      await landingPage.fillContactForm({ ...validContact, employees: '' });
      // 2) Take a screenshot of the filled form (visual regression / debugging).
      await landingPage.takeScreenshot('valid-submit.png');
      // 3) Change Number of Employees to 51-500.
      await landingPage.selectEmployees(validContact.employees);
      // 4) Click submit.
      await landingPage.submit();

      // Assert: the thank-you page is shown.
      await expect(landingPage.thankYouMessage).toBeVisible({
        timeout: thankYouVisible,
      });
      // 5) Log to the console once we've reached the thank-you page.
      logger.info('Reached the thank-you page');
    });

    test('reaches the thank-you page when the optional fields (company, website) are empty', async ({
      landingPage,
    }) => {
      // Arrange: fill the required fields, leaving the optional ones empty.
      await landingPage.fillContactForm({
        ...validContact,
        company: '',
        website: '',
      });

      // Act: submit the form.
      await landingPage.submit();

      // Assert: the thank-you page is shown.
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
      // Arrange: the form starts empty (fresh page from the fixture).

      // Act: submit without filling anything.
      await landingPage.submit();

      // Assert: the browser blocks on the first invalid (required) field, Name,
      // and submission does not go through.
      const name = await readValidityWhen(landingPage, 'name', 'valueMissing');
      expect(name.message).not.toBe('');
      await expectNotSubmitted(landingPage);
    });

    test('flags Name when only Name is left empty', async ({ landingPage }) => {
      // Arrange: valid data everywhere except an empty Name.
      await landingPage.fillContactForm({ ...validContact, name: '' });

      // Act: submit the form.
      await landingPage.submit();

      // Assert: Name is flagged required and submission is blocked.
      await readValidityWhen(landingPage, 'name', 'valueMissing');
      await expectNotSubmitted(landingPage);
    });

    test('flags Email when only Email is left empty', async ({ landingPage }) => {
      // Arrange: valid data everywhere except an empty Email.
      await landingPage.fillContactForm({ ...validContact, email: '' });

      // Act: submit the form.
      await landingPage.submit();

      // Assert: Email is flagged required and submission is blocked.
      await readValidityWhen(landingPage, 'email', 'valueMissing');
      await expectNotSubmitted(landingPage);
    });

    test('flags Phone when only Phone is left empty', async ({ landingPage }) => {
      // Arrange: valid data everywhere except an empty Phone.
      await landingPage.fillContactForm({ ...validContact, phone: '' });

      // Act: submit the form.
      await landingPage.submit();

      // Assert: Phone is flagged required and submission is blocked.
      await readValidityWhen(landingPage, 'phone', 'valueMissing');
      await expectNotSubmitted(landingPage);
    });
  });

  // ================================================================
  // 3) Invalid data - format validation
  // ================================================================
  test.describe('Invalid data', () => {
    test('rejects an invalid email format', async ({ landingPage }) => {
      // Arrange: typeMismatch only fires for type="email"; guard the assumption,
      // then enter a malformed email.
      await expect(landingPage.emailInput).toHaveAttribute('type', 'email');
      await landingPage.fillContactForm({
        ...validContact,
        email: invalidData.email,
      });

      // Act: submit the form.
      await landingPage.submit();

      // Assert: Email is flagged as a format mismatch and submission is blocked.
      const email = await readValidityWhen(landingPage, 'email', 'typeMismatch');
      expect(email.message).not.toBe('');
      await expectNotSubmitted(landingPage);
    });

    test('rejects an invalid website URL', async ({ landingPage }) => {
      // Arrange: typeMismatch only fires for type="url"; guard the assumption,
      // then enter a malformed URL.
      await expect(landingPage.websiteInput).toHaveAttribute('type', 'url');
      await landingPage.fillContactForm({
        ...validContact,
        website: invalidData.website,
      });

      // Act: submit the form.
      await landingPage.submit();

      // Assert: Website is flagged as a format mismatch and submission is blocked.
      const website = await readValidityWhen(
        landingPage,
        'website',
        'typeMismatch'
      );
      expect(website.message).not.toBe('');
      await expectNotSubmitted(landingPage);
    });
  });

  // ================================================================
  // 4) Number of Employees dropdown - option coverage
  // ================================================================
  test.describe('Number of Employees options', () => {
    // One test per option so a single failing option doesn't mask the rest
    // and each is reported independently.
    for (const option of employeeOptions) {
      test(`allows selecting "${option}"`, async ({ landingPage }) => {
        // Arrange: handled by the fixture (fresh, navigated page).

        // Act: select the option.
        await landingPage.selectEmployees(option);

        // Assert: the select holds the chosen value.
        await expect(landingPage.employeesSelect).toHaveValue(option);
      });
    }
  });
});
