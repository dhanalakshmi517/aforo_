const { By, until } = require('selenium-webdriver');
const WebDriverManager = require('../config/webdriver');

/**
 * DISCOVERY TEST - Find Real HTML Structure
 * This test will help us discover the actual selectors in the live app
 */
describe('Rateplan Discovery Test', () => {
    let driver;
    let manager;

    const testEmail = 'shyambss07@ai.ai';
    const testPassword = '^j$GfNQm';
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    beforeAll(async () => {
        console.log('🔍 Starting Discovery Test...');
        manager = new WebDriverManager();
        driver = await manager.getDriver();
        await driver.manage().setTimeouts({ implicit: 10000 });
    }, 30000);

    afterAll(async () => {
        if (manager) {
            await manager.quitDriver();
        }
    });

    test('should login and navigate to rate plans page', async () => {
        console.log('📍 Step 1: Navigate to login page');
        await driver.get(`${baseUrl}/login`);
        await driver.sleep(2000);  // Wait for page load

        console.log('📍 Step 2: Fill login credentials');
        // Find email input - try multiple selectors
        let emailInput;
        try {
            emailInput = await driver.findElement(By.css('input[type="email"]'));
            console.log('✅ Found email input by type');
        } catch (e) {
            emailInput = await driver.findElement(By.css('input[name="email"]'));
            console.log('✅ Found email input by name');
        }
        await emailInput.sendKeys(testEmail);

        // Find password input
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.sendKeys(testPassword);

        console.log('📍 Step 3: Click login button');
        const loginButton = await driver.findElement(By.css('button[type="submit"]'));
        await loginButton.click();
        await driver.sleep(3000);  // Wait for login

        console.log('📍 Step 4: Navigate to Rate Plans');
        await driver.get(`${baseUrl}/get-started/rate-plans`);
        await driver.sleep(3000);  // Wait for page load

        // Dismiss cookie consent if present
        console.log('📍 Step 5: Check for cookie popup');
        try {
            const acceptButton = await driver.findElement(By.xpath('//button[contains(text(), "Accept")]'));
            await acceptButton.click();
            console.log('✅ Dismissed cookie consent');
            await driver.sleep(1000);
        } catch (e) {
            console.log('ℹ️ No cookie popup found');
        }

        // Take screenshot of the page
        console.log('📸 Taking screenshot of Rate Plans page');
        const screenshot = await driver.takeScreenshot();
        const fs = require('fs');
        const path = require('path');
        const screenshotPath = path.join(__dirname, '..', 'screenshots', 'discovery-rateplans-page.png');
        fs.writeFileSync(screenshotPath, screenshot, 'base64');
        console.log(`📸 Screenshot saved: ${screenshotPath}`);

        // Get page title
        const title = await driver.getTitle();
        console.log(`📄 Page title: ${title}`);

        // Get current URL
        const currentUrl = await driver.getCurrentUrl();
        console.log(`🔗 Current URL: ${currentUrl}`);

        // Try to find "+ New Rate Plan" button with different selectors
        console.log('🔍 Searching for "+ New Rate Plan" button...');

        const buttonSelectors = [
            { name: 'Text contains "New Rate Plan"', by: By.xpath('//button[contains(text(), "New Rate Plan")]') },
            { name: 'Text contains "+ New"', by: By.xpath('//button[contains(text(), "+ New")]') },
            { name: 'Class contains "primary"', by: By.css('button[class*="primary"]') },
            { name: 'Any button element', by: By.css('button') }
        ];

        for (const selector of buttonSelectors) {
            try {
                const buttons = await driver.findElements(selector.by);
                if (buttons.length > 0) {
                    console.log(`✅ Found ${buttons.length} button(s) with selector: ${selector.name}`);

                    // Get text from first few buttons
                    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
                        const text = await buttons[i].getText();
                        const className = await buttons[i].getAttribute('class');
                        console.log(`   Button ${i + 1}: Text="${text}", Class="${className}"`);
                    }
                }
            } catch (e) {
                console.log(`❌ Selector failed: ${selector.name}`);
            }
        }

        // Check for wizard modal
        console.log('🔍 Checking for wizard elements...');
        try {
            const wizardElements = await driver.findElements(By.css('[class*="rate-np"]'));
            console.log(`Found ${wizardElements.length} elements with "rate-np" class`);
        } catch (e) {
            console.log('No wizard elements found');
        }

        // Print all classes on the page
        console.log('📋 Dumping page structure...');
        const bodyHtml = await driver.findElement(By.css('body')).getAttribute('outerHTML');
        const classMatches = bodyHtml.match(/class="([^"]*)"/g) || [];
        const uniqueClasses = [...new Set(classMatches)].slice(0, 20);  // First 20 unique classes
        console.log('Sample classes found:', uniqueClasses.join('\n'));

        // Basic assertion
        expect(currentUrl).toContain('rate-plans');
    }, 60000);
});
