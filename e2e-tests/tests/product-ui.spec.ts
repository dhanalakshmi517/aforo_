import { test, expect } from '@playwright/test';

/**
 * End-to-end UI test for Products
 * 1. Opens products page
 * 2. Creates product via NewProductForm wizard (only fills mandatory first step)
 * 3. Verifies product appears in list
 * 4. Deletes product and verifies removal
 *
 * NOTE: Assumes backend seeded with empty state and server running at baseURL.
 */

test.describe('Products UI', () => {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  const productName = `E2E-Product-${suffix}`;

  test('Create and delete product', async ({ page }) => {
    // Mock backend
    const products: any[] = [];
    await page.route('**/api/products**', async route => {
      const url = route.request().url();
      const method = route.request().method();
      if (method === 'POST') {
        // create product
        products.push({ productName });
        // create product returns productId 123
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ productId: 123 }) });
      } else if (method === 'DELETE') {
        products.splice(0, products.findIndex(p => p.productName === productName) + 1);
        await route.fulfill({ status: 200, body: '{}' });
      } else {
        // GET list – return list containing our soon-to-create product for visibility check.
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(products) });
      }
    });

    // 1) navigate
    await page.goto('/get-started/products');

    // 2) wait for product list to load and creation wizard button visible
    await page.locator('text=Loading products').waitFor({ state: 'detached', timeout: 60000 });
    const newProductBtn = page.getByRole('button', { name: /new product/i });
    await newProductBtn.click();

    // 3) fill general details (step 0)
    await page.getByLabel(/product name/i).fill(productName);
    await page.getByLabel(/product type/i).selectOption('API');
    await page.getByLabel(/version/i).fill('v1');
    await page.getByLabel(/description/i).fill('Created by Playwright');
    await page.getByLabel(/category/i).selectOption('INTERNAL');
    await page.getByLabel(/status/i).selectOption('DRAFT');

    await page.getByRole('button', { name: /save & next/i }).click();

    // We don't need to finish wizard – backend call happens on step advance.
    await page.waitForTimeout(2000);

    // cancel/close wizard
    await page.getByRole('button', { name: /cancel/i }).first().click();
    await page.getByRole('button', { name: /cancel/i }).last().click();

    // 4) verify product visible in list (may need refresh)
    await page.waitForURL('**/get-started/products');
    await expect(page.getByText(productName)).toBeVisible({ timeout: 10000 });

    // 5) delete
    const row = page.getByRole('row', { name: new RegExp(productName) });
    await row.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('button', { name: /delete/i }).last().click();

    // confirm removed
    await expect(page.getByText(productName)).toHaveCount(0);
  });
});
