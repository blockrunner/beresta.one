// Ждем загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadComponents);
} else {
  loadComponents();
}

async function loadComponents() {
  console.log('Starting component loading...');
  
  try {
    // Сначала загружаем переводы
    if (typeof loadTranslations === 'function') {
      await loadTranslations();
      console.log('Translations loaded');
    }
    
    // Проверяем, есть ли контейнер для шапки
    const headerContainer = document.getElementById('header-container');
    
    if (headerContainer) {
      console.log('Loading header into container');
      // Загрузка в контейнер (для основных страниц сайта)
      const headerResponse = await fetch('/components/header.html', { cache: 'no-cache' });
      if (!headerResponse.ok) {
        throw new Error('Failed to load header: ' + headerResponse.status);
      }
      const headerData = await headerResponse.text();
      headerContainer.innerHTML = headerData;
      initHeader();
    } else {
      console.log('Loading header into body');
      // Загрузка напрямую в body (для приложения)
      const headerResponse = await fetch('/components/header.html', { cache: 'no-cache' });
      if (!headerResponse.ok) {
        throw new Error('Failed to load header: ' + headerResponse.status);
      }
      const headerData = await headerResponse.text();
      document.body.insertAdjacentHTML('afterbegin', headerData);
      initHeader();
    }
    
    // Загрузка футера
    const footerResponse = await fetch('/components/footer.html', { cache: 'no-cache' });
    if (!footerResponse.ok) {
      throw new Error('Failed to load footer: ' + footerResponse.status);
    }
    const footerData = await footerResponse.text();
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) footerContainer.innerHTML = footerData;
    else document.body.insertAdjacentHTML('beforeend', footerData);
    initFooter();
    
    // Применяем переводы
    const savedLang = getPreferredLanguage();
    if (typeof loadLanguage === 'function') {
      loadLanguage(savedLang);
      console.log('Language applied:', savedLang);
    }
    
    console.log('Components loaded successfully');
  } catch (error) {
    console.error('Error loading components:', error);
  }
}

function initHeader() {
  // Инициализация мобильного меню
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      toggle.setAttribute('aria-expanded', String(nav.classList.contains('active')));
    });
  }

  // Инициализация переключателя языка
  const langSwitcher = document.querySelector('.language-switcher');
  if (langSwitcher) {
    langSwitcher.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const lang = e.target.dataset.lang;
        try { localStorage.setItem('lang', lang); } catch { /* Storage may be disabled. */ }
        loadLanguage(lang);
      }
    });
  }
}

function initFooter() {
  // Инициализация соц. иконок (если нужно)
  document.querySelectorAll('.social-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      // Трекинг кликов
    });
  });
}
