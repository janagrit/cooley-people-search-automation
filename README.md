# Cooley people search automation

Playwright + TypeScript automation demo for the Cooley attorney
directory (cooley.com/people), built as a walkthrough for a QA
automation interview.

## Project structure

This repo is set up as a workspace with the test automation isolated
in its own `playwright/` subdirectory, separate from the repo root.
This mirrors a common setup where automation lives alongside (but
independent from) the main application code, with its own
dependencies, config, and scripts.

```
.
├── package.json          # root-level config (repo metadata, shared tooling)
├── .gitignore
├── .prettierrc
├── .prettierignore
└── playwright/            # isolated automation project
    ├── package.json       # automation-specific dependencies and scripts
    ├── playwright.config.ts
    ├── tsconfig.json
    ├── fixture.ts          # shared fixtures (page objects, env config)
    ├── .env                # local environment variables (not committed)
    ├── pages/
    │   └── PeopleSearchPage.ts   # page object for the people search UI
    ├── tests/
    │   └── people-search.spec.ts # test specs
    ├── reporters/
    │   └── table-summary-reporter.js  # custom CI reporter
    └── results/            # generated on test run, gitignored
        ├── allure-results/
        ├── html/
        └── test-results/
```

## Why separate the automation project

- Automation dependencies (Playwright, allure, reporters) don't pollute
  the root project's dependency tree
- The automation suite can be run, versioned, and CI-triggered
  independently of the main application
- Mirrors the structure used in production frameworks, where test
  infrastructure is owned and evolved separately from product code

## Setup

```bash
cd playwright
npm install
npx playwright install chromium
```

## Run tests

```bash
cd playwright
npm run test          # full run
npm run test:headed   # headed/visible browser
npm run test:ui       # Playwright UI mode
npm run test:smoke    # tests tagged @smoke
```

## Reports

```bash
npm run report:html   # open Playwright HTML report
```

Allure results are written to `playwright/results/allure-results` and
can be generated/viewed with:

```bash
npx allure generate ./results/allure-results --clean -o ./results/allure-report
npx allure open ./results/allure-report
```

## Before running against live site

Selectors in `pages/PeopleSearchPage.ts` are based on inspection and
may need adjustment if cooley.com's markup changes. Run
`npx playwright codegen https://www.cooley.com/people` to verify or
update selectors.

## Talking points for the interview

- The page object pattern (`PeopleSearchPage.ts`) is reusable across
  other searchable directories on the site (e.g. insights/news search),
  demonstrating a framework-first approach rather than one-off scripts.
- The "Artificial Intelligence" practice area filter used in the tests
  is a deliberate nod to the work Cooley's Innovation/Practice
  Engineering team focuses on.
- In a real framework, these tests would be tagged (smoke vs
  regression), run in CI on every deploy, and results would feed into
  Allure with PII masking for any attorney-identifying data.
- The same result-validation pattern used here (checking required
  fields on each result card) extends naturally to validating
  AI-generated content: instead of "name, title, office," you'd check
  "required clauses, correct formatting, no hallucinated fields"
  against golden output benchmarks.