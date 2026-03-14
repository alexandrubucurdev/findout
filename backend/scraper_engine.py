from newspaper import Article
import trafilatura
import feedparser
import urllib.parse
import urllib.request
import requests 
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone
from bs4 import BeautifulSoup  # <-- NOU: Necesităm bs4 pentru validarea structurii paginii

def is_valid_news_article(html_content: str) -> bool:
    """
    Verifică dacă un HTML dat pare să fie un articol de știri.
    Returnează True dacă e valid, False dacă este o pagină principală, de contact, etc.
    """
    if not html_content:
        return False
        
    soup = BeautifulSoup(html_content, 'html.parser')

    # 1. Verificăm meta tag-urile Open Graph (Standardul de aur pentru știri)
    og_type = soup.find('meta', property='og:type')
    if og_type and 'article' in str(og_type.get('content', '')).lower():
        return True

    # 2. Verificăm dacă există tag-ul semantic <article> (folosit de 90% din ziare)
    if soup.find('article'):
        return True

    # 3. Verificăm JSON-LD (Schema.org) - multe site-uri folosesc asta pentru SEO/Google News
    scripts = soup.find_all('script', type='application/ld+json')
    for script in scripts:
        if script.string and ('"NewsArticle"' in script.string or '"Article"' in script.string):
            return True

    # 4. Fallback: Verificăm cantitatea de text din paragrafe
    # O știre reală ar trebui să aibă măcar ~150 de cuvinte text brut
    paragraphs = soup.find_all('p')
    text_content = " ".join([p.get_text(strip=True) for p in paragraphs])
    word_count = len(text_content.split())
    
    if word_count > 150:
        return True

    # Dacă nu a trecut de niciun test, aproape sigur nu e un articol
    return False


def extrage_date_articol(url):
    """TASK 1: Extragerea inteligentă a textului folosind Trafilatura și validarea paginii"""
    try:
        # Descărcăm HTML-ul brut prima dată pentru a-l verifica
        downloaded = trafilatura.fetch_url(url)
        
        if not downloaded:
            print("Nu s-a putut descărca HTML-ul paginii.")
            return None
            
        # VERIFICARE: Este cu adevărat o știre?
        if not is_valid_news_article(downloaded):
            print("Pagina nu a trecut testul de validare ca articol de știri.")
            return {"error": "not_an_article"}

        # Dacă e valid, continuăm extracția
        article = Article(url)
        article.download()
        article.parse() 
        titlu = article.title
        imagine = article.top_image

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
    query_codificat = urllib.parse.quote(query)
    url = f'https://api.gdeltproject.org/api/v2/doc/doc?query="{query_codificat}"&mode=artlist&format=json&timespan=7d'
    
    lista_articole = []
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            articles = data.get("articles", [])
            
            for entry in articles[:10]: # Extragem top 10 rezultate GDELT
                lista_articole.append({
                    "titlu": entry.get("title", "Necunoscut"),
                    "link": entry.get("url", ""),
                    "sursa": entry.get("domain", "Necunoscut"),
                    "data_publicarii": entry.get("seendate", ""), # Format ISO ex: 20260314T153000Z
                    "domain": entry.get("domain", ""),
                    "sursa_scanare": "GDELT"
                })
    except Exception as e:
        print(f"Eroare GDELT API: {e}")
        
    return lista_articole

def cauta_istoric_raspandire_avansat(query_ro, query_en):
    """TASK 2: Combină Google News (RO/EN) + GDELT Global și elimină duplicatele"""
    
    articole_ro = cauta_google_news(query_ro, limba="ro", tara="RO")
    articole_en = cauta_google_news(query_en, limba="en", tara="US")
    articole_gdelt = cauta_gdelt(query_en)
    
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