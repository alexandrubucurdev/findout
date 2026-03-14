"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Clock, Crosshair, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
     ssr: false,
});

interface NewsNode {
     domain: string;
     data_publicarii: string;
     pacient_zero: boolean;
     sursa: string;
     link: string;
     limba: string;
}

interface GraphNode {
     id: string;
     name: string;
     type: "source" | "domain";
     val: number;
     x?: number;
     y?: number;
     link?: string;
}

interface GraphLink {
     source: string | GraphNode;
     target: string | GraphNode;
     delayHours: number;
}

interface NetworkGraphProps {
     newsNodes: NewsNode[];
     toxicityScore?: number;
}

const drawPill = (
     ctx: CanvasRenderingContext2D,
     text: string,
     x: number,
     y: number,
     color: string,
     isSource: boolean,
) => {
     const fontSize = isSource ? 13 : 10;
     ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;

     const textWidth = ctx.measureText(text).width;
     const paddingX = 10;
     const paddingY = 6;
     const height = fontSize + paddingY * 2;
     const width = textWidth + paddingX * 2;
     const radius = 6;

     ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
     ctx.beginPath();
     ctx.roundRect(x - width / 2, y - height / 2, width, height, radius);
     ctx.fill();

     ctx.strokeStyle = color;
     ctx.lineWidth = isSource ? 1.5 : 1;
     ctx.stroke();

     ctx.textAlign = "center";
     ctx.textBaseline = "middle";
     ctx.fillStyle = isSource ? "#ffffff" : "#cbd5e1";
     ctx.fillText(text, x, y);
};

