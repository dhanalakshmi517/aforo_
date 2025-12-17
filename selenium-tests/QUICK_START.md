# 🚀 Quick Start - Sign-In Credentials Test

## ⚡ Fastest Way to Run the Test

### Option 1: Using the Interactive Script (Recommended)
```bash
cd /Users/shyambodicherla/Desktop/A_test/aforo_/selenium-tests
./run-signin-test.sh
```
The script will guide you through everything!

### Option 2: Manual Commands

**Terminal 1 - Start the App:**
```bash
cd /Users/shyambodicherla/Desktop/A_test/aforo_/app
npm run dev
```

**Terminal 2 - Run the Test:**
```bash
cd /Users/shyambodicherla/Desktop/A_test/aforo_/selenium-tests
npm test tests/signin-credentials.test.js
```

---

## 📋 Test Case Summary

### Test: Verify sign-in credential handling after Contact Sales registration

**Precondition:** Contact Sales registration is completed and user has test credentials.

#### Steps:
1. Open the sign-in page
2. Enter the test username and password
3. Click the sign-in / submit button

#### Expected Results:

**Invalid Credentials:**
- ❌ Shows error: "Invalid credentials"
- 🔄 User remains on sign-in page

**Valid Credentials:**
- ✅ User redirected to `/dashboard`
- 🎯 Dashboard page loads successfully

---

## 🎯 What Was Changed

### SignIn.tsx Component Updates:
1. ✅ Error message changed to "Invalid credentials" (line 83)
2. ✅ Redirect URL changed to `/dashboard` (line 75)

### New Test File Created:
📄 `tests/signin-credentials.test.js`
- Tests invalid credentials scenario
- Tests valid credentials scenario
- Tests edge cases

---

## 📊 Expected Test Output

```
PASS  tests/signin-credentials.test.js
  Sign-in Credential Handling After Contact Sales Registration
    Verify sign-in credential handling after Contact Sales registration
      ✓ Invalid credentials case (2500ms)
      ✓ Valid credentials case (3000ms)
      ✓ Alternative validation (2800ms)
    Edge Cases and Additional Validation
      ✓ Valid email format, wrong password (1800ms)
      ✓ Non-existent user (1700ms)
      ✓ Error message visibility (1900ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

---

## 📸 Screenshots Generated

After running the test, check these screenshots:
- `invalid-credentials-error.png` - Shows the error message
- `valid-credentials-dashboard.png` - Shows successful login
- `error-message-styled.png` - Shows error styling

Location: `/Users/shyambodicherla/Desktop/A_test/aforo_/selenium-tests/screenshots/`

---

## 🔧 Environment Variables (Optional)

To test with real credentials:
```bash
TEST_EMAIL=your-email@company.com \
TEST_PASSWORD=your-password \
npm test tests/signin-credentials.test.js
```

---

## 📚 Full Documentation

For detailed information, see:
- 📖 `SIGNIN_TEST_GUIDE.md` - Complete step-by-step guide
- 🧪 `tests/signin-credentials.test.js` - Test implementation

---

## ✅ Quick Checklist

Before running the test:
- [ ] Node.js installed
- [ ] Chrome browser installed
- [ ] App running on http://localhost:3000
- [ ] Dependencies installed (`npm install`)

After running the test:
- [ ] All tests passed
- [ ] Screenshots generated
- [ ] Error message shows "Invalid credentials"
- [ ] Valid credentials redirect to dashboard

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| App not running | `cd app && npm run dev` |
| Dependencies missing | `npm install` |
| ChromeDriver error | `npm install chromedriver` |
| Test timeout | Check app is running on port 3000 |

---

**Ready to run?** Execute: `./run-signin-test.sh`
