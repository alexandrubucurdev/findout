from newspaper import Article
import trafilatura
import feedparser
import urllib.parse
import urllib.request
import requests # <-- NOU: Necesar pentru API-ul GDELT
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone

def extrage_date_articol(url):
    """TASK 1: Extragerea inteligentă a textului folosind Trafilatura"""
    try:
        article = Article(url)
        article.download()
        article.parse() 
        titlu = article.title
        imagine = article.top_image

        downloaded = trafilatura.fetch_url(url)
        text_curat = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
        
        if not text_curat or len(text_curat) < 100:
            print("Trafilatura nu a putut extrage textul, se revine la Newspaper3k.")
            text_curat = article.text.strip()

        return {
            "titlu": titlu,
            "text": text_curat,
            "imagine_principala": imagine 
        }
    except Exception as e:
        print(f"Eroare Scraper: {e}")
        return None

def cauta_google_news(query, limba, tara):
    """Caută în Google News (Presa Mainstream & Locală)"""
    query_codificat = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={query_codificat}&hl={limba}&gl={tara}&ceid={tara}:{limba}"
    
    lista_articole = []
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        raspuns = urllib.request.urlopen(req)
        feed = feedparser.parse(raspuns)
        
        for entry in feed.entries[:10]: # Reducem la 10 pentru a face loc rezultatelor GDELT
            lista_articole.append({
                "titlu": entry.title,
                "link": entry.link,
                "sursa": entry.source.title if hasattr(entry, 'source') else "Necunoscut",
                "data_publicarii": entry.published if hasattr(entry, 'published') else "Necunoscut",
                "domain": urllib.parse.urlparse(entry.link).netloc,
                "sursa_scanare": "Google News"
            })
    except Exception as e:
        print(f"Eroare Căutare Istoric ({limba}): {e}")
        
    return lista_articole

def cauta_gdelt(query):
    """Caută în GDELT 2.0 (Baza de date globală pentru Pacientul Zero)"""
    # Folosim exact structura din Planul Tehnic Detaliat
    query_codificat = urllib.parse.quote(query)
    url = f'https://api.gdeltproject.org/api/v2/doc/doc?query="{query_codificat}"&mode=artlist&format=json&timespan=7d'
    
    lista_articole = []
    try:
        # Folosim timeout pentru ca I/O sa nu tina sistemul ocupat excesiv
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            articles = data.get("articles", [])
            
            for entry in articles[:10]: # Extragem top 10 rezultate GDELT
                lista_articole.append({
                    "titlu": entry.get("title", "Necunoscut"),
                    "link": entry.get("url", ""),
                    "sursa": entry.get("domain", "Necunoscut"),
                    "data_publicarii": entry.get("seendate", ""), # GDELT are format ISO ex: 20260314T153000Z
                    "domain": entry.get("domain", ""),
                    "sursa_scanare": "GDELT"
                })
    except Exception as e:
        print(f"Eroare GDELT API: {e}")
        
    return lista_articole

def cauta_istoric_raspandire_avansat(query_ro, query_en):
    """TASK 2: Combină Google News (RO/EN) + GDELT Global și elimină duplicatele"""
    
    # Acum că le apelăm simultan din `main.py` (via asyncio.to_thread), 
    # intern aici codul poate rula secvențial, dar per total sistemul e rapid.
    articole_ro = cauta_google_news(query_ro, limba="ro", tara="RO")
    articole_en = cauta_google_news(query_en, limba="en", tara="US")
    articole_gdelt = cauta_gdelt(query_en) # GDELT funcționează optim pe cuvinte cheie în engleză/nume proprii
    
    toate_articolele = articole_ro + articole_en + articole_gdelt
    
    articole_unice = []
    linkuri_vazute = set()
    
    for art in toate_articolele:
        # Filtrăm link-urile goale și duplicatele
        if art['link'] and art['link'] not in linkuri_vazute:
            linkuri_vazute.add(art['link'])
            articole_unice.append(art)
            
    return articole_unice

def identifica_pacient_zero(lista_articole):
    """Sortează după timp pentru a vedea cine a publicat primul"""
    if not lista_articole: return []

    def extrage_timpul(articol):
        data_str = articol.get("data_publicarii", "")
        if not data_str:
            return datetime.max.replace(tzinfo=timezone.utc)
            
        try:
            # 1. Încearcă formatul standard RSS (Folosit de Google News)
            return parsedate_to_datetime(data_str)
        except Exception:
            pass
            
        try:
            # 2. Încearcă formatul GDELT (ex: 20260314T153000Z)
            return datetime.strptime(data_str, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)
        except Exception:
            # Fallback dacă data nu poate fi citită
            return datetime.max.replace(tzinfo=timezone.utc)

    articole_sortate = sorted(lista_articole, key=extrage_timpul)
    if articole_sortate:
        articole_sortate[0]["pacient_zero"] = True 
    return articole_sortate