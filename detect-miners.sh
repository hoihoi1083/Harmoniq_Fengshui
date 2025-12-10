#!/bin/bash
# Detect and kill crypto miners

MINER_PROCESSES="xmrig|cpuminer|ccminer|ethminer|claymore|phoenixminer|t-rex|lolminer|nbminer|gminer|nicehash|stratum|cryptonight"
LOG_FILE="/home/ec2-user/miner-detection.log"

# Check for suspicious processes
FOUND=$(ps aux | grep -iE "$MINER_PROCESSES" | grep -v grep)

if [ ! -z "$FOUND" ]; then
    echo "[$(date)] ALERT: Crypto miner detected!" >> $LOG_FILE
    echo "$FOUND" >> $LOG_FILE
    
    # Kill the processes
    ps aux | grep -iE "$MINER_PROCESSES" | grep -v grep | awk '{print $2}' | xargs -r kill -9
    echo "[$(date)] Killed miner processes" >> $LOG_FILE
    
    # Alert via system log
    logger -t MINER_ALERT "Crypto miner detected and killed"
fi

# Check for high CPU usage (>80% indicates potential miner)
HIGH_CPU=$(ps aux | awk '$3 > 80.0 {print $2,$11,$3}')
if [ ! -z "$HIGH_CPU" ]; then
    echo "[$(date)] High CPU processes: $HIGH_CPU" >> $LOG_FILE
fi
