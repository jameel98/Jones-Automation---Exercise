CLAUDE.md

Project context for Claude Code. Read this before writing or changing code.

What this project is

A Playwright UI-automation suite built as a home exercise for a Junior
Automation Engineer role at Jones. It automates the contact form at
https://test.netlify.app/ (fill fields, change employee count, screenshot,
submit, assert the thank-you page) and is structured like a real, scalable test
suite rather than a one-off script.

Company context (Jones)

Jones is a US PropTech company building a SaaS platform for insurance risk
and compliance management for office buildings and construction sites. Their
stack (match it when adding code):


Frontend: React, JavaScript
Backend: Java, Node.js
Databases: MySQL, MongoDB
Cloud: AWS, GCP
Automation: Playwright + Mocha
Growing use of AI tooling in dev/automation workflows


When given a choice, prefer approaches that align with this stack (e.g. plain
JavaScript over TypeScript here, Playwright idioms, Mocha-compatible patterns).

Tech stack of THIS project


Language: JavaScript (CommonJS, require/module.exports)
Runner: @playwright/test
Browser: Chromium (configured in playwright.config.js)
Pattern: Page Object Model + a BrowserWrapper infra layer + custom fixtures


Architecture & folder layout

infra/
  browser-wrapper.js     # Browser/context/page lifecycle. adoptPage() reuses
                         # the runner's page; createNewPage() can launch standalone.
logic/
  pages/
    base-page.js         # BasePage: holds `page`, defines navigateTo() contract
    landing-page.js      # LandingPage extends BasePage (locators + actions)
    fixtures/
  test-fixtures.js       # Extends @playwright/test with `wrapper` + `landingPage`
    tests/
  *.spec.js              # Specs. Request fixtures, assert behavior. No raw selectors.
config/
  form-data.json         # Test data, kept out of the specs
  pages-urls.json        # Page URLs (baseURL source)
playwright.config.js     # Infra: baseURL, screenshot/trace/video on failure

Data flow: spec asks for { landingPage } → landingPage fixture asks for
{ wrapper } → wrapper adopts the runner's page → createNewPage(LandingPage)
builds the page object and calls navigateTo().

Conventions — follow these when adding code


Every page object extends BasePage and lives in logic/pages/. File
names are kebab-case (landing-page.js); class names are PascalCase
(LandingPage).
Locators go in the page object constructor, never in specs. Prefer
role/label/placeholder locators (getByRole, getByLabel, getByPlaceholder)
over brittle CSS/XPath.
Actions are methods on the page object (fillContactForm, submit).
Specs read like behavior, not browser commands.
Assertions live in specs, using expect from the fixtures file, not from
@playwright/test directly (so custom fixtures stay consistent).
New page objects get a fixture in fixtures/test-fixtures.js so specs can
request them ready-built.
Test data goes in config/ (e.g. config/form-data.json), never hard-coded in a spec.
Keep the wrapper using adoptPage() under @playwright/test. Only use the
standalone createNewPage() launch path for non-runner scripts (e.g. Mocha).


Commands

bashnpm install
npx playwright install chromium
npm test              # headless
npm run test:headed   # visible browser
npm run test:ui       # interactive UI mode
npm run report        # open HTML report

Known runtime gotchas


selectOption('51-500') matches the option's value. If it fails, the value
may differ from the visible text — use selectOption({ label: '51-500' }).
The thank-you assertion matches /thank you/i. If the success page uses
different wording, update the thankYouMessage locator in landing-page.js.


How to add a new page object (quick recipe)


Create logic/pages/<name>-page.js extending BasePage.
Put locators in the constructor, actions as methods, set navigateTo().
Add a fixture in fixtures/test-fixtures.js.
Add test data to config/ if needed.
Write a spec in tests/<name>.spec.js using the fixture.