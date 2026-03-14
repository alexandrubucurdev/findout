"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Radar, Lock, Shield, Cpu } from "lucide-react";

export default function LoadingState() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3500);

    return () => clearTimeout(timer);
  }, [router]);

  const scanSteps = [
    { icon: Lock, label: "Verificare surse..." },
    { icon: Radar, label: "Scanare cross-domain..." },
    { icon: Cpu, label: "Analiză AI în curs..." },
    { icon: Shield, label: "Detectare propagandă..." },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Image with Opacity */}
      <div
        className="fixed inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/cyber-grid-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
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

      {/* Central Content */}
      <div className="relative z-10 text-center">
        {/* Spinning Radar Circle */}
        <motion.div
          className="w-32 h-32 mx-auto mb-8 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full"></div>
          <div className="absolute inset-4 border-4 border-green-500/20 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Radar className="w-12 h-12 text-cyan-400" />
          </div>
        </motion.div>

        {/* Main Text */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-mono tracking-wider mb-3 text-white"
        >
          Se rulează analiza AI...
        </motion.h1>

        {/* Loading Steps */}
        <div className="space-y-3 mt-12 min-w-[400px]">
          {scanSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.3 }}
              className="flex items-center gap-4 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-lg"
            >
              <step.icon className="w-5 h-5 text-cyan-400" />
              <span className="font-mono text-sm text-slate-300">
                {step.label}
              </span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: index * 0.3, duration: 0.8 }}
                className="ml-auto h-1 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full"
              />
            </motion.div>
          ))}
        </div>

        {/* Progress Percentage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-slate-500 font-mono text-sm"
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
