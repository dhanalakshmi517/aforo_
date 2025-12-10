#!/bin/bash

# Selenium Test Runner Script
# This script ensures Jest uses the correct configuration for selenium tests

cd "$(dirname "$0")"

echo "🧪 Running Rateplan Selenium Tests..."
echo ""

# Run Jest with explicit config pointing to selenium-tests directory
npx jest tests/rateplan*.test.js --config=./jest.config.js

echo ""
echo "✅ Tests complete!"
