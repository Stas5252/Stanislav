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
