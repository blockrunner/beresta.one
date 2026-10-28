#!/usr/bin/env node
const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const { resolvePage } = require('./config/pages.cjs');
require('dotenv').config();

function createSiteApp({ root = path.join(__dirname, 'dist'), api = true } = {}) {
  const app = express();
  app.disable('x-powered-by');
  if (api) {
    const apiApp = require('./app/api/server.js');
    app.use('/app', apiApp);
    app.use(apiApp);
  }
  app.get('*', (req, res, next) => {
    const page = resolvePage(root, req.path);
    if (!page) return next();
    const canonical = req.path === '/index.html' ? '/' : req.path
      .replace(/^\/pages\//, '/')
      .replace(/\/index\.html$/, '/')
      .replace(/\.html$/, '/');
    if (canonical !== req.path || (req.path !== '/' && !req.path.endsWith('/'))) {
      const query = req.originalUrl.slice(req.path.length);
      return res.redirect(301, `${canonical.endsWith('/') ? canonical : `${canonical}/`}${query}`);
    }
    res.set('Cache-Control', 'no-cache');
    res.sendFile(page);
  });
  app.use(express.static(root, {
    index: false,
    redirect: false,
    setHeaders(res, file) {
      res.setHeader('Cache-Control', file.includes(`${path.sep}assets${path.sep}`)
        ? 'public, max-age=31536000, immutable' : 'public, max-age=3600');
    }
  }));
  app.use((req, res) => {
    res.status(404);
    const file = path.join(root, '404.html');
    if (fs.existsSync(file)) return res.sendFile(file);
    res.type('text').send('Page not found');
  });
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8100);
  const server = createSiteApp().listen(port, process.env.HOST || '0.0.0.0', () => {
    console.log(`Beresta: http://localhost:${port}`);
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
}
module.exports = { createSiteApp };
