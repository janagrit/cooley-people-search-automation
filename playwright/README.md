# Administrator Next Gen — Testing Guide

This guide describes how to run and maintain **automated tests** for the *Administrator Next Gen* application.

It focuses **only on testing** (Jest + Playwright). Application setup, AWS architecture, and runtime configuration are documented in the **root `README.md`**.

---

## Table of Contents

1. [Testing Stack Overview](#testing-stack-overview)
2. [Prerequisites](#prerequisites)
3. [Jest: Unit & Integration Tests](#jest-unit--integration-tests)
4. [Playwright: E2E & API Tests](#playwright-end-to-end--api-tests)
5. [Running Tests](#running-tests)
6. [Tag-Based Test Execution](#tag-based-test-execution)
7. [Fixtures, Page Objects & Conventions](#fixtures-page-objects--conventions)
8. [Pre-Commit & CI Flow](#pre-commit--ci-flow)
9. [Common Issues](#common-issues)
10. [References](#references)

---

## Testing Stack Overview

| Layer              | Tool              | Purpose                        |
| ------------------ | ----------------- | ------------------------------ |
| Unit / Integration | **Jest**          | Components, hooks, utilities   |
| E2E / API          | **Playwright**    | User flows, backend validation |
| Pre-commit         | **Husky**         | Enforce test & coverage gates  |
| CI Reporting       | **HTML / Allure** | Jenkins artifacts              |

---

## Prerequisites

* **Node.js 20+**
* **npm**
* Project dependencies installed (`npm ci` at repo root)
* Valid `.env` file **or** access to AWS SSM (see root README)

---

## Jest: Unit & Integration Tests

**Purpose**

Jest is used to validate isolated logic:

* React components
* Hooks
* Utility functions

**Key configuration files**

* `jest.config.ts`
* `jest.setup.ts`

**Coverage scope**

```ts
collectCoverageFrom: [
  'src/components/**/*.{ts,tsx}',
  'src/hooks/**/*.{ts,tsx,jsx}',
  'src/utils/**/*.{ts,tsx}',
];
```

**Run**

```bash
npm test
npm run test:coverage
```

---

## Playwright: End-to-End & API Tests

**Purpose**

Playwright tests validate full application behavior in a real browser:

* User journeys
* API integrations
* Authenticated flows

### Directory Structure

```
playwright/
 ├─ playwright.config.ts
 ├─ fixture.ts              # Shared fixtures
 ├─ pages/                  # Page Object Models
 ├─ tests/                  # Test specs (*.spec.ts)
 └─ reporters/              # Custom reporters

results/
 ├─ test-results/           # Screenshots / traces
 ├─ html/                   # HTML report (CI)
 └─ allure-results/         # Allure artifacts (CI)
```

---

## Running Tests

### Jest

```bash
npm test
npm run test:coverage
```

### Playwright (from repo root)

```bash
npm run test:run         # All Playwright tests
npm run test:smoke       # Smoke suite
npm run test:regression  # Regression suite
npm run test:api         # API tests
npm run test:ui          # Interactive UI mode
```

---

## Tag-Based Test Execution

Playwright tests are grouped using **tags**, allowing selective execution without modifying code.

### Tagging a test

```ts
test.describe(
  'Login Page',
  { tag: ['@smoke', '@ui'] },
  () => {
    test('should login successfully', async ({ page }) => {
      // test steps
    });
  }
);
```

### Supported tags

| Tag           | Meaning                  |
| ------------- | ------------------------ |
| `@smoke`      | Critical paths           |
| `@regression` | Full regression coverage |
| `@api`        | API-only validation      |
| `@ui`         | UI flows                 |
| `@bug`        | Bug reproduction / fixes |

### Running by tag

```bash
npm run pl:smoke
npm run pl:regression
npm run pl:api
```

---

## Fixtures, Page Objects & Conventions

### Fixtures

* Centralized in `playwright/fixture.ts`
* Shared across all tests
* Provide authenticated context and shared state

```ts
export const test = base.extend({
  loginPage: async ({ page }, useFixture) => {
    await useFixture(new LoginPage(page));
  },
});
```

### Conventions

* Always import `test` from the shared fixture
* Keep tests declarative
* Reuse Page Objects
* Avoid conditional logic inside specs

---

## Pre-Commit & CI Flow

```text
Code Change
   ↓
Husky Pre-Commit
   ↓
Jest (with coverage)
   ↓
Playwright (E2E / API)
   ↓
CI / Jenkins Reports
```

### Pre-commit behavior

* Blocks commit if tests fail
* Enforces coverage thresholds
* Can be bypassed temporarily:

```bash
HUSKY_SKIP_HOOKS=1 git commit -m "skip tests"
```

---

## Common Issues

### ❌ Playwright navigates to `/`

Cause: missing `NEXT_PUBLIC_SITE_URL`
Fix: verify `.env` is loaded

---

### ❌ Login failures

Cause: missing or malformed credentials
Fix:

* Ensure env vars exist
* Quote passwords with special characters

---

### ❌ Pre-commit blocked by AWS

Cause: expired SSO session
Fix:

```bash
aws sso login --profile CCCTC-AdministratorAccess-<ACCOUNT_ID>
```

---

## References

* Jest: [https://jestjs.io/docs/getting-started](https://jestjs.io/docs/getting-started)
* Playwright: [https://playwright.dev/docs/intro](https://playwright.dev/docs/intro)
* React Testing Library: [https://testing-library.com/docs/react-testing-library/intro](https://testing-library.com/docs/react-testing-library/intro)
