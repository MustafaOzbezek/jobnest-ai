import sys
import json

if __name__ == "__main__":
    keyword = sys.argv[1] if len(sys.argv) > 1 else ""
    
    from app.services.scraper import run_scrapers
    jobs = run_scrapers(keyword=keyword)
    
    print(json.dumps(jobs, ensure_ascii=False))