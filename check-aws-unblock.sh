#!/bin/bash
# Daily check to see if AWS unblocked ports 80/443

echo "=========================================="
echo "AWS Port Block Status Check"
echo "Date: $(date)"
echo "=========================================="

# Test if OpenAI API is accessible
ssh -i ~/.ssh/fengshui.pem ec2-user@54.205.0.111 'timeout 5 curl -s --max-time 5 https://api.openai.com' > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "🎉 ✅ PORTS UNBLOCKED!"
    echo "AWS has removed the restrictions!"
    echo ""
    echo "Next steps:"
    echo "1. Install cronie: ssh -i ~/.ssh/fengshui.pem ec2-user@54.205.0.111 'sudo yum install -y cronie'"
    echo "2. Set up monitoring cron job"
    echo "3. Apply security hardening"
    echo ""
    # Send notification (macOS)
    osascript -e 'display notification "AWS has unblocked your ports!" with title "AWS Port Status" sound name "Glass"'
else
    echo "❌ STILL BLOCKED"
    echo "Ports 80/443 remain blocked by AWS"
    echo "Continue waiting for Trust & Safety response"
fi

echo "=========================================="
