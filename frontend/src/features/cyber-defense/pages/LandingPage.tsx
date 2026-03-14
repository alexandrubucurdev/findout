"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Activity } from "lucide-react";
import { motion } from "framer-motion";
import RecentThreats from "../components/RecentThreats";

export default function LandingPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [isSearchHovered, setIsSearchHovered] = useState(false);

  const handleScan = () => {
    if (searchInput.trim()) {
      router.push("/loading");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative">
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

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800 px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-cyan-400" />
              <h1
                className="text-xl tracking-widest"
                style={{ fontFamily: "Space Mono, monospace", fontWeight: 700 }}
              >
                CYBER DEFENSE GRID
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 font-mono text-sm">
                STATUS: ONLINE
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-4xl">
            {/* Hero Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2
                className="text-5xl mb-8 text-center tracking-wider"
                style={{ fontFamily: "Space Mono, monospace", fontWeight: 700 }}
              >
                TACTICAL NEWS ANALYSIS
              </h2>

              {/* Search Bar with Glow Effect */}
              <div className="relative flex gap-4">
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
                      onChange={(e) => setSearchInput(e.target.value)}
                      onMouseEnter={() => setIsSearchHovered(true)}
                      onMouseLeave={() => setIsSearchHovered(false)}
                      onKeyDown={(e) => e.key === "Enter" && handleScan()}
                      placeholder="Introdu link-ul știrii pentru analiză tactică..."
                      className="w-full px-6 py-5 bg-slate-900 border-2 border-slate-700 rounded-lg text-lg font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-all duration-300"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScan}
                  className="px-10 py-5 bg-gradient-to-r from-cyan-600 to-green-600 rounded-lg font-mono text-lg tracking-widest hover:from-cyan-500 hover:to-green-500 transition-all duration-300 shadow-lg shadow-cyan-500/30"
                >
                  [ SCANEAZĂ ]
                </motion.button>
              </div>
            </motion.div>

            {/* Recent Threats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-red-500"></div>
                <h3 className="text-xl font-mono tracking-wider text-slate-300">
                  AMENINȚĂRI DETECTATE RECENT
                </h3>
              </div>

              <RecentThreats />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
