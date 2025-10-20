# Test deployment script for Windows
# Tests the production build locally

Write-Host "🧪 Testing Beresta deployment locally..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Install API dependencies
Write-Host "📦 Installing API dependencies..." -ForegroundColor Yellow
Set-Location "app\api"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install API dependencies" -ForegroundColor Red
    exit 1
}
Set-Location "..\.."

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
npm run build:site
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build frontend" -ForegroundColor Red
    exit 1
}

# Install production dependencies
Write-Host "📦 Installing production dependencies..." -ForegroundColor Yellow
npm run install:prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install production dependencies" -ForegroundColor Red
    exit 1
}

# Check if dist folder exists
if (Test-Path "dist") {
    Write-Host "✅ Frontend build completed - dist folder exists" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed - dist folder not found" -ForegroundColor Red
    exit 1
}

# Check if server.js exists
if (Test-Path "server.js") {
    Write-Host "✅ Production server file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Production server file not found" -ForegroundColor Red
    exit 1
}

# Test server startup (dry run)
Write-Host "🚀 Testing server startup..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
$env:PORT = "3001"  # Use different port for testing

# Start server in background
$process = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -WindowStyle Hidden

# Wait for server to start
Start-Sleep -Seconds 5

# Check if server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server is running and responding" -ForegroundColor Green
    } else {
        Write-Host "❌ Server responded with status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Server is not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Stop the test server
Stop-Process -Id $process.Id -Force

Write-Host "🎉 Local deployment test completed!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Set up GitHub Secrets (SSH_PRIVATE_KEY, SSH_USER, SSH_HOST, REMOTE_PATH)" -ForegroundColor White
Write-Host "   2. Push to main branch to trigger deployment" -ForegroundColor White
Write-Host "   3. Or run workflow manually in GitHub Actions" -ForegroundColor White
