from newspaper import Article
import trafilatura
import feedparser
import urllib.parse
import urllib.request
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone

def extrage_date_articol(url):
    """TASK 1: Extragerea inteligentă a textului folosind Trafilatura"""
    try:
        # 1. Folosim Newspaper3k pentru a extrage rapid Titlul și Imaginea Principală
        article = Article(url)
        article.download()
        article.parse() 
        titlu = article.title
        imagine = article.top_image

        # 2. Folosim TRAFILATURA pentru a extrage exclusiv corpul articolului
        # Trafilatura este expertă în ignorarea bannerelor de donații, meniurilor și reclamelor
        downloaded = trafilatura.fetch_url(url)
        text_curat = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
        
        # Fallback: Dacă vreodată trafilatura e blocată, folosim ce a găsit newspaper3k
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
    """Funcție internă pentru a interoga o anumită regiune/limbă pe Google News"""
    query_codificat = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={query_codificat}&hl={limba}&gl={tara}&ceid={tara}:{limba}"
    
    lista_articole = []
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        raspuns = urllib.request.urlopen(req)
        feed = feedparser.parse(raspuns)
        
        for entry in feed.entries[:15]: 
            lista_articole.append({
                "titlu": entry.title,
                "link": entry.link,
                "sursa": entry.source.title if hasattr(entry, 'source') else "Necunoscut",
                "data_publicarii": entry.published if hasattr(entry, 'published') else "Necunoscut",
                "domain": urllib.parse.urlparse(entry.link).netloc,
                "limba": limba
            })
    except Exception as e:
        print(f"Eroare Căutare Istoric ({limba}): {e}")
        
    return lista_articole

def cauta_istoric_raspandire_avansat(query_ro, query_en):
    """TASK 2: Căutare Globală: Combină rezultatele din RO și EN și elimină duplicatele"""
    
    articole_ro = cauta_google_news(query_ro, limba="ro", tara="RO")
    articole_en = cauta_google_news(query_en, limba="en", tara="US")
    
    toate_articolele = articole_ro + articole_en
    
    articole_unice = []
    linkuri_vazute = set()
    
    for art in toate_articolele:
        if art['link'] not in linkuri_vazute:
            linkuri_vazute.add(art['link'])
            articole_unice.append(art)
            
    return articole_unice

def identifica_pacient_zero(lista_articole):
    """Sortează după seendate pentru a vedea cine a publicat primul"""
    if not lista_articole: return []

    def extrage_timpul(articol):
        data_str = articol.get("data_publicarii", "")
        try:
            return parsedate_to_datetime(data_str)
        except Exception:
            return datetime.max.replace(tzinfo=timezone.utc)

    articole_sortate = sorted(lista_articole, key=extrage_timpul)
    if articole_sortate:
        articole_sortate[0]["pacient_zero"] = True 
    return articole_sortate