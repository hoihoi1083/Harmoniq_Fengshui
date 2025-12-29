#!/bin/bash
# File Integrity Monitor - Detects unauthorized changes to critical files
# Run this daily via cron: 0 2 * * * /path/to/file-integrity-monitor.sh

CHECKSUM_FILE="$HOME/fengshui-layout/.file-checksums"
ALERT_LOG="$HOME/fengshui-layout/logs/integrity-alerts.log"

# Critical files to monitor
CRITICAL_FILES=(
    "$HOME/fengshui-layout/next.config.js"
    "$HOME/fengshui-layout/package.json"
    "$HOME/fengshui-layout/server.js"
    "$HOME/fengshui-layout/.env"
    "$HOME/fengshui-layout/ecosystem.config.json"
)

echo "🔒 File Integrity Monitor - $(date)"
echo "========================================"

# Create checksums directory if it doesn't exist
mkdir -p "$(dirname "$CHECKSUM_FILE")"
mkdir -p "$(dirname "$ALERT_LOG")"

# Function to calculate checksum
calculate_checksum() {
    local file="$1"
    if [ -f "$file" ]; then
        sha256sum "$file" 2>/dev/null | awk '{print $1}'
    else
        echo "FILE_NOT_FOUND"
    fi
}

# Function to get file size
get_file_size() {
    local file="$1"
    if [ -f "$file" ]; then
        stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null
    else
        echo "0"
    fi
}

# Initialize checksums if file doesn't exist
if [ ! -f "$CHECKSUM_FILE" ]; then
    echo "📝 Initializing file checksums..."
    for file in "${CRITICAL_FILES[@]}"; do
        checksum=$(calculate_checksum "$file")
        size=$(get_file_size "$file")
        echo "$file|$checksum|$size" >> "$CHECKSUM_FILE"
        echo "   ✅ $file"
    done
    echo "✅ Baseline checksums created"
    exit 0
fi

# Check for changes
CHANGES_DETECTED=0
for file in "${CRITICAL_FILES[@]}"; do
    current_checksum=$(calculate_checksum "$file")
    current_size=$(get_file_size "$file")
    
    # Get stored checksum
    stored_line=$(grep "^$file|" "$CHECKSUM_FILE")
    if [ -z "$stored_line" ]; then
        echo "⚠️  NEW FILE: $file (size: $current_size bytes)"
        echo "$(date)|NEW|$file|$current_size" >> "$ALERT_LOG"
        echo "$file|$current_checksum|$current_size" >> "$CHECKSUM_FILE"
        CHANGES_DETECTED=1
        continue
    fi
    
    stored_checksum=$(echo "$stored_line" | cut -d'|' -f2)
    stored_size=$(echo "$stored_line" | cut -d'|' -f3)
    
    # Compare checksums
    if [ "$current_checksum" != "$stored_checksum" ]; then
        size_diff=$((current_size - stored_size))
        echo "🚨 ALERT: File modified!"
        echo "   File: $file"
        echo "   Old size: $stored_size bytes"
        echo "   New size: $current_size bytes (${size_diff:+$size_diff} bytes)"
        echo "   Old checksum: $stored_checksum"
        echo "   New checksum: $current_checksum"
        echo ""
        
        # Log to alert file
        echo "$(date)|MODIFIED|$file|$stored_size→$current_size|$size_diff" >> "$ALERT_LOG"
        
        # Send email alert
        if [ -f "$SCRIPT_DIR/send-alert-email.sh" ]; then
            ALERT_MSG="File Integrity Violation!

File: $file
Old size: $stored_size bytes
New size: $current_size bytes
Old checksum: $stored_checksum
New checksum: $current_checksum"
            bash "$SCRIPT_DIR/send-alert-email.sh" "🚨 File Integrity Alert" "$ALERT_MSG"
        fi
        
        # Check for suspicious patterns
        if [ "$current_size" -gt 10000 ] && [ "$file" = "$HOME/fengshui-layout/next.config.js" ]; then
            echo "   ⚠️  CRITICAL: next.config.js is unusually large ($current_size bytes)!"
            echo "   This may indicate malware injection!"
        fi
        
        # Check for obfuscated code
        if grep -q "_0x[0-9a-f]\{6\}" "$file" 2>/dev/null; then
            echo "   🚨 MALWARE DETECTED: Obfuscated code found!"
            echo "$(date)|MALWARE|$file|Obfuscated_code" >> "$ALERT_LOG"
        fi
        
        if grep -q "eval(" "$file" 2>/dev/null; then
            echo "   ⚠️  WARNING: eval() detected in $file"
            echo "$(date)|SUSPICIOUS|$file|eval_found" >> "$ALERT_LOG"
        fi
        
        CHANGES_DETECTED=1
        
        # Update checksum
        sed -i "s|^$file|.*|$file|$current_checksum|$current_size|" "$CHECKSUM_FILE"
    fi
done

if [ "$CHANGES_DETECTED" -eq 0 ]; then
    echo "✅ All critical files unchanged"
else
    echo ""
    echo "🚨 CHANGES DETECTED - Review immediately!"
    echo "View full log: cat $ALERT_LOG"
    
    # Send notification (optional - requires mail setup)
    # echo "File integrity alert on $(hostname)" | mail -s "Security Alert" your@email.com
fi

echo "========================================"
