from fastapi import FastAPI
from pydantic import BaseModel
import json
import os
from datetime import datetime
# Importăm uneltele tale din scraper_engine
from scraper_engine import extrage_date_articol, cauta_istoric_raspandire, identifica_pacient_zero

app = FastAPI(title="Cognitive Armor - Data Engine")

class ScanRequest(BaseModel):
    url: str

@app.post("/scan")
async def scan_pipeline(request: ScanRequest):
    """TASK 3: Conducta centrală de date [cite: 29]"""
    
    # 1. Extragerea (Task 1) [cite: 31, 81]
    date_brute = extrage_date_articol(request.url)
    if not date_brute:
        return {"status": "eroare", "mesaj": "Link inaccesibil."}

    # 2. Comunicarea cu Interogatorul (AI) - SIMULARE [cite: 32, 41]
    # In viitor aici va fi: verdict = ai_analyzer.analizeaza(date_brute['text'])
    keywords_simulati = f'"{date_brute["titlu"][:30]}"' # Simulăm cuvinte cheie [cite: 86]

    # 3. Căutarea Istorică (Task 2) [cite: 33, 88]
    istoric_brut = cauta_istoric_raspandire(keywords_simulati)
    
    # TASK 4: Planul B (Safety Net) [cite: 36, 38]
    if not istoric_brut and os.path.exists("mock_data.json"):
        with open("mock_data.json", "r") as f:
            istoric_brut = json.load(f).get("articles", [])

    # 4. Procesarea pentru Graf [cite: 97, 100]
    istoric_final = identifica_pacient_zero(istoric_brut)

    # 5. Pachetul final pentru Arhitect (Firebase) [cite: 35, 104]
    pachet_final = {
        "url": request.url,
        "title": date_brute["titlu"], 
        "text": date_brute["text"],
        "gdelt_nodes": istoric_final,
        "timestamp": str(datetime.now()) 
    }

    # 6. Salvarea în Firebase (Munca Arhitectului) [cite: 42, 105]
    # db_writer.save_to_firestore(pachet_final)

    return pachet_final