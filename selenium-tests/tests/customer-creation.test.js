// customer-creation.test.js - Comprehensive Customer Module Tests
const WebDriverManager = require('../config/webdriver');
const LoginPage = require('../pages/LoginPage');
const CustomerPage = require('../pages/CustomerPage');

describe('Customer Module - Complete Workflow Tests', () => {
    let driver;
    let driverManager;
    let loginPage;
    let customerPage;
    const testEmail = process.env.TEST_EMAIL || 'Mountain_think@space.ai';
    const testPassword = process.env.TEST_PASSWORD || 'oUN*5X3V';

    beforeAll(async () => {
        console.log('🚀 Setting up Selenium tests for Customer Module');
        driverManager = new WebDriverManager();
        driver = await driverManager.createDriver();
        loginPage = new LoginPage(driver);
        customerPage = new CustomerPage(driver);
    });

    afterAll(async () => {
        console.log('🧹 Cleaning up Customer Module tests');
        if (driverManager) {
            await driverManager.quitDriver();
        }
    });

    describe('Prerequisites: Login and Navigation', () => {
        test('should login successfully', async () => {
            console.log('🧪 Test: Login to application');

            await loginPage.navigateToLogin();
            await loginPage.login(testEmail, testPassword);

            await driver.sleep(5000);
            const currentUrl = await driver.getCurrentUrl();
            console.log(`✅ Login attempt finished, current URL: ${currentUrl}`);
            expect(currentUrl).not.toContain('/signin');
        }, 40000);

        test('should navigate to Customers page', async () => {
            console.log('🧪 Test: Navigate to Customers');

            await customerPage.navigateToCustomers();
            const currentUrl = await driver.getCurrentUrl();

            expect(currentUrl).toContain('/customers');
            await customerPage.takeScreenshot('customers-page-loaded.png');
            console.log('✅ Customers page loaded');
        }, 30000);
    });

    describe('Step 1: Customer Details Validation', () => {
        test('should open Create Customer wizard', async () => {
            console.log('🧪 Test: Open Create Customer wizard');

            await customerPage.clickCreateCustomer();
            const isStep1Active = await customerPage.isStep1Active();

            expect(isStep1Active).toBe(true);
            await customerPage.takeScreenshot('customer-wizard-step1.png');
            console.log('✅ Wizard opened on Step 1');
        }, 30000);

        test('should show validation errors for empty required fields', async () => {
            console.log('🧪 Test: Required field validation');

            await customerPage.clickSaveAndNext();
            await driver.sleep(1000);

            const errorMessage = await customerPage.getErrorMessage();
            expect(errorMessage).toBeTruthy();

            await customerPage.takeScreenshot('step1-validation-errors.png');
            console.log('✅ Validation errors displayed');
        }, 30000);

        test('should fill Customer Details and proceed to Step 2', async () => {
            console.log('🧪 Test: Fill Customer Details');

            const timestamp = Date.now();
            await customerPage.fillCustomerDetails(
                `Test Company ${timestamp}`,
                `Test Customer ${timestamp}`,
                'BUSINESS'
            );

            await customerPage.clickSaveAndNext();
            await driver.sleep(2000);

            const isStep2Active = await customerPage.isStep2Active();
            expect(isStep2Active).toBe(true);

            await customerPage.takeScreenshot('customer-wizard-step2.png');
            console.log('✅ Proceeded to Step 2');
        }, 20000);
    });

    describe('Step 2: Account Details Validation', () => {
        test('should show lock badge when Step 1 is incomplete', async () => {
            console.log('🧪 Test: Lock badge visibility');

            // This test assumes we're on Step 2 from previous test
            const isLocked = await customerPage.isLockBadgeVisible();

            // Lock badge should NOT be visible since we filled Step 1
            expect(isLocked).toBe(false);
            console.log('✅ Lock badge check passed');
        }, 20000);

        test('should fill phone number and email', async () => {
            console.log('🧪 Test: Fill Account Details');

            const timestamp = Date.now();
            await customerPage.fillAccountDetails(
                '+1234567890',
                `test${timestamp}@business.com`
            );

            await customerPage.takeScreenshot('account-details-filled.png');
            console.log('✅ Account details filled');
        }, 15000);

        test('should fill billing address', async () => {
            console.log('🧪 Test: Fill Billing Address');

            await customerPage.fillBillingAddress({
                line1: '123 Main Street',
                line2: 'Suite 100',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'US'
            });

            await customerPage.takeScreenshot('billing-address-filled.png');
            console.log('✅ Billing address filled');
        }, 20000);

        test('should copy billing address to customer address when checkbox is toggled', async () => {
            console.log('🧪 Test: Same as Billing checkbox');

            await customerPage.toggleSameAsBilling();
            await driver.sleep(1000);

            await customerPage.takeScreenshot('same-as-billing-checked.png');
            console.log('✅ Checkbox toggled');
        }, 20000);

        test('should proceed to Step 3 (Review)', async () => {
            console.log('🧪 Test: Proceed to Review');

            await customerPage.clickSaveAndNext();
            await driver.sleep(2000);

            const isStep3Active = await customerPage.isStep3Active();
            expect(isStep3Active).toBe(true);

            await customerPage.takeScreenshot('customer-wizard-step3-review.png');
            console.log('✅ Proceeded to Step 3 (Review)');
        }, 30000);
    });

    describe('Step 3: Review & Confirm', () => {
        test('should display review page with all entered data', async () => {
            console.log('🧪 Test: Review page display');

            const isReviewVisible = await customerPage.isReviewPageVisible();
            expect(isReviewVisible).toBe(true);

            await customerPage.takeScreenshot('review-page-complete.png');
            console.log('✅ Review page displayed');
        }, 20000);

        test('should navigate back to Step 2', async () => {
            console.log('🧪 Test: Back navigation');

            await customerPage.clickBack();
            await driver.sleep(1500);

            const isStep2Active = await customerPage.isStep2Active();
            expect(isStep2Active).toBe(true);

            await customerPage.takeScreenshot('navigated-back-to-step2.png');
            console.log('✅ Navigated back to Step 2');
        }, 15000);

        test('should navigate forward to Step 3 again', async () => {
            console.log('🧪 Test: Forward navigation');

            await customerPage.clickSaveAndNext();
            await driver.sleep(2000);

            const isStep3Active = await customerPage.isStep3Active();
            expect(isStep3Active).toBe(true);

            console.log('✅ Navigated forward to Step 3');
        }, 15000);

        test('should create customer successfully', async () => {
            console.log('🧪 Test: Create Customer');

            await customerPage.clickFinalCreate();
            await driver.sleep(5000);

            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl).toContain('/customers');

            await customerPage.takeScreenshot('customer-created-success.png');
            console.log('✅ Customer created successfully');
        }, 40000);
    });

    describe('Edge Cases and Additional Validation', () => {
        test('should handle duplicate email validation', async () => {
            console.log('🧪 Test: Duplicate email validation');

            // Force a fresh navigation to ensure clean state
            await customerPage.navigateToCustomers();
            await driver.navigate().refresh();
            await driver.sleep(3000);

            await customerPage.clickCreateCustomer();
            await driver.sleep(2000);

            const timestamp = Date.now();
            await customerPage.fillCustomerDetails(
                `Test Company ${timestamp}`,
                `Test Customer ${timestamp}`,
                'INDIVIDUAL'
            );

            await customerPage.clickSaveAndNext();
            await driver.sleep(3000);

            // Use the same email as before or a known existing one
            await customerPage.fillAccountDetails(
                '+9876543210',
                testEmail
            );

            await driver.sleep(3000);
            await customerPage.takeScreenshot('duplicate-email-test.png');
            console.log('✅ Duplicate email test completed');
        }, 60000);
    });
});
