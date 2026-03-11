from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.db.session import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False, index=True)
    location = Column(String)
    description = Column(Text)
    url = Column(String, unique=True, nullable=False) # İlanın orijinal linki
    source = Column(String, nullable=True)  # "kariyer.net", "indeed" veya "linkedin"
    
    # --- AI Tarafından Doldurulacak Alanlar ---
    salary_range = Column(String, nullable=True) # AI ilandan maaş tahminini buraya yazacak
    skills = Column(Text, nullable=True) # Senin 'skills' dediğin yer, AI'nın ayıklayacağı teknolojiler
    
    created_at = Column(DateTime, default=datetime.utcnow)