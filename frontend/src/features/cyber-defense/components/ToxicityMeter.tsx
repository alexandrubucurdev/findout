"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function ToxicityMeter() {
  const toxicityLevel = 85;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-red-900/50 rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-950 border border-red-700 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <div>
            <h2
  className="text-3xl tracking-wider"
  style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}
>
              🔴 PERICOL: Manipulare Emoțională
            </h2>
            <p className="text-slate-400 font-mono text-sm mt-1">
              Nivel critic de toxicitate detectat în conținut
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-mono text-red-500">
            {toxicityLevel}%
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">
            THREAT SCORE
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-8 bg-slate-950 rounded-full overflow-hidden border-2 border-slate-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${toxicityLevel}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-orange-600 via-red-600 to-red-700 relative"
          >
            {/* Pulsing Glow Effect */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-red-500 opacity-50 blur-sm"
            />
          </motion.div>
        </div>

        {/* Threshold Markers */}
        <div className="flex justify-between mt-2 px-2">
          <span className="text-xs font-mono text-green-500">0% SIGUR</span>
          <span className="text-xs font-mono text-yellow-500">50% MODERAT</span>
          <span className="text-xs font-mono text-red-500">100% CRITIC</span>
        </div>
      </div>
    </div>
  );
}
