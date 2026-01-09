# 🔒 Secure Deployment - Pre-Flight Checklist

## ✅ What the Script Protects

### Server Files That Are PRESERVED (Won't be deleted):

- ✅ `logs/` - All your application logs
- ✅ `.env` - Production environment variables
- ✅ `.env.production` - Production config
- ✅ `ecosystem.config.json` - PM2 production settings
- ✅ Security monitoring scripts (detect-miners.sh, etc.)
- ✅ Crontab jobs (monitoring schedule)

### Server Files That Are CLEANED (Rebuilt fresh):

- 🔄 `node_modules/` - Deleted and reinstalled fresh
- 🔄 `.next/` - Deleted and rebuilt from source
- 🔄 Source code (.js, .jsx, etc.) - Updated from local
- 🧹 Malware/miners - Detected and removed
- 🧹 Suspicious processes - Killed

---

## 📋 Before Running Deployment

### 1. Check Your Local Code

```bash
# Make sure you're in the right directory
cd /Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout

# Check your changes
git status  # (if using git)

# Test locally (optional)
npm run dev
```

### 2. Verify Server Access

```bash
# Test SSH connection
ssh fs "echo 'Connection OK'"

# Should output: Connection OK
```

### 3. Check Current Server Status

```bash
# Check if app is running
ssh fs "pm2 status"

# Check for existing issues
ssh fs "cd ~/fengshui-layout && bash detect-miners.sh"
```

---

## 🚀 Running Secure Deployment

### Step 1: Make Script Executable

```bash
chmod +x secure-deployment.sh
```

### Step 2: Run Deployment

```bash
./secure-deployment.sh
```

### Step 3: Watch the Process

The script will show 7 steps:

1. ✅ Scan local code
2. ✅ Clean server (kill malware)
3. ✅ Deploy code
4. ✅ Scan server after deployment
5. ✅ Restart services
6. ✅ Verify monitoring
7. ✅ Final verification

### Step 4: Verify Success

```bash
# Check if site is live
curl -I https://harmoniqfengshui.com

# Check PM2 status
ssh fs "pm2 status"

# Check logs
ssh fs "tail -50 ~/fengshui-layout/logs/health-check.log"
```

---

## ⚠️ What If Something Goes Wrong?

### Scenario 1: Deployment Fails During Upload

**Problem**: Network issue or SSH timeout

**Solution**:

```bash
# Just run again - it's safe to retry
./secure-deployment.sh
```

### Scenario 2: Build Fails on Server

**Problem**: npm install or build errors

**Solution**:

```bash
# Check what went wrong
ssh fs "cd ~/fengshui-layout && npm run build"

# Check Node.js version
ssh fs "node --version"  # Should be 18+

# Clear everything and rebuild
ssh fs "cd ~/fengshui-layout && rm -rf node_modules .next && npm install && npm run build"
```

### Scenario 3: App Won't Start After Deployment

**Problem**: PM2 can't start the app

**Solution**:

```bash
# Check PM2 logs
ssh fs "pm2 logs --lines 50"

# Check environment variables
ssh fs "cd ~/fengshui-layout && cat .env | grep -v PASSWORD | grep -v SECRET"

# Restart manually
ssh fs "cd ~/fengshui-layout && pm2 restart all"
```

### Scenario 4: Malware Detected After Deployment

**Problem**: Post-deployment scan found suspicious files

**Solution**:

```bash
# Check what was found
ssh fs "cd ~/fengshui-layout && bash detect-miners.sh"

# Clean and redeploy
./secure-deployment.sh
```

### Scenario 5: Old Logs Disappeared

**Problem**: You need old logs but they seem missing

**Solution**:

```bash
# Logs are preserved! Check backup
ssh fs "ls -lh ~/fengshui-layout/logs/"

# If logs are really missing (shouldn't happen)
ssh fs "cd ~/fengshui-layout && mkdir -p logs"
```

---

## 🛡️ Security Verification After Deployment

### 1. Check No Miners Running

```bash
ssh fs "ps aux | grep -E 'xmrig|minerd|crypto.*mine' | grep -v grep"
# Should return nothing
```

### 2. Check Monitoring is Active

```bash
ssh fs "crontab -l | grep -E 'detect-miners|monitor-health|file-integrity|security-audit'"
# Should show 4 cron jobs
```

### 3. Check File Integrity

```bash
ssh fs "cd ~/fengshui-layout && bash file-integrity-monitor.sh"
# Should complete without critical errors
```

### 4. Check Health Status

```bash
ssh fs "cd ~/fengshui-layout && bash monitor-health.sh"
# Should show healthy CPU/memory/disk
```

---

