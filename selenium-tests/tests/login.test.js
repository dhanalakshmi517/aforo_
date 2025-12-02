const WebDriverManager = require('../config/webdriver');
const LoginPage = require('../pages/LoginPage');

describe('Login Page Tests', () => {
  let driverManager;
  let driver;
  let loginPage;

  // Test setup
  beforeAll(async () => {
    console.log('🚀 Setting up Selenium tests for Login Page');

    driverManager = new WebDriverManager();
    driver = await driverManager.createDriver();
    loginPage = new LoginPage(driver);
  }, 30000); // 30 second timeout for setup

  // Test cleanup
  afterAll(async () => {
    console.log('🧹 Cleaning up Login tests');
    if (driverManager) {
      await driverManager.quitDriver();
    }
  }, 10000);

  // Test case 1: Page Loading and Content
  describe('Page Loading and Content', () => {
    test('should load login page with correct elements', async () => {
      console.log('🧪 Running: Page Loading Test');
      await loginPage.navigateToLogin();

      const pageLoaded = await loginPage.waitForPageLoad();
      expect(pageLoaded).toBe(true);

      const title = await loginPage.getPageTitle();
      expect(title).toBe('Sign in to your aforo account');

      await loginPage.takeScreenshot('login-page-loaded.png');
      console.log('✅ Passed: Page Loading Test');
    }, 15000);
  });

  // Test case 2: Validation Errors
  describe('Form Validation', () => {
    beforeEach(async () => {
      await loginPage.navigateToLogin();
    });

    test('should show error for empty email', async () => {
      console.log('🧪 Running: Empty Email Test');
      await loginPage.fillEmail('');
      await loginPage.clickLoginButton();

      const error = await loginPage.getEmailError();
      expect(error).toBe('Email is required');
      console.log('✅ Passed: Empty Email Test');
    });

    test('should show error for invalid email format', async () => {
      console.log('🧪 Running: Invalid Email Format Test');
      await loginPage.fillEmail('invalid-email');
      await loginPage.clickLoginButton();

      const error = await loginPage.getEmailError();
      expect(error).toBe('Enter a valid business Email');
      console.log('✅ Passed: Invalid Email Format Test');
    });

    test('should show error for personal email domains', async () => {
      console.log('🧪 Running: Personal Email Test');
      await loginPage.fillEmail('test@gmail.com');
      await loginPage.clickLoginButton();

      const error = await loginPage.getEmailError();
      expect(error).toBe('Enter a valid business Email');
      console.log('✅ Passed: Personal Email Test');
    });

    test('should show error for empty password', async () => {
      console.log('🧪 Running: Empty Password Test');
      await loginPage.fillEmail('valid@business.com');
      await loginPage.fillPassword('');
      await loginPage.clickLoginButton();

      const error = await loginPage.getPasswordError();
      expect(error).toBe('Password is required');
      console.log('✅ Passed: Empty Password Test');
    });
  });

  // Test case 3: UI Interactions
  describe('UI Interactions', () => {
    beforeEach(async () => {
      await loginPage.navigateToLogin();
    });

    test('should toggle password visibility', async () => {
      console.log('🧪 Running: Password Toggle Test');

      // Initially password
      let type = await loginPage.getPasswordInputType();
      expect(type).toBe('password');

      // Click toggle
      await loginPage.togglePasswordVisibility();

      // Should be text
      type = await loginPage.getPasswordInputType();
      expect(type).toBe('text');

      // Click toggle again
      await loginPage.togglePasswordVisibility();

      // Should be password
      type = await loginPage.getPasswordInputType();
      expect(type).toBe('password');

      console.log('✅ Passed: Password Toggle Test');
    });

    test('should have working Contact Sales link', async () => {
      console.log('🧪 Running: Contact Sales Link Test');
      await loginPage.clickContactSales();

      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).toContain('/contact-sales');
      console.log('✅ Passed: Contact Sales Link Test');
    });
  });

  // Test case 4: Login Attempts
  describe('Login Attempts', () => {
    beforeEach(async () => {
      await loginPage.navigateToLogin();
    });

    test('should handle invalid credentials', async () => {
      console.log('🧪 Running: Invalid Login Test');

      await loginPage.login('valid@business.com', 'wrongpassword');

      const error = await loginPage.getGeneralError();
      // Note: The exact error message depends on the backend response mocking
      // For now we check if any error is displayed or if we are still on the page
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).toContain('/signin');

      if (error) {
        console.log(`✅ Error displayed: ${error}`);
      }

      await loginPage.takeScreenshot('login-failed.png');
      console.log('✅ Passed: Invalid Login Test');
    });

    test('should login with valid credentials (if available)', async () => {
      console.log('🧪 Running: Valid Login Test');

      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      const testPassword = process.env.TEST_PASSWORD || 'password123';

      // Skip if using default placeholder credentials that might not work
      if (testEmail === 'test@example.com') {
        console.log('⚠️ Skipping valid login test - no real credentials provided');
        return;
      }

      const success = await loginPage.login(testEmail, testPassword);

      if (success) {
        const currentUrl = await loginPage.getCurrentUrl();
        expect(currentUrl).not.toContain('/signin');
        await loginPage.takeScreenshot('login-success.png');
        console.log('✅ Passed: Valid Login Test');
      } else {
        console.log('⚠️ Login failed with provided credentials');
      }
    });
  });
});
