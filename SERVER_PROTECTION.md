# Server protection and resource checks

## 1. Protecting from malware (what we do)

### Layers already in place

| Layer | What it does |
|-------|----------------|
| **detect-miners.sh** (cron every 5 min) | Kills miner processes, removes miner files from project and home, **removes executables in /dev/shm**, removes suspicious binaries in home (e.g. `nc`, `ncat`), resets hugepages, checks for suspicious systemd services. |
| **secure-server.sh** (run once after setup) | Secures /tmp and /dev/shm with noexec, tightens home and SSH permissions, installs fail2ban, blocks mining ports in firewall, installs atop. |
| **server-health-check.sh** | Full health and security check (miners, disk, RAM, CPU, cron, firewall, SSH, file integrity). Run weekly or on demand. |
| **monitor-health.sh** (cron every 5 min) | Website + CPU + suspicious process + malicious cron checks; sends alerts. |
| **file-integrity-monitor.sh** (cron daily) | Detects changes to config files (next.config.js, .env, etc.). |
| **security-audit.sh** (cron weekly) | Malware scan. |

### One-time hardening (run on the server)

```bash
cd ~/fengshui-layout
bash secure-server.sh
```

This applies /tmp and /dev/shm noexec, firewall rules, fail2ban, and ensures detect-miners cron. **If you have not run it yet, run it once.**  
If any application stops working after running it, the cause is sometimes `/dev/shm` noexec; you can remount without noexec or comment out that step in `secure-server.sh`.

### Remove malware that is already there

- **Suspicious binaries in /dev/shm**  
  Handled automatically by `detect-miners.sh` every 5 minutes. You can also run:
  ```bash
  sudo rm -f /dev/shm/*
  ```
  (Only if you don’t use /dev/shm for legitimate apps.)

- **Suspicious binary in home (e.g. `~/nc`)**  
  Handled by `detect-miners.sh` (removes `nc`, `ncat`, `.nc`, `.ncat` from home). Or manually:
  ```bash
  rm -f ~/nc ~/ncat
  ```

- **Unknown executables in home**  
  List and review:
  ```bash
  find ~ -maxdepth 1 -type f -executable
  ```
  Delete only ones you don’t recognize (e.g. backdoors). Don’t remove scripts you use (e.g. `detect-miners.sh`, `secure-server.sh`).

### Keep the server safer going forward

1. **Deploy the latest scripts**  
   So the server uses the versions that clean /dev/shm and home binaries and that whitelist `detect-miners` in cron checks.

2. **Keep crons running**  
   - Health check (monitor-health.sh)  
   - detect-miners.sh  
   - file-integrity-monitor.sh  
   - security-audit.sh  

3. **Strong SSH**  
   Use key-based login only; consider disabling password auth.

4. **Updates**  
   Apply security updates regularly (e.g. `sudo yum update -y` on Amazon Linux).

5. **No random executables in home**  
   Legitimate tools are usually under `/usr/bin` or your app dir. If you see new executables in `~` or `/dev/shm`, treat them as suspicious.

---

## 2. Checking disk, RAM, CPU and abnormalities

### Quick one-shot check (recommended)

On the server:

```bash
cd ~/fengshui-layout
bash check-server-resources.sh
```

This prints:

- **Disk**: Usage % for `/` and whether it’s OK / HIGH / CRITICAL.
- **RAM**: Total, used, free, swap; and OK / HIGH / CRITICAL by usage %.
- **CPU**: Load average and OK / Elevated / High.
- **Top 5 processes** by CPU (to spot unknown heavy processes).
- **Summary** line for any abnormalities.

### Watch mode (refresh every 5 seconds)

```bash
bash check-server-resources.sh --watch
```

Use this when you’re investigating high load or suspect something is consuming resources. Ctrl+C to stop.

### Manual commands (same ideas)

```bash
# Disk
df -h /

# RAM
free -h

# CPU load
uptime

# Top CPU processes
ps aux --sort=-%cpu | head -10

# Top memory processes
ps aux --sort=-%mem | head -10
```

### What counts as “abnormal”

| Resource | Normal | Warning | Critical |
|----------|--------|---------|----------|
| Disk / | &lt; 80% | 80–89% | ≥ 90% |
| RAM | &lt; 80% | 80–89% | ≥ 90% |
| Load (1-min) | &lt; 2× CPU cores | 2–3× | &gt; 3× or sustained high |
| Process | Known (node, pm2, system) | Unknown name, high CPU | Unknown + very high CPU (e.g. miner) |

If you see high CPU or RAM from a process you don’t recognize (e.g. random name, not `node`/`pm2`), run:

```bash
# Full health + security check
bash server-health-check.sh
```

---

## 3. Quick reference

| Goal | Command |
|------|--------|
| Harden server once | `bash secure-server.sh` |
| Check disk/RAM/CPU + abnormalities | `bash check-server-resources.sh` |
| Watch resources live | `bash check-server-resources.sh --watch` |
| Full security + health check | `bash server-health-check.sh` |
| Miner/malware cleanup (runs every 5 min via cron) | `bash detect-miners.sh` |

All from `~/fengshui-layout` on the server.
