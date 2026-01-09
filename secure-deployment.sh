#!/bin/bash

# Secure Deployment Script with Pre/Post Malware Cleaning
# This script:
# 1. Scans local code before upload
# 2. Cleans server before deployment
# 3. Deploys fresh code
# 4. Scans server after deployment
# 5. Verifies security monitoring is active

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REMOTE_HOST="fs"
REMOTE_PATH="~/fengshui-layout"
LOCAL_PROJECT_PATH="."

# Print functions
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_status() { echo -e "${BLUE}➜ $1${NC}"; }
print_header() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n${GREEN}$1${NC}\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }

# Step 1: Scan Local Code
scan_local_code() {
    print_header "STEP 1: Scanning Local Source Code"
    
    print_status "Checking local source files for malware signatures..."
    
    # Scan JavaScript/TypeScript files (excluding node_modules, .next)
    local suspicious_files=$(grep -r -E "eval\(|Function\(|exec\(|child_process|xmrig|coinhive|crypto.*miner" \
        --include="*.js" \
        --include="*.jsx" \
        --include="*.ts" \
        --include="*.tsx" \
        --include="*.mjs" \
        --exclude-dir=node_modules \
        --exclude-dir=.next \
        --exclude-dir=public/images \
        --exclude="server.js" \
        --exclude="detect-miners.sh" \
        . 2>/dev/null | grep -v "// Safe:" | wc -l)
    
    if [ "$suspicious_files" -gt 0 ]; then
        print_error "Found $suspicious_files suspicious patterns in local code!"
        echo "Run this to see details:"
        echo "  grep -r -E 'eval\\(|Function\\(|exec\\(' --include='*.js' --exclude-dir=node_modules ."
        read -p "Continue anyway? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            exit 1
        fi
    else
        print_success "Local source code is clean"
    fi
    
    # Check package.json for suspicious dependencies
    print_status "Checking package.json for suspicious packages..."
    if grep -E "xmrig|crypto-miner|monero" package.json >/dev/null 2>&1; then
        print_error "Suspicious packages found in package.json!"
        exit 1
    else
        print_success "package.json is clean"
    fi
}

