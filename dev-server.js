#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8100;
const HOST = process.env.HOST || '0.0.0.0';

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Default to index.html for root
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Handle clean URLs (remove trailing slash and add .html if needed)
  let filePath = path.join(__dirname, pathname);
  
  // Check if it's a clean URL (no extension and ends with /)
  if (pathname.endsWith('/') && pathname !== '/') {
    // Remove trailing slash and try to find index.html in that directory
    const cleanPath = pathname.slice(0, -1);
    filePath = path.join(__dirname, cleanPath, 'index.html');
  } else if (!path.extname(pathname) && pathname !== '/') {
    // No extension, try to find index.html in pages directory
    const pagesPath = path.join(__dirname, 'pages', pathname.slice(1), 'index.html');
    if (fs.existsSync(pagesPath)) {
      filePath = pagesPath;
    } else {
      // Try to find .html file with same name
      filePath = path.join(__dirname, pathname + '.html');
    }
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  // Security check - prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found - try to serve 404.html or default 404
        const notFoundPath = path.join(__dirname, '404.html');
        fs.readFile(notFoundPath, (err404, data404) => {
          if (err404) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>404 - Page Not Found</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                  h1 { color: #e74c3c; }
                </style>
              </head>
              <body>
                <h1>404 - Page Not Found</h1>
                <p>The requested file "${pathname}" was not found.</p>
                <a href="/">Go to Homepage</a>
              </body>
              </html>
            `);
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(data404);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
      return;
    }
    
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Beresta Website Development Server`);
  console.log(`📍 Server running at http://${HOST}:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`⏹️  Press Ctrl+C to stop the server`);
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development server...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down development server...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});
