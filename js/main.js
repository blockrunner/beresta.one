// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация языка
    const defaultLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
    loadLanguage(defaultLang);


    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});