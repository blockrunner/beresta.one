@echo off
echo Starting Beresta Website Development Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    echo.
    echo Alternative: Using Python HTTP server...
    python -m http.server 8000
    goto :end
)

REM Check if package.json exists and install dependencies
if exist package.json (
    echo Installing dependencies...
    npm install
    echo.
    echo Starting development server...
    npm run dev
) else (
    echo No package.json found. Using built-in Node.js server...
    node dev-server.js
)

:end
pause
