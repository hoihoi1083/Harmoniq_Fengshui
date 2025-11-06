#!/bin/bash
# Reset AWS Load Balancer by gracefully restarting the application
# This clears any rate limiting or throttling state

set -e

REMOTE_HOST="fs"
echo "🔄 Resetting Load Balancer State..."
echo "=================================="

# Step 1: Graceful shutdown (allow existing connections to finish)
echo "1️⃣  Gracefully stopping PM2 processes..."
ssh $REMOTE_HOST 'cd fengshui-layout && pm2 stop all'
echo "   Waiting 30 seconds for connections to drain..."
sleep 30

# Step 2: Delete PM2 processes completely
echo "2️⃣  Deleting PM2 processes..."
ssh $REMOTE_HOST 'cd fengshui-layout && pm2 delete all'
sleep 5

# Step 3: Clear PM2 logs and cache
echo "3️⃣  Clearing PM2 cache..."
ssh $REMOTE_HOST 'cd fengshui-layout && pm2 flush && rm -rf logs/*.log'

# Step 4: Start fresh with PM2
echo "4️⃣  Starting fresh PM2 processes..."
ssh $REMOTE_HOST 'cd fengshui-layout && pm2 start ecosystem.config.json'
sleep 10

# Step 5: Verify status
echo "5️⃣  Verifying PM2 status..."
ssh $REMOTE_HOST 'pm2 status'

echo ""
echo "✅ Reset complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Wait 60 seconds for health checks to pass"
echo "   2. Test website: curl -w \"Time: %{time_total}s\\n\" -o /dev/null -s https://www.harmoniqfengshui.com/zh-TW"
echo "   3. Check AWS Target Group health status"
echo ""
