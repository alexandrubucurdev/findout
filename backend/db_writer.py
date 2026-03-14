import firebase_admin
from firebase_admin import credentials, firestore
import hashlib
import os
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

# Inițializăm conexiunea cu Firebase
try:
    if os.path.exists("firebase_credentials.json"):
        cred = credentials.Certificate("firebase_credentials.json")
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Conexiune la Firebase realizată cu succes!")
    else:
        print("AVERTISMENT: Nu am găsit 'firebase_credentials.json'. Salvarea și cache-ul sunt dezactivate.")
        db = None
except Exception as e:
    print(f"Eroare la inițializarea Firebase: {e}")
    db = None

def curata_url(url):
    """
    Curăță URL-ul de parametrii de tracking și fragmente inutile
    pentru a maximiza eficiența cache-ului în baza de date.
    """
    parsed_url = urlparse(url)
    query_params = parse_qs(parsed_url.query)
    
    # Lista neagră cu parametrii care generează cache-miss-uri inutile
    parametri_de_sters = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'igshid', '_gl', 'ref', 'source'
    ]
    
    # Păstrăm doar parametrii care NU sunt de tracking
    query_curat = {k: v for k, v in query_params.items() if k not in parametri_de_sters}
    
    # Reconstruim query string-ul
    query_string_curat = urlencode(query_curat, doseq=True)
    
    # Reconstruim URL-ul complet (ignorând și fragmentul, ex: #comments)
    url_curat = urlunparse((
        parsed_url.scheme,
        parsed_url.netloc,
        parsed_url.path,
        parsed_url.params,
        query_string_curat,
        '' 
    ))
    
    # Eliminăm trailing slash-ul pentru consistență (ex: site.ro/stire/ == site.ro/stire)
    return url_curat.rstrip('/')

def genereaza_id_document(url):
    """
    Generează un ID unic și sigur pentru Firestore bazat pe link-ul știrii curățat.
    Folosim un hash MD5 pentru că Firestore nu acceptă caractere speciale (precum '/') în ID-uri.
    """
    url_optimizat = curata_url(url)
    return hashlib.md5(url_optimizat.encode('utf-8')).hexdigest()

def save_to_firestore(pachet_date):
    """
    Salvează pachetul final de date în colecția 'scans'[cite: 13, 14].
    """
    if not db:
        print("Baza de date nu este conectată. Trecem peste salvare.")
        return False

    try:
        url_articol = pachet_date.get("url")
        doc_id = genereaza_id_document(url_articol) # Acum primește URL curat
        
        # Salvăm în colecția 'scans' [cite: 14]
        doc_ref = db.collection('scans').document(doc_id)
        doc_ref.set(pachet_date)
        
        print(f"Pachetul a fost salvat cu succes în Firestore cu ID-ul: {doc_id}")
        return True
    except Exception as e:
        print(f"Eroare la salvarea în Firestore: {e}")
        return False

def verifica_daca_exista(url):
    """
    Funcție de Cache: Verifică dacă link-ul a fost deja scanat[cite: 24].
    """
    if not db:
        return None
        
    try:
        doc_id = genereaza_id_document(url) # Acum caută URL curat
        doc_ref = db.collection('scans').document(doc_id)
        doc = doc_ref.get()
        
        if doc.exists:
            print("Cache HIT: Am găsit articolul deja procesat în baza de date!")
            return doc.to_dict()
    except Exception as e:
        print(f"Eroare la citirea din Firestore: {e}")
        
    return None

def get_recent_scans(limit=3):
    """
    Returnează cele mai recente scanări pentru Landing Page.
    """
    if not db:
        return []
        
    try:
        docs = db.collection('scans').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit).stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        print(f"Eroare la citirea recentelor din Firestore: {e}")
        return []