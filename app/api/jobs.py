from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.job import Job
from app.schemas.job import JobCreate, JobResponse

router = APIRouter()

@router.get("/", response_model=List[JobResponse])
def get_jobs(db: Session = Depends(get_db), skip: int = 0, limit: int = 500):
    jobs = db.query(Job).offset(skip).limit(limit).all()
    return jobs

@router.post("/", response_model=JobResponse)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    # 1. Aynı URL ile daha önce kayıt yapılmış mı kontrol et
    existing_job = db.query(Job).filter(Job.url == job_in.url).first()
    if existing_job:
        raise HTTPException(status_code=400, detail="Bu ilan zaten sistemde kayıtlı.")
    
    # 2. Yeni ilanı oluştur (Girintiye dikkat: if bloğunun dışında olmalı)
    db_job = Job(**job_in.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job