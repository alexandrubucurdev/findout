"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Radar, Lock, Shield, Cpu } from "lucide-react";

export default function LoadingState() {
     const router = useRouter();
     const searchParams = useSearchParams();
     const hasFetched = useRef(false);

     useEffect(() => {
          const url = searchParams.get("url");

          if (!url) {
               router.push("/");
               return;
          }

          const runScan = async () => {
               const controller = new AbortController();
               const timeoutId = setTimeout(() => controller.abort(), 60000);

               try {
                    const apiUrl =
                         process.env.NEXT_PUBLIC_API_URL ||
                         "http://localhost:8000";

                    const response = await fetch(`${apiUrl}/scan`, {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({ url }),
                         signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                         const errorData = await response
                              .json()
                              .catch(() => ({}));
                         const errorMessage =
                              errorData.detail ||
                              "Linkul nu a putut fi analizat.";
                         throw new Error(errorMessage);
                    }

                    const data = await response.json();

                    sessionStorage.setItem("scanResult", JSON.stringify(data));
                    sessionStorage.setItem("scannedUrl", url);

                    router.push("/dashboard");
               } catch (error: any) {
                    clearTimeout(timeoutId);

                    let finalErrorMessage =
                         "A apărut o eroare la conexiunea cu serverul.";

                    if (error.name === "AbortError") {
                         finalErrorMessage =
                              "Analiza a durat prea mult (Timeout). Încearcă din nou.";
                    } else if (error instanceof Error) {
                         finalErrorMessage = error.message;
                    }

                    // Curățăm orice date vechi de siguranță
                    sessionStorage.setItem("scanResult", JSON.stringify(null));
                    sessionStorage.setItem("scannedUrl", "");

                    // NOU: Trimitem eroarea prin URL către Landing Page!
                    router.replace(
                         `/?error=${encodeURIComponent(finalErrorMessage)}`,
                    );
               }
          };

          const timer = setTimeout(() => {
               if (!hasFetched.current) {
                    hasFetched.current = true;
                    runScan();
               }
          }, 500);

          return () => clearTimeout(timer);
     }, [router, searchParams]);

     const scanSteps = [
          { icon: Lock, label: "Verifying sources..." },
          { icon: Radar, label: "Cross-domain scanning..." },
          { icon: Cpu, label: "AI analysis in progress..." },
          { icon: Shield, label: "Propaganda detection..." },
     ];

     return (
          <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
               <div
                    className="absolute inset-0 opacity-25 pointer-events-none"
                    style={{
                         backgroundImage: "url('/assets/cyber-grid-bg.png')",
                         backgroundSize: "cover",
                         backgroundPosition: "center",
                         backgroundRepeat: "no-repeat",
                    }}
               />

               <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div
                         className="absolute inset-0"
                         style={{
                              backgroundImage: `
                                   linear-gradient(to right, rgb(6, 182, 212) 1px, transparent 1px),
                                   linear-gradient(to bottom, rgb(6, 182, 212) 1px, transparent 1px)
                              `,
                              backgroundSize: "40px 40px",
                         }}
                    ></div>
               </div>

               <div className="relative z-10 text-center w-full">
                    <motion.div
                         className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 relative"
                         animate={{ rotate: 360 }}
                         transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                         }}
                    >
                         <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
                         <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full"></div>
                         <div className="absolute inset-3 sm:inset-4 border-4 border-green-500/20 rounded-full"></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                              <Radar className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400" />
                         </div>
                    </motion.div>

                    <motion.h1
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         className="text-lg sm:text-xl md:text-3xl font-mono tracking-wider mb-2 text-white px-4"
                    >
                         Running AI analysis...
                    </motion.h1>

                    <div className="space-y-2 sm:space-y-3 mt-8 sm:mt-10 w-full max-w-[90%] sm:max-w-md md:max-w-lg px-4 mx-auto">
                         {scanSteps.map((step, index) => (
                              <motion.div
                                   key={index}
                                   initial={{ opacity: 0, x: -20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ delay: index * 0.3 }}
                                   className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur-sm"
                              >
                                   <step.icon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                                   <span className="font-mono text-xs sm:text-sm text-slate-300">
                                        {step.label}
                                   </span>
                                   <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{
                                             delay: index * 0.3,
                                             duration: 0.8,
                                        }}
                                        className="ml-auto h-1 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full w-full max-w-[60px] sm:max-w-[100px]"
                                   />
                              </motion.div>
                         ))}
                    </div>

                    <motion.div
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: 0.5 }}
                         className="mt-8 text-slate-500 font-mono text-xs sm:text-sm"
                    >
                         <motion.span
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                         >
                              PROCESSING...
                         </motion.span>
                    </motion.div>
               </div>
          </div>
     );
}
