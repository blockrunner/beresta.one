document.addEventListener('DOMContentLoaded', async function () {
  // Сначала загружаем переводы
  await loadTranslations();
  
  // Загрузка шапки
  fetch('/components/header.html')
    .then(response => response.text())
    .then(data => {
      document.body.insertAdjacentHTML('afterbegin', data);
      initHeader(); // инициализируем меню и переключатель
    })
    .then(() => {
      // Загрузка футера
      return fetch('/components/footer.html')
        .then(response => response.text())
        .then(data => {
          document.body.insertAdjacentHTML('beforeend', data);
          initFooter();

          // Только после полной загрузки: header + footer
          const savedLang = localStorage.getItem('lang') || (navigator.language.startsWith('ru') ? 'ru' : 'en');
          loadLanguage(savedLang);
        });
    });
});

function initHeader() {
  // Инициализация мобильного меню
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  // Инициализация переключателя языка
  const langSwitcher = document.querySelector('.language-switcher');
  if (langSwitcher) {
    langSwitcher.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const lang = e.target.dataset.lang;
        localStorage.setItem('lang', lang);
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
