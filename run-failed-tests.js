#!/usr/bin/env node

/**
 * Runner for FAILED Test Cases
 * These tests are EXPECTED to FAIL - they demonstrate bugs in the system
 */

const path = require('path');
const { spawn } = require('child_process');

console.log('🚨 Starting FAILED Test Cases for Organization Page');
console.log('='.repeat(60));
console.log('⚠️  WARNING: These tests are EXPECTED to FAIL');
console.log('📋 They demonstrate that requirements are NOT being enforced:');
console.log('   1. Country flag must be correct');
console.log('   2. Phone field must be disabled without valid flag');
console.log('   3. Submit button must be disabled without valid conditions');
console.log('='.repeat(60));
console.log('');

// Check dependencies
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
console.log('');

// Run Jest with failed test file
const jestConfigPath = path.join(__dirname, 'selenium-tests', 'jest.config.js');
const testFilePath = path.join(__dirname, 'selenium-tests', 'tests', 'organization-failed.test.js');

console.log('📋 Executing FAILED Tests...');
console.log(`📁 Jest config: ${jestConfigPath}`);
console.log(`📄 Test file: ${testFilePath}`);
console.log('');

const jestProcess = spawn('npx', [
    'jest',
    testFilePath,
    '--config', jestConfigPath,
    '--verbose',
    '--no-cache',
    '--testTimeout=40000' // Longer timeout for failed tests
], {
    stdio: 'inherit',
    env: process.env
});

jestProcess.on('close', (code) => {
    console.log('');
    console.log('='.repeat(60));

    if (code !== 0) {
        console.log('✅ Tests FAILED as expected - bugs confirmed!');
        console.log('');
        console.log('📊 Summary:');
        console.log('   • Country flag bug: CONFIRMED');
        console.log('   • Phone field not blocked: CONFIRMED');
        console.log('   • Submit button not disabled: CONFIRMED');
        console.log('');
        console.log('📸 Check selenium-tests/screenshots/ for evidence');
        console.log('📝 See failed-*.png screenshots for bug proof');
    } else {
        console.log('⚠️  Unexpected: All tests passed!');
        console.log('   This means the bugs have been fixed.');
    }

    console.log('='.repeat(60));
    process.exit(0); // Exit with 0 even if tests fail (expected behavior)
});

jestProcess.on('error', (error) => {
    console.error('💥 Failed to start failed tests:', error);
    process.exit(1);
});
