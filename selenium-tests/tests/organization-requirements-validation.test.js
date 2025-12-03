const WebDriverManager = require('../config/webdriver');
const OrganizationPage = require('../pages/OrganizationPage');
const { By, until } = require('selenium-webdriver');

/**
 * COMPREHENSIVE REQUIREMENTS VALIDATION TEST SUITE
 * 
 * Tests all 7 requirements as specified:
 * 1. First Name and Last Name are mandatory
 * 2. Business Email must reject @gmail.com, accept other domains
 * 3. Company, Your Role, and Employee Size are mandatory
 * 4. Country field must display flag icon
 * 5. "How can we help you?" is optional
 * 6. Terms & Conditions checkbox disabled until all required fields valid
 * 7. Contact Sales button active only after Terms checked
 */

describe('Organization Form - Complete Requirements Validation', () => {
    let driverManager;
    let driver;
    let orgPage;

    beforeAll(async () => {
        console.log('🚀 Setting up Requirements Validation Tests');
        driverManager = new WebDriverManager();
        driver = await driverManager.createDriver();
        orgPage = new OrganizationPage(driver);
    }, 30000);

    afterAll(async () => {
        console.log('🧹 Cleaning up tests');
        if (driverManager) {
            await driverManager.quitDriver();
        }
    }, 10000);

    // Helper function to fill all required fields with valid data
    const fillAllRequiredFields = async () => {
        await orgPage.fillFirstName('John');
        await orgPage.fillLastName('Doe');
        await orgPage.fillEmail('john@company.com');
        await orgPage.fillCompany('Test Corp');
        await orgPage.selectRole('CEO');
        await orgPage.selectEmpSize('_11_50');
        await orgPage.selectCountry('IN');
        await driver.sleep(500); // Wait for country selection to complete
        await orgPage.fillPhone('9876543210');
    };

    /* ========================================================================
     * REQUIREMENT 1: First Name and Last Name Mandatory
     * Form must only move to next field when both fields contain valid values
     * ======================================================================== */
    describe('✅ REQUIREMENT 1: First Name and Last Name Mandatory', () => {
        beforeEach(async () => {
            await orgPage.navigateToOrganization();
        });

        test('1.1: Form blocks progression when First Name is empty', async () => {
            console.log('🧪 Test 1.1: First Name Required');

            // Fill everything except first name
            await orgPage.fillLastName('Doe');
            await orgPage.fillEmail('john@company.com');
            await orgPage.fillCompany('Test Corp');
            await orgPage.selectRole('CEO');
            await orgPage.selectEmpSize('_11_50');
            await orgPage.selectCountry('IN');
            await driver.sleep(500);
            await orgPage.fillPhone('9876543210');

            // Verify Checkbox and Button are disabled
            const isCheckboxEnabled = await orgPage.isCheckboxEnabled();
            expect(isCheckboxEnabled).toBe(false);

            const isButtonEnabled = await orgPage.isSubmitButtonEnabled();
            expect(isButtonEnabled).toBe(false);

            await orgPage.takeScreenshot('req1-1-firstname-required.png');
            console.log('✅ Test 1.1 Passed: Form disabled when First Name missing');
        }, 25000);

        test('1.2: Form blocks progression when Last Name is empty', async () => {
            console.log('🧪 Test 1.2: Last Name Required');

            // Fill everything except last name
            await orgPage.fillFirstName('John');
            await orgPage.fillEmail('john@company.com');
            await orgPage.fillCompany('Test Corp');
            await orgPage.selectRole('CEO');
            await orgPage.selectEmpSize('_11_50');
            await orgPage.selectCountry('IN');
            await driver.sleep(500);
            await orgPage.fillPhone('9876543210');

            // Verify Checkbox and Button are disabled
            const isCheckboxEnabled = await orgPage.isCheckboxEnabled();
            expect(isCheckboxEnabled).toBe(false);

            const isButtonEnabled = await orgPage.isSubmitButtonEnabled();
            expect(isButtonEnabled).toBe(false);

            await orgPage.takeScreenshot('req1-2-lastname-required.png');
            console.log('✅ Test 1.2 Passed: Form disabled when Last Name missing');
        }, 25000);

        test('1.3: Form allows progression when both names are valid', async () => {
            console.log('🧪 Test 1.3: Both Names Valid');

            await fillAllRequiredFields();

            // Check that there are no name-related errors
            const errors = await orgPage.getErrors();
            const nameErrors = errors.filter(e =>
                e.includes('First') || e.includes('Last') || e.includes('Name')
            );
            expect(nameErrors.length).toBe(0);

            await orgPage.takeScreenshot('req1-3-both-names-valid.png');
            console.log('✅ Test 1.3 Passed: Form accepts valid names');
        }, 25000);
    });

    /* ========================================================================
     * REQUIREMENT 2: Business Email Validation
     * Must NOT accept @gmail.com, MUST accept other domains after @
     * ======================================================================== */
    describe('✅ REQUIREMENT 2: Business Email Validation', () => {
        beforeEach(async () => {
            await orgPage.navigateToOrganization();
        });

        test('2.1: Form rejects @gmail.com emails', async () => {
            console.log('🧪 Test 2.1: Reject @gmail.com');

            await orgPage.fillFirstName('John');
            await orgPage.fillLastName('Doe');
            await orgPage.fillEmail('test@gmail.com'); // Should be rejected
            await orgPage.fillCompany('Test Corp');
            await orgPage.selectRole('CEO');
            await orgPage.selectEmpSize('_11_50');
            await orgPage.selectCountry('IN');
            await driver.sleep(500);
            await orgPage.fillPhone('9876543210');

            await orgPage.submitForm();
            // Verify Checkbox and Button are disabled
            const isCheckboxEnabled = await orgPage.isCheckboxEnabled();
            expect(isCheckboxEnabled).toBe(false);

            const isButtonEnabled = await orgPage.isSubmitButtonEnabled();
            expect(isButtonEnabled).toBe(false);

            await orgPage.takeScreenshot('req2-1-gmail-rejected.png');
            console.log('✅ Test 2.1 Passed: Form disabled with @gmail.com');
        }, 25000);

        test('2.2: Form accepts @company.com emails', async () => {
            console.log('🧪 Test 2.2: Accept @company.com');

            await orgPage.fillFirstName('John');
            await orgPage.fillLastName('Doe');
            await orgPage.fillEmail('john@company.com'); // Should be accepted
            await orgPage.fillCompany('Test Corp');
            await orgPage.selectRole('CEO');
            await orgPage.selectEmpSize('_11_50');
            await orgPage.selectCountry('IN');
            await driver.sleep(500);
            await orgPage.fillPhone('9876543210');

            const errors = await orgPage.getErrors();
            const emailErrors = errors.filter(e => e.includes('email'));
            expect(emailErrors.length).toBe(0);

            await orgPage.takeScreenshot('req2-2-company-email-accepted.png');
            console.log('✅ Test 2.2 Passed: @company.com correctly accepted');
        }, 25000);

        test('2.3: Form accepts @business.io emails', async () => {
            console.log('🧪 Test 2.3: Accept @business.io');

            await orgPage.fillFirstName('Jane');
            await orgPage.fillLastName('Smith');
            await orgPage.fillEmail('jane@business.io'); // Should be accepted
            await orgPage.fillCompany('Business Inc');
            await orgPage.selectRole('CTO');
            await orgPage.selectEmpSize('_51_100');
            await orgPage.selectCountry('US');
            await driver.sleep(500);
            await orgPage.fillPhone('2025551234');

            const errors = await orgPage.getErrors();
            const emailErrors = errors.filter(e => e.includes('email'));
            expect(emailErrors.length).toBe(0);

            await orgPage.takeScreenshot('req2-3-io-email-accepted.png');
            console.log('✅ Test 2.3 Passed: @business.io correctly accepted');
        }, 25000);

        test('2.4: Form rejects empty email', async () => {
            console.log('🧪 Test 2.4: Reject Empty Email');

            await orgPage.fillFirstName('John');
            await orgPage.fillLastName('Doe');
            // Don't fill email
            await orgPage.fillCompany('Test Corp');
            await orgPage.selectRole('CEO');
            await orgPage.selectEmpSize('_11_50');
            await orgPage.selectCountry('IN');
            await driver.sleep(500);
            await orgPage.fillPhone('9876543210');

            // Verify Checkbox and Button are disabled
            const isCheckboxEnabled = await orgPage.isCheckboxEnabled();
            expect(isCheckboxEnabled).toBe(false);

            const isButtonEnabled = await orgPage.isSubmitButtonEnabled();
            expect(isButtonEnabled).toBe(false);

            await orgPage.takeScreenshot('req2-4-empty-email-rejected.png');
            console.log('✅ Test 2.4 Passed: Form disabled with empty email');
        }, 25000);
    });

    /* ========================================================================
     * REQUIREMENT 3: Company, Your Role, and Employee Size Mandatory
     * Form must only move forward when all three fields are valid
     * ======================================================================== */
    describe('✅ REQUIREMENT 3: Company, Role, and Employee Size Mandatory', () => {
        beforeEach(async () => {
            await orgPage.navigateToOrganization();
        });

        test('3.1: Form blocks when Company is missing', async () => {
            console.log('🧪 Test 3.1: Company Required');

            await orgPage.fillFirstName('John');
            await orgPage.fillLastName('Doe');
            await orgPage.fillEmail('john@company.com');
            // Don't fill company
            await orgPage.selectRole('CEO');
            await orgPage.selectEmpSize('_11_50');
            await orgPage.selectCountry('IN');
            await driver.sleep(500);
            await orgPage.fillPhone('9876543210');

            await orgPage.submitForm();
            // Verify Checkbox and Button are disabled
            const isCheckboxEnabled = await orgPage.isCheckboxEnabled();
            expect(isCheckboxEnabled).toBe(false);

            const isButtonEnabled = await orgPage.isSubmitButtonEnabled();
            expect(isButtonEnabled).toBe(false);

            await orgPage.takeScreenshot('req3-1-company-required.png');
            console.log('✅ Test 3.1 Passed: Form disabled when Company is missing');
        }, 25000);

        test('3.2: Form blocks when Role is missing', async () => {
            console.log('🧪 Test 3.2: Role Required');

            await orgPage.fillFirstName('John');
            await orgPage.fillLastName('Doe');
            await orgPage.fillEmail('john@company.com');
            await orgPage.fillCompany('Test Corp');
            // Don't select role
            await orgPage.selectEmpSize('_11_50');
            await orgPage.selectCountry('IN');
            await driver.sleep(500);
            await orgPage.fillPhone('9876543210');

            await orgPage.submitForm();
            // Verify Checkbox and Button are disabled
            const isCheckboxEnabled = await orgPage.isCheckboxEnabled();
            expect(isCheckboxEnabled).toBe(false);

            const isButtonEnabled = await orgPage.isSubmitButtonEnabled();
            expect(isButtonEnabled).toBe(false);

            await orgPage.takeScreenshot('req3-2-role-required.png');
            console.log('✅ Test 3.2 Passed: Form disabled when Role is missing');
        }, 25000);

        test('3.3: Form blocks when Employee Size is missing', async () => {
            console.log('🧪 Test 3.3: Employee Size Required');

            await orgPage.fillFirstName('John');
            await orgPage.fillLastName('Doe');
            await orgPage.fillEmail('john@company.com');
            await orgPage.fillCompany('Test Corp');
            await orgPage.selectRole('CEO');
            // Don't select employee size
            await orgPage.selectCountry('IN');
            await driver.sleep(500);
            await orgPage.fillPhone('9876543210');

            await orgPage.submitForm();
            // Verify Checkbox and Button are disabled
            const isCheckboxEnabled = await orgPage.isCheckboxEnabled();
            expect(isCheckboxEnabled).toBe(false);

            const isButtonEnabled = await orgPage.isSubmitButtonEnabled();
            expect(isButtonEnabled).toBe(false);

            await orgPage.takeScreenshot('req3-3-empsize-required.png');
            console.log('✅ Test 3.3 Passed: Form disabled when Employee Size missing');
        }, 25000);

        test('3.4: Form allows when all three are valid', async () => {
            console.log('🧪 Test 3.4: All Three Fields Valid');

            await fillAllRequiredFields();

            const errors = await orgPage.getErrors();
            const relevantErrors = errors.filter(e =>
                e.includes('Company') || e.includes('Role') || e.includes('Employee')
            );
            expect(relevantErrors.length).toBe(0);

            await orgPage.takeScreenshot('req3-4-all-three-valid.png');
            console.log('✅ Test 3.4 Passed: Company, Role, and Employee Size accepted');
        }, 25000);
    });

    /* ========================================================================
     * REQUIREMENT 4: Country Field Must Display Flag Icon
     * Flag icon must appear before country name
     * ======================================================================== */
    describe('✅ REQUIREMENT 4: Country Flag Icon Display', () => {
        beforeEach(async () => {
            await orgPage.navigateToOrganization();
        });

        test('4.1: Verify flag icon appears for India (IN)', async () => {
            console.log('🧪 Test 4.1: India Flag Icon');

            await orgPage.selectCountry('IN');
            await driver.sleep(1000);

            const flagClass = await orgPage.getFlagIconClass();
            console.log(`🚩 Flag class: "${flagClass}"`);

            expect(flagClass).toContain('fi');
            expect(flagClass).toContain('fi-in');

            await orgPage.takeScreenshot('req4-1-india-flag.png');
            console.log('✅ Test 4.1 Passed: India flag icon displayed');
        }, 20000);

        test('4.2: Verify flag icon appears for United States (US)', async () => {
            console.log('🧪 Test 4.2: US Flag Icon');

            await orgPage.selectCountry('US');
            await driver.sleep(1000);

            const flagClass = await orgPage.getFlagIconClass();
            console.log(`🚩 Flag class: "${flagClass}"`);

            expect(flagClass).toContain('fi');
            expect(flagClass).toContain('fi-us');

            await orgPage.takeScreenshot('req4-2-us-flag.png');
            console.log('✅ Test 4.2 Passed: US flag icon displayed');
        }, 20000);

        test('4.3: Verify flag icon appears for United Kingdom (GB)', async () => {
            console.log('🧪 Test 4.3: UK Flag Icon');

            await orgPage.selectCountry('GB');
            await driver.sleep(1000);

            const flagClass = await orgPage.getFlagIconClass();
            console.log(`🚩 Flag class: "${flagClass}"`);

            expect(flagClass).toContain('fi');
            expect(flagClass).toContain('fi-gb');

            await orgPage.takeScreenshot('req4-3-uk-flag.png');
            console.log('✅ Test 4.3 Passed: UK flag icon displayed');
        }, 20000);

        test('4.4: Verify no flag when country not selected', async () => {
            console.log('🧪 Test 4.4: No Flag Without Country');

            // Don't select any country
            const flagClass = await orgPage.getFlagIconClass();
            console.log(`🚩 Flag class when no country: "${flagClass}"`);

            // Should be null or empty since no country selected
            expect(flagClass === null || !flagClass.includes('fi-')).toBe(true);

            await orgPage.takeScreenshot('req4-4-no-flag.png');
            console.log('✅ Test 4.4 Passed: No flag without country selection');
        }, 20000);
    });

    /* ========================================================================
     * REQUIREMENT 5: "How can we help you?" is Optional
     * Field should not block progression
     * ======================================================================== */
    describe('✅ REQUIREMENT 5: "How can we help you?" is Optional', () => {
        beforeEach(async () => {
            await orgPage.navigateToOrganization();
        });

        test('5.1: Form submission works with empty help field', async () => {
            console.log('🧪 Test 5.1: Empty Help Field Allowed');

            await fillAllRequiredFields();
            // Don't fill help field - it should be optional

            // Check there are no help-related errors
            const errors = await orgPage.getErrors();
            const helpErrors = errors.filter(e => e.includes('help'));
            expect(helpErrors.length).toBe(0);

            await orgPage.takeScreenshot('req5-1-help-empty-allowed.png');
            console.log('✅ Test 5.1 Passed: Empty help field does not block');
        }, 25000);

        test('5.2: Form submission works with help field filled', async () => {
            console.log('🧪 Test 5.2: Help Field Filled');

            await fillAllRequiredFields();
            await orgPage.fillHelp('I need help with billing integration.');

            // Check there are no errors
            const errors = await orgPage.getErrors();
            expect(errors.length).toBe(0);

            await orgPage.takeScreenshot('req5-2-help-filled-works.png');
            console.log('✅ Test 5.2 Passed: Filled help field works fine');
        }, 25000);
    });

    /* ========================================================================
     * REQUIREMENT 6: Terms & Conditions Checkbox State
     * Checkbox should be disabled until all required fields are valid
     * NOTE: This may fail if the form doesn't implement this logic yet
     * ======================================================================== */
    describe('✅ REQUIREMENT 6: Terms Checkbox Disabled Until Valid', () => {
        beforeEach(async () => {
            await orgPage.navigateToOrganization();
        });

        test('6.1: Checkbox is disabled when form is empty', async () => {
            console.log('🧪 Test 6.1: Checkbox Disabled - Empty Form');

            // Check checkbox state without filling anything
            const isEnabled = await orgPage.isCheckboxEnabled();

            console.log(`📋 Checkbox enabled state (empty form): ${isEnabled}`);

            // NOTE: This test expects the checkbox to be DISABLED
            // If this fails, the form doesn't implement this requirement yet
            expect(isEnabled).toBe(false);

            await orgPage.takeScreenshot('req6-1-checkbox-disabled-empty.png');
            console.log('✅ Test 6.1 Passed: Checkbox disabled on empty form');
        }, 20000);

        test('6.2: Checkbox is disabled with partial data', async () => {
            console.log('🧪 Test 6.2: Checkbox Disabled - Partial Data');

            // Fill only some fields
            await orgPage.fillFirstName('John');
            await orgPage.fillLastName('Doe');
            await orgPage.fillEmail('john@company.com');

            const isEnabled = await orgPage.isCheckboxEnabled();
            console.log(`📋 Checkbox enabled state (partial data): ${isEnabled}`);

            expect(isEnabled).toBe(false);

            await orgPage.takeScreenshot('req6-2-checkbox-disabled-partial.png');
            console.log('✅ Test 6.2 Passed: Checkbox disabled with partial data');
        }, 20000);

        test('6.3: Checkbox is disabled with invalid email (@gmail)', async () => {
            console.log('🧪 Test 6.3: Checkbox Disabled - Invalid Email');

            await orgPage.fillFirstName('John');
            await orgPage.fillLastName('Doe');
            await orgPage.fillEmail('test@gmail.com'); // Invalid
            await orgPage.fillCompany('Test Corp');
            await orgPage.selectRole('CEO');
            await orgPage.selectEmpSize('_11_50');
            await orgPage.selectCountry('IN');
            await driver.sleep(500);
            await orgPage.fillPhone('9876543210');

            const isEnabled = await orgPage.isCheckboxEnabled();
            console.log(`📋 Checkbox enabled state (invalid email): ${isEnabled}`);

            expect(isEnabled).toBe(false);

            await orgPage.takeScreenshot('req6-3-checkbox-disabled-invalid-email.png');
            console.log('✅ Test 6.3 Passed: Checkbox disabled with invalid email');
        }, 25000);

        test('6.4: Checkbox becomes enabled when all required fields valid', async () => {
            console.log('🧪 Test 6.4: Checkbox Enabled - All Valid');

            await fillAllRequiredFields();
            await driver.sleep(1000); // Wait for validation

            const isEnabled = await orgPage.isCheckboxEnabled();
            console.log(`📋 Checkbox enabled state (all valid): ${isEnabled}`);

            expect(isEnabled).toBe(true);

            await orgPage.takeScreenshot('req6-4-checkbox-enabled-valid.png');
            console.log('✅ Test 6.4 Passed: Checkbox enabled with all valid fields');
        }, 25000);
    });

    /* ========================================================================
     * REQUIREMENT 7: Contact Sales Button Active After Terms Checked
     * Button should only be active/work after Terms checkbox is checked
     * NOTE: This may fail if the form doesn't implement this logic yet
     * ======================================================================== */
    describe('✅ REQUIREMENT 7: Contact Sales Button Activation', () => {
        beforeEach(async () => {
            await orgPage.navigateToOrganization();
        });

        test('7.1: Button is disabled when checkbox not checked', async () => {
            console.log('🧪 Test 7.1: Button Disabled - Checkbox Unchecked');

            await fillAllRequiredFields();
            await driver.sleep(500);

            // Don't check the Terms checkbox
            const isChecked = await orgPage.isCheckboxChecked();
            const isButtonEnabled = await orgPage.isSubmitButtonEnabled();

            console.log(`✔️ Checkbox checked: ${isChecked}`);
            console.log(`🔘 Button enabled: ${isButtonEnabled}`);

            // If checkbox is not checked, button should be disabled
            if (!isChecked) {
                expect(isButtonEnabled).toBe(false);
            }

            await orgPage.takeScreenshot('req7-1-button-disabled-unchecked.png');
            console.log('✅ Test 7.1 Passed: Button disabled when checkbox unchecked');
        }, 25000);

        test('7.2: Button becomes enabled after checkbox checked', async () => {
            console.log('🧪 Test 7.2: Button Enabled - Checkbox Checked');

            await fillAllRequiredFields();
            await driver.sleep(500);

            // Check the Terms checkbox
            await orgPage.checkTermsCheckbox();
            await driver.sleep(500);

            const isChecked = await orgPage.isCheckboxChecked();
            const isButtonEnabled = await orgPage.isSubmitButtonEnabled();

            console.log(`✔️ Checkbox checked: ${isChecked}`);
            console.log(`🔘 Button enabled: ${isButtonEnabled}`);

            expect(isChecked).toBe(true);
            expect(isButtonEnabled).toBe(true);

            await orgPage.takeScreenshot('req7-2-button-enabled-checked.png');
            console.log('✅ Test 7.2 Passed: Button enabled after checkbox checked');
        }, 25000);

        test('7.3: Complete end-to-end workflow test', async () => {
            console.log('🧪 Test 7.3: Complete E2E Workflow');

            // Step 1: Fill all required fields
            console.log('📝 Step 1: Filling all required fields');
            await fillAllRequiredFields();
            await driver.sleep(500);
            await orgPage.takeScreenshot('req7-3-step1-fields-filled.png');

            // Step 2: Verify checkbox state (should be enabled if req 6 is implemented)
            console.log('📋 Step 2: Checking checkbox state');
            const checkboxEnabledBeforeCheck = await orgPage.isCheckboxEnabled();
            console.log(`Checkbox enabled: ${checkboxEnabledBeforeCheck}`);
            await orgPage.takeScreenshot('req7-3-step2-checkbox-state.png');

            // Step 3: Check the Terms checkbox
            console.log('✔️ Step 3: Checking Terms checkbox');
            await orgPage.checkTermsCheckbox();
            await driver.sleep(500);
            await orgPage.takeScreenshot('req7-3-step3-checkbox-checked.png');

            // Step 4: Verify button is now enabled
            console.log('🔘 Step 4: Verifying button state');
            const isButtonEnabled = await orgPage.isSubmitButtonEnabled();
            console.log(`Button enabled: ${isButtonEnabled}`);

            expect(isButtonEnabled).toBe(true);

            await orgPage.takeScreenshot('req7-3-step4-ready-to-submit.png');
            console.log('✅ Test 7.3 Passed: Complete workflow validated');
        }, 30000);
    });
});
