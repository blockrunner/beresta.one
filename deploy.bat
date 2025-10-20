@echo off
setlocal enabledelayedexpansion

REM Deploy script for Beresta Website (Windows)
REM Deploys to production server without Docker

echo 🚀 Starting Beresta deployment...

REM Configuration
if not defined SSH_HOST set SSH_HOST=berisk.beget.tech
if not defined SSH_USER set SSH_USER=berisk
if not defined REMOTE_PATH set REMOTE_PATH=/home/berisk/public_html

REM Check if required tools are installed
echo [INFO] Checking dependencies...

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)

where ssh >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] ssh is not installed
    exit /b 1
)

echo [INFO] Dependencies check passed

REM Build the application
echo [INFO] Building application...

REM Install dependencies
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

REM Build frontend
call npm run build:site
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    exit /b 1
)

REM Install production dependencies
call npm run install:prod
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install production dependencies
    exit /b 1
)

echo [INFO] Build completed

REM Create deployment package
echo [INFO] Creating deployment package...

REM Create temporary directory
set TEMP_DIR=%TEMP%\beresta-deploy-%RANDOM%
mkdir "%TEMP_DIR%"

REM Copy necessary files
xcopy /E /I /Y dist "%TEMP_DIR%\dist"
xcopy /E /I /Y app "%TEMP_DIR%\app"
xcopy /E /I /Y img "%TEMP_DIR%\img"
xcopy /E /I /Y css "%TEMP_DIR%\css"
xcopy /E /I /Y js "%TEMP_DIR%\js"
xcopy /E /I /Y shared "%TEMP_DIR%\shared"
xcopy /E /I /Y components "%TEMP_DIR%\components"
xcopy /E /I /Y locales "%TEMP_DIR%\locales"
xcopy /E /I /Y pages "%TEMP_DIR%\pages"
copy /Y package.json "%TEMP_DIR%\"
copy /Y package-lock.json "%TEMP_DIR%\"
copy /Y server.js "%TEMP_DIR%\"
copy /Y .env.example "%TEMP_DIR%\.env"

REM Create .htaccess for Apache fallback
(
echo RewriteEngine On
echo.
echo # Proxy to Node.js server if available
echo RewriteCond %%{REQUEST_FILENAME} !-f
echo RewriteCond %%{REQUEST_FILENAME} !-d
echo RewriteRule ^^(.*^)$ http://localhost:3000/$1 [P,L]
echo.
echo # Fallback to static files
echo RewriteCond %%{REQUEST_FILENAME} !-f
echo RewriteCond %%{REQUEST_FILENAME} !-d
echo RewriteRule ^^([^/]+^)/?$ pages/$1/index.html [L]
echo.
echo # Cache static files
echo ^<IfModule mod_expires.c^>
echo     ExpiresActive On
echo     ExpiresByType text/css "access plus 1 year"
echo     ExpiresByType application/javascript "access plus 1 year"
echo     ExpiresByType image/png "access plus 1 year"
echo     ExpiresByType image/jpg "access plus 1 year"
echo     ExpiresByType image/jpeg "access plus 1 year"
echo     ExpiresByType image/gif "access plus 1 year"
echo     ExpiresByType image/svg+xml "access plus 1 year"
echo ^</IfModule^>
) > "%TEMP_DIR%\.htaccess"

echo [INFO] Package created at %TEMP_DIR%

REM Deploy to server
echo [INFO] Deploying to server %SSH_HOST%...

REM Create backup
ssh %SSH_USER%@%SSH_HOST% "cp -r %REMOTE_PATH% %REMOTE_PATH%.backup.$(date +%%Y%%m%%d_%%H%%M%%S) 2>/dev/null || true"

REM Upload files using rsync (if available) or scp
where rsync >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] Using rsync for upload...
    rsync -avz --delete "%TEMP_DIR%/" %SSH_USER%@%SSH_HOST%:%REMOTE_PATH%/
) else (
    echo [INFO] Using scp for upload...
    scp -r "%TEMP_DIR%\*" %SSH_USER%@%SSH_HOST%:%REMOTE_PATH%/
)

if %errorlevel% neq 0 (
    echo [ERROR] Failed to upload files
    rmdir /S /Q "%TEMP_DIR%"
    exit /b 1
)

REM Install dependencies on server
ssh %SSH_USER%@%SSH_HOST% "cd %REMOTE_PATH% && npm install --production"

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies on server
    rmdir /S /Q "%TEMP_DIR%"
    exit /b 1
)

REM Set up environment
ssh %SSH_USER%@%SSH_HOST% "cd %REMOTE_PATH% && cp .env.example .env"

echo [INFO] Deployment completed

REM Restart the application
echo [INFO] Restarting application...

REM Kill existing process
ssh %SSH_USER%@%SSH_HOST% "pkill -f 'node server.js' || true"

REM Start application in background
ssh %SSH_USER%@%SSH_HOST% "cd %REMOTE_PATH% && nohup npm start > app.log 2>&1 &"

REM Wait a moment and check if it's running
timeout /t 3 /nobreak >nul
ssh %SSH_USER%@%SSH_HOST% "pgrep -f 'node server.js' > /dev/null"
if %errorlevel% equ 0 (
    echo [INFO] Application started successfully
) else (
    echo [ERROR] Failed to start application
    ssh %SSH_USER%@%SSH_HOST% "cd %REMOTE_PATH% && cat app.log"
    rmdir /S /Q "%TEMP_DIR%"
    exit /b 1
)

REM Health check
echo [INFO] Performing health check...

REM Wait for application to start
timeout /t 5 /nobreak >nul

REM Check if application responds
curl -f "http://%SSH_HOST%" >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] Health check passed - application is running
) else (
    echo [WARN] Health check failed - application might not be responding
)

REM Cleanup
rmdir /S /Q "%TEMP_DIR%"
echo [INFO] Cleanup completed

echo 🎉 Deployment completed successfully!
echo Application is available at: http://%SSH_HOST%

endlocal