export default function NetworkGraph({
     newsNodes,
     toxicityScore,
}: NetworkGraphProps) {
     const containerRef = useRef<HTMLDivElement>(null);
     const fgRef = useRef<any>(null);
     const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
     const [isMounted, setIsMounted] = useState(false);
     const [hoverNode, setHoverNode] = useState<string | null>(null);

     const isThreat = (toxicityScore ?? 0) >= 50;
     const hasNodes = newsNodes && newsNodes.length > 0;
     const isIsolated = newsNodes && newsNodes.length === 1;

     const buildGraphData = useCallback(() => {
          if (!hasNodes) return { nodes: [], links: [] };

          const pacientZero =
               newsNodes.find((n) => n.pacient_zero) || newsNodes[0];
          const restNodes = newsNodes.filter((n) => n !== pacientZero);
          const sourceName = `${pacientZero.sursa || pacientZero.domain}`;

          const nodes: GraphNode[] = [
               {
                    id: "source",
                    name: sourceName,
                    type: "source",
                    val: 10,
                    link: pacientZero?.link,
               },
               ...restNodes.map((n, i) => ({
                    id: `domain${i}`,
                    name: n.sursa || n.domain,
                    type: "domain" as const,
                    val: 4,
                    link: n.link,
               })),
          ];

          // Înlocuiește delayHours cu date reale dacă le ai în API
          const links: GraphLink[] = restNodes.map((_, i) => ({
               source: "source",
               target: `domain${i}`,
               delayHours: Math.floor(Math.random() * 48) + 1,
          }));

          return { nodes, links };
     }, [newsNodes, hasNodes]);

     const [graphData, setGraphData] = useState({ nodes: [], links: [] });

     const theme = {
          source: isThreat ? "#ef4444" : "#06b6d4",
          domain: isThreat ? "#f87171" : "#38bdf8",
          link: isThreat ? "rgba(239, 68, 68, 0.4)" : "rgba(6, 182, 212, 0.4)",
          dimmed: "rgba(51, 65, 85, 0.2)",
     };

     useEffect(() => {
          setIsMounted(true);
          setGraphData(buildGraphData() as any);

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
     }, [buildGraphData]);

     if (!isMounted) return null;

     return (
          <div className="h-full w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden flex flex-col relative shadow-lg">
               {/* UI Overlay - Informații de status */}
               <div className="absolute top-0 left-0 w-full z-10 p-3 sm:p-4 pointer-events-none flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/60 backdrop-blur-md w-fit p-2 rounded-lg border border-slate-700/50 shadow-lg">
                              <div
                                   className={`p-1.5 sm:p-2 rounded-lg ${isThreat ? "bg-red-500/10" : "bg-cyan-500/10"}`}
                              >
                                   <Crosshair
                                        className={`w-4 h-4 sm:w-5 sm:h-5 ${isThreat ? "text-red-500" : "text-cyan-400"}`}
                                   />
                              </div>
                              <div className="pr-2">
                                   <h3 className="font-mono tracking-widest text-[10px] sm:text-xs font-bold uppercase text-slate-200">
                                        {isThreat
                                             ? "Propagation Vector"
                                             : "Network Diffusion"}
                                   </h3>
                                   <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                        <div
                                             className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${isThreat ? "bg-red-500" : "bg-cyan-500"}`}
                                        />
                                        <p className="text-[8px] sm:text-[9px] text-slate-400 font-mono tracking-wider uppercase">
                                             Active Monitoring
                                        </p>
                                   </div>
                              </div>
                         </div>

                         {/* Badge special pentru cazul cu 1 singur nod */}
                         {isIsolated && (
                              <motion.div
                                   initial={{ opacity: 0, x: -10 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md w-fit px-3 py-1.5 rounded-lg border border-green-500/30"
                              >
                                   <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                                   <span className="text-[9px] sm:text-[10px] font-mono text-green-400 uppercase tracking-wider font-bold">
                                        Isolated Threat (No propagation)
                                   </span>
                              </motion.div>
                         )}
                    </div>
               </div>

               {/* Cazul în care nu avem date deloc */}
               {!hasNodes ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full min-h-[350px]">
                         <ShieldAlert className="w-12 h-12 mb-3 opacity-20" />
                         <p className="font-mono text-sm uppercase tracking-widest">
                              No Network Data Available
                         </p>
                    </div>
               ) : (
                    /* Renderizare Graf */
                    <div
                         ref={containerRef}
                         className="flex-1 w-full h-full cursor-crosshair min-h-[350px]"
                    >
                         <ForceGraph2D
                              ref={
                                   ((r: any) => {
                                        fgRef.current = r;
                                        if (r && !(r as any).forcesConfigured) {
                                             // Ajustare forțe pentru a dispersa mai bine nodurile
                                             r.d3Force("charge")?.strength(
                                                  -1500,
                                             );
                                             r.d3Force("link")?.distance(
                                                  dimensions.width < 600
                                                       ? 80
                                                       : 120,
                                             );
                                             (r as any).forcesConfigured = true;
                                        }
                                   }) as any
                              }
                              graphData={graphData}
                              width={dimensions.width}
                              height={dimensions.height}
                              backgroundColor="rgba(0,0,0,0)"
                              enableZoomInteraction={true} // Permitem zoom manual mereu
                              enablePanInteraction={true}
                              dagMode={isIsolated ? undefined : "radialout"}
                              dagLevelDistance={
                                   dimensions.width < 600 ? 140 : 250
                              }
                              warmupTicks={150}
                              cooldownTicks={0}
                              onEngineStop={() => {
                                   if (fgRef.current) {
                                        if (isIsolated) {
                                             // Dacă avem doar 1 nod, zoomToFit tinde să facă un zoom-in extrem
                                             // Așa că îl centrăm și îi dăm un zoom fix, confortabil (ex: 1.5)
                                             fgRef.current.centerAt(0, 0, 800);
                                             fgRef.current.zoom(1.5, 800);
                                        } else {
                                             // Dacă avem mai multe noduri, lăsăm algoritmul să încadreze tot graful
                                             fgRef.current.zoomToFit(800, 60);
                                        }
                                   }
                              }}
                              linkCanvasObject={(link: any, ctx) => {
                                   const start = link.source;
                                   const end = link.target;
                                   const isDimmed =
                                        hoverNode &&
                                        start.id !== hoverNode &&
                                        end.id !== hoverNode;

                                   ctx.beginPath();
                                   ctx.moveTo(start.x, start.y);
                                   ctx.lineTo(end.x, end.y);
                                   ctx.strokeStyle = isDimmed
                                        ? theme.dimmed
                                        : theme.link;
                                   ctx.lineWidth = isDimmed ? 1 : 2;
                                   ctx.stroke();

                                   if (!isDimmed) {
                                        const midX =
                                             start.x + (end.x - start.x) / 2;
                                        const midY =
                                             start.y + (end.y - start.y) / 2;
                                        const timeText = `+${link.delayHours}h`;

                                        drawPill(
                                             ctx,
                                             timeText,
                                             midX,
                                             midY,
                                             theme.link,
                                             false,
                                        );
                                   }
                              }}
                              linkDirectionalParticles={
                                   hoverNode
                                        ? (link: any) =>
                                               link.source.id === hoverNode ||
                                               link.target.id === hoverNode
                                                    ? 4
                                                    : 0
                                        : 3
                              }
                              linkDirectionalParticleWidth={
                                   dimensions.width < 600 ? 3 : 4
                              }
                              linkDirectionalParticleSpeed={0.005}
                              linkDirectionalParticleColor={() => theme.domain}
                              nodeCanvasObject={(node: any, ctx) => {
                                   const nodeX = node.x ?? 0;
                                   const nodeY = node.y ?? 0;
                                   const isSource = node.type === "source";

                                   const scale =
                                        dimensions.width < 600 ? 0.8 : 1;
                                   const radius = (isSource ? 16 : 10) * scale;

                                   const isHovered = node.id === hoverNode;
                                   const isDimmed =
                                        hoverNode &&
                                        !isHovered &&
                                        !(hoverNode !== "source" && isSource);

                                   const baseColor = isSource
                                        ? theme.source
                                        : theme.domain;
                                   const renderColor = isDimmed
                                        ? "#334155"
                                        : baseColor;

                                   // Glow Effect
                                   if ((isSource || isHovered) && !isDimmed) {
                                        ctx.beginPath();
                                        ctx.arc(
                                             nodeX,
                                             nodeY,
                                             radius * 2.5,
                                             0,
                                             2 * Math.PI,
                                        );
                                        ctx.fillStyle = isThreat
                                             ? "rgba(239, 68, 68, 0.15)"
                                             : "rgba(6, 182, 212, 0.15)";
                                        ctx.fill();

                                        ctx.beginPath();
                                        ctx.arc(
                                             nodeX,
                                             nodeY,
                                             radius * 1.5,
                                             0,
                                             2 * Math.PI,
                                        );
                                        ctx.fillStyle = isThreat
                                             ? "rgba(239, 68, 68, 0.25)"
                                             : "rgba(6, 182, 212, 0.25)";
                                        ctx.fill();
                                   }

                                   // Main Node
                                   ctx.beginPath();
                                   ctx.arc(
                                        nodeX,
                                        nodeY,
                                        radius,
                                        0,
                                        2 * Math.PI,
                                   );
                                   ctx.fillStyle = renderColor;
                                   ctx.fill();

                                   if (isSource) {
                                        ctx.strokeStyle = "#ffffff";
                                        ctx.lineWidth = 3 * scale;
                                        ctx.stroke();
                                   }

                                   // Node Label
                                   if (!isDimmed) {
                                        const labelYOffset =
                                             nodeY + radius + 18 * scale;
                                        drawPill(
                                             ctx,
                                             node.name,
                                             nodeX,
                                             labelYOffset,
                                             renderColor,
                                             isSource,
                                        );
                                   }
                              }}
                              onNodeHover={(node: any) => {
                                   if (containerRef.current) {
                                        containerRef.current.style.cursor =
                                             node && node.link
                                                  ? "pointer"
                                                  : "crosshair";
                                   }
                                   setHoverNode(node ? node.id : null);
                              }}
                              onNodeClick={(node: any) => {
                                   if (node.link && node.link !== "#") {
                                        window.open(
                                             node.link,
                                             "_blank",
                                             "noopener,noreferrer",
                                        );
                                   }
                              }}
                         />
                    </div>
               )}

               {/* Legenda */}
               {hasNodes && (
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:right-4 sm:left-auto z-10 pointer-events-none flex justify-center sm:justify-end">
                         <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg p-2.5 sm:p-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-5 shadow-xl max-w-full">
                              <div className="flex items-center gap-1.5">
                                   <div
                                        className={`w-3 h-3 rounded-full ${theme.source}`}
                                        style={{
                                             backgroundColor: theme.source,
                                        }}
                                   />
                                   <span className="text-[10px] sm:text-xs text-slate-200 font-mono uppercase tracking-wider">
                                        Source
                                   </span>
                              </div>

                              {!isIsolated && (
                                   <>
                                        <div className="flex items-center gap-1.5">
                                             <div
                                                  className={`w-3 h-3 rounded-full ${theme.domain}`}
                                                  style={{
                                                       backgroundColor:
                                                            theme.domain,
                                                  }}
                                             />
                                             <span className="text-[10px] sm:text-xs text-slate-200 font-mono uppercase tracking-wider">
                                                  Distributions
                                             </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:ml-2">
                                             <Clock className="w-3.5 h-3.5 text-slate-400" />
                                             <span className="text-[10px] sm:text-xs text-slate-300 font-mono uppercase tracking-wider">
                                                  Propagation Time
                                             </span>
                                        </div>
                                   </>
                              )}
                         </div>
                    </div>
               )}
          </div>
     );
}
