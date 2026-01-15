#!/bin/bash

# Server Space Cleanup Script
# Run this if disk space is running low

REMOTE_HOST="fs"
REMOTE_PATH="/home/ec2-user/fengshui-layout"

echo "🧹 Server Space Cleanup"
echo "======================"

# Check current space
echo ""
echo "📊 Current disk usage:"
ssh $REMOTE_HOST "df -h / | grep -E 'Filesystem|nvme'"

echo ""
echo "📁 Project folder size:"
ssh $REMOTE_HOST "du -sh $REMOTE_PATH"

echo ""
echo "🗑️ Starting cleanup..."

# Clean PM2 logs
echo "  - Flushing PM2 logs..."
ssh $REMOTE_HOST "cd $REMOTE_PATH && pm2 flush"

# Clean large log files (older than 7 days)
echo "  - Removing old log files (>7 days)..."
ssh $REMOTE_HOST "cd $REMOTE_PATH && find logs -name '*.log' -mtime +7 -delete 2>/dev/null || true"

# Clean large log files (>50MB)
echo "  - Removing large log files (>50MB)..."
ssh $REMOTE_HOST "cd $REMOTE_PATH && find logs -name '*.log' -size +50M -delete 2>/dev/null || true"

# Clean backup builds
echo "  - Removing build backups..."
ssh $REMOTE_HOST "cd $REMOTE_PATH && rm -rf .next.backup 2>/dev/null || true"

# Clean npm cache
echo "  - Cleaning npm cache..."
ssh $REMOTE_HOST "npm cache clean --force 2>/dev/null || true"

# Clean security logs in home directory
echo "  - Cleaning security audit logs..."
ssh $REMOTE_HOST "cd ~ && truncate -s 0 security-audit.log 2>/dev/null || true"
ssh $REMOTE_HOST "cd ~ && truncate -s 0 miner-detection.log 2>/dev/null || true"

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "📊 Final disk usage:"
ssh $REMOTE_HOST "df -h / | grep -E 'Filesystem|nvme'"

echo ""
echo "📁 Project folder size:"
ssh $REMOTE_HOST "du -sh $REMOTE_PATH"

echo ""
echo "💡 To see what's taking up space:"
echo "   ssh $REMOTE_HOST 'du -sh $REMOTE_PATH/* | sort -hr | head -10'"
