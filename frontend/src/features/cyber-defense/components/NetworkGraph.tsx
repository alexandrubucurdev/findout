"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Share2 } from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface GraphNode {
  id: string;
  name: string;
  type: "source" | "domain";
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
}

export default function NetworkGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Graph data - Infection map
  const graphData: { nodes: GraphNode[]; links: GraphLink[] } = {
    nodes: [
      {
        id: "source",
        name: "Sursa GDELT\n(Pacientul Zero)",
        type: "source",
        val: 40,
      },
      { id: "domain1", name: "actualitate-ro.com", type: "domain", val: 20 },
      { id: "domain2", name: "breaking-news.ro", type: "domain", val: 20 },
      { id: "domain3", name: "romania-24.ro", type: "domain", val: 20 },
      { id: "domain4", name: "stiri-online.ro", type: "domain", val: 20 },
      { id: "domain5", name: "news-flash.ro", type: "domain", val: 20 },
      { id: "domain6", name: "ziarul-online.ro", type: "domain", val: 20 },
      { id: "domain7", name: "info-romania.com", type: "domain", val: 20 },
      { id: "domain8", name: "daily-ro.com", type: "domain", val: 20 },
    ],
    links: [
      { source: "source", target: "domain1" },
      { source: "source", target: "domain2" },
      { source: "source", target: "domain3" },
      { source: "source", target: "domain4" },
      { source: "source", target: "domain5" },
      { source: "source", target: "domain6" },
      { source: "domain1", target: "domain7" },
      { source: "domain2", target: "domain8" },
    ],
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-700 px-5 py-4">
        <div className="flex items-center gap-3">
          <Share2 className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono tracking-wider text-lg">INFECTION MAP</h3>
        </div>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Hartă de propagare cross-domain
        </p>
      </div>

      {/* Graph Container */}
      <div ref={containerRef} className="flex-1 relative bg-slate-950">
        <ForceGraph2D
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#020617"
          nodeRelSize={6}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            const nodeX = node.x ?? 0;
            const nodeY = node.y ?? 0;
            ctx.font = `${fontSize}px monospace`;

            // Node circle
            const radius = node.val / 2;

            // Pulsing glow effect for infected nodes
            if (node.type === "source") {
              const time = Date.now() / 1000;
              const pulseSize = Math.sin(time * 2) * 3 + radius;

              // Outer glow
              ctx.beginPath();
              ctx.arc(nodeX, nodeY, pulseSize, 0, 2 * Math.PI);
              ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
              ctx.fill();

              // Main circle
              ctx.beginPath();
              ctx.arc(nodeX, nodeY, radius, 0, 2 * Math.PI);
              ctx.fillStyle = "#ef4444";
              ctx.fill();

              // Inner glow
              ctx.beginPath();
              ctx.arc(nodeX, nodeY, radius * 0.5, 0, 2 * Math.PI);
              ctx.fillStyle = "#fca5a5";
              ctx.fill();
            } else {
              const time = Date.now() / 1000;
              const nodeId = String(node.id ?? "0");
              const pulseSize =
                Math.sin(time * 2 + parseInt(nodeId.slice(-1) || "0", 10)) * 2 +
                radius;

              // Outer glow
              ctx.beginPath();
              ctx.arc(nodeX, nodeY, pulseSize, 0, 2 * Math.PI);
              ctx.fillStyle = "rgba(220, 38, 38, 0.2)";
              ctx.fill();

              // Main circle
              ctx.beginPath();
              ctx.arc(nodeX, nodeY, radius, 0, 2 * Math.PI);
              ctx.fillStyle = "#dc2626";
              ctx.fill();
            }

            // Text label
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = node.type === "source" ? "#fef3c7" : "#cbd5e1";

            const lines = label.split("\n");
            lines.forEach((line: string, i: number) => {
              ctx.fillText(
                line,
                nodeX,
                nodeY + radius + 15 + i * (fontSize + 2),
              );
            });
          }}
          linkColor={() => "rgba(100, 116, 139, 0.3)"}
          linkWidth={2}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleColor={() => "#ef4444"}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          cooldownTicks={100}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 rounded-lg p-4 backdrop-blur-sm">
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
              <span className="text-slate-300">Sursa GDELT (Originea)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-600 rounded-full shadow-lg shadow-red-600/50"></div>
              <span className="text-slate-300">Domenii infectate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
