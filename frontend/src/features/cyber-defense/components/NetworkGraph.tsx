"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Share2 } from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

// ... (interfețele și FALLBACK_DATA rămân la fel)
interface NewsNode { domain: string; data_publicarii: string; pacient_zero: boolean; sursa: string; link: string; limba: string; }
interface GraphNode { id: string; name: string; type: "source" | "domain"; val: number; x?: number; y?: number; }
interface GraphLink { source: string; target: string; }
interface NetworkGraphProps { newsNodes: NewsNode[]; }

const FALLBACK_DATA: { nodes: GraphNode[]; links: GraphLink[] } = {
  nodes: [
    { id: "source", name: "GDELT Source\n(Origin Point)", type: "source", val: 40 },
    { id: "domain1", name: "actualitate-ro.com", type: "domain", val: 20 },
    { id: "domain2", name: "breaking-news.ro", type: "domain", val: 20 },
    { id: "domain3", name: "romania-24.ro", type: "domain", val: 20 },
    { id: "domain4", name: "stiri-online.ro", type: "domain", val: 20 },
  ],
  links: [
    { source: "source", target: "domain1" },
    { source: "source", target: "domain2" },
    { source: "source", target: "domain3" },
    { source: "source", target: "domain4" },
  ],
};

function buildGraphData(newsNodes: NewsNode[]): { nodes: GraphNode[]; links: GraphLink[] } {
  if (!newsNodes || newsNodes.length === 0) return FALLBACK_DATA;
  const pacientZero = newsNodes.find((n) => n.pacient_zero);
  const restNodes = newsNodes.filter((n) => !n.pacient_zero);
  const sourceId = "source";
  const sourceName = pacientZero ? `${pacientZero.sursa}\n(Origin Point)` : "GDELT Source\n(Origin Point)";
  const nodes: GraphNode[] = [
    { id: sourceId, name: sourceName, type: "source", val: 40 },
    ...restNodes.map((n, i) => ({ id: `domain${i}`, name: n.domain, type: "domain" as const, val: 20 })),
  ];
  const links: GraphLink[] = restNodes.map((_, i) => ({ source: sourceId, target: `domain${i}` }));
  return { nodes, links };
}

export default function NetworkGraph({ newsNodes }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isMounted, setIsMounted] = useState(false); // Soluție pentru Hydration Error

  useEffect(() => {
    setIsMounted(true);
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
    
    // Forțăm distanțarea imediat ce componenta se montează sau datele se schimbă
    if (fgRef.current) {
      fgRef.current.d3Force("charge").strength(-1000); // Respingere agresivă
      fgRef.current.d3Force("link").distance(250);    // Distanță mare față de centru
      fgRef.current.d3ReheatSimulation();             // Reîncălzește fizica
    }

    return () => window.removeEventListener("resize", updateDimensions);
  }, [newsNodes, isMounted]); 

  const graphData = buildGraphData(newsNodes);

  // Dacă nu suntem pe client, nu randăm componenta (evităm mismatch-ul server-client)
  if (!isMounted) {
    return (
      <div className="h-full bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center font-mono text-slate-500">
        INITIALIZING GRAPH SYSTEM...
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-slate-950 border-b border-slate-700 px-5 py-4">
        <div className="flex items-center gap-3">
          <Share2 className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono tracking-wider text-lg uppercase text-slate-100">Narrative Propagation Map</h3>
        </div>
        <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-tight">
          Visualizing cross-domain diffusion and tactical influence networks
        </p>
      </div>

      <div ref={containerRef} className="flex-1 relative bg-slate-950">
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#020617"
          nodeRelSize={6}
          minZoom={0.8}
          maxZoom={4}
          
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 11 / globalScale;
            const nodeX = node.x ?? 0;
            const nodeY = node.y ?? 0;
            const radius = node.val / 2;
            const nodeIdNum = parseInt(String(node.id).replace(/\D/g, "") || "0", 10);

            ctx.font = `${fontSize}px monospace`;

            if (node.type === "source") {
              ctx.beginPath();
              ctx.arc(nodeX, nodeY, radius + 2, 0, 2 * Math.PI);
              ctx.fillStyle = "#ef4444";
              ctx.fill();
              ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
              ctx.lineWidth = 1 / globalScale;
              ctx.stroke();
            } else {
              const color = nodeIdNum % 2 === 0 ? "#dc2626" : "#991b1b";
              const glow = nodeIdNum % 2 === 0 ? "rgba(220, 38, 38, 0.2)" : "rgba(153, 27, 27, 0.15)";
              ctx.beginPath();
              ctx.arc(nodeX, nodeY, radius + 4, 0, 2 * Math.PI);
              ctx.fillStyle = glow;
              ctx.fill();
              ctx.beginPath();
              ctx.arc(nodeX, nodeY, radius, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            }

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = node.type === "source" ? "#fff" : "#94a3b8";
            const lines = label.split("\n");
            lines.forEach((line: string, i: number) => {
              ctx.fillText(line, nodeX, nodeY + radius + 12 + i * (fontSize + 2));
            });
          }}
          
          linkColor={() => "rgba(148, 163, 184, 0.1)"}
          linkWidth={1.5}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleColor={() => "#ef4444"}
          cooldownTicks={100}
        />

        <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 rounded-lg p-3 backdrop-blur-md">
          <div className="space-y-2 text-[10px] font-mono uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-200">Origin Point</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-800 rounded-full"></div>
              <span className="text-slate-400">Infected Domains</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}