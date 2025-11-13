const { By, until, Key } = require('selenium-webdriver');

class RatePlansPage {
  constructor(driver) {
    this.driver = driver;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    // Test credentials (you may need to adjust these)
    this.testUser = {
      email: process.env.TEST_EMAIL || 'test@example.com',
      password: process.env.TEST_PASSWORD || 'password123'
    };

    // Page selectors based on RatePlans.tsx analysis with data-testid attributes
    this.selectors = {
      // Main page elements
      container: By.css('[data-testid="rate-plans-container"]'),
      pageHeader: By.css('[data-testid="rate-plans-header"]'),
      createRatePlanButton: By.css('button:contains("New Rate Plan")'),
      createRatePlanEmptyButton: By.css('[data-testid="create-rate-plan-empty"]'),
      searchInput: By.css('input[placeholder*="Search"]'),
      
      // Table elements
      tableWrapper: By.css('[data-testid="rate-plans-table-wrapper"]'),
      ratePlansTable: By.css('[data-testid="rate-plans-table"]'),
      tableRows: By.css('[data-testid^="rate-plan-row-"]'),
      
      // Dynamic selectors for specific rate plans (use with ratePlanId)
      ratePlanRow: (id) => By.css(`[data-testid="rate-plan-row-${id}"]`),
      ratePlanName: (id) => By.css(`[data-testid="rate-plan-name-${id}"]`),
      ratePlanStatus: (id) => By.css(`[data-testid="rate-plan-status-${id}"]`),
      ratePlanActions: (id) => By.css(`[data-testid="rate-plan-actions-${id}"]`),
      
      // Action buttons (use with ratePlanId)
      editButton: (id) => By.css(`[data-testid="edit-${id}"]`),
      resumeDraftButton: (id) => By.css(`[data-testid="resume-draft-${id}"]`),
      deleteButton: (id) => By.css(`[data-testid="delete-${id}"]`),
      
      // Modals
      confirmDeleteModal: By.css('.confirm-delete-modal, [role="dialog"]'),
      confirmDeleteButton: By.css('button:contains("Yes, Delete")'),
      cancelDeleteButton: By.css('button:contains("Discard"), button:contains("Cancel")'),
      
      // Notifications
      notification: By.css('.notification'),
      successNotification: By.css('.notification:not(.error)'),
      errorNotification: By.css('.notification.error'),
      
      // Login page elements
      loginEmailInput: By.css('input[type="email"], input[name="email"], #email'),
      loginPasswordInput: By.css('input[type="password"], input[name="password"], #password'),
      loginButton: By.css('button[type="submit"], button:contains("Log in"), button:contains("Sign in")'),
      loginForm: By.css('form, .login-form'),
      
      // Create Rate Plan wizard (when opened)
      createPlanWizard: By.css('.create-price-plan, [data-testid="create-plan-wizard"]'),
      wizardSteps: By.css('.step, .wizard-step'),
      nextButton: By.css('button:contains("Next"), [data-testid="next-button"]'),
      backButton: By.css('button:contains("Back"), [data-testid="back-button"]'),
      saveDraftButton: By.css('button:contains("Save as Draft"), [data-testid="save-draft"]')
    };
  }

  // Authentication methods
  async login() {
    console.log('🔐 Attempting to login...');
    
    // Navigate to signin page
    await this.driver.get(`${this.baseUrl}/signin`);
    
    try {
      // Wait for login form
      await this.driver.wait(until.elementLocated(this.selectors.loginForm), 10000);
      
      // Fill email
      const emailInput = await this.driver.findElement(this.selectors.loginEmailInput);
      await emailInput.clear();
      await emailInput.sendKeys(this.testUser.email);
      
      // Fill password
      const passwordInput = await this.driver.findElement(this.selectors.loginPasswordInput);
      await passwordInput.clear();
      await passwordInput.sendKeys(this.testUser.password);
      
      // Click login button
      const loginButton = await this.driver.findElement(this.selectors.loginButton);
      await loginButton.click();
      
      // Wait for redirect (login success)
      await this.driver.wait(async () => {
        const currentUrl = await this.driver.getCurrentUrl();
        return !currentUrl.includes('/signin');
      }, 10000);
      
      console.log('✅ Login successful');
      return true;
      
    } catch (error) {
      console.log('❌ Login failed:', error.message);
      return false;
    }
  }

  // Navigation methods
  async navigateToRatePlans() {
    console.log('📍 Navigating to Rate Plans page');
    await this.driver.get(`${this.baseUrl}/get-started/rate-plans`);
    
    console.log('⏳ Waiting for Rate Plans page to load');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    console.log('⏳ Waiting for Rate Plans page to load');
    try {
      // Wait for either page header or table to be present
      await this.driver.wait(
        until.elementLocated(this.selectors.pageHeader),
        10000
      );
      console.log('✅ Rate Plans page loaded');
    } catch (error) {
      console.log('⚠️ Page header not found, checking for table...');
      await this.driver.wait(
        until.elementLocated(this.selectors.ratePlansTable),
        5000
      );
      console.log('✅ Rate Plans table found');
    }
  }

  // Search functionality
  async searchRatePlans(searchTerm) {
    console.log(`🔍 Searching for rate plans: "${searchTerm}"`);
    
    try {
      const searchInput = await this.driver.findElement(this.selectors.searchInput);
      await searchInput.clear();
      await searchInput.sendKeys(searchTerm);
      
      // Wait a moment for search to filter results
      await this.driver.sleep(1000);
      console.log('✅ Search completed');
    } catch (error) {
      console.log('⚠️ Search input not found, skipping search');
    }
  }

