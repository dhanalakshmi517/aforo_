#!/usr/bin/env node

/**
 * Simple script to run Selenium tests for Login page only
 * Usage: node run-login-tests.js
 */

const path = require('path');
const { spawn } = require('child_process');

console.log('🔐 Starting Selenium Tests for Login Page');
console.log('=' .repeat(50));

// Check if dependencies are installed
try {
  require('selenium-webdriver');
  console.log('✅ Selenium WebDriver found');
} catch (error) {
  console.log('❌ Selenium WebDriver not found. Run: npm install');
  process.exit(1);
}

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.BROWSER = process.env.BROWSER || 'chrome';
process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.log(`🌍 Browser: ${process.env.BROWSER}`);
console.log(`🌐 Base URL: ${process.env.BASE_URL}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV}`);

// Show test credentials
const testEmail = process.env.TEST_EMAIL || 'test@example.com';
const testPassword = process.env.TEST_PASSWORD ? '***hidden***' : 'password123';
console.log(`👤 Test Email: ${testEmail}`);
console.log(`🔒 Test Password: ${testPassword}`);
console.log('');

// Run Jest with specific test file
const jestConfigPath = path.join(__dirname, 'selenium-tests', 'jest.config.js');
const testFilePath = path.join(__dirname, 'selenium-tests', 'tests', 'login.test.js');

console.log('📋 Executing Login Tests...');
console.log(`📁 Jest config: ${jestConfigPath}`);
console.log(`📄 Test file: ${testFilePath}`);
console.log('');

const jestProcess = spawn('npx', [
  'jest',
  testFilePath,
  '--config', jestConfigPath,
  '--verbose',
  '--no-cache'
], {
  stdio: 'inherit',
  env: process.env
});

jestProcess.on('close', (code) => {
  console.log('');
  console.log('=' .repeat(50));
  
  if (code === 0) {
    console.log('🎉 All Login tests completed successfully!');
    console.log('📸 Check selenium-tests/screenshots/ for test evidence');
  } else {
    console.log(`❌ Login tests failed with exit code: ${code}`);
    console.log('📸 Check selenium-tests/screenshots/ for debugging');
  }
  
  console.log('=' .repeat(50));
  process.exit(code);
});

jestProcess.on('error', (error) => {
  console.error('💥 Failed to start login tests:', error);
  process.exit(1);
});
