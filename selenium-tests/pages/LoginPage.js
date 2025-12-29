const { By, until, Key } = require('selenium-webdriver');

class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    // Test credentials
    this.testUser = {
      email: process.env.TEST_EMAIL || 'test@example.com',
      password: process.env.TEST_PASSWORD || 'password123'
    };

    // Login page selectors
    this.selectors = {
      // Login form elements
      loginForm: By.css('.signin-form'),
      emailInput: By.id('email'),
      passwordInput: By.id('password'),
      loginButton: By.css('.primary-btn'),

      // Validation errors
      emailError: By.id('email-error'),
      passwordError: By.id('password-error'),
      generalError: By.css('.error-msg'),

      // Page elements
      pageTitle: By.css('.signin-title'),

      // Links and Buttons
      togglePasswordButton: By.css('.toggle-password'),
      forgotPasswordLink: By.css('.forgot-link'),
      contactSalesLink: By.css('a[href="/contact-sales"]'),

      // Loading states
      submitButton: By.css('button[type="submit"]')
    };
  }

  // Navigation methods
  async navigateToLogin() {
    console.log('🔐 Navigating to Login page');
    await this.driver.get(`${this.baseUrl}/signin`);

    console.log('⏳ Waiting for Login page to load');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    try {
      // Wait for login form to be present
      await this.driver.wait(until.elementLocated(this.selectors.loginForm), 10000);

      // Wait for email input to be present
      await this.driver.wait(until.elementLocated(this.selectors.emailInput), 5000);

      return true;
    } catch (error) {
      console.log('❌ Login page elements not found:', error.message);
      return false;
    }
  }

  // Login methods
  async fillEmail(email) {
    const emailInput = await this.driver.findElement(this.selectors.emailInput);
    await emailInput.clear();
    // Send keys one by one to ensure React state updates
    for (const char of email) {
      await emailInput.sendKeys(char);
    }
  }

  async fillPassword(password) {
    const passwordInput = await this.driver.findElement(this.selectors.passwordInput);
    await passwordInput.clear();
    await passwordInput.sendKeys(password);
  }

  async clickLoginButton() {
    const loginButton = await this.driver.findElement(this.selectors.loginButton);
    await loginButton.click();
  }

  async login(email = null, password = null) {
    const loginEmail = email || this.testUser.email;
    const loginPassword = password || this.testUser.password;

    try {
      await this.fillEmail(loginEmail);
      await this.fillPassword(loginPassword);
      await this.clickLoginButton();

      // Wait for redirect or error
      try {
        await this.driver.wait(async () => {
          const currentUrl = await this.driver.getCurrentUrl();
          return !currentUrl.includes('/signin');
        }, 15000); // Increased from 5000 to 15000
        return true;
      } catch (e) {
        console.log('⚠️ Login redirect timed out, current URL:', await this.driver.getCurrentUrl());
        return false;
      }

    } catch (error) {
      console.log('❌ Login interaction failed:', error.message);
      return false;
    }
  }

  // Validation methods
  async getEmailError() {
    try {
      const errorElement = await this.driver.findElement(this.selectors.emailError);
      return await errorElement.getText();
    } catch (error) {
      return null;
    }
  }

  async getPasswordError() {
    try {
      const errorElement = await this.driver.findElement(this.selectors.passwordError);
      return await errorElement.getText();
    } catch (error) {
      return null;
    }
  }

  async getGeneralError() {
    try {
      const errorElement = await this.driver.findElement(this.selectors.generalError);
      return await errorElement.getText();
    } catch (error) {
      return null;
    }
  }

  // Interaction methods
  async togglePasswordVisibility() {
    const toggleBtn = await this.driver.findElement(this.selectors.togglePasswordButton);
    await toggleBtn.click();
  }

  async getPasswordInputType() {
    const passwordInput = await this.driver.findElement(this.selectors.passwordInput);
    return await passwordInput.getAttribute('type');
  }

  async clickContactSales() {
    const link = await this.driver.findElement(this.selectors.contactSalesLink);
    await link.click();
  }

  // Utility methods
  async getPageTitle() {
    try {
      const titleElement = await this.driver.findElement(this.selectors.pageTitle);
      return await titleElement.getText();
    } catch (error) {
      return await this.driver.getTitle();
    }
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async takeScreenshot(filename = 'login-page.png') {
    try {
      const screenshot = await this.driver.takeScreenshot();
      const fs = require('fs');
      const path = require('path');

      const screenshotDir = path.join(__dirname, '..', 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const filepath = path.join(screenshotDir, filename);
      fs.writeFileSync(filepath, screenshot, 'base64');
      return filepath;
    } catch (error) {
      console.log('❌ Failed to take screenshot:', error.message);
      return null;
    }
  }

  async isLoginFormVisible() {
    try {
      const form = await this.driver.findElement(this.selectors.loginForm);
      return await form.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  async areInputFieldsVisible() {
    try {
      const emailVisible = await (await this.driver.findElement(this.selectors.emailInput)).isDisplayed();
      const passwordVisible = await (await this.driver.findElement(this.selectors.passwordInput)).isDisplayed();
      return emailVisible && passwordVisible;
    } catch (error) {
      return false;
    }
  }

  async isLoginButtonEnabled() {
    try {
      const button = await this.driver.findElement(this.selectors.loginButton);
      return await button.isEnabled();
    } catch (error) {
      return false;
    }
  }
}

module.exports = LoginPage;
