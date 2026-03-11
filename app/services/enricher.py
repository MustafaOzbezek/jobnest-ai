import asyncio
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.job import Job
from app.services.ai_service import analyze_job_skills
from loguru import logger

def enrich_jobs():
    db = SessionLocal()
    try:
        # 1. Henüz yetkinlik (skills) analizi yapılmamış ilanları bul
        unprocessed_jobs = db.query(Job).filter(Job.skills == None).all()
        
        if not unprocessed_jobs:
            logger.info("Analiz edilecek yeni ilan bulunamadı.")
            return

        logger.info(f"{len(unprocessed_jobs)} ilan analiz için kuyruğa alındı.")

        for job in unprocessed_jobs:
            logger.info(f"Analiz ediliyor: {job.title}")
            
            # 2. AI servisini çağır (Başlık ve açıklamaya göre yetkinlik çıkar)
            skills = analyze_job_skills(job.title, job.description or "")
            
            # 3. Sonucu veritabanına yaz
            job.skills = skills
            
            logger.success(f"Beceriler eklendi: {skills}")

        # 4. Tüm değişiklikleri kaydet
        db.commit()
        logger.success("Tüm ilanlar başarıyla zenginleştirildi!")

    except Exception as e:
        db.rollback()
        logger.error(f"Zenginleştirme sırasında hata: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    enrich_jobs()