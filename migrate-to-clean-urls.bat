@echo off
echo ========================================
echo   Beresta Website - Migration Script
echo   Migrating to Clean URLs Structure
echo ========================================
echo.

echo [1/4] Creating backup of original files...
if not exist "backup" mkdir backup
xcopy *.html backup\ /Y
echo ✓ Backup created in backup/ folder
echo.

echo [2/4] Updating internal links in HTML files...
echo Updating links in pages/ directory...

for /r pages %%f in (*.html) do (
    echo Processing: %%f
    powershell -Command "(Get-Content '%%f') -replace 'href=\"/applications\.html\"', 'href=\"/applications/\"' -replace 'href=\"/technology\.html\"', 'href=\"/technology/\"' -replace 'href=\"/team\.html\"', 'href=\"/team/\"' -replace 'href=\"/blog\.html\"', 'href=\"/blog/\"' -replace 'href=\"/roadmap\.html\"', 'href=\"/roadmap/\"' -replace 'href=\"/whitepaper\.html\"', 'href=\"/whitepaper/\"' -replace 'href=\"/participation\.html\"', 'href=\"/participation/\"' -replace 'href=\"/prototype\.html\"', 'href=\"/prototype/\"' | Set-Content '%%f'"
)

echo Updating links in root HTML files...
powershell -Command "(Get-Content 'index.html') -replace 'href=\"/applications\.html\"', 'href=\"/applications/\"' -replace 'href=\"/technology\.html\"', 'href=\"/technology/\"' -replace 'href=\"/team\.html\"', 'href=\"/team/\"' -replace 'href=\"/blog\.html\"', 'href=\"/blog/\"' -replace 'href=\"/roadmap\.html\"', 'href=\"/roadmap/\"' -replace 'href=\"/whitepaper\.html\"', 'href=\"/whitepaper/\"' -replace 'href=\"/participation\.html\"', 'href=\"/participation/\"' -replace 'href=\"/prototype\.html\"', 'href=\"/prototype/\"' | Set-Content 'index.html'"

echo ✓ Internal links updated
echo.

echo [3/4] Creating .htaccess for Apache servers...
echo # Apache .htaccess for Clean URLs > .htaccess
echo RewriteEngine On >> .htaccess
echo. >> .htaccess
echo # Handle clean URLs >> .htaccess
echo RewriteCond %%{REQUEST_FILENAME} !-f >> .htaccess
echo RewriteCond %%{REQUEST_FILENAME} !-d >> .htaccess
echo RewriteRule ^([^/]+)/?$ pages/$1/index.html [L] >> .htaccess
echo. >> .htaccess
echo # Handle trailing slashes >> .htaccess
echo RewriteCond %%{REQUEST_FILENAME} !-f >> .htaccess
echo RewriteCond %%{REQUEST_FILENAME} !-d >> .htaccess
echo RewriteRule ^([^/]+)/$ pages/$1/index.html [L] >> .htaccess
echo. >> .htaccess
echo # Fallback to .html files for backward compatibility >> .htaccess
echo RewriteCond %%{REQUEST_FILENAME} !-f >> .htaccess
echo RewriteCond %%{REQUEST_FILENAME} !-d >> .htaccess
echo RewriteRule ^([^/]+)$ $1.html [L] >> .htaccess

echo ✓ .htaccess created for Apache compatibility
echo.

echo [4/4] Testing new structure...
echo Testing if pages exist:
if exist "pages\applications\index.html" (
    echo ✓ /applications/ - OK
) else (
    echo ✗ /applications/ - MISSING
)

if exist "pages\technology\index.html" (
    echo ✓ /technology/ - OK
) else (
    echo ✗ /technology/ - MISSING
)

if exist "pages\team\index.html" (
    echo ✓ /team/ - OK
) else (
    echo ✗ /team/ - MISSING
)

echo.
echo ========================================
echo   Migration completed successfully!
echo ========================================
echo.
echo New URL structure:
echo   http://localhost:8100/applications/
echo   http://localhost:8100/technology/
echo   http://localhost:8100/team/
echo   http://localhost:8100/blog/
echo   http://localhost:8100/roadmap/
echo   http://localhost:8100/whitepaper/
echo   http://localhost:8100/participation/
echo   http://localhost:8100/prototype/
echo.
echo Old URLs still work for backward compatibility.
echo.
echo To test: node dev-server.js
echo.
pause

