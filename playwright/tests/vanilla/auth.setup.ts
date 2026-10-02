import { test as setup } from '../../fixture';
import { authFile } from '../../auth';

setup('authenticate against Vanilla B2C login', async ({ page, loginPage, dashboardPage }) => {
  const email = process.env.VANILLA_EMAIL;
  const password = process.env.VANILLA_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'VANILLA_EMAIL and VANILLA_PASSWORD must be set in playwright/.env to run the vanilla-dashboard suite.'
    );
  }

  await dashboardPage.goto();
  await loginPage.login(email, password);
  await dashboardPage.assertAuthenticated();

  await page.context().storageState({ path: authFile });
});
