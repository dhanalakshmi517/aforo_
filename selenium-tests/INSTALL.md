# 🔧 Quick Fix - Install Dependencies

## Issue
The `selenium-webdriver` package (and other dependencies) are not installed.

## Solution

**Run this command in your WSL terminal** (you're already in the right directory):

```bash
npm install
```

This will install:
- `selenium-webdriver` - For browser automation
- `jest` - Test framework
- `chromedriver` - Chrome browser driver

---

## After Installation

Once `npm install` completes, run your tests:

```bash
npm test tests/rateplan*.test.js
```

Or use the shortcut:

```bash
npm run test:rateplan
```

---

## What I Fixed

Updated `package.json` to include all required dependencies:

```json
{
  "dependencies": {
    "selenium-webdriver": "^4.16.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "chromedriver": "^120.0.0"
  }
}
```

---

## Troubleshooting

If `npm install` fails:

1. Make sure you have Node.js installed:
   ```bash
   node --version  # Should show v16 or higher
   npm --version
   ```

2. If you get permission errors:
   ```bash
   sudo npm install
   ```

3. If packages conflict:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

**Run `npm install` now and you'll be ready to go!** 🚀
