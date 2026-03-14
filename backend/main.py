from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware # Necesar pentru Web App + Extensie
from typing import List, Optional
from pydantic import BaseModel
import json
import os
from datetime import datetime
import asyncio 

# Importurile modulelor interne
from scraper_engine import extrage_date_articol, cauta_istoric_raspandire_avansat, identifica_pacient_zero
from ai_analyzer import analizeaza_articol, analizeaza_consens_si_rezumat
from db_writer import save_to_firestore, verifica_daca_exista, get_recent_scans
from chatbox import start_chat_session, ask_question
from fact_checker import verifica_stire_oficial

app = FastAPI(title="FindOut - Data Engine")

# ===============================================================
# CONFIGURARE CORS (Paznicul de la ușa API-ului tău)
# ===============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",                  # Dezvoltare Next.js
        "https://findout-gdg.web.app",            # Domeniul tău (Firebase Hosting)
        "chrome-extension://ID_EXTENSIE_AICI",    # Permite cereri de la extensia Chrome
    ],
    allow_credentials=True,
    allow_methods=["*"],                          # Permite GET, POST, OPTIONS etc.
    allow_headers=["*"],                          # Permite Content-Type, Authorization etc.
)

class ScanRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    url: str
    question: str
    history: Optional[List] = []

@app.post("/scan")
async def scan_pipeline(request: ScanRequest):
    """
    Fluxul principal de scanare: Verifică Cache -> Scrape -> AI -> Căutare Globală -> Salvare.
    """
    # 0. Verificăm în Cache (Firebase) async pentru a scuti timp și bani [cite: 14, 24]
    date_existente = await asyncio.to_thread(verifica_daca_exista, request.url)
    if date_existente:
        print(f"Cache HIT pentru {request.url}! Returnăm datele salvate.")
        return date_existente

    # 1. Extragerea (Task 1) async [cite: 30, 31, 32]
    date_brute = await asyncio.to_thread(extrage_date_articol, request.url)
    if not date_brute or not date_brute['text']:
        return {"status": "eroare", "mesaj": "Link inaccesibil sau fără conținut text."}

    # 2. Comunicarea cu Interogatorul (AI) async [cite: 33, 34, 35]
    verdict_ai = await asyncio.to_thread(analizeaza_articol, date_brute['text'])
    
    # --- FILTRU DE SIGURANȚĂ PENTRU CUVINTE CHEIE ---
    cuvinte_ro = verdict_ai.get('cuvinte_cheie_ro', date_brute["titlu"][:30])
    cuvinte_en = verdict_ai.get('cuvinte_cheie_en', "news")

    if isinstance(cuvinte_ro, list): cuvinte_ro = " ".join(cuvinte_ro)
    if not cuvinte_ro: cuvinte_ro = date_brute["titlu"][:30]
        
    if isinstance(cuvinte_en, list): cuvinte_en = " ".join(cuvinte_en)
    if not cuvinte_en: cuvinte_en = "news"

    cuvinte_ro, cuvinte_en = str(cuvinte_ro), str(cuvinte_en)

    # 3. Căutarea Istorică (GDELT/News) și Fact-Checks rulate SIMULTAN [cite: 38, 39, 44]
    istoric_brut, fact_checks_oficiali = await asyncio.gather(
        asyncio.to_thread(cauta_istoric_raspandire_avansat, cuvinte_ro, cuvinte_en),
        asyncio.to_thread(verifica_stire_oficial, cuvinte_en)
    )
    
    # TASK 4: Planul B (Safety Net)
    if not istoric_brut and os.path.exists("mock_data.json"):
        with open("mock_data.json", "r") as f:
            istoric_brut = json.load(f).get("articles", [])

    # 4. Procesarea pentru Graf: Identificăm Pacientul Zero [cite: 47, 60]
    istoric_final = identifica_pacient_zero(istoric_brut)

    # 5. Generare Rezumat AI + Consens Global [cite: 50, 51]
    analiza_comparativa = await asyncio.to_thread(analizeaza_consens_si_rezumat, date_brute['text'], istoric_final)

    # 6. Pachetul final pentru Arhitect și Frontend
    pachet_final = {
        "url": request.url,
        "title": date_brute["titlu"], 
        "text": date_brute["text"],
        "ai_verdict": verdict_ai,
        "news_nodes": istoric_final,
        "veridicitate": analiza_comparativa.get("status_veridicitate"),
        "explicatie_consens": analiza_comparativa.get("explicatie_consens"),
        "ai_summary": analiza_comparativa.get("rezumat_raspandire"),
        "fact_checks": fact_checks_oficiali,
        "timestamp": str(datetime.now()) 
    }

    # 7. Salvarea în Firebase async [cite: 13, 54]
    await asyncio.to_thread(save_to_firestore, pachet_final)

    return pachet_final

# ===============================================================
# ENDPOINT PENTRU RECENT THREATS
# ===============================================================
@app.get("/recent")
async def get_recent():
    rezultate = await asyncio.to_thread(get_recent_scans, 3)
    return {"recent_scans": rezultate}

# ===============================================================
# NOU: Arhitectura WebSocket pentru Chat (Stateful & Rapid)
# ===============================================================
@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """
    Interfață de chat în timp real (sparring partner). 
    Menține contextul articolului pe durata sesiunii. [cite: 62, 65]
    """
    await websocket.accept()
    
    try:
        # 1. Primim link-ul articolului pentru context
        config_data = await websocket.receive_json()
        url_articol = config_data.get("url")
        
        if not url_articol:
            await websocket.send_json({"error": "Nu ai trimis URL-ul articolului."})
            await websocket.close()
            return

        # 2. Creăm instanța de chat (inițializează contextul din DB) [cite: 66, 67]
        chat_session, status = await asyncio.to_thread(start_chat_session, url_articol, [])
        
        if chat_session is None:
            await websocket.send_json({"error": status})
            await websocket.close()
            return
            
        await websocket.send_json({"status": "ready"})
        
        # 4. BUCLA DE CHAT - Rezistentă la erori izolate
        while True:
            try:
                user_question = await websocket.receive_text()
                
                # Trimitem la AI pe un thread separat (blocking I/O) [cite: 70]
                raspuns = await asyncio.to_thread(ask_question, chat_session, "", user_question)
                
                await websocket.send_text(raspuns)
                
            except WebSocketDisconnect:
                print(f"🔌 WebSocket deconectat pentru {url_articol}.")
                break
                
            except Exception as e:
                print(f"⚠️ Eroare Chat: {e}")
                await websocket.send_text(f"[Eroare AI: {str(e)[:50]}... Încearcă din nou.]")
            
    except Exception as e:
        print(f"❌ Eroare fatală WebSocket: {e}")
        if websocket.client_state.name != "DISCONNECTED":
            await websocket.close()

# ===============================================================
# VECHI: Endpoint-ul REST (Fallback pentru medii fără WS)
# ===============================================================
@app.post("/chat")
async def chat_with_article(request: ChatRequest):
    formatted_history = []
    if request.history:
        for msg in request.history:
            formatted_history.append({
                "role": msg.get("role", "user"),
                "parts": [msg.get("parts", "")]
            })
    
    chat_session, status = await asyncio.to_thread(start_chat_session, request.url, formatted_history)

    if chat_session is None:
        raise HTTPException(status_code=404, detail=status) 

    raspuns = await asyncio.to_thread(ask_question, chat_session, "", request.question)

    return {"answer": raspuns, "url": request.url}