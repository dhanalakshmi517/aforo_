const { By, until, Key } = require('selenium-webdriver');

class OrganizationPage {
    constructor(driver) {
        this.driver = driver;
        this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';

        // Selectors
        this.selectors = {
            // Form Fields
            firstName: By.id('firstName'),
            lastName: By.id('lastName'),
            email: By.id('email'),
            company: By.id('company'),
            role: By.id('role'),
            otherRole: By.id('otherRole'),
            empSize: By.id('empSize'),
            phone: By.id('phone'),
            help: By.id('help'),
            agreeCheckbox: By.css('.org-checkbox'),

            // Country Selector
            countrySelectorTrigger: By.css('.country-selector__control'),
            countrySearchInput: By.css('.search-input'),
            countryOption: By.css('.dropdown-item'),

            // Flag Icon
            flagIcon: By.css('.country-selector__control .fi'),
            dialCode: By.css('.country-code-display span:last-child'),

            // Submit Button
            submitButton: By.css('button[type="submit"]'),

            // Errors
            errorMsg: By.css('.error-msg'),

            // Cookie Consent
            cookieAcceptButton: By.css('button.cm__btn'),
            cookiePopup: By.css('.cm'),

            // Success
            thankYouMessage: By.css('.thank-you-message, h1:contains("Thank You")')
        };
    }

    async navigateToOrganization() {
        console.log('🏢 Navigating to Organization page');
        await this.driver.get(`${this.baseUrl}/contact-sales`);
        await this.dismissCookieConsent();
        await this.waitForPageLoad();
    }

    async dismissCookieConsent() {
        try {
            // Wait for cookie popup container to appear
            await this.driver.wait(
                until.elementLocated(this.selectors.cookiePopup),
                5000
            );
            console.log('🍪 Cookie popup detected');

            // Find and click the accept button
            const acceptButton = await this.driver.findElement(this.selectors.cookieAcceptButton);
            await this.driver.wait(until.elementIsVisible(acceptButton), 2000);
            await acceptButton.click();
            console.log('✅ Cookie consent accepted');

            // Wait for popup to disappear
            await this.driver.sleep(1000);
        } catch (error) {
            // Cookie popup might not appear every time
            console.log('ℹ️ No cookie consent popup found (already accepted or not shown)');
        }
    }

    async waitForPageLoad() {
        try {
            await this.driver.wait(until.elementLocated(this.selectors.firstName), 10000);
            return true;
        } catch (error) {
            console.log('❌ Organization page elements not found:', error.message);
            return false;
        }
    }

    // Form Filling Methods
    async fillFirstName(value) {
        await this.driver.findElement(this.selectors.firstName).sendKeys(value);
    }

    async fillLastName(value) {
        await this.driver.findElement(this.selectors.lastName).sendKeys(value);
    }

    async fillEmail(value) {
        await this.driver.findElement(this.selectors.email).sendKeys(value);
    }

    async fillCompany(value) {
        await this.driver.findElement(this.selectors.company).sendKeys(value);
    }

    async selectRole(value) {
        const select = await this.driver.findElement(this.selectors.role);
        await select.click();
        await select.findElement(By.css(`option[value="${value}"]`)).click();
    }

    async fillOtherRole(value) {
        await this.driver.findElement(this.selectors.otherRole).sendKeys(value);
    }

    async selectEmpSize(value) {
        const select = await this.driver.findElement(this.selectors.empSize);
        await select.click();
        await select.findElement(By.css(`option[value="${value}"]`)).click();
    }

    async fillPhone(value) {
        await this.driver.findElement(this.selectors.phone).sendKeys(value);
    }

    // Country Selector Methods
    // Note: Since we don't have the CountrySelector code, we'll try to interact with it
    // assuming it's a custom dropdown. If it's a standard select, this will need change.
    // Based on Organization.tsx, it imports CountrySelector from "../Common/CountrySelector"
    // We'll assume for now it's a custom component that opens a list.

