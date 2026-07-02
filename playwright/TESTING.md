# Cooley People Search — Testing Guide

This guide describes how to run and maintain **automated tests** for the *Cooley People Search* Playwright demo suite.

It focuses **only on testing**. This is a standalone Playwright automation project targeting the live [cooley.com/people](https://www.cooley.com/people) Coveo-powered search page, built to demonstrate test framework design and locator strategy.

---

## Table of Contents

1. [Testing Stack Overview](#testing-stack-overview)
2. [Prerequisites](#prerequisites)
3. [Playwright: E2E Tests](#playwright-e2e-tests)
4. [Running Tests](#running-tests)
5. [Tag-Based Test Execution](#tag-based-test-execution)
6. [Fixtures, Page Objects & Conventions](#fixtures-page-objects--conventions)
7. [CI Flow](#ci-flow)
8. [Common Issues](#common-issues)
9. [References](#references)

---

## Testing Stack Overview

| Layer         | Tool               | Purpose                                  |
| ------------- | ------------------ | ----------------------------------------- |
| E2E           | **Playwright**     | Facet filtering, search, result validation |
| Reporting     | **Custom + HTML + Allure** | Local and CI-friendly test reports |
| Type Safety   | **TypeScript**     | Page objects, fixtures, test specs        |

This suite tests a live external site rather than a local application, so there is no dev server to start and no backend/API layer to mock.

---

## Prerequisites

* **Node.js 20+**
* **npm**
* Project dependencies installed: `npm install`
* No environment variables required beyond optional overrides in `.env` (see [Common Issues](#common-issues))

---

## Playwright: E2E Tests

**Purpose**

Playwright tests validate the live Coveo-powered people-search experience:

* Facet filtering (Practices, Industries, Office)
* Result count and pagination behavior
* Required-field validation on result cards
* Profile link navigation

### Directory Structure

```
playwright/
 ├─ playwright.config.ts
 ├─ fixture.ts              # Shared fixtures (peopleSearchPage, env, baseUrl)
 ├─ pages/
 │   └─ PeopleSearchPage.ts # Page Object Model for /people
 ├─ tests/
 │   └─ people-search.spec.ts
 └─ reporters/
     └─ table-summary-reporter.js

results/
 ├─ test-results/           # Screenshots / traces on failure
 ├─ html/                   # HTML report
 └─ allure-results/         # Allure artifacts
```

---

## Running Tests

```bash
npx playwright test                                   # all tests
npx playwright test people-search.spec.ts              # single file
npx playwright test -g "practice area" --reporter=list # filter by title, bypass custom reporter
npx playwright test --headed                           # watch it run
npx playwright test --debug                             # step through with Inspector
```

Prefer short, single-line `-g` patterns over full test-title regexes — long multi-word titles are prone to line-wrap corruption when copy-pasted into a terminal.

### Viewing the report

The HTML reporter writes to `./results/html`, not Playwright's default location, so `show-report` needs the path explicitly:

```bash
npx playwright show-report ./results/html
```

---

## Tag-Based Test Execution

Tests are grouped using tags on `test.describe`:

```ts
test.describe('Cooley people search', { tag: ['@smoke', '@people'] }, () => {
  // ...
});
```

| Tag        | Meaning                     |
| ---------- | ---------------------------- |
| `@smoke`   | Critical path checks          |
| `@people`  | People-search feature scope   |

Run by tag:

```bash
npx playwright test --grep @smoke
```

---

## Fixtures, Page Objects & Conventions

### Fixtures

Centralized in `playwright/fixture.ts`, extending `@playwright/test`'s `base`:

```ts
export const test = base.extend<CooleyPageObjects>({
  peopleSearchPage: async ({ page }, use) => await use(new PeopleSearchPage(page)),
});
```

### Locator strategy

This site is Coveo-powered (facets, result cards, and search are all rendered by the Coveo JS framework, not custom markup), so locators are written against Coveo's real DOM rather than assumed `data-testid` attributes:

| Element        | Locator                                                    |
| -------------- | ------------------------------------------------------------ |
| Result cards   | `.CoveoResult`                                                |
| Result name    | `.teaser-title`                                               |
| Title / office | `.teaser-position` (or scope by `data-field`, e.g. `[data-field="@jobz32xtitle"]`) |
| Profile link   | `a.CoveoResultLink[href*="/people/"]`                          |
| Facet checkbox | role `checkbox`, accessible name `"{Value} {N} results"`       |

Practice area values (`@practices` facet, e.g. "Emerging Companies") and industry values (`@industries` facet, e.g. "Artificial Intelligence") are **separate facets** — don't assume a term belongs to Practices without checking the live page first.

### Conventions

* Always import `test` from the shared fixture, not `@playwright/test` directly, in spec files
* Keep tests declarative — filtering/assertion logic lives in the page object, not the spec
* Assert on outcomes (`toBeChecked`, `toBeHidden`, result counts), not just that an action resolved without throwing
* Cookie/consent banner dismissal (`closeBannerIfVisible`) runs before every test via `beforeEach`

---

## CI Flow

```text
Code Change
   ↓
Playwright (E2E)
   ↓
HTML / Allure Reports
```

This is a standalone demo repo with no CI pipeline currently wired up. If added, GitHub Actions is the natural fit given the repo is hosted on GitHub.

---

## Common Issues

### ❌ Facet filter doesn't narrow results

Cause: the value passed doesn't exist under that facet (e.g. passing an Industry value to a Practices filter method), or the filter method opens the facet dropdown but never clicks a checkbox to select a value.
Fix: verify the value against the live facet list, and confirm the method actually clicks the checkbox and awaits `toBeChecked()` rather than just opening/closing the dropdown.

### ❌ `getResultCount()` always returns 0

Cause: `resultCards` locator doesn't match real markup (e.g. a `data-testid` attribute that doesn't exist on the live site).
Fix: use `.CoveoResult` as confirmed against the live DOM.

### ❌ Click doesn't seem to do anything (banner stays open, filter doesn't apply)

Cause: element intercepted by an overlay, or the widget listens for a different event than `click`.
Fix: try `{ force: true }` as a diagnostic; if that resolves it, the click was being intercepted by a stacked element — add a short `waitFor({ state: 'visible' })` before interacting to rule out a timing/animation race.

### ❌ `test.describe()` "not expected to be called here"

Cause: usually two different `@playwright/test` (or `playwright`) resolutions in the dependency tree, or a config file importing a spec file indirectly. Confirm with `npm ls @playwright/test` and `npm ls playwright` — both should resolve to a single deduped version.

### ❌ `No tests found` with a `-g` regex

Cause: near-certainly a line break injected into the pattern by terminal wrapping during copy-paste, not a real Playwright issue.
Fix: use a short, single-line substring match instead of the full test title.

---

## References

* Playwright: [https://playwright.dev/docs/intro](https://playwright.dev/docs/intro)
* Coveo JS Framework: [https://docs.coveo.com/en/375](https://docs.coveo.com/en/375)
