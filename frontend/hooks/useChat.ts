// src/hooks/useChat.ts
import { useState, useEffect, useCallback } from "react";

export function useChat(articleUrl: string) {
     const [socket, setSocket] = useState<WebSocket | null>(null);
     const [messages, setMessages] = useState<
          { sender: "ai" | "user"; text: string }[]
     >([
          {
               sender: "ai",
               text: "Salut! Sunt asistentul tău AI de analiză. Cum te pot ajuta să înțelegi mai bine această știre?",
          },
     ]);
     const [isThinking, setIsThinking] = useState(false);

     useEffect(() => {
          if (!articleUrl) return; // Așteptăm să avem un URL valid înainte de a ne conecta

          const ws = new WebSocket("ws://localhost:8000/ws/chat");

          ws.onopen = () => {
               // Pasul 1: Trimitem URL-ul pentru context imediat după conectare
               ws.send(JSON.stringify({ url: articleUrl }));
          };

          ws.onmessage = (event) => {
               try {
                    const data = JSON.parse(event.data);
                    // Ignoră mesajul de status "ready" sau alte mesaje de control
                    if (data.status === "ready") {
                         return;
                    }
               } catch (e) {
                    // Dacă nu este JSON, presupunem că este un mesaj text de la AI
                    setMessages((prev) => [
                         ...prev,
                         { sender: "ai", text: event.data },
                    ]);
                    setIsThinking(false);
               }
          };

          ws.onerror = () => setIsThinking(false);
          ws.onclose = () => setIsThinking(false);

          setSocket(ws);
          return () => ws.close();
     }, [articleUrl]);

     const sendMessage = useCallback(
          (text: string) => {
               if (socket && socket.readyState === WebSocket.OPEN) {
                    setMessages((prev) => [...prev, { sender: "user", text }]);
                    socket.send(text); // Backend-ul primește textul simplu
                    setIsThinking(true);
               }
          },
          [socket],
     );

     return { messages, sendMessage, isThinking };
}
