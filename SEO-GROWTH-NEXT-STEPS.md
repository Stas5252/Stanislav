# Organic acquisition roadmap for stanislavweb.ru
Date: 2026-10-28
Target market: Russia-wide remote website development, with international inquiries supported (Russian language site).

## Verified baseline from source
- Production content is in GitHub Pages branch `gh-pages`, NOT the older `main` branch.
- Robots.txt allows crawling and points to sitemap.xml.
- Sitemap previously included 7 main service/case URLs.
- Three service landing pages already existed: landing, expert-site, business-site.
- Yandex Metrika is consent-based; requires checking goals from its dashboard.
- Site CTA relies on Telegram, email and phone links; no server-side submissions were detected on the homepage.

## Shipped in this change
- /website-cost/ — independent page for pricing/research intent; links to all service types.
- /website-redesign/ — independent page for redesign intent, including SEO migration considerations.
- Home-page internal links to both pages.
- Updated sitemap and analytics page allowlist.
- Native responsive styling and unique canonical, titles, descriptions, OG and JSON-LD.

## Next steps requiring external verified data
1. Search Console: last 90 days pages/queries/CTR/indexing and reasons for exclusions.
2. Yandex Webmaster: regional targeting, search queries, indexed pages, diagnostics.
3. Metrika: consented organic sessions, Telegram/email/phone goals, conversion.
4. Keyword research (Wordstat + GSC) and manual intent grouping across Russia.
5. Prioritize 5-10 real sector pages ONLY with actual work and differentiated content; no doorway city pages.
6. Earn appropriate editorial and client references; avoid link schemes.
7. Test contact friction: simpler visible phone/email path, lead quality measurement. Do not submit sensitive data without consent.
8. Recheck static pages and site routing on live domain after merge.
9. Track traffic, qualified inquiries and deals for 3-6 months, rather than promising top-one rankings.

## Release notes
Do not deploy `main` directly: it currently contains an older incompatible site version.
