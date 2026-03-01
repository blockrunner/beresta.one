let translations = {
  en: {
    "nav.technology": "Technology",
    "nav.applications": "Applications", 
    "nav.prototype": "Prototype",
    "nav.app": "App",
    "nav.team": "Team",
    "nav.participation": "Participation",
    "nav.designGuide": "Design Guide"
  },
  ru: {
    "nav.technology": "Технология",
    "nav.applications": "Применение",
    "nav.prototype": "Прототип", 
    "nav.app": "App",
    "nav.team": "Команда",
    "nav.participation": "Участие",
    "nav.designGuide": "Дизайн-гайд"
  }
};

// Загружаем переводы из файлов
async function loadTranslations() {
  try {
    const [ruResponse, enResponse] = await Promise.all([
      fetch('/locales/ru.json'),
      fetch('/locales/en.json')
    ]);
    
    if (ruResponse.ok) {
      const ruData = await ruResponse.json();
      translations.ru = { ...translations.ru, ...flattenTranslations(ruData) };
    }
    
    if (enResponse.ok) {
      const enData = await enResponse.json();
      translations.en = { ...translations.en, ...flattenTranslations(enData) };
    }
  } catch (error) {
    console.error('Error loading translations:', error);
    // Используем fallback переводы
  }
}

function loadLanguage(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = getTranslation(lang, key);
    if (translated) {
      el.textContent = translated;
    }
  });
}

function getTranslation(lang, key) {
  const langDict = translations[lang];
  if (!langDict || !key) return null;
  return langDict[key] || null;
}

function flattenTranslations(obj, prefix = '') {
  const flat = {};

  Object.entries(obj || {}).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;

    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(flat, flattenTranslations(v, key));
    } else {
      flat[key] = v;
    }
  });

  return flat;
}