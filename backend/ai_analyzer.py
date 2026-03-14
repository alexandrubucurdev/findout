import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv() # <-- Asta citește automat fișierul .env și încarcă variabilele

GOOGLE_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Nu am găsit cheia GEMINI_API_KEY în fișierul .env!")
genai.configure(api_key=GOOGLE_API_KEY)

# Folosim modelul tău
model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')

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
            "cuvinte_cheie_ro": "frauda",
            "cuvinte_cheie_en": "fraud"
        }

def analizeaza_consens_si_rezumat(text_original, istoric_sortat):
    """
    Compară textul original cu titlurile din Google News pentru a găsi ADEVĂRUL OBIECTIV.
    """
    if not istoric_sortat:
        return {
            "status_veridicitate": "Neconfirmat",
            "explicatie_consens": "Nu am găsit alte surse care să preia acest subiect pentru a putea stabili adevărul obiectiv.",
            "rezumat_raspandire": "Nu s-au găsit date suficiente pentru a urmări răspândirea."
        }

    # Extragem doar titlurile și sursele pentru a oferi un context curat AI-ului
    lista_titluri = [{"sursa": art['sursa'], "titlu": art['titlu']} for art in istoric_sortat]

    prompt = f"""
    Ești un jurnalist de investigație de top și expert în fact-checking. Ai la dispoziție două seturi de date:
    
    1. AFIRMAȚIILE DIN ARTICOLUL ORIGINAL (sursa pe care o investigăm):
    {text_original[:3000]}
    
    2. CUM A FOST ACOPERIT SUBIECTUL ÎN PRESA GLOBALĂ (Google News):
    {json.dumps(lista_titluri, ensure_ascii=False)}
    
    Misiunea ta este să găsești ADEVĂRUL OBIECTIV făcând "cross-referencing". 
    Analizează critic: Presa main-stream confirmă ceea ce se spune în articolul original? 
    Sau presa globală publică titluri care demontează/contrazic articolul? Dacă o știre alarmistă apare doar pe site-uri obscure și este ignorată de marii publisheri, raportează acest lucru.
    
    Returnează DOAR un obiect JSON valid cu următoarea structură:
    {{
        "status_veridicitate": "<Alege strict una din: Confirmat / Parțial Adevărat / Fals / Demontat de presă / Suspect/Neconfirmat>",
        "explicatie_consens": "<O analiză obiectivă, mai lungă, de 3-4 fraze, în care explici clar care este realitatea, bazându-te pe contrastul dintre articolul original și titlurile din presa globală.>",
        "rezumat_raspandire": "<Scurt rezumat militar (SITREP) de 2 rânduri despre cum s-a propagat știrea (cine a publicat primul, cine a preluat).>"
    }}
    """
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"\n[EROARE GEMINI CONSENS] -> {e}\n")
        return {
            "status_veridicitate": "Eroare Analiză",
            "explicatie_consens": "Nu am putut face analiza comparativă din cauza unei erori AI.",
            "rezumat_raspandire": "SITREP Indisponibil."
        }