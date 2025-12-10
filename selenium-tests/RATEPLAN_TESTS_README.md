# Rateplan Component - Selenium Test Suite

Comprehensive end-to-end tests for the Rateplan creation wizard covering all 5 steps, 5 pricing models, validations, navigation, and draft functionality.

## 📋 Test Coverage

### Test Suites Created

1. **`rateplan-wizard.test.js`** - Complete End-to-End Workflows
   - ✅ Flat Fee plan creation (with all extras)
   - ✅ Usage-Based plan creation
   - ✅ Tiered Pricing plan creation
   - ✅ Volume-Based plan creation
   - ✅ Stairstep plan creation
   - ✅ Draft save and resume functionality

2. **`rateplan-step1-details.test.js`** - Plan Details Validation
   - ✅ Required field validations (name, frequency, product, payment)
   - ✅ Field constraints (special characters, length)
   - ✅ Navigation controls (Next blocking/enabling)
   - ✅ Step locking logic
   - ✅ Data persistence on navigation

3. **`rateplan-navigation.test.js`** - Navigation & Flow
   - ✅ Forward navigation (Next button)
   - ✅ Backward navigation (Back button)
   - ✅ Data preservation during navigation
   - ✅ Sidebar navigation (jump between steps)
   - ✅ Locked step prevention
   - ✅ Current step highlighting

4. **`rateplan-validation.test.js`** - Validation & Error Handling
   - ✅ Pricing model validations (all 5 models)
   - ✅ Numeric field validations
   - ✅ Positive number constraints
   - ✅ Tier range sequence validation
   - ✅ Overage requirement rules
   - ✅ Discount percentage limits (0-100)
   - ✅ Error display and clearing
   - ✅ Special character handling
   - ✅ Decimal precision
   - ✅ Error correction flows

## 🏗️ Architecture

### Page Object Model

**`pages/RatePlanWizardPage.js`** (600+ lines)
- Encapsulates all wizard interactions
- Follows existing POM pattern from OrganizationPage
- Comprehensive selectors for all 5 steps
- Helper methods for all form interactions
- Utility methods (screenshots, errors, navigation)

### Test Organization

```
selenium-tests/
├── config/
│   └── webdriver.js              # WebDriver setup (existing)
├── pages/
│   ├── LoginPage.js               # Login helper (existing)
│   ├── OrganizationPage.js        # Reference (existing)
│   └── RatePlanWizardPage.js     # NEW - Complete wizard POM
├── tests/
│   ├── rateplan-wizard.test.js           # NEW - Complete workflows
│   ├── rateplan-step1-details.test.js    # NEW - Step 1 validation
│   ├── rateplan-navigation.test.js       # NEW - Navigation tests
│   └── rateplan-validation.test.js       # NEW - Validations
└── screenshots/                   # Auto-generated during tests
```

## 🚀 Running Tests

### Run All Rateplan Tests
```bash
npx jest selenium-tests/tests/rateplan*.test.js --config selenium-tests/jest.config.js
```

### Run Specific Test Suite
```bash
# Complete workflows
npx jest selenium-tests/tests/rateplan-wizard.test.js

# Step 1 validation
npx jest selenium-tests/tests/rateplan-step1-details.test.js

# Navigation tests
npx jest selenium-tests/tests/rateplan-navigation.test.js

# Validation tests
npx jest selenium-tests/tests/rateplan-validation.test.js
```

### Run in Headless Mode
```bash
HEADLESS=true npx jest selenium-tests/tests/rateplan*.test.js
```

### Run with Specific Browser
```bash
# Chrome (default)
npx jest selenium-tests/tests/rateplan*.test.js

# Firefox
BROWSER=firefox npx jest selenium-tests/tests/rateplan*.test.js
```

## ⚙️ Configuration

### Environment Variables

```bash
# Test user credentials
TEST_EMAIL=test@example.com
TEST_PASSWORD=password123

# Application URL
BASE_URL=http://localhost:3000

# Browser selection
BROWSER=chrome  # or firefox

# Headless mode
HEADLESS=true   # for CI/CD
```

### Test Data

Tests use **existing products and billable metrics** from your database. Common products tested:
- API Gateway
- Cloud Storage
- Database API

Tests will automatically select the first available product and metric if these aren't found.

### Cleanup Strategy

After each test completes:
- ✅ Created rate plans are submitted to the system
- ✅ Tests include cleanup by deleting test data
- 📸 Screenshots saved to `screenshots/` directory

