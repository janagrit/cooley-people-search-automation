import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

import { PeopleSearchPage } from '../playwright/pages/PeopleSearchPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';

// Export env globally, mirroring the CCCTC fixture pattern.
// PUBLIC_BASE_URL lets the same suite point at staging/prod if needed.
export const env = process.env.PUBLIC_ENV ?? 'production';
export const baseUrl = process.env.PUBLIC_BASE_URL ?? 'https://www.cooley.com';

export type CooleyPageObjects = {
  peopleSearchPage: PeopleSearchPage;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  homePage: HomePage;
  env: string;
  baseUrl: string;
  path: typeof path;
  fs: typeof fs;
};

export const test = base.extend<CooleyPageObjects>({
  peopleSearchPage: async ({ page }, use) => await use(new PeopleSearchPage(page)),
  loginPage: async ({ page }, use) => await use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => await use(new DashboardPage(page)),
  homePage: async ({ page }, use) => await use(new HomePage(page)),
  env: async ({}, use) => await use(env),
  baseUrl: async ({}, use) => await use(baseUrl),
  path: async ({}, use) => await use(path),
  fs: async ({}, use) => await use(fs),
});

export { expect };
export type { Page };
