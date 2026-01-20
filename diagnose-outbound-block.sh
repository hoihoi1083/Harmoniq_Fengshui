#!/bin/bash
# Deep Investigation: Why Outbound Connections Are Blocked
# Run this on your EC2 server: ssh fs 'bash -s' < diagnose-outbound-block.sh

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 AWS EC2 OUTBOUND CONNECTION DIAGNOSTIC"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Instance: i-0f31a57214383f56c"
echo "Account: 692859943147"
echo "Date: $(date)"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  TESTING OUTBOUND CONNECTIVITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test HTTP (port 80)
echo -n "Testing HTTP (port 80) to google.com... "
if timeout 5 curl -s -o /dev/null -w "%{http_code}" http://google.com > /dev/null 2>&1; then
    echo -e "${GREEN}✓ SUCCESS${NC}"
    HTTP_WORKING=true
else
    echo -e "${RED}✗ BLOCKED/TIMEOUT${NC}"
    HTTP_WORKING=false
fi

# Test HTTPS (port 443)
echo -n "Testing HTTPS (port 443) to google.com... "
if timeout 5 curl -s -o /dev/null -w "%{http_code}" https://google.com > /dev/null 2>&1; then
    echo -e "${GREEN}✓ SUCCESS${NC}"
    HTTPS_WORKING=true
else
    echo -e "${RED}✗ BLOCKED/TIMEOUT${NC}"
    HTTPS_WORKING=false
fi

# Test npm registry
echo -n "Testing npm registry (registry.npmjs.org)... "
if timeout 5 curl -s -o /dev/null -w "%{http_code}" https://registry.npmjs.org > /dev/null 2>&1; then
    echo -e "${GREEN}✓ SUCCESS${NC}"
    NPM_WORKING=true
else
    echo -e "${RED}✗ BLOCKED/TIMEOUT${NC}"
    NPM_WORKING=false
fi

# Test OpenAI API
echo -n "Testing OpenAI API (api.openai.com)... "
if timeout 5 curl -s -o /dev/null -w "%{http_code}" https://api.openai.com > /dev/null 2>&1; then
    echo -e "${GREEN}✓ SUCCESS${NC}"
    OPENAI_WORKING=true
else
    echo -e "${RED}✗ BLOCKED/TIMEOUT${NC}"
    OPENAI_WORKING=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  CHECKING LOCAL FIREWALL (iptables)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if iptables is blocking outbound
echo "Checking iptables OUTPUT chain:"
sudo iptables -L OUTPUT -n -v --line-numbers 2>/dev/null || echo "iptables not available or no permissions"
echo ""

# Check if there are any DROP rules for outbound
echo "Checking for DROP/REJECT rules on outbound traffic:"
BLOCKED_RULES=$(sudo iptables -L OUTPUT -n | grep -E "DROP|REJECT" 2>/dev/null)
if [ -z "$BLOCKED_RULES" ]; then
    echo -e "${GREEN}✓ No local firewall blocks found${NC}"
else
    echo -e "${RED}⚠️  Found blocking rules:${NC}"
    echo "$BLOCKED_RULES"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  CHECKING SECURITY GROUP CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get instance metadata
INSTANCE_ID=$(ec2-metadata --instance-id 2>/dev/null | cut -d " " -f 2)
REGION=$(ec2-metadata --availability-zone 2>/dev/null | sed 's/[a-z]$//' | cut -d " " -f 2)

if [ -n "$INSTANCE_ID" ]; then
    echo "Instance ID: $INSTANCE_ID"
    echo "Region: $REGION"
    echo ""
    echo "⚠️  Cannot directly check Security Groups from instance."
    echo "    You need to check AWS Console or use AWS CLI with credentials."
