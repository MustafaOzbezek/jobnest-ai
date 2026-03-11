import sys
import asyncio

# --- WINDOWS PLAYWRIGHT YAMASI ---
# En üstte olmalı! Windows'ta subprocess (tarayıcı) başlatmayı sağlar.
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Uygulama başlarken scheduler'ı güvenli bir şekilde çalıştırır
    try:
        from app.core.scheduler import start_scheduler
        start_scheduler()
    except Exception as e:
        print(f"Scheduler hatası: {e}")
    yield

app = FastAPI(title="JobNest AI API", version="1.0.0", lifespan=lifespan)

# --- CORS AYARLARI ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTER KAYITLARI ---
from app.api import auth, jobs, match
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(match.router, prefix="/match", tags=["Match"])

@app.get("/")
def read_root():
    return {"status": "online", "project": "JobNest AI", "os": sys.platform}