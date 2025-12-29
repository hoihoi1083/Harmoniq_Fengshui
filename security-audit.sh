#!/bin/bash
# Security Audit - Scans codebase for malicious patterns
# Run before deployment or weekly

echo "🔍 Security Audit Scan"
echo "========================================"
echo "Date: $(date)"
echo ""

PROJECT_DIR="$HOME/fengshui-layout"
cd "$PROJECT_DIR" || exit 1

ISSUES_FOUND=0

# 1. Check for obfuscated code
echo "1️⃣ Scanning for obfuscated code..."
OBFUSCATED=$(find . -name "*.js" -o -name "*.mjs" | xargs grep -l "_0x[0-9a-f]\{6\}" 2>/dev/null)
if [ -n "$OBFUSCATED" ]; then
    echo "   🚨 ALERT: Obfuscated code found in:"
    echo "$OBFUSCATED" | sed 's/^/      /'
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "   ✅ No obfuscated code detected"
fi
echo ""

# 2. Check for eval() usage
echo "2️⃣ Scanning for eval() usage..."
EVAL_USAGE=$(find . -name "*.js" -o -name "*.mjs" | grep -v node_modules | xargs grep -n "eval(" 2>/dev/null)
if [ -n "$EVAL_USAGE" ]; then
    echo "   ⚠️  eval() found (review these):"
    echo "$EVAL_USAGE" | head -5 | sed 's/^/      /'
    COUNT=$(echo "$EVAL_USAGE" | wc -l)
    if [ "$COUNT" -gt 5 ]; then
        echo "      ... and $((COUNT - 5)) more"
    fi
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "   ✅ No eval() usage"
fi
echo ""

# 3. Check config file sizes
echo "3️⃣ Checking config file sizes..."
for file in next.config.js package.json server.js ecosystem.config.json; do
    if [ -f "$file" ]; then
        SIZE=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
        SIZE_KB=$((SIZE / 1024))
        
        # Alert if config files are suspiciously large
        if [ "$file" = "next.config.js" ] && [ "$SIZE" -gt 5000 ]; then
            echo "   🚨 ALERT: $file is too large (${SIZE_KB}KB)!"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        elif [ "$file" = "package.json" ] && [ "$SIZE" -gt 50000 ]; then
            echo "   ⚠️  WARNING: $file is large (${SIZE_KB}KB)"
        else
            echo "   ✅ $file: ${SIZE_KB}KB"
        fi
    fi
done
echo ""

# 4. Check for base64 encoded payloads
echo "4️⃣ Scanning for base64 encoded payloads..."
BASE64=$(find . -name "*.js" -o -name "*.mjs" | grep -v node_modules | xargs grep -E "atob\(|btoa\(|Buffer\.from\(.+,\s*['\"]base64" 2>/dev/null | head -3)
if [ -n "$BASE64" ]; then
    echo "   ⚠️  Base64 encoding found (review context):"
    echo "$BASE64" | sed 's/^/      /'
else
    echo "   ✅ No suspicious base64 usage"
fi
echo ""

# 5. Check for suspicious function names
echo "5️⃣ Checking for suspicious patterns..."
SUSPICIOUS=$(find . -name "*.js" -o -name "*.mjs" | grep -v node_modules | xargs grep -iE "(crypto|miner|xmrig|hijack|inject)" 2>/dev/null | grep -v "crypto-js\|cryptocurrency\|@/*crypto" | head -3)
if [ -n "$SUSPICIOUS" ]; then
    echo "   ⚠️  Suspicious patterns found:"
    echo "$SUSPICIOUS" | sed 's/^/      /'
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "   ✅ No suspicious patterns"
fi
echo ""

# 6. Check .env file permissions
echo "6️⃣ Checking .env file security..."
if [ -f ".env" ]; then
    PERMS=$(stat -c%a .env 2>/dev/null || stat -f%OLp .env 2>/dev/null)
    if [ "$PERMS" != "600" ] && [ "$PERMS" != "400" ]; then
        echo "   ⚠️  WARNING: .env permissions are $PERMS (should be 600)"
        echo "   Fix with: chmod 600 .env"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        echo "   ✅ .env permissions correct ($PERMS)"
    fi
else
    echo "   ⚠️  .env file not found"
fi
echo ""

# 7. Check for hardcoded secrets
echo "7️⃣ Scanning for hardcoded secrets..."
SECRETS=$(find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -iE "(api[_-]?key|secret|password|token).*=.*['\"][^'\"]{20,}" 2>/dev/null | grep -v "process.env" | head -3)
if [ -n "$SECRETS" ]; then
    echo "   🚨 ALERT: Potential hardcoded secrets found:"
    echo "$SECRETS" | sed 's/['\''"][^'\''"]*/*****/3' | sed 's/^/      /'
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "   ✅ No hardcoded secrets detected"
fi
echo ""

# 8. Check for uncommitted changes with sensitive data
echo "8️⃣ Checking git status..."
if [ -d ".git" ]; then
    UNCOMMITTED=$(git status --short | wc -l)
    if [ "$UNCOMMITTED" -gt 0 ]; then
        echo "   ⚠️  $UNCOMMITTED uncommitted changes"
        git status --short | head -5 | sed 's/^/      /'
    else
        echo "   ✅ No uncommitted changes"
    fi
else
    echo "   ℹ️  Not a git repository"
fi
echo ""

# Summary
echo "========================================"
if [ "$ISSUES_FOUND" -eq 0 ]; then
    echo "✅ Security audit passed - No critical issues"
    exit 0
else
    echo "⚠️  Security audit found $ISSUES_FOUND potential issue(s)"
    echo "Review the findings above before deployment"
    
    # Send email alert
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    if [ -f "$SCRIPT_DIR/send-alert-email.sh" ]; then
        ALERT_MSG="Security Audit Failed!

Issues found: $ISSUES_FOUND

Please review the security logs immediately.
Run: ssh fs 'tail -100 ~/fengshui-layout/logs/security-audit.log'"
        bash "$SCRIPT_DIR/send-alert-email.sh" "⚠️  Security Audit Failed" "$ALERT_MSG"
    fi
    
    exit 1
fi
