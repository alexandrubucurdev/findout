"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RecentThreats from "../../src/components/RecentThreats";

// Am separat logica principală pentru a putea folosi useSearchParams în siguranță
function LandingContent() {
     const router = useRouter();
     const searchParams = useSearchParams();
     const [searchInput, setSearchInput] = useState("");
     const [isSearchHovered, setIsSearchHovered] = useState(false);
     const [error, setError] = useState("");

     // Ascultăm dacă există un parametru "error" în URL când se încarcă componenta
     useEffect(() => {
          const urlError = searchParams.get("error");

          if (urlError) {
               setError(urlError);
               // Opțional: Curățăm URL-ul pentru a nu lăsa mesajul acolo dacă utilizatorul dă refresh
               router.replace("/", { scroll: false });
          }

          // Curățăm mereu datele vechi de la alte scanări
          sessionStorage.removeItem("scanResult");
          sessionStorage.removeItem("scannedUrl");
     }, [searchParams, router]);

     const handleScan = () => {
          setError("");
          let input = searchInput.trim();

          if (!input) {
               setError("Te rugăm să introduci un link pentru analiză.");
               return;
          }

          if (!input.startsWith("http://") && !input.startsWith("https://")) {
               input = "https://" + input;
          }

          try {
               const urlObj = new URL(input);

               if (urlObj.pathname === "/" || urlObj.pathname.length < 5) {
                    setError(
                         "Linkul pare a fi o pagină principală. Introdu linkul unui articol.",
                    );
                    return;
               }

               router.push(
                    `/loading?url=${encodeURIComponent(urlObj.toString())}`,
               );
          } catch (e) {
               setError("Link invalid. Asigură-te că introduci un URL corect.");
          }
     };

     return (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-10 sm:py-16">
               <div className="w-full max-w-4xl">
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.6 }}
                         className="mb-10 sm:mb-16"
                    >
                         <h2
                              className="text-3xl sm:text-4xl md:text-5xl mb-6 text-center tracking-wider text-slate-100"
                              style={{
                                   fontFamily: "Space Mono, monospace",
                                   fontWeight: 700,
                              }}
                         >
                              TACTICAL NEWS ANALYSIS
                         </h2>

                         <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-4">
                              <div className="flex-1 relative">
                                   <div
                                        className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg blur-lg opacity-0 transition-opacity duration-300 ${
                                             isSearchHovered ? "opacity-75" : ""
                                        }`}
                                   ></div>

                                   <div className="relative">
                                        <input
                                             type="text"
                                             value={searchInput}
                                             onChange={(e) => {
                                                  setSearchInput(
                                                       e.target.value,
                                                  );
                                                  if (error) setError("");
                                             }}
                                             onMouseEnter={() =>
                                                  setIsSearchHovered(true)
                                             }
                                             onMouseLeave={() =>
                                                  setIsSearchHovered(false)
                                             }
                                             onKeyDown={(e) =>
                                                  e.key === "Enter" &&
                                                  handleScan()
                                             }
                                             placeholder="Enter news link for tactical analysis..."
                                             className={`w-full px-5 sm:px-6 py-3 sm:py-4 bg-slate-900 border-2 rounded-lg text-sm sm:text-base lg:text-lg font-mono placeholder:text-slate-500 focus:outline-none transition-all duration-300 ${
                                                  error
                                                       ? "border-red-500 focus:border-red-400"
                                                       : "border-slate-700 focus:border-cyan-500"
                                             }`}
                                        />
                                        <Search
                                             className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                                                  error
                                                       ? "text-red-500"
                                                       : "text-slate-500"
                                             }`}
                                        />
                                   </div>

                                   <AnimatePresence>
                                        {error && (
                                             <motion.div
                                                  initial={{
                                                       opacity: 0,
                                                       y: -5,
                                                  }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  exit={{ opacity: 0, y: -5 }}
                                                  className="absolute -bottom-6 left-2 flex items-center gap-1.5 text-red-500"
                                             >
                                                  <AlertCircle className="w-3.5 h-3.5" />
                                                  <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wide">
                                                       {error}
                                                  </span>
                                             </motion.div>
                                        )}
                                   </AnimatePresence>
                              </div>

                              <motion.button
                                   whileHover={{ scale: 1.02 }}
                                   whileTap={{ scale: 0.98 }}
                                   onClick={handleScan}
                                   className="px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-800 to-cyan-500 rounded-lg font-mono text-sm sm:text-base lg:text-lg tracking-widest hover:from-slate-700 hover:to-slate-500 transition-all duration-300 shadow-lg shadow-blue-500/30 text-white font-bold"
                              >
                                   SCAN
                              </motion.button>
                         </div>
                    </motion.div>

                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.6, delay: 0.2 }}
                    >
                         <div className="flex items-center gap-3 mb-6 mt-4 sm:mt-0">
                              <div className="w-1 h-5 sm:h-6 bg-red-500"></div>
                              <h3 className="text-base sm:text-lg lg:text-xl font-mono tracking-wider text-slate-300">
                                   RECENTLY DETECTED THREATS
                              </h3>
                         </div>

                         <RecentThreats />
                    </motion.div>
               </div>
          </div>
     );
}

// Componenta de bază care înglobează conținutul într-un <Suspense>
export default function LandingPage() {
     return (
          <div className="flex-1 flex flex-col relative w-full h-full min-h-screen">
               <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                         backgroundImage: "url('/assets/cyber-grid-bg.png')",
                         backgroundSize: "cover",
                         backgroundPosition: "center",
                         backgroundRepeat: "no-repeat",
                    }}
               />
               <Suspense fallback={<div className="min-h-screen"></div>}>
                    <LandingContent />
               </Suspense>
          </div>
     );
}
