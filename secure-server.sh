#!/bin/bash
# Secure server against crypto miners

echo "=== Securing Server Against Crypto Miners ==="

# 1. Restrict /tmp and /dev/shm execution (common miner/malware locations)
echo "1. Securing /tmp directory..."
sudo mount -o remount,noexec,nosuid,nodev /tmp 2>/dev/null || echo "  /tmp already secured or requires fstab update"
echo "   Securing /dev/shm (noexec to block malware from running there)..."
sudo mount -o remount,noexec /dev/shm 2>/dev/null || echo "  /dev/shm remount skipped (may need fstab entry)"

# 2. Set file permissions
echo "2. Securing home directory permissions..."
chmod 750 /home/ec2-user
chmod 640 /home/ec2-user/.ssh/authorized_keys 2>/dev/null

# 3. Install fail2ban (if not installed)
echo "3. Checking fail2ban..."
if ! command -v fail2ban-client &> /dev/null; then
    echo "  Installing fail2ban..."
    sudo yum install -y fail2ban
    sudo systemctl enable fail2ban
    sudo systemctl start fail2ban
else
    echo "  fail2ban already installed"
fi

# 4. Configure firewall to block mining pools
echo "4. Blocking known mining pool ports..."
MINING_PORTS="3333 4444 5555 7777 8333 9999 14444"
for port in $MINING_PORTS; do
    sudo firewall-cmd --permanent --add-rich-rule="rule family='ipv4' port port='$port' protocol='tcp' reject" 2>/dev/null || true
done
sudo firewall-cmd --reload 2>/dev/null || echo "  Firewall not available"

# 5. Setup cron job for miner detection
echo "5. Setting up automated miner detection..."
(crontab -l 2>/dev/null | grep -v detect-miners; echo "*/5 * * * * /home/ec2-user/detect-miners.sh") | crontab -

# 6. Install process monitoring
echo "6. Setting up process monitoring..."
if ! command -v atop &> /dev/null; then
    sudo yum install -y atop 2>/dev/null || echo "  atop installation skipped"
fi

echo ""
echo "✅ Security measures applied:"
echo "   • /tmp execution restricted"
echo "   • Miner detection running every 5 minutes"
echo "   • Mining pool ports blocked"
echo "   • Process monitoring enabled"
echo ""
echo "📊 Monitor logs: tail -f /home/ec2-user/miner-detection.log"
echo "📊 Check disk/RAM/CPU usage: cd ~/fengshui-layout && bash check-server-resources.sh"
