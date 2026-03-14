"use client";

import { AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const threats = [
  {
    id: 1,
    title: "Manipulare emoțională detectată în articol politic",
    score: 92,
    source: "romania-news.ro",
    timestamp: "Acum 12 minute",
  },
  {
    id: 2,
    title: "Campanie de dezinformare coordonată - 15 domenii",
    score: 88,
    source: "breaking-ro.com",
    timestamp: "Acum 1 oră",
  },
  {
    id: 3,
    title: "Propagandă pro-rusă în știre despre energie",
    score: 95,
    source: "actualitate-zilei.ro",
    timestamp: "Acum 3 ore",
  },
];

export default function RecentThreats() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {threats.map((threat, index) => (
        <motion.div
          key={threat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 border border-red-900/50 rounded-lg p-5 hover:border-red-700/70 transition-all duration-300 group cursor-pointer"
        >
          {/* Score Badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 group-hover:animate-pulse" />
              <span className="text-xs font-mono text-slate-500">
                THREAT LEVEL
              </span>
            </div>
            <div className="px-3 py-1 bg-red-950 border border-red-700 rounded text-red-400 font-mono">
              {threat.score}%
            </div>
          </div>

          {/* Title */}
          <h4 className="text-sm mb-3 leading-snug text-slate-200 group-hover:text-white transition-colors">
            {threat.title}
          </h4>

          {/* Meta Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <TrendingUp className="w-3 h-3" />
              <span className="font-mono">{threat.source}</span>
            </div>
            <div className="text-xs text-slate-600 font-mono">
              {threat.timestamp}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
