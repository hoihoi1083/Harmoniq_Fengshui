#!/bin/bash

# Complete Deployment Script for FengShui Layout
# This script handles the entire deployment process from local to production

set -e  # Exit on any error

# Configuration
REMOTE_HOST="fs"
REMOTE_PATH="/home/ec2-user/fengshui-layout"
LOCAL_PROJECT_PATH="."
# Set to 1 to build locally and upload .next/standalone (skips npm install + build on server).
# Use --local-build if server build is OOM-killed (exit 137) or runs out of memory.
BUILD_LOCAL=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if SSH alias exists
    if ! ssh -o BatchMode=yes -o ConnectTimeout=5 $REMOTE_HOST exit 2>/dev/null; then
        print_error "Cannot connect to server. Please check SSH configuration."
        exit 1
    fi
    
    # Check if required files exist
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production not found. Make sure environment variables are configured on the server."
    fi
    
    print_success "Prerequisites check completed"
}

# Unlock protected files on server so rsync can overwrite them (they get re-locked after deploy)
unlock_remote_protected_files() {
    print_status "Unlocking protected files on server for deploy..."
    ssh $REMOTE_HOST "cd $REMOTE_PATH && sudo chattr -i package.json ecosystem.config.json next.config.js next.config.ts .env .env.production 2>/dev/null; true" || true
}

# Function to upload source code
upload_source() {
    print_status "Uploading source code to server..."
    
    rsync -avz -e "ssh" \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.git' \
        --exclude '*.log' \
        --exclude '.env.local' \
        --exclude '.env.development' \
        --exclude 'logs/' \
        --exclude '.DS_Store' \
        --progress \
        $LOCAL_PROJECT_PATH/ $REMOTE_HOST:$REMOTE_PATH/
    
    if [ $? -eq 0 ]; then
        print_success "Source code uploaded successfully"
    else
        print_error "Failed to upload source code"
        exit 1
    fi
}

# Build locally and upload .next/standalone (use when npm install fails on server)
local_build_and_upload_standalone() {
    print_status "Building application locally..."
    # Dev with `next dev --turbopack` leaves Turbopack artifacts in .next/; mixing them
    # with `next build` causes MODULE_NOT_FOUND for ../chunks/ssr/[turbopack]_runtime.js
    print_status "Removing stale .next (required after turbopack dev)..."
    rm -rf .next
    if ! npm run build; then
        print_error "Local build failed. Fix errors above and re-run."
        exit 1
    fi
    if [ ! -d ".next/standalone" ]; then
        print_error "Standalone output not found after build"
        exit 1
    fi
    print_status "Preparing standalone bundle (public + static)..."
    cp -r public .next/standalone/ 2>/dev/null || true
    mkdir -p .next/standalone/.next
    cp -r .next/static .next/standalone/.next/
    if [ -f ".env.production" ]; then
        cp .env.production .next/standalone/.env
    fi
    print_status "Uploading standalone build to server..."
    rsync -avz -e "ssh" \
        --progress \
        .next/standalone/ $REMOTE_HOST:$REMOTE_PATH/.next/standalone/
    if [ $? -ne 0 ]; then
        print_error "Failed to upload standalone build"
        exit 1
    fi
    print_success "Standalone build uploaded"
}

# On server: only wire env and start PM2 (no npm install, no build). Requires .next/standalone already present.
server_deploy_standalone_only() {
    print_status "Configuring and starting app on server (standalone only)..."
    ssh $REMOTE_HOST "bash -s" << 'EOF'
        set -e
        cd /home/ec2-user/fengshui-layout
        if [ ! -d ".next/standalone" ]; then
            echo "❌ .next/standalone not found. Use full deploy or run with --local-build after a local build upload."
            exit 1
        fi
        # Ensure env in standalone
        if [ -f ".env.production" ]; then
            cp .env.production .next/standalone/.env
        fi
        mkdir -p logs
        echo "🔓 Unlocking config for PM2..."
        sudo chattr -i ecosystem.config.json 2>/dev/null || true
        pm2 delete all 2>/dev/null || true
        pm2 start ecosystem.config.json --update-env
        pm2 save
        echo "✅ PM2 started (standalone)"
        pm2 list
        # Re-lock critical files (same as full deploy) so malware can't overwrite config
        echo "🔒 Re-locking protected files..."
        sudo chattr +i package.json 2>/dev/null || true
        sudo chattr +i ecosystem.config.json 2>/dev/null || true
        sudo chattr +i next.config.js 2>/dev/null || true
        sudo chattr +i next.config.ts 2>/dev/null || true
        sudo chattr +i .env 2>/dev/null || true
        sudo chattr +i .env.production 2>/dev/null || true
        echo "✅ Deployment completed successfully!"
EOF
    if [ $? -eq 0 ]; then
        print_success "Server started successfully"
    else
        print_error "Server deploy failed"
        exit 1
    fi
}

