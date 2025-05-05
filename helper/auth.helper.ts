import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

export function isAuthStateValid(): boolean {
  if (!fs.existsSync(authFile)) {
    return false; // File doesn't exist
  }

  const storageState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
  const cookies = storageState.cookies || [];
  const now = Date.now() / 1000; // Current time in seconds

  // Check if any cookie is expired
  return cookies.every(cookie => !cookie.expires || cookie.expires > now);
}

export async function regenerateAuthState() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Perform authentication steps
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder("Username").fill("standard_user");
  await page.getByPlaceholder("Password").fill("secret_sauce");
  await page.locator("#login-button").click();
  await page.waitForURL("https://www.saucedemo.com/inventory.html");
  await page.context().storageState({ path: authFile });

  await browser.close();
}