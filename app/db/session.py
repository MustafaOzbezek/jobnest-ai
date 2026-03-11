from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Veritabanı motorunu oluşturuyoruz (.env içindeki DATABASE_URL'i kullanır)
engine = create_engine(settings.DATABASE_URL)

# Veritabanı ile konuşacak olan oturum fabrikası
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Modellerimizi (User, Job vb.) bu sınıftan türeteceğiz (SQLAlchemy standardı)
Base = declarative_base()

# Dependency: API endpoint'lerinde DB session yönetimi için kullanacağız
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()