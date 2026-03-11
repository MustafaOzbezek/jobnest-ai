import requests
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "tr-TR,tr;q=0.9",
}

keyword = "avukat"
url = f"https://tr.indeed.com/jobs?q={keyword}&l=&start=0"

response = requests.get(url, headers=headers)
print(f"Status: {response.status_code}")

soup = BeautifulSoup(response.text, 'html.parser')
jobs = soup.find_all('div', class_='job_seen_beacon')
print(f'İlan sayısı: {len(jobs)}')

for job in jobs[:3]:
    title = job.find('h2')
    company = job.find('span', {'data-testid': 'company-name'})
    location = job.find('div', {'data-testid': 'text-location'})
    print(f'Title: {title.text.strip() if title else ""}')
    print(f'Company: {company.text.strip() if company else ""}')
    print(f'Location: {location.text.strip() if location else ""}')
    print('---')