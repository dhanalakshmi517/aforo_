# Step-by-Step Guide: Running Selenium Tests for Organization Form

## 📋 Prerequisites Checklist

Before running the tests, ensure you have:

- ✅ **Node.js** (v16 or higher) - Check with: `node --version`
- ✅ **Google Chrome** browser installed
- ✅ **Project dependencies** installed
- ✅ **Application running** on http://localhost:3000

## 🚀 Step 1: Install Dependencies

First, make sure all required npm packages are installed.

```bash
# Navigate to the project root
cd /Users/shyambodicherla/Desktop/A_test/aforo_

# Install root dependencies (includes selenium-webdriver, chromedriver, jest)
npm install

# Verify selenium packages are installed
npm list selenium-webdriver chromedriver jest
```

Expected output should show:
```
selenium-webdriver@4.38.0
chromedriver@142.0.3
jest@30.0.5
```

## 🏃 Step 2: Start the Application

The tests need the application to be running. Open a **new terminal window** and start your app:

```bash
# Terminal 1: Start the application
cd /Users/shyambodicherla/Desktop/A_test/aforo_/app

# Start the Wasp application (adjust command if different)
wasp start

# Or if you use a different command:
# npm start
# npm run dev
```

**Wait** for the application to fully start. You should see output indicating the server is running.

**Verify** the app is accessible:
- Open http://localhost:3000/contact-sales in your browser
- Confirm the Organization form loads correctly
- Keep this terminal running!

## 🧪 Step 3: Run the Tests

Open a **second terminal window** for running tests:

```bash
# Terminal 2: Navigate to selenium-tests directory
cd /Users/shyambodicherla/Desktop/A_test/aforo_/selenium-tests
```

### Option A: Run All Requirements Tests (Recommended)

This runs the comprehensive 31-test suite covering all 7 requirements:

```bash
npx jest tests/organization-requirements-validation.test.js --verbose
```

### Option B: Run Specific Requirement

Run only tests for a specific requirement:

```bash
# Requirement 1: First Name and Last Name mandatory
npx jest tests/organization-requirements-validation.test.js -t "REQUIREMENT 1"

# Requirement 2: Email validation
npx jest tests/organization-requirements-validation.test.js -t "REQUIREMENT 2"

# Requirement 3: Company, Role, Employee Size mandatory
npx jest tests/organization-requirements-validation.test.js -t "REQUIREMENT 3"

# Requirement 4: Country flag icons
npx jest tests/organization-requirements-validation.test.js -t "REQUIREMENT 4"

# Requirement 5: Optional help field
npx jest tests/organization-requirements-validation.test.js -t "REQUIREMENT 5"

# Requirement 6: Checkbox state management
npx jest tests/organization-requirements-validation.test.js -t "REQUIREMENT 6"

# Requirement 7: Button activation
npx jest tests/organization-requirements-validation.test.js -t "REQUIREMENT 7"
```

### Option C: Run in Headless Mode (Faster, No Browser Window)

For faster execution without seeing the browser:

```bash
HEADLESS=true npx jest tests/organization-requirements-validation.test.js
```

### Option D: Run All Organization Tests

Run both the original and new test suites:

```bash
npx jest tests/organization-*.test.js
```

## 📊 Step 4: View Test Results

### Console Output

As tests run, you'll see real-time output like:

```
PASS  tests/organization-requirements-validation.test.js
  Organization Form - Complete Requirements Validation
    ✅ REQUIREMENT 1: First Name and Last Name Mandatory
      ✓ 1.1: Form blocks progression when First Name is empty (2345ms)
      ✓ 1.2: Form blocks progression when Last Name is empty (2123ms)
      ✓ 1.3: Form allows progression when both names are valid (2456ms)
    ✅ REQUIREMENT 2: Business Email Validation
      ✓ 2.1: Form rejects @gmail.com emails (2567ms)
      ...

Test Suites: 1 passed, 1 total
Tests:       31 passed, 31 total
Time:        120.456s
```

### Screenshots

Every test captures a screenshot. View them:

```bash
# List all screenshots
ls -la selenium-tests/screenshots/

# Open screenshots folder in Finder (macOS)
open selenium-tests/screenshots/

# View a specific screenshot
open selenium-tests/screenshots/req1-1-firstname-required.png
```

