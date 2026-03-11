import time
import random
from playwright.sync_api import sync_playwright
from loguru import logger


def scrape_indeed(keyword: str = "", max_pages: int = 5) -> list[dict]:
    jobs = []
    seen_urls = set()

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(
                headless=False,
                args=["--disable-blink-features=AutomationControlled"]
            )
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080}
            )
            page = context.new_page()

            for i in range(max_pages):
                start = i * 10
                url = f"https://tr.indeed.com/jobs?q={keyword}&l=T%C3%BCrkiye&start={start}"
                logger.info(f"Indeed Sayfa {i+1}: {url}")

                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                time.sleep(random.uniform(2, 4))

                for _ in range(3):
                    page.mouse.wheel(0, random.randint(400, 700))
                    time.sleep(0.5)

                cards = page.query_selector_all(".job_seen_beacon")
                logger.info(f"Indeed Sayfa {i+1}: {len(cards)} ilan")

                if not cards:
                    break

                for card in cards:
                    try:
                        title_el = card.query_selector("h2.jobTitle span")
                        company_el = card.query_selector("[data-testid='company-name']")
                        location_el = card.query_selector("[data-testid='text-location']")
                        link_el = card.query_selector("h2.jobTitle a")

                        if not title_el or not link_el:
                            continue

                        title = title_el.inner_text().strip()
                        company = company_el.inner_text().strip() if company_el else "Belirtilmemiş"
                        location = location_el.inner_text().strip() if location_el else "Türkiye"
                        href = link_el.get_attribute("href") or ""
                        full_url = f"https://tr.indeed.com{href}" if href.startswith("/") else href

                        if title and full_url and full_url not in seen_urls:
                            seen_urls.add(full_url)
                            jobs.append({
                                "title": title,
                                "company": company,
                                "location": location,
                                "description": f"{title} - {company}",
                                "url": full_url,
                                "source": "indeed",
                            })
                    except Exception:
                        continue

            browser.close()
        except Exception as e:
            logger.error(f"Indeed hatası: {e}")

    logger.info(f"Indeed toplam: {len(jobs)} ilan")
    return jobs


def scrape_kariyernet(keyword: str = "", max_pages: int = 3) -> list[dict]:
    unique_jobs = []
    seen_urls = set()

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(
                headless=False,
                args=["--disable-blink-features=AutomationControlled"]
            )
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080}
            )
            page = context.new_page()

            start_url = "https://www.kariyer.net/is-ilanlari"
            if keyword:
                start_url += f"?kw={keyword}"

            page.goto(start_url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(random.uniform(4, 6))

            for page_num in range(1, max_pages + 1):
                logger.info(f"Kariyer.net sayfa {page_num} taranıyor...")

                for _ in range(6):
                    page.mouse.wheel(0, random.randint(500, 900))
                    time.sleep(random.uniform(0.5, 1.0))
                time.sleep(2)

                all_links = page.query_selector_all("a")
                page_jobs = []

                for el in all_links:
                    href = el.get_attribute("href") or ""
                    if "/is-ilani/" not in href:
                        continue

                    text = el.inner_text().strip()
                    if not text or len(text) < 10:
                        continue

                    lines = [l.strip() for l in text.split("\n") if l.strip()]
                    if lines and "sponsorlu" in lines[0].lower():
                        lines = lines[1:]
                    if len(lines) < 2:
                        continue

                    title = lines[0]
                    company = lines[1]
                    location = lines[2] if len(lines) > 2 else "Türkiye"

                    skip_words = ["iş yerinde", "hibrit", "uzaktan", "tam zaman", "dönemsel", "ort.", "updated", "günde"]
                    if any(w in location.lower() for w in skip_words):
                        location = "Türkiye"

                    full_url = f"https://www.kariyer.net{href}" if href.startswith("/") else href

                    if full_url not in seen_urls and title and company:
                        seen_urls.add(full_url)
                        page_jobs.append({
                            "title": title,
                            "company": company,
                            "location": location,
                            "description": f"{title} - {company}",
                            "url": full_url,
                            "source": "kariyer.net",
                        })

                logger.info(f"Kariyer.net sayfa {page_num}: {len(page_jobs)} ilan")
                unique_jobs.extend(page_jobs)

                if page_num < max_pages:
                    next_btn = None
                    for a in page.query_selector_all("a"):
                        txt = a.inner_text().strip()
                        if txt in ["Sonraki", "navigate_next"]:
                            next_btn = a
                            break

                    if next_btn:
                        next_btn.scroll_into_view_if_needed()
                        time.sleep(random.uniform(1, 2))
                        next_btn.click()
                        time.sleep(random.uniform(4, 6))
                    else:
                        break

            browser.close()
        except Exception as e:
            logger.error(f"Kariyer.net hatası: {e}")

    logger.info(f"Kariyer.net toplam: {len(unique_jobs)} ilan")
    return unique_jobs


def run_scrapers(keyword: str = "") -> list[dict]:
    logger.info(f"'{keyword}' için Kariyer.net + Indeed taranıyor...")

    kariyernet_jobs = scrape_kariyernet(keyword=keyword, max_pages=3)
    indeed_jobs = scrape_indeed(keyword=keyword, max_pages=5)

    all_jobs = kariyernet_jobs + indeed_jobs
    unique_jobs = list({job["url"]: job for job in all_jobs if job["url"]}.values())

    logger.info(f"Toplam benzersiz ilan: {len(unique_jobs)}")
    return unique_jobs


def run_scraper(keyword: str = "") -> list[dict]:
    return scrape_kariyernet(keyword=keyword, max_pages=5)