/** @type {import('jest').Config} */
module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/selenium-tests/tests/**/*.test.js'
  ],
  
  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/selenium-tests/setup.js'],
  
  // Test timeout (Selenium tests take longer)
  testTimeout: 60000, // 60 seconds
  
  // Coverage (optional)
  collectCoverage: false,
  
  // Verbose output
  verbose: true,
  
  // Detect open handles (useful for WebDriver cleanup)
  detectOpenHandles: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Display name for this test suite
  displayName: {
    name: 'Selenium E2E Tests',
    color: 'blue'
  },
  
  // Global setup/teardown (if needed)
  // globalSetup: '<rootDir>/selenium-tests/global-setup.js',
  // globalTeardown: '<rootDir>/selenium-tests/global-teardown.js',
  
  // Module paths
  moduleDirectories: ['node_modules', 'selenium-tests'],
  
  // Transform (if using ES6 modules)
  transform: {},
  
  // Test results processor
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './selenium-tests/reports',
      filename: 'selenium-test-report.html',
      expand: true
    }]
  ]
};
