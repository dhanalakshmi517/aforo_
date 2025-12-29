// product-creation.test.js - Product Module Tests
const WebDriverManager = require('../config/webdriver');
const LoginPage = require('../pages/LoginPage');
const ProductPage = require('../pages/ProductPage');

describe('Product Module - Creation Tests', () => {
    let driver;
    let driverManager;
    let loginPage;
    let productPage;
    const testEmail = process.env.TEST_EMAIL || 'Mountain_think@space.ai';
    const testPassword = process.env.TEST_PASSWORD || 'oUN*5X3V';

    beforeAll(async () => {
        console.log('🚀 Setting up Product Module tests');
        driverManager = new WebDriverManager();
        driver = await driverManager.createDriver();
        loginPage = new LoginPage(driver);
        productPage = new ProductPage(driver);
    });

    afterAll(async () => {
        console.log('🧹 Cleaning up Product tests');
        if (driverManager) {
            await driverManager.quitDriver();
        }
    });

    describe('Prerequisites', () => {
        test('should login successfully', async () => {
            await loginPage.navigateToLogin();
            await loginPage.login(testEmail, testPassword);
            await driver.sleep(3000);
            const url = await driver.getCurrentUrl();
            expect(url).not.toContain('/signin');
        }, 30000);

        test('should navigate to Products page', async () => {
            await productPage.navigateToProducts();
            await driver.sleep(2000);
            await productPage.takeScreenshot('products-list-loaded.png');
        }, 20000);
    });

    describe('Create API Product', () => {
        test('should open Create Product wizard', async () => {
            await productPage.clickCreateProduct();
            await driver.sleep(1000);
            await productPage.takeScreenshot('product-wizard-step1.png');
        }, 15000);

        test('should fill General Details (Step 1)', async () => {
            const timestamp = Date.now();
            await productPage.fillGeneralDetails(
                `API Product ${timestamp}`,
                '1.0.0',
                'Automated test API product description'
            );
            await productPage.clickSaveAndNext();
            await productPage.takeScreenshot('product-wizard-step2.png');
        }, 20000);

        test('should fill Configuration (Step 2 - API)', async () => {
            // Select API Type
            await productPage.selectProductType('API');

            // Fill API specific fields
            await productPage.fillConfigurationFields({
                'Endpoint URL': 'https://api.test.com/v1/resource',
                'Auth Type': 'None' // Value 'NONE' in option value, but check how select works (usually sends value or text)
            });

            await productPage.clickSaveAndNext();
            await productPage.takeScreenshot('product-wizard-step3.png');
        }, 20000);

        test('should review and create product (Step 3)', async () => {
            await productPage.clickCreate();
            await driver.sleep(3000);

            // Check for success state
            const success = await productPage.verifySuccess();
            expect(success).toBe(true);

            await productPage.takeScreenshot('product-creation-success.png');
        }, 30000);
    });
});
