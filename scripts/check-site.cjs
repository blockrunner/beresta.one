const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { getPages } = require('../config/pages.cjs');

const root = path.resolve(__dirname, '..');
const routes = { '/': path.join(root, 'index.html'), ...getPages(root) };

async function checkSite(base) {
  const assets = new Set(['/robots.txt', '/sitemap.xml', '/js/i18n.js', '/js/loadComponents.js',
    '/js/participation.js', '/components/header.html', '/components/footer.html', '/locales/ru.json', '/locales/en.json']);
  for (const [route, source] of Object.entries(routes)) {
    const response = await fetch(new URL(route, base), { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200, `${route}: HTTP status`);
    assert.match(response.headers.get('content-type') || '', /text\/html/, `${route}: content type`);
    const body = await response.text();
    const title = fs.readFileSync(source, 'utf8').match(/<title>(.*?)<\/title>/s)[1];
    assert.ok(body.includes(`<title>${title}</title>`), `${route}: wrong page (homepage fallback?)`);
    assert.ok(body.includes(`href="https://beresta.one${route}"`), `${route}: canonical URL`);
    for (const match of body.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
      if (/^(?:https?:|data:|mailto:|tel:|#)/.test(match[1])) continue;
      const url = new URL(match[1], new URL(route, base));
      if (url.origin === new URL(base).origin && /\.[a-z\d]+$/i.test(url.pathname)) assets.add(url.pathname);
    }
  }
  for (const asset of assets) {
    const response = await fetch(new URL(asset, base), { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200, `${asset}: missing asset`);
    assert.ok(!response.headers.get('content-type')?.includes('text/html') || asset.endsWith('.html'), `${asset}: homepage returned instead of asset`);
  }
  const app = await fetch(new URL('/app/', base));
  assert.equal(app.status, 200, '/app/');
  for (const route of ['/missing-page/', '/blog/posts/missing/', '/missing.js']) {
    const response = await fetch(new URL(route, base));
    assert.equal(response.status, 404, `${route}: must return 404`);
  }
  console.log(`Checked ${Object.keys(routes).length} pages, ${assets.size} assets, app and 404 responses.`);
}

if (require.main === module) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/check-site.cjs https://example.com');
  checkSite(process.argv[2]).catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { checkSite };
