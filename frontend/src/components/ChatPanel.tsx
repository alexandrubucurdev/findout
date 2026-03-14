"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { useChat } from "../../hooks/useChat";

function FormattedText({ text, animate }: { text: string; animate?: boolean }) {
     const [displayedText, setDisplayedText] = useState(animate ? "" : text);

     useEffect(() => {
          if (!animate) {
               setDisplayedText(text);
               return;
          }
          let i = 0;
          const timer = setInterval(() => {
               i += 2;
               setDisplayedText(text.slice(0, i));

               requestAnimationFrame(() => {
                    const container = document.getElementById(
                         "chat-scroll-container",
                    );
                    if (container) {
                         container.scrollTop = container.scrollHeight;
                    }
               });

               if (i >= text.length) clearInterval(timer);
          }, 15);
          return () => clearInterval(timer);
     }, [text, animate]);

     const formatMarkdown = (raw: string) => {
          let processed = raw.replace(/(?:\n|^)[\*\-]\s/g, "\n• ");
          const parts = processed.split(/(\*\*.*?\*\*)/g);
          return parts.map((part, index) => {
               if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                         <strong
                              key={index}
                              className="text-cyan-300 font-semibold"
                         >
                              {part.slice(2, -2)}
                         </strong>
                    );
               }
               return <span key={index}>{part}</span>;
          });
     };

     return (
          <p className="text-[13px] sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
               {formatMarkdown(displayedText)}
          </p>
     );
}

export default function ChatPanel({ articleUrl }: { articleUrl?: string }) {
     const { messages, sendMessage, isThinking } = useChat(articleUrl || "");
     const [inputValue, setInputValue] = useState("");
     const chatContainerRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
          if (chatContainerRef.current) {
               const container = chatContainerRef.current;
               container.scrollTo({
                    top: container.scrollHeight,
                    behavior: "smooth",
               });
          }
     }, [messages, isThinking]);

     const handleSend = () => {
          if (!inputValue.trim()) return;
          sendMessage(inputValue);
          setInputValue("");
     };

     return (
          <div className="h-[500px] sm:h-[550px] lg:h-[600px] w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden flex flex-col shadow-lg">
               {/* Header */}
               <div className="bg-slate-950 border-b border-slate-700 px-4 sm:px-5 py-3 sm:py-4 flex-shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                         <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                         <h3 className="font-mono tracking-wider text-base sm:text-lg">
                              CHAT BOX
                         </h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-mono mt-1 ml-6 sm:ml-8">
                         AI Chat Assistant
                    </p>
               </div>

               {/* Messages Area */}
               <div
                    ref={chatContainerRef}
                    id="chat-scroll-container"
                    className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-5 scroll-smooth"
               >
                    {messages.map((message, index) => (
                         <div
                              key={index}
                              className={`flex gap-2 sm:gap-3 ${
                                   message.sender === "user"
                                        ? "flex-row-reverse"
                                        : "flex-row"
                              }`}
                         >
                              {/* Avatar */}
                              <div
                                   className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                                        message.sender === "ai"
                                             ? "bg-cyan-950 border border-cyan-700"
                                             : "bg-slate-700"
                                   }`}
                              >
                                   {message.sender === "ai" ? (
                                        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                                   ) : (
                                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
                                   )}
                              </div>

                              {/* Message Bubble */}
                              <div
                                   className={`flex-1 max-w-[85%] sm:max-w-[75%] ${
                                        message.sender === "user"
                                             ? "items-end"
                                             : "items-start"
                                   }`}
                              >
                                   <div
                                        className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg ${
                                             message.sender === "ai"
                                                  ? "bg-slate-950 border border-slate-800 rounded-tl-sm"
                                                  : "bg-gradient-to-r from-cyan-900 to-green-900 border border-cyan-800 rounded-tr-sm"
                                        }`}
                                   >
                                        {message.sender === "ai" ? (
                                             <FormattedText
                                                  text={message.text}
                                                  animate={true}
                                             />
                                        ) : (
                                             <p className="text-[13px] sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                                                  {message.text}
                                             </p>
                                        )}
                                   </div>
                              </div>
                         </div>
                    ))}

                    {/* Loading state */}
                    {isThinking && (
                         <div className="flex gap-2 sm:gap-3 flex-row">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-cyan-950 border border-cyan-700 mt-1">
                                   <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                              </div>
                              <div className="flex flex-col flex-1 max-w-[85%] sm:max-w-[75%] items-start">
                                   <div className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg rounded-tl-sm bg-slate-950 border border-slate-800 flex items-center gap-1.5 h-[38px] sm:h-[44px]">
                                        <div
                                             className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full animate-bounce"
                                             style={{ animationDelay: "0ms" }}
                                        ></div>
                                        <div
                                             className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full animate-bounce"
                                             style={{ animationDelay: "150ms" }}
                                        ></div>
                                        <div
                                             className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full animate-bounce"
                                             style={{ animationDelay: "300ms" }}
                                        ></div>
                                   </div>
                              </div>
                         </div>
                    )}
               </div>

               {/* Input Area */}
               <div className="border-t border-slate-700 p-3 sm:p-4 bg-slate-950 flex-shrink-0">
                    <div className="flex gap-2 sm:gap-3 relative">
                         <input
                              type="text"
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyDown={(e) =>
                                   e.key === "Enter" && handleSend()
                              }
                              placeholder="Întreabă AI-ul..."
                              className="flex-1 w-full pl-3 pr-10 sm:px-4 py-2.5 sm:py-3 bg-slate-900 border border-slate-700 rounded-lg text-[13px] sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-700 transition-colors font-mono"
                         />
                         <button
                              onClick={handleSend}
                              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-green-600 rounded-lg hover:from-cyan-500 hover:to-green-500 transition-all duration-300 flex-shrink-0 flex items-center justify-center shadow-md"
                              aria-label="Trimite mesaj"
                         >
                              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                         </button>
                    </div>
               </div>
          </div>
     );
}
