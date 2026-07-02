import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = !!process.env.CI;

// This suite targets a live external site (cooley.com), so there is
// no local server to start. PUBLIC_BASE_URL defaults to the live
// people search page but can be overridden for staging/local mocks.
const baseURL = process.env.PUBLIC_BASE_URL ?? 'https://www.cooley.com';

export default defineConfig({
  testDir: 'tests/',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  outputDir: './results/test-results',

  reporter: isCI
    ? [
        [path.resolve(__dirname, 'reporters/table-summary-reporter.js')],
        ['html', { outputFolder: './results/html', open: 'never' }],
        ['line'],
        [
          'allure-playwright',
          {
            detail: true,
            resultsDir: './results/allure-results',
            suiteTitle: true,
          },
        ],
      ]
    : [
        [path.resolve(__dirname, 'reporters/table-summary-reporter.js')],
        ['html', { outputFolder: './results/html', open: 'never' }],
        [
          'allure-playwright',
          {
            detail: true,
            resultsDir: './results/allure-results',
            suiteTitle: true,
          },
        ],
      ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    browserName: 'chromium',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