  // Rate plan list operations
  async getRatePlansList() {
    console.log('📋 Getting rate plans list');
    
    try {
      await this.driver.wait(until.elementLocated(this.selectors.tableRows), 5000);
      const rows = await this.driver.findElements(this.selectors.tableRows);
      
      const ratePlans = [];
      for (let row of rows) {
        try {
          const nameElement = await row.findElement(this.selectors.ratePlanNameCell);
          const name = await nameElement.getText();
          
          // Try to get status badge
          let status = 'Unknown';
          try {
            const statusElement = await row.findElement(this.selectors.statusBadge);
            status = await statusElement.getText();
          } catch (e) {
            // Status badge might not be present
          }
          
          ratePlans.push({ name, status });
        } catch (e) {
          console.log('⚠️ Could not parse rate plan row');
        }
      }
      
      console.log(`✅ Found ${ratePlans.length} rate plans`);
      return ratePlans;
    } catch (error) {
      console.log('⚠️ No rate plans found or table not loaded');
      return [];
    }
  }

  async getRatePlanByName(name) {
    console.log(`🎯 Looking for rate plan: "${name}"`);
    
    const ratePlans = await this.getRatePlansList();
    const found = ratePlans.find(plan => plan.name.includes(name));
    
    if (found) {
      console.log(`✅ Found rate plan: ${found.name}`);
    } else {
      console.log(`❌ Rate plan "${name}" not found`);
    }
    
    return found;
  }

  // Create rate plan functionality
  async clickCreateRatePlan() {
    console.log('➕ Clicking Create Rate Plan button');
    
    try {
      const createButton = await this.driver.findElement(this.selectors.createRatePlanButton);
      await createButton.click();
      
      // Wait for wizard to open
      await this.driver.wait(
        until.elementLocated(this.selectors.createPlanWizard),
        5000
      );
      
      console.log('✅ Create Rate Plan wizard opened');
      return true;
    } catch (error) {
      console.log('❌ Failed to open Create Rate Plan wizard:', error.message);
      return false;
    }
  }

  // Rate plan actions (Edit, Delete, Draft)
  async clickEditRatePlan(ratePlanName) {
    console.log(`✏️ Clicking Edit for rate plan: "${ratePlanName}"`);
    return await this.clickRatePlanAction(ratePlanName, this.selectors.editButton, 'Edit');
  }

  async clickResumeDraft(ratePlanName) {
    console.log(`📝 Clicking Resume Draft for rate plan: "${ratePlanName}"`);
    return await this.clickRatePlanAction(ratePlanName, this.selectors.draftButton, 'Resume Draft');
  }

  async clickDeleteRatePlan(ratePlanName) {
    console.log(`🗑️ Clicking Delete for rate plan: "${ratePlanName}"`);
    return await this.clickRatePlanAction(ratePlanName, this.selectors.deleteButton, 'Delete');
  }

  async clickRatePlanAction(ratePlanName, buttonSelector, actionName) {
    try {
      const rows = await this.driver.findElements(this.selectors.tableRows);
      
      for (let row of rows) {
        try {
          const nameElement = await row.findElement(this.selectors.ratePlanNameCell);
          const name = await nameElement.getText();
          
          if (name.includes(ratePlanName)) {
            const actionButton = await row.findElement(buttonSelector);
            await actionButton.click();
            console.log(`✅ ${actionName} clicked for "${ratePlanName}"`);
            return true;
          }
        } catch (e) {
          // Continue to next row
        }
      }
      
      console.log(`❌ Could not find ${actionName} button for "${ratePlanName}"`);
      return false;
    } catch (error) {
      console.log(`❌ Failed to click ${actionName}:`, error.message);
      return false;
    }
  }

  // Modal interactions
  async confirmDelete() {
    console.log('✅ Confirming delete action');
    
    try {
      await this.driver.wait(
        until.elementLocated(this.selectors.confirmDeleteModal),
        5000
      );
      
      const confirmButton = await this.driver.findElement(this.selectors.confirmDeleteButton);
      await confirmButton.click();
      
      console.log('✅ Delete confirmed');
      return true;
    } catch (error) {
      console.log('❌ Failed to confirm delete:', error.message);
      return false;
    }
  }

  async cancelDelete() {
    console.log('❌ Cancelling delete action');
    
    try {
      const cancelButton = await this.driver.findElement(this.selectors.cancelDeleteButton);
      await cancelButton.click();
      
      console.log('✅ Delete cancelled');
      return true;
    } catch (error) {
      console.log('❌ Failed to cancel delete:', error.message);
      return false;
    }
  }

  // Notification checking
  async waitForNotification(type = 'any', timeout = 5000) {
    console.log(`🔔 Waiting for ${type} notification`);
    
    try {
      let selector = this.selectors.notification;
      if (type === 'success') selector = this.selectors.successNotification;
      if (type === 'error') selector = this.selectors.errorNotification;
      
      await this.driver.wait(until.elementLocated(selector), timeout);
      
      const notification = await this.driver.findElement(selector);
      const text = await notification.getText();
      
      console.log(`✅ ${type} notification appeared: "${text}"`);
      return text;
    } catch (error) {
      console.log(`❌ No ${type} notification appeared within ${timeout}ms`);
      return null;
    }
  }

  // Utility methods
  async takeScreenshot(filename) {
    try {
      const screenshot = await this.driver.takeScreenshot();
      require('fs').writeFileSync(`selenium-tests/screenshots/${filename}`, screenshot, 'base64');
      console.log(`📸 Screenshot saved: ${filename}`);
    } catch (error) {
      console.log('❌ Failed to take screenshot:', error.message);
    }
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async getPageTitle() {
    return await this.driver.getTitle();
  }
}

module.exports = RatePlansPage;
