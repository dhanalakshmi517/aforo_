#!/bin/bash

# Selenium Tests Runner Script
# This script helps you run Selenium tests step by step

echo "🚀 Selenium Tests Runner for Aforo Application"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if app is running
echo -e "${BLUE}Step 1: Checking if application is running...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Application is NOT running${NC}"
    echo ""
    echo -e "${YELLOW}Please start the application first:${NC}"
    echo "  1. Open a new terminal window"
    echo "  2. Run: cd /Users/shyambodicherla/Desktop/R_test/aforo_/app"
    echo "  3. Run: wasp start"
    echo "  4. Wait for the app to start"
    echo "  5. Then run this script again"
    echo ""
    exit 1
fi

echo ""

# Step 2: Check dependencies
echo -e "${BLUE}Step 2: Checking dependencies...${NC}"
cd /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Installing now...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies are installed${NC}"
fi

echo ""

# Step 3: Show test options
echo -e "${BLUE}Step 3: Select which tests to run:${NC}"
echo ""
echo "Available test suites:"
echo "  1) Run ALL tests (comprehensive)"
echo "  2) Run Organization Form tests"
echo "  3) Run Rate Plan tests"
echo "  4) Run Requirements Validation tests (31 tests)"
echo "  5) Run Sign-in tests"
echo "  6) Run Login tests"
echo "  7) Run in HEADLESS mode (all tests, no browser window)"
echo "  8) Custom - specify test file"
echo ""
read -p "Enter your choice (1-8): " choice

echo ""
echo -e "${BLUE}Step 4: Running tests...${NC}"
echo ""

case $choice in
    1)
        echo -e "${GREEN}Running ALL tests...${NC}"
        npm test
        ;;
    2)
        echo -e "${GREEN}Running Organization Form tests...${NC}"
        npm run test:org
        ;;
    3)
        echo -e "${GREEN}Running Rate Plan tests...${NC}"
        npm run test:rateplan
        ;;
    4)
        echo -e "${GREEN}Running Requirements Validation tests...${NC}"
        npm run test:requirements
        ;;
    5)
        echo -e "${GREEN}Running Sign-in tests...${NC}"
        npx jest tests/signin-credentials.test.js
        ;;
    6)
        echo -e "${GREEN}Running Login tests...${NC}"
        npx jest tests/login.test.js
        ;;
    7)
        echo -e "${GREEN}Running ALL tests in HEADLESS mode...${NC}"
        npm run test:headless
        ;;
    8)
        echo ""
        echo "Available test files:"
        ls -1 tests/*.test.js
        echo ""
        read -p "Enter test file name (e.g., login.test.js): " testfile
        echo -e "${GREEN}Running $testfile...${NC}"
        npx jest tests/$testfile
        ;;
    *)
        echo -e "${RED}Invalid choice. Running all tests by default.${NC}"
        npm test
        ;;
esac

# Step 5: Show results location
echo ""
echo -e "${BLUE}Step 5: Test Results${NC}"
echo "=============================================="
echo ""
echo -e "${GREEN}✅ Tests completed!${NC}"
echo ""
echo "📸 Screenshots saved to:"
echo "   /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests/screenshots/"
echo ""
echo "📄 HTML Report available at:"
echo "   /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests/reports/selenium-test-report.html"
echo ""
echo "To view results:"
echo "  • Screenshots: open screenshots/"
echo "  • HTML Report: open reports/selenium-test-report.html"
echo ""
echo -e "${YELLOW}Would you like to open the results now? (y/n)${NC}"
read -p "> " openresults

if [ "$openresults" = "y" ] || [ "$openresults" = "Y" ]; then
    echo "Opening screenshots folder..."
    open screenshots/ 2>/dev/null || echo "Please manually open: selenium-tests/screenshots/"
    
    echo "Opening HTML report..."
    open reports/selenium-test-report.html 2>/dev/null || echo "Please manually open: selenium-tests/reports/selenium-test-report.html"
fi

echo ""
echo -e "${GREEN}🎉 Done! Happy Testing!${NC}"
