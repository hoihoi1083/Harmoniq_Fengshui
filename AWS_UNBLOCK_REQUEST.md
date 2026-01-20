# AWS Support Case - Request to Remove Shell Command Blocking

**Case Number**: 12905018968-1  
**Date**: January 16, 2026  
**Instance**: i-0f31a57214383f56c  
**Account**: 692859943147

---

## Subject: Request to Remove Process-Level Outbound Blocking

Dear AWS Abuse Team,

I am following up on abuse case **12905018968-1** from December 2025.

### Current Status:

1. ✅ **Malware Removed**: The Monero miner was completely removed in December 2025
2. ✅ **System Clean**: No malicious processes running (verified daily)
3. ✅ **Monitoring Active**: File integrity monitoring and security measures in place

### Current Blocking Behavior:

AWS has implemented **process-level blocking** that affects:
- ❌ Shell commands: `curl`, `wget`, bash TCP sockets → **BLOCKED**
- ✅ Node.js applications: HTTP/HTTPS requests → **WORKING**

### Evidence of Process-Level Blocking:

```bash
# Shell TCP socket test:
bash -c "cat < /dev/tcp/www.google.com/443"
Result: BLOCKED

# Node.js TCP socket test:
node -e "net.connect(443, 'www.google.com')"
Result: ✅ SUCCESS
```

### Impact:

While our production application works (Node.js process allowed), we cannot:
- Run system maintenance commands
- Use curl/wget for diagnostics
- Run deployment scripts that use shell commands
- Perform routine server administration

### Request:

Please **remove the process-level blocking** entirely, as:
1. The malware has been removed for over a month
2. Continuous monitoring is in place
3. Security measures prevent reinfection
4. The blocking affects legitimate administrative tasks

### Technical Details:

- **Firewall**: iptables is clear (no local blocks)
- **DNS**: Working correctly
- **Routing**: Configured properly
- **Block Type**: AWS-side process filtering, not network ACL

### Documentation Attached:

- Security monitoring logs
- Process verification reports
- Network diagnostic results
- Malware removal confirmation

I would appreciate removing this restriction so we can perform normal server administration.

Thank you for your assistance.

Best regards,
Michael Ng

---

## How to Submit:

### Option 1: AWS Support Console

1. Go to: https://console.aws.amazon.com/support/home
2. Find case: **12905018968-1**
3. Click "Correspond" or "Add correspondence"
4. Copy this entire message
5. Attach diagnostic results from server

### Option 2: Email Reply

Reply to the AWS Abuse email from December 2025 with this content.

---

## Include These Diagnostics:

Run on server and attach results:

```bash
# Create diagnostic report
ssh fs 'cat > /tmp/aws-diagnostic.txt << "EOF"
=== SYSTEM STATUS ===
Date: $(date)
Uptime: $(uptime)

=== NO MALWARE ===
Crypto Miners: $(ps aux | grep -E "xmrig|cpuminer|monero" | grep -v grep || echo "None detected")

=== PROCESS BLOCKING EVIDENCE ===
Shell TCP Test: $(timeout 3 bash -c "cat < /dev/tcp/www.google.com/443" 2>&1 || echo "BLOCKED")
Node TCP Test: $(node -e "const net=require(\"net\");net.connect(443,\"www.google.com\").on(\"connect\",()=>{console.log(\"SUCCESS\");process.exit()}).on(\"error\",()=>{console.log(\"BLOCKED\");process.exit()})")

=== NETWORK CONFIG ===
Iptables: $(sudo iptables -L -n | head -10)
Routes: $(ip route)
DNS: $(cat /etc/resolv.conf)

=== PM2 STATUS ===
$(pm2 list)
EOF
cat /tmp/aws-diagnostic.txt'

# Download the report
scp fs:/tmp/aws-diagnostic.txt ./aws-diagnostic-$(date +%Y%m%d).txt
```

Then attach `aws-diagnostic-YYYYMMDD.txt` to your AWS support case.

---

## Expected Response Time:

- **Standard**: 24-48 hours
- **If urgent**: Request case escalation

## After Unblock:

Once AWS confirms the block is removed, verify:

```bash
# Test from server:
ssh fs 'curl -I https://www.google.com'
ssh fs 'curl -I https://registry.npmjs.org'
ssh fs 'curl -I https://api.deepseek.com'
```

All should return HTTP 200 or similar success codes.
