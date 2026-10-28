const express = require('express');
const rateLimit = require('express-rate-limit');

const roles = new Set(['tester', 'developer', 'investor', 'ambassador']);

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_LEAD_CHAT_ID;
  if (!token || !chatId) return { ok: false, configured: false };
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10000)
    });
    const result = await response.json();
    return { ok: response.ok && result.ok === true, configured: true };
  } catch {
    return { ok: false, configured: true };
  }
}

function createParticipationRouter({ notify = sendTelegram } = {}) {
  const router = express.Router();
  router.use(rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'too_many_requests' }
  }));
  router.post('/', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const body = req.body || {};
    const fields = ['name', 'email', 'role', 'telegram', 'message'];
    const limits = { name: 100, email: 254, role: 20, telegram: 100, message: 2000 };
    const data = {};
    for (const field of fields) {
      if (body[field] !== undefined && typeof body[field] !== 'string') {
        return res.status(400).json({ error: 'invalid_fields' });
      }
      data[field] = (body[field] || '').trim();
      if (data[field].length > limits[field]) return res.status(400).json({ error: 'invalid_fields' });
    }
    if (body.website || !data.name || /[\r\n]/.test(data.name) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !roles.has(data.role)) {
      return res.status(400).json({ error: 'invalid_fields' });
    }
    const text = [
      'Новая заявка — Beresta (beresta.one)',
      `Имя: ${data.name}`,
      `Email: ${data.email}`,
      `Роль: ${data.role}`,
      `Telegram: ${data.telegram || '—'}`,
      `О себе:\n${data.message || '—'}`
    ].join('\n');
    const result = await notify(text);
    if (!result.ok) return res.status(result.configured ? 502 : 503).json({ error: 'delivery_unavailable' });
    res.json({ ok: true });
  });
  return router;
}

module.exports = { createParticipationRouter };
