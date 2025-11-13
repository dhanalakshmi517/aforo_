#!/usr/bin/env node

/**
 * Simple script to run Selenium tests for Rate Plans component
 * Usage: node run-selenium-tests.js
 */

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Selenium Tests for Rate Plans Component');
console.log('=' .repeat(60));

// Check if dependencies are installed
try {
  require('selenium-webdriver');
  console.log('✅ Selenium WebDriver found');
} catch (error) {
  console.log('❌ Selenium WebDriver not found. Installing...');
  console.log('Run: npm install selenium-webdriver chromedriver');
  process.exit(1);
}

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.BROWSER = process.env.BROWSER || 'chrome';
process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.log(`🌍 Browser: ${process.env.BROWSER}`);
console.log(`🌐 Base URL: ${process.env.BASE_URL}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
console.log('');

// Run the test runner
const runnerPath = path.join(__dirname, 'selenium-tests', 'runner.js');

console.log('📋 Executing Selenium Test Runner...');
console.log(`📁 Runner path: ${runnerPath}`);
console.log('');

const testProcess = spawn('node', [runnerPath], {
  stdio: 'inherit',
  env: process.env
});

testProcess.on('close', (code) => {
  console.log('');
  console.log('=' .repeat(60));
  
  if (code === 0) {
    console.log('🎉 All Selenium tests completed successfully!');
    console.log('📸 Check selenium-tests/screenshots/ for test evidence');
  } else {
    console.log(`❌ Selenium tests failed with exit code: ${code}`);
    console.log('📸 Check selenium-tests/screenshots/ for debugging');
  }
  
  console.log('=' .repeat(60));
  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error('💥 Failed to start test runner:', error);
  process.exit(1);
});
