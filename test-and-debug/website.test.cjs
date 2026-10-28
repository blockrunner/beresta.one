const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { once } = require('node:events');
const express = require('express');
const { createSiteApp } = require('../server');
const { createParticipationRouter } = require('../app/api/routes/participation');
const { getPages } = require('../config/pages.cjs');
const { checkSite } = require('../scripts/check-site.cjs');

const root = path.resolve(__dirname, '..');
async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('all built pages, nested articles, runtime assets and 404 responses', async () => {
  await withServer(createSiteApp({ api: false }), checkSite);
});

test('legacy URLs redirect to their canonical destination and preserve queries', async () => {
  await withServer(createSiteApp({ api: false }), async base => {
    for (const [old, canonical] of [['/index.html', '/'], ['/technology.html', '/technology/'],
      ['/blog/posts/history', '/blog/posts/history/'], ['/pages/blog/posts/history/index.html', '/blog/posts/history/']]) {
      const response = await fetch(`${base + old  }?ref=test`, { redirect: 'manual' });
      assert.equal(response.status, 301);
      assert.equal(response.headers.get('location'), `${canonical  }?ref=test`);
    }
  });
});

test('Telegram delivery, validation, provider failures and rate limit', async () => {
  for (const [delivery, expected] of [[{ ok: true }, 200], [{ ok: false, configured: true }, 502], [{ ok: false, configured: false }, 503]]) {
    const messages = [];
    const app = express();
    app.use(express.json());
    app.use('/api/participation', createParticipationRouter({ notify: async text => { messages.push(text); return delivery; } }));
    await withServer(app, async base => {
      const send = data => fetch(`${base  }/api/participation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const valid = { name: 'Test', email: 'test@example.com', role: 'tester', telegram: '@test_user', message: 'Test only' };
      for (const invalid of [{ ...valid, email: 'bad' }, { ...valid, role: 'admin' }, { ...valid, website: 'spam' }]) {
        assert.equal((await send(invalid)).status, 400);
      }
      assert.equal(messages.length, 0);
      const response = await send(valid);
      assert.equal(response.status, expected);
      assert.equal((await response.json()).ok, delivery.ok ? true : undefined);
      assert.match(messages[0], /Beresta/);
      assert.match(messages[0], /test@example\.com/);
      assert.equal((await send(valid)).status, expected);
      assert.equal((await send(valid)).status, 429);
    });
  }
});

test('form does not show success on HTTP, JSON or network errors and allows retry', async () => {
  for (const outcome of ['http', 'json', 'network', 'ok']) {
    let handler;
    const button = { disabled: false, textContent: '', dataset: {} };
    const error = { hidden: true, dataset: {}, focus() {} };
    const success = { hidden: true, style: {}, focus() {} };
    const body = { hidden: false };
    const form = { querySelector: () => button, reportValidity: () => true,
      addEventListener: (_, fn) => { handler = fn; }, setAttribute() {}, removeAttribute() {},
      getAttribute: () => '/api/participation', reset() {} };
    let finish;
    const response = new Promise(resolve => { finish = resolve; });
    const context = {
      document: { getElementById: id => ({ partForm: form, 'form-error': error, 'form-success': success, 'form-body': body })[id], documentElement: { lang: 'ru' } },
      FormData: class { *[Symbol.iterator]() { yield ['name', 'Test']; } },
      AbortSignal, getTranslation: () => 'translated',
      fetch: async () => { await response; if (outcome === 'network') throw new Error('offline'); return { ok: outcome !== 'http', status: outcome === 'http' ? 500 : 200, json: async () => ({ ok: outcome === 'ok' }) }; }
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'js/participation.js'), 'utf8'), context);
    const pending = handler({ preventDefault() {} });
    assert.equal(button.disabled, true);
    finish();
    await pending;
    assert.equal(button.disabled, false);
    assert.equal(body.hidden, outcome === 'ok');
    assert.equal(success.hidden, outcome !== 'ok');
    assert.equal(error.hidden, outcome === 'ok');
  }
});

test('SEO metadata, sitemap and translations cover public source pages', () => {
  const english = JSON.parse(fs.readFileSync(path.join(root, 'locales/en.json'), 'utf8'));
  const russian = JSON.parse(fs.readFileSync(path.join(root, 'locales/ru.json'), 'utf8'));
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.ok(english.nav.blog && russian.nav.blog);
  for (const [route, file] of Object.entries({ '/': path.join(root, 'index.html'), ...getPages(root) })) {
    const html = fs.readFileSync(file, 'utf8');
    for (const tag of ['name="description"', 'rel="canonical"', 'property="og:title"', 'name="twitter:card"']) assert.ok(html.includes(tag), `${route}: ${tag}`);
    if (route !== '/design-guide/') assert.ok(sitemap.includes(`https://beresta.one${route}</loc>`), `${route}: sitemap`);
    const visible = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
    for (const match of visible.matchAll(/>([^<>]+)</g)) {
      const text = match[1].replace(/\s+/g, ' ').trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      if (/[а-яё]/i.test(text)) assert.ok(Object.hasOwn(english.content, text), `${route}: missing translation: ${text}`);
    }
  }
});

test('language switching translates text and attributes without replacing nested markup', async () => {
  const makeElement = attributes => ({
    attributes, dataset: {},
    hasAttribute(key) { return Object.hasOwn(this.attributes, key); },
    getAttribute(key) { return this.attributes[key]; },
    setAttribute(key, value) { this.attributes[key] = value; }
  });
  const text = { nodeValue: '  Прими участие в проекте  ', parentElement: { closest: () => false } };
  const link = { nodeValue: 'Подробнее о технологии', parentElement: { closest: () => false } };
  const code = { nodeValue: 'Технология', parentElement: { closest: () => true } };
  const image = makeElement({ alt: '3D модель Бересты' });
  const placeholder = makeElement({ placeholder: 'Иван' });
  const meta = makeElement({ content: 'Технология | Beresta' });
  const label = makeElement({}); label.dataset.i18n = 'nav.blog';
  const button = makeElement({}); button.dataset.lang = 'en'; button.classList = { toggle() {} };
  const document = {
    documentElement: { lang: 'ru' },
    createTreeWalker: () => { const nodes = [text, link, code]; return { nextNode: () => nodes.shift() }; },
    querySelectorAll: selector => selector === '[data-i18n]' ? [label] : selector === '.lang-btn' ? [button] : [image, placeholder, meta]
  };
  const context = { document, NodeFilter: { SHOW_TEXT: 4 }, navigator: { language: 'en-US' },
    localStorage: { getItem() { throw new Error('disabled'); } },
    fetch: async url => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(path.join(root, url), 'utf8')) }), console
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8'), context);
  await context.loadTranslations();
  assert.equal(context.getPreferredLanguage(), 'en');
  context.loadLanguage('en');
  assert.equal(text.nodeValue, '  Take part in the project  ');
  assert.equal(link.nodeValue, 'Explore the technology');
  assert.equal(code.nodeValue, 'Технология');
  assert.equal(image.attributes.alt, '3D model of Beresta');
  assert.equal(placeholder.attributes.placeholder, 'Alex');
  assert.equal(meta.attributes.content, 'Technology | Beresta');
  assert.equal(label.textContent, 'Blog');
  context.loadLanguage('ru');
  assert.equal(text.nodeValue, '  Прими участие в проекте  ');
  assert.equal(placeholder.attributes.placeholder, 'Иван');
  assert.equal(label.textContent, 'Блог');
});

test('API mounts work under both public API prefixes', async () => {
  await withServer(createSiteApp(), async base => {
    for (const endpoint of ['/api/health', '/app/api/health']) {
      const response = await fetch(base + endpoint);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).status, 'OK');
    }
  });
});

test('Vite development and preview serve nested routes, queries and missing pages', async () => {
  const { createServer, preview } = await import('vite');
  for (const mode of ['development', 'preview']) {
    const options = { configFile: path.join(root, 'vite.config.js'), logLevel: 'error' };
    const server = mode === 'development'
      ? await createServer({ ...options, server: { host: '127.0.0.1', port: 0 } })
      : await preview({ ...options, preview: { host: '127.0.0.1', port: 0 } });
    if (mode === 'development') await server.listen();
    const address = server.httpServer.address();
    const base = `http://127.0.0.1:${address.port}`;
    try {
      const response = await fetch(`${base  }/blog/posts/history/?ref=test`);
      assert.equal(response.status, 200, mode);
      assert.match(await response.text(), /<title>Как мы дошли до Бересты 3\.2/);
      assert.equal((await fetch(`${base  }/missing-page/`)).status, 404, mode);
      if (mode === 'development') assert.equal((await fetch(`${base  }/@vite/client`)).status, 200);
    } finally {
      if (mode === 'development') await server.close();
      else await new Promise(resolve => server.httpServer.close(resolve));
    }
  }
});
