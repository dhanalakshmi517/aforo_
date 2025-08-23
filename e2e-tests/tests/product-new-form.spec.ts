import { test, expect } from '@playwright/test';

/**
 * Covers full NewProductForm wizard happy-path with network stubbing so no backend is needed.
 */

test('Create product via wizard', async ({ page }) => {
  test.setTimeout(60000);
  // Stub every POST to /api/products and nested endpoints
  const products: any[] = [];
  await page.route('**/api/products**', async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      // creation
      const created = { productId: 999, ...(await route.request().postDataJSON()) };
      products.push(created);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
    } else if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(products),
      });
    } else {
      // PUT/PATCH config save, DELETE, etc.
      await route.fulfill({ status: 200, body: '{}' });
    }
  });

  const suffix = Math.random().toString(36).slice(2, 8);
  const productName = `Wizard-${suffix}`;

  await page.goto('/get-started/products');

  // Wait until list loaded and button visible
  // Dismiss cookie banner if present (does not throw if absent)
  try {
    await page.getByRole('button', { name: /accept/i }).click({ timeout: 2000 });
  } catch (_) {}
  // Remove banner element fully to avoid intercepting clicks
  await page.evaluate(() => {
    const banner = document.getElementById('cc-main');
    if (banner) banner.remove();
  });

  await page.locator('text=Loading products').waitFor({ state: 'detached', timeout: 60000 });
  await page.getByRole('button', { name: /new product/i }).click({ force: true });

  // Step 0 – General details
  await page.getByLabel(/product name/i).fill(productName);
  await page.getByLabel(/product type/i).selectOption('API');
  await page.getByLabel(/version/i).fill('v1.0.0');
  await page.getByLabel(/description/i).fill('Test product created by Playwright E2E test');
  await page.getByLabel(/category/i).selectOption('INTERNAL');
  await page.getByLabel(/status/i).selectOption('DRAFT');
  await page.getByRole('button', { name: /save & next/i }).click({ force: true });
  
  // Wait for next step to load
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('h2:has-text("Product Metadata")', { state: 'visible', timeout: 10000 });

  // Step 1 – Product metadata (fill all required fields)
  await page.getByLabel(/internal sku code/i).fill('SKU-1');
  await page.getByLabel(/uom/i).fill('unit');
  await page.getByLabel(/effective start date/i).fill('2025-01-01');
  await page.getByLabel(/effective end date/i).fill('2025-12-31');
  await page.getByLabel(/audit log id/i).fill('123');
  await page.getByLabel(/linked rate plans/i).fill('STANDARD,PREMIUM');
  await page.getByRole('button', { name: /save & next/i }).click({ force: true });
  
  // Wait briefly to allow backend call
  await page.waitForLoadState('networkidle');

  // Close wizard by reloading page – base product should now exist
  await page.reload();
  await page.locator('text=Loading products').waitFor({ state: 'detached' });
  await expect(page.getByText(productName)).toBeVisible({ timeout: 10000 });
});
