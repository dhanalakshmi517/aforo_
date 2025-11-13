const fs = require('fs');
const path = require('path');

// Global test setup for Selenium tests
console.log('🔧 Setting up Selenium test environment');

// Create necessary directories
const directories = [
  'selenium-tests/screenshots',
  'selenium-tests/reports',
  'selenium-tests/logs'
];

directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Set up global test configuration
global.testConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true' || process.env.CI === 'true',
  timeout: {
    default: 10000,
    long: 30000,
    short: 5000
  }
};

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Custom Jest matchers for Selenium
expect.extend({
  toBeValidUrl(received) {
    const pass = typeof received === 'string' && received.startsWith('http');
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid URL`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid URL`,
        pass: false,
      };
    }
  },
  
  toContainText(received, expected) {
    const pass = typeof received === 'string' && received.includes(expected);
    if (pass) {
      return {
        message: () => `expected "${received}" not to contain "${expected}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected "${received}" to contain "${expected}"`,
        pass: false,
      };
    }
  }
});

console.log('✅ Selenium test environment setup complete');
console.log(`🌐 Base URL: ${global.testConfig.baseUrl}`);
console.log(`🌍 Browser: ${global.testConfig.browser}`);
console.log(`👻 Headless: ${global.testConfig.headless}`);
