# AWS Outbound Connection Block - Investigation Report

## 🔴 **CRITICAL ISSUE: Outbound Traffic Blocked by AWS**

**Status**: ACTIVE BLOCK (since December 2025)
**Case Number**: 12905018968-1  
**Instance**: i-0f31a57214383f56c  
**Account**: 692859943147  
**Impact**: All outbound HTTP/HTTPS traffic (ports 80/443) blocked

---

## 📊 **Root Cause Analysis**

### Why is Outbound Blocked?

In **December 2025**, AWS detected cryptocurrency mining malware on your server:
- **Malware**: Monero miner (xmrig)
- **Impact**: 60% CPU usage, 2.3GB memory hijacked
- **AWS Response**: Applied outbound port 80/443 block to prevent further abuse

### What AWS Blocked:

```
✗ Port 80 (HTTP)  - BLOCKED
✗ Port 443 (HTTPS) - BLOCKED
✓ Port 22 (SSH)   - Still works
✓ Port 3000 (App) - Still works (inbound only)
```

### Current Status:

**Good News**: Malware was removed in December 2025
**Bad News**: AWS block is still active as of January 2026

---

## 🚫 **Services Affected**

Because outbound ports 80/443 are blocked, the following CANNOT work:

### 1. Package Managers
- ❌ `npm install` - Cannot reach registry.npmjs.org
- ❌ `yum install` - Cannot reach Amazon repos
- ❌ `pip install` - Cannot reach PyPI
- ❌ `apt-get` - Cannot reach package repos

### 2. External APIs
- ❌ OpenAI API calls (api.openai.com)
- ❌ Stripe API
- ❌ Any third-party services
- ❌ Webhook callbacks

### 3. Updates & Maintenance
- ❌ System updates
- ❌ Security patches
- ❌ SSL certificate renewal
- ❌ Git operations (if using HTTPS)

### 4. CDN & External Resources
- ❌ Cannot fetch from external CDNs
- ❌ Cannot download files
- ❌ Cannot make HTTP/HTTPS requests

---

## 🔍 **How to Diagnose**

Run the diagnostic script on your server:

```bash
# From your local machine:
ssh fs 'bash -s' < diagnose-outbound-block.sh

# Or on the server directly:
chmod +x diagnose-outbound-block.sh
./diagnose-outbound-block.sh
```

The script will test:
1. HTTP connectivity (port 80)
2. HTTPS connectivity (port 443)
3. npm registry access
4. OpenAI API access
5. Local firewall rules
6. DNS resolution
7. Network configuration

---

## 🛠️ **Current Workarounds**

Since AWS blocked outbound connections, you must use these workarounds:

### 1. Deploy Pre-built Code
```bash
# Build locally on your Mac
cd /Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout
npm run build

# Copy to server (bypasses npm install)
rsync -avz --exclude 'node_modules/.cache' \
  .next/ fs:~/fengshui-layout/.next/

rsync -avz \
  node_modules/ fs:~/fengshui-layout/node_modules/
```

### 2. Pre-install Dependencies Locally
```bash
# If package.json changes:
npm install  # Run on Mac
rsync -avz node_modules/ fs:~/fengshui-layout/node_modules/
```

### 3. Use Deployment Script
The existing `complete-deployment.sh` script already handles this:
- Skips `npm install` on server
- Uses existing node_modules
- Only runs `npm run build`

```bash
./complete-deployment.sh
```

---

## 📝 **How AWS Applied the Block**

AWS can block traffic at multiple layers:

| Layer | Location | Status | Likelihood |
|-------|----------|--------|------------|
| **Instance** | iptables | ✅ Not blocking | Low |
| **Security Group** | VPC | ✅ Usually allows all outbound | Low |
| **Network ACL** | Subnet | ❓ Could have DENY rules | Medium |
| **AWS Network** | Infrastructure | 🔴 Manual block by Abuse Team | **HIGH** |

**Most Likely**: AWS Abuse Team applied a **network-level block** that operates outside of Security Groups and NACLs.

---

## ✅ **How to Get Unblocked**

