#!/bin/bash
# Detect and kill crypto miners, suspicious droppers, and persistence artifacts.

set -u

LOG_FILE="/home/ec2-user/fengshui-layout/logs/miner-detection.log"
PROJECT_DIR="${FENGSHUI_LAYOUT:-$HOME/fengshui-layout}"
SUSPICIOUS_EXIT=0

# Known miner/dropper indicators seen on this host + common miner families.
IOC_PATTERN="xmrig|cpuminer|ccminer|ethminer|claymore|phoenixminer|t-rex|lolminer|nbminer|gminer|nicehash|stratum|cryptonight|monero|pulseadio|qStScw|z2MauN|193.135.9.84|185.205.210.67"

log() {
    echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" >> "$LOG_FILE"
}

kill_pid_force() {
    local pid="$1"
    kill -9 "$pid" 2>/dev/null || sudo kill -9 "$pid" 2>/dev/null || true
}

remove_path_if_exists() {
    local target="$1"
    if [ -e "$target" ]; then
        log "Removing suspicious path: $target"
        rm -rf "$target" 2>/dev/null || sudo rm -rf "$target" 2>/dev/null || true
        SUSPICIOUS_EXIT=1
    fi
}

mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

log "=== miner scan started ==="

# 1) Remove known malicious artifacts from project/home/tmp.
for p in \
    "$PROJECT_DIR/xmrig-6.21.0" \
    "$PROJECT_DIR/xmrig.tar.gz" \
    "$PROJECT_DIR/xmrig-auto.tar.gz" \
    "$PROJECT_DIR/xmrig" \
    "$PROJECT_DIR/linux_amd64" \
    "$PROJECT_DIR/scanner_linux" \
    "$PROJECT_DIR/mist" \
    "$PROJECT_DIR/bbs" \
    "$PROJECT_DIR/nul" \
    "$PROJECT_DIR/pulseadio" \
    "$PROJECT_DIR/.pulseadio" \
    "$HOME/.pulseadio" \
    "$HOME/pulseadio" \
    "/tmp/nodes"; do
    remove_path_if_exists "$p"
done

# 2) Remove suspicious executable names in home root.
for name in nc ncat .nc .ncat qStScw z2MauN lrt let; do
    if [ -f "$HOME/$name" ] && [ -x "$HOME/$name" ]; then
        remove_path_if_exists "$HOME/$name"
    fi
done

# 3) Purge executable files in /dev/shm (except lock/socket/pid patterns).
if [ -d /dev/shm ]; then
    for f in /dev/shm/*; do
        [ -e "$f" ] || continue
        [ -f "$f" ] || continue
        [ -x "$f" ] || continue
        case "$(basename "$f")" in
            *.pid|*.sock|*.lock) continue ;;
        esac
        log "Removing executable in /dev/shm: $f"
        rm -f "$f" 2>/dev/null || sudo rm -f "$f" 2>/dev/null || true
        SUSPICIOUS_EXIT=1
    done
fi

# 4) Kill suspicious processes by command pattern.
SUS_PROC_PIDS="$(ps -eo pid=,args= | awk -v pat="$IOC_PATTERN" -v self="$$" 'BEGIN{IGNORECASE=1} $0 ~ pat && $1 != self && tolower($0) !~ /detect-miners\.sh/ && tolower($0) !~ /awk -v pat=/ && tolower($0) !~ /ps -eo pid=/ {print $1}')"
if [ -n "$SUS_PROC_PIDS" ]; then
    log "Suspicious process(es) detected: $SUS_PROC_PIDS"
    for pid in $SUS_PROC_PIDS; do
        kill_pid_force "$pid"
    done
    logger -t MINER_ALERT "Suspicious process detected and killed"
    SUSPICIOUS_EXIT=1
fi

# 5) High CPU process telemetry (>80%).
HIGH_CPU="$(ps -eo pid=,pcpu=,args= | awk '$2 > 80.0 {print $0}')"
if [ -n "$HIGH_CPU" ]; then
    log "High CPU process(es): $HIGH_CPU"
fi

# 6) Suspicious systemd services (system + user).
SVC_SYSTEM="$(systemctl list-units --all --no-pager 2>/dev/null | awk 'BEGIN{IGNORECASE=1} /miner|xmrig|crypto|pulseadio|qStScw|z2MauN/ && tolower($0) !~ /miner-detection/ {print}')"
SVC_USER="$(systemctl --user list-unit-files --no-pager 2>/dev/null | awk 'BEGIN{IGNORECASE=1} /miner|xmrig|crypto|pulseadio|qStScw|z2MauN/ && tolower($0) !~ /miner-detection/ {print}')"
if [ -n "$SVC_SYSTEM$SVC_USER" ]; then
    log "Suspicious systemd service entries found."
    [ -n "$SVC_SYSTEM" ] && log "system units: $SVC_SYSTEM"
    [ -n "$SVC_USER" ] && log "user units: $SVC_USER"
    logger -t MINER_ALERT "Suspicious systemd services detected"
    SUSPICIOUS_EXIT=1
fi

# 7) Hugepages misuse check.
HUGEPAGES="$(sysctl -n vm.nr_hugepages 2>/dev/null || echo 0)"
if [ "${HUGEPAGES:-0}" -gt 0 ]; then
    log "ALERT: Hugepages allocation detected: $HUGEPAGES"
    sysctl -w vm.nr_hugepages=0 >/dev/null 2>&1 || sudo sysctl -w vm.nr_hugepages=0 >/dev/null 2>&1 || true
    log "Hugepages reset attempt completed."
    logger -t MINER_ALERT "Hugepages allocation blocked"
    SUSPICIOUS_EXIT=1
fi

# 8) Persistence checks in shell startup files.
for rc in "$HOME/.bashrc" "$HOME/.profile" "$HOME/.bash_profile"; do
    [ -f "$rc" ] || continue
    HIT="$(awk 'BEGIN{IGNORECASE=1} /curl .*193\.135\.9\.84|curl .*185\.205\.210\.67|wget .*193\.135\.9\.84|wget .*185\.205\.210\.67|authorized_keys|\/tmp\/nodes|base64 -d .*bash|nohup .*\/dev\/shm/ {print}' "$rc")"
    if [ -n "$HIT" ]; then
        log "ALERT: Suspicious startup command in $rc: $HIT"
        logger -t MINER_ALERT "Suspicious shell startup persistence detected"
        SUSPICIOUS_EXIT=1
    fi
done

if [ "$SUSPICIOUS_EXIT" -eq 1 ]; then
    log "=== miner scan completed: suspicious indicators found ==="
    exit 1
fi

log "=== miner scan completed: clean ==="
exit 0
