const WebDriverManager = require('../config/webdriver');
const RatePlanWizardPage = require('../pages/RatePlanWizardPage');
const LoginPage = require('../pages/LoginPage');
const { By } = require('selenium-webdriver');

/**
 * STEP 1 VALIDATION TESTS - Plan Details
 * 
 * Tests all validation rules for Step 1 of the rate plan creation wizard.
 */

describe('Step 1: Plan Details Validation', () => {
    let driverManager;
    let driver;
    let wizardPage;

    const testEmail = process.env.TEST_EMAIL || 'shyambss07@ai.ai';
    const testPassword = process.env.TEST_PASSWORD || '^j$GfNQm';

    beforeAll(async () => {
        console.log('🚀 Setting up Step 1 Validation Tests');
        driverManager = new WebDriverManager();
        driver = await driverManager.createDriver();
        wizardPage = new RatePlanWizardPage(driver);

        // Login
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
        } catch (error) {
            console.log('⚠️ Login may have failed or already logged in');
        }
    }, 60000);

    afterAll(async () => {
        if (driverManager) {
            await driverManager.quitDriver();
        }
    }, 10000);

    beforeEach(async () => {
        // Start fresh wizard for each test
        await wizardPage.navigateToRatePlans();
        await wizardPage.clickCreateRatePlan();
    });

    describe('✅ Required Field Validations', () => {
        test('should require plan name', async () => {
            console.log('🧪 Testing: Plan Name Required');

            // Fill all except plan name
            await wizardPage.fillPlanDescription('Test description');
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct('API Gateway');
            await wizardPage.selectPaymentMethod('CREDIT_CARD');

            await wizardPage.clickNext();

            const errors = await wizardPage.getErrors();
            const hasNameError = errors.some(err => err.includes('required') || err.includes('Plan name'));
            expect(hasNameError).toBe(true);

            await wizardPage.takeScreenshot('step1-validation-name-required.png');
            console.log('✅ Plan name validation works');
        }, 30000);

        test('should require billing frequency', async () => {
            console.log('🧪 Testing: Billing Frequency Required');

            await wizardPage.fillPlanName('Test Plan');
            await wizardPage.selectProduct('API Gateway');
            await wizardPage.selectPaymentMethod('CREDIT_CARD');

            await wizardPage.clickNext();

            const errors = await wizardPage.getErrors();
            const hasFrequencyError = errors.some(err =>
                err.includes('required') || err.includes('frequency') || err.includes('billing')
            );
            expect(hasFrequencyError).toBe(true);

            await wizardPage.takeScreenshot('step1-validation-frequency-required.png');
            console.log('✅ Billing frequency validation works');
        }, 30000);

        test('should require product selection', async () => {
            console.log('🧪 Testing: Product Required');

            await wizardPage.fillPlanName('Test Plan');
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectPaymentMethod('CREDIT_CARD');

            await wizardPage.clickNext();

            const errors = await wizardPage.getErrors();
            const hasProductError = errors.some(err =>
                err.includes('required') || err.includes('product')
            );
            expect(hasProductError).toBe(true);

            await wizardPage.takeScreenshot('step1-validation-product-required.png');
            console.log('✅ Product validation works');
        }, 30000);

        test('should require payment method', async () => {
            console.log('🧪 Testing: Payment Method Required');

            await wizardPage.fillPlanName('Test Plan');
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct('API Gateway');

            await wizardPage.clickNext();

            const errors = await wizardPage.getErrors();
            const hasPaymentError = errors.some(err =>
                err.includes('required') || err.includes('payment')
            );
            expect(hasPaymentError).toBe(true);

            await wizardPage.takeScreenshot('step1-validation-payment-required.png');
            console.log('✅ Payment method validation works');
        }, 30000);
    });

    describe('✅ Field Constraints', () => {
        test('should accept valid plan names', async () => {
            console.log('🧪 Testing: Valid Plan Names');

            const validNames = [
                'Standard Plan',
                'Premium-Plan-2024',
                'Plan_with_underscores',
                'Plan 123',
            ];

            for (const name of validNames) {
                await wizardPage.fillPlanName(name);
                await wizardPage.fillPlanDescription('Test');
                await wizardPage.selectBillingFrequency('MONTHLY');
                await wizardPage.selectProduct('API Gateway');
                await wizardPage.selectPaymentMethod('CREDIT_CARD');

                const isNextEnabled = await wizardPage.isNextButtonEnabled();
                expect(isNextEnabled).toBe(true);

                console.log(`✅ Accepted name: "${name}"`);

                // Reset for next iteration
                await wizardPage.navigateToRatePlans();
                await wizardPage.clickCreateRatePlan();
            }

            await wizardPage.takeScreenshot('step1-validation-names-accepted.png');
            console.log('✅ All valid names accepted');
        }, 60000);

        test('should handle special characters in description', async () => {
            console.log('🧪 Testing: Special Characters in Description');

            const specialDesc = 'Plan with $pecial ch@racters & symbols: (test) #123 50%';

            await wizardPage.fillPlanName('Test Plan');
            await wizardPage.fillPlanDescription(specialDesc);
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct('API Gateway');
            await wizardPage.selectPaymentMethod('CREDIT_CARD');

            await wizardPage.clickNext();
            await driver.sleep(2000);

            // Should proceed without errors
            const currentStep = await wizardPage.getCurrentStep();
            expect(currentStep).not.toContain('Plan Details');

            await wizardPage.takeScreenshot('step1-validation-special-chars.png');
            console.log('✅ Special characters handled correctly');
        }, 30000);
    });

    describe('✅ Navigation Controls', () => {
        test('should prevent Next without required fields', async () => {
            console.log('🧪 Testing: Next Button Blocking');

            // Empty form
            await wizardPage.clickNext();
            await driver.sleep(1000);

            const errors = await wizardPage.getErrors();
            expect(errors.length).toBeGreaterThan(0);

            // Current step should still be Plan Details
            const currentStep = await wizardPage.getCurrentStep();
            expect(currentStep).toContain('Plan Details');

            await wizardPage.takeScreenshot('step1-validation-next-blocked.png');
            console.log('✅ Next button correctly blocked');
        }, 30000);

        test('should enable Next when all fields filled', async () => {
            console.log('🧪 Testing: Next Button Enabled');

            await wizardPage.fillPlanName('Complete Plan');
            await wizardPage.fillPlanDescription('All fields filled');
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct('API Gateway');
            await wizardPage.selectPaymentMethod('CREDIT_CARD');

            const isNextEnabled = await wizardPage.isNextButtonEnabled();
            expect(isNextEnabled).toBe(true);

            await wizardPage.clickNext();
            await driver.sleep(2000);

            // Should have moved to Step 2
            const currentStep = await wizardPage.getCurrentStep();
            expect(currentStep).toContain('Billable');

            await wizardPage.takeScreenshot('step1-validation-next-enabled.png');
            console.log('✅ Next button correctly enabled');
        }, 30000);

        test('should lock subsequent steps until Step 1 complete', async () => {
            console.log('🧪 Testing: Step Locking');

            // Try to click sidebar step 2 (Billable Metrics)
            const isStep2Locked = await wizardPage.isStepLocked(1);
            expect(isStep2Locked).toBe(true);

            // Try to click sidebar step 3 (Pricing)
            const isStep3Locked = await wizardPage.isStepLocked(2);
            expect(isStep3Locked).toBe(true);

            await wizardPage.takeScreenshot('step1-validation-steps-locked.png');

            // Now complete Step 1
            await wizardPage.fillPlanName('Unlock Test');
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct('API Gateway');
            await wizardPage.selectPaymentMethod('CREDIT_CARD');
            await wizardPage.clickNext();
            await driver.sleep(2000);

            // Now Step 2 should be accessible
            const isStep2UnlockedAfter = await wizardPage.isStepLocked(1);
            expect(isStep2UnlockedAfter).toBe(false);

            await wizardPage.takeScreenshot('step1-validation-step2-unlocked.png');
            console.log('✅ Step locking works correctly');
        }, 40000);
    });

    describe('✅ Data Persistence', () => {
        test('should preserve data when navigating back', async () => {
            console.log('🧪 Testing: Data Persistence on Back Navigation');

            const planName = 'Persistence Test ' + Date.now();
            const description = 'Testing data persistence';

            // Fill Step 1
            await wizardPage.fillPlanName(planName);
            await wizardPage.fillPlanDescription(description);
            await wizardPage.selectBillingFrequency('MONTHLY');
            await wizardPage.selectProduct('API Gateway');
            await wizardPage.selectPaymentMethod('CREDIT_CARD');

            await wizardPage.takeScreenshot('step1-validation-filled.png');
            await wizardPage.clickNext();
            await driver.sleep(2000);

            // Navigate back
            await wizardPage.clickBack();
            await driver.sleep(2000);

            // Verify data is still there
            const nameInput = await driver.findElement(wizardPage.selectors.planNameInput);
            const preservedName = await nameInput.getAttribute('value');
            expect(preservedName).toBe(planName);

            const descInput = await driver.findElement(wizardPage.selectors.planDescriptionInput);
            const preservedDesc = await descInput.getAttribute('value');
            expect(preservedDesc).toBe(description);

            await wizardPage.takeScreenshot('step1-validation-data-preserved.png');
            console.log('✅ Data correctly preserved on back navigation');
        }, 40000);
    });
});
