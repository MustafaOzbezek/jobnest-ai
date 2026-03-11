from pydantic import BaseModel, EmailStr

# Kayıt olurken istenecek veriler
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Veritabanından veri okurken kullanılacak (Şifre dışarı verilmez)
class UserRead(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True