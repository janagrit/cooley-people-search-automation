import { test, expect } from '../../../fixture';

test.describe('Vanilla marketing home', { tag: ['@smoke', '@public'] }, () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('landing page loads', async ({ homePage }) => {
    await homePage.assertLoaded();
  });

  test('Login redirects to the B2C sign-in page', async ({ homePage, page }) => {
    await homePage.goToLogin();
    await expect(page).toHaveURL(/b2clogin\.com/);
    await expect(page.getByRole('heading', { name: 'Sign in with your email' })).toBeVisible();
  });
});
