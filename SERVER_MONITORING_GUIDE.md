# Server Monitoring & Security Check Guide

## 🎯 Quick Reference

### Daily Check (5 seconds)

```bash
curl -I https://www.harmoniqfengshui.com
```

Expected: `HTTP/2 200` or `HTTP/2 307` ✅

### Weekly Health Check (30 seconds)

```bash
ssh fs "./fengshui-layout/server-health-check.sh"
```

### One-Line Complete Check

```bash
ssh fs "echo '=== CRYPTO MINERS ===' && ps aux | grep -E 'xmrig|cpuminer|monero' | grep -v grep || echo 'None detected' && echo -e '\n=== MEMORY ===' && free -h && echo -e '\n=== DISK ===' && df -h / && echo -e '\n=== CPU LOAD ===' && uptime && echo -e '\n=== HUGEPAGES ===' && sysctl vm.nr_hugepages && echo -e '\n=== PM2 STATUS ===' && pm2 list && echo -e '\n=== WEBSITE ===' && curl -s -o /dev/null -w 'HTTP: %{http_code}\n' http://localhost:3000/api/health"
```

---

## 📋 Individual Check Commands

### 1. Check for Crypto Miners

```bash
ssh fs "ps aux | grep -E 'xmrig|cpuminer|monero' | grep -v grep"
```

**Good Result:** No output  
**Bad Result:** Shows process with xmrig/miner/monero

---

### 2. Check Memory Usage

```bash
ssh fs "free -h"
```

**Good Result:**

- Available > 1GB ✅
- Swap usage: 0% ✅

**Bad Result:**

- Available < 500MB 🚨
- Swap usage > 50% ⚠️

---

### 3. Check Disk Space

```bash
ssh fs "df -h /"
```

**Good Result:** < 90% used ✅  
**Warning:** 90-95% used ⚠️  
**Critical:** > 95% used 🚨

**Clean logs if needed:**

```bash
ssh fs "pm2 flush && cd fengshui-layout/logs && rm -f *.log.old"
```

---

### 4. Check CPU Load

```bash
ssh fs "uptime"
```

**Good Result:** Load average < 2.0 ✅  
**Warning:** Load average 2.0-3.0 ⚠️  
**Critical:** Load average > 3.0 🚨 (possible miner)

---

### 5. Check Hugepages (Crypto Miner Trick)

```bash
ssh fs "sysctl vm.nr_hugepages"
```

**Good Result:** `vm.nr_hugepages = 0` ✅  
**Bad Result:** Any number > 0 🚨 (crypto miner indicator!)

**Fix if needed:**

```bash
ssh fs "sudo sysctl -w vm.nr_hugepages=0"
```

---

### 6. Check Application Status

```bash
ssh fs "pm2 list"
```

**Good Result:** Both instances show `online` status ✅  
**Bad Result:** `stopped`, `errored`, or `restarting` 🚨

**Restart if needed:**

```bash
ssh fs "pm2 restart all"
```

---

### 7. Check Website Health

```bash
ssh fs "curl -I http://localhost:3000/api/health"
```

**Good Result:** `HTTP/1.1 200 OK` ✅  
**Bad Result:** Connection refused, timeout, or error codes 🚨

**Public website check:**

```bash
curl -I https://www.harmoniqfengshui.com
```

---

### 8. Check for Suspicious Services

```bash
ssh fs "systemctl list-units | grep -E 'miner|xmrig|ocean' | grep -v detection"
```

**Good Result:** No output ✅  
**Bad Result:** Shows unknown services 🚨

**Stop suspicious service:**

```bash
ssh fs "sudo systemctl stop <service-name> && sudo systemctl disable <service-name>"
```

---

### 9. Check Failed SSH Login Attempts

```bash
ssh fs "sudo journalctl -u sshd --since '24 hours ago' | grep 'Failed password' | wc -l"
```

**Good Result:** < 50 attempts ✅  
**Warning:** 50-100 attempts ⚠️  
**Critical:** > 100 attempts 🚨 (under attack)

**See recent failed attempts:**

```bash
ssh fs "sudo journalctl -u sshd --since '24 hours ago' | grep 'Failed password' | tail -20"
```

---

### 10. Check Log Sizes

```bash
ssh fs "du -sh ~/fengshui-layout/logs"
```

**Good Result:** < 200MB ✅  
**Warning:** 200MB-500MB ⚠️  
**Action:** > 500MB - Clean logs

**Clean logs:**

```bash
ssh fs "pm2 flush"
```

---

## 🚨 Malware Detection Signs

### Immediate Red Flags:

