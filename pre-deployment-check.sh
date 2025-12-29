#!/bin/bash
# Pre-deployment Security Check
# Run this BEFORE deploying or building

echo "🚀 Pre-Deployment Security Check"
echo "========================================"
echo "Date: $(date)"
echo ""

PROJECT_DIR="$HOME/fengshui-layout"
cd "$PROJECT_DIR" || exit 1

FAIL=0

# 1. Run security audit
echo "1️⃣ Running security audit..."
if bash ./security-audit.sh > /tmp/audit.log 2>&1; then
    echo "   ✅ Security audit passed"
else
    echo "   🚨 SECURITY AUDIT FAILED!"
    echo "   Review: cat /tmp/audit.log"
    cat /tmp/audit.log
    FAIL=1
fi
echo ""

# 2. Check critical files exist and are reasonable size
echo "2️⃣ Validating critical files..."
FILES=(
    "next.config.js:2000"
    "package.json:100000"
    "server.js:10000"
    ".env:5000"
)

for entry in "${FILES[@]}"; do
    file=$(echo "$entry" | cut -d: -f1)
    max_size=$(echo "$entry" | cut -d: -f2)
    
    if [ ! -f "$file" ]; then
        echo "   🚨 ERROR: $file not found!"
        FAIL=1
        continue
    fi
    
    size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    if [ "$size" -gt "$max_size" ]; then
        echo "   🚨 ERROR: $file is too large ($size bytes > $max_size bytes)"
        echo "   This may indicate malware injection!"
        FAIL=1
    else
        echo "   ✅ $file: $size bytes (< $max_size)"
    fi
done
echo ""

# 3. Verify no obfuscated code in config files
echo "3️⃣ Checking config files for malware..."
for file in next.config.js server.js; do
    if grep -q "_0x[0-9a-f]\{6\}" "$file" 2>/dev/null; then
        echo "   🚨 MALWARE DETECTED in $file!"
        echo "   Obfuscated code found - DO NOT DEPLOY"
        FAIL=1
    elif grep -q "eval(" "$file" 2>/dev/null; then
        echo "   ⚠️  WARNING: eval() found in $file"
        echo "   Review before deploying"
    else
        echo "   ✅ $file is clean"
    fi
done
echo ""

# 4. Check dependencies
echo "4️⃣ Checking dependencies..."
if [ -f "package.json" ]; then
    # Check for suspicious packages
    SUSPICIOUS=$(grep -iE "xmrig|miner|crypto-miner" package.json)
    if [ -n "$SUSPICIOUS" ]; then
        echo "   🚨 SUSPICIOUS PACKAGES FOUND!"
        echo "$SUSPICIOUS"
        FAIL=1
    else
        echo "   ✅ No suspicious packages"
    fi
    
    # Verify lock file exists
    if [ -f "pnpm-lock.yaml" ]; then
        echo "   ✅ Lock file present"
    else
        echo "   ⚠️  WARNING: No lock file (pnpm-lock.yaml)"
    fi
else
    echo "   🚨 ERROR: package.json not found!"
    FAIL=1
fi
echo ""

# 5. Check environment variables
echo "5️⃣ Checking environment configuration..."
if [ -f ".env" ]; then
    # Check for required variables
    REQUIRED_VARS=(
        "MONGODB_URI"
        "NEXTAUTH_SECRET"
        "DEEPSEEK_API_KEY"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            echo "   ✅ $var is set"
        else
            echo "   ⚠️  WARNING: $var not found in .env"
        fi
    done
else
    echo "   🚨 ERROR: .env file not found!"
    FAIL=1
fi
echo ""

# 6. Check git status
echo "6️⃣ Checking git repository..."
if [ -d ".git" ]; then
    BRANCH=$(git branch --show-current)
    UNCOMMITTED=$(git status --short | wc -l)
    
    echo "   Current branch: $BRANCH"
    echo "   Uncommitted changes: $UNCOMMITTED"
    
    if [ "$UNCOMMITTED" -gt 0 ]; then
        echo "   ⚠️  You have uncommitted changes"
        git status --short | head -5
    fi
else
    echo "   ℹ️  Not a git repository"
fi
echo ""

# 7. Test build (optional - comment out if too slow)
# echo "7️⃣ Testing build..."
# if pnpm build > /tmp/build.log 2>&1; then
#     echo "   ✅ Build successful"
# else
#     echo "   🚨 BUILD FAILED!"
#     tail -20 /tmp/build.log
#     FAIL=1
# fi
# echo ""

# Final verdict
echo "========================================"
if [ "$FAIL" -eq 0 ]; then
    echo "✅ PRE-DEPLOYMENT CHECK PASSED"
    echo "Safe to deploy!"
    exit 0
else
    echo "🚨 PRE-DEPLOYMENT CHECK FAILED"
    echo "DO NOT DEPLOY - Fix issues above first"
    exit 1
fi
