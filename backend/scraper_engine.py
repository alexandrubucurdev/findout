from newspaper import Article
import feedparser
import urllib.parse
import urllib.request
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone

def extrage_date_articol(url):
    """TASK 1: Extragerea Textului, Titlului și Imaginii [cite: 13, 14]"""
    try:
        article = Article(url)
        article.download()
        article.parse() 
        return {
            "titlu": article.title,
            "text": article.text,
            "imagine_principala": article.top_image 
        }
    except Exception as e:
        print(f"Eroare Scraper: {e}")
        return None

def cauta_istoric_raspandire(query_boolean, limba="ro", tara="RO"):
    """TASK 2: Căutarea în arhiva globală (Google News RSS / GDELT) [cite: 22, 23]"""
    query_codificat = urllib.parse.quote(query_boolean)
    url = f"https://news.google.com/rss/search?q={query_codificat}&hl={limba}&gl={tara}&ceid={tara}:{limba}"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        raspuns = urllib.request.urlopen(req)
        feed = feedparser.parse(raspuns)
        
        lista_articole = []
        for entry in feed.entries[:10]: # Extragem lista de articole 
            lista_articole.append({
                "titlu": entry.title,
                "link": entry.link,
                "sursa": entry.source.title if hasattr(entry, 'source') else "Necunoscut",
                "data_publicarii": entry.published if hasattr(entry, 'published') else "Necunoscut",
                "domain": urllib.parse.urlparse(entry.link).netloc
            })
        return lista_articole
    except Exception as e:
        print(f"Eroare Căutare Istoric: {e}")
        return []

def identifica_pacient_zero(lista_articole):
    """Sortează după seendate pentru a vedea cine a publicat primul [cite: 98]"""
    if not lista_articole: return []

    def extrage_timpul(articol):
        data_str = articol.get("data_publicarii", "")
        try:
            return parsedate_to_datetime(data_str)
        except Exception:
            return datetime.max.replace(tzinfo=timezone.utc)

    # Sortăm cronologic pentru a desena graful [cite: 100]
    articole_sortate = sorted(lista_articole, key=extrage_timpul)
    if articole_sortate:
        articole_sortate[0]["pacient_zero"] = True # Nodul central / Sursa cea mai veche [cite: 111]
    return articole_sortate