# Function to build and deploy on server
server_build_and_deploy() {
    print_status "Building and deploying on server..."
    
    # Use bash -s so PIPESTATUS and streaming work; keeps SSH alive during long build
    ssh $REMOTE_HOST "bash -s" << 'EOF'
        set -e
        
        echo "🚀 Starting server-side deployment..."
        
        # Navigate to project directory
        cd /home/ec2-user/fengshui-layout
        
        # Check disk space BEFORE deployment
        echo "💾 Checking disk space..."
        AVAILABLE_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
        USED_PERCENT=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
        
        echo "Available space: ${AVAILABLE_GB}GB"
        echo "Disk usage: ${USED_PERCENT}%"
        
        if [ "$AVAILABLE_GB" -lt 2 ]; then
            echo "⚠️ WARNING: Less than 2GB available!"
            echo "🧹 Cleaning logs to free up space..."
            pm2 flush || true
            find logs -name "*.log" -type f -size +10M -delete 2>/dev/null || true
            echo "✅ Logs cleaned"
        fi
        
        if [ "$USED_PERCENT" -gt 90 ]; then
            echo "🚨 CRITICAL: Disk usage above 90%!"
            echo "🧹 Emergency cleanup..."
            # Clean old .next builds
            rm -rf .next.backup 2>/dev/null || true
            # Clean PM2 logs
            pm2 flush || true
            # Clean old logs
            find logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
            echo "✅ Emergency cleanup completed"
        fi
        
        # Unlock immutable files (if locked by file-integrity-monitor)
        echo "🔓 Unlocking protected files..."
        sudo chattr -i package.json 2>/dev/null || true
        sudo chattr -i ecosystem.config.json 2>/dev/null || true
        sudo chattr -i next.config.js 2>/dev/null || true
        sudo chattr -i next.config.ts 2>/dev/null || true
        sudo chattr -i .env 2>/dev/null || true
        sudo chattr -i .env.production 2>/dev/null || true
        
        # Stop existing PM2 processes
        echo "⏹️  Stopping existing processes..."
        pm2 stop all || true
        
        # Backup current .next if it exists (for rollback)
        if [ -d ".next" ]; then
            echo "💾 Backing up current build..."
            rm -rf .next.backup 2>/dev/null || true
            mv .next .next.backup
        fi
        
        # Clean PM2 logs before build
        echo "🧹 Cleaning PM2 logs..."
        pm2 flush || true
        
        # Show disk space right before npm (common cause of failure)
        echo "💾 Disk before npm install:"
        df -h / | grep -E 'Filesystem|nvme'
        
        # Run npm install (outbound must work). If node_modules is broken, do a clean install.
        echo "📦 Installing dependencies..."
        NPM_LOG=$(mktemp)
        if ! npm install --production 2>&1 | tee "$NPM_LOG"; then
            echo "⚠️  npm install failed. Last 40 lines of output:"
            tail -40 "$NPM_LOG"
            echo "---"
            echo "⚠️  Trying clean install (rm -rf node_modules && npm install)..."
            rm -rf node_modules
            if ! npm install --production 2>&1 | tee "$NPM_LOG"; then
                echo "❌ Clean npm install also failed. Last 40 lines:"
                tail -40 "$NPM_LOG"
                rm -f "$NPM_LOG"
                echo "❌ Check: disk space (df -h), network (curl -I https://registry.npmjs.org), and npm cache (npm cache verify)."
                exit 1
            fi
        fi
        rm -f "$NPM_LOG"
        echo "✅ npm install succeeded"
        
        # Build: stream output (keeps SSH alive) and save to log; use PIPESTATUS for real exit code
        export NODE_OPTIONS="--max-old-space-size=2048"
        echo "🔨 Building application (NODE_OPTIONS=$NODE_OPTIONS)..."
        mkdir -p logs
        BUILD_LOG="logs/build.log"
        npm run build 2>&1 | tee "$BUILD_LOG"
        BUILD_EXIT=${PIPESTATUS[0]}
        if [ "$BUILD_EXIT" -ne 0 ]; then
            echo "❌ Build exited with code $BUILD_EXIT (137=OOM killed). Full log:"
            cat "$BUILD_LOG"
            echo "--- dmesg (OOM/signals) ---"
            dmesg 2>/dev/null | tail -20 || true
            if [ -d ".next.backup" ]; then
                echo "🔄 Restoring previous build..."
                rm -rf .next
                mv .next.backup .next
            fi
            exit 1
        fi
        if [ ! -d ".next/standalone" ]; then
            echo "❌ Build did not produce .next/standalone. Full log:"
            cat "$BUILD_LOG"
            echo "--- dmesg ---"
            dmesg 2>/dev/null | tail -20 || true
            if [ -d ".next.backup" ]; then
                echo "🔄 Restoring previous build..."
                rm -rf .next
                mv .next.backup .next
            fi
            exit 1
        fi
        
        # Remove backup on successful build
        echo "🗑️  Removing old build backup..."
        rm -rf .next.backup 2>/dev/null || true
        
        # Copy public assets to standalone build
        echo "📁 Copying public assets..."
        cp -r public .next/standalone/ || true
        
        # Copy environment file if it exists
        echo "⚙️  Copying environment configuration..."
        if [ -f ".env.production" ]; then
            cp .env.production .next/standalone/.env
        fi
        
        # Copy static assets (CRITICAL for JS/CSS)
        echo "🎨 Copying static assets..."
        cp -r .next/static .next/standalone/.next/
        
        # Ensure logs directory exists
        mkdir -p logs
        
        # Load server configuration
        echo "⚙️  Loading server configuration..."
        source server-config.sh || true
        
        # Start with PM2 using optimized configuration
        echo "🚀 Starting application with PM2 (optimized)..."
        pm2 start ecosystem.config.json --update-env
        
        # Save PM2 configuration
        pm2 save
        
        # Re-lock critical files for security
        echo "🔒 Re-locking protected files..."
        sudo chattr +i package.json 2>/dev/null || true
        # Show final disk space
        echo ""
        echo "💾 Final disk space:"
        df -h / | grep -E 'Filesystem|nvme'
        
        sudo chattr +i ecosystem.config.json 2>/dev/null || true
        sudo chattr +i next.config.js 2>/dev/null || true
        sudo chattr +i next.config.ts 2>/dev/null || true
        sudo chattr +i .env 2>/dev/null || true
        sudo chattr +i .env.production 2>/dev/null || true
        
        # Show process status
        echo "📊 Process status:"
        pm2 list
        
        echo "✅ Deployment completed successfully!"
EOF
    
    if [ $? -eq 0 ]; then
        print_success "Server build and deployment completed"
    else
        print_error "Server build and deployment failed"
        exit 1
    fi
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check PM2 status
    print_status "Checking PM2 status..."
    ssh $REMOTE_HOST "pm2 status"
    
    # Test local connection on server
    print_status "Testing local connection..."
    if ssh $REMOTE_HOST "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000" | grep -q "200"; then
        print_success "Local connection test passed"
    else
        print_warning "Local connection test failed"
    fi
    
    # Test public website
    print_status "Testing public website..."
    if curl -s -o /dev/null -w '%{http_code}' https://www.harmoniqfengshui.com | grep -q "200"; then
        print_success "Public website is accessible"
    else
        print_warning "Public website test failed"
    fi
    
    # Check for JavaScript and CSS loading
    print_status "Checking static assets..."
    if curl -s https://www.harmoniqfengshui.com | grep -q "_next/static"; then
        print_success "Static assets are properly referenced"
    else
        print_warning "Static assets may not be loading correctly"
    fi
}

