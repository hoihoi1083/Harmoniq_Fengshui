# 🔒 Security Monitoring Guide

## 📧 Email Alerts Setup - COMPLETE ✅

**Alert Email:** hoihoi1083@gmail.com

### What Triggers Email Alerts:

1. **File Integrity Violations** 🚨
   - Config files modified (size/checksum changes)
   - next.config.js > 10KB (malware indicator)
   - Unauthorized file modifications

2. **Security Audit Failures** ⚠️
   - Obfuscated code detected
   - eval() usage found
   - Suspicious patterns in files
   - Large config files (>5KB)

3. **Critical Health Issues** 🚨
   - PM2 processes down
   - Memory usage >90%
   - Crypto miners detected
   - Suspicious system services

## 🔄 Automated Monitoring Schedule

```bash
# Daily at 2 AM UTC
File Integrity Check → Detects file tampering

# Weekly Sunday at 3 AM UTC  
Security Audit → Scans for malware

# Every 5 minutes
Health Check → Monitors system status
```

## 📋 Manual Monitoring Commands

### 1. **Run Health Check Now** (Recommended for instant status)
```bash
ssh fs "./fengshui-layout/server-health-check.sh"
```
**Use this when:**
- You want immediate server status
- Troubleshooting issues
- After making changes
- Quick daily check

### 2. **Check Recent Logs**
```bash
# View integrity alerts
ssh fs "tail -50 ~/fengshui-layout/logs/integrity-alerts.log"

# View health check history
ssh fs "tail -50 ~/fengshui-layout/logs/health-check.log"

# View security audit results
ssh fs "tail -50 ~/fengshui-layout/logs/security-audit.log"
```

### 3. **Force Security Scan**
```bash
ssh fs "cd ~/fengshui-layout && ./security-audit.sh"
```

### 4. **Force File Integrity Check**
```bash
ssh fs "cd ~/fengshui-layout && ./file-integrity-monitor.sh"
```

## 📊 What Gets Monitored

### File Integrity Monitor
- ✅ next.config.js (546 bytes baseline)
- ✅ package.json
- ✅ server.js  
- ✅ .env
- ✅ ecosystem.config.json

### Security Audit
- ✅ Obfuscated code detection
- ✅ eval() usage scanning
- ✅ Base64 payloads
- ✅ Suspicious patterns
- ✅ Config file size validation

### Health Check
- ✅ Crypto miner detection
- ✅ Memory/CPU usage
- ✅ Disk space
- ✅ PM2 process status
- ✅ Firewall status
- ✅ Failed SSH attempts
- ✅ Website accessibility

## 📧 Email Alert Examples

### You Will Receive Emails Like:

**Subject:** `[ip-172-31-38-137] 🚨 File Integrity Alert`
```
Server: ip-172-31-38-137
Time: 2025-12-26 10:30:00 UTC

File Integrity Violation!

File: /home/ec2-user/fengshui-layout/next.config.js
Old size: 546 bytes
New size: 27108 bytes
```

**Subject:** `[ip-172-31-38-137] ⚠️ Security Audit Failed`
```
Security Audit Failed!

Issues found: 3

Please review the security logs immediately.
```

**Subject:** `[ip-172-31-38-137] 🚨 Critical Server Health Alert`
```
Critical Server Health Issues!

Server: ip-172-31-38-137
Critical alerts: 2

Issues may include:
- PM2 processes down
- High memory usage (>90%)
```

## ✅ Daily Workflow Recommendation

### Morning Check (Optional - emails will notify you)
```bash
ssh fs "./fengshui-layout/server-health-check.sh"
```

### After Deployments (Always run this)
```bash
ssh fs "cd ~/fengshui-layout && ./pre-deployment-check.sh"
```

### If You Receive Alert Email
1. Check the specific log mentioned
2. Run health check for current status
3. Review what changed
4. Take action if needed

## 🛡️ System Status

- ✅ Email alerts: **ACTIVE** → hoihoi1083@gmail.com
- ✅ Automated monitoring: **RUNNING** (cron jobs)
- ✅ File integrity baseline: **INITIALIZED**
- ✅ Security audit: **SCHEDULED** (weekly)
- ✅ Health monitoring: **ACTIVE** (every 5 minutes)

## 🔧 Troubleshooting

### Not Receiving Emails?
```bash
# Test email system
ssh fs "cd ~/fengshui-layout && ./send-alert-email.sh 'Test' 'Testing email alerts'"

# Check mail logs
ssh fs "tail -50 /var/log/maillog"
```

### View Cron Jobs
```bash
ssh fs "crontab -l"
```

### Check Script Execution
```bash
ssh fs "ls -lh ~/fengshui-layout/logs/"
```

## 📞 Quick Response Checklist

**If you receive a critical alert:**

1. ✅ **Don't panic** - automated checks can have false positives
2. ✅ **Check logs** - ssh fs "tail -100 ~/fengshui-layout/logs/[log-name].log"
3. ✅ **Run health check** - Get current system status
4. ✅ **Review changes** - What was modified and when?
5. ✅ **Verify website** - Is https://www.harmoniqfengshui.online working?
6. ✅ **Check PM2** - ssh fs "pm2 status"
7. ✅ **Investigate** - Was it a legitimate change or intrusion?

---

## 🎯 Key Takeaway

**You have TWO monitoring approaches:**

1. **Passive** (Recommended): Let automated checks run, respond to email alerts
2. **Active**: Run `./server-health-check.sh` manually when you want instant status

Both work together! Automated monitoring catches issues 24/7, manual checks give you immediate visibility when you need it.