Screenshot naming convention:
- `req1-1-firstname-required.png` - Requirement 1, Test 1
- `req2-3-io-email-accepted.png` - Requirement 2, Test 3
- `req7-3-step4-ready-to-submit.png` - Requirement 7, Test 3, Step 4

### HTML Test Report

A detailed HTML report is generated:

```bash
# Open the test report in your browser
open selenium-tests/reports/selenium-test-report.html
```

The report shows:
- Total tests passed/failed
- Execution time for each test
- Error messages for failed tests
- Overall test summary

## 🔍 Understanding Test Results

### All Tests Passing ✅

```
Test Suites: 1 passed, 1 total
Tests:       31 passed, 31 total
```

**Meaning**: All validation requirements are working correctly!

### Some Tests Failing ❌

```
Test Suites: 1 failed, 1 total
Tests:       25 passed, 6 failed, 31 total

FAIL tests/organization-requirements-validation.test.js
  ✅ REQUIREMENT 6: Terms Checkbox Disabled Until Valid
    ✕ 6.1: Checkbox is disabled when form is empty (1234ms)
```

**Common Failures & Meanings**:

1. **Requirement 6 tests fail** (Checkbox state management)
   - **Cause**: Form doesn't currently implement checkbox disabling logic
   - **Action**: Form code needs to be updated to disable checkbox until fields are valid

2. **Requirement 7 tests fail** (Button activation)
   - **Cause**: Form doesn't currently implement button disabling based on checkbox
   - **Action**: Form code needs to be updated to disable button until checkbox is checked

3. **Flag icon tests fail** (Requirement 4)
   - **Cause**: Flag CSS classes might not be loading correctly
   - **Action**: Verify `flag-icons` package is installed and CSS is imported

### Exit Codes

```bash
# Check the exit code after tests complete
echo $?

# 0 = All tests passed
# 1 = Some tests failed
```

## 🐛 Troubleshooting

### Problem: "Cannot find module 'selenium-webdriver'"

**Solution**:
```bash
cd /Users/shyambodicherla/Desktop/A_test/aforo_
npm install selenium-webdriver chromedriver --save-dev
```

### Problem: "ChromeDriver version mismatch"

**Solution**:
```bash
npm install chromedriver@latest --save-dev
```

### Problem: "Application not accessible at http://localhost:3000"

**Solution**:
1. Check Terminal 1 - is the app running?
2. Try accessing http://localhost:3000/contact-sales in browser
3. Verify the correct port (might be 3001, 3002, etc.)
4. If different port, set: `BASE_URL=http://localhost:3001 npx jest ...`

### Problem: Tests timeout

**Solution**:
```bash
# Increase timeout in jest.config.js, or run one test at a time:
npx jest tests/organization-requirements-validation.test.js -t "1.1"
```

### Problem: "Cookie consent blocking form"

**Solution**: The tests automatically dismiss cookie consent. If still an issue, verify the cookie consent selector in `OrganizationPage.js`.

## 📈 Next Steps

After running the tests:

1. **Review Screenshots**
   - Verify visual behavior matches expectations
   - Check for any UI issues

2. **Analyze Failed Tests**
   - Determine if failure is expected (feature not implemented)
   - Or if there's a bug in the form code

3. **Update Form Code** (if needed)
   - Implement missing validation logic (Requirements 6 & 7)
   - Fix any bugs discovered by tests

4. **Re-run Tests**
   - Verify fixes resolved the failures
   - Aim for 31/31 tests passing

## 🎯 Quick Reference Commands

```bash
# Run all requirements tests
cd /Users/shyambodicherla/Desktop/A_test/aforo_/selenium-tests
npx jest tests/organization-requirements-validation.test.js --verbose

# Run headless (faster)
HEADLESS=true npx jest tests/organization-requirements-validation.test.js

# Run specific requirement
npx jest tests/organization-requirements-validation.test.js -t "REQUIREMENT 1"

# View screenshots
open screenshots/

# View HTML report
open reports/selenium-test-report.html

# Clean screenshots before new run
rm screenshots/*.png
```

## 📞 Need Help?

If you encounter issues:

1. Check console output for detailed error messages
2. Review the screenshots to see what the browser saw
3. Verify application is running and accessible
4. Check that all dependencies are installed
5. Try running tests one at a time to isolate issues

---

**Happy Testing! 🎉**