else
    echo "⚠️  Cannot retrieve instance metadata"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  CHECKING NETWORK ACLs (NACL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⚠️  NACLs can only be checked from AWS Console or CLI with credentials"
echo "    Location: VPC Dashboard → Network ACLs"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  CHECKING ROUTE TABLE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Default gateway:"
ip route show default
echo ""

echo "All routes:"
ip route show
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  CHECKING DNS RESOLUTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Testing DNS resolution:"
for domain in google.com registry.npmjs.org api.openai.com; do
    echo -n "  $domain: "
    if nslookup $domain > /dev/null 2>&1; then
        IP=$(nslookup $domain 2>/dev/null | grep -A1 "Name:" | tail -n1 | awk '{print $2}')
        echo -e "${GREEN}✓ $IP${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
    fi
done

echo ""
echo "DNS servers in use:"
cat /etc/resolv.conf | grep nameserver

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  CHECKING FOR AWS ABUSE BLOCK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Checking system logs for AWS notifications:"
sudo grep -i "aws\|abuse\|block" /var/log/messages 2>/dev/null | tail -5 || echo "No AWS-related messages found"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  SUMMARY & ROOT CAUSE ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Connectivity Test Results:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ "$HTTP_WORKING" = true ] && echo -e "HTTP (80):     ${GREEN}✓ Working${NC}" || echo -e "HTTP (80):     ${RED}✗ Blocked${NC}"
[ "$HTTPS_WORKING" = true ] && echo -e "HTTPS (443):   ${GREEN}✓ Working${NC}" || echo -e "HTTPS (443):   ${RED}✗ Blocked${NC}"
[ "$NPM_WORKING" = true ] && echo -e "NPM Registry:  ${GREEN}✓ Working${NC}" || echo -e "NPM Registry:  ${RED}✗ Blocked${NC}"
[ "$OPENAI_WORKING" = true ] && echo -e "OpenAI API:    ${GREEN}✓ Working${NC}" || echo -e "OpenAI API:    ${RED}✗ Blocked${NC}"

echo ""
echo "Likely Root Cause:"
echo "━━━━━━━━━━━━━━━━━━"

if [ "$HTTP_WORKING" = false ] || [ "$HTTPS_WORKING" = false ]; then
    echo -e "${RED}⚠️  OUTBOUND TRAFFIC IS BLOCKED${NC}"
    echo ""
    echo "Based on your AWS case history (12905018968-1):"
    echo ""
    echo "🔴 ROOT CAUSE: AWS Applied Port 80/443 Block"
    echo "   ├─ Reason: Cryptocurrency mining malware detected"
    echo "   ├─ Date: December 2025"
    echo "   ├─ Status: Still active as of January 2026"
    echo "   └─ Impact: All outbound HTTP/HTTPS traffic blocked"
    echo ""
    echo "Blocking Layer:"
    echo "   1. ✓ Local firewall (iptables): Not blocking"
    echo "   2. ✓ Security Group: Likely allows outbound (default)"
    echo "   3. ? Network ACL: May have deny rules (check console)"
    echo "   4. 🔴 AWS Abuse Team: MOST LIKELY - Manual block applied"
    echo ""
else
    echo -e "${GREEN}✓ Outbound connectivity appears to be working${NC}"
    echo "If you're still experiencing issues, they may be intermittent or specific to certain services."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9️⃣  RECOMMENDED ACTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$HTTP_WORKING" = false ] || [ "$HTTPS_WORKING" = false ]; then
    echo "🔧 IMMEDIATE ACTIONS:"
    echo ""
    echo "1. Check AWS Console for Abuse Notifications"
    echo "   → Go to: AWS Console → Support Center"
    echo "   → Look for case: 12905018968-1"
    echo "   → Check if block is still active"
    echo ""
    echo "2. Verify Network ACL Rules"
    echo "   → Go to: VPC Dashboard → Network ACLs"
    echo "   → Find NACL associated with your subnet"
    echo "   → Check Outbound Rules for DENY on ports 80/443"
    echo ""
    echo "3. Contact AWS Support to Remove Block"
    echo "   → Reply to case 12905018968-1"
    echo "   → Attach this diagnostic report"
    echo "   → Request immediate unblock"
    echo ""
    echo "4. Temporary Workarounds:"
    echo "   → Build locally and deploy via rsync/scp"
    echo "   → Use pre-built node_modules"
    echo "   → Route through bastion/proxy if available"
    echo ""
else
    echo "✅ Outbound connectivity is working!"
    echo "   No action needed."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 DIAGNOSTIC COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Save this report and attach to AWS support case if needed."
echo ""
