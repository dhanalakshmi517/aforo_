# Authentication Setup for Selenium Tests

## ✅ Credentials Updated!

All Rateplan test files now use your actual credentials by default:

```javascript
const testEmail = 'shyambss07@ai.ai';
const testPassword = '^j$GfNQm';
```

---

## Why Authentication is Needed

You're absolutely correct in your understanding:

1. **Rate Plans page is PROTECTED** - You must be logged in to access it
2. **Login is REQUIRED** - We can't skip authentication
3. **Tests handle login automatically** - Each test suite logs in once in `beforeAll()`

---

## How It Works Now

Each test file:
1. Starts the browser
2. **Automatically logs in** with your credentials
3. Navigates to Rate Plans page
4. Runs the tests
5. Logs out and closes browser

---

## Run Tests Now

Simply run:

```bash
npm run test:rateplan
```

The tests will:
- ✅ Use `shyambss07@ai.ai` / `^j$GfNQm` to login
- ✅ Access the Rate Plans page
- ✅ Run all test cases

---

## Security Note (Optional)

For better security in production, use environment variables:

```bash
# Set credentials
export TEST_EMAIL="shyambss07@ai.ai"
export TEST_PASSWORD="^j\$GfNQm"

# Run tests
npm run test:rateplan
```

But for now, the hardcoded credentials in the test files will work fine!

---

## What Was Updated

✅ `rateplan-wizard.test.js` - Login credentials updated  
✅ `rateplan-step1-details.test.js` - Login credentials updated  
✅ `rateplan-navigation.test.js` - Login credentials updated  
✅ `rateplan-validation.test.js` - Login credentials updated  

All tests will now **automatically authenticate** before running! 🎉