1. **High CPU** (>80%) with unknown process ⚠️
2. **Hugepages > 0** 🚨
3. **Process names:** xmrig, cpuminer, kinsing, monero 🚨
4. **New systemd services** you didn't create 🚨
5. **Memory suddenly dropping** 🚨
6. **Website slow/unresponsive** ⚠️

### If You Detect Malware:

#### Step 1: Kill the Process

```bash
ssh fs "ps aux | grep -E 'xmrig|miner' | awk '{print \$2}' | xargs sudo kill -9"
```

#### Step 2: Check for Systemd Service

```bash
ssh fs "sudo systemctl list-units --all | grep -E 'miner|xmrig|ocean'"
```

#### Step 3: Stop and Remove Service

```bash
ssh fs "sudo systemctl stop <service-name> && sudo systemctl disable <service-name> && sudo rm /etc/systemd/system/<service-name>.service && sudo systemctl daemon-reload"
```

#### Step 4: Check for Hidden User Services

```bash
ssh fs "find ~/.config/systemd/user/ -name '*.service'"
```

#### Step 5: Reset Hugepages

```bash
ssh fs "sudo sysctl -w vm.nr_hugepages=0"
```

#### Step 6: Run Full Health Check

```bash
ssh fs "./fengshui-layout/server-health-check.sh"
```

---

## 📅 Recommended Monitoring Schedule

### Daily (5 seconds)

```bash
# Check if website is up
curl -I https://www.harmoniqfengshui.com
```

### Weekly (30 seconds)

```bash
# Run full health check
ssh fs "./fengshui-layout/server-health-check.sh"
```

### Monthly (5 minutes)

```bash
# Check for security updates
ssh fs "sudo dnf check-update | grep -i security"

# Clean old logs
ssh fs "pm2 flush && find ~/fengshui-layout/logs -name '*.log' -mtime +30 -delete"

# Check disk space
ssh fs "df -h"
```

---

## 🛠️ Maintenance Commands

### Restart Application

```bash
ssh fs "pm2 restart all"
```

### Clear Logs

```bash
ssh fs "pm2 flush"
```

### Check PM2 Logs (real-time)

```bash
ssh fs "pm2 logs --lines 50"
```

### Check System Resource Usage

```bash
ssh fs "top -b -n 1 | head -20"
```

### Update System Packages

```bash
ssh fs "sudo dnf update -y"
```

### Restart Server (use sparingly)

```bash
ssh fs "sudo reboot"
```

---

## 📊 Healthy Server Baseline

**Memory:**

- Total: 3.7GB
- Used: < 2.5GB (< 70%)
- Free: > 1GB
- Swap: 2GB (0% used)

**Disk:**

- Total: 8GB
- Used: < 7GB (< 88%)
- Free: > 800MB

**CPU:**

- Load average: < 2.0
- App processes: ~1-2% each

**Application:**

- PM2 instances: 2 online
- Memory per instance: 150-300MB
- Restarts: 0

**Network:**

- Website: HTTP 200/307
- Failed SSH: < 50/day

---

## 🔐 Security Protections Currently Active

✅ **Miner Detection** - Runs every 5 minutes automatically  
✅ **Firewall** - Port 3000 restricted to VPC only  
✅ **Swap Space** - 2GB prevents OOM crashes  
✅ **Rootkit Scanner** - rkhunter installed  
✅ **AWS Security Group** - Load balancer access only

---

## 📞 Emergency Contact Checklist

If server is completely down:

1. **Check AWS Console** - Is EC2 instance running?
2. **Reboot instance** - AWS Console → Instances → Actions → Reboot
3. **Wait 5 minutes** - For health checks to pass
4. **Test website** - `curl -I https://www.harmoniqfengshui.com`
5. **Check logs** - `ssh fs "pm2 logs --lines 100"`

---

## 📝 Notes

- **Last Malware Attack:** 2025-12-13 (xmrig crypto miner)
- **Last Server Crash:** 2025-12-13 16:59 (OOM - Out of Memory)
- **Protections Added:** 2025-12-14
- **Next Review Date:** 2025-12-21 (weekly)

---

## 🎯 Quick Action Reference

| Symptom       | Command                                    | Action                   |
| ------------- | ------------------------------------------ | ------------------------ |
| Website down  | `curl -I https://www.harmoniqfengshui.com` | Check PM2 status         |
| High CPU      | `ssh fs "top -b -n 1 \| head -20"`         | Look for miner processes |
| Low memory    | `ssh fs "free -h"`                         | Check for memory leak    |
| High disk     | `ssh fs "df -h /"`                         | Clean logs               |
| Slow response | `ssh fs "uptime"`                          | Check load average       |

---

**Last Updated:** 2025-12-14  
**Script Location:** `/home/ec2-user/fengshui-layout/server-health-check.sh`
