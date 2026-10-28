/* Public page text review — not a technical SEO, speed or security scan. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const form = $('instantAuditForm'), input = $('instantAuditUrl');
  const button = $('instantAuditSubmit'), status = $('instantAuditStatus');
  const result = $('instantAuditResult'), heading = $('instantAuditHeading');
  const intro = $('instantAuditLead'), issues = $('instantAuditFindings');
  const foundBox = $('instantAuditFound'), foundList = $('instantAuditFoundList');
  const telegram = $('instantAuditTelegram'), email = $('instantAuditEmail');
  const visit = $('instantAuditVisit'), copy = $('instantAuditCopy');
  const copyStatus = $('instantAuditCopyStatus'), fallback = $('instantAuditFallback');
  const fallbackLink = $('instantAuditFallbackTelegram');
  if (![form,input,button,status,result,heading,intro,issues,foundBox,foundList,telegram,email,visit,copy,copyStatus,fallback,fallbackLink].every(Boolean)) return;

  let report = '', inFlight = false;

  function normalize(raw) {
    let value = raw.trim();
    if (value.length < 4 || value.length > 320) throw Error('Введите адрес сайта, например example.ru.');
    if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
    let url;
    try { url = new URL(value); } catch { throw Error('Проверьте адрес. Пример: https://example.ru'); }
    const h = url.hostname.toLowerCase();
    if (!['http:','https:'].includes(url.protocol) || url.username || url.password ||
      !h.includes('.') || h.includes(':') || url.port || /^(\d{1,3}\.){3}\d{1,3}$/.test(h) ||
      /\.(local|internal|localhost|test|invalid)$/i.test(h) ||
      /^(localhost|0|0x[0-9a-f]+)$/i.test(h) || url.pathname.length > 180) {
      throw Error('Нужна ссылка на публичный сайт с обычным доменом.');
    }
    // Never send tracking parameters, login tokens or fragments to the text reader.
    return url.origin + url.pathname;
  }

  function assess(extracted) {
    if (!/<(?:html|head|body)(?:\s|>)/i.test(extracted)) {
      throw Error('Не удалось получить структуру страницы. Попробуйте другую ссылку.');
    }
    // Inert document: inspect elements without inserting untrusted HTML into our page.
    const doc = new DOMParser().parseFromString(extracted,'text/html');
    const main = doc.querySelector('main') || doc.body;
    if (!main || (main.textContent || '').length < 110) {
      throw Error('На странице недостаточно доступного содержания для проверки.');
    }
    const visible = main.cloneNode(true);
    visible.querySelectorAll('script,style,noscript,svg').forEach(el=>el.remove());
    const text = (visible.textContent || '').replace(/\s+/g,' ').trim();
    const title = (doc.querySelector('head title')?.textContent || '').trim();
    const description = (doc.querySelector('head meta[name="description"]')?.getAttribute('content') || '').trim();
    const h1 = [...doc.querySelectorAll('h1')].map(el=>el.textContent.trim()).filter(Boolean);
    const robots = [...doc.querySelectorAll('meta[name="robots"],meta[name="googlebot"],meta[name="yandex"]')]
      .map(x=>x.getAttribute('content')||'').join(' ').toLowerCase();
    const links = [...doc.querySelectorAll('a[href]')];
    const hasContact = links.some(el=>/^(?:tel:|mailto:|https?:\/\/(?:t\.me|telegram\.me|wa\.me|api\.whatsapp\.com|vk\.com)\/)/i.test(el.getAttribute('href')||''))
      || /(?:телефон|почта|номер для связи|контакты|напишите нам|contact us)/i.test((doc.querySelector('footer')?.textContent || '').slice(0,2200));
    const actions = [...main.querySelectorAll('a,button,input[type="submit"],input[type="button"]')]
      .map(el=>((el.textContent || el.getAttribute('value') || '') + ' ' + (el.getAttribute('aria-label')||'')).replace(/\s+/g,' ').trim());
    const hasAction = actions.some(t=>/(?:заказ|запис|обсуд|куп|отправ|оставить заявку|оформить|рассчит|брон|начать проект|contact us|book|request quote|buy now|order now|get started)/i.test(t));
    const hasPrice = /(?:\d[\d\s\u00a0]{0,9}\s*(?:₽|руб(?:\.|лей)?|р\.)|стоимост|цены|цена|тариф|прайс|расч[её]т|сколько стоит|pricing|price|plans|quote)/i.test(text);
    const hasProof = /(?:портфолио|отзыв|кейс|выполненн|наши работы|реальные проекты|сертификат|testimonial|portfolio|case stud|reviews|our work)/i.test(text)
      || !!main.querySelector('[class*="project-card"],[class*="portfolio"],[id="work"]');
    const hasMainHeading = h1.length > 0 && !/^(?:главная|добро пожаловать|home|welcome|привет)$/i.test(h1[0]);
    const hasViewport = !!doc.querySelector('head meta[name="viewport"]');
    const isIndexBlocked = /(?:^|[\s,])noindex(?:[\s,]|$)/i.test(robots);

    const checks = [
      {
        ok: !isIndexBlocked,
        problem: 'Страница закрыта от поисковиков',
        reason: 'В коде найден запрет noindex — поисковикам предлагается не показывать эту страницу.',
        advice: 'Если страницу должны находить в поиске, проверьте и уберите этот запрет.',
        positive: 'Нет явного запрета noindex'
      },
      {
        ok: hasAction,
        problem: 'Не нашёл заметного действия для клиента',
        reason: 'Среди ссылок и кнопок не удалось обнаружить понятную запись, заказ или запрос расчёта.',
        advice: 'Добавьте кнопку «Заказать», «Записаться» или «Узнать стоимость» в подходящем месте.',
        positive: 'В коде есть кнопка или ссылка для обращения'
      },
      {
        ok: hasContact,
        problem: 'Не нашёл прямых контактов',
        reason: 'В полученной странице нет ссылки на телефон, почту или привычный мессенджер.',
        advice: 'Добавьте удобный способ связи, который работает и на телефоне.',
        positive: 'Есть ссылка на телефон, почту или мессенджер'
      },
      {
        ok: !!title,
        problem: 'У страницы нет названия во вкладке',
        reason: 'Не найден тег title — это название, которое видит браузер и может использовать поисковик.',
        advice: 'Добавьте короткое название с услугой и названием компании.',
        positive: 'У страницы есть название'
      },
      {
        ok: !!description,
        problem: 'Не заполнено описание для поиска',
        reason: 'В коде нет meta description с кратким описанием страницы.',
        advice: 'В двух предложениях опишите услугу и пользу для посетителя.',
        positive: 'Есть описание страницы для поиска'
      },
      {
        ok: hasMainHeading,
        problem: 'Не нашёл понятного главного заголовка',
        reason: 'Главный заголовок отсутствует или слишком общий.',
        advice: 'Сразу объясните, чем занимается компания и что можно заказать.',
        positive: 'Есть главный заголовок'
      },
      {
        ok: hasPrice,
        problem: 'Не увидел информацию о стоимости',
        reason: 'В тексте страницы не удалось найти цену, тариф или объяснение расчёта.',
        advice: 'Укажите стартовую цену либо объясните, как получить смету.',
        positive: 'В тексте есть цена или объяснение расчёта'
      },
      {
        ok: hasProof,
        problem: 'Не увидел примеры работ или отзывы',
        reason: 'В доступном содержании не нашёл очевидных подтверждений опыта.',
        advice: 'Покажите настоящие работы, фотографии или отзывы с разрешения клиентов.',
        positive: 'Есть раздел работ или упоминание отзывов'
      },
      {
        ok: hasViewport,
        problem: 'Не нашёл настройки для мобильных экранов',
        reason: 'Не найден тег viewport. Из-за этого на телефонах страница может отображаться некорректно.',
        advice: 'Проверьте мобильную адаптацию и viewport в коде.',
        positive: 'Есть настройка отображения на телефонах'
      }
    ];
    return {title,checks};
  }

  function item(tag, title, body) {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = title;
    const p = document.createElement('p');
    p.textContent = body;
    li.append(strong,p);
    return li;
  }

  function contactLink(url, lines) {
    const message = 'Здравствуйте! Хочу обсудить сайт: ' + url +
      '\n\nПосле проверки стоит посмотреть:\n' +
      (lines.length ? lines.slice(0,3).map((x,i) => (i+1) + '. ' + x.problem).join('\n') : 'Основные страницы, мобильную версию и работу заявок.');
    return 'https://t.me/Butov52?text=' + encodeURIComponent(message.slice(0,1100));
  }

  function show(url, extracted) {
    const {title,checks} = assess(extracted);
    const missing = checks.filter(x=>!x.ok).slice(0,4);
    const positive = checks.filter(x=>x.ok).slice(0,4);

    heading.textContent = 'Что проверить на ' + new URL(url).hostname;
    intro.textContent = missing.length
      ? 'В полученной странице есть моменты, которые стоит исправить или проверить:'
      : 'По доступной структуре основные элементы на месте. Осталось проверить сайт на телефоне и убедиться, что заявки действительно приходят.';
    issues.replaceChildren();
    for (const check of missing) {
      issues.append(item('li',check.problem,check.advice + ' ' + check.reason));
    }
    if (!missing.length) {
      issues.append(item('li','Проверьте, доходят ли заявки',
        'Откройте сайт с телефона, оставьте тестовое обращение и убедитесь, что сообщение получено.'));
    }
    foundList.replaceChildren();
    for (const check of positive) {
      const li = document.createElement('li');
      li.textContent = check.positive;
      foundList.append(li);
    }
    foundBox.hidden = positive.length === 0;

    const lines = missing.length ? missing : [{problem:'Проверить мобильную версию и получение заявок'}];
    report = 'Предварительная проверка структуры страницы\n' + url + '\n' +
      (title ? 'Название: ' + title.slice(0,130) + '\n' : '') +
      '\nЧто стоит проверить:\n' +
      lines.map((x,i)=>(i+1)+'. '+x.problem+(x.advice?'. '+x.advice:'')).join('\n') +
      '\n\nВыводы по доступному HTML, без проверки скорости и доставки заявок.';
    telegram.href = contactLink(url,missing);
    email.href = 'mailto:butov.stanislav.dev@gmail.com?subject='+
      encodeURIComponent('Разбор сайта: ' + new URL(url).hostname) +
      '&body=' + encodeURIComponent(report.slice(0,2200));
    visit.href = url;
    fallback.hidden = true;
    result.hidden = false;
    copyStatus.textContent = '';
    status.textContent = 'Готово — проверены доступные элементы одной страницы.';
    result.scrollIntoView({behavior:'smooth',block:'start'});
  }

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if (inFlight) return;
    let url;
    try { url = normalize(input.value); }
    catch (err) { status.textContent = err.message; input.focus(); return; }

    input.value = url;
    result.hidden = true;
    fallback.hidden = true;
    copyStatus.textContent = '';
    inFlight = true;
    button.disabled = true;
    button.textContent = 'Проверяю сайт…';
    status.textContent = 'Проверяю открытые заголовки, кнопки, контакты и содержание.';
    const ctl = new AbortController();
    const timer = setTimeout(()=>ctl.abort(),26000);
    try {
      const response = await fetch('https://r.jina.ai/'+url, {headers:{Accept:'text/plain','X-Respond-With':'html'},signal:ctl.signal});
      if (response.status === 429) throw Error('Сервис проверки сейчас перегружен.');
      if (!response.ok) throw Error('Сайт не удалось прочитать автоматически.');
      show(url,(await response.text()).slice(0,240000));
    } catch(err) {
      const msg = err.name === 'AbortError' ? 'Проверка заняла слишком много времени.' :
        err instanceof TypeError ? 'Не удалось подключиться к сервису проверки.' : err.message;
      status.textContent = msg + ' Можно прислать ссылку мне — посмотрю вручную.';
      fallbackLink.href = contactLink(url,[]);
      fallback.hidden = false;
    } finally {
      clearTimeout(timer);
      inFlight = false;
      button.disabled = false;
      button.textContent = 'Проверить сайт';
    }
  });

  copy.addEventListener('click',async()=>{
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      copyStatus.textContent = 'Результат скопирован.';
    } catch {
      copyStatus.textContent = 'Копирование недоступно. Можете отправить разбор по email.';
    }
  });
})();