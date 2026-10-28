/* global getTranslation */
(() => {
  const form = document.getElementById('partForm');
  if (!form) return;
  const button = form.querySelector('[type="submit"]');
  const error = document.getElementById('form-error');
  const message = key => typeof getTranslation === 'function'
    ? getTranslation(document.documentElement.lang, key) : null;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled || !form.reportValidity()) return;
    error.hidden = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    button.dataset.i18n = 'form.sending';
    button.textContent = message('form.sending') || 'Отправляем…';
    try {
      const response = await fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: AbortSignal.timeout(15000)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) {
        throw new Error(response.status === 429 ? 'form.rateLimit' : 'form.error');
      }
      document.getElementById('form-body').hidden = true;
      const success = document.getElementById('form-success');
      success.hidden = false;
      success.style.display = 'block';
      success.focus();
      form.reset();
    } catch (failure) {
      const key = failure.message === 'form.rateLimit' ? 'form.rateLimit' : 'form.error';
      error.dataset.i18n = key;
      error.textContent = message(key) || 'Не удалось отправить заявку. Попробуйте ещё раз или напишите contact@beresta.one.';
      error.hidden = false;
      error.focus();
    } finally {
      button.disabled = false;
      button.dataset.i18n = 'form.submit';
      button.textContent = message('form.submit') || 'Отправить заявку';
      form.removeAttribute('aria-busy');
    }
  });
})();
