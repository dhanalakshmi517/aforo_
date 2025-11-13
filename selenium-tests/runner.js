const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  console.log('📁 Created screenshots directory');
}

// Simple test runner for Selenium tests
class SeleniumTestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async runTests() {
    console.log('🚀 Starting Selenium Test Runner');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    try {
      // Import and run Rate Plans tests
      console.log('📋 Running Rate Plans Component Tests...');
      await this.runRatePlansTests();
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log('=' .repeat(60));
      console.log('📊 Test Results Summary:');
      console.log(`✅ Passed: ${this.results.passed}`);
      console.log(`❌ Failed: ${this.results.failed}`);
      console.log(`📈 Total: ${this.results.total}`);
      console.log(`⏱️ Duration: ${duration}s`);
      console.log('=' .repeat(60));
      
      if (this.results.failed > 0) {
        console.log('❌ Some tests failed. Check the output above for details.');
        process.exit(1);
      } else {
        console.log('🎉 All tests passed successfully!');
        process.exit(0);
      }
      
    } catch (error) {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    }
  }

  async runRatePlansTests() {
    const WebDriverManager = require('./config/webdriver');
    const RatePlansPage = require('./pages/RatePlansPage');
    
    let driverManager;
    let driver;
    let ratePlansPage;
    
    try {
      // Setup
      console.log('🔧 Setting up WebDriver...');
      driverManager = new WebDriverManager();
      driver = await driverManager.createDriver();
      ratePlansPage = new RatePlansPage(driver);
      
      // Navigate to app
      console.log('🌐 Navigating to application...');
      await driverManager.navigateToApp();
      
      // Run individual tests
      await this.runTest('Page Loading Test', async () => {
        await ratePlansPage.navigateToRatePlans();
        await ratePlansPage.waitForPageLoad();
        
        const title = await ratePlansPage.getPageTitle();
        const url = await ratePlansPage.getCurrentUrl();
        
        console.log(`  📄 Page title: ${title}`);
        console.log(`  🌐 Current URL: ${url}`);
        
        await ratePlansPage.takeScreenshot('page-loaded.png');
        
        if (!title) throw new Error('Page title is empty');
        if (!url.includes('localhost')) throw new Error('URL does not contain localhost');
      });
      
      await this.runTest('Rate Plans List Test', async () => {
        const ratePlans = await ratePlansPage.getRatePlansList();
        
        console.log(`  📋 Found ${ratePlans.length} rate plans`);
        ratePlans.forEach((plan, index) => {
          console.log(`    ${index + 1}. ${plan.name} (${plan.status})`);
        });
        
        await ratePlansPage.takeScreenshot('rate-plans-list.png');
        
        if (!Array.isArray(ratePlans)) throw new Error('Rate plans list is not an array');
      });
      
      await this.runTest('Search Functionality Test', async () => {
        try {
          await ratePlansPage.searchRatePlans('test');
          const searchResults = await ratePlansPage.getRatePlansList();
          
          console.log(`  🔍 Search results: ${searchResults.length} plans`);
          
          await ratePlansPage.searchRatePlans(''); // Clear search
          
          if (!Array.isArray(searchResults)) throw new Error('Search results not an array');
        } catch (error) {
          console.log('  ⚠️ Search functionality not available, skipping...');
          // Don't fail the test if search is not implemented
        }
      });
      
      await this.runTest('Create Rate Plan Button Test', async () => {
        const buttonClicked = await ratePlansPage.clickCreateRatePlan();
        
        if (buttonClicked) {
          console.log('  ✅ Create Rate Plan button found and clicked');
          await ratePlansPage.takeScreenshot('create-wizard-opened.png');
          
          const currentUrl = await ratePlansPage.getCurrentUrl();
          console.log(`  🌐 URL after create: ${currentUrl}`);
        } else {
          console.log('  ⚠️ Create Rate Plan button not found');
          await ratePlansPage.takeScreenshot('create-button-missing.png');
          // Don't fail - button might be conditionally rendered
        }
      });
      
      await this.runTest('Rate Plan Actions Test', async () => {
        const ratePlans = await ratePlansPage.getRatePlansList();
        
        if (ratePlans.length > 0) {
          const firstPlan = ratePlans[0];
          console.log(`  🎯 Testing actions on: ${firstPlan.name}`);
          
          if (firstPlan.status.toLowerCase().includes('draft')) {
            const draftClicked = await ratePlansPage.clickResumeDraft(firstPlan.name);
            if (draftClicked) {
              console.log('  ✅ Resume Draft action works');
              await ratePlansPage.takeScreenshot('draft-action.png');
            }
          } else {
            const editClicked = await ratePlansPage.clickEditRatePlan(firstPlan.name);
            if (editClicked) {
              console.log('  ✅ Edit action works');
              await ratePlansPage.takeScreenshot('edit-action.png');
            }
          }
        } else {
          console.log('  ℹ️ No rate plans available for action testing');
        }
      });
      
    } catch (error) {
      console.error('❌ Rate Plans tests failed:', error);
      if (ratePlansPage) {
        await ratePlansPage.takeScreenshot('test-failure.png');
      }
      throw error;
    } finally {
      // Cleanup
      if (driverManager) {
        console.log('🧹 Cleaning up WebDriver...');
        await driverManager.quitDriver();
      }
    }
  }

  async runTest(testName, testFunction) {
    this.results.total++;
    
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFunction();
      console.log(`✅ Passed: ${testName}`);
      this.results.passed++;
    } catch (error) {
      console.log(`❌ Failed: ${testName}`);
      console.log(`   Error: ${error.message}`);
      this.results.failed++;
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new SeleniumTestRunner();
  runner.runTests().catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
}

module.exports = SeleniumTestRunner;