## 📊 Understanding the Deployment Flow

### What Happens Under the Hood:

```
┌─────────────────────────────────────────┐
│  LOCAL MACHINE (Your Mac)              │
├─────────────────────────────────────────┤
│  1. Scan local source code ✓           │
│  2. Check package.json ✓               │
└────────────┬────────────────────────────┘
             │ SSH Connection
             ▼
┌─────────────────────────────────────────┐
│  SERVER (Before Deployment)             │
├─────────────────────────────────────────┤
│  3. Backup important files ✓            │
│     • logs/                             │
│     • .env                              │
│     • ecosystem.config.json             │
│                                         │
│  4. Kill malware processes ✓            │
│     • xmrig, minerd, etc.               │
│                                         │
│  5. Delete suspicious files ✓           │
│     • Infected node_modules             │
│     • Injected .next files              │
└────────────┬────────────────────────────┘
             │ rsync upload
             ▼
┌─────────────────────────────────────────┐
│  SERVER (During Deployment)             │
├─────────────────────────────────────────┤
│  6. Upload fresh source code ✓          │
│     • Excludes: node_modules, .next     │
│     • Excludes: .env, logs/             │
│                                         │
│  7. Restore important files ✓           │
│     • Restore: logs/                    │
│     • Restore: .env                     │
│     • Restore: ecosystem.config.json    │
│                                         │
│  8. Delete old builds ✓                 │
│     • rm -rf node_modules .next         │
│                                         │
│  9. Fresh install ✓                     │
│     • npm install --production          │
│                                         │
│  10. Fresh build ✓                      │
│     • npm run build                     │
└────────────┬────────────────────────────┘
             │ Verification
             ▼
┌─────────────────────────────────────────┐
│  SERVER (After Deployment)              │
├─────────────────────────────────────────┤
│  11. Scan for malware ✓                 │
│      • Check processes                  │
│      • Check .next build                │
│      • Check node_modules               │
│                                         │
│  12. Restart PM2 ✓                      │
│      • pm2 restart all                  │
│                                         │
│  13. Verify monitoring ✓                │
│      • Check crontab jobs               │
│      • Test health check                │
│                                         │
│  14. Final checks ✓                     │
│      • Test HTTP response               │
│      • Verify logs                      │
└─────────────────────────────────────────┘
```

---

## 🎯 Quick Reference Commands

### Deployment

```bash
# Full secure deployment (recommended)
./secure-deployment.sh

# Quick deployment without cleaning (use only if server is clean)
./complete-deployment.sh
```

### Monitoring

```bash
# Check for malware
ssh fs "cd ~/fengshui-layout && bash detect-miners.sh"

# Check health
ssh fs "cd ~/fengshui-layout && bash monitor-health.sh"

# Check file integrity
ssh fs "cd ~/fengshui-layout && bash file-integrity-monitor.sh"

# Full security audit
ssh fs "cd ~/fengshui-layout && bash security-audit.sh"
```

### Troubleshooting

```bash
# View PM2 logs
ssh fs "pm2 logs --lines 100"

# View health logs
ssh fs "tail -100 ~/fengshui-layout/logs/health-check.log"

# View miner detection logs
ssh fs "tail -100 ~/fengshui-layout/logs/detect-miners.log"

# Check running processes
ssh fs "ps aux | grep node"

# Check disk space
ssh fs "df -h"

# Check memory
ssh fs "free -h"
```

### Emergency

```bash
# Stop everything
ssh fs "pm2 stop all"

# Kill all Node processes
ssh fs "pkill -9 node"

# Restart from scratch
ssh fs "cd ~/fengshui-layout && pm2 delete all && pm2 start ecosystem.config.json"
```

---

## ✅ Deployment Success Checklist

After deployment completes, verify:

- [ ] Script completed all 7 steps without errors
- [ ] `pm2 status` shows app is "online"
- [ ] Website loads: https://harmoniqfengshui.com
- [ ] No miner processes: `ssh fs "ps aux | grep xmrig"`
- [ ] Monitoring active: `ssh fs "crontab -l | wc -l"` (should be > 4)
- [ ] Logs exist: `ssh fs "ls ~/fengshui-layout/logs/"`
- [ ] Recent log entries: `ssh fs "tail -5 ~/fengshui-layout/logs/health-check.log"`

---

## 🎉 You're All Set!

Your deployment process now:

1. ✅ Preserves important server files
2. ✅ Cleans malware before deployment
3. ✅ Uploads fresh code
4. ✅ Rebuilds from scratch
5. ✅ Verifies security after deployment
6. ✅ Maintains continuous monitoring

**Result**: Clean, secure deployment every time! 🚀
