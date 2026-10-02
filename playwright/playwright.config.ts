import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import { authFile } from './auth';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = !!process.env.CI;

// This suite targets a live external site (cooley.com), so there is
// no local server to start. PUBLIC_BASE_URL defaults to the live
// people search page but can be overridden for staging/local mocks.
const baseURL = process.env.PUBLIC_BASE_URL ?? 'https://www.cooley.com';

// Separate authenticated suite for the nextgen Vanilla dashboard
// (dev.nextgen.vanillavc.com), gated behind Azure B2C login.
const vanillaBaseURL = process.env.VANILLA_BASE_URL ?? 'https://dev.nextgen.vanillavc.com';

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
      testDir: 'tests/',
      testIgnore: /vanilla\//,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'vanilla-public',
      testDir: 'tests/vanilla/public',
      use: { ...devices['Desktop Chrome'], baseURL: vanillaBaseURL },
    },
    {
      name: 'vanilla-setup',
      testDir: 'tests/vanilla',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: vanillaBaseURL },
    },
    {
      name: 'vanilla-dashboard',
      testDir: 'tests/vanilla/dashboard',
      dependencies: ['vanilla-setup'],
      use: { ...devices['Desktop Chrome'], baseURL: vanillaBaseURL, storageState: authFile },
    },
  ],
});
