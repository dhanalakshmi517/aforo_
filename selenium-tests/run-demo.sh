#!/bin/bash

# Demo Script for Boss - Live Test Execution
# This runs a few key tests with visible browser so boss can watch

echo "🎬 =================================="
echo "   LIVE DEMO: Selenium Tests Running"
echo "   Organization Form Validation"
echo "===================================="
echo ""
echo "📋 What you'll see:"
echo "   ✅ Browser will open automatically"
echo "   ✅ Tests will fill forms and check validation"
echo "   ✅ Console shows test progress"
echo ""
echo "⏱️  Demo duration: ~2-3 minutes"
echo ""
read -p "Press ENTER to start demo..." 

echo ""
echo "🚀 Starting live demo..."
echo ""

# Run a subset of tests for quick demo
# Using specific tests to show key functionality
npx jest tests/organization-requirements-validation.test.js \
  -t "REQUIREMENT 1" \
  --verbose \
  --maxWorkers=1

echo ""
echo "✨ =================================="
echo "   Demo Complete!"
echo "===================================="
echo ""
echo "📊 Full test results available in:"
echo "   • PORTABLE_REPORT.html (works on phone!)"
echo "   • screenshots/ folder"
echo ""
