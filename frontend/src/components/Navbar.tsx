"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Activity } from "lucide-react";

export default function Navbar() {
     const pathname = usePathname();

     // Ascundem Navbar-ul complet pe pagina de loading
     if (pathname === "/loading") {
          return null;
     }

     return (
          <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-lg shadow-cyan-900/5">
               <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                    {/* Logo & Brand Identity */}
                    <Link href="/" className="flex items-center gap-3 group">
                         <div className="relative flex-shrink-0 flex items-center justify-center">
                              <div className="absolute inset-0 rounded-full bg-cyan-500/0 group-hover:bg-cyan-500/25 blur-xl transition-all duration-500" />
                              <img
                                   src="/assets/logo-bun-1.png"
                                   alt="Find Out Logo"
                                   className="h-10 sm:h-12 w-auto relative object-contain"
                              />
                         </div>
                         <div className="flex flex-col">
                              <span className="text-slate-100 font-mono font-bold text-base sm:text-lg tracking-[0.2em] group-hover:text-cyan-400 transition-colors">
                                   FIND OUT
                              </span>
                              <span className="text-slate-500 font-mono text-[9px] sm:text-[10px] tracking-widest uppercase hidden sm:block">
                                   Cognitive Armor Systems
                              </span>
                         </div>
                    </Link>

                    {/* Right side: System Status & Mobile Menu */}
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full shadow-inner hidden sm:flex">
                              <ShieldCheck className="w-4 h-4 text-green-500" />
                              <span className="text-slate-300 font-mono text-[10px] sm:text-xs tracking-wider">
                                   SYS:{" "}
                                   <span className="text-green-500 font-bold">
                                        SECURE
                                   </span>
                              </span>
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-1"></div>
                         </div>

                         <div className="sm:hidden flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-green-500">
                              <Activity className="w-5 h-5 animate-pulse" />
                         </div>
                    </div>
               </div>
          </nav>
     );
}
