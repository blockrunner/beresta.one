import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import fs from 'node:fs';
import pages from './config/pages.cjs';

const root = __dirname;
const staticFiles = [
  'img', 'css', 'js', 'components', 'locales', 'shared', 'app/css', 'app/js',
  'config/dev.config.js', 'config/prod.config.js', 'robots.txt', 'sitemap.xml',
  'favicon.ico', 'favicon.svg', 'favicon-96x96.png', 'apple-touch-icon.png',
  'android-chrome-192x192.png', 'site.webmanifest',
  'web-app-manifest-192x192.png', 'web-app-manifest-512x512.png'
];

function cleanUrls(directory) {
  return (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    if (/^\/(?:api(?:\/|$)|app\/api(?:\/|$)|@|node_modules(?:\/|$))/.test(url.pathname)) return next();
    const page = pages.resolvePage(directory, url.pathname);
    if (page) {
      req.url = `/${page.slice(directory.length + 1).replace(/\\/g, '/')}${url.search}`;
      return next();
    }
    if (url.pathname.includes('.')) return next();
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(fs.readFileSync(resolve(directory, '404.html')));
  };
}

export default defineConfig({
  root,
  base: '/',
  publicDir: false,
  appType: 'mpa',
  server: {
    port: 8100,
    host: '0.0.0.0',
    proxy: {
      '/app/api': { target: 'http://localhost:3000', changeOrigin: true, rewrite: p => p.replace(/^\/app/, '') },
      '/api': { target: 'http://localhost:3000', changeOrigin: true }
    }
  },
  preview: { port: 8100, host: '0.0.0.0' },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        app: resolve(root, 'app/index.html'),
        notFound: resolve(root, '404.html'),
        ...Object.fromEntries(Object.entries(pages.getPages(root)).map(([url, file]) => [url.slice(1, -1).replace(/\//g, '-'), file]))
      }
    }
  },
  plugins: [{
    name: 'beresta-pages',
    configureServer(server) { server.middlewares.use(cleanUrls(root)); },
    configurePreviewServer(server) { server.middlewares.use(cleanUrls(resolve(root, 'dist'))); },
    closeBundle() {
      for (const file of staticFiles) {
        if (fs.existsSync(resolve(root, file))) {
          fs.cpSync(resolve(root, file), resolve(root, 'dist', file), { recursive: true });
        }
      }
    }
  }]
});
