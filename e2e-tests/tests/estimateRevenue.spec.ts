import { test, expect } from '@playwright/test';

/**
 * Verifies the Flat-Fee revenue estimator flow passes with preset data.
 * The test injects saved pricing values into localStorage before the
 * application loads, then drives the UI to calculate revenue and
 * asserts on the computed total.
 */

test('Flat-Fee revenue estimation', async ({ page }) => {
  test.setTimeout(60000);

  // 1. Seed localStorage so the estimator has pricing data
  await page.addInitScript(() => {
    localStorage.setItem('flatFeeAmount', '100');       // $100 subscription fee
    localStorage.setItem('flatFeeApiCalls', '1000');    // includes 1000 calls
    localStorage.setItem('flatFeeOverage', '1');        // $1 per extra call

    // Extras – present but initially toggled off
    localStorage.setItem('setupFee', '25');
    localStorage.setItem('discountPercent', '10');
    localStorage.setItem('freemiumUnits', '50');
    localStorage.setItem('minimumUsage', '2000');
    localStorage.setItem('minimumCharge', '500');
  });

  // 2. Navigate directly to the estimator route
  await page.goto('/estimate-revenue');

  // Dismiss cookie banner if present so it doesn't cover UI
  try {
    await page.getByRole('button', { name: /accept/i }).click({ timeout: 2000 });
  } catch (_) {}
  await page.evaluate(() => {
    const banner = document.getElementById('cc-main');
    if (banner) banner.remove();
  });

  // 3. Fill usage greater than the included calls to trigger overage
  await page.getByPlaceholder('Enter Estimated Usage').fill('1200');

  // 4. Trigger calculation
  await page.getByRole('button', { name: /calculate revenue/i }).click();

  // 5. Wait until calculation finishes (loader disappears) and table updates
  await page.locator('text=Total Estimation').scrollIntoViewIfNeeded();

  // 6. Assert expected total: flatFee 100 + overage(200*1) = 300
  const totalCell = page.locator('tr.total-row td').last();
  await expect(totalCell).toHaveText('$300');
});
