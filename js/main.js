// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация языка
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.getElementById(this.getAttribute('href').slice(1));
            if (!target) return;
            target.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
