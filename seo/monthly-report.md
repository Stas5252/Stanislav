# Monthly SEO report: October 2026 (partial)
Report date: 2026-10-28. Data through Oct 25 only.
Source: connected Windsor.ai Google Search Console `searchconsole` / `https://stanislavweb.ru/`.
- Google October 1–25: 18 impressions, 1 click, CTR 5.56% (monthly grouped).
- September 2026: 0 impressions and clicks in this connector.
- Per-page grouping returned 5 pages; do not add their counts to the monthly total.
- Search query rows: none returned.
- GSC sitemap: submitted count 7 in report, submitted 2026-10-03; source is updated later.
- Index coverage count: NOT AVAILABLE in this connector; do not equate submitted URLs with indexed pages.
- Qualified enquiries, phone calls, Telegram chats, deals: NOT VERIFIED (no business CRM/delivered-form data).
- Yandex Webmaster clicks and impressions: NOT CONNECTED.
- AI-citations: NOT MEASURED.
Changes: earlier production improvements include pricing, redesign, event venue pages, real cases, embedded brief, monochrome SVG icons; this release adds the original site-brief guide and tracking documentation.
Next checks: validate guide publish; connect Yandex Webmaster; compare next full month after data accumulation.

## Changes in current execution, 2026-10-28
- Published two original informational pages with a functional choice widget and QA checklist; linked from the homepage and relevant services.
- Corrected broken CTA anchor on the technical brief guide page.
- GitHub Pages build `40602355457`: success. Confirmed both URLs returned HTTP 200 with unique canonical and title after publication.
- Keyword hypotheses updated; no changes to the baseline Google Search Console numbers. Ranking, traffic and lead effect UNKNOWN as of release.
- Weekly ChatGPT SEO statistics report created; weekly Lighthouse lab Action added.

## Verified Lighthouse mobile lab baseline, 2026-10-28
Source: GitHub Actions run 40602786733 (Lighthouse CI artifacts). The four pages scored performance 94/99/100/98, SEO 100/100/100/100. The technical-brief guide had accessibility and best-practices 96, traced to tiny text and one button's color contrast; CSS correction committed separately. This is simulated/mobile lab data, **not** Chrome UX Report field data.

- Second Lighthouse run 40603393535: all 6 pages returned 100/100 SEO, business and new checklist 100/100 in all four categories, technical brief accessibility verified at 100 after CSS fix. Comparison had role-table accessibility error (94), now corrected in source pending rerun.

## Выполнение SEO-запроса 28 октября: актуальная перепроверка

**Данные поисковой видимости.** Google Search Console (Windsor.ai), 1–25 октября: 18 показов, 1 переход; CTR 5,56%. По странам (отдельная группировка) Россия: 13 показов и 0 переходов. По запросам выгрузка пуста, поэтому позиции и частотность целевых коммерческих фраз неизвестны. Группировка страниц показала 5 URL хотя бы с одним показом; это НЕ число проиндексированных страниц.

**Технический аудит.** 14 из 14 URL текущего `sitemap.xml` проверены по GitHub-исходникам ветки `gh-pages`: у каждой один H1, отдельный title, правильный self-canonical, JSON-LD и контакты; явного noindex нет. Запуск GitHub Action 40635732605 для опубликованного сайта прошёл успешно, в том числе тесты доступности и IndexNow. Проверка исходников и сканирование не заменяют Google URL Inspection / Яндекс Вебмастер.

**Файл Sitemap в Google.** Последняя доступная запись Search Console: URL `https://stanislavweb.ru/sitemap.xml`, submitted=14, errors=0, warnings=0, last_submitted=2026-10-03, last_downloaded=2026-10-25. `submitted` не равно `indexed`. Повторно отправить карту через панель можно после владельческого доступа; автоматический обход не зависит от повторной отправки.