### Step 1: Verify Malware is Removed

Run security check:
```bash
ssh fs << 'EOF'
# Check for miner processes
pgrep -af "xmrig|miner|crypto"

# Check malware directory
ls -la /home/ec2-user/moneroocean/

# Check hugepages (should be 0)
cat /proc/sys/vm/nr_hugepages

# Check CPU usage
top -bn1 | head -20
EOF
```

All should show: **No malware present** ✓

### Step 2: Contact AWS Support

Reply to case **12905018968-1** with this message:

```
Subject: Request to Remove Outbound Port Block - Case 12905018968-1

Dear AWS Trust & Safety Team,

I am writing to request the removal of the outbound port 80/443 block 
on instance i-0f31a57214383f56c.

REMEDIATION COMPLETED (December 2025):
✓ Malware completely removed
✓ Hugepages reset to 0
✓ Fail2ban and Firewalld active
✓ No malicious processes running
✓ System CPU usage normal (0.5%)

CURRENT STATUS (January 2026):
✓ Server is clean and monitored
✓ No security threats detected
✗ Outbound ports 80/443 still blocked

BUSINESS IMPACT:
- Cannot install security updates
- Cannot use OpenAI API (core feature)
- Cannot perform system maintenance
- Cannot install packages or dependencies

ATTACHED:
- Diagnostic report showing current system status
- Evidence of clean system

REQUEST:
Please remove the outbound port block to allow:
1. Security updates and patches
2. Normal business operations
3. API integrations

I commit to maintaining active security monitoring and will respond 
immediately to any future concerns.

Thank you for your assistance.

Case Reference: 12905018968-1
Instance: i-0f31a57214383f56c
Account: 692859943147
```

### Step 3: Check AWS Console

1. Go to **AWS Console → Support Center**
2. Find case **12905018968-1**
3. Check for any responses or updates
4. Attach the diagnostic report

### Step 4: Check Network ACLs

While waiting for AWS response, verify Network ACLs:

1. Go to **VPC Dashboard → Network ACLs**
2. Find the NACL for your subnet
3. Check **Outbound Rules** tab
4. Look for DENY rules on ports 80/443

If you see DENY rules, you can remove them yourself.

---

## ⏰ **Expected Timeline**

| Action | Timeframe |
|--------|-----------|
| Contact AWS Support | Immediate |
| AWS Review | 1-3 business days |
| Block Removal | Same day after approval |
| Services Restored | Immediate |

---

## 🔒 **Prevention Measures**

To prevent future blocks:

### 1. Install Security Monitoring
```bash
ssh fs << 'EOF'
# Install cronie (once unblocked)
sudo yum install -y cronie

# Add miner detection cron job
crontab -e
# Add: */5 * * * * /home/ec2-user/detect-miners.sh
EOF
```

### 2. Harden System
```bash
# Mount /tmp with noexec
sudo mount -o remount,noexec /tmp

# Block mining pool ports
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" port port="3333" protocol="tcp" reject'
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" port port="4444" protocol="tcp" reject'
sudo firewall-cmd --reload
```

### 3. Enable CloudWatch Alarms
- Set up CPU usage alerts (>80% for 5 minutes)
- Monitor outbound traffic patterns
- Enable VPC Flow Logs

---

## 📞 **Contact Information**

**AWS Support**:
- Email: trustandsafety@support.aws.com
- Case: 12905018968-1
- Console: AWS Support Center

**Your Details**:
- Instance: i-0f31a57214383f56c
- Account: 692859943147
- Region: us-east-1

---

## 🎯 **Quick Action Checklist**

- [ ] Run diagnostic script (`diagnose-outbound-block.sh`)
- [ ] Verify malware is removed
- [ ] Reply to AWS case 12905018968-1
- [ ] Attach diagnostic report
- [ ] Check Network ACLs in VPC Console
- [ ] Use workarounds while waiting (rsync deployment)
- [ ] Set up monitoring once unblocked

---

**Last Updated**: January 16, 2026
**Status**: Investigation Complete - Awaiting AWS Unblock
