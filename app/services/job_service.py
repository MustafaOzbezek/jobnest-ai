from sqlalchemy.orm import Session
from app.models.job import Job
from loguru import logger

def save_jobs_to_db(db: Session, jobs_data: list):
    saved_count = 0
    for item in jobs_data:
        try:
            # URL üzerinden mükerrer kayıt kontrolü
            existing_job = db.query(Job).filter(Job.url == item['url']).first()
            
            if not existing_job:
                new_job = Job(
                    title=item['title'],
                    company=item['company'],
                    location=item.get('location', 'Belirtilmemiş'),
                    url=item['url'],
                    source=item.get('source', 'kariyer.net'),
                    description=item.get('description', ""),
                    salary_range=item.get('salary_range'),
                    skills=item.get('skills')
                )
                db.add(new_job)
                # Her ilanı kendi içinde commit etmiyoruz ama 
                # flush yaparak veritabanına hazır olduğunu söylüyoruz
                db.flush() 
                saved_count += 1
        except Exception as e:
            db.rollback() # Sadece o anki hatalı ilanı geri al
            logger.warning(f"Bir ilan atlandı (muhtemelen zaten var): {item['title']}")
            continue # Hata olsa da döngüye devam et, diğerlerini kaydet

    try:
        db.commit() # Kalan tüm sağlam ilanları tek seferde bitir
        if saved_count > 0:
            logger.success(f"Veritabanına {saved_count} yeni ilan başarıyla kaydedildi!")
        else:
            logger.info("Yeni ilan bulunamadı (Tüm ilanlar zaten kayıtlı).")
    except Exception as e:
        db.rollback()
        logger.error(f"Veritabanı kaydı sırasında genel hata: {e}")

    return saved_count