**Сделано для заявок и переходов.** Основной CTA на главной странице направлен сразу в `https://t.me/Butov52` (ранее предлагал сначала заполнить бриф); бриф сохранён. В каталоге https://stas5252.github.io/mockup-hub/ размещён контекстный переход на основной сайт (UTM mockup_hub/referral/portfolio). Не выдавать клики по кнопкам за полученные заявки.

**Внешняя репутация.** Уже существующий README репозитория mockup-hub содержит естественную ссылку на сайт. Продажи/переходы по новой ссылке пока не измерены. Публикации от имени владельца на Dprofile, Behance, vc.ru, в клиентских проектах требуют доступа к аккаунтам или согласия клиентов; автоматических массовых размещений и платных ссылок не было.

**Что заблокировано данными.** Нет актуального отчёта Google об исключённых/проиндексированных URL, авторизованного Яндекс Вебмастера, Wordstat по России, доступа к подтверждённым обращениям и продажам. Не выдумывать нулевые проблемы или позиций «топ-3». Еженедельный контроль существующей автоматизацией, сравнивать после задержки индексации, а не делать новые сайты под каждую гипотезу.

## Дополнительный канал: проверка Threads

По подключённому Threads (данные Windsor.ai на 28 октября) обнаружено резкое снижение просмотров опубликованных постов:
- 24 октября: 8 постов, суммарно 185 просмотров;
- 25 октября: 9 постов, суммарно 162 просмотра;
- 26 октября: 5 постов, суммарно 29 просмотров;
- 27 октября: 5 постов, суммарно 4 просмотра;
- 28 октября: 2 поста, суммарно 1 просмотр.

Это просмотры отдельных публикаций, не уникальные люди и не подтверждённые визиты на сайт. В этой SEO-задаче новые массовые посты в Threads не запускались. Приоритет: качество 1–2 подтверждённых кейсов, разрешённые клиентские упоминания, брендовый спрос и заявки, а не количество постов.

## Проверка 29 октября 2026 — фактическое состояние

- Google Search Console (Windsor.ai, данные за 1–27 октября): **20 показов, 1 клик, CTR 5%** по дневной агрегированной статистике. Запросы Google не раскрыты; 7 URL получили показы в разбивке по страницам. Нельзя суммировать показы разных группировок с дневными.
- Sitemap: live `https://stanislavweb.ru/sitemap.xml` содержит **14 canonical URL**, все с lastmod=2026-10-28; `robots.txt` доступен и разрешает сканирование. Google Search Console сообщает о **21 submitted URL**, 0 errors, 0 warnings и последнем скачивании 2026-10-25. Это расхождение текущего сайта и более старого отчёта Google, **не** число проиндексированных страниц; дождаться повторного чтения sitemap.
- IndexNow: 2026-10-29 вручную отправлено 14 актуальных URL на `https://api.indexnow.org/indexnow` с предварительной проверкой опубликованного ключа, получен **HTTP 200**. Это принятие уведомления, не подтверждение индексации, ранжирования или трафика. Google IndexNow не поддерживает.
- PageSpeed Insights, 29 октября, главная: **Mobile Performance 97, Accessibility 100, Best Practices 100, SEO 100**; FCP 2.0s, LCP 2.0s, TBT 0ms, CLS 0, Speed Index 2.7s. **Desktop: 100/100/100/100**, FCP 0.2s, LCP 0.4s, TBT 0ms, CLS 0.034, Speed Index 0.6s. Это лабораторный Lighthouse, не данные реальных пользователей (CrUX: No Data).
- Отчёты Google: [mobile](https://pagespeed.web.dev/analysis/https-stanislavweb-ru/x9gjby5tx6?form_factor=mobile) / [desktop](https://pagespeed.web.dev/analysis/https-stanislavweb-ru/x9gjby5tx6?form_factor=desktop).
- Источник продакшена: ветка `gh-pages`. Основная `main` содержит устаревшую HTML-витрину; не заменять ею продакшен. Никаких новых шаблонных SEO-страниц или изменений дизайна по результату этой проверки не вносилось: выявленный приоритет — фактическая индексация, квалифицированные заявки, реальные отзывы и ссылки на кейсы.
