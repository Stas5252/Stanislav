# SEO MASTER — audit before phase 1
Date: 2026-10-28. Scope: public website and current GitHub branch gh-pages. Document: SEO_MASTER(1).docx (owner-supplied 2026 SEO specification).
Priority scale P0/P1/P2/P3 and statuses from user's standard.

## Source-backed baseline
- Public site: https://stanislavweb.ru/ (Firecrawl HTTP 200 on 2026-10-28).
- GitHub repo: Stas5252/Stanislav; production branch gh-pages; main is an older site plus CI scripts. DO NOT deploy main to Pages.
- Source sitemap.xml: 10 canonicals (homepage, 3 services, 3 cases, price, redesign, event venue). Public robots.txt: `User-agent: *; Allow: /; Sitemap: ...`.
- Google Search Console account confirmed via Windsor.ai: `https://stanislavweb.ru/`. 2026-10-01 to 2026-10-25 grouped monthly: 18 impressions, 1 click, 5.56% CTR. September: 0. These counts alone do not establish rank for nonbranded commercial queries.
- URL-level GSC read: /landing/ 1 click and 5 impressions; / 16 impressions; /business-site/ 5; /expert-site/ 5; /work/kristina-dimond/ 1. URL and monthly grouping are not directly additive. Query report yielded no rows; do NOT invent keywords/positions.
- GSC sitemap provider result: `submitted=7`, last_submitted 2026-10-03, last_downloaded 2026-10-25. This is older than later sitemap edits, not proof of current Google index coverage.
- Existing conversion UX: homepage two-step brief prepares a client-controlled Telegram/email message; no server lead submission. User consent gates public Yandex Metrika ID in assets/config.js. No verified dashboard-level goal completion or actual lead delivery.
- Existing official owner verification files in source: google2f70c5c004921082.html, yandex_3d7d3005290a1cdc.html. Their existence is not proof of present authenticated access.
- IndexNow push via main-branch GitHub Actions completed successfully, API HTTP 202 for 4 updated URLs. Acceptance is not indexing.

## P0 / P1 / P2 findings
| Priority | Finding | Evidence | Action | Current state |
|---|---|---|---|---|
| P1 | Near-zero Google impressions and one click | Windsor GSC October 1–25 | Build differentiated pages plus trustworthy references; measure, no ranking promise | VERIFIED |
| P1 | Search queries not returned | Windsor GSC query read [] | Get GSC query export when reporting threshold permits; use real SERP and Wordstat meanwhile | BLOCKED |
| P1 | Search Console sitemap record stale | 7 submitted vs 10 in source | Let Google recrawl; verify Sitemaps UI / index reporting | NEEDS_OWNER or access with submission ability |
| P1 | No measured qualified leads or completed-contact success | No server endpoint; analytics click goals only | Treat click as interaction not sale; review actual contacts/goal dashboard | IMPLEMENTED_UNVERIFIED |
| P1 | Yandex Webmaster diagnostics unavailable | No connected Webmaster account | Grant delegated access or connect read-capable integration | NEEDS_OWNER |
| P2 | No SEO keyword mapping/files in GitHub | Source tree before implementation | Add seo/ reporting artefacts without invented volumes | IMPLEMENTING |
| P2 | No high-value educational resource | Public service pages but no on-site brief guide | Write original TЗ guide, connect to actual brief and cases | IMPLEMENTING |
| P2 | Mobile CWV field metrics unmeasured | No CrUX/PSI field report in this run | Measure before asserting speed gains | BLOCKED |
| P2 | Need external reputation signals | Existing 3 case links, no documented editorial backlink audit | Seek real, permissioned client citations rather than purchased link schemes | NEEDS_OWNER |

## Verified negatives / limits
No P0 outage was observed in the sample; this is NOT a full security, DNS mirror, redirect-chain, Web Vitals or Yandex crawl audit. Do not mark those checks fully complete.
