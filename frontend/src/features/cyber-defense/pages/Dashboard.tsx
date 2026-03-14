"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ToxicityMeter from "../components/ToxicityMeter";
import SitrepPanel from "../components/SitrepPanel";
import NetworkGraph from "../components/NetworkGraph";
import ChatPanel from "../components/ChatPanel";

interface NewsNode {
     domain: string;
     data_publicarii: string;
     pacient_zero: boolean;
     sursa: string;
     link: string;
     limba: string;
}

interface ScanResult {
     url: string;
     title: string;
     news_nodes: NewsNode[];
     ai_verdict: {
          scor_toxicitate: number;
          emotii_principale: string[];
          tehnici_manipulare: string;
     };
     veridicitate: string;
     explicatie_consens: string;
     ai_summary: string;
     fact_checks: unknown[];
     timestamp: string;
}

export default function Dashboard() {
     const router = useRouter();
     const [scanResult, setScanResult] = useState<ScanResult | null>(null);

     useEffect(() => {
          const raw = localStorage.getItem("scanResult");
          if (raw) {
               try {
                    setScanResult(JSON.parse(raw));
               } catch {
                    console.error(
                         "Eroare la parsarea datelor din localStorage",
                    );
               }
          }
     }, []);

     return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
               {/* Background */}
               <div
                    className="fixed inset-0 opacity-20 pointer-events-none"
                    style={{
                         backgroundImage: "url('/assets/cyber-grid-bg.png')",
                         backgroundSize: "cover",
                         backgroundPosition: "center",
                         backgroundRepeat: "no-repeat",
                    }}
               />

               <div className="relative z-10 flex flex-col h-full">
                    {/* Header Responsiv */}
                    <header className="border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                         <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 sm:gap-6">
                                   <button
                                        onClick={() => router.push("/")}
                                        className="text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                                        aria-label="Înapoi"
                                   >
                                        <ArrowLeft
                                             className="w-5 h-5 sm:w-6 sm:h-6"
                                             strokeWidth={3}
                                        />
                                   </button>
                                   <div className="w-px h-5 sm:h-6 bg-slate-700 hidden sm:block"></div>
                                   <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="relative flex-shrink-0">
                                             <div className="absolute inset-0 rounded-full bg-cyan-400/60 blur-2xl sm:blur-3xl -z-10 animate-pulse" />
                                             <img
                                                  src="/assets/logo-bun-1.png"
                                                  alt="Find Out"
                                                  className="h-10 sm:h-14 lg:h-18 w-auto relative"
                                             />
                                        </div>
                                        <h1
                                             className="text-xs sm:text-base lg:text-xl tracking-wider sm:tracking-widest"
                                             style={{
                                                  fontFamily:
                                                       "Space Mono, monospace",
                                                  fontWeight: 700,
                                             }}
                                        >
                                             ANALYSIS{" "}
                                             <span className="hidden sm:inline">
                                                  COMMAND CENTER
                                             </span>
                                        </h1>
                                   </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 bg-slate-900/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-slate-800">
                                   <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                                   <span className="text-green-500 font-mono text-[10px] sm:text-xs lg:text-sm whitespace-nowrap">
                                        <span className="hidden sm:inline">
                                             SCAN{" "}
                                        </span>
                                        COMPLETE
                                   </span>
                              </div>
                         </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto overflow-x-hidden">
                         <div className="max-w-[1800px] mx-auto space-y-4 sm:space-y-6">
                              {/* Toxicity Meter wrapper */}
                              <div className="w-full lg:max-w-[90%] xl:max-w-[80%] mx-auto">
                                   <ToxicityMeter
                                        score={
                                             scanResult?.ai_verdict
                                                  ?.scor_toxicitate
                                        }
                                   />
                              </div>

                              {/* Grid panouri: 1 coloană pe mobil, 2 pe desktop */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-h-[auto] lg:min-h-[600px] w-full lg:max-w-[90%] xl:max-w-[80%] mx-auto">
                                   <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full flex flex-col"
                                   >
                                        <SitrepPanel
                                             techniquesText={
                                                  scanResult?.ai_verdict
                                                       ?.tehnici_manipulare
                                             }
                                             emotions={
                                                  scanResult?.ai_verdict
                                                       ?.emotii_principale
                                             }
                                             veridicitate={
                                                  scanResult?.veridicitate
                                             }
                                             explicatieConsens={
                                                  scanResult?.explicatie_consens
                                             }
                                             aiSummary={scanResult?.ai_summary}
                                             factChecks={
                                                  scanResult?.fact_checks
                                             }
                                        />
                                   </motion.div>

                                   <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                             duration: 0.5,
                                             delay: 0.1,
                                        }}
                                        className="h-[400px] sm:h-[500px] lg:h-full flex flex-col"
                                   >
                                        <NetworkGraph
                                             newsNodes={
                                                  scanResult?.news_nodes ?? []
                                             }
                                             toxicityScore={
                                                  scanResult?.ai_verdict
                                                       ?.scor_toxicitate
                                             }
                                        />
                                   </motion.div>
                              </div>

                              {/* Chat Panel */}
                              <div className="flex justify-center pb-8 sm:pb-12">
                                   <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                             duration: 0.5,
                                             delay: 0.2,
                                        }}
                                        className="w-full lg:max-w-[90%] xl:max-w-[80%]"
                                   >
                                        <ChatPanel
                                             articleUrl={scanResult?.url}
                                        />
                                   </motion.div>
                              </div>
                         </div>
                    </main>
               </div>
          </div>
     );
}
