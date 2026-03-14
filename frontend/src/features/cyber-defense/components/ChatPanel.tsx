"use client";

import { useState } from "react";
import { MessageSquare, Send, Bot, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Salut! Sunt asistentul tău AI de analiză. Cum te pot ajuta să înțelegi mai bine această știre?",
    sender: "ai",
    timestamp: "14:32",
  },
];

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("ro-RO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() +1 ,
        text: "Am analizat întrebarea ta. Această știre folosește mai multe tehnici de manipulare, printre care și whataboutism pentru a devia atenția de la subiectul principal.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString("ro-RO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-700 px-5 py-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono tracking-wider text-lg">
            CHAT BOX
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-mono mt-1">
          AI Chat Assistant
        </p>
      </div>

      {/* Messages Area */}
<div className="h-[300px] overflow-y-auto p-5 space-y-4"> 
      {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === "ai"
                  ? "bg-cyan-950 border border-cyan-700"
                  : "bg-slate-700"
              }`}
            >
              {message.sender === "ai" ? (
                <Bot className="w-4 h-4 text-cyan-400" />
              ) : (
                <User className="w-4 h-4 text-slate-300" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`flex-1 max-w-[80%] ${
                message.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-lg ${
                  message.sender === "ai"
                    ? "bg-slate-950 border border-slate-800"
                    : "bg-gradient-to-r from-cyan-900 to-green-900 border border-cyan-800"
                }`}
              >
                <p className="text-sm text-slate-200 leading-relaxed">
                  {message.text}
                </p>
              </div>
              <span className="text-xs text-slate-600 font-mono mt-1 block px-1">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 p-4 bg-slate-950">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Întreabă AI-ul despre această știre..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-700 transition-colors font-mono"
          />
          <button
            onClick={handleSend}
            className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-green-600 rounded-lg hover:from-cyan-500 hover:to-green-500 transition-all duration-300 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
