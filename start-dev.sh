#!/bin/bash

echo "Starting Beresta Website Development Server..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    echo
    echo "Alternative: Using Python HTTP server..."
    python3 -m http.server 8100
    exit 1
fi

# Check if package.json exists and install dependencies
if [ -f "package.json" ]; then
    echo "Installing dependencies..."
    npm install
    echo
    echo "Starting development server..."
    npm run dev
else
    echo "No package.json found. Using built-in Node.js server..."
    node dev-server.js
fi