# Function to show deployment summary
show_summary() {
    print_status "Deployment Summary:"
    echo "=================="
    echo "✅ Source code uploaded"
    echo "✅ Dependencies installed"
    echo "✅ Application built"
    echo "✅ Static assets configured"
    echo "✅ PM2 process started"
    echo ""
    echo "🌐 Website: https://www.harmoniqfengshui.com"
    echo ""
    echo "Useful commands:"
    echo "  Check status: ssh $REMOTE_HOST 'pm2 status'"
    echo "  View logs:    ssh $REMOTE_HOST 'pm2 logs'"
    echo "  Restart app:  ssh $REMOTE_HOST 'pm2 restart all'"
    echo ""
}

# Function to handle errors and cleanup
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_error "Deployment failed (exit $exit_code)."
        print_status "To see what went wrong:"
        print_status "  ssh $REMOTE_HOST 'cat ~/fengshui-layout/logs/build.log'   # server build log"
        print_status "  ssh $REMOTE_HOST 'dmesg | tail -30'                        # OOM/kills"
        print_status "  ssh $REMOTE_HOST 'pm2 logs'                                # app runtime"
        exit $exit_code
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main deployment process
main() {
    # Parse --local-build (use this if server build is OOM-killed / exit 137)
    for arg in "$@"; do
        if [ "$arg" = "--local-build" ] || [ "$arg" = "-local-build" ]; then
            BUILD_LOCAL=1
            break
        fi
    done

    echo "🚀 Starting Complete Deployment Process"
    if [ "$BUILD_LOCAL" = "1" ]; then
        echo "📦 Mode: local build + upload standalone (no npm install/build on server — avoids OOM)"
    else
        echo "📦 Mode: full deploy (build on server). If build fails with exit 137 (OOM), run: $0 --local-build"
    fi
    echo "======================================="

    check_prerequisites
    unlock_remote_protected_files
    upload_source

    if [ "$BUILD_LOCAL" = "1" ]; then
        local_build_and_upload_standalone
        server_deploy_standalone_only
    else
        server_build_and_deploy
    fi

    verify_deployment
    show_summary

    print_success "🎉 Deployment completed successfully!"
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi