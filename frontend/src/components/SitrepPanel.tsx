import {
     FileText,
     AlertCircle,
     ShieldAlert,
     CheckCircle,
     Activity,
     Globe,
} from "lucide-react";

interface SitrepPanelProps {
     techniquesText?: string;
     emotions?: string[];
     veridicitate?: string;
     explicatieConsens?: string;
     aiSummary?: string;
     factChecks?: any[];
}

export default function SitrepPanel({
     techniquesText,
     emotions,
     veridicitate,
     explicatieConsens,
     aiSummary,
     factChecks,
}: SitrepPanelProps) {
     const getVeracityColor = (status?: string) => {
          if (!status) return "bg-slate-900 border-slate-700 text-slate-400";
          const s = status.toLowerCase();
          if (s.includes("fals") || s.includes("demontat"))
               return "bg-red-950 border-red-700 text-red-400";
          if (
               s.includes("parțial") ||
               s.includes("suspect") ||
               s.includes("neconfirmat")
          )
               return "bg-orange-950 border-orange-700 text-orange-400";
          if (s.includes("confirmat") || s.includes("adevărat"))
               return "bg-green-950 border-green-700 text-green-400";
          return "bg-slate-900 border-slate-700 text-slate-400";
     };

     const getTheme = (status?: string) => {
          const s = status?.toLowerCase() || "";

          if (s.includes("fals") || s.includes("demontat")) {
               return {
                    main: "from-red-950 to-slate-900 border-red-800",
                    header: "bg-red-950 border-b-red-800",
               };
          }
          if (
               s.includes("parțial") ||
               s.includes("suspect") ||
               s.includes("neconfirmat")
          ) {
               return {
                    main: "from-orange-950 to-slate-900 border-orange-800",
                    header: "bg-orange-950 border-b-orange-800",
               };
          }
          if (s.includes("confirmat") || s.includes("adevărat")) {
               return {
                    main: "from-green-950 to-slate-900 border-green-800",
                    header: "bg-green-950 border-b-green-800",
               };
          }
          // Default
          return {
               main: "from-slate-900 to-slate-800 border-slate-700",
               header: "bg-slate-950 border-b-slate-700",
          };
     };

     const theme = getTheme(veridicitate);

     return (
          <div
               className={`h-full w-full bg-gradient-to-br ${theme.main} border rounded-lg overflow-hidden flex flex-col shadow-lg`}
          >
               {/* Header */}
               <div
                    className={`${theme.header} border-b px-4 sm:px-5 py-3 sm:py-4 flex-shrink-0`}
               >
                    <div className="flex items-center gap-2 sm:gap-3">
                         <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                         <h3 className="font-mono tracking-wider text-base sm:text-lg truncate">
                              PATTERN DETECTION
                         </h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-mono mt-1 ml-6 sm:ml-8">
                         SITUATION REPORT
                    </p>
               </div>

               {/* Content */}
               <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5">
                    {/* Veracity Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 sm:gap-0">
                         <div className="flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
                              <span className="font-mono text-xs sm:text-sm text-slate-300 uppercase">
                                   Global Verdict:
                              </span>
                         </div>
                         <div
                              className={`px-3 py-1.5 border rounded text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-center ${getVeracityColor(veridicitate)}`}
                         >
                              {veridicitate || "UNKNOWN"}
                         </div>
                    </div>

                    {/* Global Consensus & Summary */}
                    <div className="space-y-3 pb-4 border-b border-slate-800">
                         <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 sm:p-4">
                              <div className="flex items-center gap-2 mb-2">
                                   <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500 flex-shrink-0" />
                                   <h4 className="font-mono text-xs sm:text-sm text-slate-300 uppercase">
                                        Media Consensus:
                                   </h4>
                              </div>
                              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mb-3">
                                   {explicatieConsens || "Awaiting data..."}
                              </p>

                              <div className="flex items-center gap-2 mb-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-800/50">
                                   <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                                   <h4 className="font-mono text-xs sm:text-sm text-slate-300 uppercase">
                                        Sitrep (Spread):
                                   </h4>
                              </div>
                              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                                   {aiSummary || "Awaiting data..."}
                              </p>
                         </div>
                    </div>

                    {/* Fact Checks */}
                    {factChecks && factChecks.length > 0 && (
                         <div className="pb-4 border-b border-slate-800">
                              <h4 className="font-mono text-xs sm:text-sm text-slate-300 mb-3 flex items-center gap-2 uppercase">
                                   <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />{" "}
                                   Official Fact Checks:
                              </h4>
                              <div className="space-y-2 sm:space-y-3">
                                   {factChecks.map((fc, idx) => (
                                        <div
                                             key={idx}
                                             className="bg-slate-900/80 border border-slate-700 rounded-lg p-3"
                                        >
                                             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                                                  <span className="text-[11px] sm:text-xs font-mono text-slate-300 font-bold">
                                                       {fc.organizatie}
                                                  </span>
                                                  <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 bg-slate-800 rounded text-slate-400 self-start sm:self-auto">
                                                       {fc.verdict}
                                                  </span>
                                             </div>
                                             <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-3 sm:line-clamp-2 mb-2">
                                                  {fc.titlu_fals}
                                             </p>
                                             {fc.link_raport && (
                                                  <a
                                                       href={fc.link_raport}
                                                       target="_blank"
                                                       rel="noopener noreferrer"
                                                       className="text-[10px] sm:text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline transition-colors inline-flex items-center gap-1 mt-1"
                                                  >
                                                       View full report &rarr;
                                                  </a>
                                             )}
                                        </div>
                                   ))}
                              </div>
                         </div>
                    )}

                    {/* Emotions Tags */}
                    <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 pb-4 border-b border-slate-800">
                         <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
                         <div className="w-full">
                              <h4 className="font-mono text-xs sm:text-sm text-slate-300 mb-2 uppercase">
                                   Cognitive Manipulation Patterns:
                              </h4>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                   {(emotions || ["Analysis in progress"]).map(
                                        (emo, idx) => (
                                             <span
                                                  key={idx}
                                                  className="px-2 py-1 bg-red-950/40 border border-red-700/50 text-red-400 rounded text-[10px] sm:text-xs font-mono"
                                             >
                                                  {emo}
                                             </span>
                                        ),
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Technique Tags */}
                    <div className="pt-1">
                         <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 sm:p-4 hover:border-red-900/50 transition-colors">
                              <h4 className="font-mono text-xs sm:text-sm text-slate-300 mb-2 uppercase">
                                   Techniques Summary:
                              </h4>
                              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                                   {techniquesText ||
                                        "No detailed manipulation techniques identified or awaiting data."}
                              </p>
                         </div>
                    </div>
               </div>
          </div>
     );
}
