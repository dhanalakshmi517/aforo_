#!/bin/bash
# Product Module Test Runner

echo "🎯 Product Module Selenium Test Runner"
echo "======================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check app
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running${NC}"
else
    echo "⚠️  Application is NOT running. Please start it with 'wasp start'."
    exit 1
fi

echo ""
echo -e "${BLUE}Running Product Creation Tests...${NC}"
echo ""

cd selenium-tests
TEST_EMAIL="Mountain_think@space.ai" TEST_PASSWORD="oUN*5X3V" npx jest tests/product-creation.test.js --verbose

echo ""
echo -e "${BLUE}Done! Results saved to selenium-tests/reports/${NC}"
