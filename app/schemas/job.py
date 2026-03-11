from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    salary_range: Optional[str] = None
    skills: Optional[str] = None  # Modeldeki isimle aynı (AI burayı dolduracak)
    url: str                      # Modeldeki 'url' kolonuyla aynı
    source: Optional[str] = None  # kariyer.net, indeed vb.

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True # SQLAlchemy modellerini Pydantic'e dönüştürmek için şart