import { Page, Locator, expect } from '@playwright/test';

// Public marketing landing page at the site root — no auth required.
// Locators confirmed against the live page.
export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly loginButton: Locator;
  readonly requestDemoLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /streamline transfers with/i });
    this.loginButton = page.getByRole('button', { name: 'Login' }).first();
    this.requestDemoLink = page.getByRole('link', { name: 'Request a demo' }).first();
  }

  async goto() {
    await this.page.goto('/');
  }

  async assertLoaded() {
    await expect(this.heading).toBeVisible();
  }

  async goToLogin() {
    await this.loginButton.click();
  }
}
