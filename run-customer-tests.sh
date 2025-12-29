#!/bin/bash

# Customer Module Test Runner
# Quick script to run customer tests with proper credentials

echo "🎯 Customer Module Selenium Test Runner"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if app is running
echo -e "${BLUE}Step 1: Checking if application is running...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running${NC}"
else
    echo -e "${YELLOW}⚠️  Application is NOT running${NC}"
    echo ""
    echo "Please start the application first:"
    echo "  Terminal 1: cd app && wasp start db"
    echo "  Terminal 2: cd app && wasp start"
    echo ""
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Running Customer Module Tests...${NC}"
echo ""

cd /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests

# Run tests with credentials
TEST_EMAIL="Mountain_think@space.ai" \
TEST_PASSWORD="oUN*5X3V" \
npx jest tests/customer-creation.test.js --verbose

TEST_EXIT_CODE=$?

echo ""
echo -e "${BLUE}Step 3: Test Execution Complete${NC}"
echo "========================================"
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed (exit code: $TEST_EXIT_CODE)${NC}"
fi

echo ""
echo -e "${BLUE}📸 Screenshots saved to:${NC}"
echo "   /Users/shyambodicherla/Desktop/R_test/aforo_/selenium-tests/screenshots/"
echo ""
echo -e "${BLUE}📊 To view results:${NC}"
echo "   open screenshots/"
echo "   or"
echo "   ./view-test-results.sh"
echo ""

# Ask if user wants to view screenshots
read -p "Would you like to open screenshots now? (y/n): " open_screenshots

if [ "$open_screenshots" = "y" ] || [ "$open_screenshots" = "Y" ]; then
    echo "Opening screenshots folder..."
    open screenshots/ 2>/dev/null || echo "Please manually open: selenium-tests/screenshots/"
fi

echo ""
echo -e "${GREEN}✨ Done!${NC}"
