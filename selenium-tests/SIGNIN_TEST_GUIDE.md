# Sign-In Credentials Test - Step-by-Step Guide

## Test Overview
This guide will help you run the Selenium test for verifying sign-in credential handling after Contact Sales registration.

**Test Title:** Verify sign-in credential handling after Contact Sales registration

**Precondition:** Contact Sales registration is completed and user has test credentials.

## What the Test Does

### Test Cases Covered:
1. **Invalid Credentials Test** - Verifies that entering invalid credentials shows "Invalid credentials" error
2. **Valid Credentials Test** - Verifies that valid credentials redirect to the dashboard
3. **Edge Cases** - Tests various scenarios like wrong password, non-existent users, etc.

---

## Prerequisites

Before running the test, ensure you have:

1. ✅ Node.js installed (v14 or higher)
2. ✅ Chrome browser installed
3. ✅ The application running locally on `http://localhost:3000`
4. ✅ Valid test credentials (optional, for valid credentials test)

---

## Step-by-Step Instructions

### Step 1: Navigate to the Selenium Tests Directory

```bash
cd /Users/shyambodicherla/Desktop/A_test/aforo_/selenium-tests
```

### Step 2: Install Dependencies (if not already installed)

```bash
npm install
```

This will install:
- Selenium WebDriver
- Jest (test runner)
- ChromeDriver
- Other required dependencies

### Step 3: Start Your Application

Open a **new terminal window** and start your application:

```bash
cd /Users/shyambodicherla/Desktop/A_test/aforo_/app
npm run dev
```

Wait until you see the application is running on `http://localhost:3000`

### Step 4: Run the Sign-In Credentials Test

Back in the selenium-tests directory, run:

```bash
npm test tests/signin-credentials.test.js
```

**Alternative: Run with verbose output**
```bash
npm run test:verbose -- tests/signin-credentials.test.js
```

**Alternative: Run in headless mode (no browser window)**
```bash
HEADLESS=true npm test tests/signin-credentials.test.js
```

### Step 5: (Optional) Run with Valid Credentials

To test the valid credentials scenario with real credentials:

```bash
TEST_EMAIL=your-email@company.com TEST_PASSWORD=your-password npm test tests/signin-credentials.test.js
```

Replace `your-email@company.com` and `your-password` with actual credentials from your Contact Sales registration.

---

## Understanding the Test Results

### Expected Output for Invalid Credentials Test:

```
🧪 Running: Invalid Credentials Test
Step 1: Open the sign-in page
✅ Sign-in page is open
Step 2: Enter the test username and password (invalid credentials)
✅ Entered credentials: invalid@business.com / wrongpassword123
Step 3: Click the sign-in / submit button
✅ Clicked sign-in button
Expected Result: The page shows the error text "Invalid credentials"
✅ Error message displayed: "Invalid credentials"
Expected Result: User remains on the sign-in page
✅ User remains on sign-in page
✅ Passed: Invalid Credentials Test
```

### Expected Output for Valid Credentials Test:

```
🧪 Running: Valid Credentials Test
Step 1: Open the sign-in page
✅ Sign-in page is open
Step 2: Enter the test username and password (valid credentials)
✅ Entered credentials: user@company.com / ********
Step 3: Click the sign-in / submit button
✅ Clicked sign-in button
Expected Result: User is redirected to the dashboard page
✅ User redirected to dashboard: http://localhost:3000/dashboard
✅ Passed: Valid Credentials Test
```

---

## Viewing Test Screenshots

After running the tests, screenshots are saved in:
```
/Users/shyambodicherla/Desktop/A_test/aforo_/selenium-tests/screenshots/
```

Screenshots include:
- `invalid-credentials-error.png` - Shows the "Invalid credentials" error message
- `valid-credentials-dashboard.png` - Shows the dashboard after successful login
- `error-message-styled.png` - Shows the styled error message

---

## Test Report

After running the tests, you can view the HTML report:

```bash
open reports/jest-html-reporters-attach/selenium-test-report/report.html
```

---

## Troubleshooting

### Issue: "ChromeDriver not found"
**Solution:** Install ChromeDriver
```bash
npm install chromedriver --save-dev
```

### Issue: "Application not running"
**Solution:** Make sure your app is running on http://localhost:3000
```bash
cd /Users/shyambodicherla/Desktop/A_test/aforo_/app
npm run dev
```

### Issue: "Test timeout"
**Solution:** Increase the timeout in the test or check if your application is slow to load

### Issue: "Valid credentials test skipped"
**Solution:** Provide real credentials via environment variables:
```bash
TEST_EMAIL=user@company.com TEST_PASSWORD=password npm test tests/signin-credentials.test.js
```

### Issue: "Cannot find module"
**Solution:** Install dependencies
```bash
npm install
```

---

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `npm test tests/signin-credentials.test.js` | Run the sign-in credentials test |
| `npm run test:verbose -- tests/signin-credentials.test.js` | Run with detailed output |
| `HEADLESS=true npm test tests/signin-credentials.test.js` | Run without opening browser |
| `TEST_EMAIL=email@company.com TEST_PASSWORD=pass npm test tests/signin-credentials.test.js` | Run with real credentials |

---

## Test Validation Checklist

After running the test, verify:

- [ ] Invalid credentials show "Invalid credentials" error message
- [ ] User remains on sign-in page after invalid credentials
- [ ] Valid credentials redirect to `/dashboard` URL
- [ ] Error message is visible and properly styled
- [ ] Screenshots are generated in the screenshots folder
- [ ] All test cases pass (green checkmarks in output)

---

## Next Steps

1. Review the test output in the terminal
2. Check the screenshots in the `screenshots/` folder
3. Review the HTML test report
4. If tests fail, check the error messages and screenshots
5. Verify the application behavior matches the expected results

---

## Contact & Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the test output and screenshots
3. Verify your application is running correctly
4. Check that the SignIn component has been updated with the changes

---

**Last Updated:** 2025-12-04
**Test File:** `/Users/shyambodicherla/Desktop/A_test/aforo_/selenium-tests/tests/signin-credentials.test.js`
