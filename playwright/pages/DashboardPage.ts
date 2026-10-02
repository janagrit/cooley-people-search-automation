import { Page, expect } from '@playwright/test';

// Minimal page object for the authenticated landing page at /cooley/dashboard.
// Locators here are intentionally conservative (URL + absence of the login
// form) since the authenticated dashboard markup hasn't been inspected yet —
// tighten these once real selectors are confirmed against the live page.
export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/cooley/dashboard');
  }

  async assertAuthenticated() {
    await expect(this.page).toHaveURL(/\/cooley\/dashboard/);
    await expect(this.page.getByRole('heading', { name: 'Sign in with your email' })).not.toBeVisible();
  }
}
