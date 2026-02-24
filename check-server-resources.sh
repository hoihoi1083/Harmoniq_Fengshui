#!/bin/bash
# Quick check: disk space, RAM, CPU usage and what looks abnormal.
# Run on server: bash check-server-resources.sh
# Usage: ./check-server-resources.sh [--watch]   (--watch = refresh every 5s)

WATCH="${1:-}"

print_sep() { echo "────────────────────────────────────────"; }

run_check() {
    echo ""
    echo "📊 Server resources — $(date '+%Y-%m-%d %H:%M:%S')"
    print_sep

    # --- Disk ---
    echo "💾 DISK"
    df -h / | tail -1 | awk '{
        gsub(/%/,"",$5); used=$5;
        if(used>=90) status="🚨 CRITICAL";
        else if(used>=80) status="⚠️  HIGH";
        else status="✅ OK";
        printf "   / usage: %s%% %s\n", used, status
    }'
    df -h / 2>/dev/null | head -2
    echo ""

    # --- RAM ---
    echo "🧠 RAM"
    free -h | grep -E 'Mem|Swap'
    MEM_PCT=$(free 2>/dev/null | grep Mem | awk '{printf "%.0f", ($3/$2)*100}')
    if [ -n "$MEM_PCT" ]; then
        if [ "$MEM_PCT" -ge 90 ]; then echo "   Memory: ${MEM_PCT}% used 🚨 CRITICAL"
        elif [ "$MEM_PCT" -ge 80 ]; then echo "   Memory: ${MEM_PCT}% used ⚠️  HIGH"
        else echo "   Memory: ${MEM_PCT}% used ✅ OK"; fi
    fi
    echo ""

    # --- CPU load ---
    echo "⚡ CPU"
    uptime
    LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
    if [ -n "$LOAD" ]; then
        LOAD_INT=$(echo "$LOAD" | awk '{printf "%d", $1*100}')
        if [ -n "$LOAD_INT" ] && [ "$LOAD_INT" -ge 300 ]; then echo "   Load $LOAD 🚨 High (possible miner or overload)"
        elif [ -n "$LOAD_INT" ] && [ "$LOAD_INT" -ge 200 ]; then echo "   Load $LOAD ⚠️  Elevated"
        else echo "   Load $LOAD ✅ Normal"; fi
    fi
    echo ""

    # --- Top CPU processes (abnormal = high CPU from unknown process) ---
    echo "📋 Top 5 processes by CPU%"
    ps aux --sort=-%cpu 2>/dev/null | head -6
    echo ""

    # --- One-line summary of abnormalities ---
    echo "🔍 Summary"
    ABNORMAL=""
    [ -n "$MEM_PCT" ] && [ "$MEM_PCT" -ge 80 ] && ABNORMAL="${ABNORMAL} High RAM;"
    DISK_PCT=$(df / 2>/dev/null | tail -1 | awk '{gsub(/%/,"",$5); print $5}')
    [ -n "$DISK_PCT" ] && [ "$DISK_PCT" -ge 80 ] && ABNORMAL="${ABNORMAL} Low disk;"
    [ -n "$LOAD_INT" ] && [ "$LOAD_INT" -ge 200 ] && ABNORMAL="${ABNORMAL} High load;"
    if [ -z "$ABNORMAL" ]; then
        echo "   No obvious resource abnormalities."
    else
        echo "   ⚠️ $ABNORMAL"
    fi
    print_sep
}

if [ "$WATCH" = "--watch" ]; then
    while true; do run_check; sleep 5; done
else
    run_check
fi
