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
      loginForm: By.css('form, .login-form, [data-testid="login-form"]'),
      emailInput: By.css('input[type="email"], input[name="email"], #email, [data-testid="email-input"]'),
      passwordInput: By.css('input[type="password"], input[name="password"], #password, [data-testid="password-input"]'),
      loginButton: By.css('button[type="submit"], button:contains("Log in"), button:contains("Sign in"), [data-testid="login-button"]'),
      
      // Page elements
      pageTitle: By.css('h1, h2, .title, [data-testid="login-title"]'),
      errorMessage: By.css('.error, .error-message, [data-testid="error-message"]'),
      successMessage: By.css('.success, .success-message, [data-testid="success-message"]'),
      
      // Links
      signupLink: By.css('a[href*="signup"], a:contains("Sign up"), a:contains("Register")'),
      forgotPasswordLink: By.css('a[href*="forgot"], a[href*="reset"], a:contains("Forgot password")'),
      
      // Loading states
      loadingSpinner: By.css('.loading, .spinner, [data-testid="loading"]'),
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
      console.log('✅ Login form found');
      
      // Wait for email input to be present
      await this.driver.wait(until.elementLocated(this.selectors.emailInput), 5000);
      console.log('✅ Email input found');
      
      // Wait for password input to be present
      await this.driver.wait(until.elementLocated(this.selectors.passwordInput), 5000);
      console.log('✅ Password input found');
      
      // Wait for login button to be present
      await this.driver.wait(until.elementLocated(this.selectors.loginButton), 5000);
      console.log('✅ Login button found');
      
      return true;
    } catch (error) {
      console.log('❌ Login page elements not found:', error.message);
      return false;
    }
  }

  // Login methods
  async fillEmail(email) {
    console.log(`📧 Filling email: ${email}`);
    const emailInput = await this.driver.findElement(this.selectors.emailInput);
    await emailInput.clear();
    await emailInput.sendKeys(email);
  }

  async fillPassword(password) {
    console.log('🔒 Filling password');
    const passwordInput = await this.driver.findElement(this.selectors.passwordInput);
    await passwordInput.clear();
    await passwordInput.sendKeys(password);
  }

  async clickLoginButton() {
    console.log('🖱️ Clicking login button');
    const loginButton = await this.driver.findElement(this.selectors.loginButton);
    await loginButton.click();
  }

  async login(email = null, password = null) {
    const loginEmail = email || this.testUser.email;
    const loginPassword = password || this.testUser.password;
    
    console.log('🔐 Starting login process...');
    
    try {
      // Fill credentials
      await this.fillEmail(loginEmail);
      await this.fillPassword(loginPassword);
      
      // Click login
      await this.clickLoginButton();
      
      // Wait for redirect or error
      console.log('⏳ Waiting for login result...');
      
      // Check if we're redirected away from signin page (success)
      const loginSuccess = await this.driver.wait(async () => {
        const currentUrl = await this.driver.getCurrentUrl();
        return !currentUrl.includes('/signin');
      }, 10000);
      
      if (loginSuccess) {
        console.log('✅ Login successful - redirected from login page');
        return true;
      }
      
    } catch (error) {
      console.log('❌ Login failed:', error.message);
      
      // Check for error messages
      try {
        const errorElement = await this.driver.findElement(this.selectors.errorMessage);
        const errorText = await errorElement.getText();
        console.log('❌ Error message:', errorText);
      } catch (e) {
        console.log('❌ No error message found');
      }
      
      return false;
    }
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
      console.log(`📸 Screenshot saved: ${filename}`);
      return filepath;
    } catch (error) {
      console.log('❌ Failed to take screenshot:', error.message);
      return null;
    }
  }

  // Validation methods
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
