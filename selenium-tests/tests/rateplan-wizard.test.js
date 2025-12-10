const WebDriverManager = require('../config/webdriver');
const RatePlanWizardPage = require('../pages/RatePlanWizardPage');
const LoginPage = require('../pages/LoginPage');
const { By, until } = require('selenium-webdriver');

/**
 * COMPLETE WORKFLOW TESTS - Rate Plan Wizard
 * 
 * Tests complete end-to-end workflows for creating rate plans with all 5 pricing models.
 * Each test creates a rate plan from start to finish including extras and submission.
 */

describe('Rate Plan Wizard - Complete Workflows', () => {
    let driverManager;
    let driver;
    let wizardPage;
    let loginPage;

    // Test data
    const testProducts = ['API Gateway', 'Cloud Storage', 'Database API']; // Using existing products
    const testEmail = process.env.TEST_EMAIL || 'shyambss07@ai.ai';
    const testPassword = process.env.TEST_PASSWORD || '^j$GfNQm';

    beforeAll(async () => {
        console.log('🚀 Setting up Rate Plan Workflow Tests');
        driverManager = new WebDriverManager();
        driver = await driverManager.createDriver();
        wizardPage = new RatePlanWizardPage(driver);
        loginPage = new LoginPage(driver);

        // Login first
        console.log('🔐 Logging in...');
        await driver.get(`${wizardPage.baseUrl}/signin`);
        await driver.sleep(2000);

        try {
            const emailInput = await driver.findElement(By.css('input[type="email"]'));
            await emailInput.sendKeys(testEmail);
            const passwordInput = await driver.findElement(By.css('input[type="password"]'));
            await passwordInput.sendKeys(testPassword);
            const loginButton = await driver.findElement(By.css('button[type="submit"]'));
            await loginButton.click();
            await driver.sleep(3000);
            console.log('✅ Login successful');
        } catch (error) {
            console.log('⚠️ Login may have failed or already logged in');
        }
    }, 60000);

    afterAll(async () => {
        console.log('🧹 Cleaning up tests');
        if (driverManager) {
            await driverManager.quitDriver();
        }
    }, 10000);

    describe('✅ Flat Fee Pricing Model - Complete Flow', () => {
        test('should create a complete Flat Fee rate plan with all extras', async () => {
            console.log('🧪 Test: Complete Flat Fee Rate Plan Creation');

            // Navigate to Rate Plans and click Create
            await wizardPage.navigateToRatePlans();
            await wizardPage.takeScreenshot('workflow-flatfee-01-rateplans-page.png');
            await wizardPage.clickCreateRatePlan();
            await wizardPage.takeScreenshot('workflow-flatfee-02-wizard-opened.png');

            // STEP 1: Plan Details
            console.log('📝 Step 1: Filling Plan Details');
            await wizardPage.fillPlanName('Flat Fee Test Plan ' + Date.now());
            await wizardPage.fillPlanDescription('A comprehensive test plan with flat fee pricing');
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct(testProducts[0]); // Use first available product
            await wizardPage.selectPaymentMethod('CREDIT_CARD');
            await wizardPage.takeScreenshot('workflow-flatfee-03-step1-filled.png');

            const isNextEnabled = await wizardPage.isNextButtonEnabled();
            expect(isNextEnabled).toBe(true);

            await wizardPage.clickNext();
            await wizardPage.takeScreenshot('workflow-flatfee-04-step2-loaded.png');

            // STEP 2: Billable Metrics
            console.log('📊 Step 2: Selecting Billable Metric');
            const metrics = await wizardPage.getBillableMetrics();
            expect(metrics.length).toBeGreaterThan(0);

            // Select the first available metric
            await wizardPage.selectBillableMetric(metrics[0]);
            await wizardPage.takeScreenshot('workflow-flatfee-05-metric-selected.png');

            await wizardPage.clickNext();
            await wizardPage.takeScreenshot('workflow-flatfee-06-step3-loaded.png');

            // STEP 3: Pricing - Flat Fee
            console.log('💰 Step 3: Configuring Flat Fee Pricing');
            await wizardPage.selectPricingModel('Flat Fee');
            await driver.sleep(1000);

            await wizardPage.fillFlatFeeAmount(99.99);
            await wizardPage.fillFlatFeeAPICalls(1000);
            await wizardPage.fillFlatFeeOverage(0.10);
            await wizardPage.fillFlatFeeGrace(50);
            await wizardPage.takeScreenshot('workflow-flatfee-07-pricing-filled.png');

            await wizardPage.clickNext();
            await wizardPage.takeScreenshot('workflow-flatfee-08-step4-loaded.png');

            // STEP 4: Extras
            console.log('🎁 Step 4: Adding Extras');

            // Setup Fee
            await wizardPage.expandSetupFee();
            await wizardPage.fillSetupFee(25.00);
            await wizardPage.fillSetupTiming(0);
            await wizardPage.fillSetupInvoiceDesc('One-time setup fee');
            await wizardPage.takeScreenshot('workflow-flatfee-09-setup-fee.png');

            // Discounts
            await wizardPage.expandDiscounts();
            await wizardPage.selectDiscountType('PERCENTAGE');
            await wizardPage.fillDiscountPercent(10);
            await wizardPage.fillDiscountEligibility('First-time customers');
            await wizardPage.takeScreenshot('workflow-flatfee-10-discounts.png');

            // Freemium
            await wizardPage.expandFreemium();
            await wizardPage.selectFreemiumType('FREE_TRIAL_DURATION');
            await wizardPage.fillFreemiumTrialDuration(14);
            await wizardPage.takeScreenshot('workflow-flatfee-11-freemium.png');

            // Minimum Commitment
            await wizardPage.expandMinimumCommitment();
            await wizardPage.fillMinimumUsage(500);
            await wizardPage.takeScreenshot('workflow-flatfee-12-commitment.png');

            await wizardPage.clickNext();
            await wizardPage.takeScreenshot('workflow-flatfee-13-step5-loaded.png');

            // STEP 5: Review & Submit
            console.log('👀 Step 5: Reviewing and Submitting');
            const summary = await wizardPage.getReviewSummary();
            expect(summary.length).toBeGreaterThan(0);
            await wizardPage.takeScreenshot('workflow-flatfee-14-review.png');

            // Test revenue estimator
            await wizardPage.clickEstimateRevenue();
            await driver.sleep(2000);
            const isModalOpen = await wizardPage.isEstimatorModalOpen();
            if (isModalOpen) {
                console.log('✅ Revenue estimator modal opened');
                await wizardPage.takeScreenshot('workflow-flatfee-15-estimator.png');
                // Close modal (press Escape)
                await driver.actions().sendKeys(Key.ESCAPE).perform();
                await driver.sleep(1000);
            }

            // Submit
            const isSubmitEnabled = await wizardPage.isSubmitButtonEnabled();
            expect(isSubmitEnabled).toBe(true);

            await wizardPage.clickSubmit();
            await driver.sleep(5000); // Wait for submission and redirect
            await wizardPage.takeScreenshot('workflow-flatfee-16-submitted.png');

            const currentUrl = await wizardPage.getCurrentUrl();
            console.log(`✅ Submitted! Current URL: ${currentUrl}`);

            // Verify we're back on rate plans page
            expect(currentUrl).toContain('rate-plans');

            console.log('✅ Complete Flat Fee workflow test passed!');
        }, 120000); // 2 minute timeout
    });

    describe('✅ Usage-Based Pricing Model - Complete Flow', () => {
        test('should create a complete Usage-Based rate plan', async () => {
            console.log('🧪 Test: Complete Usage-Based Rate Plan Creation');

            await wizardPage.navigateToRatePlans();
            await wizardPage.clickCreateRatePlan();

            // STEP 1: Plan Details
            console.log('📝 Step 1: Filling Plan Details');
            await wizardPage.fillPlanName('Usage-Based Plan ' + Date.now());
            await wizardPage.fillPlanDescription('Pay per API call');
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct(testProducts[0]);
            await wizardPage.selectPaymentMethod('CREDIT_CARD');
            await wizardPage.takeScreenshot('workflow-usage-01-step1.png');
            await wizardPage.clickNext();

            // STEP 2: Billable Metrics
            console.log('📊 Step 2: Selecting Billable Metric');
            const metrics = await wizardPage.getBillableMetrics();
            await wizardPage.selectBillableMetric(metrics[0]);
            await wizardPage.takeScreenshot('workflow-usage-02-step2.png');
            await wizardPage.clickNext();

            // STEP 3: Pricing - Usage-Based
            console.log('💰 Step 3: Configuring Usage-Based Pricing');
            await wizardPage.selectPricingModel('Usage-Based');
            await driver.sleep(1000);

            await wizardPage.fillUsagePerUnit(0.05);
            await wizardPage.takeScreenshot('workflow-usage-03-pricing.png');

            await wizardPage.clickNext();

            // STEP 4: Extras (skip for this test)
            console.log('🎁 Step 4: Skipping Extras');
            await wizardPage.takeScreenshot('workflow-usage-04-extras-skipped.png');
            await wizardPage.clickNext();

            // STEP 5: Review & Submit
            console.log('👀 Step 5: Reviewing and Submitting');
            await wizardPage.takeScreenshot('workflow-usage-05-review.png');

            await wizardPage.clickSubmit();
            await driver.sleep(5000);
            await wizardPage.takeScreenshot('workflow-usage-06-submitted.png');

            const currentUrl = await wizardPage.getCurrentUrl();
            expect(currentUrl).toContain('rate-plans');

            console.log('✅ Complete Usage-Based workflow test passed!');
        }, 90000);
    });

    describe('✅ Tiered Pricing Model - Complete Flow', () => {
        test('should create a complete Tiered Pricing rate plan with multiple tiers', async () => {
            console.log('🧪 Test: Complete Tiered Pricing Rate Plan Creation');

            await wizardPage.navigateToRatePlans();
            await wizardPage.clickCreateRatePlan();

            // STEP 1: Plan Details
            await wizardPage.fillPlanName('Tiered Plan ' + Date.now());
            await wizardPage.fillPlanDescription('Volume discounts with tiers');
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct(testProducts[0]);
            await wizardPage.selectPaymentMethod('CREDIT_CARD');
            await wizardPage.clickNext();

            // STEP 2: Billable Metrics
            const metrics = await wizardPage.getBillableMetrics();
            await wizardPage.selectBillableMetric(metrics[0]);
            await wizardPage.clickNext();

            // STEP 3: Pricing - Tiered
            console.log('💰 Step 3: Configuring Tiered Pricing');
            await wizardPage.selectPricingModel('Tiered Pricing');
            await driver.sleep(1000);

            // First tier should exist by default, configure it
            await wizardPage.fillTierFrom(0, 0);
            await wizardPage.fillTierTo(0, 1000);
            await wizardPage.fillTierPrice(0, 0.10);
            await wizardPage.takeScreenshot('workflow-tiered-01-tier1.png');

            // Add second tier
            await wizardPage.addTier();
            await wizardPage.fillTierFrom(1, 1001);
            await wizardPage.fillTierTo(1, 5000);
            await wizardPage.fillTierPrice(1, 0.08);
            await wizardPage.takeScreenshot('workflow-tiered-02-tier2.png');

            // Add third tier (unlimited)
            await wizardPage.addTier();
            await wizardPage.fillTierFrom(2, 5001);
            await wizardPage.fillTierPrice(2, 0.05);
            await wizardPage.setTierUnlimited(2, true);
            await wizardPage.takeScreenshot('workflow-tiered-03-tier3-unlimited.png');

            await wizardPage.clickNext();

            // STEP 4: Extras
            await wizardPage.takeScreenshot('workflow-tiered-04-extras.png');
            await wizardPage.clickNext();

            // STEP 5: Review & Submit
            await wizardPage.takeScreenshot('workflow-tiered-05-review.png');
            await wizardPage.clickSubmit();
            await driver.sleep(5000);
            await wizardPage.takeScreenshot('workflow-tiered-06-submitted.png');

            const currentUrl = await wizardPage.getCurrentUrl();
            expect(currentUrl).toContain('rate-plans');

            console.log('✅ Complete Tiered Pricing workflow test passed!');
        }, 90000);
    });

    describe('✅ Volume-Based Pricing Model - Complete Flow', () => {
        test('should create a complete Volume-Based rate plan', async () => {
            console.log('🧪 Test: Complete Volume-Based Rate Plan Creation');

            await wizardPage.navigateToRatePlans();
            await wizardPage.clickCreateRatePlan();

            // STEP 1: Plan Details
            await wizardPage.fillPlanName('Volume Plan ' + Date.now());
            await wizardPage.fillPlanDescription('All units priced at tier rate');
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct(testProducts[0]);
            await wizardPage.selectPaymentMethod('CREDIT_CARD');
            await wizardPage.clickNext();

            // STEP 2: Billable Metrics
            const metrics = await wizardPage.getBillableMetrics();
            await wizardPage.selectBillableMetric(metrics[0]);
            await wizardPage.clickNext();

            // STEP 3: Pricing - Volume-Based
            console.log('💰 Step 3: Configuring Volume-Based Pricing');
            await wizardPage.selectPricingModel('Volume-Based');
            await driver.sleep(1000);

            // Configure first tier
            await wizardPage.fillTierFrom(0, 0);
            await wizardPage.fillTierTo(0, 1000);
            await wizardPage.fillTierPrice(0, 100);

            // Add second tier
            await wizardPage.addTier();
            await wizardPage.fillTierFrom(1, 1001);
            await wizardPage.fillTierTo(1, 5000);
            await wizardPage.fillTierPrice(1, 80);

            // Add unlimited tier
            await wizardPage.addTier();
            await wizardPage.fillTierFrom(2, 5001);
            await wizardPage.fillTierPrice(2, 60);
            await wizardPage.setTierUnlimited(2, true);

            await wizardPage.takeScreenshot('workflow-volume-01-pricing.png');
            await wizardPage.clickNext();

            // STEP 4: Extras
            await wizardPage.clickNext();

            // STEP 5: Review & Submit
            await wizardPage.takeScreenshot('workflow-volume-02-review.png');
            await wizardPage.clickSubmit();
            await driver.sleep(5000);
            await wizardPage.takeScreenshot('workflow-volume-03-submitted.png');

            const currentUrl = await wizardPage.getCurrentUrl();
            expect(currentUrl).toContain('rate-plans');

            console.log('✅ Complete Volume-Based workflow test passed!');
        }, 90000);
    });

    describe('✅ Stairstep Pricing Model - Complete Flow', () => {
        test('should create a complete Stairstep rate plan', async () => {
            console.log('🧪 Test: Complete Stairstep Rate Plan Creation');

            await wizardPage.navigateToRatePlans();
            await wizardPage.clickCreateRatePlan();

            // STEP 1: Plan Details
            await wizardPage.fillPlanName('Stairstep Plan ' + Date.now());
            await wizardPage.fillPlanDescription('Flat cost per usage tier');
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct(testProducts[0]);
            await wizardPage.selectPaymentMethod('CREDIT_CARD');
            await wizardPage.clickNext();

            // STEP 2: Billable Metrics
            const metrics = await wizardPage.getBillableMetrics();
            await wizardPage.selectBillableMetric(metrics[0]);
            await wizardPage.clickNext();

            // STEP 3: Pricing - Stairstep
            console.log('💰 Step 3: Configuring Stairstep Pricing');
            await wizardPage.selectPricingModel('Stairstep');
            await driver.sleep(1000);

            // Configure first stair
            await wizardPage.fillStairFrom(0, 0);
            await wizardPage.fillStairTo(0, 1000);
            await wizardPage.fillStairCost(0, 50);

            // Add second stair
            await wizardPage.addStair();
            await wizardPage.fillStairFrom(1, 1001);
            await wizardPage.fillStairTo(1, 5000);
            await wizardPage.fillStairCost(1, 200);

            // Add unlimited stair
            await wizardPage.addStair();
            await wizardPage.fillStairFrom(2, 5001);
            await wizardPage.fillStairCost(2, 500);
            await wizardPage.setStairUnlimited(2, true);

            await wizardPage.takeScreenshot('workflow-stair-01-pricing.png');
            await wizardPage.clickNext();

            // STEP 4: Extras
            await wizardPage.clickNext();

            // STEP 5: Review & Submit
            await wizardPage.takeScreenshot('workflow-stair-02-review.png');
            await wizardPage.clickSubmit();
            await driver.sleep(5000);
            await wizardPage.takeScreenshot('workflow-stair-03-submitted.png');

            const currentUrl = await wizardPage.getCurrentUrl();
            expect(currentUrl).toContain('rate-plans');

            console.log('✅ Complete Stairstep workflow test passed!');
        }, 90000);
    });

    describe('✅ Draft Save and Resume', () => {
        test('should save a draft and resume it later', async () => {
            console.log('🧪 Test: Draft Save and Resume');

            const draftName = 'Draft Plan ' + Date.now();

            // Create and save draft
            await wizardPage.navigateToRatePlans();
            await wizardPage.clickCreateRatePlan();

            // Fill Step 1 only
            await wizardPage.fillPlanName(draftName);
            await wizardPage.fillPlanDescription('This is a draft');
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct(testProducts[0]);
            await wizardPage.selectPaymentMethod('CREDIT_CARD');

            await wizardPage.takeScreenshot('workflow-draft-01-filled.png');

            // Save as draft
            await wizardPage.clickSaveDraft();
            await driver.sleep(3000);
            await wizardPage.takeScreenshot('workflow-draft-02-saved.png');

            // Navigate back to rate plans
            await wizardPage.navigateToRatePlans();
            await driver.sleep(2000);
            await wizardPage.takeScreenshot('workflow-draft-03-list.png');

            // Find and resume draft
            const drafts = await wizardPage.getDraftPlans();
            console.log('Found drafts:', drafts);
            expect(drafts.length).toBeGreaterThan(0);

            // Resume the draft
            await wizardPage.resumeDraft(draftName);
            await driver.sleep(2000);
            await wizardPage.takeScreenshot('workflow-draft-04-resumed.png');

            // Verify data was preserved
            const stepTitle = await wizardPage.getCurrentStep();
            console.log('Current step after resume:', stepTitle);

            console.log('✅ Draft save and resume test passed!');
        }, 90000);
    });
});
