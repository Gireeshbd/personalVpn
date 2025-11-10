#!/bin/bash
# Development Environment Setup Script

set -e

echo "🚀 Setting up Personal VPN development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
required_version=18
current_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$current_version" -lt "$required_version" ]; then
    echo -e "${RED}❌ Node.js version $required_version or higher required${NC}"
    echo -e "${YELLOW}Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version check passed${NC}"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}📦 pnpm not found, installing...${NC}"
    npm install -g pnpm
    echo -e "${GREEN}✅ pnpm installed${NC}"
else
    echo -e "${GREEN}✅ pnpm is already installed${NC}"
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install

# Setup environment variables
echo -e "${YELLOW}📝 Setting up environment variables...${NC}"

# Chrome extension
if [ ! -f "packages/chrome-extension/.env.local" ]; then
    cp packages/chrome-extension/.env.example packages/chrome-extension/.env.local
    echo -e "${YELLOW}⚠️  Please configure packages/chrome-extension/.env.local${NC}"
fi

# Backend API
if [ ! -f "packages/backend-api/.env.local" ]; then
    cp packages/backend-api/.env.example packages/backend-api/.env.local
    echo -e "${YELLOW}⚠️  Please configure packages/backend-api/.env.local${NC}"
fi

echo -e "${GREEN}✅ Development environment setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Configure environment variables in .env.local files"
echo "  2. Setup Supabase database (see PRODUCTION_PLAN.md)"
echo "  3. Run 'pnpm dev' to start development"
echo "  4. Read docs/CONTRIBUTING.md for development guidelines"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
