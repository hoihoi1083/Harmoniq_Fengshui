#!/bin/bash
# Config File Lock/Unlock Manager
# Use this when you need to edit protected config files

ACTION="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Critical files to protect
PROTECTED_FILES=(
    "$SCRIPT_DIR/next.config.js"
    "$SCRIPT_DIR/package.json"
    "$SCRIPT_DIR/ecosystem.config.json"
    "$SCRIPT_DIR/.env"
)

if [ "$ACTION" = "unlock" ]; then
    echo "🔓 Unlocking config files for editing..."
    for file in "${PROTECTED_FILES[@]}"; do
        if [ -f "$file" ]; then
            sudo chattr -i "$file" 2>/dev/null
            echo "   ✓ Unlocked: $(basename $file)"
        fi
    done
    echo ""
    echo "⚠️  Files are now editable. Remember to lock them after editing:"
    echo "   ./config-lock.sh lock"
    
elif [ "$ACTION" = "lock" ]; then
    echo "🔒 Locking config files (immutable)..."
    for file in "${PROTECTED_FILES[@]}"; do
        if [ -f "$file" ]; then
            sudo chattr +i "$file" 2>/dev/null
            echo "   ✓ Locked: $(basename $file)"
        fi
    done
    echo ""
    echo "✅ Config files are now protected from modification"
    echo "   (Even root cannot modify without unlocking)"
    
elif [ "$ACTION" = "status" ]; then
    echo "🔍 Config File Protection Status:"
    echo ""
    for file in "${PROTECTED_FILES[@]}"; do
        if [ -f "$file" ]; then
            ATTRS=$(lsattr "$file" 2>/dev/null | awk '{print $1}')
            if [[ "$ATTRS" == *"i"* ]]; then
                echo "   🔒 LOCKED:   $(basename $file)"
            else
                echo "   🔓 UNLOCKED: $(basename $file)"
            fi
        else
            echo "   ⚠️  MISSING: $(basename $file)"
        fi
    done
    echo ""
    
else
    echo "Config File Lock Manager"
    echo ""
    echo "Usage: $0 {lock|unlock|status}"
    echo ""
    echo "Commands:"
    echo "  lock     - Make config files immutable (protected)"
    echo "  unlock   - Allow editing config files"
    echo "  status   - Show current protection status"
    echo ""
    echo "Protected files:"
    for file in "${PROTECTED_FILES[@]}"; do
        echo "  - $(basename $file)"
    done
    exit 1
fi
