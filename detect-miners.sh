#!/bin/bash
# Detect and kill crypto miners (Enhanced Security)

MINER_PROCESSES="xmrig|cpuminer|ccminer|ethminer|claymore|phoenixminer|t-rex|lolminer|nbminer|gminer|nicehash|stratum|cryptonight|monero"
LOG_FILE="/home/ec2-user/miner-detection.log"

# Check for suspicious processes
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
