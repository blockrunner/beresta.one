const translations = { ru: {}, en: {} };
let contentTranslations = {};
let translationsReady;
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const normalizeText = value => value.replace(/\s+/g, ' ').trim();

function getPreferredLanguage() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'ru' || saved === 'en') return saved;
  } catch { /* Storage may be disabled. */ }
  return navigator.language.startsWith('ru') ? 'ru' : 'en';
}

async function loadTranslations() {
  if (!translationsReady) translationsReady = Promise.all(['ru', 'en'].map(async lang => {
    try {
      const response = await fetch(`/locales/${lang}.json`, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Translations: ${response.status}`);
      const { content, ...named } = await response.json();
      translations[lang] = flattenTranslations(named);
      if (lang === 'en') contentTranslations = content || {};
    } catch (error) {
      console.error(`Could not load ${lang} translations`, error);
    }
  }));
  return translationsReady;
}

function translateContent(value, lang) {
  const key = normalizeText(value);
  if (lang !== 'en' || !Object.hasOwn(contentTranslations, key)) return value;
  return value.replace(/\S[\s\S]*\S|\S/, contentTranslations[key]);
}

function loadLanguage(language) {
  const lang = language === 'en' ? 'en' : 'ru';
  document.documentElement.lang = lang;
  // Translate individual text nodes to preserve links, SVG icons and emphasis.
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement.closest('script, style, pre, code, [data-i18n], [data-no-i18n]')) continue;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    node.nodeValue = translateContent(originalText.get(node), lang);
  }
  document.querySelectorAll('[alt], [placeholder], [aria-label], [title], meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]').forEach(el => {
    if (!originalAttributes.has(el)) {
      const values = {};
      for (const attribute of ['alt', 'placeholder', 'aria-label', 'title', 'content']) {
        if (el.hasAttribute(attribute)) values[attribute] = el.getAttribute(attribute);
      }
      originalAttributes.set(el, values);
    }
    for (const [attribute, value] of Object.entries(originalAttributes.get(el))) {
      el.setAttribute(attribute, translateContent(value, lang));
    }
  });
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const value = getTranslation(lang, el.dataset.i18n);
    if (value) el.textContent = value;
  });
  document.querySelectorAll('.lang-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.lang === lang);
    button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
  });
}

function getTranslation(lang, key) {
  return translations[lang]?.[key] || null;
}

function flattenTranslations(obj, prefix = '') {
  const flat = {};
  for (const [key, value] of Object.entries(obj || {})) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) Object.assign(flat, flattenTranslations(value, name));
    else flat[name] = value;
  }
  return flat;
}
