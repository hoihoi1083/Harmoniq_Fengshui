# AWS Dashboard - How to Check for Blocks/Restrictions

**Instance**: i-0f31a57214383f56c  
**Account**: 692859943147  
**Case**: 12905018968-1

---

## 🔍 Where to Find Evidence in AWS Console

### 1. **AWS Support Center** (Most Important!)

📍 **URL**: https://console.aws.amazon.com/support/home

**Steps**:
1. Log in to AWS Console
2. Click "Support" in top-right menu OR go to Support Center
3. Click "Support cases" in left sidebar
4. Look for case: **12905018968-1** or search "abuse"
5. Check case status, correspondence, and any restrictions applied

**What to look for**:
- Case correspondence with AWS Abuse team
- Any mentions of "port blocking" or "outbound restrictions"
- Remediation requirements
- Current case status (Open/Resolved)

---

### 2. **AWS Personal Health Dashboard**

📍 **URL**: https://phd.aws.amazon.com/phd/home

**Steps**:
1. Go to Personal Health Dashboard
2. Check "Open and recent issues" tab
3. Look for any security notifications or abuse alerts
4. Check "Event log" for historical events

**What to look for**:
- AWS_ABUSE_REPORT events
- Network restrictions
- Security notifications
- Scheduled maintenance that might affect connectivity

---

### 3. **AWS Trusted Advisor** (If you have Business/Enterprise support)

📍 **URL**: https://console.aws.amazon.com/trustedadvisor/home

**Steps**:
1. Go to Trusted Advisor
2. Click "Security" tab
3. Look for security warnings or recommendations

**What to look for**:
- Exposed access keys
- Security group issues
- Any abuse-related recommendations

---

### 4. **EC2 Security Groups & Network ACLs**

#### Check Security Groups:
📍 **URL**: https://console.aws.amazon.com/ec2/home?region=us-east-1#SecurityGroups:

**Steps**:
1. Go to EC2 Console → Security Groups
2. Find your instance's security groups
3. Check "Outbound rules" tab

**Normal outbound rules should show**:
```
All traffic    All    All    0.0.0.0/0    Allow
```

**If blocked, you might see**:
- Missing outbound rules for ports 80/443
- Specific deny rules
- Custom restrictions

#### Check Network ACLs:
📍 **URL**: https://console.aws.amazon.com/vpc/home?region=us-east-1#acls:

**Steps**:
1. Go to VPC → Network ACLs
2. Find the ACL associated with your subnet
3. Check "Outbound rules" tab

**Normal should show**:
```
Rule #    Type           Protocol    Port Range    Destination    Allow/Deny
100       All Traffic    All         All           0.0.0.0/0      Allow
*         All Traffic    All         All           0.0.0.0/0      Deny
```

**If AWS blocked at this level, you might see**:
- Custom deny rules for ports 80/443
- Modified rule priorities

---

### 5. **VPC Flow Logs** (If enabled)

📍 **URL**: https://console.aws.amazon.com/vpc/home?region=us-east-1#FlowLogs:

**Steps**:
1. Go to VPC → Flow Logs
2. Check if flow logs are enabled
3. If enabled, view logs in CloudWatch

**What to look for**:
- REJECT entries for port 443 outbound
- Pattern of blocked connections

---

### 6. **CloudWatch Logs** (Check for AWS notifications)

📍 **URL**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups

**Steps**:
1. Go to CloudWatch → Logs
2. Look for log groups like:
   - `/aws/events`
   - `/aws/lambda` (if any auto-remediation)
3. Search for keywords: "abuse", "block", "restrict"

---

### 7. **Check Your Email** (AWS sends notifications here!)

**Email to check**: The email associated with your AWS account (Account ID: 692859943147)

**Search for emails from**:
- `abuse@amazon.com`
- `no-reply-aws@amazon.com`
- `aws-security-notification@amazon.com`
- Subject containing: "abuse", "violation", "case", "12905018968"

**Common AWS Abuse Email Subject Lines**:
- "Amazon Web Services - Abuse Report"
- "AWS Abuse Case #12905018968-1"
- "Action Required: AWS Abuse Report"

---

### 8. **AWS Account Settings & Notifications**

📍 **URL**: https://console.aws.amazon.com/billing/home#/account

**Steps**:
1. Go to Account Settings
2. Check "Alternate Contacts" → "Security" contact
3. Verify the email address AWS uses for security notifications

---

## 🔬 **Quick Diagnostic Commands**

Run these to confirm the blocking:

```bash
# 1. Check instance metadata (from server)
ssh fs 'curl -s http://169.254.169.254/latest/dynamic/instance-identity/document | jq .'

# 2. Check if AWS applied any special network config
ssh fs 'ip route show table all'

# 3. Test outbound with different methods
ssh fs 'timeout 3 curl -I https://www.google.com; echo "Exit: $?"'
ssh fs 'node -e "require(\"https\").get(\"https://www.google.com\", r => console.log(\"Status:\", r.statusCode))"'
```

---

## 📧 **If You Find No Evidence**

If you don't find any AWS case or notification, it might mean:

### Possibility 1: Local Configuration Issue
- Check if someone on your team configured iptables or firewall rules
- Review any recent server changes
- Check for proxy configurations

### Possibility 2: AWS Silent Restriction
- AWS might have applied restrictions without formal notification
- Contact AWS Support to inquire: "Is there any block on instance i-0f31a57214383f56c?"

### Possibility 3: No AWS Block At All
If Node.js works but shell commands don't, this could be:
- A shell environment issue (proxy settings in .bashrc)
- Process-level security software (SELinux, AppArmor)
- Container/cgroup restrictions

---

## 🎯 **Immediate Action**

1. **Log in to AWS Console**: https://console.aws.amazon.com/
2. **Check Support Center first**: https://console.aws.amazon.com/support/home
3. **Search for case**: 12905018968-1
4. **Check your email**: Search for "abuse@amazon.com"

If you find **NO evidence** of AWS blocking, then we need to investigate:
- Who has root access to the server?
- Were there any recent security tool installations?
- Is there enterprise security software that might filter shell commands?

---

## 📞 **Contact AWS Support**

If you can't find evidence, open a new support case:

**Subject**: "Inquiry: Outbound HTTPS Restrictions on i-0f31a57214383f56c"

**Message**:
```
Dear AWS Support,

I am experiencing unusual network behavior on my EC2 instance:
- Instance ID: i-0f31a57214383f56c
- Region: us-east-1
- Account: 692859943147

Symptoms:
- Shell commands (curl, wget) cannot connect to HTTPS (port 443)
- Node.js applications CAN connect successfully to HTTPS
- No local firewall rules blocking traffic
- No Network ACL restrictions visible

Question:
Are there any AWS-side restrictions, blocks, or security measures 
applied to this instance that would cause this behavior?

I reference case #12905018968-1 (December 2025) which was resolved.
Could there be residual restrictions from that case?

Please advise on any active restrictions and how to remove them.

Thank you.
```

---

## ✅ **What to Report Back**

After checking, please share:
1. ✅/❌ Found AWS Support case #12905018968-1?
2. ✅/❌ Found any AWS Health Dashboard alerts?
3. ✅/❌ Found emails from abuse@amazon.com?
4. What are your EC2 Security Group outbound rules?
5. What are your Network ACL outbound rules?

This will help determine if it's AWS-side or local configuration!
