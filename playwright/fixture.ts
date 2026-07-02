import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

import { PeopleSearchPage } from '../playwright/pages/PeopleSearchPage';

// Export env globally, mirroring the CCCTC fixture pattern.
// PUBLIC_BASE_URL lets the same suite point at staging/prod if needed.
export const env = process.env.PUBLIC_ENV ?? 'production';
export const baseUrl = process.env.PUBLIC_BASE_URL ?? 'https://www.cooley.com';

export type CooleyPageObjects = {
  peopleSearchPage: PeopleSearchPage;
  env: string;
  baseUrl: string;
  path: typeof path;
  fs: typeof fs;
};

export const test = base.extend<CooleyPageObjects>({
  peopleSearchPage: async ({ page }, use) => await use(new PeopleSearchPage(page)),
  env: async ({}, use) => await use(env),
  baseUrl: async ({}, use) => await use(baseUrl),
  path: async ({}, use) => await use(path),
  fs: async ({}, use) => await use(fs),
});

export { expect };
export type { Page };
