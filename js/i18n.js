let translations = {
  en: {
    "nav.technology": "Technology",
    "nav.applications": "Applications", 
    "nav.prototype": "Prototype",
    "nav.app": "App",
    "nav.team": "Team",
    "nav.participation": "Participation"
  },
  ru: {
    "nav.technology": "Технология",
    "nav.applications": "Применение",
    "nav.prototype": "Прототип", 
    "nav.app": "App",
    "nav.team": "Команда",
    "nav.participation": "Участие"
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
      translations.ru = { ...translations.ru, ...ruData };
    }
    
    if (enResponse.ok) {
      const enData = await enResponse.json();
      translations.en = { ...translations.en, ...enData };
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
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    } else {
      el.textContent = key;
    }
  });
}