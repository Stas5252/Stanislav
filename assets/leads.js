/* Privacy-aware analytics and a one-step Telegram message draft. No public bot tokens. */
(() => {
  'use strict';
  const config = window.SITE_CONFIG || {};
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const UTM_STORAGE = 'stanislavweb.attribution.v1';
  const CONSENT_STORAGE = 'stanislavweb.analytics.v1';
  const EVENTS = new Set(['hero_cta', 'audit_contact', 'audit_copy', 'service_click', 'project_open', 'brief_start', 'brief_prepare', 'telegram_click', 'email_click', 'phone_click']);
  const PAGES = new Set(['/', '/landing/', '/expert-site/', '/business-site/', '/website-cost/', '/website-redesign/', '/website-audit/', '/event-venue-website/', '/guide/technical-brief/', '/guide/landing-or-multipage/', '/guide/website-launch-checklist/', '/work/kristina-dimond/', '/work/n7/', '/work/rivera-hall/', '/privacy.html', '/consent.html']);
  const pagePath = PAGES.has(location.pathname) ? location.pathname : '/';
  const safeUtm = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(value) ? value : '';
  const filterUtm = input => Object.fromEntries(UTM_KEYS.map(key => [key, safeUtm(input?.[key])]).filter(([, value]) => value));
  let attribution = {};
  try { attribution = filterUtm(JSON.parse(sessionStorage.getItem(UTM_STORAGE) || '{}')); } catch { /* Storage is optional. */ }
  const incoming = filterUtm(Object.fromEntries(new URLSearchParams(location.search)));
  if (Object.keys(incoming).length) {
    // Keep the latest explicitly tagged visit as one coherent campaign, not a merge of campaigns.
    attribution = incoming;
    try { sessionStorage.setItem(UTM_STORAGE, JSON.stringify(attribution)); } catch { /* The brief still works. */ }
  }

  const counterId = Number(config.metrikaId);
  const localHost = /^(localhost|127\.|\[?::1\]?$)/.test(location.hostname);
  const configured = config.analyticsEnabled === true && Number.isSafeInteger(counterId) && counterId > 0
    && !localHost && (config.analyticsHosts || []).includes(location.hostname);
  let consent = null;
  let analyticsActive = false;
  let analyticsLoading = false;
  let metrikaScript = null;
  let banner = null;
  let settingsTrigger = null;
  let briefEngaged = false;
  let briefStartQueued = false;
  // Analytics must never interrupt the contact flow, even when an extension blocks it.
  function sendAnalytics(...args) {
    try { window.ym(...args); return true; } catch { return false; }
  }
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_STORAGE) || 'null');
    if (saved && ['granted', 'denied'].includes(saved.value) && Number.isFinite(saved.time)
      && Date.now() - saved.time >= 0 && Date.now() - saved.time < 180 * 86400000) consent = saved.value;
  } catch { /* With blocked storage, the choice lasts for this page only. */ }

  function initialiseCounter() {
    if (!configured || consent !== 'granted' || analyticsActive || typeof window.ym !== 'function') return;
    const initialised = sendAnalytics(counterId, 'init', {
      defer: true, webvisor: false, clickmap: false, trackLinks: false,
      accurateTrackBounce: false, trackHash: false, sendTitle: false,
      ecommerce: false, disableYtm: true
    });
    if (!initialised) return;
    analyticsActive = true;
    // Only validated campaign labels and the external referrer origin are sent.
    // Arbitrary URL parameters, fragments, referrer paths and form values stay private.
    const visitUrl = new URL(pagePath, location.origin);
    for (const [key, value] of Object.entries(attribution)) visitUrl.searchParams.set(key, value);
    let referrerOrigin = '';
    try {
      const referrer = new URL(document.referrer);
      if (['https:', 'http:'].includes(referrer.protocol) && referrer.origin !== location.origin) referrerOrigin = referrer.origin + '/';
    } catch { /* Direct visits have no referrer. */ }
    sendAnalytics(counterId, 'hit', visitUrl.href, {
      title: 'StanislavWeb', referer: referrerOrigin, params: {page: pagePath, ...attribution}
    });
    queueBriefStart();
  }

  function loadAnalytics() {
    if (!configured || consent !== 'granted' || analyticsActive) return;
    if (metrikaScript?.dataset.loaded === 'true') { initialiseCounter(); return; }
    if (analyticsLoading) return;
    analyticsLoading = true;
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    metrikaScript = document.createElement('script');
    metrikaScript.async = true;
    metrikaScript.src = 'https://mc.yandex.ru/metrika/tag.js';
    metrikaScript.referrerPolicy = 'no-referrer';
    metrikaScript.onload = () => {
      analyticsLoading = false;
      metrikaScript.dataset.loaded = 'true';
      initialiseCounter();
    };
    metrikaScript.onerror = () => {
      analyticsLoading = false;
      metrikaScript.remove();
      metrikaScript = null;
      // Tracker failures never block navigation, the brief or the contact links.
    };
    document.head.append(metrikaScript);
  }

  function track(name) {
    if (!EVENTS.has(name) || consent !== 'granted' || !analyticsActive || !configured) return false;
    return sendAnalytics(counterId, 'reachGoal', name, {page: pagePath, ...attribution});
  }

  function queueBriefStart() {
    if (briefEngaged && !briefStartQueued) briefStartQueued = track('brief_start');
  }

  function setConsent(value) {
    consent = value;
    try { localStorage.setItem(CONSENT_STORAGE, JSON.stringify({value, time: Date.now()})); } catch { /* Choice stays in memory. */ }
    if (value === 'granted') loadAnalytics();
    else {
      analyticsActive = false;
      const counter = window['yaCounter' + counterId];
      if (counter && typeof counter.destruct === 'function') {
        try { counter.destruct(); } catch { /* Contact remains available. */ }
      } else if (typeof window.ym === 'function') sendAnalytics(counterId, 'destruct');
    }
    if (banner) banner.hidden = true;
    settingsTrigger?.focus({preventScroll: true});
  }

  function showConsent() {
    if (!configured) return;
    if (!banner) {
      banner = document.createElement('section');
      banner.className = 'analytics-notice';
      banner.setAttribute('aria-label', 'Настройки аналитики');
      banner.style.cssText = 'position:fixed;z-index:1100;left:16px;right:16px;bottom:16px;max-width:520px;margin:auto;padding:14px 16px;background:#151515;color:#fff;border:1px solid #555;font:12px/1.5 Manrope,system-ui,sans-serif;box-shadow:0 8px 32px #0005';
      const copy = document.createElement('p');
      copy.textContent = 'Разрешить Яндекс.Метрику? Она помогает понять, какие страницы полезны. Запись экрана и содержимое личной переписки не передаются. Отказ не влияет на работу сайта.';
      const policy = document.createElement('a');
      policy.href = '/privacy.html';
      policy.textContent = 'Подробнее о данных';
      policy.style.cssText = 'display:inline-block;margin:6px 0;color:inherit;text-decoration:underline;text-underline-offset:3px';
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
      for (const [label, value] of [['Разрешить', 'granted'], ['Без аналитики', 'denied']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.dataset.analyticsChoice = value;
        button.style.cssText = 'flex:1;min-height:40px;padding:8px 12px;background:#fff;color:#111;border:1px solid #fff;border-radius:0;font:600 14px Manrope,system-ui,sans-serif;cursor:pointer';
        button.addEventListener('click', () => setConsent(value));
        actions.append(button);
      }
      banner.append(copy, policy, actions);
      document.body.append(banner);
    }
    banner.hidden = false;
  }

  document.querySelectorAll('[data-analytics-settings]').forEach(link => {
    link.hidden = !configured;
    link.addEventListener('click', event => {
      event.preventDefault();
      settingsTrigger = link;
      showConsent();
      banner?.querySelector('button')?.focus();
    });
  });
  if (configured) {
    if (consent === 'granted') loadAnalytics();
    else if (consent === null) showConsent();
  }

  document.addEventListener('click', event => {
    const marked = event.target.closest?.('[data-event]');
    if (marked && EVENTS.has(marked.dataset.event)) { track(marked.dataset.event); return; }
    const anchor = event.target.closest?.('a[href]');
    if (!anchor) return;
    const url = new URL(anchor.href, location.href);
    if (url.hostname === 't.me') track('telegram_click');
    else if (url.protocol === 'mailto:') track('email_click');
    else if (url.protocol === 'tel:') track('phone_click');
  });

  const form = document.querySelector('form[data-brief]');
  if (!form) return;
  const task = form.elements.namedItem('task');
  const taskError = form.querySelector('[data-brief-error]');
  const status = form.querySelector('[data-brief-status]');
  const username = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(config.telegramUsername || '') ? config.telegramUsername : 'Butov52';
  if (!task) return;
  form.noValidate = true;
  form.addEventListener('focusin', () => { briefEngaged = true; queueBriefStart(); });

  task.addEventListener('input', () => {
    task.setCustomValidity('');
    task.removeAttribute('aria-invalid');
    if (taskError) { taskError.hidden = true; taskError.textContent = ''; }
  });
  const value = name => {
    const field = form.elements.namedItem(name);
    return typeof field?.value === 'string' ? field.value.trim() : '';
  };
  const limitText = (value, max) => Array.from(value).slice(0, max).join('');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const error = task.value.trim().length < 10
      ? 'Опишите задачу чуть подробнее — хотя бы 10 символов.' : '';
    task.setCustomValidity(error);
    task.setAttribute('aria-invalid', String(Boolean(error)));
    if (taskError) { taskError.hidden = !error; taskError.textContent = error; }
    if (!form.reportValidity()) { if (status) status.textContent = 'Проверьте описание задачи.'; return; }
    const name = limitText(value('name'), 80);
    const lines = ['Здравствуйте, Станислав!'];
    if (name) lines.push('Меня зовут ' + name + '.');
    lines.push('Нужен: ' + (value('service') || 'Помогите выбрать формат') + '.');
    lines.push('Бюджет: ' + (value('budget') || 'Пока не определился') + '.');
    lines.push('', 'Задача: ' + limitText(value('task'), 2000));
    // Telegram deep links prefill a draft; only the visitor can send it.
    const target = 'https://t.me/' + username + '?text=' + encodeURIComponent(lines.join('\\n'));
    track('brief_prepare');
    if (status) status.textContent = 'Открываем Telegram. Нажмите «Отправить» в чате.';
    window.location.assign(target);
  });
})();
