const { By, until, Key } = require('selenium-webdriver');

class ProductPage {
    constructor(driver) {
        this.driver = driver;
        this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';

        this.selectors = {
            // Main Products Page
            createProductButton: By.css("button.af-primary-btn, button.newbtn"),

            // Wizard Steps
            step1Indicator: By.css(".met-np-step"),

            // Step 1: General
            productNameInput: By.css("input[placeholder='eg. Google Maps API']"),
            versionInput: By.css("input[placeholder='eg., 2.3-VOS']"),
            descriptionInput: By.css("textarea[placeholder*='Mapping service']"),

            // Step 2: Configuration - Use label to find exact select
            productTypeSelect: By.xpath("//label[contains(., 'Type of Product')]/following::select[1]"),

            // Common Actions
            saveAndNextButton: By.xpath("//button[contains(., 'Save & Next')]"),
            createButton: By.xpath("//button[contains(., 'Create Product')]"),

            // Success Screen
            successTitle: By.className('pcs-title'),
            goToProductsButton: By.xpath("//button[contains(., 'Go to All Products')]")
        };
    }

    async navigateToProducts() {
        console.log('Navigating to Products page...');
        await this.driver.get(`${this.baseUrl}/get-started/products`);
        try {
            await this.driver.wait(until.elementLocated(this.selectors.createProductButton), 10000);
        } catch (e) {
            console.log('⚠️ Could not find Create Product button immediately');
        }
    }

    async clickCreateProduct() {
        console.log('Clicking Create Product...');
        try {
            const button = await this.driver.wait(until.elementLocated(this.selectors.createProductButton), 5000);
            await button.click();
            console.log('Clicked Create Product button');
        } catch (e) {
            console.log('⚠️ Create Product button not found or clickable, forcing navigation...');
            await this.driver.get(`${this.baseUrl}/get-started/products/new`);
        }
        await this.driver.wait(until.elementLocated(this.selectors.productNameInput), 10000);
        console.log('Wizard opened');
    }

    // Step 1
    async fillGeneralDetails(name, version, description) {
        console.log(`Filling General Details: ${name}`);

        const nameInput = await this.driver.wait(until.elementLocated(this.selectors.productNameInput), 5000);
        await this.typeIntoInput(nameInput, name);

        if (version) {
            const verInput = await this.driver.findElement(this.selectors.versionInput);
            await this.typeIntoInput(verInput, version);
        }

        if (description) {
            const descInput = await this.driver.findElement(this.selectors.descriptionInput);
            await this.typeIntoInput(descInput, description);
        }
    }

    async typeIntoInput(element, text) {
        await element.clear();
        await element.sendKeys(text);
    }

    async clickSaveAndNext() {
        console.log('Clicking Save & Next...');
        try {
            const btn = await this.driver.wait(until.elementLocated(this.selectors.saveAndNextButton), 5000);
            await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
            await this.driver.sleep(1000); // Wait for scroll
            await btn.click();
        } catch (e) {
            console.log("Could not click visually, trying JS click");
            const btn = await this.driver.findElement(this.selectors.saveAndNextButton);
            await this.driver.executeScript("arguments[0].click();", btn);
        }
        await this.driver.sleep(3000); // Wait for transition
    }

    // Step 2
    async selectProductType(type) {
        console.log(`Selecting Product Type: ${type}`);

        // Wait for "Type of Product" label to confirm step loaded
        try {
            await this.driver.wait(until.elementLocated(By.xpath("//label[contains(., 'Type of Product')]")), 10000);
        } catch (e) {
            console.log('⚠️ "Type of Product" label not found, may already be selected or different step');
        }

        try {
            const select = await this.driver.wait(until.elementLocated(this.selectors.productTypeSelect), 5000);
            await select.sendKeys(type);
            // Verify selection if possible or wait for rerender
            await this.driver.sleep(1000);
        } catch (e) {
            console.log('⚠️ Native select for Product Type not found!');
            throw e;
        }
    }

    async fillConfigurationFields(fields) {
        console.log('Filling Configuration Fields...');
        for (const [label, value] of Object.entries(fields)) {
            try {
                // Precise selector for inputs/selects by label
                const siblingXpath = `//label[contains(., '${label}')]/following-sibling::input | //label[contains(., '${label}')]/following-sibling::div//select | //label[contains(., '${label}')]/following-sibling::div//input`;
                const generalXpath = `//label[contains(., '${label}')]/following::input[1] | //label[contains(., '${label}')]/following::select[1]`;

                let element;
                try {
                    element = await this.driver.wait(until.elementLocated(By.xpath(siblingXpath)), 2000);
                } catch (e) {
                    element = await this.driver.wait(until.elementLocated(By.xpath(generalXpath)), 2000);
                }

                await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);

                const tagName = await element.getTagName();
                if (tagName === 'select') {
                    await element.sendKeys(value);
                } else {
                    await this.typeIntoInput(element, value);
                }
                console.log(`  Filled ${label}: ${value}`);
            } catch (e) {
                console.warn(`  ⚠️ Could not find or fill field: ${label}`);
            }
        }
    }

    // Step 3
    async clickCreate() {
        console.log('Clicking Final Create...');
        try {
            const btn = await this.driver.wait(until.elementLocated(this.selectors.createButton), 5000);
            await btn.click();
        } catch (e) {
            console.log('Trying JS click for Create button');
            const btn = await this.driver.findElement(this.selectors.createButton);
            await this.driver.executeScript("arguments[0].click();", btn);
        }
    }

    async verifySuccess() {
        console.log('Verifying Success...');

        // 1. Check if Success Screen title is present
        try {
            await this.driver.wait(until.elementLocated(this.selectors.successTitle), 10000);
            console.log('✅ Success message found!');
        } catch (e) {
            console.log('⚠️ Success title not displayed.');
            return false;
        }

        // 2. Click "Go to All Products"
        try {
            const btn = await this.driver.wait(until.elementLocated(this.selectors.goToProductsButton), 5000);
            await btn.click();

            // 3. Verify redirect
            await this.driver.wait(until.urlContains('/products'), 10000);
            console.log('✅ Redirected to product list');
            return true;
        } catch (e) {
            console.log('⚠️ Could not click Go to Products or Redirect failed');
            return false;
        }
    }

    async takeScreenshot(filename) {
        try {
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
        } catch (e) {
            console.log("Failed to save screenshot", e);
        }
    }
}

module.exports = ProductPage;
