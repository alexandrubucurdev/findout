import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv() # <-- Asta citește automat fișierul .env și încarcă variabilele

GOOGLE_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Nu am găsit cheia GEMINI_API_KEY în fișierul .env!")
genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel('gemini-3-flash-preview')

def analizeaza_articol(text):
    prompt = f"""
    Analizează următorul text extras dintr-un articol:
    
    TEXT:
    {text[:6000]}
    
    Returnează un obiect JSON cu următoarea structură:
    {{
        "scor_toxicitate": <număr 0-100>,
        "emotii_principale": ["<emoție 1>", "<emoție 2>"],
        "tehnici_manipulare": "<Scurtă explicație a tehnicilor>",
        "cuvinte_cheie_ro": "<4-5 cuvinte unice din text pentru căutare pe Google News România>",
        "cuvinte_cheie_en": "<Traducerea și adaptarea cuvintelor cheie pentru căutare pe Google News Internațional>"
    }}
    """
    try:
        # Forțăm modelul să răspundă strict în format JSON
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"\n[EROARE GEMINI ANALIZĂ] -> {e}\n")
        return {
            "scor_toxicitate": 0, 
            "emotii_principale": [], 
            "tehnici_manipulare": f"Eroare AI: {str(e)}", 
            "cuvinte_cheie": "frauda vacante online romani" # un fallback mai relevant
        }

def genereaza_rezumat_raspandire(istoric_sortat):
    if not istoric_sortat:
        return "Nu s-au găsit date suficiente."

    prompt = f"""
    Iată istoricul publicării unui subiect în presă, extras de pe Google News:
    {json.dumps(istoric_sortat, indent=2, ensure_ascii=False)}
    
    Scrie un scurt rezumat de 2-3 rânduri despre cum s-a răspândit această știre, cine a publicat primul și cum a fost preluată.
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"\n[EROARE GEMINI REZUMAT] -> {e}\n")
        return "Rezumat indisponibil din cauza unei erori AI."