/* A local brief and opt-in analytics. There is deliberately no lead endpoint. */
(() => {
  'use strict';
  const config = window.SITE_CONFIG || {};
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const UTM_STORAGE = 'stanislavweb.attribution.v1';
  const CONSENT_STORAGE = 'stanislavweb.analytics.v1';
  const EVENTS = new Set(['hero_cta', 'service_click', 'project_open', 'brief_start', 'brief_prepare', 'telegram_click', 'email_click', 'phone_click']);
  const PAGES = new Set(['/', '/landing/', '/expert-site/', '/business-site/', '/work/kristina-dimond/', '/work/n7/', '/work/rivera-hall/', '/privacy.html', '/consent.html']);
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
      banner.style.cssText = 'position:fixed;z-index:1100;left:16px;right:16px;bottom:16px;max-width:630px;margin:auto;padding:22px;background:#151515;color:#fff;border:1px solid #555;font:14px/1.5 Manrope,system-ui,sans-serif;box-shadow:0 8px 32px #0005';
      const copy = document.createElement('p');
      copy.textContent = 'Разрешить Яндекс.Метрику? Она помогает понять, какие страницы полезны. Запись экрана и содержимое брифа не передаются. Отказ не влияет на работу сайта.';
      const policy = document.createElement('a');
      policy.href = '/privacy.html';
      policy.textContent = 'Подробнее о данных';
      policy.style.cssText = 'display:inline-block;margin:10px 0;color:inherit;text-decoration:underline;text-underline-offset:3px';
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
      for (const [label, value] of [['Разрешить', 'granted'], ['Без аналитики', 'denied']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.dataset.analyticsChoice = value;
        button.style.cssText = 'flex:1;min-height:44px;padding:10px 16px;background:#fff;color:#111;border:1px solid #fff;border-radius:0;font:600 14px Manrope,system-ui,sans-serif;cursor:pointer';
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
  const briefRoot = form.closest('[data-brief-root]') || form.parentElement;
  const steps = [...form.querySelectorAll('fieldset[data-brief-step]')];
  const result = document.querySelector('[data-brief-result]');
  const message = result?.querySelector('[data-brief-message]');
  const telegram = result?.querySelector('[data-brief-telegram]');
  const email = result?.querySelector('[data-brief-email]');
  const status = result?.querySelector('[data-brief-status]');
  const submit = form.querySelector('[type="submit"]');
  const next = form.querySelector('[data-brief-next]');
  const back = form.querySelector('[data-brief-back]');
  const task = form.elements.namedItem('task');
  const taskError = form.querySelector('[data-brief-error]');
  const username = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(config.telegramUsername || '') ? config.telegramUsername : 'Butov52';
  if (steps.length !== 2 || !task || !result || !message || !telegram || !submit) return;
  let currentStep = 1;
  form.noValidate = true;
  submit.disabled = false;
  if (next) next.disabled = false;
  form.addEventListener('focusin', () => { briefEngaged = true; queueBriefStart(); });

  function hideResult() {
    result.hidden = true;
    if (briefRoot) delete briefRoot.dataset.briefReady;
  }
  form.addEventListener('input', hideResult);
  form.addEventListener('change', hideResult);

  function showStep(number, focus = true) {
    hideResult();
    currentStep = number;
    for (const step of steps) {
      const active = Number(step.dataset.briefStep) === number;
      step.hidden = !active;
      step.disabled = !active;
    }
    form.dataset.currentStep = String(number);
    document.querySelectorAll('[data-brief-indicator]').forEach(el => {
      el.textContent = number === 1 ? '01 / Задача' : '02 / Детали';
    });
    if (focus) steps.find(step => Number(step.dataset.briefStep) === number)?.querySelector('input,select,textarea,button')?.focus({preventScroll: true});
  }

  function validateStep(number) {
    const step = steps.find(item => Number(item.dataset.briefStep) === number);
    if (number === 1) {
      const error = task.value.trim().length < 10 ? 'Расскажите о задаче чуть подробнее — хотя бы 10 символов.' : '';
      task.setCustomValidity(error);
      task.setAttribute('aria-invalid', String(Boolean(error)));
      if (taskError) { taskError.textContent = error; taskError.hidden = !error; }
    }
    const invalid = [...step.querySelectorAll('input,select,textarea')].find(field => !field.checkValidity());
    if (invalid) { invalid.focus(); invalid.reportValidity(); return false; }
    return true;
  }

  function advance() {
    if (validateStep(1)) showStep(2);
  }
  next?.addEventListener('click', advance);
  back?.addEventListener('click', () => showStep(1));
  task.addEventListener('input', () => {
    task.setCustomValidity('');
    task.removeAttribute('aria-invalid');
    if (taskError) { taskError.hidden = true; taskError.textContent = ''; }
  });
  // Fieldsets are disabled for native validation; read each field directly to retain step one.
  const value = name => {
    const field = form.elements.namedItem(name);
    return typeof field?.value === 'string' ? field.value.trim() : '';
  };
  const limitText = (text, limit) => Array.from(text).slice(0, limit).join('').replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '\uFFFD');
  message.maxLength = 2600;
  function syncTelegram() {
    const text = limitText(message.value, 2600);
    if (message.value !== text) message.value = text;
    telegram.href = 'https://t.me/' + username + '?text=' + encodeURIComponent(text);
    telegram.target = '_blank';
    telegram.rel = 'noopener noreferrer';
    if (email) email.href = 'mailto:butov.stanislav.dev@gmail.com?subject=' + encodeURIComponent('Обсудить сайт — StanislavWeb') + '&body=' + encodeURIComponent(text);
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (currentStep === 1) { advance(); return; }
    if (!validateStep(2)) return;
    const name = limitText(value('name'), 80);
    message.value = ['Здравствуйте, Станислав!', name ? `Меня зовут ${name}.` : '',
      `Нужен: ${value('service') || 'Помогите выбрать формат'}.`,
      `Бюджет: ${value('budget') || 'Пока не определился'}.`,
      '', `Задача: ${limitText(value('task'), 2000)}`].filter((line, index, lines) => line || (index > 0 && lines[index - 1])).join('\n');
    syncTelegram();
    result.hidden = false;
    if (briefRoot) briefRoot.dataset.briefReady = 'true';
    if (status) status.textContent = 'Черновик готов. Сообщение ещё не отправлено.';
    track('brief_prepare');
    const heading = result.querySelector('h2,h3');
    if (heading) { heading.tabIndex = -1; heading.focus({preventScroll: true}); }
    result.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'nearest'});
  });
  result.querySelector('[data-brief-edit]')?.addEventListener('click', () => showStep(1));
  message.addEventListener('input', syncTelegram);
  result.querySelector('[data-brief-copy]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(message.value);
      if (status) status.textContent = 'Скопировано. Вставьте текст в Telegram и отправьте сообщение.';
    } catch {
      message.focus(); message.select();
      if (status) status.textContent = 'Выделили текст: скопируйте его вручную и отправьте в Telegram.';
    }
  });
  showStep(1, false);
})();
