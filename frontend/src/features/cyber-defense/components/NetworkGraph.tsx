"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Clock, Crosshair } from "lucide-react";

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
     // Scalăm fontul pe baza device-ului aproximativ, deși canvas-ul nu "știe" tailwind.
     // Pentru a păstra lizibilitatea lăsăm o mărime vizibilă:
     const fontSize = isSource ? 14 : 11;
     ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;

     const textWidth = ctx.measureText(text).width;
     const paddingX = 10;
     const paddingY = 6;
     const height = fontSize + paddingY * 2;
     const width = textWidth + paddingX * 2;
     const radius = 6;

     ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
     ctx.beginPath();
     ctx.roundRect(x - width / 2, y - height / 2, width, height, radius);
     ctx.fill();

     ctx.strokeStyle = color;
     ctx.lineWidth = 1.5;
     ctx.stroke();

     ctx.textAlign = "center";
     ctx.textBaseline = "middle";
     ctx.fillStyle = isSource ? "#ffffff" : "#f1f5f9";
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

     const buildGraphData = useCallback(() => {
          if (!newsNodes || newsNodes.length === 0)
               return { nodes: [], links: [] };

          const pacientZero =
               newsNodes.find((n) => n.pacient_zero) || newsNodes[0];
          const restNodes = newsNodes.filter((n) => !n.pacient_zero);
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

          const links: GraphLink[] = restNodes.map((_, i) => ({
               source: "source",
               target: `domain${i}`,
               delayHours: Math.floor(Math.random() * 48) + 1,
          }));

          return { nodes, links };
     }, [newsNodes]);

     const [graphData, setGraphData] = useState({ nodes: [], links: [] });
     const isThreat = (toxicityScore ?? 0) >= 50;

     const theme = {
          source: isThreat ? "#ef4444" : "#06b6d4",
          domain: isThreat ? "#f87171" : "#38bdf8",
          link: isThreat ? "rgba(239, 68, 68, 0.6)" : "rgba(6, 182, 212, 0.6)",
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
               {/* UI Overlay */}
               <div className="absolute top-0 left-0 w-full z-10 p-3 sm:p-4 pointer-events-none">
                    <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/40 backdrop-blur-sm w-fit p-2 rounded-lg border border-slate-800/50">
                         <div
                              className={`p-1.5 sm:p-2 rounded-lg ${isThreat ? "bg-red-500/10" : "bg-cyan-500/10"}`}
                         >
                              <Crosshair
                                   className={`w-4 h-4 sm:w-5 sm:h-5 ${isThreat ? "text-red-500" : "text-cyan-400"}`}
                              />
                         </div>
                         <div>
                              <h3 className="font-mono tracking-widest text-[10px] sm:text-xs font-bold uppercase text-slate-200">
                                   {isThreat
                                        ? "Vector Propagare"
                                        : "Difuzie Rețea"}
                              </h3>
                              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                   <div
                                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${isThreat ? "bg-red-500" : "bg-cyan-500"}`}
                                   />
                                   <p className="text-[8px] sm:text-[9px] text-slate-400 font-mono tracking-wider uppercase">
                                        Monitorizare activă
                                   </p>
                              </div>
                         </div>
                    </div>
               </div>

               <div
                    ref={containerRef}
                    className="flex-1 w-full h-full cursor-crosshair min-h-[350px]"
               >
                    <ForceGraph2D
                         ref={
                              ((r: any) => {
                                   fgRef.current = r;
                                   if (r && !(r as any).forcesConfigured) {
                                        r.d3Force("charge")?.strength(-1200);
                                        (r as any).forcesConfigured = true;
                                   }
                              }) as any
                         }
                         graphData={graphData}
                         width={dimensions.width}
                         height={dimensions.height}
                         backgroundColor="rgba(0,0,0,0)"
                         enableZoomInteraction={false}
                         enablePanInteraction={false}
                         dagMode="radialout"
                         dagLevelDistance={dimensions.width < 600 ? 180 : 300}
                         warmupTicks={150}
                         cooldownTicks={0}
                         onEngineStop={() => {
                              if (fgRef.current) {
                                   fgRef.current.zoomToFit(1200, 40);
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
                                   const midX = start.x + (end.x - start.x) / 2;
                                   const midY = start.y + (end.y - start.y) / 2;
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
                         linkDirectionalParticleColor={() =>
                              isThreat ? "#f87171" : "#38bdf8"
                         }
                         nodeCanvasObject={(node: any, ctx) => {
                              const nodeX = node.x ?? 0;
                              const nodeY = node.y ?? 0;
                              const isSource = node.type === "source";

                              // Noduri un pic mai mici pe telefoane
                              const scale = dimensions.width < 600 ? 0.75 : 1;
                              const radius = (isSource ? 14 : 8) * scale;

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
                                        ? "rgba(239, 68, 68, 0.25)"
                                        : "rgba(6, 182, 212, 0.25)";
                                   ctx.fill();
                              }

                              ctx.beginPath();
                              ctx.arc(nodeX, nodeY, radius, 0, 2 * Math.PI);
                              ctx.fillStyle = renderColor;
                              ctx.fill();

                              if (isSource) {
                                   ctx.strokeStyle = "#ffffff";
                                   ctx.lineWidth = 2.5 * scale;
                                   ctx.stroke();
                              }

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

               {/* Legenda adaptată pe mai multe rânduri la ecrane înguste */}
               <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:right-4 sm:left-auto z-10 pointer-events-none flex justify-center sm:justify-end">
                    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-2 sm:p-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 shadow-xl max-w-full">
                         <div className="flex items-center gap-1.5 sm:gap-2">
                              <div
                                   className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isThreat ? "bg-red-500" : "bg-cyan-500"}`}
                              />
                              <span className="text-[9px] sm:text-[10px] text-slate-200 font-mono uppercase tracking-wider">
                                   Sursă
                              </span>
                         </div>
                         <div className="flex items-center gap-1.5 sm:gap-2">
                              <div
                                   className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isThreat ? "bg-red-400" : "bg-sky-400"}`}
                              />
                              <span className="text-[9px] sm:text-[10px] text-slate-200 font-mono uppercase tracking-wider">
                                   Preluări
                              </span>
                         </div>
                         <div className="flex items-center gap-1.5 sm:gap-2 sm:ml-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                              <span className="text-[9px] sm:text-[10px] text-slate-300 font-mono uppercase tracking-wider">
                                   Timp propagare
                              </span>
                         </div>
                    </div>
               </div>
          </div>
     );
}
