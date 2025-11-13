# Selenium Tests for Aforo Rate Plans Component

This directory contains Selenium WebDriver tests for the Aforo application, specifically focusing on the Rate Plans component.

## 🚀 Quick Start

### Prerequisites
1. **Node.js** (v16 or higher)
2. **Chrome browser** installed
3. **Aforo application** running on `http://localhost:3000`

### Installation
```bash
# Install dependencies (from project root)
npm install

# Install Chrome driver (if not already installed)
npm install chromedriver
```

### Running Tests

#### Option 1: Using npm scripts (Recommended)
```bash
# Run tests with Chrome (default)
npm run test:selenium

# Run tests with specific browser
npm run test:selenium:chrome
npm run test:selenium:firefox
```

#### Option 2: Using the test runner directly
```bash
# Run with custom test runner
node selenium-tests/runner.js

# Run with Jest
npx jest --config selenium-tests/jest.config.js
```

#### Option 3: Environment variables
```bash
# Custom configuration
BROWSER=firefox BASE_URL=http://localhost:3001 npm run test:selenium

# Headless mode (for CI)
HEADLESS=true npm run test:selenium
```

## 📁 Directory Structure

```
selenium-tests/
├── config/
│   └── webdriver.js          # WebDriver configuration and setup
├── pages/
│   └── RatePlansPage.js       # Page Object Model for Rate Plans
├── tests/
│   └── rateplans.test.js      # Test cases for Rate Plans component
├── screenshots/               # Test screenshots (auto-generated)
├── reports/                   # Test reports (auto-generated)
├── logs/                      # Test logs (auto-generated)
├── runner.js                  # Custom test runner
├── setup.js                   # Jest setup configuration
├── jest.config.js             # Jest configuration for Selenium
└── README.md                  # This file
```

## 🧪 Test Cases

### Rate Plans Component Tests

#### 1. **Page Loading Tests**
- ✅ Verify Rate Plans page loads successfully
- ✅ Check page title and URL
- ✅ Ensure main content is visible

#### 2. **Rate Plans List Tests**
- ✅ Display rate plans list or empty state
- ✅ Verify table structure and data
- ✅ Test search functionality (if available)

#### 3. **Create Rate Plan Tests**
- ✅ Verify Create Rate Plan button exists
- ✅ Test button click opens wizard
- ✅ Verify wizard navigation

#### 4. **Rate Plan Actions Tests**
- ✅ Test Edit button functionality
- ✅ Test Resume Draft button (for draft plans)
- ✅ Test Delete button and confirmation

#### 5. **Error Handling Tests**
- ✅ Handle non-existent rate plans gracefully
- ✅ Test network delay scenarios
- ✅ Verify error notifications

## 🔧 Configuration

### Environment Variables
- `BROWSER`: Browser to use (`chrome`, `firefox`) - Default: `chrome`
- `BASE_URL`: Application URL - Default: `http://localhost:3000`
- `HEADLESS`: Run in headless mode (`true`, `false`) - Default: `false`
- `CI`: Automatically enables headless mode in CI environments

### Browser Options
The tests support multiple browsers with optimized configurations:

#### Chrome Options
- `--no-sandbox`
- `--disable-dev-shm-usage`
- `--disable-gpu`
- `--window-size=1920,1080`
- `--headless` (when enabled)

#### Firefox Options
- `--headless` (when enabled)
- Standard Firefox profile

## 📸 Screenshots

Screenshots are automatically captured during tests:
- `page-loaded.png` - Initial page load
- `rate-plans-list.png` - Rate plans list view
- `create-wizard-opened.png` - Create wizard opened
- `test-failure.png` - On test failures
- Custom screenshots for specific test scenarios

## 🐛 Debugging

### Common Issues

#### 1. **WebDriver not starting**
```bash
# Check if Chrome/Firefox is installed
google-chrome --version
firefox --version

# Reinstall chromedriver
npm install chromedriver --force
```

#### 2. **Application not accessible**
```bash
# Verify app is running
curl http://localhost:3000

# Check if port is correct
BASE_URL=http://localhost:3001 npm run test:selenium
```

#### 3. **Tests timing out**
- Increase timeout in `jest.config.js`
- Check if application is responsive
- Use headless mode for faster execution

#### 4. **Element not found errors**
- Check if selectors in `RatePlansPage.js` match your HTML
- Take screenshots to debug element visibility
- Verify page loading states

### Debug Mode
```bash
# Run with verbose output
DEBUG=true npm run test:selenium

# Keep browser open after tests (for debugging)
HEADLESS=false KEEP_OPEN=true npm run test:selenium
```

## 🚀 Extending Tests

### Adding New Test Cases
1. Add test methods to `selenium-tests/tests/rateplans.test.js`
2. Use the Page Object Model pattern
3. Follow existing naming conventions

### Adding New Page Objects
1. Create new page class in `selenium-tests/pages/`
2. Follow the pattern in `RatePlansPage.js`
3. Import and use in test files

### Custom Selectors
Update selectors in `RatePlansPage.js` to match your component structure:

```javascript
this.selectors = {
  // Add your custom selectors here
  customButton: By.css('[data-testid="custom-button"]'),
  customModal: By.css('.custom-modal')
};
```

## 📊 Test Reports

Test reports are generated in multiple formats:
- **Console output**: Real-time test progress
- **Screenshots**: Visual verification in `screenshots/`
- **HTML reports**: Detailed reports in `reports/` (if jest-html-reporters is installed)

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Selenium Tests
  run: |
    npm install
    npm start &  # Start your app
    sleep 10     # Wait for app to start
    HEADLESS=true npm run test:selenium
```

### Docker Support
```dockerfile
# Add to your Dockerfile for CI
RUN apt-get update && apt-get install -y \
    google-chrome-stable \
    firefox-esr
```

## 📝 Best Practices

1. **Use Page Object Model** - Keep selectors and actions in page classes
2. **Take Screenshots** - Capture evidence for debugging
3. **Handle Waits** - Use explicit waits instead of sleep
4. **Clean Up** - Always quit WebDriver in cleanup
5. **Environment Variables** - Make tests configurable
6. **Error Handling** - Gracefully handle missing elements
7. **Descriptive Names** - Use clear test and method names

## 🤝 Contributing

1. Follow existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Test in multiple browsers
5. Ensure CI compatibility

## 📞 Support

For issues with Selenium tests:
1. Check the console output for detailed error messages
2. Review screenshots in the `screenshots/` directory
3. Verify application is running and accessible
4. Check browser compatibility and versions
