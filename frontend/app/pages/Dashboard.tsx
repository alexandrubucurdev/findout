"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ToxicityMeter from "../../src/components/ToxicityMeter";
import SitrepPanel from "../../src/components/SitrepPanel";
import NetworkGraph from "../../src/components/NetworkGraph";
import ChatPanel from "../../src/components/ChatPanel";

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
     const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
          // FOLOSIM sessionStorage AICI
          const raw = sessionStorage.getItem("scanResult");

          // 1. Verificăm dacă există date. Dacă nu, redirecționăm!
          if (!raw || raw === "null") {
               router.replace("/"); // Folosim replace pentru a nu strica istoricul de navigare
               return;
          }

          // 2. Încercăm să parsăm datele
          try {
               const parsedData = JSON.parse(raw);

               // Verificare suplimentară: ne asigurăm că datele sunt valide
               if (!parsedData || !parsedData.url) {
                    throw new Error("Date invalide");
               }

               setScanResult(parsedData);
          } catch {
               console.error(
                    "Eroare la parsarea datelor din sessionStorage. Redirecționare...",
               );
               // Ștergem datele corupte din sessionStorage
               sessionStorage.removeItem("scanResult");
               router.replace("/");
          } finally {
               // Oprim loading-ul doar dacă totul a decurs bine
               setIsLoading(false);
          }
     }, [router]);

     // Dacă încă se încarcă sau decide să redirecționeze, nu afișăm interfața
     if (isLoading) {
          return (
               <div className="flex-1 flex items-center justify-center bg-slate-950">
                    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
          );
     }

     return (
          <div className="flex-1 flex flex-col relative overflow-hidden w-full h-full">
               {/* Background */}
               <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                         backgroundImage: "url('/assets/cyber-grid-bg.png')",
                         backgroundSize: "cover",
                         backgroundPosition: "center",
                         backgroundRepeat: "no-repeat",
                    }}
               />

               <div className="relative z-10 flex flex-col h-full flex-1 w-full overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="max-w-[1800px] mx-auto space-y-6 sm:space-y-8 w-full">
                         {/* Scan Complete Indicator */}
                         <div className="flex justify-end w-full lg:max-w-[90%] xl:max-w-[80%] mx-auto mb-2">
                              <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800 w-fit">
                                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                   <span className="text-green-500 font-mono text-[10px] sm:text-xs tracking-wider">
                                        SCAN COMPLETE
                                   </span>
                              </div>
                         </div>

                         {/* Toxicity Meter */}
                         <div className="w-full lg:max-w-[90%] xl:max-w-[80%] mx-auto">
                              <ToxicityMeter
                                   score={
                                        scanResult?.ai_verdict?.scor_toxicitate
                                   }
                              />
                         </div>

                         {/* Grid panouri */}
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
                                        veridicitate={scanResult?.veridicitate}
                                        explicatieConsens={
                                             scanResult?.explicatie_consens
                                        }
                                        aiSummary={scanResult?.ai_summary}
                                        factChecks={scanResult?.fact_checks}
                                   />
                              </motion.div>

                              <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.5, delay: 0.1 }}
                                   className="h-[400px] sm:h-[500px] lg:h-full flex flex-col"
                              >
                                   <NetworkGraph
                                        newsNodes={scanResult?.news_nodes ?? []}
                                        toxicityScore={
                                             scanResult?.ai_verdict
                                                  ?.scor_toxicitate
                                        }
                                   />
                              </motion.div>
                         </div>

                         {/* Chat Panel */}
                         <div className="flex justify-center pb-8 sm:pb-12 w-full mx-auto">
                              <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.5, delay: 0.2 }}
                                   className="w-full lg:max-w-[90%] xl:max-w-[80%]"
                              >
                                   <ChatPanel articleUrl={scanResult?.url} />
                              </motion.div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
