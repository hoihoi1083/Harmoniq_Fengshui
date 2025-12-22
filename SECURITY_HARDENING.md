# Security Hardening Complete

## 🔍 How the Malware Got In

The malware used **TWO attack vectors**:

### 1. **Systemd User Service Backdoor** (December 5, 2025)

- **File**: `~/.config/systemd/user/3c7c3c821410.service`
- **Payload**: Hidden Node.js script at `~/.local/share/.r0qsv8h1/.fvq2lzl64e.js`
- **Auto-start**: Enabled in user systemd
- **Entry point**: Likely through a **compromised npm package** or **vulnerable web endpoint**

### 2. **Monero Crypto Miner** (Ongoing)

- **Service**: `moneroocean_miner.service` (system-level)
- **Binary**: `/home/ec2-user/moneroocean/xmrig`
- **Memory hijack**: Set `vm.nr_hugepages=1170` (reserved 2.3GB RAM)
- **Firewall block**: Prevented legitimate traffic to port 3000

## ✅ Protections Already in Place

1. **Fail2ban** - Blocks brute force SSH attacks ✅
2. **Password authentication disabled** - SSH key-only ✅
3. **Firewalld active** - Basic firewall protection ✅
4. **Miner detection script** - Runs every 5 minutes ✅ (but wasn't running with sudo)

## ❌ Missing Critical Protections

### 1. **No File Integrity Monitoring**

- Malware created systemd services without detection
- No alerts when suspicious files were created

### 2. **Inadequate Miner Detection**

- Script ran without sudo permissions (couldn't kill root processes)
- Only checked process names, not systemd services

### 3. **No Memory Protection**

- No swap space (OOM crash vulnerability)
- No limits on hugepages allocation

### 4. **Weak Web Application Security**

- No rate limiting on API endpoints
- No intrusion detection for web exploits
- Application runs with full user privileges

### 5. **No Audit Logging**

- No monitoring of file system changes
- No alerts for new systemd services
- No tracking of sudo command execution

## 🛡️ Security Improvements Implemented

### ✅ Completed Today:

1. Removed crypto miner service and files
2. Removed hidden systemd backdoor service
3. Cleared hugepages memory reservation
4. Opened port 3000 in firewalld
5. Added AWS Security Group rule for load balancer

### ⚠️ Still Need to Implement:

#### Priority 1 (CRITICAL - Do Now):

- [ ] **Add swap space** to prevent OOM crashes
- [ ] **Fix miner detection** to run with sudo permissions
- [ ] **Block port 3000 to public** (only allow from load balancer)
- [ ] **Scan for npm vulnerabilities** (`npm audit fix`)
- [ ] **Check for rootkits** with rkhunter

#### Priority 2 (HIGH - This Week):

- [ ] **Install ClamAV** antivirus scanner
- [ ] **Enable auditd** for file system monitoring
- [ ] **Set up log monitoring** for suspicious activity
- [ ] **Restrict ec2-user sudo** to specific commands only
- [ ] **Enable SELinux enforcing mode** (currently permissive)

#### Priority 3 (MEDIUM - This Month):

- [ ] **Web Application Firewall** (ModSecurity or AWS WAF)
- [ ] **Automated security updates** with yum-cron
- [ ] **Container isolation** - Run app in Docker with limited privileges
- [ ] **API rate limiting** in application code
- [ ] **Regular security audits** with Lynis

## 🔧 Next Steps to Execute

Run these commands on your server:

```bash
# 1. Add swap space (prevents OOM crashes)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 2. Fix miner detection to run with sudo
sudo nano /etc/systemd/system/miner-detection.service
# Change: ExecStart=/usr/bin/sudo /home/ec2-user/fengshui-layout/detect-miners.sh
sudo systemctl daemon-reload

# 3. Block public access to port 3000
sudo firewall-cmd --permanent --remove-port=3000/tcp
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="172.31.0.0/16" port protocol="tcp" port="3000" accept'
sudo firewall-cmd --reload

# 4. Scan for vulnerabilities
cd ~/fengshui-layout
npm audit
npm audit fix

# 5. Install rootkit hunter
sudo dnf install -y rkhunter
sudo rkhunter --update
sudo rkhunter --check --skip-keypress

# 6. Enable strict SELinux
sudo setenforce 1
sudo sed -i 's/SELINUX=permissive/SELINUX=enforcing/' /etc/selinux/config

# 7. Install and configure ClamAV
sudo dnf install -y clamav clamd clamav-update
sudo freshclam
sudo systemctl enable --now clamd@scan

# 8. Set up audit logging
sudo dnf install -y audit
sudo systemctl enable --now auditd
sudo auditctl -w /home/ec2-user/.config/systemd/user/ -p wa -k systemd_user_services
sudo auditctl -w /etc/systemd/system/ -p wa -k systemd_services
```

## 🚨 How to Detect Future Attacks

Monitor these indicators:

1. **High CPU usage** (>80% sustained) → possible miner
2. **Low free memory** (<500MB) → possible memory hijack
3. **New systemd services** in `~/.config/systemd/user/` or `/etc/systemd/system/`
4. **Unexpected processes** containing: xmrig, kinsing, monero, cpuminer
5. **Sysctl changes** especially `vm.nr_hugepages`
6. **New files** in hidden directories (`~/.local/share/.*/`)

## 📊 Current Status

| Protection Layer  | Status        | Action Needed          |
| ----------------- | ------------- | ---------------------- |
| SSH Security      | ✅ Good       | None                   |
| Firewall          | ⚠️ Partial    | Block public port 3000 |
| Malware Detection | ⚠️ Weak       | Add sudo permissions   |
| Memory Protection | ❌ None       | Add swap space         |
| File Monitoring   | ❌ None       | Enable auditd          |
| Antivirus         | ❌ None       | Install ClamAV         |
| SELinux           | ⚠️ Permissive | Set to Enforcing       |
| Web Security      | ❌ Weak       | Add WAF/rate limiting  |

## 🎯 Recommended: Immediate Actions

**Within 24 hours:**

1. Add swap space
2. Fix miner detection permissions
3. Restrict port 3000 access
4. Run npm audit

**Within 1 week:** 5. Install ClamAV 6. Enable auditd 7. Enable SELinux enforcing

**Within 1 month:** 8. Implement WAF 9. Set up container isolation 10. Regular security audits
