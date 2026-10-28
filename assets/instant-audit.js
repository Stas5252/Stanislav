/* Public URL content snapshot. Informational only; no speed/rank/security tests. */
(() => {
  'use strict';
  const form = document.getElementById('instantAuditForm');
  const input = document.getElementById('instantAuditUrl');
  const submit = document.getElementById('instantAuditSubmit');
  const status = document.getElementById('instantAuditStatus');
  const result = document.getElementById('instantAuditResult');
  const heading = document.getElementById('instantAuditHeading');
  const lead = document.getElementById('instantAuditLead');
  const list = document.getElementById('instantAuditFindings');
  const copy = document.getElementById('instantAuditCopy');
  const email = document.getElementById('instantAuditEmail');
  const visit = document.getElementById('instantAuditVisit');
  const copyStatus = document.getElementById('instantAuditCopyStatus');
  if (![form,input,submit,status,result,heading,lead,list,copy,email,visit,copyStatus].every(Boolean)) return;
  let preparedReport = '';
  let active = false;
  function normalize(raw) {
    let value = raw.trim();
    if (value.length < 4 || value.length > 320) throw Error('Укажите публичный адрес сайта, не длиннее 320 символов.');
    if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
    let u;
    try { u = new URL(value); } catch { throw Error('Не удалось распознать адрес. Пример: https://example.ru'); }
    const host = u.hostname.toLowerCase();
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password ||
      !host.includes('.') || host === 'localhost' ||
      /\.(local|internal|localhost|test|invalid)$/i.test(host) ||
      /^(\d{1,3}\.){3}\d{1,3}$/.test(host) ||
      host.includes(':') || u.port) {
      throw Error('Для проверки нужен обычный публичный домен с HTTP или HTTPS.');
    }
    if (u.pathname.length > 180) throw Error('Слишком длинный адрес страницы. Вставьте ссылку на главную.');
    // Query parameters and hash fragments may contain private tokens; never send them to the reader.
    return u.origin + u.pathname;
  }
  const hints = [
    ['Название страницы', 'title', 'Если заголовок не найден, проверьте тег title у страницы.'],
    ['Разделы и подзаголовки', 'structure', 'Разделите информацию на понятные смысловые блоки.'],
    ['Понятное предложение', 'offer', 'На первом экране нужно объяснить, что вы предлагаете и кому.'],
    ['Цена и условия', 'price', 'Покажите цену или объясните, как клиент может получить расчёт.'],
    ['Контактные данные', 'contact', 'Добавьте заметную возможность связаться удобным способом.'],
    ['Призыв к действию', 'cta', 'Подскажите посетителю следующий шаг: записаться, оставить заявку или обсудить заказ.'],
    ['Примеры и доверие', 'trust', 'Покажите реальные работы, отзывы с разрешения или факты о компании.']
  ];
  function render(sourceUrl, extracted) {
    const title = (extracted.match(/^Title:\s*(.+)$/mi) || [])[1]?.trim() || '';
    const pos = extracted.indexOf('Markdown Content:');
    const content = pos >= 0 ? extracted.slice(pos + 'Markdown Content:'.length).trim() : '';
    if (content.length < 110 || /^(access denied|forbidden|blocked|verify you are human)/i.test(content.slice(0,80))) {
      throw Error('Не удалось получить достаточно текста с этой страницы. Попробуйте главную или выполните ручную проверку ниже.');
    }
    const heads = [...content.matchAll(/^#{1,4}\s+(.+)$/gm)].map(x => x[1].replace(/[*_]/g,'').trim()).filter(Boolean);
    const marks = {
      title: title.length > 3 && title.length < 220,
      structure: heads.length > 0,
      offer: /(услуг|предлага|разработ|прода|производ|достав|заказыва|консультац|запис|аренд|помога|обучени|service|product|solution|shop|store|consult)/i.test(content),
      price: /(\d[\d\s\u00a0]{0,8}[₽]|от\s+\d[\d\s\u00a0]{2,}\s*(руб|₽)|стоимост|цены|тариф|прайс|расч[её]т|pricing|price|plans)/i.test(content),
      contact: /(mailto:|tel:|t\.me\/|wa\.me\/|контакт|связаться|напишите|позвон|@[\w-]+\.[a-z]{2,}|contact us|call us)/i.test(content),
      cta: /(заказать|оставить заявку|получить предложени|обсудить|записаться|купить|отправить|оформить|связаться|book now|contact us|buy now|get started)/i.test(content),
      trust: /(портфолио|отзыв|кейсы|выполненн|наши работы|проекты|клиенты|сертификат|гаранти|reviews|testimonials|portfolio|case stud)/i.test(content)
    };
    const matches = hints.filter(x => marks[x[1]]).length;
    heading.textContent = 'Предварительный разбор: ' + new URL(sourceUrl).hostname;
    lead.textContent = 'В извлечённом тексте обнаружено ' + matches + ' из ' + hints.length + ' ориентиров. Это не оценка качества сайта, SEO-позиции или проверка скорости. Отсутствие признака в тексте не означает, что его нет на странице.';
    list.replaceChildren();
    const report = ['Самопроверка публичной страницы', 'URL: ' + sourceUrl, 'Заголовок, переданный сервисом: ' + (title || 'не получен'), ''];
    for (const [label,key,advice] of hints) {
      const found = marks[key];
      const row = document.createElement('li');
      row.className = 'instant-audit-finding ' + (found ? 'found' : 'unknown');
      const head = document.createElement('strong');
      head.textContent = (found ? 'Найдено в тексте: ' : 'Не обнаружено в тексте: ') + label;
      const desc = document.createElement('p');
      desc.textContent = found ?
        (key === 'title' ? 'Заголовок: «' + title.slice(0,115) + '».' :
         key === 'structure' ? 'Например: «' + heads[0].slice(0,110) + '».' :
         'Есть текстовый признак. Проверьте его удобство и реальную работу на сайте.') :
        advice + ' Проверить нужно вручную.';
      row.append(head,desc);
      list.append(row);
      report.push((found ? '[НАЙДЕНО] ' : '[ПРОВЕРИТЬ] ') + label + '. ' + desc.textContent);
    }
    preparedReport = report.join('\n');
    email.href = 'mailto:butov.stanislav.dev@gmail.com?subject=' +
      encodeURIComponent('Разбор сайта: ' + new URL(sourceUrl).hostname) +
      '&body=' + encodeURIComponent(preparedReport.slice(0,2200));
    visit.href = sourceUrl;
    result.hidden = false;
    copyStatus.textContent = '';
    result.scrollIntoView({behavior:'smooth',block:'start'});
  }
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    if (active) return;
    result.hidden = true;
    copyStatus.textContent = '';
    let target;
    try { target = normalize(input.value); } catch (e) {status.textContent = e.message;return;}
    input.value = target;
    active = true;
    submit.disabled = true;
    submit.textContent = 'Анализируем страницу…';
    status.textContent = 'Получаем публичный текст сайта. Обычно это занимает несколько секунд.';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 26000);
    try {
      const request = await fetch('https://r.jina.ai/' + target, {signal:controller.signal,headers:{'Accept':'text/plain'}});
      if (request.status === 429) throw Error('Сервис проверки перегружен. Попробуйте позже или воспользуйтесь чек-листом ниже.');
      if (!request.ok) throw Error('Сервис не смог прочитать сайт (код ' + request.status + '). Можно отправить ссылку мне напрямую.');
      const body = await request.text();
      render(target, body.slice(0,240000));
      status.textContent = 'Готово. Это анализ доступного текста одной публичной страницы.';
    } catch (e) {
      status.textContent = e.name === 'AbortError' ?
        'Сайт не ответил за отведённое время. Проверьте адрес или попробуйте чек-лист ниже.' :
        (e instanceof TypeError ? 'Не удалось связаться с сервисом. Используйте самопроверку ниже.' : e.message);
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
      submit.textContent = 'Проверить сайт';
      active = false;
    }
  });
  copy.addEventListener('click', async () => {
    if (!preparedReport) return;
    try {
      await navigator.clipboard.writeText(preparedReport);
      copyStatus.textContent = 'Разбор скопирован. Можно вставить в сообщение разработчику.';
    } catch {
      copyStatus.textContent = 'Копирование недоступно в этом браузере. Можно воспользоваться email.';
    }
  });
})();