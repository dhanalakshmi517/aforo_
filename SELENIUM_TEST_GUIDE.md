# 🚀 Step-by-Step Guide: Running Selenium Tests

## 📋 Overview

This guide will walk you through running Selenium tests for your Aforo application, including tests for:
- Organization/Contact Sales form
- Rate Plans
- Sign-in functionality
- And more!

---

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- ✅ **Node.js** (v16+) - Check: `node --version`
- ✅ **Google Chrome** browser installed
- ✅ **Project cloned** to `/Users/shyambodicherla/Desktop/R_test/aforo_`

---

## 🎯 STEP 1: Install Dependencies

Open your terminal and run:

```bash
# Navigate to project root
cd /Users/shyambodicherla/Desktop/R_test/aforo_

# Install root dependencies
npm install

# Navigate to selenium-tests directory
cd selenium-tests

# Install selenium test dependencies
npm install
```

**Expected output:**
```
added 150 packages, and audited 151 packages in 15s
```

**Verify installation:**
```bash
npm list selenium-webdriver chromedriver jest
```

You should see:
- `selenium-webdriver@4.16.0` (or similar)
- `chromedriver@143.0.0` (or similar)
- `jest@29.7.0` (or similar)

---

## 🏃 STEP 2: Start the Application

The Selenium tests need your application running. Open a **NEW terminal window** (keep it separate):

### Terminal 1 (Application Server):

```bash
# Navigate to app directory
cd /Users/shyambodicherla/Desktop/R_test/aforo_/app

# Start the Wasp application
wasp start
```

**Wait for the application to start!** You should see output like:
```
[ Server ] Server listening on port 3000
[ Client ] Compiled successfully!
```

**Verify the app is running:**
- Open your browser
- Go to: http://localhost:3000
- You should see the application homepage

**⚠️ IMPORTANT: Keep this terminal running!**

---

## 🧪 STEP 3: Run the Selenium Tests

Now open a **SECOND terminal window** for running tests:

### Terminal 2 (Test Runner):

```bash
# Navigate to selenium-tests directory
cd /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests
```

### Option A: Run ALL Tests (Comprehensive)

```bash
npm test
```

This will run all test suites including:
- Login tests
- Organization form validation
- Rate plan tests
- And more!

### Option B: Run Specific Test Suites

**Run Organization Form Tests:**
```bash
npm run test:org
```

**Run Rate Plan Tests:**
```bash
npm run test:rateplan
```

**Run Requirements Validation Tests:**
```bash
npm run test:requirements
```

**Run Specific Test File:**
```bash
npx jest tests/signin-credentials.test.js
```

### Option C: Run in Headless Mode (Faster, No Browser Window)

```bash
npm run test:headless
```

Or for a specific test:
```bash
HEADLESS=true npx jest tests/organization-complete-validation.test.js
```

### Option D: Run with Verbose Output (More Details)

```bash
npm run test:verbose
```

---

## 📊 STEP 4: Understanding Test Results

### Console Output

As tests run, you'll see real-time output:

**✅ Passing Tests:**
```
PASS  tests/organization-complete-validation.test.js
  Organization Form - Complete Validation Suite
    ✓ Form loads successfully (2345ms)
    ✓ First Name validation works (1823ms)
    ✓ Email validation rejects personal emails (2156ms)
    ...

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Time:        45.678s
```

**❌ Failing Tests:**
```
FAIL  tests/organization-complete-validation.test.js
  Organization Form - Complete Validation Suite
    ✓ Form loads successfully (2345ms)
    ✕ Checkbox is disabled when form is empty (1234ms)
    
    Expected: checkbox to be disabled
    Received: checkbox is enabled

Test Suites: 1 failed, 1 total
Tests:       14 passed, 1 failed, 15 total
```

---

## 📸 STEP 5: View Test Screenshots

Every test captures screenshots for visual verification!

### View Screenshots in Finder:

```bash
# Open screenshots folder
open /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests/screenshots/
```

### View Specific Screenshot:

```bash
# List all screenshots
ls -la selenium-tests/screenshots/

# View a specific one
open selenium-tests/screenshots/req1-1-firstname-required.png
```

**Screenshot naming convention:**
- `req1-1-firstname-required.png` - Requirement 1, Test 1
- `form-loaded.png` - Initial form load
- `validation-error.png` - Validation error state
- `test-failure.png` - Screenshot when test fails

---

## 📄 STEP 6: View HTML Test Reports

Detailed HTML reports are generated automatically!

### Open the Test Report:

```bash
# Open in default browser
open /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests/reports/selenium-test-report.html
```

