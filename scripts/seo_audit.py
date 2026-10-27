#!/usr/bin/env python3
"""Lightweight public SEO regression checker for stanislavweb.ru, no API keys."""
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

BASE = "https://stanislavweb.ru"
SITEMAP = BASE + "/sitemap.xml"
HEADERS = {"User-Agent": "StanislavWeb-SEO-Audit/1.0 (+https://stanislavweb.ru/)"}


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.titles = []
        self.h1s = 0
        self.canonicals = []
        self.descriptions = []
        self.robots = []
        self.links = []
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "h1":
            self.h1s += 1
        elif tag == "link" and "canonical" in attrs.get("rel", "").lower().split():
            self.canonicals.append(attrs.get("href", ""))
        elif tag == "meta":
            name = attrs.get("name", "").lower()
            if name == "description":
                self.descriptions.append(attrs.get("content", "").strip())
            elif name == "robots":
                self.robots.append(attrs.get("content", "").lower())
        elif tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.titles.append(data.strip())


def fetch(url):
    last = None
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(request, timeout=25) as response:
                return response.geturl(), response.headers.get_content_type(), response.read(2_000_000)
        except (urllib.error.URLError, TimeoutError, ConnectionError) as exc:
            last = exc
            if attempt < 2:
                time.sleep(2 + attempt)
    raise RuntimeError(f"Failed to fetch {url}: {last}")


def main():
    problems = []
    report = ["# Weekly SEO health check", "", f"Domain: {BASE}", ""]
    _, _, robots_body = fetch(BASE + "/robots.txt")
    if f"Sitemap: {SITEMAP}".lower() not in robots_body.decode("utf-8", "replace").lower():
        problems.append("robots.txt does not declare the expected sitemap")
    _, _, xml = fetch(SITEMAP)
    try:
        root = ET.fromstring(xml)
        namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = [loc.text.strip() for loc in root.findall("sm:url/sm:loc", namespace) if loc.text]
    except ET.ParseError as exc:
        raise RuntimeError(f"Invalid sitemap.xml: {exc}") from exc
    if not urls:
        problems.append("Sitemap has no URLs")
    if len(urls) != len(set(urls)):
        problems.append("Sitemap includes duplicate URLs")
    report.append(f"Discovered URLs in sitemap: **{len(urls)}**")
    report.append("")
    report.append("| URL | Status |")
    report.append("| --- | --- |")
    for url in urls:
        if not url.startswith(BASE + "/"):
            problems.append(f"Unexpected out-of-domain sitemap URL: {url}")
            continue
        path = urllib.parse.urlparse(url).path
        try:
            final, mime, body = fetch(url)
            page = PageParser()
            page.feed(body.decode("utf-8", "replace"))
            issues = []
            if mime not in ("text/html", "application/xhtml+xml"):
                issues.append(f"Unexpected content type: {mime}")
            if urllib.parse.urlsplit(final).path != urllib.parse.urlsplit(url).path:
                issues.append(f"Redirects to a different path: {final}")
            if len(page.canonicals) != 1 or page.canonicals[0] != url:
                issues.append(f"Canonical mismatch: {page.canonicals}")
            if page.h1s != 1:
                issues.append(f"Expected one H1, found {page.h1s}")
            if not any(page.titles) or len(page.descriptions) != 1 or not page.descriptions[0]:
                issues.append("Missing title or meta description")
            if any("noindex" in directive for directive in page.robots):
                issues.append("Unexpected noindex")
            problems.extend(f"{path}: {issue}" for issue in issues)
            report.append(f"| `{path}` | {'OK' if not issues else 'ISSUES'} |")
        except Exception as exc:
            problems.append(f"{path}: {exc}")
            report.append(f"| `{path}` | FETCH FAILED |")
    report.extend(["", f"Problems: **{len(problems)}**", ""])
    if problems:
        report.extend(f"- {problem}" for problem in problems)
    else:
        report.append("All sitemap pages passed basic technical checks.")
    summary = "\n".join(report) + "\n"
    print(summary)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as output:
            output.write(summary)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
