import { test, expect } from '../../../fixture';

test.describe('Vanilla dashboard auth', { tag: ['@smoke', '@auth'] }, () => {
  test('reusing the saved session lands on the dashboard without re-authenticating', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.assertAuthenticated();
  });

  test('session persists after a reload', async ({ dashboardPage, page }) => {
    await dashboardPage.goto();
    await page.reload();
    await dashboardPage.assertAuthenticated();
  });

  // The sign-out control hasn't been inspected on the live dashboard yet.
  // Fill in the real locator here once confirmed, then remove .fixme.
  test.fixme('user can sign out and is returned to the login page', async ({ dashboardPage, page }) => {
    await dashboardPage.goto();
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page.getByRole('heading', { name: 'Sign in with your email' })).toBeVisible();
  });
});