Or navigate to:
```
/Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests/reports/
```

**The report includes:**
- ✅ Total tests passed/failed
- ⏱️ Execution time for each test
- 📊 Overall test summary
- 🔍 Detailed error messages for failures

---

## 🎯 Available Test Suites

Here's what you can test:

| Test File | Description | Command |
|-----------|-------------|---------|
| `login.test.js` | Login functionality | `npx jest tests/login.test.js` |
| `signin-credentials.test.js` | Sign-in validation | `npx jest tests/signin-credentials.test.js` |
| `organization-complete-validation.test.js` | Complete org form validation | `npm run test:org` |
| `organization-requirements-validation.test.js` | All 7 requirements (31 tests) | `npm run test:requirements` |
| `rateplan-*.test.js` | Rate plan tests | `npm run test:rateplan` |
| `rateplans.test.js` | Rate plans page | `npx jest tests/rateplans.test.js` |

---

## 🐛 Troubleshooting

### Problem 1: "Cannot find module 'selenium-webdriver'"

**Solution:**
```bash
cd /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests
npm install
```

### Problem 2: "ChromeDriver version mismatch"

**Solution:**
```bash
npm install chromedriver@latest --save-dev
```

### Problem 3: "Application not accessible at http://localhost:3000"

**Solution:**
1. Check Terminal 1 - is the app running?
2. Try accessing http://localhost:3000 in browser
3. If app is on different port (e.g., 3001):
   ```bash
   BASE_URL=http://localhost:3001 npm test
   ```

### Problem 4: Tests timeout

**Solution:**
```bash
# Run tests one at a time
npx jest tests/organization-complete-validation.test.js -t "Form loads"

# Or increase timeout (edit jest.config.js)
```

### Problem 5: "Session not created: This version of ChromeDriver only supports Chrome version X"

**Solution:**
```bash
# Update ChromeDriver to match your Chrome version
npm install chromedriver@latest --save-dev
```

### Problem 6: Browser window closes too fast

**Solution:**
```bash
# Run in non-headless mode to see what's happening
HEADLESS=false npx jest tests/your-test.test.js
```

---

## 🔍 Analyzing Test Results

### All Tests Pass ✅

```
Test Suites: 5 passed, 5 total
Tests:       67 passed, 67 total
```

**Meaning:** All functionality is working correctly! 🎉

### Some Tests Fail ❌

```
Test Suites: 1 failed, 4 passed, 5 total
Tests:       60 passed, 7 failed, 67 total
```

**What to do:**
1. Check the console output for specific error messages
2. Review screenshots to see what the browser saw
3. Verify the application behavior manually
4. Fix the code if it's a bug
5. Update the test if expectations changed

---

## 📈 Next Steps After Running Tests

### 1. Review Results
- Check console output
- Review screenshots
- Open HTML report

### 2. Analyze Failures (if any)
- Identify which tests failed
- Understand why they failed
- Determine if it's a bug or expected behavior

### 3. Fix Issues
- Update application code if needed
- Fix validation logic
- Improve UI/UX

### 4. Re-run Tests
```bash
npm test
```

### 5. Share Results
- Screenshots are in: `selenium-tests/screenshots/`
- HTML report is in: `selenium-tests/reports/`
- Share with your team!

---

## 🎯 Quick Reference Commands

```bash
# Navigate to test directory
cd /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests

# Run all tests
npm test

# Run specific test suite
npm run test:org
npm run test:rateplan
npm run test:requirements

# Run in headless mode (faster)
npm run test:headless

# Run with verbose output
npm run test:verbose

# Run specific test file
npx jest tests/signin-credentials.test.js

# Run specific test by name
npx jest -t "Form loads successfully"

# View screenshots
open screenshots/

# View HTML report
open reports/selenium-test-report.html

# Clean screenshots before new run
rm screenshots/*.png
```

---

## 📞 Need Help?

If you encounter issues:

1. ✅ Check console output for detailed error messages
2. ✅ Review screenshots to see browser behavior
3. ✅ Verify application is running on http://localhost:3000
4. ✅ Ensure all dependencies are installed
5. ✅ Try running tests one at a time to isolate issues
6. ✅ Check Chrome and ChromeDriver versions match

---

## 🎉 Summary

**To run tests successfully:**

1. **Terminal 1:** Start app with `wasp start`
2. **Terminal 2:** Run tests with `npm test`
3. **Review:** Check console, screenshots, and HTML report
4. **Fix:** Address any failures
5. **Re-run:** Verify fixes work

**Happy Testing! 🚀**

---

*Last updated: 2025-12-29*
