const WebDriverManager = require('../config/webdriver');
const LoginPage = require('../pages/LoginPage');

describe('Sign-in Credential Handling After Contact Sales Registration', () => {
    let driverManager;
    let driver;
    let loginPage;

    // Test setup
    beforeAll(async () => {
        console.log('🚀 Setting up Selenium tests for Sign-in Credential Handling');

        driverManager = new WebDriverManager();
        driver = await driverManager.createDriver();
        loginPage = new LoginPage(driver);
    }, 30000); // 30 second timeout for setup

    // Test cleanup
    afterAll(async () => {
        console.log('🧹 Cleaning up Sign-in Credential tests');
        if (driverManager) {
            await driverManager.quitDriver();
        }
    }, 10000);

    describe('Verify sign-in credential handling after Contact Sales registration', () => {
        beforeEach(async () => {
            console.log('📋 Precondition: Contact Sales registration is completed and user has test credentials');
            await loginPage.navigateToLogin();
            await loginPage.waitForPageLoad();
        });

        test('Invalid credentials case: Shows "Invalid credentials" error and user remains on sign-in page', async () => {
            console.log('🧪 Running: Invalid Credentials Test');
            console.log('Step 1: Open the sign-in page');

            // Verify we're on the sign-in page
            const currentUrl = await loginPage.getCurrentUrl();
            expect(currentUrl).toContain('/signin');
            console.log('✅ Sign-in page is open');

            console.log('Step 2: Enter the test username and password (invalid credentials)');
            const invalidEmail = 'invalid@business.com';
            const invalidPassword = 'wrongpassword123';

            await loginPage.fillEmail(invalidEmail);
            await loginPage.fillPassword(invalidPassword);
            console.log(`✅ Entered credentials: ${invalidEmail} / ${invalidPassword}`);

            console.log('Step 3: Click the sign-in / submit button');
            await loginPage.clickLoginButton();
            console.log('✅ Clicked sign-in button');

            // Wait a moment for the error to appear
            await driver.sleep(2000);

            console.log('Expected Result: The page shows the error text "Invalid credentials"');
            const errorMessage = await loginPage.getGeneralError();
            expect(errorMessage).toBe('Invalid credentials');
            console.log(`✅ Error message displayed: "${errorMessage}"`);

            console.log('Expected Result: User remains on the sign-in page');
            const finalUrl = await loginPage.getCurrentUrl();
            expect(finalUrl).toContain('/signin');
            console.log('✅ User remains on sign-in page');

            // Take screenshot for documentation
            await loginPage.takeScreenshot('invalid-credentials-error.png');
            console.log('✅ Passed: Invalid Credentials Test');
        }, 20000);

        test('Valid credentials case: User is redirected to the Get Started page', async () => {
            console.log('🧪 Running: Valid Credentials Test');
            console.log('Step 1: Open the sign-in page');

            // Verify we're on the sign-in page
            const currentUrl = await loginPage.getCurrentUrl();
            expect(currentUrl).toContain('/signin');
            console.log('✅ Sign-in page is open');

            console.log('Step 2: Enter the test username and password (valid credentials)');

            // Use environment variables or default test credentials
            const validEmail = process.env.TEST_EMAIL || 'test@business.com';
            const validPassword = process.env.TEST_PASSWORD || 'password123';

            // Skip test if using default placeholder credentials
            if (validEmail === 'test@business.com') {
                console.log('⚠️ Skipping valid credentials test - no real credentials provided');
                console.log('💡 To run this test, set TEST_EMAIL and TEST_PASSWORD environment variables');
                console.log('   Example: TEST_EMAIL=user@company.com TEST_PASSWORD=yourpassword npm test');
                return;
            }

            await loginPage.fillEmail(validEmail);
            await loginPage.fillPassword(validPassword);
            console.log(`✅ Entered credentials: ${validEmail} / ********`);

            console.log('Step 3: Click the sign-in / submit button');
            await loginPage.clickLoginButton();
            console.log('✅ Clicked sign-in button');

            console.log('Expected Result: User is redirected to the Get Started page');

            // Wait for redirect to get-started
            try {
                await driver.wait(async () => {
                    const url = await driver.getCurrentUrl();
                    return url.includes('/get-started');
                }, 10000);

                const finalUrl = await loginPage.getCurrentUrl();
                expect(finalUrl).toContain('/get-started');
                console.log(`✅ User redirected to Get Started page: ${finalUrl}`);

                // Take screenshot for documentation
                await loginPage.takeScreenshot('valid-credentials-get-started.png');
                console.log('✅ Passed: Valid Credentials Test');
            } catch (error) {
                console.log('❌ Failed to redirect to Get Started page');
                await loginPage.takeScreenshot('valid-credentials-failed.png');

                // Check if there's an error message
                const errorMessage = await loginPage.getGeneralError();
                if (errorMessage) {
                    console.log(`❌ Error message: ${errorMessage}`);
                }

                throw error;
            }
        }, 20000);

        test('Alternative validation: Check for Get Started page element presence', async () => {
            console.log('🧪 Running: Get Started Element Presence Test');
            console.log('This test validates the alternative success criteria: Get Started element is present');

            const validEmail = process.env.TEST_EMAIL || 'test@business.com';
            const validPassword = process.env.TEST_PASSWORD || 'password123';

            // Skip test if using default placeholder credentials
            if (validEmail === 'test@business.com') {
                console.log('⚠️ Skipping Get Started element test - no real credentials provided');
                return;
            }

            console.log('Step 1: Open the sign-in page');
            const currentUrl = await loginPage.getCurrentUrl();
            expect(currentUrl).toContain('/signin');

            console.log('Step 2: Enter valid credentials');
            await loginPage.fillEmail(validEmail);
            await loginPage.fillPassword(validPassword);

            console.log('Step 3: Click the sign-in button');
            await loginPage.clickLoginButton();

            console.log('Expected Result: Get Started page element is present or URL contains /get-started');

            try {
                // Wait for either URL change or get-started element
                await driver.wait(async () => {
                    const url = await driver.getCurrentUrl();
                    if (url.includes('/get-started')) {
                        return true;
                    }

                    // Try to find a get-started-specific element
                    try {
                        const { By } = require('selenium-webdriver');
                        const getStartedElement = await driver.findElement(By.css('[class*="getstarted"]'));
                        return await getStartedElement.isDisplayed();
                    } catch (e) {
                        return false;
                    }
                }, 10000);

                const finalUrl = await loginPage.getCurrentUrl();
                console.log(`✅ Success criteria met. Current URL: ${finalUrl}`);

                await loginPage.takeScreenshot('get-started-element-present.png');
                console.log('✅ Passed: Get Started Element Presence Test');
            } catch (error) {
                console.log('❌ Neither Get Started URL nor Get Started element found');
                await loginPage.takeScreenshot('get-started-element-failed.png');
                throw error;
            }
        }, 20000);
    });

    describe('Edge Cases and Additional Validation', () => {
        beforeEach(async () => {
            await loginPage.navigateToLogin();
            await loginPage.waitForPageLoad();
        });

        test('Should show "Invalid credentials" for valid email format but wrong password', async () => {
            console.log('🧪 Running: Valid Email Format, Wrong Password Test');

            await loginPage.fillEmail('user@company.com');
            await loginPage.fillPassword('wrongpassword');
            await loginPage.clickLoginButton();

            await driver.sleep(2000);

            const errorMessage = await loginPage.getGeneralError();
            expect(errorMessage).toBe('Invalid credentials');

            const currentUrl = await loginPage.getCurrentUrl();
            expect(currentUrl).toContain('/signin');

            console.log('✅ Passed: Valid Email Format, Wrong Password Test');
        }, 15000);

        test('Should show "Invalid credentials" for non-existent user', async () => {
            console.log('🧪 Running: Non-existent User Test');

            await loginPage.fillEmail('nonexistent@company.com');
            await loginPage.fillPassword('anypassword123');
            await loginPage.clickLoginButton();

            await driver.sleep(2000);

            const errorMessage = await loginPage.getGeneralError();
            expect(errorMessage).toBe('Invalid credentials');

            const currentUrl = await loginPage.getCurrentUrl();
            expect(currentUrl).toContain('/signin');

            console.log('✅ Passed: Non-existent User Test');
        }, 15000);

        test('Error message should be visible and properly styled', async () => {
            console.log('🧪 Running: Error Message Visibility Test');

            await loginPage.fillEmail('test@company.com');
            await loginPage.fillPassword('wrongpass');
            await loginPage.clickLoginButton();

            await driver.sleep(2000);

            const { By } = require('selenium-webdriver');
            const errorElement = await driver.findElement(By.css('.error-msg'));

            const isDisplayed = await errorElement.isDisplayed();
            expect(isDisplayed).toBe(true);

            const errorText = await errorElement.getText();
            expect(errorText).toBe('Invalid credentials');

            await loginPage.takeScreenshot('error-message-styled.png');
            console.log('✅ Passed: Error Message Visibility Test');
        }, 15000);
    });
});
