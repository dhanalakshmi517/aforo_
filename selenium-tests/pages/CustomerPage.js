// CustomerPage.js - Page Object Model for Customer Module
const { By, until, Key } = require('selenium-webdriver');

class CustomerPage {
    constructor(driver) {
        this.driver = driver;
        this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';

        // Define selectors for Customer module
        this.selectors = {
            // Navigation
            customersLink: By.xpath("//a[contains(@href, '/customers')]"),
            openCreateWizardButton: By.css('button.newbtn'),

            // Step 1: Customer Details
            companyNameInput: By.css("input[placeholder='eg., ABC Company']"),
            customerNameInput: By.css("input[placeholder='eg., John Doe']"),
            companyTypeSelect: By.css("select.af-select-input"), // Found in common styles usually

            // Step indicators
            step1Active: By.xpath("//div[contains(@class, 'met-np-stepper')]//div[contains(@class, 'active') and contains(., 'Customer Details')]"),
            step2Active: By.xpath("//div[contains(@class, 'met-np-stepper')]//div[contains(@class, 'active') and contains(., 'Account Details')]"),
            step3Active: By.xpath("//div[contains(@class, 'met-np-stepper')]//div[contains(@class, 'active') and contains(., 'Review')]"),

            // Step 2: Account Details
            phoneNumberInput: By.css("input[placeholder='e.g., +1234567890']"),
            primaryEmailInput: By.css("input[placeholder='e.g., johndoe@example.com']"),

            // Billing Address
            billingAddressLine1: By.xpath("//label[contains(., 'Billing Address Line 1')]/following-sibling::div//input"),
            billingAddressLine2: By.xpath("//label[contains(., 'Billing Address Line 2')]/following-sibling::div//input"),
            billingCity: By.xpath("//div[contains(., 'Billing Address')]//label[contains(., 'City')]/following-sibling::div//input"),
            billingState: By.xpath("//div[contains(., 'Billing Address')]//label[contains(., 'State')]/following-sibling::div//input"),
            billingZip: By.xpath("//div[contains(., 'Billing Address')]//label[contains(., 'ZIP')]/following-sibling::div//input"),
            billingCountry: By.xpath("//div[contains(., 'Billing Address')]//label[contains(., 'Country')]/following-sibling::div//select"),

            // Same as billing checkbox
            sameAsBillingCheckbox: By.css('.checkbox-btn'),

            // Buttons
            saveNextButton: By.css('button.af-primary-btn'),
            backButton: By.xpath("//button[contains(., 'Back')]"),
            finalCreateButton: By.xpath("//button[contains(., 'Create Customer')]"),
            saveDraftButton: By.xpath("//button[contains(@class, 'top-bar')]//span[contains(., 'Save')]"),

            // Error messages
            errorMessage: By.css('.field-error, .error-message, .met-error-text'),

            // Lock badge
            lockBadge: By.xpath("//span[@aria-label='Locked']"),

            // Review page
            reviewContainer: By.css('.met-review-container'),
        };
    }

    async navigateToCustomers() {
        console.log('🔐 Navigating to Customers page');
        // Correct URL found by subagent
        await this.driver.get(`${this.baseUrl}/get-started/customers`);
        try {
            await this.driver.wait(until.urlContains('/customers'), 15000);
        } catch (e) {
            console.log('⚠️ URL redirect timed out, refreshing...');
            await this.driver.navigate().refresh();
        }
        await this.driver.wait(until.elementLocated(this.selectors.openCreateWizardButton), 20000);
        console.log('✅ Customers page loaded');
    }

    async clickCreateCustomer() {
        console.log('➕ Clicking Create Customer button via CSS button.newbtn');
        // Refresh page if button not found to handle potential stale state
        let button;
        try {
            button = await this.driver.wait(until.elementLocated(this.selectors.openCreateWizardButton), 10000);
        } catch (e) {
            console.log('⚠️ Button not found, refreshing page...');
            await this.driver.navigate().refresh();
            button = await this.driver.wait(until.elementLocated(this.selectors.openCreateWizardButton), 15000);
        }
        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", button);
        await this.driver.sleep(1000);
        // Re-find right before click to avoid stale reference
        button = await this.driver.findElement(this.selectors.openCreateWizardButton);
        await button.click();
        await this.driver.sleep(3000);
        console.log('✅ Create Customer wizard opened');
    }

    async fillCustomerDetails(companyName, customerName, companyType) {
        console.log('📝 Filling Customer Details (Step 1)');

        const companyInput = await this.driver.wait(until.elementLocated(this.selectors.companyNameInput), 10000);
        await this.typeIntoInput(companyInput, companyName);

        const customerInput = await this.driver.findElement(this.selectors.customerNameInput);
        await this.typeIntoInput(customerInput, customerName);

        // For Select, try clicking and then selecting option
        try {
            const typeSelect = await this.driver.findElement(By.xpath("//label[contains(., 'Company Type')]/following-sibling::div//select | //select"));
            await typeSelect.sendKeys(companyType);
        } catch (e) {
            console.log('⚠️ Could not fill Company Type select directly, trying click approach');
        }
        console.log(`  ✓ Details filled: ${companyName}, ${customerName}`);
    }

