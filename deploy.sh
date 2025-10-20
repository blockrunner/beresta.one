#!/bin/bash

# Deploy script for Beresta Website
# Deploys to production server without Docker

set -e

echo "🚀 Starting Beresta deployment..."

# Configuration
SSH_HOST=${SSH_HOST:-"berisk.beget.tech"}
SSH_USER=${SSH_USER:-"berisk"}
REMOTE_PATH=${REMOTE_PATH:-"/home/berisk/public_html"}
LOCAL_PATH="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v ssh &> /dev/null; then
        log_error "ssh is not installed"
        exit 1
    fi
    
    log_info "Dependencies check passed"
}

# Build the application
build_app() {
    log_info "Building application..."
    
    # Install dependencies
    npm install
    
    # Build frontend
    npm run build:site
    
    # Install production dependencies
    npm run install:prod
    
    log_info "Build completed"
}

# Create deployment package
create_package() {
    log_info "Creating deployment package..."
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    PACKAGE_DIR="$TEMP_DIR/beresta-deploy"
    
    mkdir -p "$PACKAGE_DIR"
    
    # Copy necessary files
    cp -r dist "$PACKAGE_DIR/"
    cp -r app "$PACKAGE_DIR/"
    cp -r img "$PACKAGE_DIR/"
    cp -r css "$PACKAGE_DIR/"
    cp -r js "$PACKAGE_DIR/"
    cp -r shared "$PACKAGE_DIR/"
    cp -r components "$PACKAGE_DIR/"
    cp -r locales "$PACKAGE_DIR/"
    cp -r pages "$PACKAGE_DIR/"
    cp package.json "$PACKAGE_DIR/"
    cp package-lock.json "$PACKAGE_DIR/"
    cp server.js "$PACKAGE_DIR/"
    cp .env.example "$PACKAGE_DIR/.env"
    
    # Create .htaccess for Apache fallback
    cat > "$PACKAGE_DIR/.htaccess" << 'EOF'
RewriteEngine On

# Proxy to Node.js server if available
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Fallback to static files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([^/]+)/?$ pages/$1/index.html [L]

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
EOF
    
    echo "$PACKAGE_DIR"
}

# Deploy to server
deploy_to_server() {
    local package_dir=$1
    
    log_info "Deploying to server $SSH_HOST..."
    
    # Create backup
    ssh "$SSH_USER@$SSH_HOST" "cp -r $REMOTE_PATH $REMOTE_PATH.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true"
    
    # Upload files
    rsync -avz --delete "$package_dir/" "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"
    
    # Install dependencies on server
    ssh "$SSH_USER@$SSH_HOST" "cd $REMOTE_PATH && npm install --production"
    
    # Set up environment
    ssh "$SSH_USER@$SSH_HOST" "cd $REMOTE_PATH && cp .env.example .env"
    
    log_info "Deployment completed"
}

# Start/restart the application
restart_app() {
    log_info "Restarting application..."
    
    # Kill existing process
    ssh "$SSH_USER@$SSH_HOST" "pkill -f 'node server.js' || true"
    
    # Start application in background
    ssh "$SSH_USER@$SSH_HOST" "cd $REMOTE_PATH && nohup npm start > app.log 2>&1 &"
    
    # Wait a moment and check if it's running
    sleep 3
    if ssh "$SSH_USER@$SSH_HOST" "pgrep -f 'node server.js' > /dev/null"; then
        log_info "Application started successfully"
    else
        log_error "Failed to start application"
        ssh "$SSH_USER@$SSH_HOST" "cd $REMOTE_PATH && cat app.log"
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for application to start
    sleep 5
    
    # Check if application responds
    if curl -f "http://$SSH_HOST" > /dev/null 2>&1; then
        log_info "Health check passed - application is running"
    else
        log_warn "Health check failed - application might not be responding"
    fi
}

# Cleanup
cleanup() {
    if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
        log_info "Cleanup completed"
    fi
}

# Main deployment process
main() {
    log_info "Starting Beresta deployment process..."
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Run deployment steps
    check_dependencies
    build_app
    PACKAGE_DIR=$(create_package)
    deploy_to_server "$PACKAGE_DIR"
    restart_app
    health_check
    
    log_info "🎉 Deployment completed successfully!"
    log_info "Application is available at: http://$SSH_HOST"
}

# Run main function
main "$@"
