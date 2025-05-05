import { test, expect } from '@playwright/test';

var items = null;
var count = 0;

test.beforeEach(async ({ page }) => {
    await page.goto("https://www.saucedemo.com/inventory.html");
    await expect(page.getByText("Products")).toBeVisible();

    items = page.locator('.inventory_item');
    expect(items).not.toBeNull();
    count = await items.count();
  });

test('Items add to cart and remove from cart', async ({ page }) => {

    for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        await item.locator('.btn_inventory').click(); // Add to cart
    }

    let cartCount = await page.locator(".shopping_cart_badge").textContent();
    expect(cartCount).toBe(count.toString());

    for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        await item.locator('.btn_inventory').click(); // Remove from cart
    }

    await expect(page.locator(".shopping_cart_badge")).toHaveCount(0);
});

//Add random items 3/6 from the list of items to the cart and click on the cart icon to check if the items are added to the cart
test('Add random items to cart and check cart', async ({ page }) => {

    var itemsTotalPrice = 0;
    const indices = Array.from({ length: count }, (_, i) => i);
    const shuffled = indices.sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const i of shuffled) {
        const item = items.nth(i);
        const priceText = await item.locator('.inventory_item_price').textContent();
        const price = parseFloat(priceText.replace('$', ''));
        itemsTotalPrice += price;
        await item.locator('.btn_inventory').click(); // Add to cart
    }

    let cartCount = await page.locator(".shopping_cart_badge").textContent();
    expect(cartCount).toBe(shuffled.length.toString());

    await page.locator(".shopping_cart_link").click(); // Click on the cart icon
    await expect(page.getByText("Your Cart")).toBeVisible(); // Check if the cart page is visible

    await page.getByRole('button', { name: 'Checkout' }).click(); // Click on the checkout button
    await expect(page.getByText("Checkout: Your Information")).toBeVisible(); // Check if the checkout page is visible

    await page.getByPlaceholder('First Name').fill('John'); // Fill in the first name
    await page.getByPlaceholder('Last Name').fill('Doe'); // Fill in the last name
    await page.getByPlaceholder('Zip/Postal Code').fill('12345'); // Fill in the zip code
    await page.getByRole('button', { name: 'Continue' }).click(); // Click on the continue button
    
    await expect(page.getByText("Checkout: Overview")).toBeVisible(); // Check if the overview page is visible
    const totalPriceText = await page.locator('.summary_subtotal_label').textContent();
    const totalPrice = parseFloat(totalPriceText.replace('Item total: $', ''));

    await expect(totalPrice).toBe(itemsTotalPrice); // Check if the total price is correct

    const tax = await page.locator('.summary_tax_label').textContent();
    const taxValue = parseFloat(tax.replace('Tax: $', ''));
    const total = await page.locator('.summary_total_label').textContent();
    const totalValue = parseFloat(total.replace('Total: $', ''));
    const expectedTotal = itemsTotalPrice + taxValue;
    await expect(totalValue).toBeCloseTo(expectedTotal,2); // Check if the total value is correct
});