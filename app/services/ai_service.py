from loguru import logger

PROFESSION_KEYWORDS = {
    "Avukat": ["hukuk", "avukat", "baro", "dava", "müvekkil", "icra", "hukuki"],
    "Yazılım Mühendisi": ["python", "java", "react", "yazılım", "developer", "backend", "frontend", "fullstack", "software"],
    "Muhasebeci": ["muhasebe", "mali müşavir", "finans", "vergi", "fatura", "smmm"],
    "Doktor": ["tıp", "hastane", "doktor", "cerrah", "sağlık", "klinik", "hekim"],
    "Grafik Tasarımcı": ["photoshop", "illustrator", "tasarım", "design", "ui/ux", "adobe", "canva"],
    "Öğretmen": ["öğretmen", "eğitim", "ders", "okul", "pedagoji", "müfredat"],
    "Satış Temsilcisi": ["satış", "müşteri", "hedef", "prim", "crm", "teklif"],
    "İnsan Kaynakları": ["insan kaynakları", "ik", "işe alım", "hr", "bordro", "performans"],
    "Pazarlama Uzmanı": ["pazarlama", "marketing", "sosyal medya", "kampanya", "seo", "reklam"],
    "Mühendis": ["mühendis", "mühendislik", "autocad", "proje", "imalat", "üretim"],
    "Mimar": ["mimar", "mimarlık", "yapı", "inşaat", "çizim", "revit"],
    "Hemşire": ["hemşire", "hemşirelik", "hasta bakım", "klinik", "sağlık hizmetleri"],
    "Muhasebe": ["muhasebe", "defter", "gelir", "gider", "bilanço"],
}

def extract_profession_from_cv(cv_text: str) -> str:
    text = cv_text.lower()
    scores = {}
    for profession, keywords in PROFESSION_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[profession] = score
    if scores:
        detected = max(scores, key=scores.get)
        logger.info(f"Tespit edilen meslek: {detected}")
        return detected
    return "Genel"

def analyze_job_skills(title: str, description: str) -> str:
    return _keyword_fallback(title, description)

def _keyword_fallback(title: str, description: str) -> str:
    SKILLS = [
        "python", "javascript", "react", "sql", "java", "docker", "git",
        "excel", "iletişim", "takım çalışması", "ms office", "photoshop",
        "autocad", "muhasebe", "hukuk", "satış", "pazarlama", "ingilizce",
        "c++", "typescript", "nodejs", "django", "fastapi",
    ]
    text = (title + " " + description).lower()
    found = [s for s in SKILLS if s in text]
    return ", ".join(found) if found else "İletişim, Takım Çalışması"