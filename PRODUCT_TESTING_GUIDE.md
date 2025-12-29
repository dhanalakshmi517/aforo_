# 📦 Product Module Testing Guide

## 📋 Overview
This guide covers how to run Selenium tests for the **Product Creation** workflow.

The tests verify:
- Navigation to "Create Product" wizard.
- Step 1: General Details entry.
- Step 2: Configuration (API Product type).
- Step 3: Review and Creation.

---

## 🚀 How to Run (Quick)

1. **Ensure application is running**:
   ```bash
   # Terminal 1
   cd app
   wasp start
   ```

2. **Run the Product Creation Test**:
   ```bash
   cd selenium-tests
   ./run-product-tests.sh
   # OR
   npx jest tests/product-creation.test.js
   ```

---

## 📊 Test Results

### Finding Results:
- **Screenshots**: `selenium-tests/screenshots/`
  - `product-wizard-step1.png`
  - `product-wizard-step2.png`
  - `product-wizard-step3.png`
  - `product-creation-success.png`
- **Logs**: Console output will show step-by-step actions.

### Expected Success Output:
```
PASS tests/product-creation.test.js
  Product Module - Creation Tests
    ✓ should fill General Details (Step 1)
    ✓ should fill Configuration (Step 2 - API)
    ✓ should review and create product (Step 3)
```

---

## 🛠 Adding More Product Types

To test other types (e.g., FlatFile, SQL), edit `tests/product-creation.test.js`:

```javascript
test('should create FlatFile product', async () => {
    await productPage.clickCreateProduct();
    await productPage.fillGeneralDetails('FlatFile Test', '1.0', 'Desc');
    await productPage.clickSaveAndNext();
    
    // Select FlatFile
    await productPage.selectProductType('FLATFILE'); // Check exact value in dropdown
    
    // Fill specific fields
    await productPage.fillConfigurationFields({
        'File Format': 'CSV',
        'File Location': '/tmp/test.csv'
    });
    
    await productPage.clickSaveAndNext();
    await productPage.clickCreate();
});
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Button not found** | The test script has a robust fallback to navigate directly to `/get-started/products/new`. |
| **Select not working** | Ensure the dropdown value matches the option value (e.g., "API" vs "api"). |
| **TimeoutError** | Check if the app is running slow. Increase timeout in `jest.setTimeout`. |

