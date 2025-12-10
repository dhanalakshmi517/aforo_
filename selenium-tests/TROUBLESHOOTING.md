# Selenium Tests - Quick Start Guide

## The Issue

When running `npx jest selenium-tests/tests/rateplan*.test.js` from the project root, Jest picks up the root `jest.config.js` which has `preset: 'ts-jest'`. This causes the error:

```
Preset ts-jest not found relative to rootDir
```

## Solutions

### ✅ Option 1: Run from selenium-tests directory (RECOMMENDED)

```bash
# Navigate to selenium-tests folder
cd selenium-tests

# Run the tests
npx jest tests/rateplan*.test.js
```

### ✅ Option 2: Use the provided script

```bash
# Make script executable (first time only)
chmod +x selenium-tests/run-tests.sh

# Run the script
./selenium-tests/run-tests.sh
```

### ✅ Option 3: Specify config explicitly

```bash
# From project root
npx jest selenium-tests/tests/rateplan*.test.js --config=selenium-tests/jest.config.js
```

### ✅ Option 4: Update package.json (permanent fix)

Add this to your root `package.json`:

```json
{
  "scripts": {
    "test:selenium": "cd selenium-tests && npx jest tests/",
    "test:rateplan": "cd selenium-tests && npx jest tests/rateplan*.test.js"
  }
}
```

Then run:
```bash
npm run test:rateplan
```

## Quick Fix for Your Current Situation

Since you're in WSL terminal at `/mnt/c/Users/eswar/OneDrive/Desktop/Test/aforo_`, just run:

```bash
cd selenium-tests
npx jest tests/rateplan*.test.js
```

This will use the correct Jest config that doesn't require ts-jest.

## Why This Happens

- Root `jest.config.js` is configured for TypeScript app tests (uses ts-jest)
- Selenium tests are pure JavaScript and have their own `selenium-tests/jest.config.js`
- When Jest runs from root, it finds root config first
- Solution: Either change directory or specify config explicitly
