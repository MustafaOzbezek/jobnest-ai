from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User  # Buraya dikkat: models/user.py içinde 'User' sınıfı olmalı
from app.schemas.user import UserCreate
from app.core import security
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        # 1. Email kontrolü
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı.")
        
        # 2. Yeni kullanıcıyı oluştur
        new_user = User(
            email=user_in.email,
            hashed_password=security.get_password_hash(user_in.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "Kayıt başarılı", "user_id": new_user.id}
    except Exception as e:
        db.rollback()
        logger.error(f"Kayıt hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sunucu hatası: {str(e)}")

@router.post("/login")
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı e-posta veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}