from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.scraper import scrape_kariyernet
from app.services.job_service import save_jobs_to_db
from app.db.session import SessionLocal
from loguru import logger

# Async scheduler kullanıyoruz çünkü scraper async (Playwright)
scheduler = AsyncIOScheduler()

async def run_daily_scraping():
    logger.info("Otomatik tarama işlemi başlatılıyor...")
    db = SessionLocal()
    try:
        # 1. Botu çalıştır ve ilanları al
        jobs = await scrape_kariyernet()
        
        if jobs:
            # 2. Veritabanına kaydet
            count = save_jobs_to_db(db, jobs)
            logger.success(f"Otomatik tarama tamamlandı. {count} yeni ilan eklendi.")
        else:
            logger.warning("Tarama yapıldı ama yeni ilan bulunamadı.")
            
    except Exception as e:
        logger.error(f"Scheduler hatası: {e}")
    finally:
        db.close()

def start_scheduler():
    # Her gün gece 02:00'de çalışması için (test için aralığı değiştirebiliriz)
    scheduler.add_job(run_daily_scraping, "cron", hour=2, minute=0)
    
    # Uygulama başladığında her şeyin yolunda olduğunu anlamak için 
    # opsiyonel: istersen 1 dakika sonraya da bir test görevi atayabilirsin
    
    scheduler.start()
    logger.info("Zamanlayıcı (Scheduler) kuruldu: Her gün 02:00'de bot çalışacak.")