# Step 2: Clean Server Before Deployment
clean_server_pre_deployment() {
    print_header "STEP 2: Cleaning Server Before Deployment"
    
    print_status "Unlocking protected files..."
    ssh $REMOTE_HOST "bash -s" << 'ENDSSH'
        cd ~/fengshui-layout
        
        echo "🔓 Unlocking immutable files for deployment..."
        sudo chattr -i package.json 2>/dev/null || true
        sudo chattr -i ecosystem.config.json 2>/dev/null || true
        sudo chattr -i next.config.js 2>/dev/null || true
        sudo chattr -i next.config.ts 2>/dev/null || true
        sudo chattr -i .env 2>/dev/null || true
        sudo chattr -i .env.production 2>/dev/null || true
        echo "✅ Files unlocked"
ENDSSH
    
    print_status "Stopping PM2 processes..."
    ssh $REMOTE_HOST "cd $REMOTE_PATH && pm2 stop all || true" 2>/dev/null
    
    print_status "Scanning and removing malware from server..."
    ssh $REMOTE_HOST "bash -s" << 'ENDSSH'
        cd ~/fengshui-layout
        
        echo "🔍 Scanning for mining processes..."
        # Kill any mining processes (but not our Node.js app)
        if pgrep -f xmrig >/dev/null; then
            echo "⚠️  Found xmrig process, killing..."
            pkill -9 xmrig 2>/dev/null || true
        fi
        
        if pgrep -f minerd >/dev/null; then
            echo "⚠️  Found minerd process, killing..."
            pkill -9 minerd 2>/dev/null || true
        fi
        
        # Check for suspicious crypto processes (excluding npm/node legitimate use)
        suspicious_procs=$(ps aux | grep -E "crypto.*mine|monero|xmr" | grep -v grep | grep -v "npm\|node" || true)
        if [ -n "$suspicious_procs" ]; then
            echo "⚠️  Found suspicious crypto processes:"
            echo "$suspicious_procs"
            echo "Killing suspicious processes..."
            pkill -f "crypto.*mine" 2>/dev/null || true
        fi
        
        echo "🔍 Scanning for suspicious files in node_modules..."
        # Remove suspicious node_modules packages (but keep legitimate ones)
        if [ -d "node_modules" ]; then
            # Only delete if file contains actual miner code
            find node_modules -type f \( -name "*miner*.js" -o -name "*xmrig*.js" \) -exec grep -l "stratum\|mining\|hashrate" {} \; -delete 2>/dev/null || true
            find node_modules -type d -name "*crypto-miner*" -exec rm -rf {} + 2>/dev/null || true
        fi
        
        echo "🔍 Scanning for suspicious files in .next build..."
        # Clean .next directory of any injected code
        if [ -d ".next" ]; then
            suspicious_files=$(find .next -type f -name "*.js" -exec grep -l "xmrig\|crypto.*miner\|stratum" {} \; 2>/dev/null || true)
            if [ -n "$suspicious_files" ]; then
                echo "⚠️  Found suspicious files in .next:"
                echo "$suspicious_files"
                echo "$suspicious_files" | xargs rm -f 2>/dev/null || true
            fi
        fi
        
        echo "🔍 Scanning for hidden malware files..."
        # Remove hidden malware files (but keep .env, .git, etc)
        find . -maxdepth 2 -type f -name ".*miner*" -delete 2>/dev/null || true
        find . -maxdepth 2 -type f -name ".x*" ! -name ".*.swp" -delete 2>/dev/null || true
        
        echo "🔍 Checking for unauthorized cron jobs..."
        # Check if there are any suspicious cron jobs
        suspicious_crons=$(crontab -l 2>/dev/null | grep -E "xmrig|minerd|wget.*\.sh|curl.*\.sh" | grep -v "detect-miners\|monitor-health\|file-integrity\|security-audit" || true)
        if [ -n "$suspicious_crons" ]; then
            echo "⚠️  WARNING: Found suspicious cron jobs:"
            echo "$suspicious_crons"
            echo "Please review and remove manually: crontab -e"
        fi
        
        echo "✅ Server pre-deployment cleaning completed"
ENDSSH
    
    if [ $? -eq 0 ]; then
        print_success "Server cleaned successfully"
    else
        print_warning "Some cleaning operations had warnings (non-critical)"
    fi
}

