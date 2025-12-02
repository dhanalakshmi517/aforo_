const WebDriverManager = require('../config/webdriver');
const OrganizationPage = require('../pages/OrganizationPage');

/**
 * FAILED TEST CASES - Organization Page
 * 
 * These tests verify that the current implementation FAILS to meet the requirements:
 * 1. Country flag must be correct
 * 2. Phone field must be disabled if flag is missing/wrong
 * 3. Submit button must be disabled if conditions aren't met
 * 
 * Expected: All tests should FAIL (showing bugs exist)
 */

describe('Organization Page - FAILED Requirements Tests', () => {
    let driverManager;
    let driver;
    let orgPage;

    beforeAll(async () => {
        console.log('🚨 Setting up FAILED test cases for Organization Page');
        console.log('⚠️ These tests are EXPECTED to FAIL - they demonstrate bugs');
        driverManager = new WebDriverManager();
        driver = await driverManager.createDriver();
        orgPage = new OrganizationPage(driver);
    }, 30000);

    afterAll(async () => {
        console.log('🧹 Cleaning up failed tests');
        if (driverManager) {
            await driverManager.quitDriver();
        }
    }, 10000);

    describe('❌ REQUIREMENT 1: Correct Country Flag Display', () => {
        beforeEach(async () => {
            await orgPage.navigateToOrganization();
        });

        test('SHOULD FAIL: Country flag must match selected country (US)', async () => {
            console.log('🧪 Running: Flag Correctness Test for US');
            console.log('📋 Requirement: Flag must show "fi fi-us" for United States');

            // Select United States
            await orgPage.selectCountry('US');
            await driver.sleep(1000);

            // Get the flag class
            const flagClass = await orgPage.getFlagIconClass();
            console.log(`🚩 Expected: "fi fi-us"`);
            console.log(`🚩 Actual: "${flagClass}"`);

            await orgPage.takeScreenshot('failed-us-flag-incorrect.png');

            // This assertion SHOULD FAIL because of the bug
            expect(flagClass).toContain('fi-us');

            console.log('❌ TEST FAILED: Wrong flag displayed!');
        }, 20000);

        test('SHOULD FAIL: Country flag must match selected country (India)', async () => {
            console.log('🧪 Running: Flag Correctness Test for India');
            console.log('📋 Requirement: Flag must show "fi fi-in" for India');

            // Select India
            await orgPage.selectCountry('IN');
            await driver.sleep(1000);

            // Get the flag class
            const flagClass = await orgPage.getFlagIconClass();
            console.log(`🚩 Expected: "fi fi-in"`);
            console.log(`🚩 Actual: "${flagClass}"`);

            await orgPage.takeScreenshot('failed-india-flag-incorrect.png');

            // This assertion SHOULD FAIL because of the bug
            expect(flagClass).toContain('fi-in');

            console.log('❌ TEST FAILED: Wrong flag displayed!');
        }, 20000);

        test('SHOULD FAIL: Flag must exist when country is selected', async () => {
            console.log('🧪 Running: Flag Existence Test');
            console.log('📋 Requirement: Flag icon must be visible and have correct class');

            // Select any country
            await orgPage.selectCountry('GB'); // United Kingdom
            await driver.sleep(1000);

            const flagClass = await orgPage.getFlagIconClass();

            // Flag should exist and have the fi class
            expect(flagClass).not.toBeNull();
            expect(flagClass).toContain('fi');
            expect(flagClass).toContain('fi-gb');

            await orgPage.takeScreenshot('failed-flag-existence.png');
            console.log('❌ TEST FAILED: Flag missing or incorrect!');
        }, 20000);
    });

    describe('❌ REQUIREMENT 2: Phone Field Must Be Disabled Without Valid Flag', () => {
        beforeEach(async () => {
            await orgPage.navigateToOrganization();
        });

        test('SHOULD FAIL: Phone input must be disabled when no country selected', async () => {
            console.log('🧪 Running: Phone Disabled Without Country Test');
            console.log('📋 Requirement: Phone field must NOT accept input without country');

            // Don't select any country
            const phoneInput = await orgPage.getPhoneInput();

            // Try to type in phone field
            try {
                await phoneInput.sendKeys('1234567890');
                const value = await phoneInput.getAttribute('value');

                console.log(`📱 Phone input value: "${value}"`);

                // This should FAIL - phone field should be disabled
                expect(value).toBe(''); // Should not accept any input

                await orgPage.takeScreenshot('failed-phone-not-disabled-no-country.png');
                console.log('❌ TEST FAILED: Phone field accepts input without country!');
            } catch (error) {
                console.log('✅ Phone field is properly disabled');
                throw error;
            }
        }, 20000);

        test('SHOULD FAIL: Phone input must be disabled when wrong flag is shown', async () => {
            console.log('🧪 Running: Phone Disabled With Wrong Flag Test');
            console.log('📋 Requirement: Phone field must be disabled if flag is incorrect');

            // Select US (which shows wrong flag - AU)
            await orgPage.selectCountry('US');
            await driver.sleep(1000);

            const flagClass = await orgPage.getFlagIconClass();
            console.log(`🚩 Flag class: "${flagClass}"`);

            // If flag is wrong, phone should be disabled
            if (!flagClass || !flagClass.includes('fi-us')) {
                console.log('⚠️ Wrong flag detected - phone should be disabled');

                const phoneInput = await orgPage.getPhoneInput();
                const isDisabled = !(await phoneInput.isEnabled());

                // This should FAIL - phone is NOT disabled despite wrong flag
                expect(isDisabled).toBe(true);

                await orgPage.takeScreenshot('failed-phone-enabled-wrong-flag.png');
                console.log('❌ TEST FAILED: Phone field is enabled despite wrong flag!');
            }
        }, 20000);

        test('SHOULD FAIL: Phone input must reject typing when flag is missing', async () => {
            console.log('🧪 Running: Phone Input Rejection Test');
            console.log('📋 Requirement: Phone must not accept ANY input without valid flag');

            // Try to type without selecting country
            const phoneInput = await orgPage.getPhoneInput();

            await phoneInput.clear();
            await phoneInput.sendKeys('9876543210');

            const value = await phoneInput.getAttribute('value');
            console.log(`📱 Phone value after typing: "${value}"`);

            // Should be empty or disabled
            expect(value).toBe('');

            await orgPage.takeScreenshot('failed-phone-accepts-input.png');
            console.log('❌ TEST FAILED: Phone accepts input without valid flag!');
        }, 20000);
    });

    describe('❌ REQUIREMENT 3: Submit Button Must Be Disabled', () => {
        beforeEach(async () => {
            await orgPage.navigateToOrganization();
        });

        test('SHOULD FAIL: Submit button disabled when flag is wrong', async () => {
            console.log('🧪 Running: Submit Button Disabled With Wrong Flag Test');
            console.log('📋 Requirement: Button must be disabled if flag is incorrect');

            // Fill all required fields
            await orgPage.fillFirstName('John');
            await orgPage.fillLastName('Doe');
            await orgPage.fillEmail('john@testcompany.com');
            await orgPage.fillCompany('Test Corp');
            await orgPage.selectRole('CEO');
            await orgPage.selectEmpSize('_11_50');

            // Select US (triggers wrong flag bug)
            await orgPage.selectCountry('US');
            await driver.sleep(1000);

            const flagClass = await orgPage.getFlagIconClass();
            console.log(`🚩 Flag class: "${flagClass}"`);

            // Fill phone
            await orgPage.fillPhone('1234567890');

            // Get submit button state
            const submitButton = await orgPage.getSubmitButton();
            const isDisabled = !(await submitButton.isEnabled());

            console.log(`🔘 Submit button disabled: ${isDisabled}`);

            // If flag is wrong, button MUST be disabled
            if (!flagClass || !flagClass.includes('fi-us')) {
                expect(isDisabled).toBe(true);
                console.log('❌ TEST FAILED: Submit button is enabled despite wrong flag!');
            }

            await orgPage.takeScreenshot('failed-submit-enabled-wrong-flag.png');
        }, 25000);

        test('SHOULD FAIL: Submit button disabled without country selection', async () => {
            console.log('🧪 Running: Submit Button Disabled Without Country Test');
            console.log('📋 Requirement: Button must be disabled without country');

            // Fill all fields EXCEPT country
            await orgPage.fillFirstName('Jane');
            await orgPage.fillLastName('Smith');
            await orgPage.fillEmail('jane@company.com');
            await orgPage.fillCompany('Company Inc');
            await orgPage.selectRole('CTO');
            await orgPage.selectEmpSize('_51_100');

            // Don't select country

            // Get submit button state
            const submitButton = await orgPage.getSubmitButton();
            const isEnabled = await submitButton.isEnabled();

            console.log(`🔘 Submit button enabled: ${isEnabled}`);

            // Button should be disabled
            expect(isEnabled).toBe(false);

            await orgPage.takeScreenshot('failed-submit-enabled-no-country.png');
            console.log('❌ TEST FAILED: Submit button enabled without country!');
        }, 25000);

        test('SHOULD FAIL: Submit button only enabled with BOTH conditions met', async () => {
            console.log('🧪 Running: Submit Button Both Conditions Test');
            console.log('📋 Requirement: Button enabled ONLY when flag is correct AND phone is valid');

            // Fill all fields
            await orgPage.fillFirstName('Alice');
            await orgPage.fillLastName('Johnson');
            await orgPage.fillEmail('alice@validcompany.com');
            await orgPage.fillCompany('Valid Company');
            await orgPage.selectRole('MANAGER');
            await orgPage.selectEmpSize('_101_500');

            // Select US (wrong flag)
            await orgPage.selectCountry('US');
            await driver.sleep(1000);

            const flagClass = await orgPage.getFlagIconClass();
            console.log(`🚩 Flag class: "${flagClass}"`);

            // Fill phone
            await orgPage.fillPhone('5551234567');

            const submitButton = await orgPage.getSubmitButton();
            const isEnabled = await submitButton.isEnabled();

            console.log(`🔘 Submit button enabled: ${isEnabled}`);

            // If flag is wrong (not fi-us), button MUST be disabled
            const flagIsCorrect = flagClass && flagClass.includes('fi-us');

            if (!flagIsCorrect) {
                expect(isEnabled).toBe(false);
                console.log('❌ TEST FAILED: Button enabled even though flag is wrong!');
            } else {
                expect(isEnabled).toBe(true);
                console.log('✅ Button correctly enabled with valid flag');
            }

            await orgPage.takeScreenshot('failed-submit-both-conditions.png');
        }, 25000);

        test('SHOULD FAIL: Cannot submit form with incorrect flag', async () => {
            console.log('🧪 Running: Form Submission Prevention Test');
            console.log('📋 Requirement: Form must NOT submit with wrong flag');

            // Fill complete form
            await orgPage.fillFirstName('Bob');
            await orgPage.fillLastName('Williams');
            await orgPage.fillEmail('bob@testcompany.io');
            await orgPage.fillCompany('Test Company');
            await orgPage.selectRole('ENGINEER');
            await orgPage.selectEmpSize('_1_10');

            // Select US (wrong flag)
            await orgPage.selectCountry('US');
            await driver.sleep(1000);

            const flagClass = await orgPage.getFlagIconClass();
            console.log(`🚩 Flag class: "${flagClass}"`);

            await orgPage.fillPhone('5559876543');

            // Try to submit
            const submitButton = await orgPage.getSubmitButton();

            if (!flagClass || !flagClass.includes('fi-us')) {
                console.log('⚠️ Flag is wrong - form should not submit');

                // Button should be disabled, so click should not work
                const isClickable = await submitButton.isEnabled();
                expect(isClickable).toBe(false);

                console.log('❌ TEST FAILED: Form can be submitted with wrong flag!');
            }

            await orgPage.takeScreenshot('failed-form-submission-wrong-flag.png');
        }, 25000);
    });

    describe('❌ COMBINED REQUIREMENTS: All Conditions Together', () => {
        beforeEach(async () => {
            await orgPage.navigateToOrganization();
        });

        test('SHOULD FAIL: All three requirements must be enforced together', async () => {
            console.log('🧪 Running: Combined Requirements Test');
            console.log('📋 Testing all 3 requirements simultaneously:');
            console.log('   1. Correct flag display');
            console.log('   2. Phone field disabled without valid flag');
            console.log('   3. Submit button disabled without valid conditions');

            // STEP 1: No country selected
            console.log('\n📍 STEP 1: No country selected');
            let phoneInput = await orgPage.getPhoneInput();
            let submitButton = await orgPage.getSubmitButton();

            // Phone should not accept input
            await phoneInput.sendKeys('123');
            let phoneValue = await phoneInput.getAttribute('value');
            console.log(`   Phone value: "${phoneValue}" (should be empty)`);

            await orgPage.takeScreenshot('failed-combined-step1.png');

            // STEP 2: Select country with wrong flag (US)
            console.log('\n📍 STEP 2: Select US (triggers wrong flag)');
            await orgPage.selectCountry('US');
            await driver.sleep(1000);

            const flagClass = await orgPage.getFlagIconClass();
            console.log(`   Flag class: "${flagClass}" (should be "fi fi-us")`);

            // Phone should still be disabled with wrong flag
            phoneInput = await orgPage.getPhoneInput();
            const phoneEnabled = await phoneInput.isEnabled();
            console.log(`   Phone enabled: ${phoneEnabled} (should be false)`);

            await orgPage.takeScreenshot('failed-combined-step2.png');

            // STEP 3: Fill all other fields
            console.log('\n📍 STEP 3: Fill all required fields');
            await orgPage.fillFirstName('Test');
            await orgPage.fillLastName('User');
            await orgPage.fillEmail('test@company.com');
            await orgPage.fillCompany('Test Inc');
            await orgPage.selectRole('CEO');
            await orgPage.selectEmpSize('_11_50');

            // Try to fill phone
            await orgPage.fillPhone('1234567890');

            // Check submit button
            submitButton = await orgPage.getSubmitButton();
            const submitEnabled = await submitButton.isEnabled();
            console.log(`   Submit enabled: ${submitEnabled} (should be false with wrong flag)`);

            await orgPage.takeScreenshot('failed-combined-step3.png');

            // FINAL ASSERTIONS
            console.log('\n📊 FINAL VALIDATION:');

            // 1. Flag must be correct
            const flagCorrect = flagClass && flagClass.includes('fi-us');
            console.log(`   ✓ Flag correct: ${flagCorrect}`);
            expect(flagCorrect).toBe(true);

            // 2. Phone should be disabled if flag is wrong
            if (!flagCorrect) {
                expect(phoneEnabled).toBe(false);
                console.log(`   ✓ Phone disabled: ${!phoneEnabled}`);
            }

            // 3. Submit should be disabled if flag is wrong
            if (!flagCorrect) {
                expect(submitEnabled).toBe(false);
                console.log(`   ✓ Submit disabled: ${!submitEnabled}`);
            }

            console.log('\n❌ TEST FAILED: Requirements not enforced!');
        }, 35000);
    });
});
