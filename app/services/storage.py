import os
import shutil
from fastapi import UploadFile

UPLOAD_DIR = "uploads/cvs"

# Klasör yoksa oluştur
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def save_upload_file(upload_file: UploadFile, user_id: int) -> str:
    # Dosya adını güvenli ve benzersiz yapalım
    file_extension = os.path.splitext(upload_file.filename)[1]
    file_path = f"{UPLOAD_DIR}/user_{user_id}{file_extension}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path