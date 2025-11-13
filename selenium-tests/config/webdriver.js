const { Builder, Browser, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

class WebDriverManager {
  constructor() {
    this.driver = null;
    this.browser = process.env.BROWSER || 'chrome';
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  }

  async createDriver() {
    const options = this.getBrowserOptions();
    
    try {
      // Let Selenium automatically manage ChromeDriver version
      this.driver = await new Builder()
        .forBrowser(this.browser)
        .setChromeOptions(options.chrome)
        .setFirefoxOptions(options.firefox)
        .build();
      
      // Set implicit wait timeout
      await this.driver.manage().setTimeouts({ implicit: 10000 });
      
      // Maximize window for consistent testing
      await this.driver.manage().window().maximize();
      
      console.log(`✅ WebDriver initialized for ${this.browser}`);
      return this.driver;
    } catch (error) {
      console.error(`❌ Failed to create WebDriver for ${this.browser}:`, error);
      throw error;
    }
  }

  getBrowserOptions() {
    const chromeOptions = new chrome.Options();
    const firefoxOptions = new firefox.Options();

    // Chrome options
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--disable-gpu');
    chromeOptions.addArguments('--window-size=1920,1080');
    
    // Add headless mode for CI
    if (process.env.CI || process.env.HEADLESS) {
      chromeOptions.addArguments('--headless');
      firefoxOptions.addArguments('--headless');
    }

    return {
      chrome: chromeOptions,
      firefox: firefoxOptions
    };
  }

  async quitDriver() {
    if (this.driver) {
      await this.driver.quit();
      console.log('✅ WebDriver closed');
    }
  }

  async navigateToApp() {
    if (!this.driver) {
      throw new Error('WebDriver not initialized');
    }
    
    console.log(`🌐 Navigating to ${this.baseUrl}`);
    await this.driver.get(this.baseUrl);
    
    // Wait for app to load - check for any meaningful title or just wait for page load
    try {
      await this.driver.wait(until.titleContains('Aforo'), 5000);
    } catch (error) {
      // If title doesn't contain 'Aforo', just wait for page to be ready
      console.log('⚠️ Title does not contain "Aforo", checking if page loaded...');
      const title = await this.driver.getTitle();
      console.log(`📄 Actual page title: "${title}"`);
      
      // Wait for body element to ensure page is loaded
      await this.driver.wait(until.elementLocated({ css: 'body' }), 10000);
      console.log('✅ Page loaded successfully');
    }
  }

  getDriver() {
    return this.driver;
  }

  getBaseUrl() {
    return this.baseUrl;
  }
}

module.exports = WebDriverManager;
