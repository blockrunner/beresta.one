const fs = require('node:fs');
const path = require('node:path');

function getPages(root) {
  const pages = {};
  function visit(directory, segments = []) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) visit(path.join(directory, entry.name), [...segments, entry.name]);
      if (entry.isFile() && entry.name === 'index.html' && segments.length) {
        pages[`/${segments.join('/')}/`] = path.join(directory, entry.name);
      }
    }
  }
  visit(path.join(root, 'pages'));
  return pages;
}

function resolvePage(root, pathname) {
  if (pathname === '/' || pathname === '/index.html') return path.join(root, 'index.html');
  if (pathname === '/app' || pathname === '/app/') return path.join(root, 'app/index.html');
  const slug = pathname.replace(/^\/pages\//, '/').replace(/\/index\.html$/, '/').replace(/\.html$/, '/');
  return getPages(root)[`${slug.replace(/\/$/, '')}/`] || null;
}

module.exports = { getPages, resolvePage };
