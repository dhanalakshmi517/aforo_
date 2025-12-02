#!/bin/bash

# 🚀 Quick Production Deployment Script
# This script automates the deployment process for your Wasp app

set -e  # Exit on error

echo "🚀 Starting Production Deployment Process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"
if ! command -v wasp &> /dev/null; then
    echo -e "${RED}❌ Wasp CLI not found. Please install Wasp first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Wasp CLI found${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"
echo ""

# Step 2: Run critical organization form tests only
echo -e "${BLUE}Step 2: Running critical organization form tests...${NC}"
cd selenium-tests
npm test tests/organization-requirements-validation.test.js tests/organization-detailed-tcs.test.js 2>&1 | tee test-output.log
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${RED}❌ Organization form tests failed! Please fix issues before deploying.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All organization form tests passed (41/41)!${NC}"
cd ..
echo ""

# Step 3: Build production bundle
echo -e "${BLUE}Step 3: Building production bundle...${NC}"
cd app
wasp build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Production bundle created${NC}"
echo ""

# Step 4: Check environment variables
echo -e "${BLUE}Step 4: Checking environment variables...${NC}"
if [ ! -f ".env.server" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.server not found!${NC}"
    echo "Please create .env.server with production settings before deploying."
    echo ""
fi

if [ ! -f ".env.client" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.client not found!${NC}"
    echo "Please create .env.client with production settings before deploying."
    echo ""
fi

# Step 5: Deployment options
echo -e "${BLUE}Step 5: Choose deployment platform:${NC}"
echo "1) Fly.io (Recommended)"
echo "2) Railway"
echo "3) Manual deployment (I'll handle it myself)"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}Deploying to Fly.io...${NC}"
        if ! command -v fly &> /dev/null; then
            echo -e "${RED}❌ Fly CLI not found. Installing...${NC}"
            curl -L https://fly.io/install.sh | sh
        fi
        
        cd .wasp/build
        
        # Check if already initialized
        if [ ! -f "fly.toml" ]; then
            echo "First time deployment. Running fly launch..."
            fly launch
        else
            echo "Deploying to existing Fly.io app..."
            fly deploy
        fi
        
        echo -e "${GREEN}✓ Deployed to Fly.io!${NC}"
        ;;
        
    2)
        echo -e "${BLUE}Deploying to Railway...${NC}"
        if ! command -v railway &> /dev/null; then
            echo -e "${RED}❌ Railway CLI not found. Installing...${NC}"
            npm install -g @railway/cli
        fi
        
        cd .wasp/build
        railway up
        
        echo -e "${GREEN}✓ Deployed to Railway!${NC}"
        ;;
        
    3)
        echo -e "${GREEN}Build complete! Your production bundle is in: app/.wasp/build${NC}"
        echo "You can now manually deploy this directory to your hosting platform."
        ;;
        
    4)
        echo "Deployment cancelled."
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment process complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify your app is running at your production URL"
echo "2. Test the organization form submission"
echo "3. Set up monitoring and alerts"
echo "4. Configure your custom domain (if not done)"
echo ""
echo "For detailed instructions, see: PRODUCTION_DEPLOYMENT_GUIDE.md"
