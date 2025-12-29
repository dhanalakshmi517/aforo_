# 🎯 QUICK START: Run Selenium Tests in 3 Steps

## ⚡ The Fastest Way to Run Tests

### Method 1: Using the Interactive Script (RECOMMENDED)

```bash
cd /Users/shyambodicherla/Desktop/R_test/aforo_
./run-selenium-tests-guide.sh
```

The script will:
- ✅ Check if your app is running
- ✅ Install dependencies if needed
- ✅ Let you choose which tests to run
- ✅ Show you where results are saved
- ✅ Optionally open results for you

---

### Method 2: Manual Steps

#### Step 1: Start the Application

**Terminal 1:**
```bash
cd /Users/shyambodicherla/Desktop/R_test/aforo_/app
wasp start
```

Wait until you see:
```
[ Server ] Server listening on port 3000
[ Client ] Compiled successfully!
```

#### Step 2: Run the Tests

**Terminal 2:**
```bash
cd /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests
npm test
```

#### Step 3: View Results

```bash
# Open screenshots
open screenshots/

# Open HTML report
open reports/selenium-test-report.html
```

---

## 📊 What Tests Are Available?

| Command | What It Tests | Time |
|---------|---------------|------|
| `npm test` | Everything | ~2-3 min |
| `npm run test:org` | Organization form | ~30 sec |
| `npm run test:rateplan` | Rate plans | ~45 sec |
| `npm run test:requirements` | All 31 requirements | ~2 min |
| `npx jest tests/login.test.js` | Login only | ~15 sec |
| `npm run test:headless` | All (no browser window) | ~1-2 min |

---

## 🎬 What Happens When You Run Tests?

1. **Browser Opens** (unless headless mode)
   - Chrome browser window appears
   - Tests run automatically
   - You can watch the automation!

2. **Tests Execute**
   - Forms are filled out
   - Buttons are clicked
   - Validations are checked
   - Screenshots are captured

3. **Results Are Generated**
   - Console shows pass/fail
   - Screenshots saved to `screenshots/`
   - HTML report saved to `reports/`

---

## 📸 Understanding Results

### Console Output

**✅ All Passing:**
```
PASS  tests/organization-complete-validation.test.js
  ✓ Form loads successfully (2345ms)
  ✓ First Name validation works (1823ms)
  ✓ Email validation works (2156ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Time:        45.678s
```

**❌ Some Failing:**
```
FAIL  tests/organization-complete-validation.test.js
  ✓ Form loads successfully (2345ms)
  ✕ Checkbox validation fails (1234ms)

Test Suites: 1 failed, 1 total
Tests:       14 passed, 1 failed, 15 total
```

### Screenshots

Every test captures screenshots:
- `form-loaded.png` - Initial state
- `validation-error.png` - Error states
- `test-failure.png` - When test fails
- `req1-1-firstname-required.png` - Specific test scenarios

### HTML Report

Beautiful visual report showing:
- Total pass/fail count
- Execution time
- Detailed error messages
- Test suite breakdown

---

## 🐛 Common Issues & Quick Fixes

### ❌ "Application not accessible"

**Fix:**
```bash
# Make sure app is running
cd /Users/shyambodicherla/Desktop/R_test/aforo_/app
wasp start
```

### ❌ "Cannot find module 'selenium-webdriver'"

**Fix:**
```bash
cd /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests
npm install
```

### ❌ "ChromeDriver version mismatch"

**Fix:**
```bash
npm install chromedriver@latest --save-dev
```

### ❌ Tests timeout

**Fix:**
```bash
# Run one test at a time
npx jest tests/login.test.js
```

---

## 🎯 Most Common Use Cases

### "I want to test everything"
```bash
cd /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests
npm test
```

### "I want to test just the organization form"
```bash
npm run test:org
```

### "I want to run tests without seeing the browser"
```bash
npm run test:headless
```

### "I want to test a specific feature"
```bash
npx jest tests/signin-credentials.test.js
```

---

## 📁 Where Are My Results?

After running tests, find results here:

```
/Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests/
├── screenshots/          ← 📸 All test screenshots
│   ├── form-loaded.png
│   ├── validation-error.png
│   └── ...
└── reports/             ← 📄 HTML test reports
    └── selenium-test-report.html
```

**Quick access:**
```bash
cd /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests
open screenshots/
open reports/selenium-test-report.html
```

---

## ✅ Success Checklist

Before running tests:
- [ ] App is running on http://localhost:3000
- [ ] Dependencies are installed (`npm install`)
- [ ] Chrome browser is installed

After running tests:
- [ ] Check console for pass/fail summary
- [ ] Review screenshots in `screenshots/` folder
- [ ] Open HTML report for detailed results
- [ ] Fix any failing tests if needed

---

## 🚀 Ready to Start?

**Option 1 - Interactive Script:**
```bash
cd /Users/shyambodicherla/Desktop/R_test/aforo_
./run-selenium-tests-guide.sh
```

**Option 2 - Manual:**
1. Terminal 1: `cd app && wasp start`
2. Terminal 2: `cd selenium-tests && npm test`
3. View results: `open screenshots/ && open reports/selenium-test-report.html`

---

**Need more details?** See `SELENIUM_TEST_GUIDE.md` for comprehensive documentation.

**Happy Testing! 🎉**
