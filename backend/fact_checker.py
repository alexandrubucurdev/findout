import os
import requests
from dotenv import load_dotenv

load_dotenv()

FACTCHECK_API_KEY = os.environ.get("GOOGLE_FACTCHECK_API_KEY")

def verifica_stire_oficial(query):
    """
    Caută cuvintele cheie în baza de date globală a fact-checkerilor.
    """
    if not FACTCHECK_API_KEY:
        print("Avertisment: Cheia pentru Fact Check lipsește din .env!")
        return []

    url = f"https://factchecktools.googleapis.com/v1alpha1/claims:search?query={query}&key={FACTCHECK_API_KEY}"
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "claims" in data:
                rezultate = []
                for claim in data["claims"][:2]: # Luăm primele 2 demontări oficiale
                    review = claim.get("claimReview", [{}])[0]
                    rezultate.append({
                        "organizatie": review.get("publisher", {}).get("name", "Necunoscut"),
                        "verdict": review.get("textualRating", "Fără verdict"),
                        "link_raport": review.get("url", ""),
                        "titlu_fals": claim.get("text", "")
                    })
                return rezultate
    except Exception as e:
        print(f"Eroare Fact Check API: {e}")
        
    return []