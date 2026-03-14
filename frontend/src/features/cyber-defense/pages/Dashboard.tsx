"use client";

import { Activity, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ToxicityMeter from "../components/ToxicityMeter";
import SitrepPanel from "../components/SitrepPanel";
import NetworkGraph from "../components/NetworkGraph";
import ChatPanel from "../components/ChatPanel";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative">
      {/* Background Image with Opacity */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/cyber-grid-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800 px-8 py-4">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push("/")}
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" strokeWidth={3} />
              </button>
              <div className="w-px h-6 bg-slate-700"></div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-400/60 blur-3xl -z-10 animate-pulse" />
                  <img
                    src="/assets/logo-bun-1.png"
                    alt="Find Out"
                    className="h-18 w-auto relative"
                  />
                </div>
                <h1
                  className="text-xl tracking-widest"
                  style={{
                    fontFamily: "Space Mono, monospace",
                    fontWeight: 700,
                  }}
                >
                  ANALYSIS COMMAND CENTER
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 font-mono text-sm">
                SCAN COMPLETE
              </span>
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="flex-1 px-8 py-6 overflow-auto">
          <div className="max-w-[1800px] mx-auto space-y-6">
            {/* Toxicity Meter - Centered, 20% smaller */}
            <div className="max-w-[80%] mx-auto">
              <ToxicityMeter />
            </div>

            {/* Two-Panel Layout - SITREP and Network Graph */}
            <div className="grid grid-cols-2 gap-6 min-h-[600px] mx-auto max-w-[80%]">
              {/* Left Panel - SITREP */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SitrepPanel />
              </motion.div>

              {/* Right Panel - Network Graph */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <NetworkGraph />
              </motion.div>
            </div>

            {/* Citizen's Shield - Centered below */}
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-[80%]"
              >
                <ChatPanel />
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
