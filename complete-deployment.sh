#!/bin/bash

# Complete Deployment Script for FengShui Layout
# This script handles the entire deployment process from local to production

set -e  # Exit on any error

# Configuration
REMOTE_HOST="fs"
REMOTE_PATH="/home/ec2-user/fengshui-layout"
LOCAL_PROJECT_PATH="."

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

# Function to build and deploy on server
server_build_and_deploy() {
    print_status "Building and deploying on server..."
    
    ssh $REMOTE_HOST << 'EOF'
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
        
        # In# Restore backup if build failed
            if [ -d ".next.backup" ]; then
                echo "🔄 Restoring previous build..."
                rm -rf .next
                mv .next.backup .next
            fi
            exit 1
        fi
        
        # Remove backup on successful build
        echo "🗑️  Removing old build backup..."
        rm -rf .next.backup 2>/dev/null || trueho "📦 Installing dependencies..."
        npm install --production=false
        
        # Build the application
        echo "🔨 Building application..."
        npm run build
        
        # Check if build was successful
        if [ ! -d ".next/standalone" ]; then
            echo "❌ Build failed - standalone directory not found"
            exit 1
        fi
        
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
    if [ $? -ne 0 ]; then
        print_error "Deployment failed!"
        print_status "Check the logs for more details:"
        print_status "  ssh $REMOTE_HOST 'pm2 logs'"
        exit 1
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main deployment process
main() {
    echo "🚀 Starting Complete Deployment Process"
    echo "======================================="
    
    check_prerequisites
    upload_source
    server_build_and_deploy
    verify_deployment
    show_summary
    
    print_success "🎉 Deployment completed successfully!"
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi