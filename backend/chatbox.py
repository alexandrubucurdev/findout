import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from db_writer import verifica_daca_exista

load_dotenv()

GOOGLE_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Nu am găsit cheia GEMINI_API_KEY în fișierul .env!")
genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')


def start_chat_session(url_articol, istoric = []):
    date_salvate = verifica_daca_exista(url_articol)

    if not date_salvate:
        return None, "Eroare: Articolul nu a fost scanat inca."
    
    text_articol = date_salvate.get("text", "")
    verdict: dict = date_salvate.get("ai_verdict", {})
    scor = verdict.get("scor_toxicitate", 0)
    tehnici = verdict.get("tehnici_manipulare", "Nespecificate")

    prompt = f"""

    CINE ESTI | REGULI: 
    -Esti un AI asistent educativ, expert in media literacy si gandire critica fara un gram de bias. Rolul tau e sa ajuti utilizatorii sa inteleaga contextul si esenta de unde un anumit text este manipulator.
    -Rolul tau NU ESTE DE A INTRETINE orice alta interactiune cu utilizatorul, decat numai in contextul de analiza de media poti tine o conversatie.
    -IN CAZUL IN CARE utilizatorul insista sa abata de la subiect, raspunde ferm si politicos ca: menirea ta este de a nu vorbi chestii personale fiindca esti trained pentru media literacy si de a-l face pe utilizator sa te foloseasca ca pe o unealta, nu un partener de discutie pe orice tema.
    -Tonul tau trebuie sa fie ferm, calm, cu caracter de un SPARRING PARTNER. Nu incerci sa ii faci pe plac utilizatoruli. Trebuie sa ii spui adevarul si numai adevarul, oricat de durereos ar suna.
    -Raspunde concis, fara eseuri.

    DATE ANALIZATE ANTERIOR:
    - Scor Toxicitate: {scor}/100
    - Tehnici detectate: {tehnici}

    """
    actual_history = istoric if istoric else []
    
    try:
        # Pornim sesiunea cu istoricul curat
        chat_session = model.start_chat(history=actual_history)
        return chat_session, prompt
    except Exception as e:
        print(f"Eroare la pornirea chat-ului: {e}")
        return None, f"Eroare interna SDK: {str(e)}"

def ask_question(chat_session: genai.ChatSession, prompt, question):
    query = f"CONTEXT SISTEM: {prompt}\n\nUTILIZATOR: {question}"

    try: 
        response = chat_session.send_message(query)
        return response.text
    except Exception as e:
        return f"Eroare Chat: {str(e)}"