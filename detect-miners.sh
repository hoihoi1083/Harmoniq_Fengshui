#!/bin/bash
# Detect and kill crypto miners, and remove miner files from disk (Enhanced Security)

MINER_PROCESSES="xmrig|cpuminer|ccminer|ethminer|claymore|phoenixminer|t-rex|lolminer|nbminer|gminer|nicehash|stratum|cryptonight|monero|pulseadio"
LOG_FILE="/home/ec2-user/miner-detection.log"
# Project dir (same as deployment); use env or default
PROJECT_DIR="${FENGSHUI_LAYOUT:-$HOME/fengshui-layout}"

# --- 1. Remove known miner files/dirs from project (so they can't be restarted) ---
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR" || true
    for name in xmrig-6.21.0 xmrig.tar.gz xmrig-auto.tar.gz xmrig linux_amd64 lrt scanner_linux mist bbs nul pulseadio .pulseadio; do
        if [ -e "$name" ]; then
            echo "[$(date)] Removing miner file/dir: $name" >> "$LOG_FILE"
            rm -rf "$name" 2>/dev/null || true
        fi
    done
    # Any path matching xmrig*
    find . -maxdepth 2 -name 'xmrig*' -exec rm -rf {} \; 2>/dev/null || true
fi

# --- 1b. Remove known malware from home dir (e.g. .pulseadio typosquat) ---
for name in .pulseadio pulseadio; do
    if [ -e "$HOME/$name" ]; then
        echo "[$(date)] Removing home-dir malware: $HOME/$name" >> "$LOG_FILE"
        rm -rf "$HOME/$name" 2>/dev/null || true
    fi
done

# --- 2. Check for suspicious processes ---
FOUND=$(ps aux | grep -iE "$MINER_PROCESSES" | grep -v grep)

if [ ! -z "$FOUND" ]; then
    echo "[$(date)] ALERT: Crypto miner detected!" >> $LOG_FILE
    echo "$FOUND" >> $LOG_FILE
    
    # Kill the processes with sudo
    ps aux | grep -iE "$MINER_PROCESSES" | grep -v grep | awk '{print $2}' | xargs -r sudo kill -9
    echo "[$(date)] Killed miner processes" >> $LOG_FILE
    
    # Alert via system log
    logger -t MINER_ALERT "Crypto miner detected and killed"
fi

# Check for high CPU usage (>80% indicates potential miner)
HIGH_CPU=$(ps aux | awk '$3 > 80.0 {print $2,$11,$3}')
if [ ! -z "$HIGH_CPU" ]; then
    echo "[$(date)] High CPU processes: $HIGH_CPU" >> $LOG_FILE
fi

# Check for suspicious systemd services
SUSPICIOUS_SERVICES=$(sudo systemctl list-units --all | grep -iE 'miner|xmrig|crypto|ocean' | grep -v 'miner-detection')
if [ ! -z "$SUSPICIOUS_SERVICES" ]; then
    echo "[$(date)] ALERT: Suspicious systemd services found!" >> $LOG_FILE
    echo "$SUSPICIOUS_SERVICES" >> $LOG_FILE
    logger -t MINER_ALERT "Suspicious systemd services detected"
fi

# Check for hugepages allocation (crypto miner trick)
HUGEPAGES=$(sysctl vm.nr_hugepages | awk '{print $3}')
if [ "$HUGEPAGES" -gt 0 ]; then
    echo "[$(date)] ALERT: Hugepages allocation detected: $HUGEPAGES" >> $LOG_FILE
    sudo sysctl -w vm.nr_hugepages=0
    echo "[$(date)] Reset hugepages to 0" >> $LOG_FILE
    logger -t MINER_ALERT "Hugepages allocation blocked"
fi

# Check for hidden systemd user services
HIDDEN_SERVICES=$(find ~/.config/systemd/user/ -name '*.service' 2>/dev/null | grep -v 'pm2')
if [ ! -z "$HIDDEN_SERVICES" ]; then
    echo "[$(date)] ALERT: Hidden user systemd services found!" >> $LOG_FILE
    echo "$HIDDEN_SERVICES" >> $LOG_FILE
    logger -t MINER_ALERT "Hidden systemd user services detected"
fi
