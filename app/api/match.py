from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.job import Job
from app.utils.skill_extractor import extract_skills
from app.services.storage import save_upload_file
from app.services.ai_service import extract_profession_from_cv
from app.services.job_service import save_jobs_to_db
from loguru import logger
import pdfplumber
import subprocess
import sys
import json

router = APIRouter()


@router.post("/upload-cv")
async def match_cv_with_jobs(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Dosyayı kaydet
    file_path = save_upload_file(file, user_id=1)

    # 2. PDF'yi oku
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                content = page.extract_text()
                if content:
                    text += content
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF Okuma Hatası: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF boş veya metin okunamadı.")

    # 3. Meslek tespiti
    detected_profession = extract_profession_from_cv(text)
    logger.info(f"Tespit Edilen Meslek: {detected_profession}")

    # 4. Scraper'ı ayrı process'te çalıştır
    try:
        logger.info(f"'{detected_profession}' için tarama başlıyor...")

        result = subprocess.run(
            [sys.executable, "-m", "app.services.scraper_runner", detected_profession],
            timeout=240,
            capture_output=True,
            text=True,
            cwd=r"C:\Users\mozbe\OneDrive\Masaüstü\JobNest"
        )

        if result.stdout:
            try:
                new_jobs = json.loads(result.stdout.strip())
                if new_jobs:
                    save_jobs_to_db(db, new_jobs)
                    logger.info(f"{len(new_jobs)} yeni ilan DB'ye eklendi")
            except json.JSONDecodeError:
                logger.warning(f"JSON parse hatası: {result.stdout[:200]}")

        if result.stderr:
            logger.info(f"Scraper log: {result.stderr[-300:]}")

    except subprocess.TimeoutExpired:
        logger.error("Scraper zaman aşımına uğradı")
    except Exception as e:
        logger.error(f"Scraper hatası: {e}")

    # 5. Yetenek eşleştirme
    user_skills = set(extract_skills(text))
    all_jobs = db.query(Job).all()
    match_results = []

    for job in all_jobs:
        job_content = f"{job.title} {job.description or ''} {job.skills or ''}"
        job_skills = set(extract_skills(job_content))
        common_skills = user_skills.intersection(job_skills)
        score = round((len(common_skills) / len(job_skills)) * 100, 2) if job_skills else 0

        if score > 0:
            match_results.append({
                "job_id": job.id,
                "job_title": job.title,
                "company": job.company,
                "match_score": f"%{score}",
                "matched_skills": list(common_skills),
                "url": job.url,
                "source": job.source,
            })

    match_results.sort(
        key=lambda x: float(x["match_score"].replace("%", "")),
        reverse=True
    )

    return {
        "status": "success",
        "detected_profession": detected_profession,
        "user_extracted_skills": list(user_skills),
        "matches": match_results[:25],
    }