"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Threat {
     id: string | number;
     title: string;
     score: number;
     source: string;
     timestamp: string;
}

// This interface should reflect the full data structure returned by the API for a scan
interface FullScanResult {
     url: string;
     title?: string;
     ai_verdict?: {
          scor_toxicitate?: number;
     };
     [key: string]: any; // Allow other properties from the full scan
}

const defaultThreats: Threat[] = [
     {
          id: 1,
          title: "Manipulare emoțională detectată în articol politic",
          score: 95,
          source: "romania-news.ro",
          timestamp: "Acum 12 minute",
     },
     {
          id: 2,
          title: "Titlu înșelător într-un articol despre economie",
          score: 65,
          source: "financiar-ro.com",
          timestamp: "Acum 1 oră",
     },
     {
          id: 3,
          title: "Articol factual despre evenimente locale",
          score: 30,
          source: "stiri-locale.ro",
          timestamp: "Acum 3 ore",
     },
];

export default function RecentThreats() {
     const [fullScans, setFullScans] = useState<FullScanResult[]>([]);
     const [threats, setThreats] = useState<Threat[]>([]);
     const router = useRouter();

     const handleThreatClick = (threatId: string | number) => {
          // Only proceed if the ID is a string (a URL from a real scan)
          if (typeof threatId !== "string" || !threatId.startsWith("http")) {
               return;
          }

          const clickedScan = fullScans.find((scan) => scan.url === threatId);

          if (clickedScan) {
               // If we have the full data, set it in SESSION STORAGE and go directly to the dashboard
               sessionStorage.setItem(
                    "scanResult",
                    JSON.stringify(clickedScan),
               );
               sessionStorage.setItem("scannedUrl", clickedScan.url);
               router.push("/dashboard");
          } else {
               // Fallback: if data is missing, go through the loading page to re-fetch
               router.push(`/loading?url=${encodeURIComponent(threatId)}`);
          }
     };

     useEffect(() => {
          const fetchRecent = async () => {
               try {
                    const res = await fetch("http://localhost:8000/recent");
                    if (res.ok) {
                         const data = await res.json();
                         if (
                              data.recent_scans &&
                              data.recent_scans.length > 0
                         ) {
                              const scans: FullScanResult[] = data.recent_scans;
                              setFullScans(scans); // Store the full data

                              const mapped: Threat[] = scans.map(
                                   (scan: FullScanResult, i: number) => {
                                        let hostname = scan.url;
                                        try {
                                             hostname = new URL(scan.url)
                                                  .hostname;
                                        } catch (e) {}
                                        return {
                                             id: scan.url ?? i.toString(),
                                             title:
                                                  scan.title ??
                                                  "Analiză document",
                                             score:
                                                  scan.ai_verdict
                                                       ?.scor_toxicitate ?? 0,
                                             source: hostname,
                                             timestamp: "Recent",
                                        };
                                   },
                              );
                              const topThreats = mapped
                                   .sort((a, b) => b.score - a.score)
                                   .slice(0, 3);
                              setThreats(topThreats);
                              return;
                         }
                    }
               } catch (e) {
                    console.error("Eroare fetching recent threats", e);
               }
               setThreats(
                    [...defaultThreats].sort((a, b) => b.score - a.score),
               );
          };

          fetchRecent();
     }, []);

     const getThreatLevelTheme = (score: number) => {
          if (score < 40) {
               return {
                    border: "border-green-900/50",
                    hoverBorder: "hover:border-green-700/70",
                    iconText: "text-green-500",
                    badgeBg: "bg-green-950",
                    badgeBorder: "border-green-700",
                    badgeText: "text-green-400",
               };
          } else if (score < 70) {
               return {
                    border: "border-yellow-900/50",
                    hoverBorder: "hover:border-yellow-700/70",
                    iconText: "text-yellow-500",
                    badgeBg: "bg-yellow-950",
                    badgeBorder: "border-yellow-700",
                    badgeText: "text-yellow-400",
               };
          } else {
               return {
                    border: "border-red-900/50",
                    hoverBorder: "hover:border-red-700/70",
                    iconText: "text-red-500",
                    badgeBg: "bg-red-950",
                    badgeBorder: "border-red-700",
                    badgeText: "text-red-400",
               };
          }
     };

     if (threats.length === 0) {
          return (
               <div className="text-slate-500 font-mono text-center mt-8 text-sm">
                    Loading recent threats...
               </div>
          );
     }

     // Container responsiv: 1 col mobil, 2 col tabletă, 3 col desktop
     return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
               {threats.map((threat, index) => {
                    const isClickable =
                         typeof threat.id === "string" &&
                         threat.id.startsWith("http");
                    const theme = getThreatLevelTheme(threat.score);

                    return (
                         <motion.div
                              key={threat.id}
                              onClick={() => handleThreatClick(threat.id)}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                              className={`bg-gradient-to-br from-slate-900 to-slate-800 border ${theme.border} rounded-lg p-4 sm:p-5 ${theme.hoverBorder} transition-all duration-300 group flex flex-col justify-between ${
                                   isClickable
                                        ? "cursor-pointer"
                                        : "cursor-default"
                              }`}
                         >
                              <div>
                                   {/* Score Badge */}
                                   <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                             <AlertTriangle
                                                  className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.iconText} group-hover:animate-pulse`}
                                             />
                                             <span className="text-[10px] sm:text-xs font-mono text-slate-500">
                                                  THREAT LEVEL
                                             </span>
                                        </div>
                                        <div
                                             className={`px-2 py-1 sm:px-3 sm:py-1.5 ${theme.badgeBg} border ${theme.badgeBorder} rounded ${theme.badgeText} text-[10px] sm:text-xs font-mono font-bold`}
                                        >
                                             {threat.score}%
                                        </div>
                                   </div>

                                   {/* Title cu line-clamp */}
                                   <h4 className="text-xs sm:text-sm mb-4 leading-snug text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                                        {threat.title}
                                   </h4>
                              </div>

                              {/* Meta Info la baza cardului */}
                              <div className="space-y-1.5 sm:space-y-2 mt-auto pt-3 border-t border-slate-800/50">
                                   <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                                        <TrendingUp className="w-3 h-3 flex-shrink-0" />
                                        <span className="font-mono truncate">
                                             {threat.source}
                                        </span>
                                   </div>
                                   <div className="text-[10px] sm:text-xs text-slate-600 font-mono">
                                        {threat.timestamp}
                                   </div>
                              </div>
                         </motion.div>
                    );
               })}
          </div>
     );
}
