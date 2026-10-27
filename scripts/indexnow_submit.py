#!/usr/bin/env python3
"""Notify IndexNow engines about recently updated published URLs. Free, no tokens."""
import datetime as dt
import json
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

SITE = "https://stanislavweb.ru"
KEY = "9d32fb2cbb7d65dc7dd91f222072cb03ff08a86e70f78c2f"
KEY_LOCATION = f"{SITE}/9d32fb2cbb7d65dc7dd91f222072cb03ff08a86e70f78c2f.txt"
SITEMAP = f"{SITE}/sitemap.xml"
HEADERS = {"User-Agent": "StanislavWeb-IndexNow/1.0 (+https://stanislavweb.ru)"}


def fetch(url, attempts=3):
    last = None
    for retry in range(attempts):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=25) as res:
                return res.read(2_000_000)
        except (urllib.error.URLError, TimeoutError) as exc:
            last = exc
            if retry + 1 < attempts:
                time.sleep(5)
    raise RuntimeError(f"Unable to fetch {url}: {last}")


def main():
    # The key file must be published at the canonical website before submission.
    # When this workflow runs on a repository push, Pages deployment may still be in progress.
    published = fetch(KEY_LOCATION, attempts=18).decode("utf-8", "replace").strip()
    if published != KEY:
        raise RuntimeError("IndexNow key file does not contain the expected site key")
    root = ET.fromstring(fetch(SITEMAP))
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    cutoff = dt.date.today() - dt.timedelta(days=8)
    urls = []
    for entry in root.findall("sm:url", ns):
        loc = entry.findtext("sm:loc", namespaces=ns)
        lastmod = entry.findtext("sm:lastmod", namespaces=ns)
        if not loc or not loc.startswith(SITE + "/"):
            continue
        if not lastmod:
            continue  # Avoid notifying every URL on every weekly run.
        try:
            modified = dt.date.fromisoformat(lastmod[:10])
        except ValueError:
            continue
        if modified >= cutoff:
            urls.append(loc)
    urls = list(dict.fromkeys(urls))
    print(f"IndexNow eligible URLs (lastmod since {cutoff}): {len(urls)}")
    if not urls:
        return 0
    payload = json.dumps({
        "host": "stanislavweb.ru",
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.indexnow.org/indexnow", data=payload, method="POST",
        headers={**HEADERS, "Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=35) as res:
            status = res.status
            response_text = res.read(4000).decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        status = exc.code
        response_text = exc.read(4000).decode("utf-8", "replace")
    print("IndexNow response status:", status)
    print("API response:", response_text[:1000])
    for page in urls:
        print("- " + page)
    print("Reminder: submitted != indexed or ranked; Google does not use IndexNow.")
    return 0 if status in (200, 202) else 1


if __name__ == "__main__":
    sys.exit(main())
