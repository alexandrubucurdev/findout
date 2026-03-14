"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface ToxicityMeterProps {
     score?: number;
}

export default function ToxicityMeter({ score }: ToxicityMeterProps) {
     const toxicityLevel = score ?? 0;

     const getColorTheme = (level: number) => {
          if (level < 40) {
               return {
                    text: "text-green-500",
                    bg: "bg-green-950/30",
                    border: "border-green-500/50",
                    containerBorder: "border-green-900/50",
                    progress: "from-green-600 via-green-500 to-green-400",
                    glow: "bg-green-500",
                    title: "ANALYSIS: Factual / Safe",
                    subtitle: "Low cognitive bias detected",
               };
          } else if (level < 70) {
               return {
                    text: "text-yellow-500",
                    bg: "bg-yellow-950/30",
                    border: "border-yellow-500/50",
                    containerBorder: "border-yellow-900/50",
                    progress: "from-yellow-600 via-yellow-500 to-yellow-400",
                    glow: "bg-yellow-500",
                    title: "WARNING: Questionable",
                    subtitle: "Moderate cognitive bias",
               };
          } else {
               return {
                    text: "text-red-500",
                    bg: "bg-red-950/30",
                    border: "border-red-500/50",
                    containerBorder: "border-red-900/50",
                    progress: "from-orange-600 via-red-600 to-red-700",
                    glow: "bg-red-500",
                    title: "THREAT: Manipulation",
                    subtitle: "High-level bias detected",
               };
          }
     };

     const theme = getColorTheme(toxicityLevel);

     return (
          <div
               className={`bg-gradient-to-br from-slate-900 to-slate-800 border-2 ${theme.containerBorder} rounded-lg p-4 sm:p-6 lg:p-8 transition-colors duration-500 shadow-xl`}
          >
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                         <div
                              className={`p-2.5 sm:p-3 ${theme.bg} border ${theme.border} rounded-lg backdrop-blur-sm transition-colors duration-500 flex-shrink-0`}
                         >
                              <AlertTriangle
                                   className={`w-6 h-6 sm:w-8 sm:h-8 ${theme.text} animate-pulse`}
                              />
                         </div>
                         <div className="flex-1">
                              <h2
                                   className="text-lg sm:text-xl lg:text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 leading-tight"
                                   style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontWeight: 600,
                                        letterSpacing: "-0.02em",
                                   }}
                              >
                                   {theme.title}
                              </h2>
                              <p
                                   className={`${theme.text} opacity-80 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-0.5 sm:mt-1 transition-colors duration-500 line-clamp-1`}
                              >
                                   {theme.subtitle}
                              </p>
                         </div>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                         <div
                              className={`text-4xl sm:text-5xl font-mono ${theme.text} transition-colors duration-500 leading-none`}
                         >
                              {toxicityLevel}%
                         </div>
                         <div className="text-[10px] sm:text-xs text-slate-500 font-mono mt-1">
                              THREAT SCORE
                         </div>
                    </div>
               </div>

               {/* Progress Bar */}
               <div className="relative mt-2 sm:mt-0">
                    <div className="h-6 sm:h-8 bg-slate-950 rounded-full overflow-hidden border-2 border-slate-700">
                         <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${toxicityLevel}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${theme.progress} relative`}
                         >
                              {/* Pulsing Glow Effect */}
                              <motion.div
                                   animate={{ opacity: [0.5, 1, 0.5] }}
                                   transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                   }}
                                   className={`absolute inset-0 ${theme.glow} opacity-50 blur-sm`}
                              />
                         </motion.div>
                    </div>

                    {/* Threshold Markers */}
                    <div className="flex justify-between mt-2 px-1 sm:px-2">
                         <span className="text-[9px] sm:text-xs font-mono text-green-500">
                              0% SAFE
                         </span>
                         <span className="text-[9px] sm:text-xs font-mono text-yellow-500">
                              50% MODERATE
                         </span>
                         <span className="text-[9px] sm:text-xs font-mono text-red-500">
                              100% CRITICAL
                         </span>
                    </div>
               </div>
          </div>
     );
}
