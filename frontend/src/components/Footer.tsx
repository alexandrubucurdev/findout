"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Terminal, Shield, Fingerprint, Database } from "lucide-react";

export default function Footer() {
     const pathname = usePathname();
     const currentYear = new Date().getFullYear();

     // Ascundem Footer-ul pe pagina de loading
     if (pathname === "/loading") {
          return null;
     }

     return (
          <footer className="bg-slate-950 border-t border-slate-800 mt-auto relative overflow-hidden">
               {/* Background decoration */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent"></div>
               <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-900/10 rounded-full blur-3xl pointer-events-none"></div>

               <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
                         {/* Column 1: Brand & Description */}
                         <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3">
                                   <img
                                        src="/assets/logo-bun-1.png"
                                        alt="Find Out Logo"
                                        className="h-8 w-auto grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                                   />
                                   <span className="text-slate-200 font-mono font-bold text-lg tracking-widest">
                                        FIND OUT
                                   </span>
                              </div>
                              <p className="text-slate-500 font-mono text-xs sm:text-sm leading-relaxed max-w-md">
                                   Tactical misinformation analysis and
                                   cognitive threat detection dashboard.
                                   Empowering users with AI-driven clarity and
                                   real-time propaganda detection.
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-slate-600">
                                   <Shield className="w-4 h-4 hover:text-cyan-500 transition-colors cursor-default" />
                                   <Fingerprint className="w-4 h-4 hover:text-cyan-500 transition-colors cursor-default" />
                                   <Database className="w-4 h-4 hover:text-cyan-500 transition-colors cursor-default" />
                              </div>
                         </div>

                         {/* Column 2: Developer / Lattice Team */}
                         <div className="flex flex-col gap-4 md:items-end">
                              <h4 className="text-slate-300 font-mono font-bold text-sm tracking-widest uppercase">
                                   System Origin
                              </h4>
                              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col gap-3 group hover:border-cyan-900/50 transition-colors w-full max-w-xs">
                                   <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                             <Terminal className="w-4 h-4 text-cyan-500" />
                                             <span className="text-slate-400 font-mono text-xs">
                                                  Engineered by
                                             </span>
                                        </div>
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                                   </div>
                                   <p className="text-xl font-mono font-bold text-slate-200 tracking-widest group-hover:text-cyan-400 transition-colors">
                                        LATTICE
                                   </p>
                                   <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                                        <div className="h-full bg-cyan-500/50 w-1/3 group-hover:w-full transition-all duration-1000"></div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Bottom Bar: Copyright */}
                    <div className="mt-10 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                         <p className="text-slate-600 font-mono text-[10px] sm:text-xs">
                              © {currentYear} Find Out. All rights reserved.
                         </p>
                         <p className="text-slate-600 font-mono text-[10px] sm:text-xs flex items-center gap-2">
                              SECURE CONNECTION{" "}
                              <Shield className="w-3 h-3 text-green-500/70" />
                         </p>
                    </div>
               </div>
          </footer>
     );
}
