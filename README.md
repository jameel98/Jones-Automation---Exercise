# Jones – Contact Form Automation Suite

A Playwright UI-automation suite that tests the contact form at
[https://test.netlify.app/](https://test.netlify.app/). It fills the form,
changes the *Number of Employees* dropdown, takes a screenshot, submits, and
asserts the thank-you page — plus negative tests for required-field and
format validation.

The suite is built as a scalable, real-world test project using the **Page
Object Model**, a **BrowserWrapper** infra layer, and **custom fixtures**.

## Requirements

- [Node.js](https://nodejs.org/) 18+ (includes npm)

## Setup

```bash
npm install                      # install dependencies (@playwright/test)
npx playwright install chromium  # download the Chromium browser
```

## Running the tests

```bash
npm test              # run all tests, headless
npm run test:headed   # run with a visible browser window
npm run test:ui       # open Playwright's interactive UI mode
npm run report        # open the HTML report from the last run
```

To run a single test file or filter by title:

```bash
npx playwright test test/landing-page.spec.js
npx playwright test -g "valid data"
```

## What the tests cover

- **Valid submission** – fills valid data, changes *Number of Employees* to
  `51-500`, screenshots, submits, and reaches the thank-you page (also covers
  leaving optional fields empty).
- **Required fields** – submitting empty / partially-empty forms is blocked
  and the right field is flagged.
- **Invalid data** – bad email and website formats are rejected.
- **Employee dropdown** – every option (`1-10`, `11-50`, `51-500`, `500+`)
  can be selected.

## Project structure

```
config/
  form-data.json       # test data (valid contact, options, invalid data)
  pages-urls.json      # page URLs (source of baseURL)
  timeouts.json        # shared timeout values
fixtures/
  test-fixtures.js     # extends @playwright/test with `wrapper` + `landingPage`
infra/
  browser-wrapper.js   # browser/context/page lifecycle (adoptPage / createNewPage)
  logger.js            # simple step/info logging
logic/pages/
  base-page.js         # BasePage: holds `page`, defines navigateTo() contract
  landing-page.js      # LandingPage: locators + actions for the contact form
test/
  landing-page.spec.js # the spec — reads like behavior, no raw selectors
playwright.config.js   # baseURL, Chromium, screenshot/trace/video on failure
```

**Data flow:** a spec requests the `landingPage` fixture → which requests
`wrapper` → the wrapper adopts the runner's page → builds the `LandingPage`
object and navigates to it.

## Artifacts

- Screenshots, traces, and videos are captured **only on failure** (see
  `playwright.config.js`).
- Manual screenshots taken by the suite are saved to `screenshots/`.
- After a run, `npm run report` opens the full HTML report.

## Configuration

Test data and URLs live in `config/` — never hard-coded in specs. To point the
suite at a different form, update `config/pages-urls.json`; to change the data
used, edit `config/form-data.json`.

## Notes / gotchas

- `selectOption` matches the option's **value**. If a selection fails, the
  value may differ from the visible text — use `selectOption({ label: '51-500' })`.
- The thank-you assertion matches `/thank you/i`. If the success page wording
  changes, update the `thankYouMessage` locator in
  `logic/pages/landing-page.js`.
