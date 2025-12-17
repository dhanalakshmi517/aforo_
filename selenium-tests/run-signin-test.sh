#!/bin/bash

# Sign-In Credentials Test Runner
# This script helps you run the sign-in credentials test step by step

echo "=================================================="
echo "  Sign-In Credentials Test - Automated Runner"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if we're in the right directory
echo -e "${YELLOW}Step 1: Checking directory...${NC}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
echo -e "${GREEN}✓ Current directory: $SCRIPT_DIR${NC}"
echo ""

# Step 2: Check if dependencies are installed
echo -e "${YELLOW}Step 2: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Step 3: Check if the application is running
echo -e "${YELLOW}Step 3: Checking if application is running on port 3000...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✓ Application is running on port 3000${NC}"
else
    echo -e "${RED}✗ Application is NOT running on port 3000${NC}"
    echo -e "${YELLOW}Please start your application in another terminal:${NC}"
    echo -e "  cd /Users/shyambodicherla/Desktop/A_test/aforo_/app"
    echo -e "  npm run dev"
    echo ""
    echo -e "${YELLOW}Press Enter when the application is running...${NC}"
    read -r
fi
echo ""

# Step 4: Ask about test credentials
echo -e "${YELLOW}Step 4: Test Credentials Setup${NC}"
echo "Do you want to test with valid credentials? (y/n)"
echo "If you choose 'n', only the invalid credentials test will run fully."
read -r USE_VALID_CREDS

if [ "$USE_VALID_CREDS" = "y" ] || [ "$USE_VALID_CREDS" = "Y" ]; then
    echo ""
    echo "Enter your test email (from Contact Sales registration):"
    read -r TEST_EMAIL
    echo "Enter your test password:"
    read -rs TEST_PASSWORD
    echo ""
    export TEST_EMAIL
    export TEST_PASSWORD
    echo -e "${GREEN}✓ Credentials set${NC}"
else
    echo -e "${YELLOW}⚠ Valid credentials test will be skipped${NC}"
fi
echo ""

# Step 5: Ask about headless mode
echo -e "${YELLOW}Step 5: Browser Mode${NC}"
echo "Do you want to run in headless mode (no browser window)? (y/n)"
read -r HEADLESS_MODE

if [ "$HEADLESS_MODE" = "y" ] || [ "$HEADLESS_MODE" = "Y" ]; then
    export HEADLESS=true
    echo -e "${GREEN}✓ Running in headless mode${NC}"
else
    echo -e "${GREEN}✓ Browser window will be visible${NC}"
fi
echo ""

# Step 6: Run the test
echo -e "${YELLOW}Step 6: Running Sign-In Credentials Test...${NC}"
echo "=================================================="
echo ""

npm test tests/signin-credentials.test.js

TEST_EXIT_CODE=$?

echo ""
echo "=================================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
else
    echo -e "${RED}✗ Some tests failed. Check the output above.${NC}"
fi
echo ""

# Step 7: Show results location
echo -e "${YELLOW}Step 7: Test Results${NC}"
echo "Screenshots saved in: $SCRIPT_DIR/screenshots/"
echo ""
echo "Available screenshots:"
ls -lh screenshots/*.png 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
echo ""

# Step 8: Offer to open screenshots
echo "Do you want to view the screenshots? (y/n)"
read -r VIEW_SCREENSHOTS

if [ "$VIEW_SCREENSHOTS" = "y" ] || [ "$VIEW_SCREENSHOTS" = "Y" ]; then
    echo "Opening screenshots folder..."
    open screenshots/
fi

echo ""
echo -e "${GREEN}Test run complete!${NC}"
echo ""
echo "For more details, see: SIGNIN_TEST_GUIDE.md"
echo "=================================================="
