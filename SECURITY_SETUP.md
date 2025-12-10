# Server Security - Crypto Miner Protection

**Setup Date:** 2025-12-10  
**Status:** ✅ Active

## Protections Implemented

### 1. Automated Miner Detection

- **Service:** `miner-detection.timer` (systemd)
- **Frequency:** Every 5 minutes
- **Detects:** xmrig, cpuminer, ethminer, and 10+ other miners
- **Action:** Auto-kills processes + logs to `/home/ec2-user/miner-detection.log`
- **Monitor:** `sudo systemctl status miner-detection.timer`

### 2. SSH Brute-Force Protection

- **Service:** fail2ban
- **Rules:**
    - 3 failed SSH attempts = 1 hour IP ban
    - 10 rapid attempts in 2 min = 1 hour ban
- **Status:** `sudo fail2ban-client status sshd`
- **Logs:** `/var/log/fail2ban.log`

### 3. Directory Security

- `/tmp` mounted with `noexec` flag (prevents miner execution)
- `/home/ec2-user` permissions restricted to 750
- SSH keys locked down to 640

### 4. Network Protection

- Mining pool ports blocked: 3333, 4444, 5555, 7777, 8333, 9999, 14444
- Only necessary ports open (80, 443, SSH)

### 5. Process Monitoring

- `atop` installed for detailed CPU/memory tracking
- Logs high CPU processes automatically
- Review: `atop` command

## How It Works

When a crypto miner is detected:

1. Detection script runs every 5 minutes via systemd timer
2. Scans for known miner process names and high CPU usage (>80%)
3. Immediately kills suspicious processes with `kill -9`
4. Logs incident to `/home/ec2-user/miner-detection.log`
5. Alerts system logger for monitoring

## Useful Commands

```bash
# Check miner detection status
sudo systemctl status miner-detection.timer

# View miner detection logs
tail -f /home/ec2-user/miner-detection.log

# Check for banned IPs (failed SSH attempts)
sudo fail2ban-client status sshd

# Manually run miner detection
bash /home/ec2-user/detect-miners.sh

# View process monitor
atop

# Check current CPU usage
top
```

## What to Watch For

**Warning Signs:**

- Consistently high CPU (>80%) with unknown processes
- Processes named similar to system services but misspelled
- Unusual network connections to port 3333, 4444, etc.
- Memory usage suddenly spiking without user activity

**Check regularly:**

```bash
# Resource usage
free -h
df -h

# Recent security events
sudo tail -20 /var/log/secure

# Active network connections
ss -tunap | grep ESTABLISHED
```

## Previous Incident

**Date:** 2025-12-10  
**Miner Found:** xmrig (PID 172730)  
**Impact:** 61% memory usage (2.4GB), server unresponsive  
**Resolution:** Killed process, removed files, implemented these protections

## Maintenance

- Miner detection runs automatically - no action needed
- Review logs weekly: `tail -50 /home/ec2-user/miner-detection.log`
- Check fail2ban monthly: `sudo fail2ban-client status`
- Update detection script if new miners emerge

## Emergency Response

If server becomes unresponsive:

```bash
# SSH in and check processes
ssh fs "ps aux --sort=-%cpu | head -20"

# Check for miners
ssh fs "ps aux | grep -iE 'xmrig|miner'"

# Kill suspicious process
ssh fs "kill -9 <PID>"

# Review what happened
ssh fs "tail -50 /home/ec2-user/miner-detection.log"
```

## Files

- `/home/ec2-user/detect-miners.sh` - Detection script
- `/home/ec2-user/secure-server.sh` - Setup script
- `/etc/systemd/system/miner-detection.service` - Service definition
- `/etc/systemd/system/miner-detection.timer` - Timer configuration
- `/etc/fail2ban/jail.local` - SSH protection rules
