import firebase_admin
from firebase_admin import credentials, firestore
import hashlib
import os

# Inițializăm conexiunea cu Firebase doar dacă găsim fișierul cu cheia de serviciu
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

def genereaza_id_document(url):
    """
    Generează un ID unic și sigur pentru Firestore bazat pe link-ul știrii.
    Folosim un hash MD5 pentru că Firestore nu acceptă caractere speciale (precum '/') în ID-uri.
    """
    return hashlib.md5(url.encode('utf-8')).hexdigest()

def save_to_firestore(pachet_date):
    """
    Salvează pachetul final de date în colecția 'scans'.
    """
    if not db:
        print("Baza de date nu este conectată. Trecem peste salvare.")
        return False

    try:
        url_articol = pachet_date.get("url")
        doc_id = genereaza_id_document(url_articol)
        
        # Salvăm în colecția 'scans', exact cum specifică planul tău tehnic
        doc_ref = db.collection('scans').document(doc_id)
        doc_ref.set(pachet_date)
        
        print(f"Pachetul a fost salvat cu succes în Firestore cu ID-ul: {doc_id}")
        return True
    except Exception as e:
        print(f"Eroare la salvarea în Firestore: {e}")
        return False

def verifica_daca_exista(url):
    """
    Funcție de Cache: Verifică dacă link-ul a fost deja scanat.
    Dacă da, returnează datele salvate ca să le dăm direct utilizatorului.
    """
    if not db:
        return None
        
    try:
        doc_id = genereaza_id_document(url)
        doc_ref = db.collection('scans').document(doc_id)
        doc = doc_ref.get()
        
        if doc.exists:
            print("Cache HIT: Am găsit articolul deja procesat în baza de date!")
            return doc.to_dict()
    except Exception as e:
        print(f"Eroare la citirea din Firestore: {e}")
        
    return None