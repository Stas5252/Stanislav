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
    const title = (extracted.match(/^Title:\s*(.+)$/mi) || [])[1]?.trim() || '';
    const marker = extracted.indexOf('Markdown Content:');
    const body = marker < 0 ? '' : extracted.slice(marker + 'Markdown Content:'.length).trim();
    if (body.length < 110 ||
      /^(access denied|forbidden|blocked|verify you are human|just a moment)/i.test(body.slice(0,100))) {
      throw Error('Не получилось прочитать страницу. Возможно, сайт ограничивает автоматические проверки.');
    }
    const headings = [...body.matchAll(/^#{1,3}\s+(.+)$/gm)].map(m => m[1].replace(/[*_~\[\]]/g,'').trim()).filter(Boolean);
    const hasPrice = /(?:\d[\d\s\u00a0]{0,9}\s*(?:₽|руб(?:\.|лей)?|р\.)|стоимост|цен(?:а|ы|е|у)|прайс|тариф|расч[её]т|сколько стоит|pricing|price|plans|quote|estimate)/i.test(body);
    const hasContact = /(?:mailto:|tel:|t\.me\/|wa\.me\/|контакт|связаться|напишите|позвон|телефон|обратн[а-я]+\s+связ|contact|call us|email us)/i.test(body);
    const hasAction = /(?:заказать|оставить заявку|получить предложение|обсудить|записаться|купить|отправить заявку|оформить заказ|забронировать|запросить расч[её]т|book now|contact us|buy now|get started|request a quote)/i.test(body);
    const hasProof = /(?:портфолио|отзыв|кейсы|кейс(?:ы|ов)?|наши работы|наши проекты|выполненн|клиент[ыа-я]{1,5}\s+(?:нам довер|компании)|сертификат|testimonial|portfolio|case stud|reviews|our work)/i.test(body);
    const top = body.slice(0,1800);
    const hasOffer = /(?:услуг|разработ|прода|производ|достав|заказ|консультац|запис|аренд|ремонт|обучени|магазин|магазин|клиник|фабрик|строител|студи|service|product|shop|store|consult|solutions|design|repair)/i.test(top);
    const checks = [
      {
        ok: hasAction,
        problem: 'Не нашёл понятного шага к заказу',
        reason: 'В доступном тексте не увидел явного приглашения заказать, записаться или получить расчёт.',
        advice: 'Добавьте заметную кнопку с конкретным действием и проверьте, что обращение действительно приходит.',
        positive: 'Есть упоминание заказа или записи'
      },
      {
        ok: hasContact,
        problem: 'Не нашёл способ быстро связаться',
        reason: 'В тексте страницы не удалось обнаружить явный контакт.',
        advice: 'Покажите телефон, мессенджер или почту там, где человек принимает решение.',
        positive: 'В тексте упоминается связь с компанией'
      },
      {
        ok: hasPrice,
        problem: 'Не нашёл цены или способа её узнать',
        reason: 'В извлечённом тексте нет заметного упоминания стоимости, тарифа или расчёта.',
        advice: 'Покажите цену «от» или объясните, как посетитель получит смету.',
        positive: 'Есть информация о ценах или расчёте'
      },
      {
        ok: hasProof,
        problem: 'Не нашёл подтверждений опыта',
        reason: 'В доступном тексте нет явных упоминаний примеров работ, кейсов или отзывов.',
        advice: 'Добавьте реальные проекты, фотографии работ или подтверждённые отзывы.',
        positive: 'Упоминаются работы, кейсы или отзывы'
      },
      {
        ok: hasOffer,
        problem: 'В начале текста не видно, что вы предлагаете',
        reason: 'Не нашёл в начале доступного текста слов, которые объясняют услугу или продукт.',
        advice: 'На первом экране напишите простыми словами, чем занимаетесь и кому помогаете.',
        positive: 'В начале текста есть описание предложения'
      },
      {
        ok: !!(title && title.length > 3 && title.length < 220 && headings.length),
        problem: 'Не удалось увидеть понятную структуру страницы',
        reason: 'Сервис не передал достаточно данных о заголовке и разделах.',
        advice: 'Проверьте название вкладки и основной заголовок страницы: они должны отражать её содержание.',
        positive: 'Получены название страницы и заголовки разделов'
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
      ? 'В тексте страницы не удалось подтвердить некоторые важные вещи. Вот с чего я бы начал:'
      : 'В доступном тексте нашлись основные элементы. Это хороший знак, но удобство сайта и работу заявок всё ещё нужно проверить.';
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
    report = 'Предварительная проверка страницы\n' + url + '\n' +
      (title ? 'Название: ' + title.slice(0,130) + '\n' : '') +
      '\nЧто стоит проверить:\n' +
      lines.map((x,i)=>(i+1)+'. '+x.problem+(x.advice?'. '+x.advice:'')).join('\n') +
      '\n\nВыводы сделаны только по доступному тексту. Нужна проверка человеком.';
    telegram.href = contactLink(url,missing);
    email.href = 'mailto:butov.stanislav.dev@gmail.com?subject='+
      encodeURIComponent('Разбор сайта: ' + new URL(url).hostname) +
      '&body=' + encodeURIComponent(report.slice(0,2200));
    visit.href = url;
    fallback.hidden = true;
    result.hidden = false;
    copyStatus.textContent = '';
    status.textContent = 'Готово — проверен доступный текст одной страницы.';
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
    status.textContent = 'Читаю открытую страницу и ищу, что можно улучшить.';
    const ctl = new AbortController();
    const timer = setTimeout(()=>ctl.abort(),26000);
    try {
      const response = await fetch('https://r.jina.ai/'+url, {headers:{Accept:'text/plain'},signal:ctl.signal});
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