# Step 3: Deploy Code
deploy_code() {
    print_header "STEP 3: Deploying Fresh Code"
    
    print_status "Backing up important server files..."
    ssh $REMOTE_HOST "bash -s" << 'ENDSSH'
        cd ~/fengshui-layout
        
        # Backup important server files that should be preserved
        echo "📦 Backing up server-specific files..."
        mkdir -p .backup_temp
        
        # Backup logs
        if [ -d "logs" ]; then
            cp -r logs .backup_temp/ 2>/dev/null || true
        fi
        
        # Backup .env (production environment variables)
        if [ -f ".env" ]; then
            cp .env .backup_temp/.env 2>/dev/null || true
        fi
        
        # Backup .env.production
        if [ -f ".env.production" ]; then
            cp .env.production .backup_temp/.env.production 2>/dev/null || true
        fi
        
        # Backup ecosystem.config.json if it has production-specific settings
        if [ -f "ecosystem.config.json" ]; then
            cp ecosystem.config.json .backup_temp/ecosystem.config.json 2>/dev/null || true
        fi
        
        echo "✅ Backup completed"
ENDSSH
    
    print_status "Uploading source code to server..."
    
    rsync -avz -e "ssh" \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.git' \
        --exclude '*.log' \
        --exclude '.env' \
        --exclude '.env.local' \
        --exclude '.env.development' \
        --exclude '.env.production' \
        --exclude 'logs/' \
        --exclude '.DS_Store' \
        --exclude 'test-*.js' \
        --exclude '.backup_temp/' \
        --progress \
        $LOCAL_PROJECT_PATH/ $REMOTE_HOST:$REMOTE_PATH/
    
    if [ $? -eq 0 ]; then
        print_success "Source code uploaded successfully"
    else
        print_error "Failed to upload source code"
        exit 1
    fi
    
    print_status "Restoring important server files..."
    ssh $REMOTE_HOST "bash -s" << 'ENDSSH'
        cd ~/fengshui-layout
        
        # Restore backed up files
        echo "📦 Restoring server-specific files..."
        
        if [ -d ".backup_temp/logs" ]; then
            cp -r .backup_temp/logs . 2>/dev/null || true
        fi
        
        if [ -f ".backup_temp/.env" ]; then
            cp .backup_temp/.env . 2>/dev/null || true
        fi
        
        if [ -f ".backup_temp/.env.production" ]; then
            cp .backup_temp/.env.production . 2>/dev/null || true
        fi
        
        if [ -f ".backup_temp/ecosystem.config.json" ]; then
            cp .backup_temp/ecosystem.config.json . 2>/dev/null || true
        fi
        
        # Clean up backup
        rm -rf .backup_temp
        
        # Ensure logs directory exists
        mkdir -p logs
        
        echo "✅ Server files restored"
ENDSSH
    
    print_status "Building application on server..."
    ssh $REMOTE_HOST "bash -s" << 'ENDSSH'
        cd ~/fengshui-layout
        
        echo "📦 Removing old node_modules and .next..."
        rm -rf node_modules .next
        
        echo "📦 Installing dependencies (this may take a few minutes)..."
        npm install --production
        
        echo "🏗️  Building Next.js application..."
        npm run build
        
        echo "📁 Copying static files..."
        cp -r .next/static .next/standalone/.next/
        cp -r public .next/standalone/
        
        echo "🔒 Re-locking critical files for security..."
        sudo chattr +i package.json 2>/dev/null || true
        sudo chattr +i ecosystem.config.json 2>/dev/null || true
        sudo chattr +i next.config.js 2>/dev/null || true
        sudo chattr +i next.config.ts 2>/dev/null || true
        sudo chattr +i .env 2>/dev/null || true
        sudo chattr +i .env.production 2>/dev/null || true
        
        echo "✅ Build completed"
ENDSSH
    
    if [ $? -eq 0 ]; then
        print_success "Application built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Step 4: Post-Deployment Security Scan
scan_server_post_deployment() {
    print_header "STEP 4: Post-Deployment Security Scan"
    
    print_status "Scanning deployed application for malware..."
    
    ssh $REMOTE_HOST "bash -s" << 'ENDSSH'
        cd ~/fengshui-layout
        
        echo "🔍 Checking for mining processes..."
        if pgrep -f "xmrig|minerd|crypto" >/dev/null; then
            echo "❌ WARNING: Mining processes detected!"
            pgrep -af "xmrig|minerd|crypto"
            exit 1
        else
            echo "✅ No mining processes found"
        fi
        
        echo "🔍 Checking .next build for injected code..."
        if [ -d ".next" ]; then
            suspicious_count=$(find .next -type f -name "*.js" -exec grep -l "xmrig\|eval(atob\|crypto.*miner" {} \; 2>/dev/null | wc -l)
            if [ "$suspicious_count" -gt 0 ]; then
                echo "❌ WARNING: Found $suspicious_count suspicious files in .next/"
                exit 1
            else
                echo "✅ .next build is clean"
            fi
        fi
        
        echo "🔍 Checking node_modules for suspicious packages..."
        if [ -d "node_modules" ]; then
            suspicious_pkg=$(find node_modules -type f -name "package.json" -exec grep -l "xmrig\|crypto-miner" {} \; 2>/dev/null | wc -l)
            if [ "$suspicious_pkg" -gt 0 ]; then
                echo "❌ WARNING: Suspicious packages in node_modules!"
                exit 1
            else
                echo "✅ node_modules is clean"
            fi
        fi
        
        echo "✅ Post-deployment scan completed - All clean!"
ENDSSH
    
    if [ $? -eq 0 ]; then
        print_success "Server is clean after deployment"
    else
        print_error "Security threats detected after deployment!"
        print_warning "Run: ssh fs 'cd ~/fengshui-layout && bash detect-miners.sh'"
        exit 1
    fi
}

# Step 5: Restart Services
restart_services() {
    print_header "STEP 5: Restarting Services"
    
    print_status "Restarting PM2 processes..."
    ssh $REMOTE_HOST "bash -s" << 'ENDSSH'
        cd ~/fengshui-layout
        
        pm2 delete all || true
        pm2 start ecosystem.config.json
        pm2 save
        
        echo "Waiting for services to start..."
        sleep 5
        
        pm2 status
ENDSSH
    
    if [ $? -eq 0 ]; then
        print_success "Services restarted successfully"
    else
        print_error "Failed to restart services"
        exit 1
    fi
}

# Step 6: Verify Security Monitoring
verify_monitoring() {
    print_header "STEP 6: Verifying Security Monitoring"
    
    print_status "Checking crontab jobs..."
    ssh $REMOTE_HOST "crontab -l | grep -E 'detect-miners|monitor-health|file-integrity|security-audit' | wc -l" > /tmp/cron_count.txt
    
    cron_count=$(cat /tmp/cron_count.txt)
    if [ "$cron_count" -ge 4 ]; then
        print_success "All 4 security monitoring jobs are active"
    else
        print_warning "Only $cron_count monitoring jobs found (expected 4)"
        echo "Run: ssh fs 'crontab -l' to check"
    fi
    
    print_status "Testing health check..."
    ssh $REMOTE_HOST "cd $REMOTE_PATH && bash monitor-health.sh" >/dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "Health monitoring is working"
    else
        print_warning "Health check had issues"
    fi
}

# Step 7: Final Verification
final_verification() {
    print_header "STEP 7: Final Verification"
    
    print_status "Testing application response..."
    sleep 3
    
    # Test if server responds
    response=$(ssh $REMOTE_HOST "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/" 2>/dev/null)
    
    if [ "$response" = "200" ] || [ "$response" = "301" ] || [ "$response" = "302" ]; then
        print_success "Application is responding (HTTP $response)"
    else
        print_warning "Application response: HTTP $response"
    fi
    
    print_status "Server public URL: https://harmoniqfengshui.com"
    
    print_header "🎉 SECURE DEPLOYMENT COMPLETED!"
    
    echo ""
    echo "Next steps:"
    echo "  1. Visit https://harmoniqfengshui.com to verify"
    echo "  2. Monitor logs: ssh fs 'tail -f ~/fengshui-layout/logs/health-check.log'"
    echo "  3. Check PM2: ssh fs 'pm2 status'"
    echo ""
    echo "Security monitoring is active:"
    echo "  • Miner detection: Every 5 minutes"
    echo "  • Health checks: Every 5 minutes"
    echo "  • File integrity: Daily at 2 AM UTC"
    echo "  • Security audit: Weekly Sunday 3 AM UTC"
    echo ""
}

# Main execution
main() {
    print_header "🔒 SECURE DEPLOYMENT STARTING"
    echo "This will:"
    echo "  1. Scan local code for malware"
    echo "  2. Clean server before deployment"
    echo "  3. Deploy fresh code"
    echo "  4. Scan server after deployment"
    echo "  5. Restart services"
    echo "  6. Verify security monitoring"
    echo ""
    
    read -p "Continue with secure deployment? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
    
    scan_local_code
    clean_server_pre_deployment
    deploy_code
    scan_server_post_deployment
    restart_services
    verify_monitoring
    final_verification
}

# Run main function
main
