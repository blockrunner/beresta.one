# Beresta Website - Migration Script
# Migrating to Clean URLs Structure

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Beresta Website - Migration Script" -ForegroundColor Cyan
Write-Host "  Migrating to Clean URLs Structure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Creating backup of original files..." -ForegroundColor Yellow
if (!(Test-Path "backup")) {
    New-Item -ItemType Directory -Name "backup" | Out-Null
}
Copy-Item "*.html" "backup/" -Force
Write-Host "✓ Backup created in backup/ folder" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] Updating internal links in HTML files..." -ForegroundColor Yellow
Write-Host "Updating links in pages/ directory..."

$htmlFiles = Get-ChildItem -Path "pages" -Recurse -Filter "*.html"
foreach ($file in $htmlFiles) {
    Write-Host "Processing: $($file.FullName)"
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace 'href="/applications\.html"', 'href="/applications/"'
    $content = $content -replace 'href="/technology\.html"', 'href="/technology/"'
    $content = $content -replace 'href="/team\.html"', 'href="/team/"'
    $content = $content -replace 'href="/blog\.html"', 'href="/blog/"'
    $content = $content -replace 'href="/roadmap\.html"', 'href="/roadmap/"'
    $content = $content -replace 'href="/whitepaper\.html"', 'href="/whitepaper/"'
    $content = $content -replace 'href="/participation\.html"', 'href="/participation/"'
    $content = $content -replace 'href="/prototype\.html"', 'href="/prototype/"'
    Set-Content $file.FullName -Value $content
}

Write-Host "Updating links in root HTML files..."
if (Test-Path "index.html") {
    $content = Get-Content "index.html" -Raw
    $content = $content -replace 'href="/applications\.html"', 'href="/applications/"'
    $content = $content -replace 'href="/technology\.html"', 'href="/technology/"'
    $content = $content -replace 'href="/team\.html"', 'href="/team/"'
    $content = $content -replace 'href="/blog\.html"', 'href="/blog/"'
    $content = $content -replace 'href="/roadmap\.html"', 'href="/roadmap/"'
    $content = $content -replace 'href="/whitepaper\.html"', 'href="/whitepaper/"'
    $content = $content -replace 'href="/participation\.html"', 'href="/participation/"'
    $content = $content -replace 'href="/prototype\.html"', 'href="/prototype/"'
    Set-Content "index.html" -Value $content
}

Write-Host "✓ Internal links updated" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] Creating .htaccess for Apache servers..." -ForegroundColor Yellow
$htaccessContent = @"
# Apache .htaccess for Clean URLs
RewriteEngine On

# Handle clean URLs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([^/]+)/?$ pages/$1/index.html [L]

# Handle trailing slashes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([^/]+)/$ pages/$1/index.html [L]

# Fallback to .html files for backward compatibility
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([^/]+)$ $1.html [L]
"@

Set-Content ".htaccess" -Value $htaccessContent
Write-Host "✓ .htaccess created for Apache compatibility" -ForegroundColor Green
Write-Host ""

Write-Host "[4/4] Testing new structure..." -ForegroundColor Yellow
Write-Host "Testing if pages exist:"

$pages = @("applications", "technology", "team", "blog", "roadmap", "whitepaper", "participation", "prototype")
foreach ($page in $pages) {
    $pagePath = "pages\$page\index.html"
    if (Test-Path $pagePath) {
        Write-Host "✓ /$page/ - OK" -ForegroundColor Green
    } else {
        Write-Host "✗ /$page/ - MISSING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration completed successfully!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "New URL structure:" -ForegroundColor Yellow
Write-Host "  http://localhost:8100/applications/"
Write-Host "  http://localhost:8100/technology/"
Write-Host "  http://localhost:8100/team/"
Write-Host "  http://localhost:8100/blog/"
Write-Host "  http://localhost:8100/roadmap/"
Write-Host "  http://localhost:8100/whitepaper/"
Write-Host "  http://localhost:8100/participation/"
Write-Host "  http://localhost:8100/prototype/"
Write-Host ""
Write-Host "Old URLs still work for backward compatibility." -ForegroundColor Green
Write-Host ""
Write-Host "To test: node dev-server.js" -ForegroundColor Yellow
Write-Host ""

