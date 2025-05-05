import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder("Username").fill("standard_user");
  await page.getByPlaceholder("Password").fill("secret_sauce");
  await page.locator("#login-button").click();
  await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");
  await expect(page.getByText("Products")).toBeVisible();

  await page.context().storageState({ path: authFile });
});