## 📊 Test Statistics

- **Total Test Suites**: 4
- **Total Test Cases**: ~40+
- **Lines of Code**: ~2,500+
- **Page Object Model**: 600+ lines
- **Estimated Execution Time**: 15-20 minutes (all tests)
- **Screenshot Coverage**: Every major state captured

## 🎯 Coverage Highlights

### All 5 Pricing Models Tested
1. **Flat Fee** - Amount, API calls, overage, grace buffer
2. **Usage-Based** - Per-unit pricing
3. **Tiered Pricing** - Multiple tiers, unlimited option, overage
4. **Volume-Based** - Volume tiers with aggregated pricing
5. **Stairstep** - Flat cost per usage range

### All 4 Extras Tested
1. **Setup Fee** - Amount, timing, invoice description
2. **Discounts** - Percentage/flat, eligibility, date ranges
3. **Freemium** - Free units, trial duration, date ranges
4. **Minimum Commitment** - Usage or charge minimums

### Complete Wizard Navigation
- ✅ Next/Back buttons
- ✅ Sidebar step navigation
- ✅ Step locking/unlocking
- ✅ Data persistence
- ✅ Draft save/resume

### Comprehensive Validations
- ✅ Required field checks
- ✅ Numeric validations
- ✅ Range validations
- ✅ Business rule validations
- ✅ Error recovery

## 📸 Screenshots

Every test captures screenshots at key points:
- `workflow-*` - Complete workflow states
- `step1-validation-*` - Step 1 validations
- `nav-*` - Navigation states
- `validation-*` - Validation error states

All screenshots saved to: `selenium-tests/screenshots/`

## 🐛 Debugging

### View Test Output
```bash
npx jest selenium-tests/tests/rateplan*.test.js --verbose
```

### Keep Browser Open (Debug Mode)
Edit `config/webdriver.js` and comment out the headless options.

### Check Screenshots
All test states are captured in screenshots. Check `selenium-tests/screenshots/` for visual debugging.

### Common Issues

**Issue**: Tests fail with "Element not found"
**Solution**: Selectors may need adjustment. Check actual HTML structure and update `RatePlanWizardPage.js` selectors.

**Issue**: Login fails
**Solution**: Verify `TEST_EMAIL` and `TEST_PASSWORD` environment variables match valid credentials.

**Issue**: Timeouts
**Solution**: Increase `jest.config.js` timeout values or add more `driver.sleep()` calls.

## 🎨 Testing Best Practices

1. **Independent Tests** - Each test is self-contained
2. **Proper Cleanup** - Tests clean up created data
3. **Descriptive Names** - Test names clearly state action + expectation
4. **Screenshots** - Every important state captured
5. **Console Logging** - Detailed logs for debugging
6. **Error Handling** - Graceful handling of missing elements

## 📝 Adding New Tests

To add more tests, follow this pattern:

1. Use the Page Object Model (`RatePlanWizardPage`)
2. Follow existing test structure (describe/test blocks)
3. Always include:
   - Console logging for debugging
   - Screenshots for verification
   - Proper assertions
   - Cleanup after test

Example:
```javascript
test('should test something', async () => {
    console.log('🧪 Testing: Feature Name');
    
    // Setup
    await wizardPage.navigateToRatePlans();
    await wizardPage.clickCreateRatePlan();
    
    // Action
    await wizardPage.fillPlanName('Test');
    
    // Verify
    const isEnabled = await wizardPage.isNextButtonEnabled();
    expect(isEnabled).toBe(true);
    
    // Screenshot
    await wizardPage.takeScreenshot('my-test.png');
    
    console.log('✅ Test passed');
}, 30000);
```

## 🔄 Continuous Integration

For CI/CD pipelines, run in headless mode:

```yaml
# Example GitHub Actions
- name: Run Rateplan Tests
  run: |
    npm install
    HEADLESS=true npm run test:selenium
  env:
    TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
    TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

## 📞 Support

If tests fail or need adjustments:
1. Check console output for detailed error messages
2. Review screenshots in `screenshots/` directory
3. Verify selectors in `RatePlanWizardPage.js` match actual HTML
4. Ensure test environment is accessible at `localhost:3000`

---

**Test Suite Created**: December 2025  
**Framework**: Jest + Selenium WebDriver  
**Pattern**: Page Object Model (POM)  
**Coverage**: Comprehensive (all steps, all models, all validations)
