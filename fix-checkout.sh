#!/bin/bash
# Fix Checkout Issues - Remove unsupported payment methods and rebuild

set -e

echo "🔧 Fixing Checkout Issues..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REMOTE_HOST="fs"
REMOTE_DIR="~/fengshui-layout"

echo -e "${BLUE}📋 Issues being fixed:${NC}"
echo "1. ✅ Removed Alipay and WeChat Pay (not enabled in Stripe)"
echo "2. 🔍 Added debug logging for product IDs"
echo "3. 🚀 Rebuilding and restarting server"
echo ""

# Step 1: Push changes to server
echo -e "${YELLOW}📤 Step 1: Syncing changes to server...${NC}"
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'logs' \
  --exclude '.env.local' \
  ./src/app/api/shop/create-checkout-session/ \
  $REMOTE_HOST:$REMOTE_DIR/src/app/api/shop/create-checkout-session/

echo -e "${GREEN}✅ Files synced${NC}"
echo ""

# Step 2: Rebuild on server
echo -e "${YELLOW}🏗️  Step 2: Rebuilding application...${NC}"
ssh $REMOTE_HOST << 'ENDSSH'
cd ~/fengshui-layout
echo "Building..."
npm run build
ENDSSH

echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 3: Restart PM2
echo -e "${YELLOW}🔄 Step 3: Restarting application...${NC}"
ssh $REMOTE_HOST "pm2 restart fengshui-app"
sleep 3

echo -e "${GREEN}✅ Application restarted${NC}"
echo ""

# Step 4: Check status
echo -e "${YELLOW}📊 Step 4: Checking application status...${NC}"
ssh $REMOTE_HOST "pm2 status"

echo ""
echo -e "${GREEN}✨ Checkout fix complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Clear your cart and re-add products"
echo "2. Try checkout again"
echo "3. Check server logs: ssh fs 'pm2 logs fengshui-app --lines 50'"
echo ""
echo -e "${YELLOW}Note: If product not found error persists:${NC}"
echo "- Check product exists: ssh fs 'mongosh harmoniq --eval \"db.products.find({}).limit(5)\"'"
echo "- Verify product is active: isActive should be true"