    async typeIntoInput(element, text) {
        await element.clear();
        // Sometimes React doesn't catch .clear() properly, so we do backspaces
        const value = await element.getAttribute('value');
        for (let i = 0; i < value.length; i++) {
            await element.sendKeys(Key.BACK_SPACE);
        }
        await element.sendKeys(text);
    }

    async fillAccountDetails(phoneNumber, email) {
        console.log('📝 Filling Account Details (Step 2)');

        const phoneInput = await this.driver.wait(until.elementLocated(this.selectors.phoneNumberInput), 10000);
        await this.typeIntoInput(phoneInput, phoneNumber);

        const emailInput = await this.driver.findElement(this.selectors.primaryEmailInput);
        await this.typeIntoInput(emailInput, email);
        console.log(`  ✓ Account filled: ${phoneNumber}, ${email}`);
    }

    async fillBillingAddress(address) {
        console.log('📝 Filling Billing Address');

        const fields = [
            { label: 'Billing Address Line 1', value: address.line1 },
            { label: 'Billing Address Line 2', value: address.line2 },
            { label: 'City', value: address.city },
            { label: 'State', value: address.state },
            { label: 'ZIP', value: address.zip },
        ];

        for (const field of fields) {
            try {
                // Find label that contains the text, then find the input in the same container or next to it
                const xpath = `//div[contains(@class, 'acc-form-group') or contains(@class, 'address-section')]//label[contains(., '${field.label}')]/following::input[1] | //label[contains(., '${field.label}')]/..//input | //input[contains(@placeholder, '${field.label}')]`;
                const input = await this.driver.wait(until.elementLocated(By.xpath(xpath)), 10000);
                await this.typeIntoInput(input, field.value);
            } catch (e) {
                console.log(`⚠️ Could not find field: ${field.label}`);
            }
        }
        // Country
        try {
            const countryXPath = `//div[contains(., 'Billing Address')]//label[contains(., 'Country')]/following::select[1] | //select[contains(@placeholder, 'Country')]`;
            const countrySelect = await this.driver.wait(until.elementLocated(By.xpath(countryXPath)), 5000);
            await countrySelect.sendKeys(address.country);
        } catch (e) {
            console.log('⚠️ Could not fill billing Country');
        }
        console.log('  ✓ Billing address fields filled');
    }

    async toggleSameAsBilling() {
        console.log('☑️  Toggling "Same as Billing" checkbox');
        const checkbox = await this.driver.wait(until.elementLocated(this.selectors.sameAsBillingCheckbox), 5000);
        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", checkbox);
        await checkbox.click();
        await this.driver.sleep(1500);
    }

    async clickSaveAndNext() {
        console.log('➡️  Clicking Save & Next (button.af-primary-btn)');
        // Re-find element to avoid stale reference
        const button = await this.driver.wait(until.elementLocated(this.selectors.saveNextButton), 15000);
        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", button);
        await this.driver.sleep(1000);
        try {
            await button.click();
        } catch (e) {
            console.log('⚠️ Click failed, retrying once...');
            const retryButton = await this.driver.findElement(this.selectors.saveNextButton);
            await retryButton.click();
        }
        await this.driver.sleep(3000);
    }

    async clickBack() {
        console.log('⬅️  Clicking Back');
        const button = await this.driver.wait(until.elementLocated(this.selectors.backButton), 5000);
        await button.click();
        await this.driver.sleep(2000);
    }

    async clickFinalCreate() {
        console.log('✨ Clicking final Create Customer button');
        const button = await this.driver.wait(until.elementLocated(this.selectors.finalCreateButton), 10000);
        await button.click();
        await this.driver.sleep(5000);
    }

    async isStep1Active() { return (await this.safeCheck(By.xpath("//span[contains(text(), 'Customer Details')]"))); }
    async isStep2Active() { return (await this.safeCheck(By.xpath("//span[contains(text(), 'Account Details')]"))); }
    async isStep3Active() { return (await this.safeCheck(By.xpath("//span[contains(text(), 'Review')]"))); }
    async isReviewPageVisible() { return (await this.safeCheck(this.selectors.reviewContainer)); }

    async safeCheck(selector) {
        try {
            const elements = await this.driver.findElements(selector);
            if (elements.length === 0) return false;
            return await elements[0].isDisplayed();
        } catch {
            return false;
        }
    }

    async isLockBadgeVisible() {
        return (await this.safeCheck(this.selectors.lockBadge));
    }

    async getErrorMessage() {
        try {
            // Updated selector based on subagent findings
            const errorSelector = By.css('span.if-error');
            const error = await this.driver.wait(until.elementLocated(errorSelector), 5000);
            return await error.getText();
        } catch {
            return null;
        }
    }

    async takeScreenshot(filename) {
        const screenshot = await this.driver.takeScreenshot();
        const fs = require('fs');
        const path = require('path');
        const screenshotDir = path.join(__dirname, '..', 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        const screenshotPath = path.join(screenshotDir, filename);
        fs.writeFileSync(screenshotPath, screenshot, 'base64');
        console.log(`📸 Screenshot saved: ${filename}`);
    }
}

module.exports = CustomerPage;