    async selectCountry(countryCode) {
        console.log(`🌍 Selecting country: ${countryCode}`);
        try {
            // Click the trigger to open dropdown
            const trigger = await this.driver.findElement(this.selectors.countrySelectorTrigger);
            await trigger.click();

            // Wait for search input to be visible
            const searchInput = await this.driver.wait(until.elementLocated(this.selectors.countrySearchInput), 2000);
            await searchInput.sendKeys(countryCode);

            // Wait for options to filter and click the first one
            // We assume the search filters correctly so the first item is the best match
            const option = await this.driver.wait(until.elementLocated(this.selectors.countryOption), 2000);
            await option.click();

        } catch (error) {
            console.log('❌ Failed to select country:', error.message);
            throw error;
        }
    }

    // Validation Methods
    async getFlagIconClass() {
        try {
            const flag = await this.driver.findElement(this.selectors.flagIcon);
            return await flag.getAttribute('class');
        } catch (error) {
            return null;
        }
    }

    async getDialCode() {
        try {
            const code = await this.driver.findElement(this.selectors.dialCode);
            return await code.getText();
        } catch (error) {
            return null;
        }
    }

    async submitForm() {
        await this.driver.findElement(this.selectors.submitButton).click();
    }

    async getErrors() {
        const elements = await this.driver.findElements(this.selectors.errorMsg);
        const errors = [];
        for (const el of elements) {
            errors.push(await el.getText());
        }
        return errors;
    }

    async getPhoneInput() {
        return await this.driver.findElement(this.selectors.phone);
    }

    async getSubmitButton() {
        return await this.driver.findElement(this.selectors.submitButton);
    }

    async takeScreenshot(filename) {
        const fs = require('fs');
        const path = require('path');
        const screenshot = await this.driver.takeScreenshot();
        const dir = path.join(__dirname, '..', 'screenshots');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, filename), screenshot, 'base64');
    }

    // New Methods for Comprehensive Testing

    async fillHelp(value) {
        await this.driver.findElement(this.selectors.help).sendKeys(value);
    }

    async clearField(selector) {
        const element = await this.driver.findElement(selector);
        await element.clear();
    }

    async clearAllFields() {
        // Clear all input fields
        await this.clearField(this.selectors.firstName);
        await this.clearField(this.selectors.lastName);
        await this.clearField(this.selectors.email);
        await this.clearField(this.selectors.company);
        await this.clearField(this.selectors.phone);
    }

    async getCheckboxElement() {
        return await this.driver.findElement(this.selectors.agreeCheckbox);
    }

    async isCheckboxEnabled() {
        try {
            const checkbox = await this.getCheckboxElement();
            // Since we select the label, check for 'is-disabled' class
            const className = await checkbox.getAttribute('class');
            return !className.includes('is-disabled');
        } catch (error) {
            console.log('Error checking checkbox enabled state:', error.message);
            return false;
        }
    }

    async checkTermsCheckbox() {
        const checkbox = await this.getCheckboxElement();
        const isChecked = await this.isCheckboxChecked();
        if (!isChecked) {
            await checkbox.click();
        }
    }

    async isCheckboxChecked() {
        try {
            const checkboxLabel = await this.getCheckboxElement();
            // Find the input inside the label
            const input = await checkboxLabel.findElement(By.css('input'));
            return await input.isSelected();
        } catch (error) {
            console.log('Error checking checkbox state:', error.message);
            return false;
        }
    }

    async isSubmitButtonEnabled() {
        try {
            const button = await this.getSubmitButton();
            return await button.isEnabled();
        } catch (error) {
            console.log('Error checking button state:', error.message);
            return false;
        }
    }

    async getFieldValue(selector) {
        try {
            const element = await this.driver.findElement(selector);
            return await element.getAttribute('value');
        } catch (error) {
            return null;
        }
    }

    async waitForErrorToAppear() {
        try {
            await this.driver.wait(until.elementLocated(this.selectors.errorMsg), 3000);
            return true;
        } catch (error) {
            return false;
        }
    }

    async hasError() {
        const errors = await this.getErrors();
        return errors.length > 0;
    }

    async getErrorForField(fieldName) {
        // This is a helper to get error near a specific field
        // Field names like 'firstName', 'email', etc.
        try {
            const fieldElement = await this.driver.findElement(this.selectors[fieldName]);
            const parent = await fieldElement.findElement(By.xpath('..'));
            const error = await parent.findElement(this.selectors.errorMsg);
            return await error.getText();
        } catch (error) {
            return null;
        }
    }
}

module.exports = OrganizationPage;
