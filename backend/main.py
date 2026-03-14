from fastapi import FastAPI , HTTPException
from typing import List, Optional
from chatbox import start_chat_session, ask_question
from pydantic import BaseModel
import json
import os
from datetime import datetime

from scraper_engine import extrage_date_articol, cauta_istoric_raspandire_avansat, identifica_pacient_zero
from ai_analyzer import analizeaza_articol, analizeaza_consens_si_rezumat
from db_writer import save_to_firestore, verifica_daca_exista
from fact_checker import verifica_stire_oficial

app = FastAPI(title="FindOut - Data Engine")

class ScanRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    url: str
    question: str
    history: Optional[List] = []

@app.post("/scan")
async def scan_pipeline(request: ScanRequest):

    # 0. Verificăm în Cache (Firebase) pentru a scuti timp și bani
    date_existente = verifica_daca_exista(request.url)
    if date_existente:
        print(f"Date găsite în baza de date pentru {request.url}! Returnăm cache-ul.")
        return date_existente

    # 1. Extragerea (Task 1)
    date_brute = extrage_date_articol(request.url)
    if not date_brute or not date_brute['text']:
        return {"status": "eroare", "mesaj": "Link inaccesibil sau fără conținut text."}

    # 2. Comunicarea cu Interogatorul (AI)
    # Aici cerem verdictul și cuvintele cheie direct de la Gemini
    verdict_ai = analizeaza_articol(date_brute['text'])
    cuvinte_ro = verdict_ai.get('cuvinte_cheie_ro', date_brute["titlu"][:30])
    cuvinte_en = verdict_ai.get('cuvinte_cheie_en', "news")

    # --- FILTRU DE SIGURANȚĂ PENTRU AI ---
    # Dacă Gemini returnează o listă, le unim cu spațiu. Dacă e gol, luăm din titlu.
    if isinstance(cuvinte_ro, list):
        cuvinte_ro = " ".join(cuvinte_ro)
    if not cuvinte_ro:
        cuvinte_ro = date_brute["titlu"][:30]
        
    if isinstance(cuvinte_en, list):
        cuvinte_en = " ".join(cuvinte_en)
    if not cuvinte_en:
        cuvinte_en = "news"

    # Forțăm convertirea în string pentru a nu bloca crearea URL-ului de căutare
    cuvinte_ro = str(cuvinte_ro)
    cuvinte_en = str(cuvinte_en)
    # ---------------------------------------

    # 3. Căutarea Istorică (Task 2) și Verificarea Oficială
    istoric_brut = cauta_istoric_raspandire_avansat(cuvinte_ro, cuvinte_en)
    fact_checks_oficiali = verifica_stire_oficial(cuvinte_en)
    
    # TASK 4: Planul B (Safety Net)
    if not istoric_brut and os.path.exists("mock_data.json"):
        with open("mock_data.json", "r") as f:
            istoric_brut = json.load(f).get("articles", [])

    # 4. Procesarea pentru Graf
    istoric_final = identifica_pacient_zero(istoric_brut)

    # 5. Generare Rezumat AI + Fact-Checking prin Consens
    analiza_comparativa = analizeaza_consens_si_rezumat(date_brute['text'], istoric_final)

    # 6. Pachetul final pentru Arhitect (Firebase) și Frontend
    pachet_final = {
        "url": request.url,
        "title": date_brute["titlu"], 
        "text": date_brute["text"],
        "ai_verdict": verdict_ai,
        "news_nodes": istoric_final,
        "veridicitate": analiza_comparativa.get("status_veridicitate"),
        "explicatie_consens": analiza_comparativa.get("explicatie_consens"),
        "ai_summary": analiza_comparativa.get("rezumat_raspandire"),
        "fact_checks": fact_checks_oficiali,  # Acum trimitem și alertele oficiale mai departe!
        "timestamp": str(datetime.now()) 
    }

    # 7. Salvarea în Firebase
    save_to_firestore(pachet_final)

    return pachet_final


@app.post("/chat")
async def chat_with_article(request: ChatRequest):
    """Endpoint-ul de chatbot care folosește logica din chatbot.py"""
    

    formatted_history = []
    if request.history:
        for msg in request.history:
            formatted_history.append({
                "role": msg.get("role", "user"),
                "parts": [msg.get("parts", "")]
                })
    
    chat_session, system_prompt = start_chat_session(request.url, istoric=formatted_history)

    if chat_session is None:
        raise HTTPException(status_code=404, detail=system_prompt) 

    raspuns = ask_question(chat_session, system_prompt, request.question)

    return {
        "answer": raspuns,
        "url": request.url
    }

