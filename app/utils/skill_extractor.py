import re

# Genişletilebilir yetenek havuzu
SKILL_KEYWORDS = [
    "python", "java", "javascript", "typescript", "react", "vue", "angular",
    "node.js", "express", "fastapi", "django", "flask", "postgresql", "mongodb",
    "sql", "nosql", "aws", "docker", "kubernetes", "git", "rest api", "graphql",
    "c#", "dotnet", "asp.net", "php", "laravel", "swift", "kotlin", "flutter"
]

def extract_skills(text: str):
    if not text:
        return []
    
    found_skills = set()
    # Metni küçük harfe çevirip kelime kelime kontrol ediyoruz
    text = text.lower()
    
    for skill in SKILL_KEYWORDS:
        # Kelime sınırlarına bakarak (regex) tam eşleşme arıyoruz
        # Örn: 'java' ararken 'javascript' içinde bulmaması için \b kullanıyoruz
        pattern = rf"\b{re.escape(skill)}\b"
        if re.search(pattern, text):
            found_skills.add(skill)
            
    return list(found_skills)